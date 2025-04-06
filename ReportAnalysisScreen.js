import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  ScrollView,
  SafeAreaView,
  StatusBar,
  ActivityIndicator,
  FlatList
} from 'react-native';
import { Ionicons, AntDesign, MaterialIcons, FontAwesome5 } from '@expo/vector-icons';
import * as DocumentPicker from 'expo-document-picker';
import * as ImagePicker from 'expo-image-picker';

const ReportAnalysisScreen = ({ navigation }) => {
  const [reports, setReports] = useState([]);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState(null);
  
  const pickDocument = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: ['application/pdf', 'image/*'],
        copyToCacheDirectory: true,
      });
      
      if (result.canceled === false) {
        const newReport = {
          id: Date.now().toString(),
          name: result.assets[0].name,
          uri: result.assets[0].uri,
          type: result.assets[0].mimeType,
          size: result.assets[0].size,
          isImage: result.assets[0].mimeType.startsWith('image/'),
        };
        setReports([...reports, newReport]);
      }
    } catch (error) {
      console.log('Error picking document:', error);
    }
  };
  
  const pickImage = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: false,
        quality: 1,
      });
      
      if (!result.canceled) {
        const newReport = {
          id: Date.now().toString(),
          name: `Image ${reports.length + 1}`,
          uri: result.assets[0].uri,
          type: 'image/jpeg',
          size: 0, // Not available from image picker
          isImage: true,
        };
        setReports([...reports, newReport]);
      }
    } catch (error) {
      console.log('Error picking image:', error);
    }
  };

  const removeReport = (id) => {
    setReports(reports.filter(report => report.id !== id));
  };

  const analyzeReports = () => {
    if (reports.length === 0) {
      alert('Please upload at least one report to analyze');
      return;
    }
    
    setIsAnalyzing(true);
    
    // Simulate analysis (in a real app, this would be an API call)
    setTimeout(() => {
      setIsAnalyzing(false);
      setAnalysisResult({
        summary: "Based on the uploaded reports, here's an analysis of your health metrics and indicators.",
        metrics: [
          { name: "Blood Glucose", value: "95 mg/dL", status: "Normal", description: "Within the healthy range of 70-99 mg/dL fasting." },
          { name: "Cholesterol", value: "210 mg/dL", status: "Borderline High", description: "Slightly above the recommended level of <200 mg/dL." },
          { name: "Blood Pressure", value: "128/82 mmHg", status: "Elevated", description: "Slightly elevated, normal is <120/80 mmHg." },
        ],
        recommendations: [
          "Consider dietary changes to help lower cholesterol levels",
          "Regular exercise can help improve both cholesterol and blood pressure",
          "Schedule a follow-up with your doctor in 3 months to recheck your blood pressure",
          "Maintain a healthy diet low in saturated fats and sodium"
        ]
      });
    }, 2000);
  };

  const resetAnalysis = () => {
    setAnalysisResult(null);
    setReports([]);
  };

  // Function to format file size
  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const renderReportItem = ({ item }) => (
    <View style={styles.reportItem}>
      <View style={styles.reportIconContainer}>
        {item.isImage ? (
          <Image source={{ uri: item.uri }} style={styles.reportThumbnail} />
        ) : (
          <AntDesign name="pdffile1" size={32} color="#FF3B30" />
        )}
      </View>
      <View style={styles.reportInfo}>
        <Text style={styles.reportName} numberOfLines={1}>{item.name}</Text>
        <Text style={styles.reportSize}>{formatFileSize(item.size)}</Text>
      </View>
      <TouchableOpacity onPress={() => removeReport(item.id)}>
        <MaterialIcons name="delete-outline" size={24} color="#FF3B30" />
      </TouchableOpacity>
    </View>
  );

  return (
    <SafeAreaView style={styles.safeContainer}>
      <StatusBar barStyle="dark-content" backgroundColor="#f8f9fa" />
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#007AFF" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Report Analysis</Text>
        <View style={{ width: 24 }} /> {/* Empty view for alignment */}
      </View>
      
      <ScrollView style={styles.container} contentContainerStyle={{ paddingBottom: 40 }}>
        {!analysisResult ? (
          <>
            <Text style={styles.sectionTitle}>Upload Medical Reports</Text>
            <Text style={styles.subtitle}>
              Upload medical reports, lab results, or scans for AI-powered analysis and recommendations.
            </Text>
            
            <View style={styles.uploadSection}>
              <TouchableOpacity style={styles.uploadButton} onPress={pickDocument}>
                <AntDesign name="filetext1" size={24} color="white" style={styles.buttonIcon} />
                <Text style={styles.buttonText}>Upload Document</Text>
              </TouchableOpacity>
              
              <TouchableOpacity style={styles.uploadButton} onPress={pickImage}>
                <AntDesign name="camera" size={24} color="white" style={styles.buttonIcon} />
                <Text style={styles.buttonText}>Upload Image</Text>
              </TouchableOpacity>
            </View>
            
            {reports.length > 0 && (
              <View style={styles.reportsContainer}>
                <Text style={styles.sectionTitle}>Uploaded Reports ({reports.length})</Text>
                <FlatList
                  data={reports}
                  renderItem={renderReportItem}
                  keyExtractor={item => item.id}
                  scrollEnabled={false}
                />
              </View>
            )}
            
            <TouchableOpacity 
              style={[styles.analyzeButton, reports.length === 0 ? styles.disabledButton : null]} 
              onPress={analyzeReports}
              disabled={reports.length === 0}
            >
              {isAnalyzing ? (
                <ActivityIndicator color="white" />
              ) : (
                <>
                  <AntDesign name="search1" size={20} color="white" style={styles.buttonIcon} />
                  <Text style={styles.analyzeButtonText}>Analyze Reports</Text>
                </>
              )}
            </TouchableOpacity>
            
            <View style={styles.tipsContainer}>
              <Text style={styles.tipsTitle}>Tips for Better Analysis</Text>
              <View style={styles.tipItem}>
                <View style={styles.tipBullet} />
                <Text style={styles.tipText}>
                  Upload clear, high-resolution images of your reports
                </Text>
              </View>
              <View style={styles.tipItem}>
                <View style={styles.tipBullet} />
                <Text style={styles.tipText}>
                  Make sure all values and reference ranges are visible
                </Text>
              </View>
              <View style={styles.tipItem}>
                <View style={styles.tipBullet} />
                <Text style={styles.tipText}>
                  Include reports from the same time period when possible
                </Text>
              </View>
            </View>
          </>
        ) : (
          <>
            <View style={styles.analysisContainer}>
              <Text style={styles.analysisTitleText}>Analysis Results</Text>
              <Text style={styles.analysisSummary}>{analysisResult.summary}</Text>
              
              <Text style={styles.resultSectionTitle}>Health Metrics</Text>
              {analysisResult.metrics.map((metric, index) => (
                <View key={index} style={styles.metricCard}>
                  <View style={styles.metricHeader}>
                    <Text style={styles.metricName}>{metric.name}</Text>
                    <View style={[
                      styles.statusBadge, 
                      metric.status === 'Normal' ? styles.normalStatus :
                      metric.status === 'Borderline High' ? styles.borderlineStatus :
                      styles.elevatedStatus
                    ]}>
                      <Text style={[
                        styles.statusText,
                        metric.status === 'Normal' ? { color: '#34C759' } :
                        metric.status === 'Borderline High' ? { color: '#FF9500' } :
                        { color: '#FF3B30' }
                      ]}>{metric.status}</Text>
                    </View>
                  </View>
                  <View style={styles.metricDetails}>
                    <FontAwesome5 
                      name={
                        metric.status === 'Normal' ? 'check-circle' : 
                        metric.status === 'Borderline High' ? 'exclamation-circle' : 
                        'arrow-circle-up'
                      } 
                      size={18} 
                      color={
                        metric.status === 'Normal' ? '#34C759' : 
                        metric.status === 'Borderline High' ? '#FF9500' : 
                        '#FF3B30'
                      }
                      style={styles.metricIcon}
                    />
                    <View>
                      <Text style={styles.metricValue}>{metric.value}</Text>
                      <Text style={styles.metricDescription}>{metric.description}</Text>
                    </View>
                  </View>
                </View>
              ))}
              
              <Text style={styles.resultSectionTitle}>Recommendations</Text>
              <View style={styles.recommendationsCard}>
                {analysisResult.recommendations.map((recommendation, index) => (
                  <View key={index} style={styles.recommendationItem}>
                    <View style={styles.bulletPoint} />
                    <Text style={styles.recommendationText}>{recommendation}</Text>
                  </View>
                ))}
              </View>
              
              <Text style={styles.disclaimer}>
                Note: This analysis is meant to help you understand your reports better. 
                Always consult with your healthcare provider for professional medical advice.
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
  uploadSection: {
    marginBottom: 20,
  },
  uploadButton: {
    backgroundColor: '#007AFF',
    borderRadius: 12,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  buttonIcon: {
    marginRight: 8,
  },
  buttonText: {
    color: 'white',
    fontWeight: '600',
    fontSize: 16,
  },
  reportsContainer: {
    marginBottom: 20,
  },
  reportItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 12,
    marginBottom: 8,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.1,
    shadowRadius: 1.41,
    elevation: 2,
  },
  reportIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 8,
    backgroundColor: '#f1f1f1',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
    overflow: 'hidden',
  },
  reportThumbnail: {
    width: '100%',
    height: '100%',
  },
  reportInfo: {
    flex: 1,
  },
  reportName: {
    fontSize: 14,
    fontWeight: '500',
    color: '#333',
  },
  reportSize: {
    fontSize: 12,
    color: '#666',
  },
  analyzeButton: {
    backgroundColor: '#34C759',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 20,
  },
  disabledButton: {
    backgroundColor: '#a8e4b9',
  },
  analyzeButtonText: {
    color: 'white',
    fontWeight: '600',
    fontSize: 16,
  },
  tipsContainer: {
    backgroundColor: '#e6f7ff',
    borderRadius: 12,
    padding: 16,
    marginTop: 8,
  },
  tipsTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#007AFF',
    marginBottom: 12,
  },
  tipItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  tipBullet: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#007AFF',
    marginTop: 6,
    marginRight: 8,
  },
  tipText: {
    fontSize: 14,
    color: '#333',
    flex: 1,
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
    marginBottom: 12,
    textAlign: 'center',
  },
  analysisSummary: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
    marginBottom: 16,
  },
  resultSectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginTop: 16,
    marginBottom: 12,
    color: '#333',
  },
  metricCard: {
    backgroundColor: '#f8f9fa',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
  },
  metricHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  metricName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 20,
  },
  normalStatus: {
    backgroundColor: '#E6FFEA',
  },
  borderlineStatus: {
    backgroundColor: '#FFF8E6',
  },
  elevatedStatus: {
    backgroundColor: '#FFEBE6',
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
  },
  metricDetails: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  metricIcon: {
    marginRight: 12,
    marginTop: 2,
  },
  metricValue: {
    fontSize: 16,
    fontWeight: '500',
    color: '#333',
    marginBottom: 4,
  },
  metricDescription: {
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
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#34C759',
    marginTop: 6,
    marginRight: 8,
  },
  recommendationText: {
    fontSize: 14,
    color: '#333',
    flex: 1,
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

export default ReportAnalysisScreen; 