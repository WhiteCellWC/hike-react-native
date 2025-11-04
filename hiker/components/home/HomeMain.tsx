import React, { useRef, useState } from "react";
import {
  Animated,
  Easing,
  Text,
  TouchableOpacity,
  StyleSheet,
  View,
  ViewStyle,
  Keyboard,
  TouchableWithoutFeedback,
} from "react-native";
import HikeList from "../hike/HikeList";
import FloatingInput from "../common/FloatingInput";
import DateTimePickerModal from "react-native-modal-datetime-picker";
import DropDownPicker from "react-native-dropdown-picker";

const HomeMain = () => {
  const [searchValue, setSearchValue] = useState("");
  const [minLength, setMinLength] = useState("");
  const [maxLength, setMaxLength] = useState("");
  const [date, setDate] = useState(""); // this will store formatted string
  const [unit, setUnit] = useState("");
  const [isDatePickerVisible, setDatePickerVisible] = useState(false);
  const [selectedDate, setSelectedDate] = useState(new Date());

  // --- STATE DEFINITIONS ---
  const initialUnit = "km";

  const [filters, setFilters] = useState({
    search: "",
    minLength: "",
    maxLength: "",
    date: "",
    unit: "km",
  });

  const handleSearch = () => {
    setFilters({
      search: searchValue.trim(),
      minLength,
      maxLength,
      date,
      unit,
    });
  };

  const handleReset = () => {
    setSearchValue("");
    setMinLength("");
    setMaxLength("");
    setDate("");
    setUnit("km");
    setFilters({
      search: "",
      minLength: "",
      maxLength: "",
      date: "",
      unit: "km",
    });
  };

  // State for DropDownPicker visibility (internal)
  const [unitDropdownOpen, setUnitDropdownOpen] = useState(false);
  const unitOptions = [
    { label: "Kilometers (km)", value: "km" },
    { label: "Miles (mi)", value: "mi" },
    { label: "Meters (m)", value: "m" },
  ];

  // Animation state
  const [isExpanded, setIsExpanded] = useState(false);
  const animation = useRef(new Animated.Value(0)).current;

  const toggleFilter = () => {
    setIsExpanded((prev) => !prev);
    Animated.timing(animation, {
      toValue: isExpanded ? 0 : 1,
      duration: 300,
      easing: Easing.out(Easing.ease),
      useNativeDriver: false,
    }).start();
  };

  const animatedStyle: Animated.WithAnimatedObject<ViewStyle> = {
    height: animation.interpolate({
      inputRange: [0, 1],
      outputRange: [0, 280],
    }),
    opacity: animation,
    overflow: "hidden",
  };

  const handleDateConfirm = (pickedDate: Date) => {
    console.log("📅 Picked raw date:", pickedDate);

    // Store the original JS Date object
    setSelectedDate(pickedDate);

    // Convert to YYYY-MM-DD string for display
    const formatted = pickedDate.toISOString().split("T")[0]; // "2025-11-04"
    setDate(formatted);

    // Convert to epoch time (ms since 1970)
    const timestamp = new Date(formatted).getTime();

    console.log("🧭 Converted to timestamp:", timestamp);

    // Optionally store numeric timestamp in a separate state (if you pass numeric to service)
    // setDateTimestamp(timestamp);

    setDatePickerVisible(false);
  };

  return (
    <View className="h-100 pt-5">
      <View className="py-5 my-2">
        <Text className="font-bold ms-5" style={{ fontSize: 40 }}>
          My Hikes
        </Text>
      </View>

      {/* Search + Filter */}
      <View className="py-3 mx-5">
        <View className="flex-row items-center justify-between">
          <View className="flex-1 mr-3">
            <FloatingInput
              label="Search (Name or Location)"
              value={searchValue}
              onChangeText={setSearchValue}
              className="w-full border-0 px-2 rounded-lg"
            />
          </View>

          <TouchableOpacity
            className="mb-5 rounded-xl bg-primary py-3 w-[100px]"
            activeOpacity={0.7}
            onPress={toggleFilter}
          >
            <Text className="text-center text-white font-semibold text-lg">
              Filter
            </Text>
          </TouchableOpacity>
        </View>

        {/* Animated Filter Section */}
        <Animated.View style={animatedStyle}>
          <View className="p-3 bg-white rounded-xl shadow-sm shadow-black/10">
            <View className="flex-row items-center justify-between">
              {/* Min Length */}
              <View className="flex-1 mr-2">
                <FloatingInput
                  label="Min Length"
                  onChangeText={setMinLength}
                  keyboardType="numeric"
                  value={minLength}
                  className="border-0 px-2 py-2 rounded-lg shadow-sm shadow-black/10 bg-white"
                />
              </View>

              {/* Max Length */}
              <View className="flex-1 mr-2">
                <FloatingInput
                  label="Max Length"
                  onChangeText={setMaxLength}
                  keyboardType="numeric"
                  value={maxLength}
                  className="border-0 px-2 py-2 rounded-lg shadow-sm shadow-black/10 bg-white"
                />
              </View>

              {/* UNIT DROPDOWN */}
              <View style={styles.unitDropdownContainer}>
                <DropDownPicker
                  zIndex={2000}
                  zIndexInverse={1000}
                  open={unitDropdownOpen}
                  value={unit}
                  items={unitOptions}
                  setOpen={setUnitDropdownOpen}
                  setValue={setUnit}
                  setItems={() => {}}
                  placeholder="Unit"
                  style={styles.dropdownStyle}
                  dropDownContainerStyle={styles.dropdownContainerStyle}
                  listMode="SCROLLVIEW"
                />
              </View>
            </View>

            {/* Date Filter */}
            <View className="mb-5 mt-3">
              <TouchableOpacity
                onPress={() => setDatePickerVisible(true)}
                activeOpacity={0.8}
                style={{
                  borderWidth: 1,
                  borderColor: "#d1d5db",
                  borderRadius: 10,
                  paddingVertical: 14,
                  paddingHorizontal: 12,
                  justifyContent: "center",
                }}
              >
                <Text
                  style={{
                    fontSize: 16,
                    color: date ? "#111827" : "#9ca3af",
                  }}
                >
                  {date ? date : "Filter Date"}
                </Text>
              </TouchableOpacity>

              <DateTimePickerModal
                isVisible={isDatePickerVisible}
                mode="date"
                onConfirm={handleDateConfirm}
                onCancel={() => setDatePickerVisible(false)}
                date={selectedDate}
              />
            </View>

            {/* Action Buttons */}
            <View className="flex-row justify-end">
              <TouchableOpacity
                onPress={handleSearch}
                className="rounded-xl bg-primary py-3 w-[80px] items-center justify-center shadow-sm shadow-black/10 me-4"
                activeOpacity={0.8}
              >
                <Text className="text-white font-semibold text-sm">Search</Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={handleReset}
                className="rounded-xl bg-gray py-3 w-[80px] items-center justify-center shadow-sm shadow-black/10"
                activeOpacity={0.8}
              >
                <Text className="text-white font-semibold text-sm">Reset</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Animated.View>
      </View>

      {/* Hike list reacts to filters */}
      <HikeList filters={filters} />
    </View>
  );
};
const styles = StyleSheet.create({
  unitDropdownContainer: {
    width: 90, // fixed width (to match button-like appearance)
    zIndex: 2000,
  },
  dropdownStyle: {
    borderColor: "#d1d5db", // Tailwind gray-300
    borderRadius: 10,
    height: 56, // match FloatingInput height
    justifyContent: "center",
    paddingHorizontal: 8,
  },
  dropdownContainerStyle: {
    borderColor: "#d1d5db",
    borderRadius: 10,
    zIndex: 2000,
  },
});

export default HomeMain;
