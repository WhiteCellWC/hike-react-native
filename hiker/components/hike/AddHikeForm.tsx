import React, { useState, FC } from "react";
import {
  View,
  Text,
  StyleSheet,
  Alert,
  Image,
  TouchableOpacity,
  ScrollView,
} from "react-native";
import FloatingInput from "../common/FloatingInput";
import DropDownPicker, { ValueType } from "react-native-dropdown-picker";
import * as ImagePicker from "expo-image-picker";
import Checkbox from "expo-checkbox";
import { Link, router, useRouter } from "expo-router";
import { Hike } from "@/types/types";
import { HikeService } from "@/services/HikeService";
import DateTimePickerModal from "react-native-modal-datetime-picker";
import { Directory, File, Paths } from "expo-file-system";

const AddHike: FC = () => {
  // Explicitly type the state as string
  const [name, setName] = useState<string>("");
  const [location, setLocation] = useState<string>("");

  const [isDatePickerVisible, setDatePickerVisible] = useState(false);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [date, setDate] = useState(""); // this will store formatted string
  const [lengthValue, setLengthValue] = useState("");
  const [lengthUnit, setLengthUnit] = useState("km");
  const [description, setDescription] = useState<string>("");
  const [difficulty, setDifficulty] = useState<string>("");
  const [difficultyDropdownOpen, setDifficultyDropdownOpen] = useState(false);
  const [parking, setParking] = useState(false);
  const router = useRouter();

  // Image Upload

  const [imageUri, setImageUri] = useState<string>("");
  const [uploading, setUploading] = useState(false);
  // Image picker options
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

  // --- STATE DEFINITIONS ---
  const initialUnit = "km";

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

  // State for DropDownPicker visibility (internal)
  const [unitDropdownOpen, setUnitDropdownOpen] = useState(false);

  const handleAddHike = async () => {
    console.log("🟦 handleAddHike() triggered");

    // ✅ Log raw inputs
    console.log("Input values:", {
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

    if (
      !name.trim() ||
      !location.trim() ||
      !date.trim() ||
      !lengthValue.trim() ||
      !lengthUnit.trim() ||
      !difficulty.trim()
    ) {
      console.warn("⚠️ Missing required fields");
      Alert.alert("Missing Fields", "Please fill in all the fields.");
      return;
    }

    try {
      // 🗓️ Parse date
      console.log("📅 Parsing date:", date);
      const [year, month, day] = date.split("-").map(Number);
      const formattedDate = new Date(year, month - 1, day).getTime();
      console.log("✅ Parsed formattedDate:", formattedDate);

      // 📏 Parse length
      const parsedLength = Number(lengthValue);
      if (isNaN(parsedLength)) {
        console.error("❌ Invalid length input:", lengthValue);
        Alert.alert("Invalid Length", "Length must be numeric.");
        return;
      }

      // 🖼️ Handle image file saving
      let finalImageUri = imageUri;
      if (imageUri) {
        try {
          const fileName = imageUri.split("/").pop()!;

          // Create (or confirm) the app storage directory
          const destinationDir = new Directory(Paths.document, "images");
          await destinationDir.create({
            intermediates: true,
            idempotent: true,
          });

          // Create source and destination file objects
          const sourceFile = new File(imageUri);
          const destinationFile = new File(destinationDir, fileName);

          // Copy the file into the app's storage
          await sourceFile.copy(destinationFile);

          // Save the new file path
          finalImageUri = destinationFile.uri;

          console.log("📦 Image saved at:", finalImageUri);
        } catch (error) {
          console.error("❌ Image upload failed:", error);
          Alert.alert("Upload Error", "Failed to save image locally.");
        }
      } else {
        console.log("⚠️ No image selected, skipping file copy");
      }

      // 🧾 Prepare data for DB
      const hikeData: Omit<Hike, "id"> = {
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

      console.log("🧾 Final Hike Data ready to insert:", hikeData);

      // 💾 Save to database
      await HikeService.add(hikeData);
      console.log("✅ Hike successfully added to database/cache");

      // ✅ Navigate back only after success
      Alert.alert("Success", "Hike added successfully!", [
        {
          text: "OK",
          onPress: () => {
            console.log("🔙 Navigating back");
            router.back();
          },
        },
      ]);
    } catch (error) {
      console.error("💥 Add hike failed:", error);
      Alert.alert("Error", "Failed to add hike. Please try again.");
    }
  };

  const handleDateConfirm = (pickedDate: Date) => {
    setSelectedDate(pickedDate);
    const formatted = pickedDate.toISOString().split("T")[0]; // e.g. "2025-10-29"
    setDate(formatted);
    setDatePickerVisible(false);
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
          AddHike
        </Text>

        <View className="mb-5">
          {/* Input 1: Name */}
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
        {/* 🚗 Parking Checkbox */}
        <View className="flex-row items-center mb-8 ms-2">
          <Checkbox
            style={{ marginRight: 10 }}
            value={parking}
            onValueChange={setParking}
            color={parking ? "#3b82f6" : undefined}
          />
          <Text className="text-gray-700 text-base">Parking Available</Text>
        </View>
        <View className=" mt-6">
          {/* ➕ Add Button */}
          <TouchableOpacity
            className="flex-1 mb-5 rounded-xl bg-primary py-4"
            activeOpacity={0.7}
            onPress={handleAddHike}
          >
            <Text className="text-center text-white font-semibold text-lg">
              Add
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
        <View style={{ height: 20 }} />
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

export default AddHike;
