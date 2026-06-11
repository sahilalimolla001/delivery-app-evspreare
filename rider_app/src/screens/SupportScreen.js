import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
} from 'react-native';

const SupportScreen = () => {
  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>Help & Support</Text>
          <Text style={styles.subtitle}>How can we help you?</Text>
        </View>

        {/* Support Options */}
        <SupportOption
          icon="📚"
          label="Help Center"
          description="Browse FAQs and guides"
        />
        <SupportOption
          icon="⚠️"
          label="Report an Issue"
          description="Let us know about problems"
        />
        <SupportOption
          icon="📞"
          label="Call Support"
          description="+91-1800-123-4567"
          onPress={() => {}}
        />
        <SupportOption
          icon="💬"
          label="Chat Support"
          description="🟢 We are online"
          onPress={() => {}}
        />
        <SupportOption
          icon="⭐"
          label="Rate the App"
          description="Share your feedback"
        />
        <SupportOption
          icon="ℹ️"
          label="About App"
          description="Version 1.0.0"
        />
      </ScrollView>
    </SafeAreaView>
  );
};

const SupportOption = ({ icon, label, description, onPress }) => (
  <TouchableOpacity
    style={styles.optionCard}
    onPress={onPress}
    activeOpacity={0.6}
  >
    <View style={styles.iconContainer}>
      <Text style={styles.icon}>{icon}</Text>
    </View>
    <View style={styles.optionContent}>
      <Text style={styles.optionLabel}>{label}</Text>
      <Text style={styles.optionDescription}>{description}</Text>
    </View>
    <Text style={styles.arrow}>→</Text>
  </TouchableOpacity>
);

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
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 14,
    color: '#666',
  },
  optionCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F9F9F9',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 16,
    marginBottom: 12,
    borderLeftWidth: 4,
    borderLeftColor: '#1E5BA8',
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 12,
    backgroundColor: '#E3F2FD',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  icon: {
    fontSize: 24,
  },
  optionContent: {
    flex: 1,
  },
  optionLabel: {
    fontSize: 15,
    fontWeight: '600',
    color: '#000',
    marginBottom: 2,
  },
  optionDescription: {
    fontSize: 12,
    color: '#999',
  },
  arrow: {
    fontSize: 18,
    color: '#DDD',
  },
});

export default SupportScreen;
