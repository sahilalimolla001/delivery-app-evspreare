# Quick Commerce Delivery Rider App

A complete React Native mobile application for delivery riders to manage orders, earnings, and profile.

## 📱 Features

- **Splash Screen** - Beautiful onboarding animation
- **Authentication** - Phone number login with OTP verification
- **Dashboard** - Online/offline status, earnings summary, real-time order updates
- **Order Management** - Accept/reject orders, navigation to pickup and delivery locations
- **Earnings Tracking** - Daily, weekly, and monthly earnings breakdown
- **Order History** - Complete order history with filters
- **User Profile** - Rider information, vehicle details, documents verification
- **Settings** - App preferences, language selection, dark mode
- **Support** - Help center, live chat, call support

## 🚀 Quick Start

### Prerequisites
- Node.js >= 14
- Expo CLI: `npm install -g expo-cli`
- React Native development environment

### Installation

```bash
# Install dependencies
npm install

# Start the development server
npm start

# Run on Android
npm run android

# Run on iOS
npm run ios

# Run on Web
npm run web
```

## 📁 Project Structure

```
rider_app/
├── src/
│   ├── screens/          # Screen components
│   │   ├── SplashScreen.js
│   │   ├── LoginScreen.js
│   │   ├── OTPScreen.js
│   │   ├── DashboardScreen.js
│   │   ├── OrderDetailsScreen.js
│   │   ├── EarningsScreen.js
│   │   ├── OrderHistoryScreen.js
│   │   ├── ProfileScreen.js
│   │   ├── SettingsScreen.js
│   │   └── SupportScreen.js
│   ├── components/       # Reusable components
│   ├── navigation/       # Navigation configuration
│   ├── stores/          # Zustand state management
│   ├── services/        # API services
│   ├── utils/           # Helper functions
│   └── constants/       # App constants
├── App.js               # Main app entry point
├── app.json             # Expo configuration
└── package.json         # Dependencies
```

## 🎯 Screens Overview

1. **Splash Screen** - App intro with animated carousel
2. **Login Screen** - Phone number entry with OTP
3. **OTP Verification** - 6-digit OTP validation with countdown
4. **Dashboard** - Home screen with earnings and order updates
5. **Order Details** - Order information and items list
6. **Pickup Screen** - Store location and pickup instructions
7. **Delivery Screen** - Customer info and delivery instructions
8. **Earnings** - Detailed earnings analytics
9. **Order History** - Past orders with filters
10. **Profile** - Rider information and settings
11. **Vehicle Info** - Vehicle details and edit option
12. **Documents** - Document verification status
13. **Settings** - App preferences and toggles
14. **Support** - Help and customer support options

## 🛠️ Technology Stack

- **React Native** - Mobile framework
- **Expo** - Development and deployment
- **React Navigation** - App navigation
- **Zustand** - State management
- **Axios** - API calls
- **React Native Maps** - Location and mapping

## 🔐 Authentication Flow

1. User enters phone number
2. OTP sent to phone
3. User verifies OTP
4. JWT token stored locally
5. Automatic login on app restart

## 📡 API Integration

The app communicates with backend APIs for:
- User authentication
- Order management
- Real-time order updates
- Earnings calculation
- Location tracking

## 🎨 Design System

- **Color Palette**: Blue (#1E5BA8) primary, gray accents
- **Typography**: Bold headlines, medium body text
- **Spacing**: 4px base unit for consistency
- **Icons**: Emoji-based for simplicity

## 📝 Environment Variables

Create `.env` file in the root:

```
EXPO_PUBLIC_API_BASE_URL=http://localhost:3000
EXPO_PUBLIC_APP_ENV=development
```

## 🔄 State Management

Using Zustand for:
- Authentication state
- User profile
- Earnings data
- Order updates
- App settings

## 📚 Dependencies

See `package.json` for the complete list. Key packages:
- `react-native` - Core framework
- `expo` - Development platform
- `@react-navigation/*` - Navigation
- `zustand` - State management
- `axios` - HTTP client

## 🚀 Deployment

### Android (APK/AAB)
```bash
eas build --platform android
```

### iOS (IPA)
```bash
eas build --platform ios
```

### Web
```bash
npm run web
```

## 📞 Support

For issues and support, contact the development team.

## 📄 License

This project is proprietary.
