import React, { useEffect, useState } from 'react';
import {
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { riderApi } from '../services/api';

const OrderHistoryScreen = () => {
  const [orders, setOrders] = useState([]);
  const [error, setError] = useState(null);

  useEffect(() => {
    riderApi.orders()
      .then((response) => setOrders(response.data?.orders || []))
      .catch(() => setError('Unable to load orders.'));
  }, []);

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.header}>
          <Text style={styles.title}>My Orders</Text>
        </View>

        {error ? <Text style={styles.errorText}>{error}</Text> : null}

        {orders.length ? orders.map((order) => (
          <View key={order.id} style={styles.orderCard}>
            <View style={styles.orderHeader}>
              <Text style={styles.orderId}>{order.public_id || order.id}</Text>
              <View style={styles.statusBadge}>
                <Text style={styles.statusText}>{order.status}</Text>
              </View>
            </View>
            <View style={styles.orderDetails}>
              <Text style={styles.dateTime}>{order.created_at || '-'}</Text>
              <Text style={styles.amount}>Rs {Number(order.total_payout || 0).toFixed(2)}</Text>
            </View>
          </View>
        )) : (
          <View style={styles.emptyState}>
            <Text style={styles.emptyText}>No orders yet</Text>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  content: { flexGrow: 1, paddingHorizontal: 16, paddingVertical: 20 },
  header: { marginBottom: 24 },
  title: { fontSize: 28, fontWeight: '700', color: '#000' },
  errorText: { color: '#C62828', fontSize: 13, marginBottom: 12 },
  orderCard: { backgroundColor: '#F9F9F9', borderRadius: 12, paddingHorizontal: 16, paddingVertical: 16, marginBottom: 12, borderLeftWidth: 4, borderLeftColor: '#1E5BA8' },
  orderHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  orderId: { fontSize: 14, fontWeight: '700', color: '#1E5BA8' },
  statusBadge: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 20, backgroundColor: '#E8F5E9' },
  statusText: { fontSize: 12, fontWeight: '600', color: '#2E7D32' },
  orderDetails: { flexDirection: 'row', justifyContent: 'space-between' },
  dateTime: { fontSize: 12, color: '#999' },
  amount: { fontSize: 14, fontWeight: '600', color: '#000' },
  emptyState: { minHeight: 140, alignItems: 'center', justifyContent: 'center', backgroundColor: '#F9F9F9', borderRadius: 12 },
  emptyText: { color: '#666', fontSize: 14, fontWeight: '600' },
});

export default OrderHistoryScreen;
