import React, { useState, useContext, useLayoutEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
  StatusBar,
  TextInput,
  Switch,
  Alert,
} from 'react-native';
import { Ionicons, MaterialIcons, FontAwesome5, AntDesign } from '@expo/vector-icons';
import { ThemeContext } from './ThemeContext';
import { useAuth } from './lib/AuthContext';

const ProfileScreen = ({ navigation, route }) => {
  const { isDarkMode, toggleTheme, colors } = useContext(ThemeContext);
  const { user, setUser } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  
  // Configure the navigation header
  useLayoutEffect(() => {
    navigation.setOptions({
      headerRight: () => (
        <TouchableOpacity onPress={() => setIsEditing(!isEditing)}>
          <Text style={{ color: colors.primary, marginRight: 16 }}>
            {isEditing ? 'Done' : 'Edit'}
          </Text>
        </TouchableOpacity>
      ),
    });
  }, [navigation, isEditing, colors]);

  // Get patient data from route params or user context, with default values
  const patientData = {
    name: 'Not Set',
    gender: 'Not Set',
    dateOfBirth: 'Not Set',
    bloodType: 'Not Set',
    height: '0',
    weight: '0',
    bmi: '0',
    medicalHistory: [],
    allergies: [],
    emergencyContacts: [],
    ...user?.profile,  // Spread profile data from user context
    ...route.params?.patientData, // Override with route params if available
  };

  // Map database fields to app fields
  const mappedPatientData = {
    ...patientData,
    dateOfBirth: patientData.date_of_birth || patientData.dateOfBirth || 'Not Set',
    bloodType: patientData.blood_type || patientData.bloodType || 'Not Set',
    medicalHistory: patientData.medical_history || patientData.medicalHistory || [],
    emergencyContacts: patientData.emergency_contacts || patientData.emergencyContacts || [],
  };

  const [newMedicalHistory, setNewMedicalHistory] = useState({
    condition: '',
    date: '',
    status: '',
  });

  const [newAllergy, setNewAllergy] = useState({
    allergen: '',
    severity: '',
    notes: '',
  });

  const [newMedication, setNewMedication] = useState({
    name: '',
    dosage: '',
    frequency: '',
  });

  const [newEmergencyContact, setNewEmergencyContact] = useState({
    name: '',
    relationship: '',
    phone: '',
  });

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

  const renderSection = (title, data = [], renderItem, onAdd) => (
    <View style={[styles.section, { borderBottomColor: colors.border }]}>
      <View style={[styles.sectionHeader, { borderBottomColor: colors.border }]}>
        <Text style={[styles.sectionTitle, { color: colors.text }]}>{title}</Text>
        {isEditing && (
          <TouchableOpacity onPress={onAdd} style={styles.addButton}>
            <Ionicons name="add-circle" size={24} color={colors.primary} />
          </TouchableOpacity>
        )}
      </View>
      {Array.isArray(data) && data.map((item) => renderItem(item))}
    </View>
  );

  const renderMedicalHistoryItem = (item) => (
    <View key={item.id} style={[styles.itemCard, { backgroundColor: colors.itemBackground }]}>
      <View style={[styles.itemHeader, { borderBottomColor: colors.border }]}>
        <Text style={[styles.itemTitle, { color: colors.text }]}>{item.condition}</Text>
        <Text style={[styles.itemDate, { color: colors.secondaryText }]}>{item.date}</Text>
      </View>
      <Text style={[styles.itemStatus, { color: colors.text }]}>Status: {item.status}</Text>
      {isEditing && (
        <TouchableOpacity style={[styles.deleteButton, { backgroundColor: colors.error }]}>
          <MaterialIcons name="delete" size={20} color={colors.text} />
        </TouchableOpacity>
      )}
    </View>
  );

  const renderAllergyItem = (item) => (
    <View key={item.id} style={[styles.itemCard, { backgroundColor: colors.itemBackground }]}>
      <View style={[styles.itemHeader, { borderBottomColor: colors.border }]}>
        <Text style={[styles.itemTitle, { color: colors.text }]}>{item.allergen}</Text>
        <Text style={[styles.severity, { color: colors.text, fontWeight: '600' }]}>
          {item.severity}
        </Text>
      </View>
      <Text style={[styles.itemNotes, { color: colors.text }]}>{item.notes}</Text>
      {isEditing && (
        <TouchableOpacity style={[styles.deleteButton, { backgroundColor: colors.error }]}>
          <MaterialIcons name="delete" size={20} color={colors.text} />
        </TouchableOpacity>
      )}
    </View>
  );

  const renderMedicationItem = (item) => (
    <View key={item.id} style={[styles.itemCard, { backgroundColor: colors.itemBackground }]}>
      <View style={[styles.itemHeader, { borderBottomColor: colors.border }]}>
        <Text style={[styles.itemTitle, { color: colors.text }]}>{item.name}</Text>
        <Text style={[styles.itemDosage, { color: colors.text }]}>{item.dosage}</Text>
      </View>
      <Text style={[styles.itemFrequency, { color: colors.text }]}>{item.frequency}</Text>
      {isEditing && (
        <TouchableOpacity style={[styles.deleteButton, { backgroundColor: colors.error }]}>
          <MaterialIcons name="delete" size={20} color={colors.text} />
        </TouchableOpacity>
      )}
    </View>
  );

  const renderEmergencyContactItem = (item) => (
    <View key={item.id} style={[styles.itemCard, { backgroundColor: colors.itemBackground }]}>
      <View style={[styles.itemHeader, { borderBottomColor: colors.border }]}>
        <Text style={[styles.itemTitle, { color: colors.text }]}>{item.name}</Text>
        <Text style={[styles.itemRelationship, { color: colors.text }]}>{item.relationship}</Text>
      </View>
      <Text style={[styles.itemPhone, { color: colors.text }]}>{item.phone}</Text>
      {isEditing && (
        <TouchableOpacity style={[styles.deleteButton, { backgroundColor: colors.error }]}>
          <MaterialIcons name="delete" size={20} color={colors.text} />
        </TouchableOpacity>
      )}
    </View>
  );

  const renderPersonalInfo = () => (
    <View style={styles.infoContainer}>
      <View style={styles.infoRow}>
        <Text style={[styles.infoLabel, { color: colors.secondaryText }]}>Name</Text>
        <Text style={[styles.infoValue, { color: colors.text }]}>{mappedPatientData.name}</Text>
      </View>
      <View style={styles.infoRow}>
        <Text style={[styles.infoLabel, { color: colors.secondaryText }]}>Gender</Text>
        <Text style={[styles.infoValue, { color: colors.text }]}>{mappedPatientData.gender}</Text>
      </View>
      <View style={styles.infoRow}>
        <Text style={[styles.infoLabel, { color: colors.secondaryText }]}>Date of Birth</Text>
        <Text style={[styles.infoValue, { color: colors.text }]}>{mappedPatientData.dateOfBirth}</Text>
      </View>
      <View style={styles.infoRow}>
        <Text style={[styles.infoLabel, { color: colors.secondaryText }]}>Blood Type</Text>
        <Text style={[styles.infoValue, { color: colors.text }]}>{mappedPatientData.bloodType}</Text>
      </View>
      <View style={styles.infoRow}>
        <Text style={[styles.infoLabel, { color: colors.secondaryText }]}>Height</Text>
        <Text style={[styles.infoValue, { color: colors.text }]}>{mappedPatientData.height} cm</Text>
      </View>
      <View style={styles.infoRow}>
        <Text style={[styles.infoLabel, { color: colors.secondaryText }]}>Weight</Text>
        <Text style={[styles.infoValue, { color: colors.text }]}>{mappedPatientData.weight} kg</Text>
      </View>
      <View style={styles.infoRow}>
        <Text style={[styles.infoLabel, { color: colors.secondaryText }]}>BMI</Text>
        <Text style={[styles.infoValue, { color: colors.text }]}>{mappedPatientData.bmi}</Text>
      </View>
    </View>
  );

  const renderMedicalHistory = () => (
    <View style={styles.listContainer}>
      {Array.isArray(mappedPatientData.medicalHistory) && mappedPatientData.medicalHistory.length > 0 ? (
        mappedPatientData.medicalHistory.map((item, index) => (
          <View key={item.id || index} style={[styles.listItem, { borderColor: colors.border }]}>
            <View style={styles.listItemHeader}>
              <Text style={[styles.listItemTitle, { color: colors.text }]}>{item.condition}</Text>
              <Text style={[styles.listItemStatus, { 
                color: item.status === 'Ongoing' ? colors.error : 
                       item.status === 'Recovered' ? colors.success : colors.warning 
              }]}>{item.status}</Text>
            </View>
            <Text style={[styles.listItemSubtitle, { color: colors.secondaryText }]}>
              {item.timeframe || item.date}
            </Text>
            {item.notes && (
              <Text style={[styles.listItemNotes, { color: colors.secondaryText }]}>{item.notes}</Text>
            )}
          </View>
        ))
      ) : (
        <Text style={[styles.emptyText, { color: colors.secondaryText }]}>No medical history recorded</Text>
      )}
    </View>
  );

  const renderAllergies = () => (
    <View style={styles.listContainer}>
      {Array.isArray(mappedPatientData.allergies) && mappedPatientData.allergies.length > 0 ? (
        mappedPatientData.allergies.map((item, index) => (
          <View key={item.id || index} style={[styles.listItem, { borderColor: colors.border }]}>
            <View style={styles.listItemHeader}>
              <Text style={[styles.listItemTitle, { color: colors.text }]}>{item.allergen}</Text>
              <Text style={[styles.severity, { color: colors.text }]}>{item.severity}</Text>
            </View>
            {item.notes && (
              <Text style={[styles.listItemNotes, { color: colors.secondaryText }]}>{item.notes}</Text>
            )}
          </View>
        ))
      ) : (
        <Text style={[styles.emptyText, { color: colors.secondaryText }]}>No allergies recorded</Text>
      )}
    </View>
  );

  return (
    <SafeAreaView style={[styles.safeContainer, { backgroundColor: colors.background }]}>
      <StatusBar barStyle={isDarkMode ? 'light-content' : 'dark-content'} />
      
      {/* Custom Header */}
      <View style={[styles.header, { borderBottomColor: colors.border }]}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={colors.primary} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.text }]}>Profile</Text>
        <TouchableOpacity onPress={() => setIsEditing(!isEditing)} style={styles.editButton}>
          <Text style={[styles.editButtonText, { color: colors.primary }]}>
            {isEditing ? 'Done' : 'Edit'}
          </Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.container}>
        {renderPersonalInfo()}
        <View style={styles.sectionContainer}>
          {renderMedicalHistory()}
          {renderAllergies()}
          {renderSection('Emergency Contacts', mappedPatientData.emergencyContacts || [], renderEmergencyContactItem)}
        </View>
      </ScrollView>
      <TouchableOpacity
        style={[styles.logoutButton, { backgroundColor: colors.error }]}
        onPress={handleLogout}
      >
        <Text style={styles.logoutButtonText}>Logout</Text>
      </TouchableOpacity>
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
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginTop: 16,
    marginBottom: 8,
    paddingHorizontal: 16,
  },
  infoContainer: {
    padding: 16,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 8,
  },
  infoLabel: {
    fontSize: 16,
  },
  infoValue: {
    fontSize: 16,
    fontWeight: '500',
  },
  itemCard: {
    backgroundColor: '#F8F9FA',
    borderRadius: 12,
    padding: 12,
    marginBottom: 8,
  },
  itemHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  itemTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  itemDate: {
    fontSize: 14,
    color: '#666',
  },
  itemStatus: {
    fontSize: 14,
    color: '#666',
  },
  severity: {
    fontSize: 14,
    fontWeight: '600',
  },
  itemNotes: {
    fontSize: 14,
    color: '#666',
    marginTop: 4,
  },
  itemDosage: {
    fontSize: 14,
    color: '#666',
  },
  itemFrequency: {
    fontSize: 14,
    color: '#666',
    marginTop: 4,
  },
  itemRelationship: {
    fontSize: 14,
    color: '#666',
  },
  itemPhone: {
    fontSize: 14,
    color: '#666',
    marginTop: 4,
  },
  deleteButton: {
    position: 'absolute',
    right: 12,
    top: 12,
  },
  settingItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
  },
  settingLabel: {
    fontSize: 16,
  },
  settingValue: {
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
  listContainer: {
    padding: 16,
  },
  listItem: {
    borderWidth: 1,
    borderRadius: 8,
    padding: 12,
    marginBottom: 8,
  },
  listItemHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  listItemTitle: {
    fontSize: 16,
    fontWeight: '600',
  },
  listItemStatus: {
    fontSize: 14,
    fontWeight: '500',
  },
  listItemSubtitle: {
    fontSize: 14,
    marginBottom: 4,
  },
  listItemNotes: {
    fontSize: 14,
    fontStyle: 'italic',
  },
  severityTag: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    fontSize: 12,
    fontWeight: '600',
  },
  emptyText: {
    textAlign: 'center',
    padding: 20,
    fontStyle: 'italic',
  },
  sectionContainer: {
    paddingTop: 8,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
  },
  addButton: {
    padding: 8,
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
  editButton: {
    padding: 8,
    marginRight: -8,
  },
  editButtonText: {
    fontSize: 16,
    fontWeight: '500',
  },
});

export default ProfileScreen; 