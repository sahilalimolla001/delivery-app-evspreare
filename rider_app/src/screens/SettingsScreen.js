import React from 'react';
import {
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { useAuthStore } from '../stores/authStore';

const SettingsScreen = () => {
  const [soundEnabled, setSoundEnabled] = React.useState(true);
  const [notificationsEnabled, setNotificationsEnabled] = React.useState(true);
  const [darkModeEnabled, setDarkModeEnabled] = React.useState(false);
  const { logout } = useAuthStore();

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.header}>
          <Text style={styles.title}>Settings</Text>
        </View>

        <View style={styles.section}>
          <SettingItem label="Online/Offline Auto" />
          <SettingToggle
            label="Order Notification"
            value={notificationsEnabled}
            onValueChange={setNotificationsEnabled}
          />
          <SettingToggle
            label="Sound"
            value={soundEnabled}
            onValueChange={setSoundEnabled}
          />
          <SettingItem label="Language" value="English" />
          <SettingToggle
            label="Dark Mode"
            value={darkModeEnabled}
            onValueChange={setDarkModeEnabled}
          />
        </View>

        <View style={styles.section}>
          <SettingItem label="Privacy Policy" />
          <SettingItem label="Terms & Conditions" />
        </View>

        <TouchableOpacity style={styles.logoutButton} onPress={logout}>
          <Text style={styles.logoutText}>Log Out</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
};

const SettingItem = ({ label, value, onPress }) => (
  <TouchableOpacity onPress={onPress} style={styles.settingRow} activeOpacity={0.6} disabled={!onPress}>
    <Text style={styles.settingLabel}>{label}</Text>
    {value ? <Text style={styles.settingValue}>{value}</Text> : null}
  </TouchableOpacity>
);

const SettingToggle = ({ label, value, onValueChange }) => (
  <View style={styles.settingRow}>
    <Text style={styles.settingLabel}>{label}</Text>
    <Switch
      value={value}
      onValueChange={onValueChange}
      trackColor={{ false: '#ddd', true: '#81C784' }}
      thumbColor={value ? '#4CAF50' : '#f4f3f4'}
    />
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
  section: {
    marginBottom: 20,
    backgroundColor: '#F9F9F9',
    borderRadius: 12,
    overflow: 'hidden',
  },
  settingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  settingLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#000',
  },
  settingValue: {
    fontSize: 13,
    color: '#777',
  },
  logoutButton: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    marginTop: 20,
  },
  logoutText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#D32F2F',
  },
});

export default SettingsScreen;
