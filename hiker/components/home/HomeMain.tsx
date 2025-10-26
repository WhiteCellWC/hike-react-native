import React from "react";
import { Text, View } from "react-native";
import HikeList from "../hike/HikeList";

const HomeMain = () => {
  return (
    <View className="h-100">
      <Text>Home</Text>
      <HikeList />
    </View>
  );
};

export default HomeMain;
