import React, { useEffect, useState } from 'react';
import {
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  View,
} from 'react-native';
import { riderApi } from '../services/api';

const DashboardScreen = () => {
  const [isOnline, setIsOnline] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [error, setError] = useState(null);
  const [summary, setSummary] = useState({
    completed: 0,
    totalEarnings: 0,
    orderCount: 0,
  });

  useEffect(() => {
    let mounted = true;
    Promise.all([
      riderApi.profile(),
      riderApi.earnings().catch(() => ({ data: { total: 0, transactions: [] } })),
      riderApi.orders().catch(() => ({ data: { orders: [] } })),
    ])
      .then(([profileResponse, earningsResponse, ordersResponse]) => {
        if (!mounted) return;
        const orders = ordersResponse.data?.orders || [];
        setIsOnline(Boolean(profileResponse.data?.online_status));
        setSummary({
          completed: orders.filter((order) => order.status === 'DELIVERED').length,
          totalEarnings: Number(earningsResponse.data?.total || 0),
          orderCount: orders.length,
        });
      })
      .catch(() => {
        if (mounted) setError('Unable to load rider status.');
      });
    return () => {
      mounted = false;
    };
  }, []);

  const handleOnlineChange = async (nextValue) => {
    setIsUpdating(true);
    setError(null);
    try {
      if (nextValue) {
        await riderApi.goOnline(0, 0);
      } else {
        await riderApi.goOffline();
      }
      setIsOnline(nextValue);
    } catch {
      setError('Could not update online status. Please try again.');
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.header}>
          <View>
            <Text style={styles.greeting}>You are {isOnline ? 'Online' : 'Offline'}</Text>
            <Text style={styles.subtitle}>
              {isOnline ? 'Admin can see you as available.' : 'Go online to receive orders.'}
            </Text>
          </View>
          <Switch
            value={isOnline}
            onValueChange={handleOnlineChange}
            disabled={isUpdating}
            trackColor={{ false: '#ddd', true: '#81C784' }}
            thumbColor={isOnline ? '#4CAF50' : '#f4f3f4'}
          />
        </View>

        {error ? <Text style={styles.errorText}>{error}</Text> : null}

        <View style={styles.earningsCard}>
          <View>
            <Text style={styles.earningsLabel}>Today's Earnings</Text>
            <Text style={styles.earningsAmount}>Rs {summary.totalEarnings.toFixed(2)}</Text>
            <Text style={styles.earningsSubtext}>{summary.orderCount} Orders Assigned</Text>
          </View>
          <Text style={styles.earningsIcon}>Pay</Text>
        </View>

        <View style={styles.metricsContainer}>
          <View style={styles.metricCard}>
            <Text style={styles.metricValue}>{String(summary.completed).padStart(2, '0')}</Text>
            <Text style={styles.metricLabel}>Completed</Text>
          </View>
          <View style={styles.metricCard}>
            <Text style={styles.metricValue}>{isOnline ? 'Live' : 'Off'}</Text>
            <Text style={styles.metricLabel}>Hours Online</Text>
          </View>
          <View style={styles.metricCard}>
            <Text style={styles.metricValue}>Rs 0</Text>
            <Text style={styles.metricLabel}>Incentive</Text>
          </View>
        </View>

        <Text style={styles.sectionTitle}>New Orders</Text>
        <View style={styles.emptyState}>
          <Text style={styles.emptyIcon}>Box</Text>
          <Text style={styles.emptyText}>No new orders at the moment</Text>
          <Text style={styles.emptySubtext}>{isOnline ? 'Waiting for assignment' : 'Go online to see available orders'}</Text>
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
    marginBottom: 18,
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
  errorText: {
    color: '#C62828',
    fontSize: 13,
    marginBottom: 12,
    paddingHorizontal: 12,
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
    fontSize: 18,
    color: '#fff',
    fontWeight: '800',
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
    color: '#1E5BA8',
    fontSize: 20,
    fontWeight: '800',
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
