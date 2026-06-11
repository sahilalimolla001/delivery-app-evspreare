import React from 'react';
import {
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { useAuthStore } from '../stores/authStore';

const ProfileScreen = ({ navigation }) => {
  const { user, logout } = useAuthStore();
  const displayName = user?.name || 'Rider Partner';
  const riderCode = user?.rider_code || user?.rider_id || 'Pending';
  const rating = user?.rating || '5.0';
  const isVerified = user?.approval_status === 'APPROVED';

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.header}>
          <Text style={styles.title}>Profile</Text>
        </View>

        <View style={styles.userCard}>
          <View style={styles.avatarContainer}>
            <Text style={styles.avatarText}>{displayName.slice(0, 1).toUpperCase()}</Text>
          </View>
          <View style={styles.userInfo}>
            <Text style={styles.userName}>{displayName}</Text>
            <View style={styles.ratingContainer}>
              <Text style={styles.rating}>Rating {rating}</Text>
              <Text style={[styles.verified, !isVerified && styles.pending]}>
                {isVerified ? 'Verified' : 'Pending'}
              </Text>
            </View>
            <Text style={styles.riderId}>Rider ID: {riderCode}</Text>
          </View>
        </View>

        <View style={styles.menuContainer}>
          <MenuItem label="Personal Info" />
          <MenuItem label="Vehicle Info" onPress={() => navigation.navigate('VehicleInfo')} />
          <MenuItem label="Documents" onPress={() => navigation.navigate('Documents')} />
          <MenuItem label="Bank Details" />
          <MenuItem label="Ratings & Reviews" />
          <MenuItem label="Help & Support" onPress={() => navigation.navigate('Support')} />
          <MenuItem label="Settings" onPress={() => navigation.navigate('Settings')} />
        </View>

        <TouchableOpacity style={styles.logoutButton} onPress={logout}>
          <Text style={styles.logoutText}>Log Out</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
};

const MenuItem = ({ label, onPress }) => (
  <TouchableOpacity style={styles.menuItem} onPress={onPress} disabled={!onPress}>
    <Text style={styles.menuLabel}>{label}</Text>
    <Text style={styles.menuArrow}>Next</Text>
  </TouchableOpacity>
);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  content: {
    flexGrow: 1,
    paddingHorizontal: 16,
    paddingVertical: 20,
  },
  header: {
    marginBottom: 24,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: '#000',
  },
  userCard: {
    backgroundColor: '#F5F5F5',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 20,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 24,
  },
  avatarContainer: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#1E5BA8',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  avatarText: {
    color: '#fff',
    fontSize: 26,
    fontWeight: '700',
  },
  userInfo: {
    flex: 1,
  },
  userName: {
    fontSize: 18,
    fontWeight: '700',
    color: '#000',
    marginBottom: 4,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  rating: {
    fontSize: 13,
    fontWeight: '600',
    color: '#1E5BA8',
    marginRight: 8,
  },
  verified: {
    fontSize: 13,
    fontWeight: '600',
    color: '#4CAF50',
  },
  pending: {
    color: '#F57C00',
  },
  riderId: {
    fontSize: 12,
    color: '#777',
  },
  menuContainer: {
    marginBottom: 24,
  },
  menuItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  menuLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#000',
  },
  menuArrow: {
    fontSize: 12,
    color: '#8E8E93',
  },
  logoutButton: {
    paddingVertical: 12,
    alignItems: 'center',
  },
  logoutText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#D32F2F',
  },
});

export default ProfileScreen;
