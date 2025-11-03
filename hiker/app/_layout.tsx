import { AppConfigService } from "@/services/AppConfigService";
import { Stack } from "expo-router";
import { StatusBar } from "react-native";
import "./global.css";

export default function RootLayout() {
  (async () => {
    const retries = 5;
    const delay = 500; // milliseconds

    for (let attempt = 1; attempt <= retries; attempt++) {
      try {
        await AppConfigService.init(); // Run the main initialization logic
        console.log("AppConfigService initialized successfully.");
        return; // Exit loop on success
      } catch (error) {
        console.error(
          `AppConfigService.appInit() failed (Attempt ${attempt}): `,
          error
        );
        if (attempt < retries) {
          await new Promise((resolve) => setTimeout(resolve, delay)); // Wait before retrying
        } else {
          throw new Error("App initialization failed after multiple retries.");
        }
      }
    }
  })();
  return (
    <>
      <StatusBar hidden={true} />
      <Stack
        screenOptions={{
          contentStyle: { backgroundColor: "white" },
        }}
      >
        <Stack.Screen options={{ headerShown: false }} />
        <Stack.Screen name="index" options={{ headerShown: false }} />
        <Stack.Screen name="hikes/[id]" options={{ headerShown: false }} />
        <Stack.Screen name="hikes/add_hike" options={{ headerShown: false }} />
      </Stack>
    </>
  );
}
