import React, { useState } from 'react';
import {
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { useAuthStore } from '../stores/authStore';

const LoginScreen = ({ navigation }) => {
  const [phone, setPhone] = useState('');
  const { sendOtp, isLoading, error, clearError } = useAuthStore();

  const handleContinue = async () => {
    if (phone.length !== 10 || isLoading) return;

    try {
      clearError();
      const normalizedPhone = await sendOtp(phone);
      navigation.navigate('OTP', { phone: normalizedPhone });
    } catch {
      // Store already exposes a user-safe error message.
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.headerBanner}>
          <Text style={styles.headerTitle}>evspeare</Text>
          <Text style={styles.headerSubtitle}>Delivery Partner</Text>
        </View>

        <View style={styles.formContainer}>
          <Text style={styles.title}>Login</Text>
          <Text style={styles.subtitle}>Enter your mobile number to receive OTP</Text>

          <View style={styles.phoneInputWrapper}>
            <View style={styles.countryCodePicker}>
              <Text style={styles.countryCode}>+91</Text>
            </View>
            <TextInput
              style={styles.phoneInput}
              placeholder="Enter mobile number"
              placeholderTextColor="#999"
              keyboardType="phone-pad"
              maxLength={10}
              value={phone}
              onChangeText={(value) => {
                clearError();
                setPhone(value.replace(/\D/g, ''));
              }}
              returnKeyType="done"
              onSubmitEditing={handleContinue}
            />
          </View>

          {error ? <Text style={styles.errorText}>{error}</Text> : null}

          <TouchableOpacity
            style={[
              styles.continueButton,
              phone.length !== 10 && styles.buttonDisabled,
            ]}
            onPress={handleContinue}
            disabled={phone.length !== 10 || isLoading}
          >
            <Text style={styles.buttonText}>{isLoading ? 'Checking...' : 'Continue'}</Text>
          </TouchableOpacity>

          <Text style={styles.signupText}>New rider? Verify OTP first, then signup will open automatically.</Text>
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
    backgroundColor: '#075DFF',
    borderRadius: 12,
    paddingVertical: 36,
    alignItems: 'center',
    marginBottom: 30,
  },
  headerTitle: {
    color: '#fff',
    fontSize: 42,
    fontWeight: '900',
    letterSpacing: 0,
  },
  headerSubtitle: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '800',
    letterSpacing: 4,
    textTransform: 'uppercase',
    marginTop: 6,
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
    backgroundColor: '#075DFF',
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 14,
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
  signupText: {
    color: '#666',
    fontSize: 13,
    textAlign: 'center',
    paddingVertical: 10,
  },
});

export default LoginScreen;
