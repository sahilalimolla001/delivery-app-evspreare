import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
} from 'react-native';

const OrderHistoryScreen = () => {
  const [activeTab, setActiveTab] = useState('completed');

  const orders = {
    completed: [
      {
        id: '#DN1254876',
        status: 'Delivered',
        date: '10 Jun, 2:45 PM',
        amount: '₹125.50',
      },
      {
        id: '#DN1254875',
        status: 'Delivered',
        date: '10 Jun, 1:30 PM',
        amount: '₹98.30',
      },
      {
        id: '#DN1254874',
        status: 'Delivered',
        date: '10 Jun, 12:15 PM',
        amount: '₹145.20',
      },
    ],
    cancelled: [
      {
        id: '#DN1254873',
        status: 'Cancelled',
        date: '10 Jun, 11:00 AM',
        amount: '-₹50.00',
      },
    ],
  };

  const ordersList = orders[activeTab];

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>My Orders</Text>
        </View>

        {/* Tabs */}
        <View style={styles.tabsContainer}>
          {['completed', 'cancelled'].map((tab) => (
            <TouchableOpacity
              key={tab}
              onPress={() => setActiveTab(tab)}
              style={[styles.tab, activeTab === tab && styles.activeTab]}
            >
              <Text
                style={[
                  styles.tabText,
                  activeTab === tab && styles.activeTabText,
                ]}
              >
                {tab.charAt(0).toUpperCase() + tab.slice(1)}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Orders List */}
        {ordersList.map((order, index) => (
          <View key={index} style={styles.orderCard}>
            <View style={styles.orderHeader}>
              <Text style={styles.orderId}>{order.id}</Text>
              <View
                style={[
                  styles.statusBadge,
                  order.status === 'Delivered'
                    ? styles.deliveredBadge
                    : styles.cancelledBadge,
                ]}
              >
                <Text
                  style={[
                    styles.statusText,
                    order.status === 'Delivered'
                      ? styles.deliveredText
                      : styles.cancelledText,
                  ]}
                >
                  {order.status}
                </Text>
              </View>
            </View>
            <View style={styles.orderDetails}>
              <Text style={styles.dateTime}>{order.date}</Text>
              <Text style={styles.amount}>{order.amount}</Text>
            </View>
          </View>
        ))}
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
    marginBottom: 24,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: '#000',
  },
  tabsContainer: {
    flexDirection: 'row',
    marginBottom: 24,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  tab: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
  },
  activeTab: {
    borderBottomWidth: 3,
    borderBottomColor: '#1E5BA8',
  },
  tabText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#999',
  },
  activeTabText: {
    color: '#1E5BA8',
  },
  orderCard: {
    backgroundColor: '#F9F9F9',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 16,
    marginBottom: 12,
    borderLeftWidth: 4,
    borderLeftColor: '#1E5BA8',
  },
  orderHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  orderId: {
    fontSize: 14,
    fontWeight: '700',
    color: '#1E5BA8',
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  deliveredBadge: {
    backgroundColor: '#E8F5E9',
  },
  cancelledBadge: {
    backgroundColor: '#FFEBEE',
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
  },
  deliveredText: {
    color: '#2E7D32',
  },
  cancelledText: {
    color: '#C62828',
  },
  orderDetails: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  dateTime: {
    fontSize: 12,
    color: '#999',
  },
  amount: {
    fontSize: 14,
    fontWeight: '600',
    color: '#000',
  },
});

export default OrderHistoryScreen;
