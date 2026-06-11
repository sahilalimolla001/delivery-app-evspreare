import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  ScrollView,
  TextInput,
} from 'react-native';
import { useAuthStore } from '../stores/authStore';

const OTPScreen = ({ navigation, route }) => {
  const { phone } = route.params;
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [timer, setTimer] = useState(30);
  const inputs = React.useRef([]);
  const { verifyOtp, sendOtp, isLoading, error, clearError } = useAuthStore();

  useEffect(() => {
    const interval = setInterval(() => {
      setTimer((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  const handleOtpInput = (index, value) => {
    const digits = value.replace(/\D/g, '');
    if (digits.length > 1) {
      const nextOtp = ['', '', '', '', '', ''];
      digits.slice(0, 6).split('').forEach((digit, nextIndex) => {
        nextOtp[nextIndex] = digit;
      });
      setOtp(nextOtp);
      inputs.current[Math.min(digits.length, 6) - 1]?.focus();
      clearError();
      return;
    }

    const digit = digits.slice(-1);
    const newOtp = [...otp];
    newOtp[index] = digit;
    setOtp(newOtp);
    clearError();
    if (digit && index < inputs.current.length - 1) {
      inputs.current[index + 1]?.focus();
    }
  };

  const handleKeyPress = (index, event) => {
    if (event.nativeEvent.key === 'Backspace' && !otp[index] && index > 0) {
      inputs.current[index - 1]?.focus();
    }
  };

  const handleVerify = async () => {
    const otpCode = otp.join('');
    if (otpCode.length === 6) {
      try {
        clearError();
        await verifyOtp(phone, otpCode);
      } catch {
        // Store already exposes a user-safe error message.
      }
    }
  };

  const handleResend = async () => {
    try {
      clearError();
      await sendOtp(phone);
      setOtp(['', '', '', '', '', '']);
      setTimer(30);
      inputs.current[0]?.focus();
    } catch {
      // Store already exposes a user-safe error message.
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>
        {/* Back Button */}
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.backButton}
        >
          <Text style={styles.backText}>← Back</Text>
        </TouchableOpacity>

        {/* Title */}
        <Text style={styles.title}>Verify OTP</Text>
        <Text style={styles.subtitle}>
          We've sent a 6 digit code to {phone}
        </Text>

        {/* OTP Input Fields */}
        <View style={styles.otpContainer}>
          {otp.map((digit, index) => (
            <View key={index} style={styles.otpInputWrapper}>
              <TextInput
                ref={(input) => {
                  inputs.current[index] = input;
                }}
                style={styles.otpInput}
                keyboardType="number-pad"
                maxLength={1}
                value={digit}
                onChangeText={(value) => handleOtpInput(index, value)}
                onKeyPress={(event) => handleKeyPress(index, event)}
                textAlign="center"
                autoFocus={index === 0}
              />
            </View>
          ))}
        </View>

        {/* Timer */}
        <Text style={styles.timerText}>
          {timer > 0
            ? `Resend OTP in 00:${timer.toString().padStart(2, '0')}`
            : 'OTP expired'}
        </Text>

        {error ? <Text style={styles.errorText}>{error}</Text> : null}

        {/* Verify Button */}
        <TouchableOpacity
          style={[
            styles.verifyButton,
            otp.join('').length !== 6 && styles.buttonDisabled,
          ]}
          onPress={handleVerify}
          disabled={otp.join('').length !== 6 || isLoading}
        >
          <Text style={styles.buttonText}>
            {isLoading ? 'Verifying...' : 'Verify OTP'}
          </Text>
        </TouchableOpacity>

        {/* Resend Option */}
        {timer === 0 && (
          <TouchableOpacity onPress={handleResend} disabled={isLoading}>
            <Text style={styles.resendText}>
              Didn't receive? <Text style={styles.resendLink}>Resend OTP</Text>
            </Text>
          </TouchableOpacity>
        )}
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
  backButton: {
    marginBottom: 24,
  },
  backText: {
    color: '#1E5BA8',
    fontSize: 14,
    fontWeight: '600',
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
    marginBottom: 32,
  },
  otpContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 24,
  },
  otpInputWrapper: {
    width: '14%',
    aspectRatio: 1,
    borderRadius: 8,
    backgroundColor: '#F5F5F5',
    borderWidth: 2,
    borderColor: '#DDD',
    alignItems: 'center',
    justifyContent: 'center',
  },
  otpInput: {
    fontSize: 24,
    fontWeight: '700',
    color: '#000',
  },
  timerText: {
    textAlign: 'center',
    color: '#999',
    fontSize: 12,
    marginBottom: 24,
  },
  errorText: {
    color: '#C62828',
    fontSize: 13,
    textAlign: 'center',
    marginBottom: 12,
  },
  verifyButton: {
    backgroundColor: '#1E5BA8',
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: 'center',
  },
  buttonDisabled: {
    backgroundColor: '#B0BFC9',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  resendText: {
    textAlign: 'center',
    color: '#666',
    fontSize: 12,
    marginTop: 16,
  },
  resendLink: {
    color: '#1E5BA8',
    fontWeight: '600',
  },
});

export default OTPScreen;
