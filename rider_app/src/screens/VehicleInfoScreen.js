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

const VehicleInfoScreen = ({ navigation }) => {
  const [isEditing, setIsEditing] = useState(false);

  const vehicleInfo = {
    type: 'Bike',
    number: 'KA 01 AB 1234',
    brand: 'Hero Passion Pro',
    model: '2021',
    color: 'Black',
    fuelType: 'Petrol',
    registration: 'Active',
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Text style={styles.backButton}>← Back</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Vehicle Info</Text>
          <View style={{ width: 40 }} />
        </View>

        {/* Vehicle Icon */}
        <View style={styles.vehicleIconContainer}>
          <Text style={styles.vehicleIcon}>🛵</Text>
          <Text style={styles.vehicleStatus}>Verified</Text>
        </View>

        {/* Vehicle Details */}
        <View style={styles.detailsCard}>
          <DetailRow label="Vehicle Type" value={vehicleInfo.type} />
          <DetailRow label="Vehicle Number" value={vehicleInfo.number} />
          <DetailRow label="Brand" value={vehicleInfo.brand} />
          <DetailRow label="Model" value={vehicleInfo.model} />
          <DetailRow label="Color" value={vehicleInfo.color} />
          <DetailRow
            label="Fuel Type"
            value={vehicleInfo.fuelType}
            last={true}
          />
        </View>

        {/* Registration Status */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Registration Status</Text>
          <View style={styles.statusCard}>
            <View style={styles.statusBadge}>
              <Text style={styles.statusIcon}>✓</Text>
            </View>
            <View style={styles.statusContent}>
              <Text style={styles.statusLabel}>Active</Text>
              <Text style={styles.statusSubtext}>Valid till 31 Dec 2025</Text>
            </View>
          </View>
        </View>

        {/* Fitness Certificate */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Fitness Certificate</Text>
          <View style={styles.statusCard}>
            <View style={styles.statusBadge}>
              <Text style={styles.statusIcon}>✓</Text>
            </View>
            <View style={styles.statusContent}>
              <Text style={styles.statusLabel}>Valid</Text>
              <Text style={styles.statusSubtext}>Valid till 30 June 2026</Text>
            </View>
          </View>
        </View>

        {/* Edit Button */}
        <TouchableOpacity style={styles.editButton}>
          <Text style={styles.editButtonIcon}>✏️</Text>
          <Text style={styles.editButtonText}>Edit Vehicle Info</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
};

const DetailRow = ({ label, value, last = false }) => (
  <View
    style={[
      styles.detailRow,
      last && { borderBottomWidth: 0 },
    ]}
  >
    <Text style={styles.detailLabel}>{label}</Text>
    <Text style={styles.detailValue}>{value}</Text>
  </View>
);

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
    marginBottom: 24,
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
  vehicleIconContainer: {
    alignItems: 'center',
    marginBottom: 24,
  },
  vehicleIcon: {
    fontSize: 80,
    marginBottom: 8,
  },
  vehicleStatus: {
    fontSize: 14,
    fontWeight: '600',
    color: '#4CAF50',
  },
  detailsCard: {
    backgroundColor: '#F9F9F9',
    borderRadius: 12,
    overflow: 'hidden',
    marginBottom: 24,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  detailLabel: {
    fontSize: 13,
    color: '#666',
  },
  detailValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#000',
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
  statusCard: {
    backgroundColor: '#F5F5F5',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    flexDirection: 'row',
    alignItems: 'center',
  },
  statusBadge: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#E8F5E9',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  statusIcon: {
    fontSize: 18,
    color: '#4CAF50',
  },
  statusContent: {
    flex: 1,
  },
  statusLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#000',
    marginBottom: 2,
  },
  statusSubtext: {
    fontSize: 12,
    color: '#999',
  },
  editButton: {
    backgroundColor: '#E3F2FD',
    borderRadius: 8,
    paddingVertical: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    marginTop: 20,
    marginBottom: 20,
  },
  editButtonIcon: {
    fontSize: 16,
  },
  editButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1E5BA8',
  },
});

export default VehicleInfoScreen;
