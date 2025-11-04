import {
  View,
  Text,
  Image,
  ScrollView,
  ActivityIndicator,
  TouchableOpacity,
} from "react-native";
import { router, useLocalSearchParams } from "expo-router";
import { useEffect, useState } from "react";
import { HikeService } from "@/services/HikeService";
import { icons } from "@/constants/icons";
import { Hike } from "@/types/types";

const HikeDetailsScreen = () => {
  const { id } = useLocalSearchParams();
  const hikeId = Number(id);
  const [hike, setHike] = useState<Hike | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchHike = async () => {
      try {
        const data = await HikeService.getById(hikeId);
        setHike(data);
      } catch (error) {
        console.error("Failed to load hike:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchHike();
  }, [hikeId]);

  if (loading)
    return (
      <View className="flex-1 justify-center items-center bg-white">
        <ActivityIndicator size="large" />
      </View>
    );

  if (!hike)
    return (
      <View className="flex-1 justify-center items-center bg-white">
        <Text>No hike data found.</Text>
      </View>
    );

  const formattedDate = new Date(hike.date).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  return (
    <ScrollView className="flex-1 bg-white p-5 my-10">
      {/* 🖼️ Image Section */}
      {hike.image ? (
        <Image
          source={{ uri: hike.image }}
          style={{ width: "100%", height: 250 }}
          resizeMode="cover"
        />
      ) : (
        <View className="h-[250px] bg-gray-300 justify-center items-center">
          <Text className="text-gray-500">No Image</Text>
        </View>
      )}

      {/* 🏞️ Hike Details */}
      <View className="p-5">
        <Text className="text-2xl font-bold text-black mb-2">{hike.name}</Text>

        {/* 📍 Location */}
        <View className="flex-row items-center mb-2">
          <Image source={icons.location} className="w-4 h-4" />
          <Text className="ml-2 text-gray-600 text-base">{hike.location}</Text>
        </View>

        {/* 📅 Date */}
        <View className="flex-row items-center mb-2">
          <Image source={icons.calendar2} className="w-4 h-4" />
          <Text className="ml-2 text-gray-600 text-base">{formattedDate}</Text>
        </View>

        {/* 📏 Length */}
        <View className="flex-row items-center mb-2">
          <Image source={icons.road} className="w-4 h-4" />
          <Text className="ml-2 text-gray-600 text-base">
            {hike.length_value} {hike.length_unit}
          </Text>
        </View>

        {/* 🧭 Difficulty */}
        <View className="flex-row items-center mb-2">
          <Image source={icons.road} className="w-4 h-4" />
          <Text className="ml-2 text-gray-600 text-base">
            Difficulty:{" "}
            <Text className="font-semibold text-black">{hike.difficulty}</Text>
          </Text>
        </View>

        {/* 🅿️ Parking */}
        <View className="flex-row items-center mb-2">
          <Image source={icons.location} className="w-4 h-4" />
          <Text className="ml-2 text-gray-600 text-base">
            Parking Available:{" "}
            <Text className="font-semibold text-black">
              {hike.parking ? "Yes" : "No"}
            </Text>
          </Text>
        </View>

        {/* 📝 Description */}
        <View className="mt-4">
          <Text className="text-lg font-semibold text-black mb-1">
            Description
          </Text>
          <Text className="text-gray-700 text-base leading-6">
            {hike.description || "No description provided."}
          </Text>
        </View>
        {/* 🔙 Back Button */}
        <View className="mt-8 mb-10 items-center">
          <TouchableOpacity
            className="bg-gray-200 px-8 py-3 rounded-xl"
            onPress={() => router.back()}
          >
            <Text className="text-black font-semibold text-base">Back</Text>
          </TouchableOpacity>
        </View>
      </View>
    </ScrollView>
  );
};

export default HikeDetailsScreen;
