import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { COLORS } from '../theme/colors';

export const ProfileScreen: React.FC<{ navigation: any }> = ({ navigation }) => {
  const handleEmergencyCall = () => {
    Alert.alert('Línea de Emergencia 123', 'Iniciando llamada rápida al sistema de emergencias médicas de Neiva...');
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {/* Profile Header */}
      <View style={styles.profileHeader}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>MR</Text>
        </View>
        <Text style={styles.userName}>María Rodríguez</Text>
        <Text style={styles.userRole}>Rol: Paciente Principal</Text>
      </View>

      {/* Emergency Button */}
      <TouchableOpacity style={styles.emergencyButton} onPress={handleEmergencyCall}>
        <Text style={styles.emergencyText}>🚨 Llamada de Emergencia Rápida (123)</Text>
      </TouchableOpacity>

      {/* Caregiver Delegation */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>Familiar / Cuidador Autorizado</Text>
        <Text style={styles.caregiverName}>Carlos Rodríguez (Hermano)</Text>
        <Text style={styles.caregiverPerms}>Permisos: Agenda médica, Medicamentos y Alertas</Text>
      </View>

      {/* Habeas Data & Security */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>Privacidad y Habeas Data</Text>
        <Text style={styles.privacyText}>
          Tus datos médicos se encuentran cifrados bajo el estándar AES-256. Puedes descargar una copia de tus datos o revocar consentimientos en cualquier momento.
        </Text>
      </View>

      <TouchableOpacity
        style={styles.logoutButton}
        onPress={() => navigation.replace('Login')}
      >
        <Text style={styles.logoutText}>Cerrar Sesión</Text>
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
  profileHeader: {
    alignItems: 'center',
    marginVertical: 16,
  },
  avatar: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: COLORS.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  avatarText: {
    fontSize: 24,
    fontWeight: '700',
    color: '#ffffff',
  },
  userName: {
    fontSize: 20,
    fontWeight: '700',
    color: COLORS.text,
  },
  userRole: {
    fontSize: 13,
    color: COLORS.textMuted,
    marginTop: 2,
  },
  emergencyButton: {
    backgroundColor: COLORS.danger,
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
    marginBottom: 16,
  },
  emergencyText: {
    color: '#ffffff',
    fontWeight: '700',
    fontSize: 15,
  },
  card: {
    backgroundColor: COLORS.card,
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  cardTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: COLORS.text,
    marginBottom: 8,
  },
  caregiverName: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.primaryDark,
  },
  caregiverPerms: {
    fontSize: 12,
    color: COLORS.textMuted,
    marginTop: 4,
  },
  privacyText: {
    fontSize: 12,
    color: COLORS.textMuted,
    lineHeight: 18,
  },
  logoutButton: {
    borderRadius: 12,
    paddingVertical: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.border,
    marginTop: 8,
  },
  logoutText: {
    color: COLORS.danger,
    fontWeight: '600',
    fontSize: 14,
  },
});
