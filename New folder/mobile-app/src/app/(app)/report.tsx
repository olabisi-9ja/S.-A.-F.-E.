import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, ScrollView, Alert, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Location from 'expo-location';
import * as ImagePicker from 'expo-image-picker';
import { incidentsAPI } from '@/services/api';

interface AIClassification {
  ai_category_suggestion: string;
  ai_severity_score: number;
  ai_is_suspicious: boolean;
}

export default function ReportScreen() {
  const [description, setDescription] = useState('');
  const [incidentType, setIncidentType] = useState('');
  const [loading, setLoading] = useState(false);
  const [mediaUri, setMediaUri] = useState<string | null>(null);

  const [analyzing, setAnalyzing] = useState(false);
  const [aiResult, setAiResult] = useState<AIClassification | null>(null);
  const [aiAccepted, setAiAccepted] = useState(false);

  const types = ['Theft', 'Harassment', 'Fire', 'Medical', 'Assault', 'General', 'Other'];

  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images', 'videos'],
      allowsEditing: true,
      quality: 0.8,
    });

    if (!result.canceled) {
      setMediaUri(result.assets[0].uri);
    }
  };

  const handleAnalyze = async () => {
    if (description.trim().length < 5) {
      Alert.alert('Add more detail', 'Please describe what is happening (at least a few words) before analyzing.');
      return;
    }
    setAnalyzing(true);
    setAiResult(null);
    setAiAccepted(false);
    try {
      const res = await incidentsAPI.classify(description);
      if (res.success && res.data) {
        setAiResult(res.data.ai_classification);
      } else {
        Alert.alert('Analysis unavailable', res.error || 'Could not analyze right now — you can still pick a category manually and submit.');
      }
    } catch {
      Alert.alert('Analysis unavailable', 'Could not reach the AI service — you can still pick a category manually and submit.');
    } finally {
      setAnalyzing(false);
    }
  };

  const acceptAiSuggestion = () => {
    if (!aiResult) return;
    setIncidentType(aiResult.ai_category_suggestion);
    setAiAccepted(true);
  };

  const severityColor = (score: number) => {
    if (score >= 80) return '#dc2626';
    if (score >= 50) return '#f59e0b';
    return '#16a34a';
  };

  const handleSubmit = async () => {
    if (!incidentType || !description) {
      Alert.alert('Missing Info', 'Please select an incident type and provide a description.');
      return;
    }

    setLoading(true);
    try {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission Denied', 'Location permission is required to submit a report.');
        return;
      }

      const loc = await Location.getCurrentPositionAsync({});

      const result = await incidentsAPI.create({
        category: incidentType,
        description,
        latitude: loc.coords.latitude,
        longitude: loc.coords.longitude,
      });

      if (result.success && result.data) {
        Alert.alert(
          'Report Submitted',
          `Your report has been sent to campus security successfully. AI Classification: ${result.data.ai_classification.ai_severity_score}% severity.`,
          [
            {
              text: 'OK',
              onPress: () => {
                setDescription('');
                setIncidentType('');
                setMediaUri(null);
                setAiResult(null);
                setAiAccepted(false);
              },
            },
          ]
        );
      } else {
        Alert.alert('Report Failed', result.error || 'Could not submit report.');
      }
    } catch (err: any) {
      Alert.alert('Network Error', err.message || 'Check your connection.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView style={styles.container} keyboardShouldPersistTaps="handled">
      <View style={styles.header}>
        <Text style={styles.title}>Report an Incident</Text>
        <Text style={styles.subtitle}>Provide details to help security respond effectively. This is strictly confidential.</Text>
      </View>

      <Text style={styles.label}>Location</Text>
      <View style={styles.locationBox}>
        <Ionicons name="location" size={20} color="#b91c1c" />
        <Text style={styles.locationText}>Current Location (Auto-detected)</Text>
      </View>

      <Text style={styles.label}>Description</Text>
      <TextInput
        style={styles.input}
        placeholder="Please describe what is happening..."
        placeholderTextColor="#9ca3af"
        multiline
        numberOfLines={6}
        textAlignVertical="top"
        value={description}
        onChangeText={(text) => {
          setDescription(text);
          if (aiResult) {
            setAiResult(null);
            setAiAccepted(false);
          }
        }}
      />

      <TouchableOpacity style={styles.analyzeButton} onPress={handleAnalyze} disabled={analyzing}>
        {analyzing ? (
          <ActivityIndicator color="#4338ca" />
        ) : (
          <>
            <Ionicons name="hardware-chip" size={20} color="#4338ca" />
            <Text style={styles.analyzeText}>Analyze with AI</Text>
          </>
        )}
      </TouchableOpacity>

      {aiResult && (
        <View style={styles.aiCard}>
          <View style={styles.aiCardHeader}>
            <Ionicons name="sparkles" size={18} color="#4338ca" />
            <Text style={styles.aiCardTitle}>AI Suggestion</Text>
          </View>
          <Text style={styles.aiCardCategory}>
            Category: <Text style={{ fontWeight: 'bold' }}>{aiResult.ai_category_suggestion}</Text>
          </Text>
          <View style={styles.severityRow}>
            <Text style={styles.severityLabel}>Severity</Text>
            <View style={styles.severityBarTrack}>
              <View
                style={[
                  styles.severityBarFill,
                  { width: `${aiResult.ai_severity_score}%`, backgroundColor: severityColor(aiResult.ai_severity_score) },
                ]}
              />
            </View>
            <Text style={[styles.severityValue, { color: severityColor(aiResult.ai_severity_score) }]}>
              {aiResult.ai_severity_score}%
            </Text>
          </View>
          {aiResult.ai_is_suspicious && (
            <Text style={styles.suspiciousFlag}>⚠ Flagged as potentially suspicious for review</Text>
          )}
          <Text style={styles.aiCardHint}>
            You can accept this category or choose your own below — either way you decide what gets submitted.
          </Text>
          <TouchableOpacity
            style={[styles.acceptButton, aiAccepted && styles.acceptButtonActive]}
            onPress={acceptAiSuggestion}
          >
            <Ionicons name={aiAccepted ? 'checkmark-circle' : 'checkmark-circle-outline'} size={18} color={aiAccepted ? 'white' : '#4338ca'} />
            <Text style={[styles.acceptButtonText, aiAccepted && styles.acceptButtonTextActive]}>
              {aiAccepted ? 'Using AI suggestion' : 'Use this category'}
            </Text>
          </TouchableOpacity>
        </View>
      )}

      <Text style={styles.label}>Type of Incident</Text>
      <View style={styles.typeContainer}>
        {types.map((type) => (
          <TouchableOpacity
            key={type}
            style={[styles.typeChip, incidentType === type && styles.typeChipActive]}
            onPress={() => {
              setIncidentType(type);
              setAiAccepted(false);
            }}
          >
            <Text style={[styles.typeText, incidentType === type && styles.typeTextActive]}>{type}</Text>
          </TouchableOpacity>
        ))}
      </View>

      <TouchableOpacity style={styles.cameraButton} onPress={pickImage}>
        <Ionicons name="camera" size={24} color="#4b5563" />
        <Text style={styles.cameraText}>
          {mediaUri ? 'Media Attached (Tap to change)' : 'Attach Photo / Video'}
        </Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={[styles.submitButton, loading && styles.submitButtonDisabled]}
        onPress={handleSubmit}
        disabled={loading}
      >
        {loading ? (
          <ActivityIndicator color="white" />
        ) : (
          <Text style={styles.submitButtonText}>Submit Report</Text>
        )}
      </TouchableOpacity>
      <View style={{ height: 40 }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f9fafb',
    padding: 20,
  },
  header: {
    marginBottom: 24,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#1f2937',
  },
  subtitle: {
    fontSize: 15,
    color: '#6b7280',
    marginTop: 8,
    lineHeight: 22,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 12,
    marginTop: 8,
  },
  typeContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    marginBottom: 24,
  },
  typeChip: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    backgroundColor: '#e5e7eb',
    borderWidth: 1,
    borderColor: '#d1d5db',
  },
  typeChipActive: {
    backgroundColor: '#fef2f2',
    borderColor: '#fca5a5',
  },
  typeText: {
    color: '#4b5563',
    fontWeight: '500',
  },
  typeTextActive: {
    color: '#b91c1c',
    fontWeight: 'bold',
  },
  locationBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fef2f2',
    padding: 16,
    borderRadius: 12,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: '#fecaca',
  },
  locationText: {
    marginLeft: 10,
    color: '#991b1b',
    fontWeight: '500',
  },
  input: {
    backgroundColor: 'white',
    borderWidth: 1,
    borderColor: '#e5e7eb',
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    color: '#1f2937',
    marginBottom: 12,
  },
  analyzeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#eef2ff',
    borderWidth: 1,
    borderColor: '#c7d2fe',
    borderRadius: 12,
    paddingVertical: 14,
    marginBottom: 16,
  },
  analyzeText: {
    color: '#4338ca',
    fontWeight: '700',
    fontSize: 15,
    marginLeft: 8,
  },
  aiCard: {
    backgroundColor: 'white',
    borderWidth: 1,
    borderColor: '#e0e7ff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
  },
  aiCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  aiCardTitle: {
    fontWeight: 'bold',
    color: '#4338ca',
    marginLeft: 6,
    fontSize: 15,
  },
  aiCardCategory: {
    fontSize: 15,
    color: '#374151',
    marginBottom: 12,
  },
  severityRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  severityLabel: {
    fontSize: 13,
    color: '#6b7280',
    width: 60,
  },
  severityBarTrack: {
    flex: 1,
    height: 8,
    backgroundColor: '#f3f4f6',
    borderRadius: 4,
    marginHorizontal: 8,
    overflow: 'hidden',
  },
  severityBarFill: {
    height: '100%',
    borderRadius: 4,
  },
  severityValue: {
    fontSize: 13,
    fontWeight: 'bold',
    width: 40,
    textAlign: 'right',
  },
  suspiciousFlag: {
    color: '#b45309',
    fontSize: 13,
    fontWeight: '600',
    marginBottom: 8,
  },
  aiCardHint: {
    fontSize: 12,
    color: '#9ca3af',
    marginBottom: 12,
    lineHeight: 17,
  },
  acceptButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#4338ca',
    borderRadius: 10,
    paddingVertical: 10,
  },
  acceptButtonActive: {
    backgroundColor: '#4338ca',
  },
  acceptButtonText: {
    color: '#4338ca',
    fontWeight: '700',
    marginLeft: 6,
  },
  acceptButtonTextActive: {
    color: 'white',
  },
  cameraButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#f3f4f6',
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    borderStyle: 'dashed',
    marginBottom: 32,
  },
  cameraText: {
    marginLeft: 10,
    color: '#4b5563',
    fontWeight: '600',
    fontSize: 16,
  },
  submitButton: {
    backgroundColor: '#1f2937', // very dark for contrast
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  submitButtonDisabled: {
    backgroundColor: '#9ca3af',
  },
  submitButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
});
