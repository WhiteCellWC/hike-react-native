import React from "react";
import { Image, Text, TouchableOpacity, View } from "react-native";
import { Link } from "expo-router";
import { icons } from "@/constants/icons";

const HikeMain = () => {
  return (
    <View>
      <View
        className="bg-dark_sec px-3 py-5 rounded-2xl "
        style={{ height: "97%" }}
      >
        {/* Add Item Button */}
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

export default HikeMain;
