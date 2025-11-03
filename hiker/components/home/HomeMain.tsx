import React from "react";
import { Text, View } from "react-native";
import HikeList from "../hike/HikeList";

const HomeMain = () => {
  return (
    <View className="h-100 pt-5">
      <View className="py-5 my-2">
        <Text className="font-bold ms-5" style={{ fontSize: 40 }}>
          My Hikes
        </Text>
      </View>
      <View className="py-5 my-2">
        <Text className="font ms-5" style={{ fontSize: 20 }}>
          Search bar will be here.
        </Text>
      </View>
      <HikeList />
    </View>
  );
};

export default HomeMain;
