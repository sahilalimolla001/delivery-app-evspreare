import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
} from 'react-native';

const OrderDetailsScreen = ({ route, navigation }) => {
  const order = route?.params?.order || {
    id: '#DN1254876',
    status: 'Pending',
    pickupFrom: 'Daily Needs Store',
    pickupAddress: 'XYZ Building, 5th Main Rd',
    deliverTo: 'Rohit Sharma',
    deliverAddress: '123 ABC Colony, Near Park',
    items: [
      { name: 'Apple', qty: '1 kg', icon: '🍎' },
      { name: 'Milk', qty: '1 packet', icon: '🥛' },
      { name: 'Bread', qty: '1 loaf', icon: '🍞' },
      { name: 'Banana', qty: '6 pcs', icon: '🍌' },
    ],
    note: "Please ring the bell. Don't call.",
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.orderId}>{order.id}</Text>
          <View style={styles.statusBadge}>
            <Text style={styles.statusText}>{order.status}</Text>
          </View>
        </View>

        {/* Pickup Section */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionIcon}>📍</Text>
            <Text style={styles.sectionTitle}>Pickup From</Text>
          </View>
          <Text style={styles.storeName}>{order.pickupFrom}</Text>
          <Text style={styles.address}>{order.pickupAddress}</Text>
          <TouchableOpacity style={styles.callButton}>
            <Text style={styles.callIcon}>📞</Text>
            <Text style={styles.callText}>Call Store</Text>
          </TouchableOpacity>
        </View>

        {/* Delivery Section */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionIcon}>🏠</Text>
            <Text style={styles.sectionTitle}>Deliver To</Text>
          </View>
          <Text style={styles.customerName}>{order.deliverTo}</Text>
          <Text style={styles.address}>{order.deliverAddress}</Text>
          <TouchableOpacity style={styles.callButton}>
            <Text style={styles.callIcon}>📞</Text>
            <Text style={styles.callText}>Call Customer</Text>
          </TouchableOpacity>
        </View>

        {/* Items Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Order Items</Text>
          {order.items.map((item, index) => (
            <View key={index} style={styles.itemRow}>
              <View style={styles.itemContent}>
                <Text style={styles.itemIcon}>{item.icon}</Text>
                <View>
                  <Text style={styles.itemName}>{item.name}</Text>
                  <Text style={styles.itemQty}>{item.qty}</Text>
                </View>
              </View>
            </View>
          ))}
          {order.items.length > 3 && (
            <Text style={styles.moreItems}>+1 more item</Text>
          )}
        </View>

        {/* Special Instructions */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Special Instructions</Text>
          <View style={styles.noteBox}>
            <Text style={styles.noteText}>{order.note}</Text>
          </View>
        </View>

        {/* Action Button */}
        <TouchableOpacity style={styles.actionButton}>
          <Text style={styles.actionButtonText}>Order Picked Up</Text>
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
    paddingVertical: 20,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  orderId: {
    fontSize: 20,
    fontWeight: '700',
    color: '#000',
  },
  statusBadge: {
    backgroundColor: '#E3F2FD',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#1E5BA8',
  },
  section: {
    marginBottom: 20,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  sectionIcon: {
    fontSize: 20,
    marginRight: 8,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#000',
  },
  storeName: {
    fontSize: 15,
    fontWeight: '600',
    color: '#000',
    marginBottom: 4,
  },
  customerName: {
    fontSize: 15,
    fontWeight: '600',
    color: '#000',
    marginBottom: 4,
  },
  address: {
    fontSize: 13,
    color: '#666',
    marginBottom: 12,
  },
  callButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#E3F2FD',
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 8,
  },
  callIcon: {
    fontSize: 16,
    marginRight: 8,
  },
  callText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#1E5BA8',
  },
  itemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  itemContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  itemIcon: {
    fontSize: 24,
    marginRight: 12,
  },
  itemName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#000',
  },
  itemQty: {
    fontSize: 12,
    color: '#999',
  },
  moreItems: {
    fontSize: 12,
    color: '#1E5BA8',
    fontWeight: '600',
    marginTop: 8,
  },
  noteBox: {
    backgroundColor: '#FFF9C4',
    borderLeftWidth: 4,
    borderLeftColor: '#FBC02D',
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 4,
  },
  noteText: {
    fontSize: 13,
    color: '#666',
  },
  actionButton: {
    backgroundColor: '#1E5BA8',
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 20,
  },
  actionButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default OrderDetailsScreen;
