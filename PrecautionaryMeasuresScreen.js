import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
  StatusBar,
  Image,
  FlatList
} from 'react-native';
import { Ionicons, MaterialCommunityIcons, FontAwesome5, AntDesign } from '@expo/vector-icons';

const PrecautionaryMeasuresScreen = ({ navigation, route }) => {
  // In a real app, this would come from previous screens or an API call
  const [healthData, setHealthData] = useState({
    hasSymptoms: true,
    symptoms: ['Headache', 'Fatigue', 'Mild fever'],
    hasReportData: true,
    metrics: [
      { name: 'Blood Pressure', value: '128/82 mmHg', status: 'Elevated' },
      { name: 'Cholesterol', value: '210 mg/dL', status: 'Borderline High' }
    ]
  });
  
  const [categories, setCategories] = useState([
    {
      id: '1',
      title: 'Diet Recommendations',
      description: 'Nutrition advice based on your health profile',
      icon: 'food-apple',
      iconBg: '#FFEBE6',
      iconColor: '#FF3B30',
      expanded: false,
      measures: [
        'Reduce sodium intake to help lower blood pressure',
        'Increase consumption of fruits and vegetables (aim for 5 servings per day)',
        'Choose whole grains over refined carbohydrates',
        'Limit saturated and trans fats to help improve cholesterol levels',
        'Include omega-3 rich foods like fatty fish, walnuts, and flaxseeds'
      ]
    },
    {
      id: '2',
      title: 'Exercise Guidelines',
      description: 'Physical activity recommendations for your condition',
      icon: 'running',
      iconBg: '#E6F7FF',
      iconColor: '#007AFF',
      expanded: false,
      measures: [
        'Aim for at least 150 minutes of moderate-intensity aerobic activity weekly',
        'Include strength training exercises 2-3 times per week',
        'Start with low-intensity exercises and gradually increase intensity',
        'Consider activities like walking, swimming, or cycling which are gentle on the body',
        'Monitor your heart rate during exercise and stay within recommended ranges'
      ]
    },
    {
      id: '3',
      title: 'Lifestyle Changes',
      description: 'Daily habits to improve your health condition',
      icon: 'sleep',
      iconBg: '#E6FFEA',
      iconColor: '#34C759',
      expanded: false,
      measures: [
        'Ensure 7-8 hours of quality sleep each night',
        'Practice stress-reduction techniques like meditation or deep breathing',
        'Limit alcohol consumption',
        'Avoid tobacco products and secondhand smoke',
        'Stay hydrated by drinking at least 8 glasses of water daily'
      ]
    },
    {
      id: '4',
      title: 'Medications & Monitoring',
      description: 'Guidance on medication and self-monitoring',
      icon: 'pill',
      iconBg: '#FFF8E6',
      iconColor: '#FF9500',
      expanded: false,
      measures: [
        'Take medications as prescribed by your healthcare provider',
        'Monitor your blood pressure regularly at home',
        'Keep a symptom journal to track headaches and fatigue patterns',
        'Schedule regular follow-up appointments with your healthcare provider',
        'Consider using health tracking apps to monitor your progress'
      ]
    }
  ]);
  
  const toggleExpand = (id) => {
    setCategories(
      categories.map(category => 
        category.id === id 
          ? { ...category, expanded: !category.expanded } 
          : category
      )
    );
  };

  return (
    <SafeAreaView style={styles.safeContainer}>
      <StatusBar barStyle="dark-content" backgroundColor="#f8f9fa" />
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#007AFF" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Precautionary Measures</Text>
        <View style={{ width: 24 }} /> {/* Empty view for alignment */}
      </View>
      
      <ScrollView style={styles.container} contentContainerStyle={{ paddingBottom: 40 }}>
        <View style={styles.summaryContainer}>
          <Text style={styles.summaryTitle}>Your Health Summary</Text>
          
          {healthData.hasSymptoms && (
            <View style={styles.summarySection}>
              <Text style={styles.sectionLabel}>Reported Symptoms:</Text>
              <View style={styles.tagContainer}>
                {healthData.symptoms.map((symptom, index) => (
                  <View key={index} style={styles.tag}>
                    <Text style={styles.tagText}>{symptom}</Text>
                  </View>
                ))}
              </View>
            </View>
          )}
          
          {healthData.hasReportData && (
            <View style={styles.summarySection}>
              <Text style={styles.sectionLabel}>Health Metrics:</Text>
              {healthData.metrics.map((metric, index) => (
                <View key={index} style={styles.metricRow}>
                  <Text style={styles.metricName}>{metric.name}:</Text>
                  <Text style={styles.metricValue}>{metric.value}</Text>
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
              ))}
            </View>
          )}
        </View>
        
        <Text style={styles.recommendationsTitle}>Recommended Precautions</Text>
        <Text style={styles.recommendationsSubtitle}>
          Based on your symptoms and health data, here are personalized precautionary measures:
        </Text>
        
        {categories.map(category => (
          <View key={category.id} style={styles.categoryCard}>
            <TouchableOpacity 
              style={styles.categoryHeader} 
              onPress={() => toggleExpand(category.id)}
            >
              <View style={[styles.iconContainer, { backgroundColor: category.iconBg }]}>
                {category.icon === 'pill' || category.icon === 'sleep' ? (
                  <MaterialCommunityIcons name={category.icon} size={24} color={category.iconColor} />
                ) : category.icon === 'running' ? (
                  <FontAwesome5 name={category.icon} size={20} color={category.iconColor} />
                ) : (
                  <MaterialCommunityIcons name={category.icon} size={24} color={category.iconColor} />
                )}
              </View>
              <View style={styles.categoryTitleContainer}>
                <Text style={styles.categoryTitle}>{category.title}</Text>
                <Text style={styles.categoryDescription}>{category.description}</Text>
              </View>
              <AntDesign 
                name={category.expanded ? "up" : "down"} 
                size={16} 
                color="#999"
              />
            </TouchableOpacity>
            
            {category.expanded && (
              <View style={styles.measuresContainer}>
                {category.measures.map((measure, index) => (
                  <View key={index} style={styles.measureItem}>
                    <View style={styles.bulletPoint} />
                    <Text style={styles.measureText}>{measure}</Text>
                  </View>
                ))}
              </View>
            )}
          </View>
        ))}
        
        <View style={styles.disclaimerContainer}>
          <AntDesign name="infocirlce" size={16} color="#666" style={styles.disclaimerIcon} />
          <Text style={styles.disclaimerText}>
            These recommendations are based on your reported symptoms and health data. 
            Always consult with a healthcare professional before making significant changes 
            to your diet, exercise routine, or medication.
          </Text>
        </View>
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
  summaryContainer: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 16,
    marginBottom: 20,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 3,
  },
  summaryTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 12,
  },
  summarySection: {
    marginBottom: 12,
  },
  sectionLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#666',
    marginBottom: 8,
  },
  tagContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  tag: {
    backgroundColor: '#E6F7FF',
    borderRadius: 16,
    paddingHorizontal: 12,
    paddingVertical: 6,
    marginRight: 8,
    marginBottom: 8,
  },
  tagText: {
    color: '#007AFF',
    fontSize: 14,
    fontWeight: '500',
  },
  metricRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  metricName: {
    fontSize: 14,
    color: '#333',
    fontWeight: '500',
    marginRight: 8,
  },
  metricValue: {
    fontSize: 14,
    color: '#333',
    marginRight: 8,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 12,
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
    fontWeight: '500',
  },
  recommendationsTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  recommendationsSubtitle: {
    fontSize: 14,
    color: '#666',
    marginBottom: 16,
  },
  categoryCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    marginBottom: 12,
    overflow: 'hidden',
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.1,
    shadowRadius: 2.22,
    elevation: 2,
  },
  categoryHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  categoryTitleContainer: {
    flex: 1,
  },
  categoryTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  categoryDescription: {
    fontSize: 12,
    color: '#666',
  },
  measuresContainer: {
    padding: 16,
    paddingTop: 0,
    backgroundColor: '#fafafa',
  },
  measureItem: {
    flexDirection: 'row',
    marginBottom: 12,
    alignItems: 'flex-start',
  },
  bulletPoint: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#007AFF',
    marginTop: 6,
    marginRight: 10,
  },
  measureText: {
    fontSize: 14,
    color: '#333',
    flex: 1,
  },
  disclaimerContainer: {
    flexDirection: 'row',
    backgroundColor: '#f0f0f0',
    borderRadius: 8,
    padding: 12,
    marginTop: 16,
    alignItems: 'flex-start',
  },
  disclaimerIcon: {
    marginRight: 8,
    marginTop: 2,
  },
  disclaimerText: {
    fontSize: 12,
    color: '#666',
    flex: 1,
    lineHeight: 18,
  },
});

export default PrecautionaryMeasuresScreen; 