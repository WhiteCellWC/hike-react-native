import { HikeService } from "@/services/HikeService";
import { Hike } from "@/types/types";
import Checkbox from "expo-checkbox";
import { Link, useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import * as ImagePicker from "expo-image-picker";
import {
  Alert,
  ScrollView,
  Text,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  View,
  Image,
} from "react-native";
import DropDownPicker from "react-native-dropdown-picker";
import DateTimePickerModal from "react-native-modal-datetime-picker";
import FloatingInput from "../common/FloatingInput";
import { Directory, File, Paths } from "expo-file-system";

interface EditHikeFormProps {
  hikeId: string;
}

const EditHikeForm: React.FC<EditHikeFormProps> = ({ hikeId }) => {
  const router = useRouter();

  // Form state
  const [name, setName] = useState("");
  const [location, setLocation] = useState("");
  const [date, setDate] = useState("");
  const [lengthValue, setLengthValue] = useState("");
  const [lengthUnit, setLengthUnit] = useState("km");
  const [difficulty, setDifficulty] = useState("Medium");
  const [description, setDescription] = useState("");
  const [parking, setParking] = useState(false);
  const [imageUri, setImageUri] = useState<string | null>(null);
  const [selectedDate, setSelectedDate] = useState(new Date());

  // Dropdown state
  const [unitDropdownOpen, setUnitDropdownOpen] = useState(false);
  const [difficultyDropdownOpen, setDifficultyDropdownOpen] = useState(false);
  const [isDatePickerVisible, setDatePickerVisible] = useState(false);

  const unitOptions = [
    { label: "Kilometers (km)", value: "km" },
    { label: "Miles (mi)", value: "mi" },
    { label: "Meters (m)", value: "m" },
  ];

  const difficultyOptions = [
    { label: "Easy", value: "easy" },
    { label: "Normal", value: "normal" },
    { label: "Hard", value: "hard" },
    { label: "Extreme", value: "extreme" },
  ];

  // Fetch existing hike data if editing
  useEffect(() => {
    if (!hikeId) return;

    const loadHike = async () => {
      try {
        const hike = await HikeService.getById(Number(hikeId));
        if (!hike) {
          Alert.alert("Error", "Hike not found");
          return;
        }

        const parsedDate = parseTimestamp(hike.date);
        setName(hike.name);
        setLocation(hike.location);
        setDate(
          new Date(hike.date).toLocaleDateString("en-US", {
            year: "numeric",
            month: "short",
            day: "numeric",
          })
        ); // yyyy-mm-dd
        setLengthValue(String(hike.length_value));
        setLengthUnit(hike.length_unit);
        setDifficulty(hike.difficulty);
        setDescription(hike.description);
        setParking(hike.parking);
        setImageUri(hike.image);
        setSelectedDate(parsedDate);
      } catch (err) {
        console.error("Failed to load hike:", err);
        Alert.alert("Error", "Could not load hike data");
      }
    };

    loadHike();
  }, [hikeId]);

  const handleSave = async () => {
    console.log("🟦 handleSave() triggered");

    // ✅ Log current state values
    console.log("Input values:", {
      hikeId,
      name,
      location,
      date,
      lengthValue,
      lengthUnit,
      difficulty,
      imageUri,
      description,
      parking,
    });

    // ⚠️ Validation
    if (
      !name.trim() ||
      !location.trim() ||
      !date.trim() ||
      !lengthValue.trim() ||
      !lengthUnit.trim() ||
      !difficulty.trim()
    ) {
      console.warn("⚠️ Missing required fields");
      Alert.alert("Missing Fields", "Please fill in all required fields.");
      return;
    }

    try {
      // 🗓️ Parse date
      console.log("📅 Parsing date:", date);

      const parseReadableDate = (input: string): Date | null => {
        // Match patterns like "Nov 3, 2025"
        const match = input.match(/^([A-Za-z]+)\s+(\d{1,2}),\s*(\d{4})$/);
        if (!match) return null;

        const [, monthStr, dayStr, yearStr] = match;
        const months = {
          Jan: 0,
          Feb: 1,
          Mar: 2,
          Apr: 3,
          May: 4,
          Jun: 5,
          Jul: 6,
          Aug: 7,
          Sep: 8,
          Oct: 9,
          Nov: 10,
          Dec: 11,
        };

        const month = months[monthStr.substring(0, 3) as keyof typeof months];
        const day = Number(dayStr);
        const year = Number(yearStr);

        if (month === undefined || isNaN(day) || isNaN(year)) return null;
        return new Date(year, month, day);
      };

      const parsedDate = parseReadableDate(date);

      if (!parsedDate || isNaN(parsedDate.getTime())) {
        console.error("❌ Invalid date string:", date);
        Alert.alert("Invalid Date", `Could not parse date: ${date}`);
        return;
      }

      const formattedDate = parsedDate.getTime();
      console.log(
        "✅ Parsed formattedDate:",
        formattedDate,
        "| ISO:",
        parsedDate.toISOString()
      );

      // 📏 Parse length
      const parsedLength = Number(lengthValue);
      if (isNaN(parsedLength)) {
        console.error("❌ Invalid length input:", lengthValue);
        Alert.alert("Invalid Length", "Length must be numeric.");
        return;
      }

      // 🖼️ Handle image update
      let finalImageUri = imageUri;
      const existingHike = await HikeService.getById(Number(hikeId));

      if (!existingHike) {
        Alert.alert("Error", "Hike not found.");
        console.error("❌ Hike not found with ID:", hikeId);
        return;
      }

      // If new image differs from existing one, replace it
      if (imageUri && imageUri !== existingHike.image) {
        try {
          // 🧹 Remove old image file
          if (existingHike.image) {
            const oldFile = new File(existingHike.image);
            const exists = await oldFile.exists;
            if (exists) {
              await oldFile.delete();
              console.log("🗑️ Old image removed:", existingHike.image);
            } else {
              console.log("⚠️ Old image not found, skipping delete");
            }
          }

          // 💾 Save new image into local directory
          const fileName = imageUri.split("/").pop()!;
          const destinationDir = new Directory(Paths.document, "images");

          await destinationDir.create({
            intermediates: true,
            idempotent: true,
          });

          const sourceFile = new File(imageUri);
          const destinationFile = new File(destinationDir, fileName);

          await sourceFile.copy(destinationFile);
          finalImageUri = destinationFile.uri;

          console.log("📦 New image saved at:", finalImageUri);
        } catch (error) {
          console.error("❌ Image replacement failed:", error);
          Alert.alert("Image Error", "Failed to replace image file.");
        }
      } else {
        console.log("🟡 Image unchanged, skipping replacement");
      }

      // 🧾 Prepare data for update
      const updatedHike: Hike = {
        id: Number(hikeId),
        name: name.trim(),
        image: finalImageUri || "",
        location: location.trim(),
        date: formattedDate,
        length_value: parsedLength,
        length_unit: lengthUnit,
        description: description.trim(),
        difficulty,
        parking,
      };

      console.log("  ├─ formattedDate:", formattedDate);
      // 🪵 Detailed field log
      console.log("🧾 Final Hike Data ready to update:");
      console.log("  ├─ id:", updatedHike.id);
      console.log("  ├─ name:", updatedHike.name);
      console.log("  ├─ location:", updatedHike.location);
      console.log(
        "  ├─ date (timestamp):",
        updatedHike.date,
        "|",
        new Date(updatedHike.date).toISOString()
      );
      console.log("  ├─ length_value:", updatedHike.length_value);
      console.log("  ├─ length_unit:", updatedHike.length_unit);
      console.log("  ├─ difficulty:", updatedHike.difficulty);
      console.log("  ├─ description:", updatedHike.description);
      console.log("  ├─ parking:", updatedHike.parking);
      console.log("  └─ image:", updatedHike.image);

      console.log("🧾 Final Hike Data ready to update:", updatedHike);

      // 💾 Update database record
      const success = await HikeService.update(updatedHike);

      if (success) {
        console.log("✅ Hike successfully updated");
        Alert.alert("Success", "Hike updated successfully!", [
          {
            text: "OK",
            onPress: () => {
              console.log("🔙 Navigating back");
              router.back();
            },
          },
        ]);
      } else {
        console.error("❌ Hike update failed in database layer");
        Alert.alert("Error", "Failed to update hike in the database.");
      }
    } catch (error) {
      console.error("💥 handleSave() failed:", error);
      Alert.alert("Error", "An unexpected error occurred while saving.");
    }
  };

  const handleDateConfirm = (pickedDate: Date) => {
    setSelectedDate(pickedDate);
    const formattedDate = pickedDate.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
    setDate(formattedDate);
    setDatePickerVisible(false);
  };

  const parseTimestamp = (timestamp: number | string): Date => {
    const value =
      typeof timestamp === "string" ? parseInt(timestamp, 10) : timestamp;
    const date = new Date(value);
    console.log(
      "parseTimestamp(): raw =",
      timestamp,
      "| parsed =",
      date.toISOString()
    );
    return date;
  };

  const openImageOptions = () => {
    Alert.alert(
      "Select Image",
      "Choose an option",
      [
        { text: "Choose from Gallery", onPress: pickImage },
        { text: "Take Photo", onPress: takePhoto },
        { text: "Cancel", style: "cancel" },
      ],
      { cancelable: true }
    );
  };

  // Pick image from device
  const pickImage = async () => {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) {
      Alert.alert(
        "Permission Denied",
        "You need to allow access to your gallery."
      );
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      quality: 1,
    });

    if (!result.canceled) {
      setImageUri(result.assets[0].uri);
    }
  };

  // Take new photo from camera
  const takePhoto = async () => {
    const permission = await ImagePicker.requestCameraPermissionsAsync();
    if (!permission.granted) {
      Alert.alert("Permission required", "You need to allow camera access.");
      return;
    }

    const result = await ImagePicker.launchCameraAsync({
      allowsEditing: true,
      quality: 1,
    });

    if (!result.canceled) {
      setImageUri(result.assets[0].uri);
    }
  };

  return (
    <ScrollView
      showsVerticalScrollIndicator={false}
      contentContainerStyle={{
        minHeight: "100%",
        paddingBottom: 10,
      }}
      keyboardShouldPersistTaps="handled"
    >
      <View className="py-16 mt-6 px-6 ">
        <Text className="font-bold mb-10" style={{ fontSize: 30 }}>
          Edit Hike
        </Text>

        <View className="mb-5">
          <FloatingInput
            label="Enter Name" // Type-checked: must be a string
            value={name} // Type-checked: must be a string
            onChangeText={setName} // Type-checked: must be a function accepting a string
            className=""
          />
        </View>
        <View className="mb-5">
          {/* Input 2: Location */}
          <FloatingInput
            label="Enter Location"
            value={location}
            onChangeText={setLocation}
            className=""
          />
        </View>
        <View className="mb-5">
          <TouchableOpacity
            onPress={() => setDatePickerVisible(true)}
            activeOpacity={0.8}
            style={{
              borderWidth: 1,
              borderColor: "#d1d5db", // gray-300
              borderRadius: 10,
              paddingVertical: 14,
              paddingHorizontal: 12,
              justifyContent: "center",
            }}
          >
            <Text
              style={{
                fontSize: 16,
                color: date ? "#111827" : "#9ca3af", // gray text if empty
              }}
            >
              {date ? date : "Select Date"}
            </Text>
          </TouchableOpacity>

          {/* Date Picker Modal */}
          <DateTimePickerModal
            isVisible={isDatePickerVisible}
            mode="date"
            onConfirm={handleDateConfirm}
            onCancel={() => setDatePickerVisible(false)}
            date={selectedDate}
          />
        </View>
        <View className="flex-row mb-5" style={styles.lengthInputRow}>
          {/* LENGTH VALUE INPUT (65% width) */}
          <View style={styles.lengthValueContainer}>
            <FloatingInput
              label="Enter Length"
              value={lengthValue}
              onChangeText={setLengthValue}
              keyboardType="numeric"
            />
          </View>

          {/* UNIT DROPDOWN (35% width) */}
          <View style={[styles.unitDropdownContainer, { zIndex: 2000 }]}>
            <DropDownPicker
              zIndex={2000}
              zIndexInverse={1000}
              open={unitDropdownOpen}
              value={lengthUnit}
              items={unitOptions}
              setOpen={setUnitDropdownOpen}
              setValue={setLengthUnit}
              setItems={() => {}}
              placeholder="Select Unit"
              style={styles.dropdownStyle}
              dropDownContainerStyle={styles.dropdownContainerStyle}
            />
          </View>
        </View>

        <View className="mb-5">
          {/* Input 3: Date (Example using a prop from TextInputProps) */}
          <FloatingInput
            label="Enter Description"
            value={description}
            onChangeText={setDescription}
            className=""
          />
        </View>

        <View className="mb-5" style={{ zIndex: 1500 }}>
          <DropDownPicker
            zIndex={1500}
            zIndexInverse={500}
            open={difficultyDropdownOpen}
            value={difficulty}
            items={difficultyOptions}
            setOpen={setDifficultyDropdownOpen}
            setValue={setDifficulty}
            setItems={() => {}}
            placeholder="Select Difficulty"
            style={styles.dropdownStyle}
            dropDownContainerStyle={styles.dropdownContainerStyle}
          />
        </View>

        <View className="flex-row items-center mb-8 ms-2">
          <Checkbox
            style={{ marginRight: 10 }}
            value={parking}
            onValueChange={setParking}
            color={parking ? "#3b82f6" : undefined}
          />
          <Text className="text-gray-700 text-base">Parking Available</Text>
        </View>

        {/* 🏞️ Image Picker Section */}
        <View className="items-center mb-8 w-[100%] ">
          <TouchableOpacity
            className="w-[100%]"
            onPress={openImageOptions}
            activeOpacity={0.8}
          >
            {imageUri ? (
              <Image
                source={{ uri: imageUri }}
                className="rounded-2xl"
                style={{ width: "95%", height: 200, marginBottom: 10 }}
                resizeMode="cover"
              />
            ) : (
              <View
                className="rounded-2xl bg-gray-200"
                style={{
                  width: "100%",
                  height: 200,
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <Text className="text-gray-500">Tap to Select Image</Text>
              </View>
            )}
          </TouchableOpacity>
        </View>

        <View className=" mt-6">
          {/* ➕ Add Button */}
          <TouchableOpacity
            className="flex-1 mb-5 rounded-xl bg-primary py-4"
            activeOpacity={0.7}
            onPress={handleSave}
          >
            <Text className="text-center text-white font-semibold text-lg">
              Update
            </Text>
          </TouchableOpacity>

          {/* 🔙 Back Button */}
          <Link href=".." asChild>
            <TouchableOpacity
              className="flex-1 rounded-xl border border-gray-400 py-4"
              activeOpacity={0.7}
            >
              <Text className="text-center text-gray-700 font-semibold text-lg">
                Back
              </Text>
            </TouchableOpacity>
          </Link>
        </View>
      </View>
    </ScrollView>
  );
};
const styles = StyleSheet.create({
  // Higher zIndex on the parent container to ensure the dropdown list appears over other elements
  container: {
    zIndex: 1000,
  },
  // Row container for the length input, needs a zIndex higher than other form fields but lower than the dropdown list
  lengthInputRow: {
    zIndex: 10,
    position: "relative",
    flexDirection: "row",
  },

  // View wrapping the FloatingInput for the numeric value
  lengthValueContainer: {
    flex: 0.65,
    marginRight: 8,
    width: 100,
  },
  // View wrapping the DropDownPicker
  unitDropdownContainer: {
    flex: 0.35,
    paddingTop: 0, // No extra padding needed here
  },
  dropdownStyle: {
    borderColor: "gray",
    borderRadius: 8,
    // Set height to visually match the FloatingInput
    minHeight: 60,
  },
  dropdownContainerStyle: {
    borderColor: "gray",
    borderRadius: 8,
    // Ensure the dropdown list is above the form fields below it
    zIndex: 2000,
  },
});
export default EditHikeForm;
