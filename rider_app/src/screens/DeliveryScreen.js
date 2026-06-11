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

const DeliveryScreen = ({ route, navigation }) => {
  const [isNavigating, setIsNavigating] = useState(false);

  const customer = route?.params?.customer || {
    name: 'Rohit Sharma',
    distance: '2.6 km',
    address: '123 ABC Colony, Near Park, Downtown',
    phone: '+91-9876543210',
    instructions: "Please ring the bell. Don't call.",
  };

  const handleNavigate = () => {
    setIsNavigating(true);
    // In production: use react-native-maps
    navigation.navigate('MapNavigation', { customer });
  };

  const handleCallCustomer = () => {
    Linking.openURL(`tel:${customer.phone}`);
  };

  const handleChatCustomer = () => {
    // In production: integrate with chat service (WhatsApp, in-app chat)
    Linking.openURL(`https://wa.me/${customer.phone.replace(/\D/g, '')}`);
  };

  const handleDelivered = () => {
    // Mark order as delivered
    alert('Order marked as delivered! Thank you! 🎉');
    navigation.reset({
      index: 0,
      routes: [{ name: 'DashboardHome' }],
    });
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Text style={styles.backButton}>← Back</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Go to Customer</Text>
          <View style={{ width: 40 }} />
        </View>

        {/* Customer Card */}
        <View style={styles.customerCard}>
          <View style={styles.customerHeader}>
            <View style={styles.avatarContainer}>
              <Text style={styles.avatar}>👤</Text>
            </View>
            <View style={styles.customerInfo}>
              <Text style={styles.customerName}>{customer.name}</Text>
              <View style={styles.distanceContainer}>
                <Text style={styles.distance}>{customer.distance}</Text>
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

        {/* Customer Address */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Delivery Address</Text>
          <View style={styles.addressBox}>
            <Text style={styles.addressIcon}>📍</Text>
            <Text style={styles.addressText}>{customer.address}</Text>
          </View>
        </View>

        {/* Contact Options */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Contact Customer</Text>
          <View style={styles.contactGrid}>
            <TouchableOpacity
              style={styles.contactButton}
              onPress={handleCallCustomer}
            >
              <Text style={styles.contactIcon}>📞</Text>
              <Text style={styles.contactLabel}>Call</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.contactButton}
              onPress={handleChatCustomer}
            >
              <Text style={styles.contactIcon}>💬</Text>
              <Text style={styles.contactLabel}>Chat</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Delivery Instructions */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Delivery Instructions</Text>
          <View style={styles.instructionBox}>
            <Text style={styles.instructionIcon}>📌</Text>
            <Text style={styles.instructionText}>{customer.instructions}</Text>
          </View>
        </View>

        {/* Additional Notes */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>What to Do?</Text>
          <View style={styles.noteBox}>
            <Text style={styles.noteItem}>
              ✓ Reach the customer's location
            </Text>
            <Text style={styles.noteItem}>
              ✓ Follow the delivery instructions
            </Text>
            <Text style={styles.noteItem}>
              ✓ Hand over the order to the customer
            </Text>
            <Text style={styles.noteItem}>
              ✓ Click "Order Delivered" to confirm
            </Text>
          </View>
        </View>

        {/* Delivery Button */}
        <TouchableOpacity
          style={styles.deliveryButton}
          onPress={handleDelivered}
        >
          <Text style={styles.buttonText}>Order Delivered</Text>
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
  customerCard: {
    backgroundColor: '#F9F9F9',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 16,
    marginBottom: 24,
    borderLeftWidth: 4,
    borderLeftColor: '#1E5BA8',
  },
  customerHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  avatarContainer: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#1E5BA8',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  avatar: {
    fontSize: 24,
  },
  customerInfo: {
    flex: 1,
  },
  customerName: {
    fontSize: 16,
    fontWeight: '700',
    color: '#000',
    marginBottom: 4,
  },
  distanceContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  distance: {
    fontSize: 12,
    fontWeight: '600',
    color: '#1E5BA8',
  },
  navigateButton: {
    backgroundColor: '#1E5BA8',
    paddingHorizontal: 12,
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
  contactGrid: {
    flexDirection: 'row',
    gap: 12,
  },
  contactButton: {
    flex: 1,
    backgroundColor: '#E3F2FD',
    borderRadius: 8,
    paddingVertical: 12,
    alignItems: 'center',
  },
  contactIcon: {
    fontSize: 20,
    marginBottom: 4,
  },
  contactLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#1E5BA8',
  },
  instructionBox: {
    backgroundColor: '#FFF9C4',
    borderLeftWidth: 4,
    borderLeftColor: '#FBC02D',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 12,
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  instructionIcon: {
    fontSize: 18,
    marginRight: 12,
  },
  instructionText: {
    flex: 1,
    fontSize: 13,
    color: '#666',
    lineHeight: 18,
    fontWeight: '500',
  },
  noteBox: {
    backgroundColor: '#F5F5F5',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 12,
  },
  noteItem: {
    fontSize: 13,
    color: '#666',
    marginBottom: 8,
    lineHeight: 18,
  },
  deliveryButton: {
    backgroundColor: '#4CAF50',
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

export default DeliveryScreen;
