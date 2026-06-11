import React from 'react';
import { ActivityIndicator, Text, View } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { useAuthStore } from './src/stores/authStore';

import SplashScreen from './src/screens/SplashScreen';
import LoginScreen from './src/screens/LoginScreen';
import OTPScreen from './src/screens/OTPScreen';
import DashboardScreen from './src/screens/DashboardScreen';
import OrderDetailsScreen from './src/screens/OrderDetailsScreen';
import EarningsScreen from './src/screens/EarningsScreen';
import OrderHistoryScreen from './src/screens/OrderHistoryScreen';
import ProfileScreen from './src/screens/ProfileScreen';
import SettingsScreen from './src/screens/SettingsScreen';
import SupportScreen from './src/screens/SupportScreen';
import MapNavigationScreen from './src/screens/MapNavigationScreen';
import PickupScreen from './src/screens/PickupScreen';
import DeliveryScreen from './src/screens/DeliveryScreen';
import VehicleInfoScreen from './src/screens/VehicleInfoScreen';
import DocumentsScreen from './src/screens/DocumentsScreen';

const Stack = createStackNavigator();
const Tab = createBottomTabNavigator();

function AuthStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false, cardStyle: { backgroundColor: '#fff' } }}>
      <Stack.Screen name="Splash" component={SplashScreen} />
      <Stack.Screen name="Login" component={LoginScreen} />
      <Stack.Screen name="OTP" component={OTPScreen} />
    </Stack.Navigator>
  );
}

function DashboardStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="DashboardHome" component={DashboardScreen} />
      <Stack.Screen name="OrderDetails" component={OrderDetailsScreen} />
      <Stack.Screen name="MapNavigation" component={MapNavigationScreen} />
      <Stack.Screen name="Pickup" component={PickupScreen} />
      <Stack.Screen name="Delivery" component={DeliveryScreen} />
    </Stack.Navigator>
  );
}

function ProfileStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="ProfileHome" component={ProfileScreen} />
      <Stack.Screen name="Settings" component={SettingsScreen} />
      <Stack.Screen name="Support" component={SupportScreen} />
      <Stack.Screen name="VehicleInfo" component={VehicleInfoScreen} />
      <Stack.Screen name="Documents" component={DocumentsScreen} />
    </Stack.Navigator>
  );
}

function TabIcon({ name, color }) {
  const labels = {
    home: 'Home',
    earnings: 'Pay',
    orders: 'Box',
    profile: 'Me',
  };
  return <Text style={{ color, fontSize: 11, fontWeight: '700' }}>{labels[name]}</Text>;
}

function AppStack() {
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: '#1E5BA8',
        tabBarInactiveTintColor: '#8E8E93',
        tabBarLabelStyle: { fontSize: 12, fontWeight: '600' },
        tabBarStyle: {
          height: 60,
          paddingBottom: 8,
          paddingTop: 8,
        },
      }}
    >
      <Tab.Screen
        name="Home"
        component={DashboardStack}
        options={{
          tabBarLabel: 'Home',
          tabBarIcon: ({ color }) => <TabIcon name="home" color={color} />,
        }}
      />
      <Tab.Screen
        name="EarningsTab"
        component={EarningsScreen}
        options={{
          tabBarLabel: 'Earnings',
          tabBarIcon: ({ color }) => <TabIcon name="earnings" color={color} />,
        }}
      />
      <Tab.Screen
        name="OrdersTab"
        component={OrderHistoryScreen}
        options={{
          tabBarLabel: 'Orders',
          tabBarIcon: ({ color }) => <TabIcon name="orders" color={color} />,
        }}
      />
      <Tab.Screen
        name="ProfileTab"
        component={ProfileStack}
        options={{
          tabBarLabel: 'Profile',
          tabBarIcon: ({ color }) => <TabIcon name="profile" color={color} />,
        }}
      />
    </Tab.Navigator>
  );
}

export default function App() {
  const { initializeAuth, isInitializing, isLoggedIn } = useAuthStore();

  React.useEffect(() => {
    initializeAuth();
  }, [initializeAuth]);

  if (isInitializing) {
    return (
      <GestureHandlerRootView style={{ flex: 1 }}>
        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: '#1E5BA8' }}>
          <ActivityIndicator color="#ffffff" size="large" />
          <Text style={{ color: '#ffffff', marginTop: 16, fontWeight: '700' }}>Quick Commerce Rider</Text>
        </View>
      </GestureHandlerRootView>
    );
  }

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <NavigationContainer>
        {isLoggedIn ? <AppStack /> : <AuthStack />}
      </NavigationContainer>
    </GestureHandlerRootView>
  );
}
