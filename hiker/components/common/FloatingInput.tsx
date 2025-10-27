import React, { useState, useRef, useEffect, FC } from "react";
import {
  TextInput,
  View,
  Text,
  Animated,
  Easing,
  TextInputProps,
  ViewStyle,
  TextStyle,
} from "react-native";

// 1. Define the props interface
interface FloatingInputProps extends TextInputProps {
  label: string;
  value: string;
  onChangeText: (text: string) => void;
  // You can add more props specific to the container if needed, like containerStyle: ViewStyle
}

// 2. Define the Function Component with the props type
const FloatingInput: FC<FloatingInputProps> = ({
  label,
  value,
  onChangeText,
  ...restProps
}) => {
  const [isFocused, setIsFocused] = useState<boolean>(false);
  // useRef is typed to hold an Animated.Value
  const animatedIsFocused = useRef<Animated.Value>(
    new Animated.Value(value ? 1 : 0)
  ).current;

  // Animation Logic: Animates when focused OR when there is a value
  useEffect(() => {
    Animated.timing(animatedIsFocused, {
      toValue: isFocused || value ? 1 : 0,
      duration: 200,
      easing: Easing.out(Easing.ease),
      useNativeDriver: false,
    }).start();
  }, [isFocused, value, animatedIsFocused]); // added animatedIsFocused to dependency array for best practice

  // Interpolated Styles
  const labelStyle: Animated.AnimatedProps<TextStyle> = {
    position: "absolute",
    backgroundColor: "white",
    paddingLeft: 4,
    paddingRight: 4,
    left: 18,
    // Top position: 18 (down) -> -10 (up)
    top: animatedIsFocused.interpolate({
      inputRange: [0, 1],
      outputRange: [18, -10],
    }),
    // Font size: 18 (large) -> 12 (small)
    fontSize: animatedIsFocused.interpolate({
      inputRange: [0, 1],
      outputRange: [18, 12],
    }),
    // Color change
    color: animatedIsFocused.interpolate({
      inputRange: [0, 1],
      outputRange: ["gray", "black"],
    }),
  };

  return (
    <View
      style={{
        borderWidth: 1,
        borderColor: isFocused ? "black" : "gray", // Focus color
        marginBottom: 10,
        borderRadius: 8,
        paddingTop: 18, // Space for the floating label
      }}
    >
      {/* FLOATING LABEL (Animated.Text handles the Animated.AnimatedStyle type) */}
      <Animated.Text style={labelStyle}>{label}</Animated.Text>

      {/* TEXT INPUT (using TextInputProps in the interface allows for easy passthrough) */}
      <TextInput
        style={{
          fontSize: 18,
          paddingHorizontal: 18,
          paddingBottom: 18,
          paddingTop: 0,
          color: "black",
        }}
        value={value}
        onChangeText={onChangeText}
        onFocus={() => setIsFocused(true)}
        onBlur={() => setIsFocused(false)}
        // Pass any other standard TextInput props (keyboardType, multiline, etc.)
        {...restProps}
      />
    </View>
  );
};

export default FloatingInput;
