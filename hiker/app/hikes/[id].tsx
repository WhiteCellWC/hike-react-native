import EditHikeForm from "@/components/hike/EditHikeForm";
import { useSearchParams } from "expo-router/build/hooks";
import React from "react";
import { View } from "react-native";
import { useLocalSearchParams } from "expo-router";

const EditHikeScreen = () => {
  const { id } = useLocalSearchParams();
  const hikeId = Array.isArray(id) ? id[0] : id ?? "";

  console.log("EditHikeScreen(): id:", hikeId);

  return (
    <View>
      <EditHikeForm hikeId={hikeId} />
    </View>
  );
};

export default EditHikeScreen;
