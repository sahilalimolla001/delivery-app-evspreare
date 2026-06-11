import React, { useEffect, useState } from 'react';
import {
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { riderApi } from '../services/api';

const EarningsScreen = () => {
  const [total, setTotal] = useState(0);
  const [transactions, setTransactions] = useState([]);
  const [error, setError] = useState(null);

  useEffect(() => {
    riderApi.earnings()
      .then((response) => {
        setTotal(Number(response.data?.total || 0));
        setTransactions(response.data?.transactions || []);
      })
      .catch(() => setError('Unable to load earnings.'));
  }, []);

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.header}>
          <Text style={styles.title}>Earnings</Text>
        </View>

        <View style={styles.totalCard}>
          <Text style={styles.totalLabel}>Total Earnings</Text>
          <Text style={styles.totalAmount}>Rs {total.toFixed(2)}</Text>
        </View>

        {error ? <Text style={styles.errorText}>{error}</Text> : null}

        <Text style={styles.sectionTitle}>Transactions</Text>
        {transactions.length ? transactions.map((txn) => (
          <View key={txn.id} style={styles.transactionRow}>
            <Text style={styles.transactionId}>{txn.order_id || txn.id}</Text>
            <Text style={styles.transactionAmount}>Rs {Number(txn.total || 0).toFixed(2)}</Text>
          </View>
        )) : (
          <View style={styles.emptyState}>
            <Text style={styles.emptyText}>No earnings yet</Text>
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
  totalCard: { backgroundColor: '#F5F5F5', borderRadius: 12, paddingVertical: 20, paddingHorizontal: 16, marginBottom: 24 },
  totalLabel: { fontSize: 13, color: '#666', marginBottom: 8 },
  totalAmount: { fontSize: 32, fontWeight: '700', color: '#1E5BA8' },
  sectionTitle: { fontSize: 16, fontWeight: '700', color: '#000', marginBottom: 12 },
  transactionRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: '#F0F0F0' },
  transactionId: { fontSize: 13, fontWeight: '600', color: '#1E5BA8' },
  transactionAmount: { fontSize: 13, fontWeight: '600', color: '#000' },
  emptyState: { minHeight: 120, alignItems: 'center', justifyContent: 'center', backgroundColor: '#F9F9F9', borderRadius: 12 },
  emptyText: { color: '#666', fontSize: 14, fontWeight: '600' },
  errorText: { color: '#C62828', fontSize: 13, marginBottom: 12 },
});

export default EarningsScreen;
