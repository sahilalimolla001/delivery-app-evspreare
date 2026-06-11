import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Animated,
  Dimensions,
} from 'react-native';

const SplashScreen = ({ navigation }) => {
  const [fadeAnim] = useState(new Animated.Value(0));
  const [slideAnim] = useState(new Animated.Value(50));
  const [dotAnim] = useState(new Animated.Value(0));

  useEffect(() => {
    // Fade in animation
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 800,
        useNativeDriver: true,
      }),
    ]).start();

    // Dot carousel animation
    const dotAnimation = Animated.loop(
      Animated.sequence([
        Animated.timing(dotAnim, {
          toValue: 1,
          duration: 600,
          useNativeDriver: false,
        }),
        Animated.timing(dotAnim, {
          toValue: 2,
          duration: 600,
          useNativeDriver: false,
        }),
        Animated.timing(dotAnim, {
          toValue: 0,
          duration: 600,
          useNativeDriver: false,
        }),
      ])
    );
    dotAnimation.start();

    // Check if rider is logged in (simulate API call)
    const timer = setTimeout(() => {
      checkLoginStatus();
    }, 2500);

    return () => clearTimeout(timer);
  }, []);

  const checkLoginStatus = async () => {
    try {
      // TODO: Check from AsyncStorage or API
      // const loggedIn = await getLoginStatus();
      // if (loggedIn) {
      navigation.reset({
        index: 0,
        routes: [{ name: 'Login' }],
      });
    } catch (error) {
      navigation.reset({
        index: 0,
        routes: [{ name: 'Login' }],
      });
    }
  };

  return (
    <View style={styles.container}>
      {/* Gradient Background */}
      <View style={styles.background}>
        <View style={styles.blueGradient} />
      </View>

      {/* Main Content */}
      <Animated.View
        style={[
          styles.content,
          {
            opacity: fadeAnim,
            transform: [{ translateY: slideAnim }],
          },
        ]}
      >
        {/* Delivery Boy Illustration */}
        <View style={styles.illustrationContainer}>
          <Text style={styles.illustrationEmoji}>🛵</Text>
          <View style={styles.deliveryBoyIcon}>
            <Text style={styles.riderEmoji}>👨‍🚴</Text>
          </View>
        </View>

        {/* Main Text */}
        <Text style={styles.mainText}>Delivering Happiness</Text>
        <Text style={styles.subtitleText}>
          Fast deliveries. Happy customers. Be the difference!
        </Text>
      </Animated.View>

      {/* Carousel Indicator */}
      <View style={styles.indicatorContainer}>
        <Dot index={0} activeIndex={dotAnim} />
        <Dot index={1} activeIndex={dotAnim} />
        <Dot index={2} activeIndex={dotAnim} />
      </View>
    </View>
  );
};

const Dot = ({ index, activeIndex }) => {
  return (
    <Animated.View
      style={[
        styles.dot,
        {
          opacity: activeIndex.interpolate({
            inputRange: [index - 1, index, index + 1],
            outputRange: [0.4, 1, 0.4],
            extrapolate: 'clamp',
          }),
          transform: [
            {
              scale: activeIndex.interpolate({
                inputRange: [index - 1, index, index + 1],
                outputRange: [0.7, 1.2, 0.7],
                extrapolate: 'clamp',
              }),
            },
          ],
        },
      ]}
    />
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#ffffff',
  },
  background: {
    position: 'absolute',
    width: '100%',
    height: '100%',
  },
  blueGradient: {
    flex: 1,
    backgroundColor: '#1E5BA8',
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 10,
  },
  illustrationContainer: {
    position: 'relative',
    alignItems: 'center',
    marginBottom: 40,
    height: 200,
    justifyContent: 'center',
  },
  illustrationEmoji: {
    fontSize: 120,
    marginBottom: 0,
  },
  deliveryBoyIcon: {
    position: 'absolute',
    top: 20,
    right: -10,
  },
  riderEmoji: {
    fontSize: 80,
  },
  mainText: {
    fontSize: 32,
    fontWeight: '700',
    color: '#ffffff',
    textAlign: 'center',
    marginBottom: 16,
    letterSpacing: 0.5,
  },
  subtitleText: {
    fontSize: 16,
    color: '#E8F0F8',
    textAlign: 'center',
    lineHeight: 24,
    paddingHorizontal: 30,
    fontWeight: '500',
  },
  indicatorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 60,
    zIndex: 10,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#ffffff',
    marginHorizontal: 6,
  },
});

export default SplashScreen;
