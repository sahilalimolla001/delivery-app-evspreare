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

const profileCards = [
  { label: 'Vehicle', detail: 'Registration and fitness', target: 'VehicleInfo' },
  { label: 'Documents', detail: 'KYC and approvals', target: 'Documents' },
  { label: 'Settings', detail: 'App preferences', target: 'Settings' },
  { label: 'Support', detail: 'Help and disputes', target: 'Support' },
  { label: 'Terms & Conditions', detail: 'Platform rules', policy: 'terms' },
  { label: 'Privacy Policy', detail: 'Data and rights', policy: 'privacy' },
  { label: 'User Agreement', detail: 'Rider engagement', policy: 'agreement' },
  { label: 'Payment Policy', detail: 'Payouts and COD', policy: 'payments' },
  { label: 'Grievance & Compliance', detail: 'Indian law contacts', policy: 'grievance' },
  { label: 'Code of Conduct', detail: 'Safety and service', policy: 'conduct' },
];

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

        <View style={styles.cardGrid}>
          {profileCards.map((card) => (
            <ProfileCard
              key={card.label}
              label={card.label}
              detail={card.detail}
              onPress={() => {
                if (card.target) navigation.navigate(card.target);
                if (card.policy) navigation.navigate('Policy', { type: card.policy });
              }}
            />
          ))}
        </View>

        <TouchableOpacity style={styles.logoutButton} onPress={logout}>
          <Text style={styles.logoutText}>Log Out</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
};

const ProfileCard = ({ label, detail, onPress }) => (
  <TouchableOpacity style={styles.profileCard} onPress={onPress}>
    <View style={styles.cardIcon}>
      <Text style={styles.cardIconText}>{label.slice(0, 1)}</Text>
    </View>
    <Text style={styles.cardTitle}>{label}</Text>
    <Text style={styles.cardDetail}>{detail}</Text>
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
  cardGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 24,
  },
  profileCard: {
    width: '48%',
    minHeight: 118,
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#E5EAF2',
    borderRadius: 12,
    padding: 12,
    marginBottom: 12,
  },
  cardIcon: {
    width: 34,
    height: 34,
    borderRadius: 10,
    backgroundColor: '#EAF2FF',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  cardIconText: {
    color: '#1E5BA8',
    fontSize: 13,
    fontWeight: '800',
  },
  cardTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#000',
    marginBottom: 4,
  },
  cardDetail: {
    fontSize: 12,
    color: '#8E8E93',
    lineHeight: 16,
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
