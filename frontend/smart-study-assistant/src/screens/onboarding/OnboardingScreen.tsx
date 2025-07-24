import React, { useState, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  Dimensions,
  TouchableOpacity,
  StatusBar,
  Animated,
  Alert,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { MaterialIcons } from "@expo/vector-icons";
import * as HapticsUtil from "../../utils/haptics";
import { useTranslation } from "react-i18next";
import { useTheme } from "../../contexts/ThemeContext";
import { useOnboardingNavigation } from "../../hooks/useOnboardingNavigation";

const { width, height } = Dimensions.get("window");

interface OnboardingSlide {
  id: string;
  titleKey: string;
  descriptionKey: string;
  icon: keyof typeof MaterialIcons.glyphMap;
  gradient: string[];
}

const OnboardingScreen = ({ navigation }: any) => {
  const { t } = useTranslation();
  const { currentTheme } = useTheme();
  const { completeOnboarding, skipOnboarding } = useOnboardingNavigation();
  const [currentIndex, setCurrentIndex] = useState(0);
  const scrollX = useRef(new Animated.Value(0)).current;
  const slidesRef = useRef<any>(null);
  const skipOpacity = useRef(new Animated.Value(1)).current;

  const slides: OnboardingSlide[] = [
    {
      id: "1",
      titleKey: "onboarding.slide1.title",
      descriptionKey: "onboarding.slide1.description",
      icon: "school",
      gradient: ["#667eea", "#764ba2"],
    },
    {
      id: "2",
      titleKey: "onboarding.slide2.title",
      descriptionKey: "onboarding.slide2.description",
      icon: "psychology",
      gradient: ["#f093fb", "#f5576c"],
    },
    {
      id: "3",
      titleKey: "onboarding.slide3.title",
      descriptionKey: "onboarding.slide3.description",
      icon: "trending-up",
      gradient: ["#4facfe", "#00f2fe"],
    },
    {
      id: "4",
      titleKey: "onboarding.slide4.title",
      descriptionKey: "onboarding.slide4.description",
      icon: "rocket-launch",
      gradient: ["#43e97b", "#38f9d7"],
    },
  ];

  const goToNext = () => {
    if (currentIndex < slides.length - 1) {
      setCurrentIndex(currentIndex + 1);
      slidesRef.current?.scrollToIndex({ index: currentIndex + 1 });

      // Fade out skip button on last slide
      if (currentIndex + 1 === slides.length - 1) {
        Animated.timing(skipOpacity, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
        }).start();
      }
    } else {
      handleFinish();
    }
  };

  const goToPrev = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
      slidesRef.current?.scrollToIndex({ index: currentIndex - 1 });

      // Fade in skip button when going back from last slide
      if (currentIndex === slides.length - 1) {
        Animated.timing(skipOpacity, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }).start();
      }
    }
  };

  const handleSkip = () => {
    Alert.alert(
      t("onboarding.skipConfirmTitle"),
      t("onboarding.skipConfirmMessage"),
      [
        {
          text: t("common.cancel"),
          style: "cancel",
        },
        {
          text: t("onboarding.skip"),
          style: "destructive",
          onPress: handleSkipConfirmed,
        },
      ]
    );
  };

  const handleSkipConfirmed = async () => {
    try {
      // Haptic feedback for skip action
      await HapticsUtil.impactAsync(HapticsUtil.ImpactFeedbackStyle.Medium);

      console.log("⏭️ User confirmed skip onboarding");
      const success = await skipOnboarding();

      if (success) {
        console.log("✅ Onboarding skipped successfully");
      } else {
        console.error("❌ Failed to skip onboarding");
      }
    } catch (error) {
      console.error("❌ Error in handleSkipConfirmed:", error);
    }
  };

  const handleFinish = async () => {
    try {
      // Haptic feedback for completion action
      await HapticsUtil.impactAsync(HapticsUtil.ImpactFeedbackStyle.Medium);

      console.log("🎯 User completed onboarding");
      const success = await completeOnboarding();

      if (success) {
        console.log("✅ Onboarding completed successfully");
      } else {
        console.error("❌ Failed to complete onboarding");
      }
    } catch (error) {
      console.error("❌ Error in handleFinish:", error);
    }
  };

  const renderSlide = ({
    item,
    index,
  }: {
    item: OnboardingSlide;
    index: number;
  }) => (
    <LinearGradient
      colors={item.gradient}
      style={styles.slide}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
    >
      <View style={styles.slideContent}>
        {/* Icon with animated background */}
        <Animated.View
          style={[
            styles.iconContainer,
            {
              transform: [
                {
                  scale: scrollX.interpolate({
                    inputRange: [
                      (index - 1) * width,
                      index * width,
                      (index + 1) * width,
                    ],
                    outputRange: [0.8, 1, 0.8],
                    extrapolate: "clamp",
                  }),
                },
              ],
            },
          ]}
        >
          <View style={styles.iconBackground}>
            <MaterialIcons name={item.icon} size={80} color="white" />
          </View>
        </Animated.View>

        <View style={styles.textContainer}>
          {/* Title with fade animation */}
          <Animated.Text
            style={[
              styles.title,
              {
                opacity: scrollX.interpolate({
                  inputRange: [
                    (index - 1) * width,
                    index * width,
                    (index + 1) * width,
                  ],
                  outputRange: [0.3, 1, 0.3],
                  extrapolate: "clamp",
                }),
              },
            ]}
          >
            {t(item.titleKey)}
          </Animated.Text>

          {/* Description with slide animation */}
          <Animated.Text
            style={[
              styles.description,
              {
                opacity: scrollX.interpolate({
                  inputRange: [
                    (index - 1) * width,
                    index * width,
                    (index + 1) * width,
                  ],
                  outputRange: [0.5, 1, 0.5],
                  extrapolate: "clamp",
                }),
                transform: [
                  {
                    translateY: scrollX.interpolate({
                      inputRange: [
                        (index - 1) * width,
                        index * width,
                        (index + 1) * width,
                      ],
                      outputRange: [20, 0, 20],
                      extrapolate: "clamp",
                    }),
                  },
                ],
              },
            ]}
          >
            {t(item.descriptionKey)}
          </Animated.Text>
        </View>
      </View>
    </LinearGradient>
  );

  const renderPagination = () => (
    <View style={styles.pagination}>
      {slides.map((_, index) => {
        const inputRange = [
          (index - 1) * width,
          index * width,
          (index + 1) * width,
        ];
        const dotWidth = scrollX.interpolate({
          inputRange,
          outputRange: [10, 20, 10],
          extrapolate: "clamp",
        });
        const opacity = scrollX.interpolate({
          inputRange,
          outputRange: [0.3, 1, 0.3],
          extrapolate: "clamp",
        });

        return (
          <Animated.View
            key={index}
            style={[styles.dot, { width: dotWidth, opacity }]}
          />
        );
      })}
    </View>
  );

  return (
    <View style={styles.container}>
      <StatusBar
        barStyle="light-content"
        backgroundColor="transparent"
        translucent
      />

      <Animated.FlatList
        ref={slidesRef}
        data={slides}
        renderItem={renderSlide}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        keyExtractor={(item) => item.id}
        onScroll={Animated.event(
          [{ nativeEvent: { contentOffset: { x: scrollX } } }],
          { useNativeDriver: false }
        )}
        onMomentumScrollEnd={(event) => {
          const index = Math.round(event.nativeEvent.contentOffset.x / width);
          setCurrentIndex(index);
        }}
      />

      {/* Skip Button - Top Right */}
      <Animated.View
        style={[styles.skipButtonContainer, { opacity: skipOpacity }]}
        pointerEvents={currentIndex < slides.length - 1 ? "auto" : "none"}
      >
        <TouchableOpacity
          style={styles.skipButton}
          onPress={handleSkip}
          activeOpacity={0.7}
        >
          <Text style={styles.skipText}>{t("onboarding.skip")}</Text>
          <MaterialIcons name="arrow-forward" size={16} color="white" />
        </TouchableOpacity>
      </Animated.View>

      {/* Bottom Navigation */}
      <View style={styles.bottomNavigation}>
        {/* Left: Back Button */}
        <View style={styles.leftNav}>
          {currentIndex > 0 ? (
            <TouchableOpacity style={styles.navButton} onPress={goToPrev}>
              <MaterialIcons name="arrow-back" size={24} color="white" />
            </TouchableOpacity>
          ) : (
            <View style={styles.navButton} />
          )}
        </View>

        {/* Center: Pagination */}
        <View style={styles.centerNav}>{renderPagination()}</View>

        {/* Right: Next/Get Started Button */}
        <View style={styles.rightNav}>
          <TouchableOpacity style={styles.navButton} onPress={goToNext}>
            {currentIndex === slides.length - 1 ? (
              <MaterialIcons name="check" size={24} color="white" />
            ) : (
              <MaterialIcons name="arrow-forward" size={24} color="white" />
            )}
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#000",
  },
  slide: {
    width,
    height,
    justifyContent: "center",
    alignItems: "center",
  },
  slideContent: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 40,
    paddingTop: 100,
    paddingBottom: 150,
  },
  iconContainer: {
    marginBottom: 60,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 10,
  },
  iconBackground: {
    width: 140,
    height: 140,
    borderRadius: 70,
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 3,
    borderColor: "rgba(255, 255, 255, 0.3)",
  },
  textContainer: {
    alignItems: "center",
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    color: "white",
    textAlign: "center",
    marginBottom: 16,
    textShadowColor: "rgba(0, 0, 0, 0.3)",
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
    lineHeight: 34,
  },
  description: {
    fontSize: 16,
    color: "rgba(255, 255, 255, 0.9)",
    textAlign: "center",
    lineHeight: 24,
    textShadowColor: "rgba(0, 0, 0, 0.2)",
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
    paddingHorizontal: 20,
  },
  pagination: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
  },
  dot: {
    height: 10,
    borderRadius: 5,
    backgroundColor: "white",
    marginHorizontal: 5,
  },
  bottomNavigation: {
    position: "absolute",
    bottom: 50,
    left: 0,
    right: 0,
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 30,
  },
  leftNav: {
    flex: 1,
    alignItems: "flex-start",
  },
  centerNav: {
    flex: 2,
    alignItems: "center",
  },
  rightNav: {
    flex: 1,
    alignItems: "flex-end",
  },
  skipButtonContainer: {
    position: "absolute",
    top: 60,
    right: 30,
    zIndex: 10,
  },
  skipButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 25,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.4)",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
  },
  skipText: {
    color: "white",
    fontSize: 14,
    fontWeight: "600",
    marginRight: 6,
  },

  navButton: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: "rgba(255, 255, 255, 0.25)",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 2,
    borderColor: "rgba(255, 255, 255, 0.3)",
  },
});

export default OnboardingScreen;
