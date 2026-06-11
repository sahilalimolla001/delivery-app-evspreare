import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  Linking,
} from 'react-native';

const PickupScreen = ({ route, navigation }) => {
  const [isNavigating, setIsNavigating] = useState(false);

  const store = route?.params?.store || {
    name: 'Daily Needs Store',
    distance: '0.8 km',
    address: 'XYZ Building, 5th Main Rd, Downtown',
    phone: '+91-9876543210',
    hours: '9:00 AM - 11:00 PM',
  };

  const handleNavigate = () => {
    setIsNavigating(true);
    // In production: use react-native-maps to show navigation
    navigation.navigate('MapNavigation', { store });
  };

  const handleCallStore = () => {
    Linking.openURL(`tel:${store.phone}`);
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Text style={styles.backButton}>← Back</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Go to Store</Text>
          <View style={{ width: 40 }} />
        </View>

        {/* Store Card */}
        <View style={styles.storeCard}>
          <View style={styles.storeHeader}>
            <View>
              <Text style={styles.storeName}>{store.name}</Text>
              <View style={styles.distanceContainer}>
                <Text style={styles.distance}>{store.distance}</Text>
                <Text style={styles.status}>• Open Now</Text>
              </View>
            </View>
            <TouchableOpacity
              style={styles.navigateButton}
              onPress={handleNavigate}
            >
              <Text style={styles.navigateText}>Navigate</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Address Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Store Address</Text>
          <View style={styles.addressBox}>
            <Text style={styles.addressIcon}>📍</Text>
            <Text style={styles.addressText}>{store.address}</Text>
          </View>
        </View>

        {/* Store Hours */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Store Hours</Text>
          <View style={styles.hoursBox}>
            <Text style={styles.hoursIcon}>🕐</Text>
            <Text style={styles.hoursText}>{store.hours}</Text>
          </View>
        </View>

        {/* Instructions */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Instructions</Text>
          <View style={styles.instructionBox}>
            <Text style={styles.instructionText}>
              📌 Go to the store and pick up the order.
            </Text>
            <Text style={styles.instructionText} style={{ marginTop: 8 }}>
              🔔 Contact the store staff and provide your order ID.
            </Text>
            <Text style={styles.instructionText} style={{ marginTop: 8 }}>
              ✅ Confirm when all items are collected and packed.
            </Text>
          </View>
        </View>

        {/* Call Store Button */}
        <TouchableOpacity
          style={styles.callStoreButton}
          onPress={handleCallStore}
        >
          <Text style={styles.callIcon}>📞</Text>
          <Text style={styles.callText}>Call Store</Text>
        </TouchableOpacity>

        {/* Order Picked Up Button */}
        <TouchableOpacity
          style={styles.pickupButton}
          onPress={() => {
            // Navigate to delivery screen
            navigation.navigate('Delivery', {
              order: route?.params?.order,
            });
          }}
        >
          <Text style={styles.buttonText}>Order Picked Up</Text>
        </TouchableOpacity>
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
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  backButton: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1E5BA8',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#000',
  },
  storeCard: {
    backgroundColor: '#F9F9F9',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 16,
    marginBottom: 24,
    borderLeftWidth: 4,
    borderLeftColor: '#1E5BA8',
  },
  storeHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  storeName: {
    fontSize: 18,
    fontWeight: '700',
    color: '#000',
    marginBottom: 8,
  },
  distanceContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  distance: {
    fontSize: 13,
    fontWeight: '600',
    color: '#1E5BA8',
  },
  status: {
    fontSize: 13,
    color: '#4CAF50',
    fontWeight: '600',
  },
  navigateButton: {
    backgroundColor: '#1E5BA8',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 6,
  },
  navigateText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  },
  section: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#000',
    marginBottom: 12,
  },
  addressBox: {
    backgroundColor: '#F5F5F5',
    borderLeftWidth: 4,
    borderLeftColor: '#1E5BA8',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 12,
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  addressIcon: {
    fontSize: 20,
    marginRight: 12,
  },
  addressText: {
    flex: 1,
    fontSize: 13,
    color: '#666',
    lineHeight: 18,
  },
  hoursBox: {
    backgroundColor: '#F5F5F5',
    borderLeftWidth: 4,
    borderLeftColor: '#1E5BA8',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 12,
    flexDirection: 'row',
    alignItems: 'center',
  },
  hoursIcon: {
    fontSize: 20,
    marginRight: 12,
  },
  hoursText: {
    fontSize: 13,
    color: '#666',
    fontWeight: '500',
  },
  instructionBox: {
    backgroundColor: '#FFF9C4',
    borderLeftWidth: 4,
    borderLeftColor: '#FBC02D',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 12,
  },
  instructionText: {
    fontSize: 13,
    color: '#666',
    lineHeight: 18,
  },
  callStoreButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#E3F2FD',
    paddingVertical: 12,
    borderRadius: 8,
    marginBottom: 12,
  },
  callIcon: {
    fontSize: 18,
    marginRight: 8,
  },
  callText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1E5BA8',
  },
  pickupButton: {
    backgroundColor: '#1E5BA8',
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 20,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default PickupScreen;
