import React from "react";
import {
  FlatList,
  Image,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { Link } from "expo-router";
import { icons } from "@/constants/icons";
import HikeCard from "./HikeCardComponent";
import { Hike } from "@/types/types";

const HikeList: React.FC = () => {
  const items: Hike[] = [
    {
      id: 1,
      name: "Mount Misty Trail",
      image: "https://example.com/misty.jpg",
      location: "Yamanashi, Japan",
      date: 1672531200000, // Jan 1, 2023
      length_value: 8.5,
      length_unit: "km",
      description: "A scenic trail through misty forests and gentle slopes.",
      difficulty: "Moderate",
      parking: true,
    },
    {
      id: 2,
      name: "Crystal Creek Path",
      image: "https://example.com/crystal.jpg",
      location: "Nagano, Japan",
      date: 1675209600000, // Feb 1, 2023
      length_value: 5.2,
      length_unit: "km",
      description: "Follow the sparkling creek with plenty of photo spots.",
      difficulty: "Easy",
      parking: false,
    },
    {
      id: 3,
      name: "Thunder Peak Ascent",
      image: "https://example.com/thunder.jpg",
      location: "Gifu, Japan",
      date: 1677628800000, // Mar 1, 2023
      length_value: 12.3,
      length_unit: "km",
      description: "A challenging climb with rewarding summit views.",
      difficulty: "Hard",
      parking: true,
    },
  ];

  return (
    <View className="border bg-red h-[75%]">
      <View style={{ flex: 1 }} className="bg-white">
        {items.length === 0 ? (
          <View
            style={{ flex: 1, justifyContent: "center", alignItems: "center" }}
          >
            <Text className="text-gray-500">No hike data available.</Text>
          </View>
        ) : (
          <FlatList
            data={items}
            keyExtractor={(item) => item.id.toString()}
            contentContainerStyle={{ paddingBottom: 100 }}
            renderItem={({ item }) => <HikeCard hike={item} />}
          />
        )}
      </View>

      <View
        className="bg-dark_sec px-3 py-5 rounded-2xl"
        style={{
          position: "absolute",
          bottom: 0,
          left: 0,
          right: 0,
          height: 80,
          justifyContent: "center",
        }}
      >
        <Link href={`/hikes/add_hike`} asChild>
          <TouchableOpacity
            className="bg-primary flex-row justify-center items-center rounded-full absolute right-6"
            style={{ bottom: -20 }}
          >
            <Image source={icons.plus} className="size-15 mr-1 mt-0.5" />
          </TouchableOpacity>
        </Link>
      </View>
    </View>
  );
};

export default HikeList;
