import 'react-native-url-polyfill/auto';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { createClient } from '@supabase/supabase-js';
import { Platform } from 'react';

// Replace these with your Supabase project URL and anon key
const supabaseUrl = 'Enter_Suprtbase_URL_Here';
const supabaseAnonKey = 'Add_Anon_Key_Here';

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: AsyncStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});

// Network connectivity check
export const checkConnection = async () => {
  try {
    // First try to ping Supabase health check endpoint
    const healthCheck = await fetch('https://zphzemaxsbxlisnuolwy.supabase.co/rest/v1/health', {
      method: 'GET',
      headers: {
        'apikey': supabaseAnonKey,
        'Content-Type': 'application/json'
      }
    });
    
    if (healthCheck.ok) {
      console.log('✅ Supabase connection successful');
      return true;
    }

    // Fallback to a basic connection test
    const response = await fetch('https://zphzemaxsbxlisnuolwy.supabase.co/auth/v1/token?grant_type=password', {
      method: 'POST',
      headers: {
        'apikey': supabaseAnonKey,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({})
    });
    
    console.log('🔄 Connection test response:', response.status);
    return response.status !== 0;
  } catch (error) {
    console.error('Network connectivity error:', error);
    // Check if we're running on Android and log additional information
    if (Platform.OS === 'android') {
      console.log('💡 If on Android, check network security config and internet permission');
    }
    return false;
  }
};

// Error handling utility
const handleError = (error) => {
  // Check if it's a network error
  if (error.message === 'Network request failed' || error.name === 'TypeError') {
    return {
      error: {
        message: 'Unable to connect to the server. Please check your internet connection.',
        status: 0,
        details: 'Network Error'
      }
    };
  }

  if (error.message === 'Auth session missing!') {
    return { error: { message: 'Please sign in to continue', status: 401 } };
  }

  console.error('Supabase error:', error);
  return {
    error: {
      message: error.message || 'An unexpected error occurred',
      status: error.status || 500,
      details: error.details || null
    }
  };
};

// Auth helper functions
export const signUp = async ({ email, password, userData }) => {
  try {
    const { data: { user }, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: userData
      }
    });
    
    if (error) throw error;
    return { user, error: null };
  } catch (error) {
    return handleError(error);
  }
};

export const signIn = async ({ email, password }) => {
  try {
    const { data: { user, session }, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    
    if (error) throw error;
    return { user, session, error: null };
  } catch (error) {
    return handleError(error);
  }
};

export const signOut = async () => {
  try {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
    return { error: null };
  } catch (error) {
    return handleError(error);
  }
};

// Modified getCurrentUser with connection check
export const getCurrentUser = async () => {
  try {
    const isConnected = await checkConnection();
    if (!isConnected) {
      throw new Error('Network request failed');
    }

    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      throw new Error('Auth session missing!');
    }
    const { data: { user }, error } = await supabase.auth.getUser();
    if (error) throw error;
    return { user, error: null };
  } catch (error) {
    return handleError(error);
  }
};

// Profile management
export const createPatientProfile = async (profileData) => {
  try {
    const { data, error } = await supabase
      .from('patient_profiles')
      .insert([profileData])
      .select()
      .single();

    if (error) throw error;
    return { data, error: null };
  } catch (error) {
    return handleError(error);
  }
};

export const updatePatientProfile = async (userId, updates) => {
  try {
    const { data, error } = await supabase
      .from('patient_profiles')
      .update(updates)
      .eq('id', userId)
      .select()
      .single();

    if (error) throw error;
    return { data, error: null };
  } catch (error) {
    return handleError(error);
  }
};

export const getPatientProfile = async (userId) => {
  try {
    const { data, error } = await supabase
      .from('patient_profiles')
      .select(`
        *,
        medical_history (*),
        allergies (*),
        medications (*),
        emergency_contacts (*)
      `)
      .eq('id', userId)
      .single();

    if (error) throw error;
    return { data, error: null };
  } catch (error) {
    return handleError(error);
  }
};

// Medical History management
export const addMedicalHistory = async (historyData) => {
  try {
    const { data, error } = await supabase
      .from('medical_history')
      .insert([historyData])
      .select()
      .single();

    if (error) throw error;
    return { data, error: null };
  } catch (error) {
    return handleError(error);
  }
};

export const updateMedicalHistory = async (historyId, updates) => {
  try {
    const { data, error } = await supabase
      .from('medical_history')
      .update(updates)
      .eq('id', historyId)
      .select()
      .single();

    if (error) throw error;
    return { data, error: null };
  } catch (error) {
    return handleError(error);
  }
};

// Allergies management
export const addAllergy = async (allergyData) => {
  try {
    const { data, error } = await supabase
      .from('allergies')
      .insert([allergyData])
      .select()
      .single();

    if (error) throw error;
    return { data, error: null };
  } catch (error) {
    return handleError(error);
  }
};

export const updateAllergy = async (allergyId, updates) => {
  try {
    const { data, error } = await supabase
      .from('allergies')
      .update(updates)
      .eq('id', allergyId)
      .select()
      .single();

    if (error) throw error;
    return { data, error: null };
  } catch (error) {
    return handleError(error);
  }
};

// Medications management
export const addMedication = async (medicationData) => {
  try {
    const { data, error } = await supabase
      .from('medications')
      .insert([medicationData])
      .select()
      .single();

    if (error) throw error;
    return { data, error: null };
  } catch (error) {
    return handleError(error);
  }
};

export const updateMedication = async (medicationId, updates) => {
  try {
    const { data, error } = await supabase
      .from('medications')
      .update(updates)
      .eq('id', medicationId)
      .select()
      .single();

    if (error) throw error;
    return { data, error: null };
  } catch (error) {
    return handleError(error);
  }
};

// Emergency Contacts management
export const addEmergencyContact = async (contactData) => {
  try {
    const { data, error } = await supabase
      .from('emergency_contacts')
      .insert([contactData])
      .select()
      .single();

    if (error) throw error;
    return { data, error: null };
  } catch (error) {
    return handleError(error);
  }
};

export const updateEmergencyContact = async (contactId, updates) => {
  try {
    const { data, error } = await supabase
      .from('emergency_contacts')
      .update(updates)
      .eq('id', contactId)
      .select()
      .single();

    if (error) throw error;
    return { data, error: null };
  } catch (error) {
    return handleError(error);
  }
};

// Delete functions
export const deleteMedicalHistory = async (historyId) => {
  try {
    const { error } = await supabase
      .from('medical_history')
      .delete()
      .eq('id', historyId);

    if (error) throw error;
    return { error: null };
  } catch (error) {
    return handleError(error);
  }
};

export const deleteAllergy = async (allergyId) => {
  try {
    const { error } = await supabase
      .from('allergies')
      .delete()
      .eq('id', allergyId);

    if (error) throw error;
    return { error: null };
  } catch (error) {
    return handleError(error);
  }
};

export const deleteMedication = async (medicationId) => {
  try {
    const { error } = await supabase
      .from('medications')
      .delete()
      .eq('id', medicationId);

    if (error) throw error;
    return { error: null };
  } catch (error) {
    return handleError(error);
  }
};

export const deleteEmergencyContact = async (contactId) => {
  try {
    const { error } = await supabase
      .from('emergency_contacts')
      .delete()
      .eq('id', contactId);

    if (error) throw error;
    return { error: null };
  } catch (error) {
    return handleError(error);
  }
}; 
