import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { COLORS } from '../theme/colors';

export const ClinicalHistoryScreen: React.FC = () => {
  const handleExportPDF = () => {
    Alert.alert('Exportar Resumen', 'Generando Resumen Clínico Consolidado oficial en formato PDF...');
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.header}>
        <Text style={styles.title}>Historia Clínica Personal</Text>
        <Text style={styles.subtitle}>Información médica cifrada (AES-256)</Text>
      </View>

      {/* Vital Stats Card */}
      <View style={styles.card}>
        <Text style={styles.sectionTitle}>Datos Médicos Principales</Text>
        <View style={styles.infoRow}>
          <Text style={styles.label}>🩸 Tipo de Sangre:</Text>
          <Text style={styles.value}>O Positivo (O+)</Text>
        </View>
        <View style={styles.infoRow}>
          <Text style={styles.label}>⚠️ Alergias:</Text>
          <Text style={styles.value}>Penicilina, Aspirina, Látex</Text>
        </View>
        <View style={styles.infoRow}>
          <Text style={styles.label}>🏥 Diagnósticos Crónicos:</Text>
          <Text style={styles.value}>Hipertensión (I10), Diabetes T2 (E11.9)</Text>
        </View>
      </View>

      {/* Vault Card */}
      <View style={styles.card}>
        <Text style={styles.sectionTitle}>Bóveda de Exámenes (4)</Text>
        <View style={styles.fileItem}>
          <Text style={styles.fileName}>📄 Hemograma_Completo_Ago2026.pdf</Text>
          <Text style={styles.fileDate}>15 Ago 2026</Text>
        </View>
        <View style={styles.fileItem}>
          <Text style={styles.fileName}>📄 Electrocardiograma_Jul2026.pdf</Text>
          <Text style={styles.fileDate}>28 Jul 2026</Text>
        </View>
      </View>

      {/* Export Action */}
      <TouchableOpacity style={styles.exportButton} onPress={handleExportPDF}>
        <Text style={styles.exportButtonText}>📥 Exportar Resumen Clínico (PDF)</Text>
      </TouchableOpacity>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  content: {
    padding: 16,
    paddingBottom: 32,
  },
  header: {
    marginBottom: 16,
  },
  title: {
    fontSize: 22,
    fontWeight: '700',
    color: COLORS.text,
  },
  subtitle: {
    fontSize: 13,
    color: COLORS.textMuted,
    marginTop: 2,
  },
  card: {
    backgroundColor: COLORS.card,
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.text,
    marginBottom: 12,
  },
  infoRow: {
    marginBottom: 10,
  },
  label: {
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.textMuted,
    marginBottom: 2,
  },
  value: {
    fontSize: 14,
    color: COLORS.text,
    fontWeight: '500',
  },
  fileItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  fileName: {
    fontSize: 13,
    color: COLORS.text,
    fontWeight: '500',
  },
  fileDate: {
    fontSize: 12,
    color: COLORS.textMuted,
  },
  exportButton: {
    backgroundColor: COLORS.primary,
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
    marginTop: 8,
  },
  exportButtonText: {
    color: '#ffffff',
    fontSize: 15,
    fontWeight: '700',
  },
});
