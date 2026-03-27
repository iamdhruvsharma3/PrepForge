import { StatusBar } from "expo-status-bar";
import { SafeAreaView, StyleSheet, Text, View } from "react-native";

import { tokens } from "@prepforge/tokens";

import { mobileEnv } from "../src/env";

const tracks = [
  "Daily practice",
  "Voice-first drills",
  "History and streaks",
  "Shared typed API client",
];

export default function HomeScreen() {
  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar style="light" />
      <View style={styles.container}>
        <Text style={styles.eyebrow}>PrepForge Mobile</Text>
        <Text style={styles.title}>Mobile reuses logic, not web-only UI.</Text>
        <Text style={styles.subtitle}>
          API target: {mobileEnv.EXPO_PUBLIC_API_BASE_URL}
        </Text>

        <View style={styles.grid}>
          {tracks.map((track) => (
            <View key={track} style={styles.card}>
              <Text style={styles.cardLabel}>Track</Text>
              <Text style={styles.cardTitle}>{track}</Text>
            </View>
          ))}
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: tokens.colors.panel,
    borderColor: tokens.colors.border,
    borderRadius: 20,
    borderWidth: 1,
    gap: 8,
    padding: 18,
  },
  cardLabel: {
    color: tokens.colors.textMuted,
    fontSize: 11,
    letterSpacing: 1.6,
    textTransform: "uppercase",
  },
  cardTitle: {
    color: tokens.colors.text,
    fontSize: 20,
    fontWeight: "600",
  },
  container: {
    flex: 1,
    gap: 20,
    padding: 24,
  },
  eyebrow: {
    color: tokens.colors.accent,
    fontSize: 12,
    letterSpacing: 2.4,
    textTransform: "uppercase",
  },
  grid: {
    gap: 14,
  },
  safeArea: {
    backgroundColor: tokens.colors.canvas,
    flex: 1,
  },
  subtitle: {
    color: tokens.colors.textMuted,
    fontSize: 16,
    lineHeight: 24,
  },
  title: {
    color: tokens.colors.text,
    fontSize: 34,
    fontWeight: "700",
    lineHeight: 40,
  },
});
