import React, { useState, useContext } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  ScrollView,
  SafeAreaView,
  StatusBar,
  Alert,
  KeyboardAvoidingView,
  Platform,
  Modal,
} from 'react-native';
import { Ionicons, MaterialIcons } from '@expo/vector-icons';
import { ThemeContext } from './ThemeContext';

const BLOOD_TYPES = [
  'A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'
];

const GENDERS = [
  'Male',
  'Female',
  'Other'
];

const TIMEFRAMES = [
  'Last year',
  'Few months ago',
  'More than 5 years ago'
];

const CONDITION_STATUSES = [
  'Ongoing',
  'Recovered',
  'Under Treatment'
];

const SEVERITY_LEVELS = [
  'Low',
  'Moderate',
  'High',
  'Severe'
];

const PatientProfileSetup = ({ route, navigation }) => {
  const { colors, isDarkMode } = useContext(ThemeContext);
  const { formData: initialData } = route.params;
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState({
    ...initialData,
    height: '',
    weight: '',
    gender: '',
    bloodType: '',
    dateOfBirth: '',
    medicalHistory: [],
    allergies: [],
    emergencyContacts: [],
  });

  const [newMedicalHistory, setNewMedicalHistory] = useState({
    condition: '',
    date: '',
    status: '',
  });

  const [newAllergy, setNewAllergy] = useState({
    allergen: '',
    severity: 'Low',
    notes: '',
  });

  const [newEmergencyContact, setNewEmergencyContact] = useState({
    name: '',
    relationship: '',
    phone: '',
  });

  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showBloodTypePicker, setShowBloodTypePicker] = useState(false);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [day, setDay] = useState('');
  const [month, setMonth] = useState('');
  const [year, setYear] = useState('');
  const [showTimeframePicker, setShowTimeframePicker] = useState(false);
  const [showStatusPicker, setShowStatusPicker] = useState(false);
  const [showSeverityPicker, setShowSeverityPicker] = useState(false);
  const [showGenderPicker, setShowGenderPicker] = useState(false);

  const calculateBMI = (height, weight) => {
    if (!height || !weight) return null;
    const heightInMeters = height / 100;
    return (weight / (heightInMeters * heightInMeters)).toFixed(1);
  };

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleDateConfirm = () => {
    if (day && month && year) {
      const formattedDate = `${day.padStart(2, '0')}-${month.padStart(2, '0')}-${year}`;
      setFormData(prev => ({
        ...prev,
        dateOfBirth: formattedDate
      }));
      setShowDatePicker(false);
    } else {
      Alert.alert('Error', 'Please enter a valid date');
    }
  };

  const addMedicalHistory = () => {
    if (newMedicalHistory.condition && newMedicalHistory.date) {
      setFormData(prev => ({
        ...prev,
        medicalHistory: [
          ...prev.medicalHistory,
          { ...newMedicalHistory, id: Date.now().toString() }
        ]
      }));
      setNewMedicalHistory({ condition: '', date: '', status: '' });
    }
  };

  const addAllergy = () => {
    if (newAllergy.allergen) {
      setFormData(prev => ({
        ...prev,
        allergies: [
          ...prev.allergies,
          { ...newAllergy, id: Date.now().toString() }
        ]
      }));
      setNewAllergy({ allergen: '', severity: 'Low', notes: '' });
    }
  };

  const addEmergencyContact = () => {
    if (newEmergencyContact.name && newEmergencyContact.phone) {
      setFormData(prev => ({
        ...prev,
        emergencyContacts: [
          ...prev.emergencyContacts,
          { ...newEmergencyContact, id: Date.now().toString() }
        ]
      }));
      setNewEmergencyContact({ name: '', relationship: '', phone: '' });
    }
  };

  const removeItem = (type, id) => {
    setFormData(prev => ({
      ...prev,
      [type]: prev[type].filter(item => item.id !== id)
    }));
  };

  const handleSubmit = async () => {
    try {
      // Validate required fields
      if (!formData.height || !formData.weight || !formData.gender || !formData.bloodType || !formData.dateOfBirth) {
        Alert.alert('Missing Information', 'Please fill in all required fields in Basic Information.');
        setCurrentStep(1);
        return;
      }

      // Calculate BMI
      const bmi = calculateBMI(parseFloat(formData.height), parseFloat(formData.weight));

      // Prepare complete patient data
      const patientData = {
        ...formData,
        bmi: bmi,
        setupComplete: true,
        lastUpdated: new Date().toISOString()
      };

      // Navigate back to Auth screen with the completed profile data
      navigation.navigate('Auth', { 
        action: 'COMPLETE_SIGNUP',
        patientData: patientData 
      });
    } catch (error) {
      console.error('Error submitting profile:', error);
      Alert.alert(
        'Error',
        'There was an error saving your profile. Please try again.'
      );
    }
  };

  const renderDatePicker = () => (
    <Modal
      visible={showDatePicker}
      transparent={true}
      animationType="slide"
    >
      <View style={styles.modalContainer}>
        <View style={[styles.modalContent, { backgroundColor: colors.card }]}>
          <Text style={[styles.modalTitle, { color: colors.text }]}>Select Date of Birth</Text>
          <View style={styles.dateInputContainer}>
            <View style={styles.dateInputWrapper}>
              <Text style={[styles.dateLabel, { color: colors.text }]}>Day</Text>
              <TextInput
                style={[styles.dateInput, { color: colors.text, borderColor: colors.border }]}
                placeholder="DD"
                placeholderTextColor={colors.secondaryText}
                value={day}
                onChangeText={setDay}
                keyboardType="numeric"
                maxLength={2}
              />
            </View>
            <View style={styles.dateInputWrapper}>
              <Text style={[styles.dateLabel, { color: colors.text }]}>Month</Text>
              <TextInput
                style={[styles.dateInput, { color: colors.text, borderColor: colors.border }]}
                placeholder="MM"
                placeholderTextColor={colors.secondaryText}
                value={month}
                onChangeText={setMonth}
                keyboardType="numeric"
                maxLength={2}
              />
            </View>
            <View style={styles.dateInputWrapper}>
              <Text style={[styles.dateLabel, { color: colors.text }]}>Year</Text>
              <TextInput
                style={[styles.dateInput, { color: colors.text, borderColor: colors.border }]}
                placeholder="YYYY"
                placeholderTextColor={colors.secondaryText}
                value={year}
                onChangeText={setYear}
                keyboardType="numeric"
                maxLength={4}
              />
            </View>
          </View>
          <View style={styles.modalButtons}>
            <TouchableOpacity
              style={[styles.modalButton, { borderColor: colors.primary }]}
              onPress={() => setShowDatePicker(false)}
            >
              <Text style={[styles.modalButtonText, { color: colors.primary }]}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.modalButton, { backgroundColor: colors.primary }]}
              onPress={handleDateConfirm}
            >
              <Text style={styles.modalButtonText}>Confirm</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );

  const renderBloodTypePicker = () => (
    <Modal
      visible={showBloodTypePicker}
      transparent={true}
      animationType="slide"
    >
      <View style={styles.modalContainer}>
        <View style={[styles.modalContent, { backgroundColor: colors.card }]}>
          <Text style={[styles.modalTitle, { color: colors.text }]}>Select Blood Type</Text>
          <View style={styles.bloodTypeList}>
            {BLOOD_TYPES.map((type) => (
              <TouchableOpacity
                key={type}
                style={[
                  styles.bloodTypeOption,
                  formData.bloodType === type && { backgroundColor: colors.primary },
                  { borderColor: colors.border }
                ]}
                onPress={() => {
                  setFormData(prev => ({ ...prev, bloodType: type }));
                  setShowBloodTypePicker(false);
                }}
              >
                <Text
                  style={[
                    styles.bloodTypeText,
                    { color: formData.bloodType === type ? 'white' : colors.text }
                  ]}
                >
                  {type}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
          <TouchableOpacity
            style={[styles.modalButton, { backgroundColor: colors.primary }]}
            onPress={() => setShowBloodTypePicker(false)}
          >
            <Text style={[styles.modalButtonText, { color: 'white' }]}>Close</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );

  const renderTimeframePicker = () => (
    <Modal
      visible={showTimeframePicker}
      transparent={true}
      animationType="slide"
    >
      <View style={styles.modalContainer}>
        <View style={[styles.modalContent, { backgroundColor: colors.card }]}>
          <Text style={[styles.modalTitle, { color: colors.text }]}>Select Timeframe</Text>
          <View style={styles.optionsList}>
            {TIMEFRAMES.map((timeframe) => (
              <TouchableOpacity
                key={timeframe}
                style={[
                  styles.optionItem,
                  newMedicalHistory.date === timeframe && { backgroundColor: colors.primary },
                  { borderColor: colors.border }
                ]}
                onPress={() => {
                  setNewMedicalHistory(prev => ({ ...prev, date: timeframe }));
                  setShowTimeframePicker(false);
                }}
              >
                <Text
                  style={[
                    styles.optionText,
                    { color: newMedicalHistory.date === timeframe ? 'white' : colors.text }
                  ]}
                >
                  {timeframe}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
          <TouchableOpacity
            style={[styles.modalButton, { backgroundColor: colors.primary }]}
            onPress={() => setShowTimeframePicker(false)}
          >
            <Text style={[styles.modalButtonText, { color: 'white' }]}>Close</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );

  const renderStatusPicker = () => (
    <Modal
      visible={showStatusPicker}
      transparent={true}
      animationType="slide"
    >
      <View style={styles.modalContainer}>
        <View style={[styles.modalContent, { backgroundColor: colors.card }]}>
          <Text style={[styles.modalTitle, { color: colors.text }]}>Select Status</Text>
          <View style={styles.optionsList}>
            {CONDITION_STATUSES.map((status) => (
              <TouchableOpacity
                key={status}
                style={[
                  styles.optionItem,
                  newMedicalHistory.status === status && { backgroundColor: colors.primary },
                  { borderColor: colors.border }
                ]}
                onPress={() => {
                  setNewMedicalHistory(prev => ({ ...prev, status: status }));
                  setShowStatusPicker(false);
                }}
              >
                <Text
                  style={[
                    styles.optionText,
                    { color: newMedicalHistory.status === status ? 'white' : colors.text }
                  ]}
                >
                  {status}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
          <TouchableOpacity
            style={[styles.modalButton, { backgroundColor: colors.primary }]}
            onPress={() => setShowStatusPicker(false)}
          >
            <Text style={[styles.modalButtonText, { color: 'white' }]}>Close</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );

  const renderSeverityPicker = () => (
    <Modal
      visible={showSeverityPicker}
      transparent={true}
      animationType="slide"
    >
      <View style={styles.modalContainer}>
        <View style={[styles.modalContent, { backgroundColor: colors.card }]}>
          <Text style={[styles.modalTitle, { color: colors.text }]}>Select Severity</Text>
          <View style={styles.optionsList}>
            {SEVERITY_LEVELS.map((severity) => (
              <TouchableOpacity
                key={severity}
                style={[
                  styles.optionItem,
                  newAllergy.severity === severity && { backgroundColor: colors.primary },
                  { borderColor: colors.border }
                ]}
                onPress={() => {
                  setNewAllergy(prev => ({ ...prev, severity: severity }));
                  setShowSeverityPicker(false);
                }}
              >
                <Text
                  style={[
                    styles.optionText,
                    { color: newAllergy.severity === severity ? 'white' : colors.text }
                  ]}
                >
                  {severity}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
          <TouchableOpacity
            style={[styles.modalButton, { backgroundColor: colors.primary }]}
            onPress={() => setShowSeverityPicker(false)}
          >
            <Text style={[styles.modalButtonText, { color: 'white' }]}>Close</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );

  const renderGenderPicker = () => (
    <Modal
      visible={showGenderPicker}
      transparent={true}
      animationType="slide"
    >
      <View style={styles.modalContainer}>
        <View style={[styles.modalContent, { backgroundColor: colors.card }]}>
          <Text style={[styles.modalTitle, { color: colors.text }]}>Select Gender</Text>
          <View style={styles.optionsList}>
            {GENDERS.map((gender) => (
              <TouchableOpacity
                key={gender}
                style={[
                  styles.optionItem,
                  formData.gender === gender && { backgroundColor: colors.primary },
                  { borderColor: colors.border }
                ]}
                onPress={() => {
                  setFormData(prev => ({ ...prev, gender: gender }));
                  setShowGenderPicker(false);
                }}
              >
                <Text
                  style={[
                    styles.optionText,
                    { color: formData.gender === gender ? 'white' : colors.text }
                  ]}
                >
                  {gender}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
          <TouchableOpacity
            style={[styles.modalButton, { backgroundColor: colors.primary }]}
            onPress={() => setShowGenderPicker(false)}
          >
            <Text style={[styles.modalButtonText, { color: 'white' }]}>Close</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );

  const renderStep1 = () => (
    <View style={styles.stepContainer}>
      <Text style={[styles.stepTitle, { color: colors.text }]}>Basic Information</Text>
      <TouchableOpacity
        style={[styles.input, { borderColor: colors.border }]}
        onPress={() => setShowGenderPicker(true)}
      >
        <Text style={[styles.dateText, { color: formData.gender ? colors.text : colors.secondaryText }]}>
          {formData.gender || 'Select Gender'}
        </Text>
      </TouchableOpacity>
      <TouchableOpacity
        style={[styles.input, { borderColor: colors.border }]}
        onPress={() => setShowDatePicker(true)}
      >
        <Text style={[styles.dateText, { color: formData.dateOfBirth ? colors.text : colors.secondaryText }]}>
          {formData.dateOfBirth || 'Date of Birth (DD-MM-YYYY)'}
        </Text>
      </TouchableOpacity>
      <TextInput
        style={[styles.input, { color: colors.text, borderColor: colors.border }]}
        placeholder="Height (cm)"
        placeholderTextColor={colors.secondaryText}
        value={formData.height}
        onChangeText={(text) => handleInputChange('height', text)}
        keyboardType="numeric"
      />
      <TextInput
        style={[styles.input, { color: colors.text, borderColor: colors.border }]}
        placeholder="Weight (kg)"
        placeholderTextColor={colors.secondaryText}
        value={formData.weight}
        onChangeText={(text) => handleInputChange('weight', text)}
        keyboardType="numeric"
      />
      {formData.height && formData.weight && (
        <View style={styles.bmiContainer}>
          <Text style={[styles.bmiText, { color: colors.text }]}>
            BMI: {calculateBMI(parseFloat(formData.height), parseFloat(formData.weight))}
          </Text>
        </View>
      )}
      <TouchableOpacity
        style={[styles.input, { borderColor: colors.border }]}
        onPress={() => setShowBloodTypePicker(true)}
      >
        <Text style={[styles.dateText, { color: formData.bloodType ? colors.text : colors.secondaryText }]}>
          {formData.bloodType || 'Select Blood Type'}
        </Text>
      </TouchableOpacity>
      {renderDatePicker()}
      {renderBloodTypePicker()}
      {renderGenderPicker()}
    </View>
  );

  const renderStep2 = () => (
    <View style={styles.stepContainer}>
      <Text style={[styles.stepTitle, { color: colors.text }]}>Medical History</Text>
      <View style={styles.addItemContainer}>
        <TextInput
          style={[styles.input, { color: colors.text, borderColor: colors.border }]}
          placeholder="Condition"
          placeholderTextColor={colors.secondaryText}
          value={newMedicalHistory.condition}
          onChangeText={(text) => setNewMedicalHistory(prev => ({ ...prev, condition: text }))}
        />
        <TouchableOpacity
          style={[styles.input, { borderColor: colors.border }]}
          onPress={() => setShowTimeframePicker(true)}
        >
          <Text style={[styles.pickerText, { color: newMedicalHistory.date ? colors.text : colors.secondaryText }]}>
            {newMedicalHistory.date || 'Select Timeframe'}
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.input, { borderColor: colors.border }]}
          onPress={() => setShowStatusPicker(true)}
        >
          <Text style={[styles.pickerText, { color: newMedicalHistory.status ? colors.text : colors.secondaryText }]}>
            {newMedicalHistory.status || 'Select Status'}
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.addConditionButton, { backgroundColor: colors.primary }]}
          onPress={addMedicalHistory}
        >
          <Text style={styles.addButtonText}>Add</Text>
        </TouchableOpacity>
      </View>

      {formData.medicalHistory.map(item => (
        <View key={item.id} style={[styles.conditionCard, { backgroundColor: colors.card }]}>
          <View style={styles.conditionContent}>
            <View>
              <Text style={[styles.conditionName, { color: colors.text }]}>{item.condition}</Text>
              <Text style={[styles.conditionDetails, { color: colors.secondaryText }]}>
                {item.date} • {item.status}
              </Text>
            </View>
            <TouchableOpacity 
              style={styles.deleteButton}
              onPress={() => removeItem('medicalHistory', item.id)}
            >
              <MaterialIcons name="delete-outline" size={24} color={colors.error} />
            </TouchableOpacity>
          </View>
        </View>
      ))}
      {renderTimeframePicker()}
      {renderStatusPicker()}
    </View>
  );

  const renderStep3 = () => (
    <View style={styles.stepContainer}>
      <Text style={[styles.stepTitle, { color: colors.text }]}>Allergies</Text>
      <View style={styles.addItemContainer}>
        <TextInput
          style={[styles.input, { color: colors.text, borderColor: colors.border }]}
          placeholder="Allergen"
          placeholderTextColor={colors.secondaryText}
          value={newAllergy.allergen}
          onChangeText={(text) => setNewAllergy(prev => ({ ...prev, allergen: text }))}
        />
        <TouchableOpacity
          style={[styles.input, { borderColor: colors.border }]}
          onPress={() => setShowSeverityPicker(true)}
        >
          <Text style={[styles.pickerText, { color: newAllergy.severity ? colors.text : colors.secondaryText }]}>
            {newAllergy.severity || 'Select Severity'}
          </Text>
        </TouchableOpacity>
        <TextInput
          style={[styles.input, { color: colors.text, borderColor: colors.border }]}
          placeholder="Notes"
          placeholderTextColor={colors.secondaryText}
          value={newAllergy.notes}
          onChangeText={(text) => setNewAllergy(prev => ({ ...prev, notes: text }))}
        />
        <TouchableOpacity
          style={[styles.addButton, { backgroundColor: colors.primary }]}
          onPress={addAllergy}
        >
          <Text style={styles.addButtonText}>Add Allergy</Text>
        </TouchableOpacity>
      </View>
      {formData.allergies.map(item => (
        <View key={item.id} style={[styles.itemCard, { backgroundColor: colors.card }]}>
          <View style={styles.itemHeader}>
            <Text style={[styles.itemTitle, { color: colors.text }]}>{item.allergen}</Text>
            <TouchableOpacity onPress={() => removeItem('allergies', item.id)}>
              <MaterialIcons name="delete" size={20} color={colors.error} />
            </TouchableOpacity>
          </View>
          <Text style={[styles.itemText, { color: colors.secondaryText }]}>Severity: {item.severity}</Text>
          <Text style={[styles.itemText, { color: colors.secondaryText }]}>Notes: {item.notes}</Text>
        </View>
      ))}
      {renderSeverityPicker()}
    </View>
  );

  const renderStep4 = () => (
    <View style={styles.stepContainer}>
      <Text style={[styles.stepTitle, { color: colors.text }]}>Emergency Contacts</Text>
      <View style={styles.addItemContainer}>
        <TextInput
          style={[styles.input, { color: colors.text, borderColor: colors.border }]}
          placeholder="Name"
          placeholderTextColor={colors.secondaryText}
          value={newEmergencyContact.name}
          onChangeText={(text) => setNewEmergencyContact(prev => ({ ...prev, name: text }))}
        />
        <TextInput
          style={[styles.input, { color: colors.text, borderColor: colors.border }]}
          placeholder="Relationship"
          placeholderTextColor={colors.secondaryText}
          value={newEmergencyContact.relationship}
          onChangeText={(text) => setNewEmergencyContact(prev => ({ ...prev, relationship: text }))}
        />
        <TextInput
          style={[styles.input, { color: colors.text, borderColor: colors.border }]}
          placeholder="Phone Number"
          placeholderTextColor={colors.secondaryText}
          value={newEmergencyContact.phone}
          onChangeText={(text) => setNewEmergencyContact(prev => ({ ...prev, phone: text }))}
          keyboardType="phone-pad"
        />
        <TouchableOpacity
          style={[styles.addButton, { backgroundColor: colors.primary }]}
          onPress={addEmergencyContact}
        >
          <Text style={styles.addButtonText}>Add Contact</Text>
        </TouchableOpacity>
      </View>
      {formData.emergencyContacts.map(item => (
        <View key={item.id} style={[styles.itemCard, { backgroundColor: colors.card }]}>
          <View style={styles.itemHeader}>
            <Text style={[styles.itemTitle, { color: colors.text }]}>{item.name}</Text>
            <TouchableOpacity onPress={() => removeItem('emergencyContacts', item.id)}>
              <MaterialIcons name="delete" size={20} color={colors.error} />
            </TouchableOpacity>
          </View>
          <Text style={[styles.itemText, { color: colors.secondaryText }]}>Relationship: {item.relationship}</Text>
          <Text style={[styles.itemText, { color: colors.secondaryText }]}>Phone: {item.phone}</Text>
        </View>
      ))}
    </View>
  );

  return (
    <SafeAreaView style={[styles.safeContainer, { backgroundColor: colors.background }]}>
      <StatusBar barStyle={isDarkMode ? 'light-content' : 'dark-content'} />
      
      {/* Custom Header */}
      <View style={[styles.header, { borderBottomColor: colors.border }]}>
        <Text style={[styles.headerTitle, { color: colors.text }]}>Complete Your Profile</Text>
      </View>

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.container}
      >
        <ScrollView contentContainerStyle={styles.scrollContent}>
          {/* Progress Indicator */}
          <View style={styles.progressContainer}>
            {[1, 2, 3, 4].map(step => (
              <View key={step} style={styles.progressStep}>
                <View
                  style={[
                    styles.progressCircle,
                    {
                      backgroundColor: step <= currentStep ? colors.primary : colors.border,
                    },
                  ]}
                >
                  <Text style={styles.progressText}>{step}</Text>
                </View>
                {step < 4 && (
                  <View
                    style={[
                      styles.progressLine,
                      {
                        backgroundColor: step < currentStep ? colors.primary : colors.border,
                      },
                    ]}
                  />
                )}
              </View>
            ))}
          </View>

          {/* Step Content */}
          {currentStep === 1 && renderStep1()}
          {currentStep === 2 && renderStep2()}
          {currentStep === 3 && renderStep3()}
          {currentStep === 4 && renderStep4()}

          {/* Navigation Buttons */}
          <View style={styles.navigationButtons}>
            {currentStep > 1 && (
              <TouchableOpacity
                style={[styles.navButton, { borderColor: colors.primary }]}
                onPress={() => setCurrentStep(currentStep - 1)}
              >
                <Text style={[styles.navButtonText, { color: colors.primary }]}>Previous</Text>
              </TouchableOpacity>
            )}
            {currentStep < 4 ? (
              <TouchableOpacity
                style={[styles.navButton, { backgroundColor: colors.primary }]}
                onPress={() => setCurrentStep(currentStep + 1)}
              >
                <Text style={styles.navButtonText}>Next</Text>
              </TouchableOpacity>
            ) : (
              <TouchableOpacity
                style={[styles.navButton, { backgroundColor: colors.primary }]}
                onPress={handleSubmit}
              >
                <Text style={styles.navButtonText}>Complete Setup</Text>
              </TouchableOpacity>
            )}
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
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
  scrollContent: {
    flexGrow: 1,
    padding: 20,
  },
  progressContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 30,
  },
  progressStep: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  progressCircle: {
    width: 30,
    height: 30,
    borderRadius: 15,
    alignItems: 'center',
    justifyContent: 'center',
  },
  progressText: {
    color: 'white',
    fontWeight: 'bold',
  },
  progressLine: {
    height: 2,
    width: 60,
    marginHorizontal: 10,
  },
  stepContainer: {
    marginBottom: 20,
  },
  stepTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  input: {
    height: 50,
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 15,
    marginBottom: 15,
    fontSize: 16,
  },
  bmiContainer: {
    marginBottom: 20,
    padding: 10,
    borderRadius: 12,
    backgroundColor: '#F0F0F0',
  },
  bmiText: {
    fontSize: 16,
    fontWeight: '500',
  },
  addItemContainer: {
    marginBottom: 20,
  },
  addButton: {
    height: 50,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
  },
  addButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  itemCard: {
    padding: 15,
    borderRadius: 12,
    marginBottom: 10,
  },
  itemHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  itemTitle: {
    fontSize: 16,
    fontWeight: '600',
  },
  itemText: {
    fontSize: 14,
    marginBottom: 5,
  },
  navigationButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 20,
  },
  navButton: {
    flex: 1,
    height: 50,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: 5,
    borderWidth: 1,
  },
  navButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  dateText: {
    fontSize: 16,
    paddingVertical: 12,
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    width: '90%',
    borderRadius: 12,
    padding: 20,
    alignItems: 'center',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  dateInputContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    marginBottom: 20,
  },
  dateInputWrapper: {
    flex: 1,
    marginHorizontal: 5,
  },
  dateLabel: {
    fontSize: 14,
    marginBottom: 5,
  },
  dateInput: {
    height: 50,
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 10,
    textAlign: 'center',
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
  },
  modalButton: {
    flex: 1,
    height: 50,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: 5,
    borderWidth: 1,
  },
  modalButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  bloodTypeList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    width: '100%',
    marginBottom: 20,
  },
  bloodTypeOption: {
    width: '48%',
    height: 50,
    borderRadius: 12,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
  },
  bloodTypeText: {
    fontSize: 16,
    fontWeight: '600',
  },
  addConditionButton: {
    height: 40,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 20,
    alignSelf: 'flex-end',
    marginTop: 10,
  },
  pickerText: {
    fontSize: 16,
    paddingVertical: 12,
  },
  optionsList: {
    width: '100%',
    marginBottom: 20,
  },
  optionItem: {
    width: '100%',
    height: 50,
    borderRadius: 12,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
  },
  optionText: {
    fontSize: 16,
    fontWeight: '500',
  },
  conditionCard: {
    borderRadius: 12,
    marginBottom: 10,
    padding: 15,
  },
  conditionContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  conditionName: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  conditionDetails: {
    fontSize: 14,
  },
  deleteButton: {
    padding: 4,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '600',
  },
});

export default PatientProfileSetup; 