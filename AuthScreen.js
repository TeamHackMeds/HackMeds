import React, { useState, useContext, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  ScrollView,
  SafeAreaView,
  StatusBar,
  KeyboardAvoidingView,
  Platform,
  Modal,
  Alert,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { ThemeContext } from './ThemeContext';
import { useAuth } from './lib/AuthContext';
import { signIn, signUp, createPatientProfile, getPatientProfile } from './lib/supabase';

const AuthScreen = ({ route, navigation }) => {
  const { colors } = useContext(ThemeContext);
  const { setUser } = useAuth();
  const [isLogin, setIsLogin] = useState(true);
  const [userType, setUserType] = useState('patient'); // 'patient' or 'doctor'
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    name: '',
    phone: '',
    // Patient specific fields
    dateOfBirth: '',
    height: '',
    weight: '',
    bloodType: '',
    medicalHistory: [],
    allergies: [],
    emergencyContacts: [],
  });

  const [showDatePicker, setShowDatePicker] = useState(false);
  const [day, setDay] = useState('');
  const [month, setMonth] = useState('');
  const [year, setYear] = useState('');

  // Handle completed profile data and login success
  useEffect(() => {
    if (route.params?.action === 'COMPLETE_SIGNUP' && route.params?.patientData) {
      const { patientData } = route.params;
      handleCompleteSignup(patientData);
    } else if (route.params?.action === 'LOGIN_SUCCESS') {
      // Navigate based on user type
      if (userType === 'patient') {
        navigation.navigate('Auth');
      } else {
        navigation.navigate('Auth');
      }
    }
  }, [route.params]);

  const handleCompleteSignup = async (patientData) => {
    try {
      // First create the auth user
      const { user, error: signUpError } = await signUp({
        email: patientData.email,
        password: patientData.password,
        userData: {
          name: patientData.name,
          userType: 'patient'
        }
      });

      if (signUpError) {
        console.error('Signup error:', signUpError);
        throw signUpError;
      }

      // Then create the patient profile with all fields
      const { data: profile, error: profileError } = await createPatientProfile({
        id: user.id,
        name: patientData.name,
        email: patientData.email,
        phone: patientData.phone || '',
        date_of_birth: patientData.dateOfBirth || '',
        gender: patientData.gender || '',
        blood_type: patientData.bloodType || '',
        height: patientData.height || '',
        weight: patientData.weight || '',
        bmi: patientData.bmi || '',
        notifications: true,
        language: 'en',
        medical_history: patientData.medicalHistory || [],
        allergies: patientData.allergies || [],
        emergency_contacts: patientData.emergencyContacts || []
      });

      if (profileError) {
        console.error('Profile creation error:', profileError);
        throw profileError;
      }

      console.log('Profile created successfully:', profile);

      Alert.alert(
        'Success',
        'Your profile has been created successfully!',
        [
          {
            text: 'OK',
            onPress: () => {
              setIsLogin(true);
              setFormData(prev => ({
                ...prev,
                email: patientData.email,
                password: patientData.password
              }));
              Alert.alert(
                'Profile Created',
                'Please sign in with your email and password.',
                [{ text: 'OK' }]
              );
            },
          },
        ]
      );
    } catch (error) {
      console.error('Error completing signup:', error);
      Alert.alert(
        'Error',
        error.message || 'There was an error creating your profile. Please try again.'
      );
    }
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

  const handleSignup = () => {
    // Validate required fields
    if (!formData.email || !formData.password || !formData.confirmPassword || !formData.name) {
      Alert.alert('Error', 'Please fill in all required fields');
      return;
    }

    // Validate password match
    if (formData.password !== formData.confirmPassword) {
      Alert.alert('Error', 'Passwords do not match');
      return;
    }

    if (userType === 'patient') {
      const cleanFormData = {
        email: formData.email.trim(),
        password: formData.password,
        confirmPassword: formData.confirmPassword,
        name: formData.name.trim(),
        phone: formData.phone ? formData.phone.trim() : '',
        dateOfBirth: formData.dateOfBirth || '',
        height: '',
        weight: '',
        bloodType: '',
        medicalHistory: [],
        allergies: [],
        emergencyContacts: []
      };

      // Navigate to PatientProfileSetup using replace
      navigation.replace('PatientProfileSetup', {
        formData: cleanFormData
      });
    } else {
      navigation.navigate('DoctorHome');
    }
  };

  const handleLogin = async () => {
    try {
      if (!formData.email || !formData.password) {
        Alert.alert('Error', 'Please enter your email and password');
        return;
      }

      console.log('Attempting login for:', formData.email);

      // Authenticate with Supabase
      const { user, session, error: signInError } = await signIn({
        email: formData.email,
        password: formData.password
      });

      if (signInError) {
        console.error('Sign in error:', signInError);
        throw signInError;
      }

      console.log('Authentication successful, fetching profile...');

      // Get the patient profile with related data
      const { data: patientData, error: profileError } = await getPatientProfile(user.id);
      
      if (profileError) {
        console.error('Profile fetch error:', profileError);
        throw profileError;
      }

      if (!patientData) {
        throw new Error('No profile data found');
      }

      console.log('Profile data retrieved:', patientData);

      // Set the user in the auth context with the complete profile data
      setUser({
        ...user,
        profile: patientData
      });

      // Navigate to Home screen with complete patient data
      navigation.replace('Home', { 
        patientData: {
          ...patientData,
          medicalHistory: patientData.medical_history || [],
          allergies: patientData.allergies || [],
          emergencyContacts: patientData.emergency_contacts || []
        }
      });
    } catch (error) {
      console.error('Login error:', error);
      Alert.alert(
        'Error',
        error.message || 'Invalid email or password. Please try again.'
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
              <Text style={[styles.modalButtonText, { color: 'white' }]}>Confirm</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );

  return (
    <SafeAreaView style={[styles.safeContainer, { backgroundColor: colors.background }]}>
      <StatusBar barStyle="dark-content" backgroundColor={colors.background} />
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.container}
      >
        <ScrollView contentContainerStyle={styles.scrollContent}>
          {/* Header */}
          <View style={styles.header}>
            <Text style={[styles.title, { color: colors.text }]}>
              {isLogin ? 'Welcome Back' : 'Create Account'}
            </Text>
            <Text style={[styles.subtitle, { color: colors.secondaryText }]}>
              {isLogin ? 'Sign in to continue' : 'Sign up to get started'}
            </Text>
          </View>

          {/* User Type Selection */}
          <View style={styles.userTypeContainer}>
            <TouchableOpacity
              style={[
                styles.userTypeButton,
                userType === 'patient' && { backgroundColor: colors.primary }
              ]}
              onPress={() => setUserType('patient')}
            >
              <MaterialIcons
                name="person"
                size={24}
                color={userType === 'patient' ? 'white' : colors.text}
              />
              <Text
                style={[
                  styles.userTypeText,
                  { color: userType === 'patient' ? 'white' : colors.text }
                ]}
              >
                Patient
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.userTypeButton,
                userType === 'doctor' && { backgroundColor: colors.primary }
              ]}
              onPress={() => setUserType('doctor')}
            >
              <MaterialIcons
                name="medical-services"
                size={24}
                color={userType === 'doctor' ? 'white' : colors.text}
              />
              <Text
                style={[
                  styles.userTypeText,
                  { color: userType === 'doctor' ? 'white' : colors.text }
                ]}
              >
                Doctor
              </Text>
            </TouchableOpacity>
          </View>

          {/* Form */}
          <View style={styles.form}>
            {!isLogin && (
              <TextInput
                style={[styles.input, { color: colors.text, borderColor: colors.border }]}
                placeholder="Full Name"
                placeholderTextColor={colors.secondaryText}
                value={formData.name}
                onChangeText={(text) => handleInputChange('name', text)}
              />
            )}
            <TextInput
              style={[styles.input, { color: colors.text, borderColor: colors.border }]}
              placeholder="Email"
              placeholderTextColor={colors.secondaryText}
              value={formData.email}
              onChangeText={(text) => handleInputChange('email', text)}
              keyboardType="email-address"
              autoCapitalize="none"
            />
            <TextInput
              style={[styles.input, { color: colors.text, borderColor: colors.border }]}
              placeholder="Password"
              placeholderTextColor={colors.secondaryText}
              value={formData.password}
              onChangeText={(text) => handleInputChange('password', text)}
              secureTextEntry
            />
            {!isLogin && (
              <TextInput
                style={[styles.input, { color: colors.text, borderColor: colors.border }]}
                placeholder="Confirm Password"
                placeholderTextColor={colors.secondaryText}
                value={formData.confirmPassword}
                onChangeText={(text) => handleInputChange('confirmPassword', text)}
                secureTextEntry
              />
            )}
            {!isLogin && userType === 'patient' && (
              <>
                <TextInput
                  style={[styles.input, { color: colors.text, borderColor: colors.border }]}
                  placeholder="Phone Number"
                  placeholderTextColor={colors.secondaryText}
                  value={formData.phone}
                  onChangeText={(text) => handleInputChange('phone', text)}
                  keyboardType="phone-pad"
                />
                <TouchableOpacity
                  style={[styles.input, { borderColor: colors.border }]}
                  onPress={() => setShowDatePicker(true)}
                >
                  <Text style={[styles.dateText, { color: formData.dateOfBirth ? colors.text : colors.secondaryText }]}>
                    {formData.dateOfBirth || 'Date of Birth (DD-MM-YYYY)'}
                  </Text>
                </TouchableOpacity>
              </>
            )}
          </View>

          {/* Action Button */}
          <TouchableOpacity
            style={[styles.button, { backgroundColor: colors.primary }]}
            onPress={isLogin ? handleLogin : handleSignup}
          >
            <Text style={styles.buttonText}>
              {isLogin ? 'Sign In' : 'Sign Up'}
            </Text>
          </TouchableOpacity>

          {/* Toggle Login/Signup */}
          <TouchableOpacity
            style={styles.toggleButton}
            onPress={() => setIsLogin(!isLogin)}
          >
            <Text style={[styles.toggleText, { color: colors.primary }]}>
              {isLogin
                ? "Don't have an account? Sign Up"
                : 'Already have an account? Sign In'}
            </Text>
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>
      {renderDatePicker()}
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
  header: {
    marginBottom: 32,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 16,
  },
  userTypeContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 30,
  },
  userTypeButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 15,
    marginHorizontal: 5,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  userTypeText: {
    marginLeft: 8,
    fontSize: 16,
    fontWeight: '500',
  },
  form: {
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
  button: {
    height: 50,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  toggleButton: {
    alignItems: 'center',
  },
  toggleText: {
    fontSize: 16,
    fontWeight: '500',
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
    fontSize: 16,
    fontWeight: '600',
  },
  dateText: {
    fontSize: 16,
    paddingVertical: 12,
  },
});

export default AuthScreen; 