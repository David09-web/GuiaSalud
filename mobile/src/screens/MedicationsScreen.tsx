import React, { useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity } from 'react-native';
import { COLORS } from '../theme/colors';

export const MedicationsScreen: React.FC = () => {
  const [meds, setMeds] = useState([
    {
      id: 'med-001',
      name: 'Enalapril',
      dose: '10 mg',
      frequency: 'Cada 12 horas',
      durationDays: 90,
      daysElapsed: 76,
      takenToday: 'taken' as const,
    },
    {
      id: 'med-002',
      name: 'Metformina',
      dose: '850 mg',
      frequency: 'Con el desayuno',
      durationDays: 60,
      daysElapsed: 45,
      takenToday: 'pending' as const,
    },
    {
      id: 'med-003',
      name: 'Atorvastatina',
      dose: '20 mg',
      frequency: 'En la noche',
      durationDays: 30,
      daysElapsed: 28,
      takenToday: 'pending' as const,
    },
  ]);

  const toggleDose = (id: string) => {
    setMeds((prev) =>
      prev.map((m) =>
        m.id === id
          ? { ...m, takenToday: m.takenToday === 'taken' ? 'pending' : 'taken' }
          : m
      )
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Tratamientos Activos</Text>
        <Text style={styles.subtitle}>Control y adherencia farmacológica</Text>
      </View>

      <FlatList
        data={meds}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
        renderItem={({ item }) => {
          const progress = Math.min(100, Math.round((item.daysElapsed / item.durationDays) * 100));
          const isEndingSoon = item.durationDays - item.daysElapsed <= 5;

          return (
            <View style={styles.card}>
              <View style={styles.cardTop}>
                <View>
                  <Text style={styles.medName}>{item.name}</Text>
                  <Text style={styles.medDose}>{item.dose} • {item.frequency}</Text>
                </View>
                {isEndingSoon && (
                  <View style={styles.warningBadge}>
                    <Text style={styles.warningText}>⚠️ Por vencer</Text>
                  </View>
                )}
              </View>

              {/* Progress bar */}
              <View style={styles.progressContainer}>
                <View style={styles.progressHeader}>
                  <Text style={styles.progressLabel}>Día {item.daysElapsed} de {item.durationDays}</Text>
                  <Text style={styles.progressPercent}>{progress}%</Text>
                </View>
                <View style={styles.progressBar}>
                  <View style={[styles.progressFill, { width: `${progress}%` }]} />
                </View>
              </View>

              {/* Action */}
              <TouchableOpacity
                style={[
                  styles.doseButton,
                  item.takenToday === 'taken' ? styles.doseButtonTaken : styles.doseButtonPending,
                ]}
                onPress={() => toggleDose(item.id)}
              >
                <Text style={styles.doseButtonText}>
                  {item.takenToday === 'taken' ? '✓ Dosis de Hoy Tomada' : '○ Marcar como Tomada'}
                </Text>
              </TouchableOpacity>
            </View>
          );
        }}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  header: {
    padding: 16,
    backgroundColor: COLORS.card,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
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
  list: {
    padding: 16,
    gap: 12,
  },
  card: {
    backgroundColor: COLORS.card,
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  cardTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  medName: {
    fontSize: 17,
    fontWeight: '700',
    color: COLORS.text,
  },
  medDose: {
    fontSize: 13,
    color: COLORS.textMuted,
    marginTop: 2,
  },
  warningBadge: {
    backgroundColor: '#fef3c7',
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 8,
  },
  warningText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#b45309',
  },
  progressContainer: {
    marginBottom: 14,
  },
  progressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  progressLabel: {
    fontSize: 12,
    color: COLORS.textMuted,
  },
  progressPercent: {
    fontSize: 12,
    fontWeight: '700',
    color: COLORS.primary,
  },
  progressBar: {
    height: 6,
    backgroundColor: '#e2e8f0',
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: COLORS.primary,
    borderRadius: 4,
  },
  doseButton: {
    borderRadius: 10,
    paddingVertical: 10,
    alignItems: 'center',
  },
  doseButtonPending: {
    backgroundColor: COLORS.primaryLight,
  },
  doseButtonTaken: {
    backgroundColor: '#dcfce7',
  },
  doseButtonText: {
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.primaryDark,
  },
});
