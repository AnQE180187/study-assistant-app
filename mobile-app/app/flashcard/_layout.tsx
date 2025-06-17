import { Stack } from 'expo-router';

export default function FlashcardLayout() {
  return (
    <Stack>
      <Stack.Screen
        name="[id]"
        options={{
          headerShown: false,
        }}
      />
      <Stack.Screen
        name="study/[id]"
        options={{
          headerShown: false,
        }}
      />
    </Stack>
  );
} 