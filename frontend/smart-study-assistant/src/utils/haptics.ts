// Haptics utility with fallback for when expo-haptics is not available

let Haptics: any = null;

try {
  Haptics = require('expo-haptics');
} catch (error) {
  console.log('expo-haptics not available, using fallback');
}

export const ImpactFeedbackStyle = {
  Light: 'Light',
  Medium: 'Medium',
  Heavy: 'Heavy',
};

export const impactAsync = async (style: string = ImpactFeedbackStyle.Medium) => {
  try {
    if (Haptics && Haptics.impactAsync) {
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle[style]);
    } else {
      // Fallback: just log the action
      console.log(`Haptic feedback: ${style}`);
    }
  } catch (error) {
    console.log('Haptic feedback failed:', error);
  }
};

export const notificationAsync = async (type: string = 'success') => {
  try {
    if (Haptics && Haptics.notificationAsync) {
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType[type]);
    } else {
      console.log(`Haptic notification: ${type}`);
    }
  } catch (error) {
    console.log('Haptic notification failed:', error);
  }
};

export const selectionAsync = async () => {
  try {
    if (Haptics && Haptics.selectionAsync) {
      await Haptics.selectionAsync();
    } else {
      console.log('Haptic selection feedback');
    }
  } catch (error) {
    console.log('Haptic selection failed:', error);
  }
};
