import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, Alert } from 'react-native';
import { COLORS } from '../theme/colors';

export const LoginScreen: React.FC<{ navigation: any }> = ({ navigation }) => {
  const [email, setEmail] = useState('maria.rodriguez@gmail.com');
  const [password, setPassword] = useState('••••••••');
  const [step, setStep] = useState<'LOGIN' | '2FA'>('LOGIN');
  const [twoFactorCode, setTwoFactorCode] = useState('');

  const handleLogin = () => {
    if (!email || !password) {
      Alert.alert('Error', 'Por favor ingrese su correo y contraseña.');
      return;
    }
    setStep('2FA');
  };

  const handleVerify2FA = () => {
    if (twoFactorCode.length !== 6) {
      Alert.alert('Código Requerido', 'Por favor digite el código de 6 dígitos enviado a su teléfono.');
      return;
    }
    navigation.replace('MainTabs');
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.logo}>🩺 GuiaSalud</Text>
        <Text style={styles.tagline}>Plataforma Integral de Salud en Colombia</Text>
      </View>

      <View style={styles.form}>
        {step === 'LOGIN' ? (
          <>
            <Text style={styles.label}>Correo Electrónico</Text>
            <TextInput
              style={styles.input}
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
            />

            <Text style={styles.label}>Contraseña</Text>
            <TextInput
              style={styles.input}
              value={password}
              onChangeText={setPassword}
              secureTextEntry
            />

            <TouchableOpacity style={styles.primaryButton} onPress={handleLogin}>
              <Text style={styles.buttonText}>Continuar con 2FA</Text>
            </TouchableOpacity>
          </>
        ) : (
          <>
            <Text style={styles.stepTitle}>Verificación de Seguridad 2FA</Text>
            <Text style={styles.stepSubtitle}>
              Hemos enviado un código de 6 dígitos a su número registrado.
            </Text>

            <TextInput
              style={[styles.input, styles.codeInput]}
              value={twoFactorCode}
              onChangeText={setTwoFactorCode}
              keyboardType="number-pad"
              maxLength={6}
              placeholder="000000"
            />

            <TouchableOpacity style={styles.primaryButton} onPress={handleVerify2FA}>
              <Text style={styles.buttonText}>Verificar e Ingresar</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.secondaryButton} onPress={() => setStep('LOGIN')}>
              <Text style={styles.secondaryButtonText}>Volver</Text>
            </TouchableOpacity>
          </>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
    justifyContent: 'center',
    padding: 24,
  },
  header: {
    alignItems: 'center',
    marginBottom: 32,
  },
  logo: {
    fontSize: 32,
    fontWeight: '800',
    color: COLORS.primaryDark,
  },
  tagline: {
    fontSize: 13,
    color: COLORS.textMuted,
    marginTop: 6,
    textAlign: 'center',
  },
  form: {
    backgroundColor: COLORS.card,
    borderRadius: 20,
    padding: 20,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  label: {
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: 6,
  },
  input: {
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 10,
    padding: 12,
    fontSize: 14,
    color: COLORS.text,
    marginBottom: 16,
  },
  codeInput: {
    fontSize: 24,
    textAlign: 'center',
    letterSpacing: 8,
    fontWeight: '700',
  },
  stepTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.text,
    marginBottom: 4,
  },
  stepSubtitle: {
    fontSize: 13,
    color: COLORS.textMuted,
    marginBottom: 16,
  },
  primaryButton: {
    backgroundColor: COLORS.primary,
    borderRadius: 10,
    paddingVertical: 14,
    alignItems: 'center',
  },
  buttonText: {
    color: '#ffffff',
    fontWeight: '700',
    fontSize: 14,
  },
  secondaryButton: {
    marginTop: 12,
    alignItems: 'center',
  },
  secondaryButtonText: {
    color: COLORS.textMuted,
    fontSize: 13,
  },
});
