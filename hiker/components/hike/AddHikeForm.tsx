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
import { Link } from "expo-router";

const AddHike: FC = () => {
  // Explicitly type the state as string
  const [name, setName] = useState<string>("");
  const [location, setLocation] = useState<string>("");
  const [date, setDate] = useState<string>("");
  const [lengthValue, setLengthValue] = useState("");
  const [lengthUnit, setLengthUnit] = useState("km");
  const [description, setDescription] = useState<string>("");
  const [difficulty, setDifficulty] = useState<string | null>(null);
  const [difficultyDropdownOpen, setDifficultyDropdownOpen] = useState(false);
  const [parking, setParking] = useState(false);

  // Image Upload

  const [imageUri, setImageUri] = useState<string | null>(null);
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
          {/* Input 3: Date (Example using a prop from TextInputProps) */}
          <FloatingInput
            label="Enter Date"
            value={date}
            onChangeText={setDate}
            keyboardType="numeric" // This prop is automatically available via `TextInputProps`
            className=""
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
            keyboardType="numeric" // This prop is automatically available via `TextInputProps`
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
          {/* 🔙 Back Button */}
          <Link href=".." asChild>
            <TouchableOpacity
              className="flex-1 mb-5 rounded-xl border border-gray-400 py-4"
              activeOpacity={0.7}
            >
              <Text className="text-center text-gray-700 font-semibold text-lg">
                Back
              </Text>
            </TouchableOpacity>
          </Link>

          {/* ➕ Add Button */}
          <Link href=".." asChild>
            <TouchableOpacity
              className="flex-1 rounded-xl bg-primary py-4"
              activeOpacity={0.7}
            >
              <Text className="text-center text-white font-semibold text-lg">
                Add
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
