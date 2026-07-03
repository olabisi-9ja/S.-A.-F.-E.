import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, ScrollView, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

export default function ReportScreen() {
  const [description, setDescription] = useState('');
  const [incidentType, setIncidentType] = useState('');

  const types = ['Theft', 'Harassment', 'Fire', 'Medical', 'Other'];

  const handleSubmit = () => {
    if (!incidentType || !description) {
      Alert.alert('Missing Info', 'Please select an incident type and provide a description.');
      return;
    }
    
    Alert.alert(
      'Report Submitted', 
      'Your report has been sent to campus security successfully.',
      [
        { text: 'OK', onPress: () => {
          setDescription('');
          setIncidentType('');
        }}
      ]
    );
  };

  return (
    <ScrollView style={styles.container} keyboardShouldPersistTaps="handled">
      <View style={styles.header}>
        <Text style={styles.title}>Report an Incident</Text>
        <Text style={styles.subtitle}>Provide details to help security respond effectively. This is strictly confidential.</Text>
      </View>

      <Text style={styles.label}>Type of Incident</Text>
      <View style={styles.typeContainer}>
        {types.map((type) => (
          <TouchableOpacity 
            key={type} 
            style={[styles.typeChip, incidentType === type && styles.typeChipActive]}
            onPress={() => setIncidentType(type)}
          >
            <Text style={[styles.typeText, incidentType === type && styles.typeTextActive]}>{type}</Text>
          </TouchableOpacity>
        ))}
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
        onChangeText={setDescription}
      />

      <TouchableOpacity style={styles.cameraButton}>
        <Ionicons name="camera" size={24} color="#4b5563" />
        <Text style={styles.cameraText}>Attach Photo / Video</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.submitButton} onPress={handleSubmit}>
        <Text style={styles.submitButtonText}>Submit Report</Text>
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
    marginBottom: 20,
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
  submitButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
});
