import React, { useCallback, useEffect, useState } from "react";
import {
  FlatList,
  Image,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { Link, useFocusEffect } from "expo-router";
import { icons } from "@/constants/icons";
import HikeCard from "./HikeCardComponent";
import { Hike } from "@/types/types";
import { HikeService } from "@/services/HikeService";

interface HikeListProps {
  filters: {
    search: string;
    minLength: string;
    maxLength: string;
    date: string;
    unit: string;
  };
}

const HikeList: React.FC<HikeListProps> = ({ filters }) => {
  const [items, setItems] = useState<Hike[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  const fetchHikes = async () => {
    try {
      setLoading(true);

      // --- Normalize and type-safe filter values ---
      const parsedFilters = {
        search: filters.search?.trim() || "",
        minLength:
          filters.minLength && !isNaN(Number(filters.minLength))
            ? String(filters.minLength)
            : "0", // default to "0"
        maxLength:
          filters.maxLength && !isNaN(Number(filters.maxLength))
            ? String(filters.maxLength)
            : "", // empty means no upper bound
        date:
          filters.date && !isNaN(Date.parse(filters.date))
            ? new Date(filters.date).getTime()
            : undefined,
        unit: filters.unit || "",
      };

      console.log("🟦 [UI] Passing parsed filters to service:", parsedFilters);

      const hikes = await HikeService.getFiltered(parsedFilters);
      setItems(hikes);
    } catch (error) {
      console.error("❌ Failed to fetch hikes:", error);
      setItems([]);
    } finally {
      setLoading(false);
    }
  };

  // ⬇️ Re-fetch when filters change
  useEffect(() => {
    fetchHikes();
  }, [filters]);

  useFocusEffect(
    useCallback(() => {
      fetchHikes();
    }, [])
  );

  // 🧹 Handle hike deletion (refresh UI instantly)
  const handleDelete = (id: number) => {
    setItems((prev) => prev.filter((item) => item.id !== id));
  };

  return (
    <View className="h-[75%]">
      <View style={{ flex: 1 }} className="bg-white">
        {loading ? (
          <View className="flex-1 justify-center items-center">
            <Text className="text-gray-500">Loading hikes...</Text>
          </View>
        ) : items.length === 0 ? (
          <View className="flex-1 justify-center items-center">
            <Text className="text-gray-500">No hike data available.</Text>
          </View>
        ) : (
          <FlatList
            data={items}
            keyExtractor={(item) => item.id.toString()}
            contentContainerStyle={{ paddingBottom: 100 }}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
            renderItem={({ item }) => (
              <HikeCard hike={item} onDelete={handleDelete} />
            )}
          />
        )}
      </View>

      {/* Floating Add Button */}
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
            style={{ bottom: -20, width: 50, height: 50 }}
          >
            <Image source={icons.plus} className="size-15 mr-1 mt-0.5" />
          </TouchableOpacity>
        </Link>
      </View>
    </View>
  );
};

export default HikeList;
