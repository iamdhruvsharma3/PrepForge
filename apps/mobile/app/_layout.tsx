import { Stack } from "expo-router";

export default function RootLayout() {
  return (
    <Stack
      screenOptions={{
        contentStyle: { backgroundColor: "#0b1020" },
        headerStyle: { backgroundColor: "#141b34" },
        headerTintColor: "#f2f5ff",
      }}
    />
  );
}

