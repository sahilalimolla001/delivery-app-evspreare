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

const SignupScreen = ({ navigation, route }) => {
  const initialPhone = String(route.params?.phone || '').replace(/\D/g, '').slice(-10);
  const [name, setName] = useState('');
  const [phone, setPhone] = useState(initialPhone);
  const [email, setEmail] = useState('');
  const [vehicleNumber, setVehicleNumber] = useState('');
  const { signupRider, isLoading, error, clearError } = useAuthStore();

  const isValid = name.trim().length >= 2 && phone.length === 10 && vehicleNumber.trim().length >= 4;

  const handleSignup = async () => {
    if (!isValid || isLoading) return;
    try {
      clearError();
      const normalizedPhone = await signupRider({
        name: name.trim(),
        phone,
        email: email.trim(),
        vehicleNumber: vehicleNumber.trim().toUpperCase(),
      });
      navigation.navigate('OTP', { phone: normalizedPhone, fromSignup: true });
    } catch {
      // Store already exposes a user-safe error message.
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Text style={styles.backText}>Back</Text>
        </TouchableOpacity>

        <Text style={styles.title}>Rider Signup</Text>
        <Text style={styles.subtitle}>
          Create your delivery partner profile. Your account will remain pending until verification is approved.
        </Text>

        <Field
          label="Full name"
          value={name}
          onChangeText={(value) => {
            clearError();
            setName(value);
          }}
          placeholder="Enter rider name"
        />

        <Text style={styles.label}>Mobile number</Text>
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
          />
        </View>

        <Field
          label="Email"
          value={email}
          onChangeText={(value) => {
            clearError();
            setEmail(value);
          }}
          placeholder="Optional email"
          keyboardType="email-address"
          autoCapitalize="none"
        />

        <Field
          label="Vehicle number"
          value={vehicleNumber}
          onChangeText={(value) => {
            clearError();
            setVehicleNumber(value.toUpperCase());
          }}
          placeholder="Example: DL01AB1234"
          autoCapitalize="characters"
        />

        {error ? <Text style={styles.errorText}>{error}</Text> : null}

        <TouchableOpacity
          style={[styles.submitButton, !isValid && styles.buttonDisabled]}
          onPress={handleSignup}
          disabled={!isValid || isLoading}
        >
          <Text style={styles.buttonText}>{isLoading ? 'Creating...' : 'Submit for verification'}</Text>
        </TouchableOpacity>

        <TouchableOpacity onPress={() => navigation.navigate('Login')} style={styles.loginLink}>
          <Text style={styles.loginText}>Already signed up? Login</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
};

const Field = ({ label, ...props }) => (
  <View style={styles.field}>
    <Text style={styles.label}>{label}</Text>
    <TextInput style={styles.input} placeholderTextColor="#999" {...props} />
  </View>
);

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
  backButton: {
    marginBottom: 24,
  },
  backText: {
    color: '#075DFF',
    fontSize: 14,
    fontWeight: '700',
  },
  title: {
    fontSize: 28,
    fontWeight: '800',
    color: '#000',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
    marginBottom: 24,
  },
  field: {
    marginBottom: 16,
  },
  label: {
    color: '#111',
    fontSize: 13,
    fontWeight: '700',
    marginBottom: 8,
  },
  input: {
    backgroundColor: '#F5F5F5',
    borderRadius: 8,
    color: '#000',
    fontSize: 14,
    paddingHorizontal: 14,
    paddingVertical: 15,
  },
  phoneInputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
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
    fontWeight: '700',
    color: '#000',
  },
  phoneInput: {
    flex: 1,
    paddingVertical: 15,
    paddingHorizontal: 12,
    fontSize: 14,
    color: '#000',
  },
  errorText: {
    color: '#C62828',
    fontSize: 13,
    marginBottom: 12,
  },
  submitButton: {
    backgroundColor: '#075DFF',
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 6,
  },
  buttonDisabled: {
    backgroundColor: '#B0BFC9',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
  },
  loginLink: {
    alignItems: 'center',
    paddingVertical: 18,
  },
  loginText: {
    color: '#075DFF',
    fontSize: 13,
    fontWeight: '700',
  },
});

export default SignupScreen;
