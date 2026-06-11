import React from 'react';
import {
  SafeAreaView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { useAuthStore } from '../stores/authStore';

const PendingApprovalScreen = () => {
  const {
    pendingPhone,
    clearPendingApproval,
    checkPendingApprovalStatus,
    isLoading,
    error,
    clearError,
  } = useAuthStore();

  const handleUseAnother = async () => {
    clearError();
    await clearPendingApproval();
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <View style={styles.badge}>
          <Text style={styles.badgeText}>Pending</Text>
        </View>
        <Text style={styles.title}>Waiting for approval</Text>
        <Text style={styles.message}>
          Your rider registration is submitted. Admin approval is required before you can use the app.
        </Text>
        <Text style={styles.phone}>{pendingPhone || ''}</Text>
        {error ? <Text style={styles.statusText}>{error}</Text> : null}
        <TouchableOpacity style={styles.primaryButton} onPress={checkPendingApprovalStatus} disabled={isLoading}>
          <Text style={styles.primaryText}>{isLoading ? 'Checking...' : 'Check approval status'}</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.secondaryButton} onPress={handleUseAnother}>
          <Text style={styles.secondaryText}>Use another number</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  content: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 28,
  },
  badge: {
    backgroundColor: '#FFF4D6',
    borderRadius: 999,
    paddingHorizontal: 16,
    paddingVertical: 8,
    marginBottom: 18,
  },
  badgeText: {
    color: '#B54708',
    fontSize: 13,
    fontWeight: '800',
  },
  title: {
    color: '#111827',
    fontSize: 28,
    fontWeight: '800',
    textAlign: 'center',
    marginBottom: 12,
  },
  message: {
    color: '#667085',
    fontSize: 15,
    lineHeight: 22,
    textAlign: 'center',
    marginBottom: 18,
  },
  phone: {
    color: '#075DFF',
    fontSize: 15,
    fontWeight: '800',
    marginBottom: 18,
  },
  statusText: {
    color: '#B54708',
    fontSize: 13,
    fontWeight: '700',
    textAlign: 'center',
    marginBottom: 14,
  },
  primaryButton: {
    backgroundColor: '#075DFF',
    borderRadius: 8,
    paddingHorizontal: 18,
    paddingVertical: 12,
    marginBottom: 12,
  },
  primaryText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '800',
  },
  secondaryButton: {
    borderWidth: 1,
    borderColor: '#D0D5DD',
    borderRadius: 8,
    paddingHorizontal: 18,
    paddingVertical: 12,
  },
  secondaryText: {
    color: '#344054',
    fontSize: 14,
    fontWeight: '700',
  },
});

export default PendingApprovalScreen;
