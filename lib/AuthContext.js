import React, { createContext, useState, useContext, useEffect } from 'react';
import { supabase, getCurrentUser, checkConnection } from './supabase';
import { View, Text, TouchableOpacity } from 'react-native';

const AuthContext = createContext({});

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [networkError, setNetworkError] = useState(false);

  const retryConnection = async () => {
    setLoading(true);
    setNetworkError(false);
    await checkUser();
  };

  useEffect(() => {
    // Check active sessions and sets the user
    checkUser();

    // Listen for auth state changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log('Auth state changed:', event);
      try {
        if (event === 'SIGNED_IN') {
          const { user: currentUser, error } = await getCurrentUser();
          if (error) {
            if (error.status === 0) {
              setNetworkError(true);
            }
            throw error;
          }
          setUser(currentUser);
          setNetworkError(false);
        } else if (event === 'SIGNED_OUT') {
          setUser(null);
          setNetworkError(false);
        }
      } catch (error) {
        console.error('Error in auth state change:', error);
      } finally {
        setLoading(false);
      }
    });

    return () => {
      subscription?.unsubscribe();
    };
  }, []);

  const checkUser = async () => {
    try {
      const isConnected = await checkConnection();
      if (!isConnected) {
        setNetworkError(true);
        throw new Error('Network request failed');
      }

      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        const { user: currentUser, error } = await getCurrentUser();
        if (error) {
          if (error.status === 0) {
            setNetworkError(true);
          }
          throw error;
        }
        setUser(currentUser);
        setNetworkError(false);
      }
    } catch (error) {
      console.error('Error checking user:', error.message);
    } finally {
      setLoading(false);
    }
  };

  const value = {
    user,
    loading,
    networkError,
    retryConnection,
    setUser,
  };

  // Show network error message if there's no connection
  if (networkError && !loading) {
    return (
      <AuthContext.Provider value={value}>
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <Text>Unable to connect to the server</Text>
          <TouchableOpacity onPress={retryConnection} style={{ marginTop: 10, padding: 10 }}>
            <Text>Retry Connection</Text>
          </TouchableOpacity>
        </View>
      </AuthContext.Provider>
    );
  }

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};

// Custom hook to use the auth context
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}; 