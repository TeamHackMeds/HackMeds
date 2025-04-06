import React from "react";
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { MenuProvider } from "react-native-popup-menu";
import HomeScreen from "./HomeScreen";
import SymptomCheckerScreen from "./SymptomCheckerScreen";
import ReportAnalysisScreen from "./ReportAnalysisScreen";
import PrecautionaryMeasuresScreen from "./PrecautionaryMeasuresScreen";
import ChatWithDoctorScreen from "./ChatWithDoctorScreen";
import FindHealthcareScreen from "./FindHealthcareScreen";
import ProfileScreen from "./ProfileScreen";
import SettingsScreen from "./SettingsScreen";
import { ThemeProvider } from './ThemeContext';
import AuthScreen from './AuthScreen';
import PatientProfileSetup from './PatientProfileSetup';
import { AuthProvider, useAuth } from './lib/AuthContext';

const Stack = createNativeStackNavigator();

const NavigationWrapper = () => {
  const { user, loading } = useAuth();

  if (loading) {
    // You might want to show a loading screen here
    return null;
  }

  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
        gestureEnabled: true,
        animation: 'slide_from_right',
      }}
      initialRouteName={user ? 'Home' : 'Auth'}
    >
      <Stack.Group>
        <Stack.Screen 
          name="Auth" 
          component={AuthScreen}
          options={{
            gestureEnabled: false
          }}
        />
        <Stack.Screen 
          name="PatientProfileSetup" 
          component={PatientProfileSetup}
          options={{
            headerShown: false,
            gestureEnabled: false
          }}
        />
        <Stack.Screen 
          name="Home" 
          component={HomeScreen}
          options={{
            gestureEnabled: false,
            headerShown: false,
            headerLeft: null
          }}
          initialParams={{ patientData: null }}
        />
        <Stack.Screen 
          name="Profile" 
          component={ProfileScreen}
          options={{
            headerShown: false
          }}
        />
        <Stack.Screen 
          name="Settings" 
          component={SettingsScreen}
          options={{
            headerShown: false
          }}
        />
        <Stack.Screen 
          name="ChatWithDoctor" 
          component={ChatWithDoctorScreen}
          options={{
            headerShown: true,
            headerTitle: 'Chat with Doctor'
          }}
        />
        <Stack.Screen 
          name="SymptomChecker" 
          component={SymptomCheckerScreen}
          options={{
            headerShown: true,
            headerTitle: 'Symptom Checker'
          }}
        />
        <Stack.Screen 
          name="ReportAnalysis" 
          component={ReportAnalysisScreen}
          options={{
            headerShown: true,
            headerTitle: 'Report Analysis'
          }}
        />
        <Stack.Screen 
          name="PrecautionaryMeasures" 
          component={PrecautionaryMeasuresScreen}
          options={{
            headerShown: true,
            headerTitle: 'Precautionary Measures'
          }}
        />
        <Stack.Screen 
          name="FindHealthcare" 
          component={FindHealthcareScreen}
          options={{
            headerShown: true,
            headerTitle: 'Find Healthcare'
          }}
        />
      </Stack.Group>
    </Stack.Navigator>
  );
};

export default function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <NavigationContainer>
          <MenuProvider>
            <NavigationWrapper />
          </MenuProvider>
        </NavigationContainer>
      </AuthProvider>
    </ThemeProvider>
  );
}
