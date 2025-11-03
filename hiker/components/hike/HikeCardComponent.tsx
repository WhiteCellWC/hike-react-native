import { icons } from "@/constants/icons";
import { HikeService } from "@/services/HikeService";
import { Hike } from "@/types/types";
import { File, Paths } from "expo-file-system";
import { useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import { Alert, Image, Text, TouchableOpacity, View } from "react-native";
type HikeCardProps = {
  hike: Hike;
  onDelete?: (id: number) => void; // 👈 Add this
};

const HikeCard: React.FC<HikeCardProps> = ({ hike, onDelete }) => {
  const [imageUri, setImageUri] = useState<string | null>(null);

  const router = useRouter();

  const handleOptions = () => {
    Alert.alert("Options", "Choose an action", [
      {
        text: "Edit",
        onPress: () => {
          // Navigate to add_hike page with hike id
          console.log("Edit hike", hike.id);
          router.push({
            pathname: "/hikes/[id]",
            params: { id: hike.id.toString() },
          });
        },
      },
      {
        text: "Delete",
        style: "destructive",
        onPress: async () => {
          try {
            await HikeService.delete(hike.id);
            console.log("✅ Deleted hike", hike.id);

            // 🔔 Notify parent list
            onDelete?.(hike.id);

            // 🔔 Show success message
            Alert.alert("Deleted", "Hike deleted successfully!");
          } catch (err) {
            console.error("❌ Failed to delete hike:", err);
            Alert.alert("Error", "Failed to delete hike.");
          }
        },
      },
      { text: "Cancel", style: "cancel" },
    ]);
  };

  useEffect(() => {
    const loadImage = async () => {
      if (!hike.image) {
        setImageUri(null);
        return;
      }

      try {
        // Since you store full URI like "file://…", we can use it directly
        const file = new File(hike.image);
        if (file.exists) {
          setImageUri(file.uri);
        } else {
          console.warn("Image file not found:", file.uri);
          setImageUri(null);
        }
      } catch (err) {
        console.error("Error loading image file:", err);
        setImageUri(null);
      }
    };

    loadImage();
  }, [hike.image]);

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
        {imageUri ? (
          <Image
            source={{ uri: imageUri }}
            style={{ width: "100%", height: 200, borderRadius: 8 }}
            resizeMode="cover"
          />
        ) : (
          <Text className="text-gray-500">No Image</Text>
        )}
      </View>

      <View className="flex-row justify-between content-center mt-2">
        <View>
          <Text style={{ fontSize: 20 }} className="font-bold text-black">
            {hike.name}
          </Text>

          <View className="flex-row items-center mt-1">
            <Image source={icons.location} />
            <Text className="ml-2 text-gray-500">{hike.location}</Text>
          </View>

          <View className="flex-row mt-1">
            <View className="flex-row items-center">
              <Image source={icons.road} />
              <Text className="ml-2 text-gray-500">
                {hike.length_value} {hike.length_unit}
              </Text>
            </View>

            <View className="flex-row items-center ml-4">
              <Image source={icons.calendar2} />
              <Text className="ml-2 text-gray-500">{formattedDate}</Text>
            </View>
          </View>
        </View>
        <TouchableOpacity onPress={() => handleOptions()}>
          <Image source={icons.ellipsis} />
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default HikeCard;
