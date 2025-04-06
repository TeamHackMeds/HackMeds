import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
  StatusBar,
  Image,
  FlatList,
  Linking,
  ActivityIndicator,
  Alert,
  TextInput,
  Modal,
  PermissionsAndroid,
  Platform
} from 'react-native';
import { Ionicons, MaterialIcons, FontAwesome5, AntDesign } from '@expo/vector-icons';
import * as Location from 'expo-location';
import MapView, { Marker, PROVIDER_GOOGLE } from 'react-native-maps';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Cache duration in milliseconds (1 hour)
const CACHE_DURATION = 60 * 60 * 1000;

const FindHealthcareScreen = ({ navigation }) => {
  const [location, setLocation] = useState(null);
  const [errorMsg, setErrorMsg] = useState(null);
  const [healthcareFacilities, setHealthcareFacilities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedFacility, setSelectedFacility] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState({
    type: 'all',
    distance: 5,
    emergencyOnly: false,
    rating: 0
  });

  // Cache key based on location
  const getCacheKey = (latitude, longitude) => 
    `healthcare_facilities_${latitude.toFixed(4)}_${longitude.toFixed(4)}`;

  // Load cached data
  const loadCachedData = async (latitude, longitude) => {
    try {
      const cacheKey = getCacheKey(latitude, longitude);
      const cachedData = await AsyncStorage.getItem(cacheKey);
      
      if (cachedData) {
        const { data, timestamp } = JSON.parse(cachedData);
        if (Date.now() - timestamp < CACHE_DURATION) {
          return data;
        }
      }
      return null;
    } catch (error) {
      console.error('Error loading cached data:', error);
      return null;
    }
  };

  // Save data to cache
  const saveToCache = async (latitude, longitude, data) => {
    try {
      const cacheKey = getCacheKey(latitude, longitude);
      const cacheData = {
        data,
        timestamp: Date.now()
      };
      await AsyncStorage.setItem(cacheKey, JSON.stringify(cacheData));
    } catch (error) {
      console.error('Error saving to cache:', error);
    }
  };

  // Enhanced facility information using multiple sources
  const enhanceFacilityInfo = async (facility) => {
    try {
      // Get additional details from OpenStreetMap
      const detailsResponse = await fetch(
        `https://nominatim.openstreetmap.org/details?osmtype=${facility.osm_type}&osmid=${facility.osm_id}&format=json`
      );
      const details = await detailsResponse.json();

      // Get Wikipedia information if available
      let wikipediaInfo = null;
      if (details.wikipedia) {
        const wikiResponse = await fetch(
          `https://en.wikipedia.org/w/api.php?action=query&prop=extracts&exintro=true&explaintext=true&titles=${details.wikipedia}&format=json&origin=*`
        );
        const wikiData = await wikiResponse.json();
        wikipediaInfo = wikiData.query.pages[Object.keys(wikiData.query.pages)[0]]?.extract;
      }

      return {
        ...facility,
        description: wikipediaInfo || 'No additional information available',
        openingHours: details.opening_hours || 'Not available',
        website: details.website || 'Not available',
        email: details.email || 'Not available'
      };
    } catch (error) {
      console.error('Error enhancing facility info:', error);
      return facility;
    }
  };

  // Request location permission
  const requestLocationPermission = async () => {
    try {
      if (Platform.OS === 'android') {
        const granted = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
          {
            title: 'Location Permission',
            message: 'This app needs access to your location to find nearby healthcare facilities.',
            buttonNeutral: 'Ask Me Later',
            buttonNegative: 'Cancel',
            buttonPositive: 'OK',
          }
        );
        if (granted !== PermissionsAndroid.RESULTS.GRANTED) {
          setErrorMsg('Location permission denied');
          setLoading(false);
          return false;
        }
      }
      return true;
    } catch (err) {
      console.error('Error requesting location permission:', err);
      setErrorMsg('Error requesting location permission');
      setLoading(false);
      return false;
    }
  };

  // Get current location
  const getCurrentLocation = async () => {
    try {
      const hasPermission = await requestLocationPermission();
      if (!hasPermission) return;

      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        setErrorMsg('Permission to access location was denied');
        setLoading(false);
        return;
      }

      const location = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.High,
        timeout: 10000, // 10 seconds timeout
      });
      setLocation(location);
      return location;
    } catch (error) {
      console.error('Error getting location:', error);
      setErrorMsg('Error getting location. Please try again.');
      setLoading(false);
      return null;
    }
  };

  // Fetch nearby healthcare facilities
  const fetchNearbyHealthcareFacilities = async (latitude, longitude) => {
    try {
      // Demo data for prototype
      const demoFacilities = [
        {
          id: '1',
          name: 'City General Hospital',
          address: '123 Medical Center Drive, City, State 12345',
          rating: '4.5',
          type: 'Hospital',
          coordinates: {
            latitude: latitude + 0.01,
            longitude: longitude + 0.01,
          },
          phone: '+1 (555) 123-4567',
          emergency: true,
          specialties: ['Emergency Care', 'General Medicine', 'Pediatrics'],
        },
        {
          id: '2',
          name: 'Community Health Clinic',
          address: '456 Wellness Avenue, City, State 12345',
          rating: '4.2',
          type: 'Clinic',
          coordinates: {
            latitude: latitude - 0.01,
            longitude: longitude - 0.01,
          },
          phone: '+1 (555) 234-5678',
          emergency: false,
          specialties: ['Primary Care', 'Family Medicine'],
        },
        {
          id: '3',
          name: 'Regional Medical Center',
          address: '789 Hospital Road, City, State 12345',
          rating: '4.7',
          type: 'Hospital',
          coordinates: {
            latitude: latitude + 0.02,
            longitude: longitude - 0.02,
          },
          phone: '+1 (555) 345-6789',
          emergency: true,
          specialties: ['Cardiology', 'Neurology', 'Oncology'],
        },
        {
          id: '4',
          name: 'Family Care Clinic',
          address: '321 Health Street, City, State 12345',
          rating: '4.0',
          type: 'Clinic',
          coordinates: {
            latitude: latitude - 0.02,
            longitude: longitude + 0.02,
          },
          phone: '+1 (555) 456-7890',
          emergency: false,
          specialties: ['Family Medicine', 'Pediatrics'],
        }
      ];

      // Add distance information
      const facilitiesWithDistance = demoFacilities.map(facility => ({
        ...facility,
        distance: formatDistance(
          calculateDistance(
            latitude,
            longitude,
            facility.coordinates.latitude,
            facility.coordinates.longitude
          )
        )
      }));

      setHealthcareFacilities(facilitiesWithDistance);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching healthcare facilities:', error);
      setErrorMsg('Unable to fetch nearby healthcare facilities. Please try again later.');
      setLoading(false);
    }
  };

  // Initialize location and fetch facilities
  useEffect(() => {
    const initializeLocation = async () => {
      const currentLocation = await getCurrentLocation();
      if (currentLocation) {
        await fetchNearbyHealthcareFacilities(
          currentLocation.coords.latitude,
          currentLocation.coords.longitude
        );
      }
    };

    initializeLocation();
  }, []);

  // Filter and search facilities
  const filteredFacilities = healthcareFacilities.filter(facility => {
    const matchesSearch = facility.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         facility.address.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesType = filters.type === 'all' || 
                       (filters.type === 'hospital' && facility.type === 'Hospital') ||
                       (filters.type === 'clinic' && facility.type === 'Clinic');
    
    const matchesEmergency = !filters.emergencyOnly || facility.emergency;
    
    const distance = parseFloat(facility.distance);
    const matchesDistance = distance <= filters.distance;
    
    return matchesSearch && matchesType && matchesEmergency && matchesDistance;
  });

  // Filter modal component
  const FilterModal = () => (
    <Modal
      visible={showFilters}
      animationType="slide"
      transparent={true}
      onRequestClose={() => setShowFilters(false)}
    >
      <View style={styles.modalContainer}>
        <View style={styles.modalContent}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Filter Facilities</Text>
            <TouchableOpacity onPress={() => setShowFilters(false)}>
              <Ionicons name="close" size={24} color="#333" />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.filterOptions}>
            <View style={styles.filterSection}>
              <Text style={styles.filterLabel}>Facility Type</Text>
              <View style={styles.filterButtons}>
                {['all', 'hospital', 'clinic'].map(type => (
                  <TouchableOpacity
                    key={type}
                    style={[
                      styles.filterButton,
                      filters.type === type && styles.filterButtonActive
                    ]}
                    onPress={() => setFilters({ ...filters, type })}
                  >
                    <Text style={[
                      styles.filterButtonText,
                      filters.type === type && styles.filterButtonTextActive
                    ]}>
                      {type.charAt(0).toUpperCase() + type.slice(1)}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            <View style={styles.filterSection}>
              <Text style={styles.filterLabel}>Maximum Distance (km)</Text>
              <View style={styles.sliderContainer}>
                <Text style={styles.sliderValue}>{filters.distance} km</Text>
                <View style={styles.slider}>
                  {[1, 2, 3, 4, 5].map(value => (
                    <TouchableOpacity
                      key={value}
                      style={[
                        styles.sliderDot,
                        filters.distance >= value && styles.sliderDotActive
                      ]}
                      onPress={() => setFilters({ ...filters, distance: value })}
                    />
                  ))}
                </View>
              </View>
            </View>

            <View style={styles.filterSection}>
              <TouchableOpacity
                style={styles.checkboxContainer}
                onPress={() => setFilters({ ...filters, emergencyOnly: !filters.emergencyOnly })}
              >
                <View style={[
                  styles.checkbox,
                  filters.emergencyOnly && styles.checkboxActive
                ]}>
                  {filters.emergencyOnly && <Ionicons name="checkmark" size={16} color="white" />}
                </View>
                <Text style={styles.checkboxLabel}>Emergency Services Only</Text>
              </TouchableOpacity>
            </View>
          </ScrollView>

          <TouchableOpacity
            style={styles.applyButton}
            onPress={() => setShowFilters(false)}
          >
            <Text style={styles.applyButtonText}>Apply Filters</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );

  const calculateDistance = (lat1, lon1, lat2, lon2) => {
    const R = 6371; // Radius of the Earth in km
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = 
      Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
      Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c; // Distance in km
  };

  const formatDistance = (distance) => {
    if (distance < 1) {
      return `${Math.round(distance * 1000)}m away`;
    }
    return `${distance.toFixed(1)}km away`;
  };

  const handleCall = (phoneNumber) => {
    if (phoneNumber === 'N/A') {
      Alert.alert('Information', 'Phone number not available for this facility');
      return;
    }
    Linking.openURL(`tel:${phoneNumber}`);
  };

  const handleDirections = (coordinates) => {
    const { latitude, longitude } = coordinates;
    Linking.openURL(`https://www.openstreetmap.org/directions?engine=fossgis_osrm_car&route=${latitude},${longitude}`);
  };

  const renderFacilityItem = ({ item }) => (
    <TouchableOpacity 
      style={styles.facilityCard}
      onPress={() => setSelectedFacility(item)}
    >
      <View style={styles.facilityHeader}>
        <View style={styles.facilityTypeContainer}>
          <MaterialIcons 
            name={item.type === 'Hospital' ? 'local-hospital' : 'medical-services'} 
            size={24} 
            color="#007AFF" 
          />
          <Text style={styles.facilityType}>{item.type}</Text>
        </View>
        {item.emergency && (
          <View style={styles.emergencyBadge}>
            <Text style={styles.emergencyText}>24/7 Emergency</Text>
          </View>
        )}
      </View>

      <Text style={styles.facilityName}>{item.name}</Text>
      <Text style={styles.facilityAddress}>{item.address}</Text>
      
      <View style={styles.distanceContainer}>
        <Ionicons name="location" size={16} color="#666" />
        <Text style={styles.distanceText}>{item.distance}</Text>
      </View>

      <View style={styles.ratingContainer}>
        <FontAwesome5 name="star" size={16} color="#FFD700" />
        <Text style={styles.ratingText}>{item.rating}</Text>
      </View>

      <View style={styles.specialtiesContainer}>
        {item.specialties.map((specialty, index) => (
          <View key={index} style={styles.specialtyTag}>
            <Text style={styles.specialtyText}>{specialty}</Text>
          </View>
        ))}
      </View>

      <View style={styles.actionButtons}>
        <TouchableOpacity 
          style={styles.actionButton}
          onPress={() => handleCall(item.phone)}
        >
          <Ionicons name="call" size={20} color="white" />
          <Text style={styles.actionButtonText}>Call</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={[styles.actionButton, styles.directionsButton]}
          onPress={() => handleDirections(item.coordinates)}
        >
          <Ionicons name="navigate" size={20} color="white" />
          <Text style={styles.actionButtonText}>Directions</Text>
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );

  if (loading) {
    return (
      <SafeAreaView style={styles.safeContainer}>
        <StatusBar barStyle="dark-content" backgroundColor="white" />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#007AFF" />
          <Text style={styles.loadingText}>Finding healthcare facilities near you...</Text>
          <Text style={styles.loadingSubtext}>This may take a few moments</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (errorMsg) {
    return (
      <SafeAreaView style={styles.safeContainer}>
        <StatusBar barStyle="dark-content" backgroundColor="white" />
        <View style={styles.errorContainer}>
          <Ionicons name="alert-circle" size={48} color="#FF3B30" />
          <Text style={styles.errorText}>{errorMsg}</Text>
          <TouchableOpacity 
            style={styles.retryButton}
            onPress={async () => {
              setLoading(true);
              setErrorMsg(null);
              const currentLocation = await getCurrentLocation();
              if (currentLocation) {
                await fetchNearbyHealthcareFacilities(
                  currentLocation.coords.latitude,
                  currentLocation.coords.longitude
                );
              }
            }}
          >
            <Text style={styles.retryButtonText}>Try Again</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeContainer}>
      <StatusBar barStyle="dark-content" backgroundColor="white" />
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#007AFF" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Find Healthcare</Text>
        <TouchableOpacity onPress={() => setShowFilters(true)} style={styles.filterButton}>
          <Ionicons name="options" size={24} color="#007AFF" />
        </TouchableOpacity>
      </View>

      <View style={styles.searchContainer}>
        <Ionicons name="search" size={20} color="#666" style={styles.searchIcon} />
        <TextInput
          style={styles.searchInput}
          placeholder="Search facilities..."
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
        {searchQuery.length > 0 && (
          <TouchableOpacity onPress={() => setSearchQuery('')} style={styles.clearButton}>
            <Ionicons name="close-circle" size={20} color="#666" />
          </TouchableOpacity>
        )}
      </View>

      <View style={styles.mapContainer}>
        <MapView
          provider={PROVIDER_GOOGLE}
          style={styles.map}
          initialRegion={{
            latitude: location?.coords.latitude || 0,
            longitude: location?.coords.longitude || 0,
            latitudeDelta: 0.0922,
            longitudeDelta: 0.0421,
          }}
        >
          {filteredFacilities.map((facility) => (
            <Marker
              key={facility.id}
              coordinate={facility.coordinates}
              title={facility.name}
              description={facility.type}
              onPress={() => setSelectedFacility(facility)}
            >
              <View style={styles.markerContainer}>
                <MaterialIcons 
                  name={facility.type === 'Hospital' ? 'local-hospital' : 'medical-services'} 
                  size={24} 
                  color={facility.emergency ? '#FF3B30' : '#007AFF'} 
                />
              </View>
            </Marker>
          ))}
        </MapView>
      </View>

      <View style={styles.listContainer}>
        <Text style={styles.sectionTitle}>
          {filteredFacilities.length} Facilities Found
        </Text>
        <FlatList
          data={filteredFacilities}
          renderItem={renderFacilityItem}
          keyExtractor={item => item.id}
          contentContainerStyle={styles.listContent}
        />
      </View>

      <FilterModal />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeContainer: {
    flex: 1,
    backgroundColor: 'white',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#e1e1e1',
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#666',
  },
  loadingSubtext: {
    marginTop: 8,
    fontSize: 14,
    color: '#666',
  },
  mapContainer: {
    height: 250,
  },
  map: {
    ...StyleSheet.absoluteFillObject,
  },
  listContainer: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    margin: 16,
  },
  listContent: {
    padding: 16,
  },
  facilityCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  facilityHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  facilityTypeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  facilityType: {
    fontSize: 14,
    color: '#007AFF',
    marginLeft: 8,
    fontWeight: '500',
  },
  emergencyBadge: {
    backgroundColor: '#FF3B30',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  emergencyText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '500',
  },
  facilityName: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  facilityAddress: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
  },
  distanceContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  distanceText: {
    fontSize: 14,
    color: '#666',
    marginLeft: 4,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  ratingText: {
    fontSize: 14,
    color: '#666',
    marginLeft: 4,
  },
  specialtiesContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 16,
  },
  specialtyTag: {
    backgroundColor: '#E6F7FF',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    marginRight: 8,
    marginBottom: 8,
  },
  specialtyText: {
    fontSize: 12,
    color: '#007AFF',
  },
  actionButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#007AFF',
    padding: 12,
    borderRadius: 8,
    marginRight: 8,
  },
  directionsButton: {
    backgroundColor: '#34C759',
    marginRight: 0,
  },
  actionButtonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '500',
    marginLeft: 8,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
    marginHorizontal: 16,
    marginVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e1e1e1',
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    height: 40,
    fontSize: 16,
  },
  clearButton: {
    padding: 4,
  },
  filterButton: {
    padding: 8,
  },
  modalContainer: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: 'white',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 16,
    maxHeight: '80%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
  },
  filterOptions: {
    maxHeight: '70%',
  },
  filterSection: {
    marginBottom: 16,
  },
  filterLabel: {
    fontSize: 16,
    fontWeight: '500',
    color: '#333',
    marginBottom: 8,
  },
  filterButtons: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  filterButton: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#f0f0f0',
    marginRight: 8,
    marginBottom: 8,
  },
  filterButtonActive: {
    backgroundColor: '#007AFF',
  },
  filterButtonText: {
    color: '#666',
  },
  filterButtonTextActive: {
    color: 'white',
  },
  sliderContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  sliderValue: {
    width: 50,
    fontSize: 16,
    color: '#333',
  },
  slider: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    height: 40,
  },
  sliderDot: {
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: '#e1e1e1',
  },
  sliderDotActive: {
    backgroundColor: '#007AFF',
  },
  checkboxContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#007AFF',
    marginRight: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkboxActive: {
    backgroundColor: '#007AFF',
  },
  checkboxLabel: {
    fontSize: 16,
    color: '#333',
  },
  applyButton: {
    backgroundColor: '#007AFF',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 16,
  },
  applyButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  markerContainer: {
    backgroundColor: 'white',
    padding: 4,
    borderRadius: 20,
    borderWidth: 2,
    borderColor: '#007AFF',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  errorText: {
    marginBottom: 16,
    fontSize: 16,
    color: '#333',
    textAlign: 'center',
  },
  retryButton: {
    backgroundColor: '#007AFF',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  retryButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default FindHealthcareScreen; 