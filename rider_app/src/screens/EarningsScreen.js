import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
} from 'react-native';

const EarningsScreen = () => {
  const [activeTab, setActiveTab] = useState('daily');

  const earnings = {
    daily: {
      total: '₹1,245.80',
      details: [
        { label: 'Order Earnings', amount: '₹965.80' },
        { label: 'Incentives', amount: '₹180.00' },
        { label: 'Tips', amount: '₹100.00' },
      ],
      transactions: [
        { id: '#DN1254876', amount: '₹125.50' },
        { id: '#DN1254875', amount: '₹98.30' },
        { id: '#DN1254874', amount: '₹145.20' },
      ],
    },
    weekly: {
      total: '₹8,560.40',
      details: [
        { label: 'Order Earnings', amount: '₹6,750.40' },
        { label: 'Incentives', amount: '₹1,260.00' },
        { label: 'Tips', amount: '₹550.00' },
      ],
      transactions: [],
    },
    monthly: {
      total: '₹35,240.80',
      details: [
        { label: 'Order Earnings', amount: '₹27,840.80' },
        { label: 'Incentives', amount: '₹5,400.00' },
        { label: 'Tips', amount: '₹2,000.00' },
      ],
      transactions: [],
    },
  };

  const data = earnings[activeTab];

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>Earnings</Text>
        </View>

        {/* Tabs */}
        <View style={styles.tabsContainer}>
          {['daily', 'weekly', 'monthly'].map((tab) => (
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

        {/* Total Earnings */}
        <View style={styles.totalCard}>
          <Text style={styles.totalLabel}>Total Earnings</Text>
          <Text style={styles.totalAmount}>{data.total}</Text>
        </View>

        {/* Breakdown */}
        <Text style={styles.sectionTitle}>Breakdown</Text>
        {data.details.map((detail, index) => (
          <View key={index} style={styles.breakdownRow}>
            <Text style={styles.breakdownLabel}>{detail.label}</Text>
            <Text style={styles.breakdownAmount}>{detail.amount}</Text>
          </View>
        ))}

        {/* Transactions */}
        {data.transactions.length > 0 && (
          <>
            <Text style={styles.sectionTitle}>Recent Transactions</Text>
            {data.transactions.map((txn, index) => (
              <View key={index} style={styles.transactionRow}>
                <Text style={styles.transactionId}>{txn.id}</Text>
                <Text style={styles.transactionAmount}>{txn.amount}</Text>
              </View>
            ))}
          </>
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
  totalCard: {
    backgroundColor: '#F5F5F5',
    borderRadius: 12,
    paddingVertical: 20,
    paddingHorizontal: 16,
    marginBottom: 24,
  },
  totalLabel: {
    fontSize: 13,
    color: '#666',
    marginBottom: 8,
  },
  totalAmount: {
    fontSize: 32,
    fontWeight: '700',
    color: '#1E5BA8',
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#000',
    marginBottom: 12,
  },
  breakdownRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  breakdownLabel: {
    fontSize: 14,
    color: '#666',
  },
  breakdownAmount: {
    fontSize: 14,
    fontWeight: '600',
    color: '#000',
  },
  transactionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  transactionId: {
    fontSize: 13,
    fontWeight: '600',
    color: '#1E5BA8',
  },
  transactionAmount: {
    fontSize: 13,
    fontWeight: '600',
    color: '#000',
  },
});

export default EarningsScreen;
