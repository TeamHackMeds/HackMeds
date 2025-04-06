import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  Image,
  ScrollView,
  SafeAreaView,
  StatusBar,
  ActivityIndicator
} from 'react-native';
import { Ionicons, MaterialIcons, AntDesign } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';

const SymptomCheckerScreen = ({ navigation }) => {
  const [symptoms, setSymptoms] = useState('');
  const [images, setImages] = useState([]);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState(null);
  
  const pickImage = async () => {
    // No permissions request is necessary for launching the image library
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 1,
    });

    if (!result.canceled) {
      setImages([...images, result.assets[0].uri]);
    }
  };

  const takePhoto = async () => {
    // Request camera permission
    const cameraPermission = await ImagePicker.requestCameraPermissionsAsync();
    
    if (cameraPermission.status !== 'granted') {
      alert('Sorry, we need camera permissions to make this work!');
      return;
    }
    
    let result = await ImagePicker.launchCameraAsync({
      allowsEditing: true,
      aspect: [4, 3],
      quality: 1,
    });

    if (!result.canceled) {
      setImages([...images, result.assets[0].uri]);
    }
  };

  const removeImage = (index) => {
    const newImages = [...images];
    newImages.splice(index, 1);
    setImages(newImages);
  };

  const analyzeSymptoms = () => {
    if (!symptoms.trim() && images.length === 0) {
      alert('Please describe your symptoms or upload an image');
      return;
    }
    
    setIsAnalyzing(true);
    
    // Simulate analysis (in a real app, this would be an API call)
    setTimeout(() => {
      setIsAnalyzing(false);
      setAnalysisResult({
        possibleConditions: [
          { name: 'Common Cold', probability: 'High', description: 'A viral infectious disease of the upper respiratory tract.' },
          { name: 'Seasonal Allergies', probability: 'Medium', description: 'An allergic reaction to pollen or other seasonal allergens.' },
          { name: 'Sinusitis', probability: 'Low', description: 'Inflammation of the sinuses, often due to infection.' }
        ],
        recommendations: [
          'Rest and stay hydrated',
          'Take over-the-counter pain relievers',
          'Use a humidifier to ease congestion',
          'Consider consulting a doctor if symptoms persist for more than a week'
        ]
      });
    }, 2000);
  };

  const resetAnalysis = () => {
    setAnalysisResult(null);
    setSymptoms('');
    setImages([]);
  };

  return (
    <SafeAreaView style={styles.safeContainer}>
      <StatusBar barStyle="dark-content" backgroundColor="#f8f9fa" />
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#007AFF" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Symptom Checker</Text>
        <View style={{ width: 24 }} /> {/* Empty view for alignment */}
      </View>
      
      <ScrollView style={styles.container} contentContainerStyle={{ paddingBottom: 40 }}>
        {!analysisResult ? (
          <>
            <Text style={styles.sectionTitle}>Describe Your Symptoms</Text>
            <TextInput
              style={styles.textInput}
              multiline
              numberOfLines={6}
              placeholder="Describe your symptoms in detail (e.g., headache, fever, cough)"
              value={symptoms}
              onChangeText={setSymptoms}
              textAlignVertical="top"
            />
            
            <Text style={styles.sectionTitle}>Upload Images (Optional)</Text>
            <Text style={styles.subtitle}>
              Add photos that might help with diagnosis, such as rashes, injuries, or other visible symptoms.
            </Text>
            
            <View style={styles.buttonRow}>
              <TouchableOpacity style={styles.uploadButton} onPress={pickImage}>
                <MaterialIcons name="photo-library" size={24} color="white" />
                <Text style={styles.buttonText}>Gallery</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.uploadButton} onPress={takePhoto}>
                <MaterialIcons name="camera-alt" size={24} color="white" />
                <Text style={styles.buttonText}>Camera</Text>
              </TouchableOpacity>
            </View>
            
            {images.length > 0 && (
              <View style={styles.imageContainer}>
                {images.map((image, index) => (
                  <View key={index} style={styles.imageWrapper}>
                    <Image source={{ uri: image }} style={styles.image} />
                    <TouchableOpacity 
                      style={styles.removeButton} 
                      onPress={() => removeImage(index)}
                    >
                      <AntDesign name="closecircle" size={20} color="#FF3B30" />
                    </TouchableOpacity>
                  </View>
                ))}
              </View>
            )}
            
            <TouchableOpacity 
              style={[styles.analyzeButton, (!symptoms.trim() && images.length === 0) ? styles.disabledButton : null]} 
              onPress={analyzeSymptoms}
              disabled={!symptoms.trim() && images.length === 0}
            >
              {isAnalyzing ? (
                <ActivityIndicator color="white" />
              ) : (
                <>
                  <AntDesign name="search1" size={20} color="white" style={styles.buttonIcon} />
                  <Text style={styles.analyzeButtonText}>Analyze Symptoms</Text>
                </>
              )}
            </TouchableOpacity>
          </>
        ) : (
          <>
            <View style={styles.analysisContainer}>
              <Text style={styles.analysisTitleText}>Analysis Results</Text>
              
              <Text style={styles.resultSectionTitle}>Possible Conditions</Text>
              {analysisResult.possibleConditions.map((condition, index) => (
                <View key={index} style={styles.conditionCard}>
                  <View style={styles.conditionHeader}>
                    <Text style={styles.conditionName}>{condition.name}</Text>
                    <Text style={[
                      styles.probabilityBadge, 
                      condition.probability === 'High' ? styles.highProbability :
                      condition.probability === 'Medium' ? styles.mediumProbability :
                      styles.lowProbability
                    ]}>
                      <Text style={styles.probabilityText}>{condition.probability}</Text>
                    </Text>
                  </View>
                  <Text style={styles.conditionDescription}>{condition.description}</Text>
                </View>
              ))}
              
              <Text style={styles.resultSectionTitle}>Recommendations</Text>
              <View style={styles.recommendationsCard}>
                {analysisResult.recommendations.map((recommendation, index) => (
                  <View key={index} style={styles.recommendationItem}>
                    <Text style={styles.bulletPoint}>•</Text>
                    <Text style={styles.recommendationText}>{recommendation}</Text>
                  </View>
                ))}
              </View>
              
              <Text style={styles.disclaimer}>
                Note: This analysis is based on AI and should not replace professional medical advice. 
                Please consult a healthcare provider for a proper diagnosis.
              </Text>
              
              <TouchableOpacity style={styles.newAnalysisButton} onPress={resetAnalysis}>
                <Text style={styles.newAnalysisButtonText}>New Analysis</Text>
              </TouchableOpacity>
            </View>
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeContainer: {
    flex: 1,
    backgroundColor: '#f8f9fa',
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
  container: {
    flex: 1,
    padding: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginTop: 16,
    marginBottom: 8,
    color: '#333',
  },
  subtitle: {
    fontSize: 14,
    color: '#666',
    marginBottom: 16,
  },
  textInput: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    borderWidth: 1,
    borderColor: '#e1e1e1',
    minHeight: 150,
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginVertical: 16,
  },
  uploadButton: {
    backgroundColor: '#007AFF',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    flex: 0.48,
    flexDirection: 'row',
    justifyContent: 'center',
  },
  buttonText: {
    color: 'white',
    fontWeight: '600',
    marginLeft: 8,
  },
  imageContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginVertical: 16,
  },
  imageWrapper: {
    width: '30%',
    aspectRatio: 1,
    margin: '1.5%',
    position: 'relative',
  },
  image: {
    width: '100%',
    height: '100%',
    borderRadius: 8,
  },
  removeButton: {
    position: 'absolute',
    top: -8,
    right: -8,
    backgroundColor: 'white',
    borderRadius: 10,
  },
  analyzeButton: {
    backgroundColor: '#34C759',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    marginTop: 16,
    flexDirection: 'row',
    justifyContent: 'center',
  },
  disabledButton: {
    backgroundColor: '#a8e4b9',
  },
  analyzeButtonText: {
    color: 'white',
    fontWeight: '600',
    fontSize: 16,
  },
  buttonIcon: {
    marginRight: 8,
  },
  analysisContainer: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 20,
    marginTop: 16,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  analysisTitleText: {
    fontSize: 22,
    fontWeight: '700',
    color: '#333',
    marginBottom: 16,
    textAlign: 'center',
  },
  resultSectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginTop: 16,
    marginBottom: 12,
    color: '#333',
  },
  conditionCard: {
    backgroundColor: '#f8f9fa',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
  },
  conditionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  conditionName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  probabilityBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 20,
  },
  highProbability: {
    backgroundColor: '#FFEBE6',
  },
  mediumProbability: {
    backgroundColor: '#FFF5E6',
  },
  lowProbability: {
    backgroundColor: '#E6F7FF',
  },
  probabilityText: {
    fontSize: 12,
    fontWeight: '600',
  },
  conditionDescription: {
    fontSize: 14,
    color: '#666',
  },
  recommendationsCard: {
    backgroundColor: '#f8f9fa',
    borderRadius: 12,
    padding: 16,
  },
  recommendationItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  bulletPoint: {
    fontSize: 14,
    color: '#34C759',
    marginRight: 8,
    lineHeight: 20,
  },
  recommendationText: {
    fontSize: 14,
    color: '#333',
    flex: 1,
    lineHeight: 20,
  },
  disclaimer: {
    fontSize: 12,
    color: '#666',
    fontStyle: 'italic',
    marginTop: 20,
    marginBottom: 10,
  },
  newAnalysisButton: {
    backgroundColor: '#007AFF',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    marginTop: 16,
  },
  newAnalysisButtonText: {
    color: 'white',
    fontWeight: '600',
    fontSize: 16,
  },
});

export default SymptomCheckerScreen; 