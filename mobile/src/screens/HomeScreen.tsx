import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { COLORS } from '../theme/colors';

export const HomeScreen: React.FC<{ navigation: any }> = ({ navigation }) => {
  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {/* Header Banner */}
      <View style={styles.header}>
        <Text style={styles.greeting}>Hola, María 👋</Text>
        <Text style={styles.subtitle}>Tu salud organizada en un solo lugar</Text>
      </View>

      {/* Quick Summary Card */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>Próxima Cita Médica</Text>
        <View style={styles.appointmentInfo}>
          <Text style={styles.aptSpecialty}>Medicina General</Text>
          <Text style={styles.aptDoctor}>Dr. Andrés Morales</Text>
          <Text style={styles.aptDate}>Viernes, 4 de Septiembre - 09:30 AM</Text>
        </View>
        <TouchableOpacity
          style={styles.primaryButton}
          onPress={() => navigation.navigate('Agenda')}
        >
          <Text style={styles.buttonText}>Ver Agenda Completa</Text>
        </TouchableOpacity>
      </View>

      {/* Medication Reminder Card */}
      <View style={[styles.card, { borderColor: COLORS.accent, borderWidth: 1 }]}>
        <Text style={styles.cardTitle}>Medicamentos de Hoy</Text>
        <Text style={styles.medText}>💊 Enalapril 10mg - Tomada a las 08:00 AM</Text>
        <Text style={styles.medText}>💊 Metformina 850mg - Pendiente (Con el almuerzo)</Text>
        <TouchableOpacity
          style={[styles.primaryButton, { backgroundColor: COLORS.secondary }]}
          onPress={() => navigation.navigate('Medications')}
        >
          <Text style={styles.buttonText}>Gestionar Tratamientos</Text>
        </TouchableOpacity>
      </View>

      {/* Quick Actions Grid */}
      <Text style={styles.sectionHeader}>Accesos Rápidos</Text>
      <View style={styles.grid}>
        <TouchableOpacity style={styles.gridItem} onPress={() => navigation.navigate('History')}>
          <Text style={styles.gridEmoji}>📋</Text>
          <Text style={styles.gridLabel}>Historia Clínica</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.gridItem} onPress={() => navigation.navigate('Profile')}>
          <Text style={styles.gridEmoji}>👥</Text>
          <Text style={styles.gridLabel}>Modo Familiar</Text>
        </TouchableOpacity>
      </View>
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
    marginBottom: 20,
    marginTop: 8,
  },
  greeting: {
    fontSize: 24,
    fontWeight: '700',
    color: COLORS.text,
  },
  subtitle: {
    fontSize: 14,
    color: COLORS.textMuted,
    marginTop: 4,
  },
  card: {
    backgroundColor: COLORS.card,
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: 12,
  },
  appointmentInfo: {
    backgroundColor: COLORS.primaryLight,
    borderRadius: 12,
    padding: 12,
    marginBottom: 12,
  },
  aptSpecialty: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.primaryDark,
  },
  aptDoctor: {
    fontSize: 14,
    color: COLORS.text,
    marginTop: 2,
  },
  aptDate: {
    fontSize: 13,
    color: COLORS.textMuted,
    marginTop: 4,
  },
  medText: {
    fontSize: 14,
    color: COLORS.text,
    marginBottom: 8,
  },
  primaryButton: {
    backgroundColor: COLORS.primary,
    borderRadius: 10,
    paddingVertical: 12,
    alignItems: 'center',
    marginTop: 4,
  },
  buttonText: {
    color: '#ffffff',
    fontWeight: '600',
    fontSize: 14,
  },
  sectionHeader: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.text,
    marginTop: 8,
    marginBottom: 12,
  },
  grid: {
    flexDirection: 'row',
    gap: 12,
  },
  gridItem: {
    flex: 1,
    backgroundColor: COLORS.card,
    borderRadius: 16,
    padding: 16,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  gridEmoji: {
    fontSize: 28,
    marginBottom: 8,
  },
  gridLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.text,
  },
});
