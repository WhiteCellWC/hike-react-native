import { icons } from "@/constants/icons";
import { Hike } from "@/types/types";
import React from "react";
import { Image, Text, View } from "react-native";
type HikeCardProps = {
  hike: Hike;
};

const HikeCard: React.FC<HikeCardProps> = ({ hike }) => {
  const formattedDate = new Date(hike.date).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });

  return (
    <View className="p-4">
      <View
        style={{ height: 200 }}
        className="bg-gray-300 rounded-md justify-center items-center"
      >
        {hike.image ? (
          <Image
            source={{ uri: hike.image }}
            style={{ width: "100%", height: 200, borderRadius: 8 }}
            resizeMode="cover"
          />
        ) : (
          <Text className="text-gray-500">Image Placeholder</Text>
        )}
      </View>

      <View className="flex-row justify-between align-middle content-center">
        <View>
          <Text style={{ fontSize: 20 }} className="mt-2 font-bold text-black">
            {hike.name}
          </Text>

          <View className="flex-row items-center mt-1">
            <Image source={icons.location} />
            <Text className="ml-2 text-gray-500">{hike.location}</Text>
          </View>

          <View className="flex-row">
            <View className="flex-row items-center mt-1">
              <Image source={icons.road} />
              <Text className="ml-2 text-gray-500">
                {hike.length_value} {hike.length_unit}
              </Text>
            </View>

            <View className="flex-row items-center ms-3 mt-1">
              <Image source={icons.calendar2} />
              <Text className="ml-2 text-gray-500">{formattedDate}</Text>
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
