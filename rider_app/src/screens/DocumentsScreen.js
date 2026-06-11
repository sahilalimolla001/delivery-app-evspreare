import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
} from 'react-native';

const DocumentsScreen = ({ navigation }) => {
  const documents = [
    {
      name: 'Aadhar Card',
      status: 'verified',
      statusText: 'Verified',
      expiryDate: 'No Expiry',
      icon: '📋',
    },
    {
      name: 'Driving License',
      status: 'verified',
      statusText: 'Verified',
      expiryDate: 'Valid till 15 Mar 2028',
      icon: '🪪',
    },
    {
      name: 'Vehicle RC',
      status: 'verified',
      statusText: 'Verified',
      expiryDate: 'Valid till 30 Jun 2026',
      icon: '📜',
    },
    {
      name: 'Insurance',
      status: 'verified',
      statusText: 'Verified',
      expiryDate: 'Valid till 10 May 2026',
      icon: '🛡️',
    },
    {
      name: 'Pollution Certificate',
      status: 'expiring',
      statusText: 'Expiring Soon',
      expiryDate: 'Valid till 10 Jan 2026',
      icon: '♻️',
    },
  ];

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Text style={styles.backButton}>← Back</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Documents</Text>
          <View style={{ width: 40 }} />
        </View>

        {/* Status Summary */}
        <View style={styles.summaryCard}>
          <View style={styles.summaryItem}>
            <Text style={styles.summaryIcon}>✓</Text>
            <View>
              <Text style={styles.summaryLabel}>Verified</Text>
              <Text style={styles.summaryCount}>4 documents</Text>
            </View>
          </View>
          <View style={styles.summaryItem}>
            <Text style={styles.summaryWarning}>⚠️</Text>
            <View>
              <Text style={styles.summaryLabel}>Action Required</Text>
              <Text style={styles.summaryCount}>1 document</Text>
            </View>
          </View>
        </View>

        {/* Documents List */}
        {documents.map((doc, index) => (
          <DocumentCard key={index} document={doc} />
        ))}

        {/* Upload New Document */}
        <TouchableOpacity style={styles.uploadButton}>
          <Text style={styles.uploadIcon}>+</Text>
          <Text style={styles.uploadText}>Upload New Document</Text>
        </TouchableOpacity>

        {/* Important Notice */}
        <View style={styles.noticeCard}>
          <Text style={styles.noticeIcon}>ℹ️</Text>
          <Text style={styles.noticeText}>
            Keep your documents updated to avoid account suspension. Upload new
            documents 30 days before expiry.
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const DocumentCard = ({ document }) => {
  const isVerified = document.status === 'verified';
  const isExpiring = document.status === 'expiring';

  return (
    <View
      style={[
        styles.documentCard,
        isExpiring && styles.documentCardWarning,
      ]}
    >
      <View style={styles.docHeader}>
        <View style={styles.docInfo}>
          <Text style={styles.docIcon}>{document.icon}</Text>
          <View style={styles.docDetails}>
            <Text style={styles.docName}>{document.name}</Text>
            <Text style={styles.docExpiry}>{document.expiryDate}</Text>
          </View>
        </View>
        <View
          style={[
            styles.statusBadge,
            isVerified && styles.statusVerified,
            isExpiring && styles.statusExpiring,
          ]}
        >
          <Text
            style={[
              styles.statusBadgeText,
              isExpiring && styles.statusBadgeWarning,
            ]}
          >
            {document.statusText}
          </Text>
        </View>
      </View>

      {isExpiring && (
        <TouchableOpacity style={styles.renewButton}>
          <Text style={styles.renewButtonText}>Renew Document</Text>
        </TouchableOpacity>
      )}
    </View>
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
  summaryCard: {
    backgroundColor: '#F9F9F9',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 16,
    marginBottom: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  summaryItem: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  summaryIcon: {
    fontSize: 24,
    marginRight: 12,
  },
  summaryWarning: {
    fontSize: 24,
    marginRight: 12,
  },
  summaryLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: '#000',
  },
  summaryCount: {
    fontSize: 12,
    color: '#999',
    marginTop: 2,
  },
  documentCard: {
    backgroundColor: '#F5F5F5',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    marginBottom: 12,
    borderLeftWidth: 4,
    borderLeftColor: '#1E5BA8',
  },
  documentCardWarning: {
    borderLeftColor: '#FBC02D',
    backgroundColor: '#FFFDE7',
  },
  docHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  docInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  docIcon: {
    fontSize: 24,
    marginRight: 12,
  },
  docDetails: {
    flex: 1,
  },
  docName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#000',
    marginBottom: 4,
  },
  docExpiry: {
    fontSize: 12,
    color: '#999',
  },
  statusBadge: {
    backgroundColor: '#E8F5E9',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  statusVerified: {
    backgroundColor: '#E8F5E9',
  },
  statusExpiring: {
    backgroundColor: '#FFF3CD',
  },
  statusBadgeText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#2E7D32',
  },
  statusBadgeWarning: {
    color: '#856404',
  },
  renewButton: {
    marginTop: 12,
    paddingVertical: 8,
    paddingHorizontal: 12,
    backgroundColor: '#FBC02D',
    borderRadius: 6,
    alignItems: 'center',
  },
  renewButtonText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#fff',
  },
  uploadButton: {
    backgroundColor: '#E3F2FD',
    borderRadius: 8,
    paddingVertical: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
  },
  uploadIcon: {
    fontSize: 20,
    fontWeight: '600',
    color: '#1E5BA8',
    marginRight: 8,
  },
  uploadText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1E5BA8',
  },
  noticeCard: {
    backgroundColor: '#E3F2FD',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 12,
    flexDirection: 'row',
    marginBottom: 20,
  },
  noticeIcon: {
    fontSize: 20,
    marginRight: 12,
  },
  noticeText: {
    flex: 1,
    fontSize: 12,
    color: '#1E5BA8',
    lineHeight: 16,
  },
});

export default DocumentsScreen;
