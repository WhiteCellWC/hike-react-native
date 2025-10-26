import { icons } from "@/constants/icons";
import React from "react";
import { Image, Text, View } from "react-native";

const HikeCard: React.FC = () => {
  return (
    <View className=" p-4">
      <View
        style={{ height: 200 }}
        className="bg-gray-300 rounded-md justify-center items-center"
      >
        <Text className="text-gray-500">Image Placeholder</Text>
        {/* <Image
          source={{ uri: "https://placehold.co/600x400" }}
          style={{ width: "100%", height: 200, borderRadius: 8 }}
          resizeMode="cover"
        /> */}
      </View>
      <View className="flex-row justify-between align-middle content-center">
        <View>
          <Text style={{ fontSize: 20 }} className="mt-2 font-bold text-black">
            Hike Name
          </Text>
          <View className="flex-row items-center mt-1">
            <Image source={icons.location} />
            <Text className="ml-2 text-gray">- Hike Location</Text>
          </View>
          <View className="flex-row">
            <View className="flex-row items-center mt-1">
              <Image source={icons.road} />
              <Text className="ml-2 text-gray">- Hike Distance</Text>
            </View>
            <View className="flex-row items-center ms-3 mt-1">
              <Image source={icons.calendar2} />
              <Text className="ml-2 text-gray">- Hike Date</Text>
            </View>
          </View>
        </View>
        <View className="mt-2">
          <Image source={icons.ellipsis} />
        </View>
      </View>
    </View>
  );
};

export default HikeCard;
