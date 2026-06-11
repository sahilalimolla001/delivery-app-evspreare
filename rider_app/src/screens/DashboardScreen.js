import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  Switch,
} from 'react-native';

const DashboardScreen = ({ navigation }) => {
  const [isOnline, setIsOnline] = useState(false);

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>
        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={styles.greeting}>You are {isOnline ? 'Online' : 'Offline'}</Text>
            <Text style={styles.subtitle}>Ready for deliveries?</Text>
          </View>
          <Switch
            value={isOnline}
            onValueChange={setIsOnline}
            trackColor={{ false: '#ddd', true: '#81C784' }}
            thumbColor={isOnline ? '#4CAF50' : '#f4f3f4'}
          />
        </View>

        {/* Earnings Card */}
        <View style={styles.earningsCard}>
          <View>
            <Text style={styles.earningsLabel}>Today's Earnings</Text>
            <Text style={styles.earningsAmount}>₹1,245.80</Text>
            <Text style={styles.earningsSubtext}>6 Orders Completed</Text>
          </View>
          <Text style={styles.earningsIcon}>💰</Text>
        </View>

        {/* Metrics */}
        <View style={styles.metricsContainer}>
          <View style={styles.metricCard}>
            <Text style={styles.metricValue}>06</Text>
            <Text style={styles.metricLabel}>Completed</Text>
          </View>
          <View style={styles.metricCard}>
            <Text style={styles.metricValue}>01:45</Text>
            <Text style={styles.metricLabel}>Hours Online</Text>
          </View>
          <View style={styles.metricCard}>
            <Text style={styles.metricValue}>₹180</Text>
            <Text style={styles.metricLabel}>Incentive</Text>
          </View>
        </View>

        {/* New Order Section */}
        <Text style={styles.sectionTitle}>New Orders</Text>
        <View style={styles.emptyState}>
          <Text style={styles.emptyIcon}>📦</Text>
          <Text style={styles.emptyText}>No new orders at the moment</Text>
          <Text style={styles.emptySubtext}>Go online to see available orders</Text>
        </View>
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
    paddingHorizontal: 12,
  },
  greeting: {
    fontSize: 18,
    fontWeight: '700',
    color: '#000',
  },
  subtitle: {
    fontSize: 13,
    color: '#666',
    marginTop: 4,
  },
  earningsCard: {
    backgroundColor: '#1E5BA8',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  earningsLabel: {
    fontSize: 13,
    color: '#A8D5FF',
    marginBottom: 8,
  },
  earningsAmount: {
    fontSize: 28,
    fontWeight: '700',
    color: '#fff',
    marginBottom: 4,
  },
  earningsSubtext: {
    fontSize: 12,
    color: '#B8D5E8',
  },
  earningsIcon: {
    fontSize: 48,
  },
  metricsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 24,
  },
  metricCard: {
    flex: 1,
    backgroundColor: '#F5F5F5',
    borderRadius: 12,
    paddingVertical: 16,
    paddingHorizontal: 12,
    alignItems: 'center',
    marginHorizontal: 6,
  },
  metricValue: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1E5BA8',
    marginBottom: 4,
  },
  metricLabel: {
    fontSize: 11,
    color: '#666',
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#000',
    marginBottom: 12,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  emptyIcon: {
    fontSize: 60,
    marginBottom: 12,
  },
  emptyText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000',
    marginBottom: 4,
  },
  emptySubtext: {
    fontSize: 13,
    color: '#999',
  },
});

export default DashboardScreen;
