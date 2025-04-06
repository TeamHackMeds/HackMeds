import React, { useState, useContext } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, SafeAreaView, StatusBar, TouchableWithoutFeedback, ScrollView } from 'react-native';
import { Entypo, FontAwesome5, MaterialIcons, Fontisto, AntDesign } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { ThemeContext } from './ThemeContext';

const HomeScreen = ({ navigation, route }) => {
  const { isDarkMode, colors } = useContext(ThemeContext);
  const [menuVisible, setMenuVisible] = useState(false);
  const patientData = route.params?.patientData;

  const MenuOption = ({ title, icon, onPress }) => (
    <TouchableOpacity 
      style={[styles.menuOption, { borderBottomColor: colors.border }]} 
      onPress={() => {
        onPress();
        setMenuVisible(false);
      }}
    >
      <AntDesign name={icon} size={20} color={colors.primary} style={styles.menuIcon} />
      <Text style={[styles.menuOptionText, { color: colors.text }]}>{title}</Text>
    </TouchableOpacity>
  );

  const GridButton = ({ icon, title, gradient, screenName }) => (
    <TouchableOpacity 
      style={styles.buttonWrapper}
      onPress={() => navigation.navigate(screenName)}
    >
      <LinearGradient
        colors={gradient}
        style={styles.button}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        {icon}
        <Text style={styles.buttonText}>{title}</Text>
      </LinearGradient>
    </TouchableOpacity>
  );

  const toggleMenu = () => {
    setMenuVisible(!menuVisible);
  };

  const renderProfileSummary = () => {
    if (!patientData) return null;

    return (
      <View style={[styles.profileSummary, { backgroundColor: colors.card }]}>
        <View style={styles.profileHeader}>
          <View>
            <Text style={[styles.welcomeText, { color: colors.secondaryText }]}>Welcome back,</Text>
            <Text style={[styles.userName, { color: colors.text }]}>{patientData.name}</Text>
          </View>
          <TouchableOpacity 
            style={[styles.bmiCard, { backgroundColor: colors.primary + '20' }]}
            onPress={() => navigation.navigate('Profile')}
          >
            <Text style={[styles.bmiLabel, { color: colors.primary }]}>BMI</Text>
            <Text style={[styles.bmiValue, { color: colors.primary }]}>{patientData.bmi}</Text>
          </TouchableOpacity>
        </View>
        <View style={styles.profileStats}>
          <View style={styles.statItem}>
            <Text style={[styles.statLabel, { color: colors.secondaryText }]}>Blood Type</Text>
            <Text style={[styles.statValue, { color: colors.text }]}>{patientData.bloodType}</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Text style={[styles.statLabel, { color: colors.secondaryText }]}>Height</Text>
            <Text style={[styles.statValue, { color: colors.text }]}>{patientData.height} cm</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Text style={[styles.statLabel, { color: colors.secondaryText }]}>Weight</Text>
            <Text style={[styles.statValue, { color: colors.text }]}>{patientData.weight} kg</Text>
          </View>
        </View>
        {patientData.allergies.length > 0 && (
          <View style={styles.alertSection}>
            <MaterialIcons name="warning" size={20} color={colors.error} />
            <Text style={[styles.alertText, { color: colors.error }]}>
              {patientData.allergies.length} Allergy Alert{patientData.allergies.length > 1 ? 's' : ''}
            </Text>
          </View>
        )}
      </View>
    );
  };

  return (
    <SafeAreaView style={[styles.safeContainer, { backgroundColor: colors.background }]}>
      <StatusBar barStyle={isDarkMode ? "light-content" : "dark-content"} backgroundColor={colors.background} />
      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
        <View style={styles.container}>
          {/* Header */}
          <View style={styles.header}>
            <View>
              <Text style={[styles.welcomeText, { color: colors.secondaryText }]}>Healthcare</Text>
              <Text style={[styles.title, { color: colors.text }]}>Assistant</Text>
            </View>
            <View>
              <TouchableOpacity onPress={toggleMenu} style={styles.menuTrigger}>
                <Entypo name="dots-three-vertical" size={24} color={colors.primary} />
              </TouchableOpacity>
              
              {menuVisible && (
                <View style={[styles.dropdownContainer, { backgroundColor: colors.card }]}>
                  <MenuOption 
                    title="Profile" 
                    icon="user"
                    onPress={() => navigation.navigate('Profile', { patientData })}
                  />
                  <MenuOption 
                    title="Settings" 
                    icon="setting"
                    onPress={() => navigation.navigate('Settings')}
                  />
                  <MenuOption 
                    title="Logout" 
                    icon="logout"
                    onPress={() => navigation.reset({
                      index: 0,
                      routes: [{ name: 'Auth' }],
                    })}
                  />
                </View>
              )}
            </View>
          </View>

          {/* Profile Summary */}
          {renderProfileSummary()}

          {/* Background touchable to close the menu */}
          {menuVisible && (
            <TouchableWithoutFeedback onPress={() => setMenuVisible(false)}>
              <View style={styles.backdrop} />
            </TouchableWithoutFeedback>
          )}

          {/* Buttons Grid */}
          <View style={styles.grid}>
            <GridButton
              icon={<FontAwesome5 name="clipboard-list" size={32} color="white" style={styles.buttonIcon} />}
              title="Symptom Checker"
              gradient={['#4facfe', '#00f2fe']}
              screenName="SymptomChecker"
            />
            <GridButton
              icon={<MaterialIcons name="analytics" size={32} color="white" style={styles.buttonIcon} />}
              title="Report Analysis"
              gradient={['#667eea', '#764ba2']}
              screenName="ReportAnalysis"
            />
            <GridButton
              icon={<FontAwesome5 name="shield-alt" size={32} color="white" style={styles.buttonIcon} />}
              title="Precautionary Measures"
              gradient={['#43e97b', '#38f9d7']}
              screenName="PrecautionaryMeasures"
            />
            <GridButton
              icon={<Fontisto name="doctor" size={32} color="white" style={styles.buttonIcon} />}
              title="Chat with AI Doctor"
              gradient={['#fa709a', '#fee140']}
              screenName="ChatWithDoctor"
            />
            <GridButton
              icon={<MaterialIcons name="local-hospital" size={32} color="white" style={styles.buttonIcon} />}
              title="Find Healthcare"
              gradient={['#ff9a9e', '#fad0c4']}
              screenName="FindHealthcare"
            />
          </View>

          {/* Quick Access Section */}
          <View style={styles.quickAccess}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>Quick Access</Text>
            <TouchableOpacity style={[styles.quickAccessButton, { backgroundColor: colors.card }]}>
              <AntDesign name="calendar" size={24} color={colors.primary} />
              <Text style={[styles.quickAccessText, { color: colors.text }]}>Appointments</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.quickAccessButton, { backgroundColor: colors.card }]}>
              <AntDesign name="medicinebox" size={24} color={colors.primary} />
              <Text style={[styles.quickAccessText, { color: colors.text }]}>Medications</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

// Styles
const styles = StyleSheet.create({
  safeContainer: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
  },
  container: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 40,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 30,
    zIndex: 10,
  },
  welcomeText: {
    fontSize: 16,
    marginBottom: 4,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
  },
  menuTrigger: {
    padding: 10,
  },
  backdrop: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 1,
  },
  dropdownContainer: {
    position: 'absolute',
    right: 0,
    top: 50,
    width: 200,
    borderRadius: 12,
    padding: 5,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
    zIndex: 100,
  },
  menuOption: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderBottomWidth: 1,
  },
  menuIcon: {
    marginRight: 12,
  },
  menuOptionText: {
    fontSize: 16,
  },
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    marginBottom: 24,
    zIndex: 0,
  },
  buttonWrapper: {
    width: "48%",
    marginBottom: 15,
  },
  button: {
    aspectRatio: 1,
    borderRadius: 20,
    padding: 15,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  buttonIcon: {
    marginBottom: 12,
  },
  buttonText: {
    fontSize: 16,
    fontWeight: "600",
    textAlign: "center",
    color: "white",
  },
  quickAccess: {
    marginTop: 10,
    zIndex: 0,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "600",
    marginBottom: 15,
  },
  quickAccessButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 15,
    borderRadius: 12,
    marginBottom: 10,
  },
  quickAccessText: {
    marginLeft: 12,
    fontSize: 16,
    fontWeight: '500',
  },
  profileSummary: {
    borderRadius: 20,
    padding: 20,
    marginBottom: 24,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
  },
  profileHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  userName: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  bmiCard: {
    padding: 12,
    borderRadius: 12,
    alignItems: 'center',
  },
  bmiLabel: {
    fontSize: 12,
    fontWeight: '600',
    marginBottom: 4,
  },
  bmiValue: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  profileStats: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  statLabel: {
    fontSize: 12,
    marginBottom: 4,
  },
  statValue: {
    fontSize: 16,
    fontWeight: '600',
  },
  statDivider: {
    width: 1,
    height: 30,
    backgroundColor: '#E0E0E0',
  },
  alertSection: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFE5E5',
    padding: 10,
    borderRadius: 10,
  },
  alertText: {
    marginLeft: 8,
    fontSize: 14,
    fontWeight: '500',
  },
});

export default HomeScreen;
