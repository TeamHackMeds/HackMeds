import React, { useContext } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
  StatusBar,
  Switch,
  Alert,
} from 'react-native';
import { Ionicons, MaterialIcons, AntDesign } from '@expo/vector-icons';
import { ThemeContext } from './ThemeContext';
import { useAuth } from './lib/AuthContext';

const SettingsScreen = ({ navigation }) => {
  const { isDarkMode, toggleTheme, colors } = useContext(ThemeContext);
  const { setUser } = useAuth();

  const SettingItem = ({ title, icon, onPress, value, type = 'button' }) => (
    <TouchableOpacity 
      style={[styles.settingItem, { borderBottomColor: colors.border }]} 
      onPress={onPress}
    >
      <View style={styles.settingLeft}>
        <MaterialIcons name={icon} size={24} color={colors.primary} style={styles.settingIcon} />
        <Text style={[styles.settingLabel, { color: colors.text }]}>{title}</Text>
      </View>
      {type === 'switch' ? (
        <Switch
          value={value}
          onValueChange={onPress}
          trackColor={{ false: '#767577', true: '#81b0ff' }}
          thumbColor={value ? '#007AFF' : '#f4f3f4'}
        />
      ) : (
        <AntDesign name="right" size={20} color={colors.secondaryText} />
      )}
    </TouchableOpacity>
  );

  const handleLogout = () => {
    Alert.alert(
      'Logout',
      'Are you sure you want to logout?',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Logout',
          style: 'destructive',
          onPress: () => {
            setUser(null);
          },
        },
      ],
      { cancelable: false }
    );
  };

  return (
    <SafeAreaView style={[styles.safeContainer, { backgroundColor: colors.background }]}>
      <StatusBar barStyle={isDarkMode ? "light-content" : "dark-content"} backgroundColor={colors.background} />
      
      {/* Custom Header */}
      <View style={[styles.header, { borderBottomColor: colors.border }]}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={colors.primary} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.text }]}>Settings</Text>
        <View style={styles.headerRight} />
      </View>

      <ScrollView style={styles.container}>
        {/* App Settings */}
        <View style={[styles.section, { borderBottomColor: colors.border }]}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>App Settings</Text>
          <SettingItem
            title="Dark Mode"
            icon="dark-mode"
            value={isDarkMode}
            onPress={toggleTheme}
            type="switch"
          />
          <SettingItem
            title="Notifications"
            icon="notifications"
            value={true}
            onPress={() => Alert.alert('Notifications', 'Feature coming soon')}
            type="switch"
          />
          <SettingItem
            title="Language"
            icon="language"
            value="English"
            onPress={() => Alert.alert('Language', 'Feature coming soon')}
          />
        </View>

        {/* Privacy & Security */}
        <View style={[styles.section, { borderBottomColor: colors.border }]}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Privacy & Security</Text>
          <SettingItem
            title="Privacy Policy"
            icon="privacy-tip"
            onPress={() => Alert.alert('Privacy Policy', 'Feature coming soon')}
          />
          <SettingItem
            title="Terms of Service"
            icon="gavel"
            onPress={() => Alert.alert('Terms of Service', 'Feature coming soon')}
          />
          <SettingItem
            title="Change Password"
            icon="lock"
            onPress={() => Alert.alert('Change Password', 'Feature coming soon')}
          />
        </View>

        {/* Support */}
        <View style={[styles.section, { borderBottomColor: colors.border }]}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Support</Text>
          <SettingItem
            title="Help Center"
            icon="help"
            onPress={() => Alert.alert('Help Center', 'Feature coming soon')}
          />
          <SettingItem
            title="Contact Us"
            icon="contact-support"
            onPress={() => Alert.alert('Contact Us', 'Feature coming soon')}
          />
          <SettingItem
            title="About"
            icon="info"
            onPress={() => Alert.alert('About', 'Healthcare Assistant v1.0.0')}
          />
        </View>

        {/* Logout Button */}
        <TouchableOpacity 
          style={[styles.logoutButton, { backgroundColor: colors.error }]} 
          onPress={handleLogout}
        >
          <Text style={styles.logoutButtonText}>Logout</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeContainer: {
    flex: 1,
  },
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '600',
  },
  backButton: {
    padding: 8,
    marginLeft: -8,
  },
  headerRight: {
    width: 40,
  },
  section: {
    padding: 16,
    borderBottomWidth: 1,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 12,
  },
  settingItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
  },
  settingLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  settingIcon: {
    marginRight: 12,
  },
  settingLabel: {
    fontSize: 16,
  },
  logoutButton: {
    margin: 16,
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  logoutButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default SettingsScreen; 