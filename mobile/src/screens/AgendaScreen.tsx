import React, { useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity } from 'react-native';
import { COLORS } from '../theme/colors';

export const AgendaScreen: React.FC = () => {
  const [filter, setFilter] = useState<'all' | 'pending' | 'done'>('all');

  const appointments = [
    {
      id: 'apt-001',
      date: '2026-09-04',
      time: '09:30 AM',
      specialty: 'Medicina General',
      doctor: 'Dr. Andrés Morales',
      center: 'Centro Médico El Bosque',
      status: 'pending',
    },
    {
      id: 'apt-002',
      date: '2026-09-10',
      time: '02:00 PM',
      specialty: 'Cardiología',
      doctor: 'Dra. Claudia Vega',
      center: 'Clínica del Norte',
      status: 'pending',
    },
  ];

  return (
    <View style={styles.container}>
      {/* Header & Filter Tabs */}
      <View style={styles.header}>
        <Text style={styles.title}>Agenda Médica</Text>
        <View style={styles.filterRow}>
          {(['all', 'pending', 'done'] as const).map((f) => (
            <TouchableOpacity
              key={f}
              style={[styles.filterButton, filter === f && styles.filterButtonActive]}
              onPress={() => setFilter(f)}
            >
              <Text style={[styles.filterText, filter === f && styles.filterTextActive]}>
                {f === 'all' ? 'Todas' : f === 'pending' ? 'Pendientes' : 'Realizadas'}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* Appointments List */}
      <FlatList
        data={appointments}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
        renderItem={({ item }) => (
          <View style={styles.card}>
            <View style={styles.cardHeader}>
              <Text style={styles.specialty}>{item.specialty}</Text>
              <View style={styles.badge}>
                <Text style={styles.badgeText}>Pendiente</Text>
              </View>
            </View>
            <Text style={styles.doctor}>👨‍⚕️ {item.doctor}</Text>
            <Text style={styles.center}>🏥 {item.center}</Text>
            <View style={styles.footer}>
              <Text style={styles.dateTime}>📅 {item.date} • ⏰ {item.time}</Text>
            </View>
          </View>
        )}
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
    marginBottom: 12,
  },
  filterRow: {
    flexDirection: 'row',
    gap: 8,
  },
  filterButton: {
    paddingVertical: 6,
    paddingHorizontal: 14,
    borderRadius: 20,
    backgroundColor: COLORS.background,
  },
  filterButtonActive: {
    backgroundColor: COLORS.primary,
  },
  filterText: {
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.textMuted,
  },
  filterTextActive: {
    color: '#ffffff',
  },
  list: {
    padding: 16,
    gap: 12,
  },
  card: {
    backgroundColor: COLORS.card,
    borderRadius: 14,
    padding: 16,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  specialty: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.primaryDark,
  },
  badge: {
    backgroundColor: '#fef3c7',
    paddingVertical: 3,
    paddingHorizontal: 8,
    borderRadius: 8,
  },
  badgeText: {
    color: '#92400e',
    fontSize: 11,
    fontWeight: '600',
  },
  doctor: {
    fontSize: 14,
    color: COLORS.text,
    marginBottom: 4,
  },
  center: {
    fontSize: 13,
    color: COLORS.textMuted,
    marginBottom: 12,
  },
  footer: {
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
    paddingTop: 8,
  },
  dateTime: {
    fontSize: 12,
    color: COLORS.textMuted,
    fontWeight: '500',
  },
});
