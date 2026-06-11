import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  SafeAreaView,
  ScrollView,
} from 'react-native';
import { useAuthStore } from '../stores/authStore';

const LoginScreen = ({ navigation }) => {
  const [phone, setPhone] = useState('');
  const { sendOtp, isLoading, error, clearError } = useAuthStore();

  const handleContinue = async () => {
    if (phone.length === 10) {
      try {
        clearError();
        const normalizedPhone = await sendOtp(phone);
        navigation.navigate('OTP', { phone: normalizedPhone });
      } catch {
        // Store already exposes a user-safe error message.
      }
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>
        {/* Header Banner */}
        <View style={styles.headerBanner}>
          <Text style={styles.headerTitle}>👜</Text>
        </View>

        {/* Form */}
        <View style={styles.formContainer}>
          <Text style={styles.title}>Login / Sign Up</Text>
          <Text style={styles.subtitle}>
            Enter your mobile number to continue
          </Text>

          {/* Country Code + Phone Input */}
          <View style={styles.phoneInputWrapper}>
            <View style={styles.countryCodePicker}>
              <Text style={styles.countryCode}>🇮🇳 +91</Text>
            </View>
            <TextInput
              style={styles.phoneInput}
              placeholder="Enter mobile number"
              placeholderTextColor="#999"
              keyboardType="phone-pad"
              maxLength={10}
              value={phone}
              onChangeText={(value) => setPhone(value.replace(/\D/g, ''))}
            />
          </View>

          {error ? <Text style={styles.errorText}>{error}</Text> : null}

          {/* Continue Button */}
          <TouchableOpacity
            style={[
              styles.continueButton,
              phone.length !== 10 && styles.buttonDisabled,
            ]}
            onPress={handleContinue}
            disabled={phone.length !== 10 || isLoading}
          >
            <Text style={styles.buttonText}>
              {isLoading ? 'Sending OTP...' : 'Continue'}
            </Text>
          </TouchableOpacity>

          {/* Social Login */}
          <View style={styles.dividerContainer}>
            <View style={styles.divider} />
            <Text style={styles.dividerText}>Or continue with</Text>
            <View style={styles.divider} />
          </View>

          <TouchableOpacity style={styles.socialButton}>
            <Text style={styles.socialIcon}>🔍</Text>
            <Text style={styles.socialText}>Login with Google</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.socialButton}>
            <Text style={styles.socialIcon}>🍎</Text>
            <Text style={styles.socialText}>Login with Apple</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  content: {
    flexGrow: 1,
    paddingHorizontal: 24,
    paddingVertical: 20,
  },
  headerBanner: {
    backgroundColor: '#1E5BA8',
    borderRadius: 12,
    paddingVertical: 30,
    alignItems: 'center',
    marginBottom: 30,
  },
  headerTitle: {
    fontSize: 80,
  },
  formContainer: {
    marginBottom: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: '#000',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 14,
    color: '#666',
    marginBottom: 24,
  },
  phoneInputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
    borderRadius: 8,
    backgroundColor: '#F5F5F5',
    paddingHorizontal: 12,
  },
  countryCodePicker: {
    paddingRight: 12,
    borderRightWidth: 1,
    borderRightColor: '#DDD',
  },
  countryCode: {
    fontSize: 14,
    fontWeight: '600',
    color: '#000',
  },
  phoneInput: {
    flex: 1,
    paddingVertical: 16,
    paddingHorizontal: 12,
    fontSize: 14,
    color: '#000',
  },
  continueButton: {
    backgroundColor: '#1E5BA8',
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 24,
  },
  buttonDisabled: {
    backgroundColor: '#B0BFC9',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  errorText: {
    color: '#C62828',
    fontSize: 13,
    marginBottom: 12,
  },
  dividerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  divider: {
    flex: 1,
    height: 1,
    backgroundColor: '#DDD',
  },
  dividerText: {
    marginHorizontal: 12,
    color: '#666',
    fontSize: 12,
  },
  socialButton: {
    flexDirection: 'row',
    borderWidth: 1,
    borderColor: '#DDD',
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 16,
    alignItems: 'center',
    marginBottom: 12,
  },
  socialIcon: {
    fontSize: 20,
    marginRight: 12,
  },
  socialText: {
    color: '#000',
    fontSize: 14,
    fontWeight: '600',
  },
});

export default LoginScreen;
