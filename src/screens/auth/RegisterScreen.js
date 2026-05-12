import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Animated,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import useAuth from '../../hooks/useAuth';
import { validateEmail, validatePassword } from '../../services/authService';

const COLORS = {
  primary: '#4f46e5',
  background: '#f8f9ff',
  text: '#1a1a2e',
  muted: '#6b7280',
  border: '#e5e7eb',
};

export default function RegisterScreen({ navigation }) {
  const { register, loading, error, clearError } = useAuth();
  const [nombre, setNombre] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [acceptTerms, setAcceptTerms] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [localError, setLocalError] = useState('');
  const [noticeVisible, setNoticeVisible] = useState(false);
  const noticeOpacity = useRef(new Animated.Value(0)).current;
  const noticeScale = useRef(new Animated.Value(0.96)).current;
  const shakeAnim = useRef(new Animated.Value(0)).current;

  const isEmailValid = useMemo(() => validateEmail(email), [email]);
  const isPasswordValid = useMemo(() => validatePassword(password), [password]);
  const passwordsMatch = password === confirmPassword;
  const isDisabled =
    !nombre.trim() ||
    !email.trim() ||
    !password.trim() ||
    !confirmPassword.trim() ||
    !acceptTerms ||
    !isEmailValid ||
    !isPasswordValid ||
    !passwordsMatch;

  useEffect(() => {
    if (error) {
      setLocalError(error);
    }
  }, [error]);

  useEffect(() => {
    if (!localError) return;
    setNoticeVisible(true);
    noticeOpacity.setValue(0);
    noticeScale.setValue(0.96);
    Animated.parallel([
      Animated.timing(noticeOpacity, {
        toValue: 1,
        duration: 200,
        useNativeDriver: true,
      }),
      Animated.spring(noticeScale, {
        toValue: 1,
        friction: 7,
        tension: 140,
        useNativeDriver: true,
      }),
    ]).start();

    Animated.sequence([
      Animated.timing(shakeAnim, { toValue: 8, duration: 60, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: -8, duration: 60, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: 5, duration: 60, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: 0, duration: 60, useNativeDriver: true }),
    ]).start();
  }, [localError, noticeOpacity, noticeScale, shakeAnim]);

  const handleSubmit = useCallback(async () => {
    if (!nombre.trim() || !email.trim() || !password.trim() || !confirmPassword.trim()) {
      setLocalError('Todos los campos son obligatorios');
      return;
    }
    if (!isEmailValid) {
      setLocalError('Email inválido');
      return;
    }
    if (!isPasswordValid) {
      setLocalError('Contraseña debe tener al menos 8 caracteres');
      return;
    }
    if (!passwordsMatch) {
      setLocalError('Las contraseñas no coinciden');
      return;
    }
    if (!acceptTerms) {
      setLocalError('Por favor acepta los términos y condiciones');
      return;
    }

    try {
      await register(email.trim(), password, nombre.trim());
      navigation.navigate('Login');
    } catch (err) {
      setLocalError(err?.message || 'El email ya está registrado');
    }
  }, [
    acceptTerms,
    confirmPassword,
    email,
    isEmailValid,
    isPasswordValid,
    navigation,
    nombre,
    password,
    passwordsMatch,
    register,
  ]);

  const closeNotice = useCallback(() => {
    Animated.timing(noticeOpacity, {
      toValue: 0,
      duration: 150,
      useNativeDriver: true,
    }).start(() => setNoticeVisible(false));
    setLocalError('');
    clearError();
  }, [clearError, noticeOpacity]);

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <Animated.View style={[styles.card, { transform: [{ translateX: shakeAnim }] }]}
      >
        <Text style={styles.title}>Crear cuenta</Text>
        <Text style={styles.subtitle}>Regístrate para empezar tu biblioteca</Text>

        <Text style={styles.label}>Nombre completo</Text>
        <TextInput
          style={styles.input}
          placeholder="Ej. Juan Pérez"
          placeholderTextColor={COLORS.muted}
          value={nombre}
          onChangeText={setNombre}
        />

        <Text style={styles.label}>Email</Text>
        <TextInput
          style={styles.input}
          placeholder="correo@ejemplo.com"
          placeholderTextColor={COLORS.muted}
          keyboardType="email-address"
          autoCapitalize="none"
          value={email}
          onChangeText={setEmail}
        />
        {!!email && !isEmailValid && (
          <Text style={styles.helperText}>Email inválido</Text>
        )}

        <Text style={styles.label}>Contraseña</Text>
        <View style={styles.passwordRow}>
          <TextInput
            style={[styles.input, styles.passwordInput]}
            placeholder="Mínimo 8 caracteres"
            placeholderTextColor={COLORS.muted}
            secureTextEntry={!showPassword}
            value={password}
            onChangeText={setPassword}
          />
          <TouchableOpacity
            style={styles.toggleBtn}
            onPress={() => setShowPassword((prev) => !prev)}
          >
            <Text style={styles.toggleText}>{showPassword ? 'Ocultar' : 'Mostrar'}</Text>
          </TouchableOpacity>
        </View>
        {!!password && !isPasswordValid && (
          <Text style={styles.helperText}>Contraseña debe tener al menos 8 caracteres</Text>
        )}

        <Text style={styles.label}>Confirmar contraseña</Text>
        <View style={styles.passwordRow}>
          <TextInput
            style={[styles.input, styles.passwordInput]}
            placeholder="Repite tu contraseña"
            placeholderTextColor={COLORS.muted}
            secureTextEntry={!showConfirm}
            value={confirmPassword}
            onChangeText={setConfirmPassword}
          />
          <TouchableOpacity
            style={styles.toggleBtn}
            onPress={() => setShowConfirm((prev) => !prev)}
          >
            <Text style={styles.toggleText}>{showConfirm ? 'Ocultar' : 'Mostrar'}</Text>
          </TouchableOpacity>
        </View>
        {!!confirmPassword && !passwordsMatch && (
          <Text style={styles.helperText}>Las contraseñas no coinciden</Text>
        )}

        <TouchableOpacity
          style={styles.termsRow}
          onPress={() => setAcceptTerms((prev) => !prev)}
          activeOpacity={0.85}
        >
          <View style={[styles.checkbox, acceptTerms && styles.checkboxChecked]}>
            {acceptTerms && <Text style={styles.checkboxText}>✓</Text>}
          </View>
          <Text style={styles.termsText}>Aceptar términos y condiciones</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.primaryBtn, isDisabled && styles.primaryBtnDisabled]}
          onPress={handleSubmit}
          disabled={isDisabled || loading}
          activeOpacity={0.85}
        >
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.primaryBtnText}>Crear cuenta</Text>
          )}
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.linkBtn}
          onPress={() => navigation.navigate('Login')}
        >
          <Text style={styles.linkText}>¿Ya tienes cuenta? Inicia sesión</Text>
        </TouchableOpacity>
      </Animated.View>

      {noticeVisible && (
        <View style={styles.noticeBackdrop}>
          <Animated.View style={[styles.noticeCard, { opacity: noticeOpacity, transform: [{ scale: noticeScale }] }]}
          >
            <Text style={styles.noticeEmoji}>⚠️</Text>
            <Text style={styles.noticeTitle}>Error</Text>
            <Text style={styles.noticeText}>{localError}</Text>
            <TouchableOpacity style={styles.noticeBtn} onPress={closeNotice}>
              <Text style={styles.noticeBtnText}>Entendido</Text>
            </TouchableOpacity>
          </Animated.View>
        </View>
      )}
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
    paddingHorizontal: 20,
    justifyContent: 'center',
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.08,
    shadowRadius: 10,
    elevation: 4,
  },
  title: {
    fontSize: 24,
    fontWeight: '800',
    color: COLORS.text,
  },
  subtitle: {
    fontSize: 13,
    color: COLORS.muted,
    marginTop: 4,
    marginBottom: 16,
  },
  label: {
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.muted,
    marginBottom: 6,
    marginTop: 12,
  },
  input: {
    backgroundColor: COLORS.background,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 14,
    borderWidth: 1.5,
    borderColor: COLORS.border,
    color: COLORS.text,
  },
  helperText: {
    fontSize: 11,
    color: '#ef4444',
    marginTop: 4,
  },
  passwordRow: {
    position: 'relative',
    justifyContent: 'center',
  },
  passwordInput: {
    paddingRight: 90,
  },
  toggleBtn: {
    position: 'absolute',
    right: 12,
    paddingVertical: 6,
    paddingHorizontal: 8,
  },
  toggleText: {
    color: COLORS.primary,
    fontSize: 12,
    fontWeight: '700',
  },
  termsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 16,
  },
  termsText: {
    marginLeft: 10,
    fontSize: 12,
    color: COLORS.muted,
    fontWeight: '600',
  },
  checkbox: {
    width: 20,
    height: 20,
    borderRadius: 6,
    borderWidth: 1.5,
    borderColor: COLORS.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkboxChecked: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  checkboxText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 12,
  },
  primaryBtn: {
    backgroundColor: COLORS.primary,
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
    marginTop: 20,
  },
  primaryBtnDisabled: {
    opacity: 0.6,
  },
  primaryBtnText: {
    color: '#fff',
    fontSize: 15,
    fontWeight: '700',
  },
  linkBtn: {
    marginTop: 16,
    alignItems: 'center',
  },
  linkText: {
    color: COLORS.muted,
    fontSize: 13,
    fontWeight: '600',
  },
  noticeBackdrop: {
    ...StyleSheet.absoluteFillObject,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 16,
    backgroundColor: 'rgba(15, 23, 42, 0.2)',
  },
  noticeCard: {
    backgroundColor: '#ffffff',
    borderRadius: 18,
    width: '90%',
    paddingHorizontal: 22,
    paddingVertical: 22,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#fde5b1',
    shadowColor: '#4f46e5',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.18,
    shadowRadius: 14,
    elevation: 8,
  },
  noticeEmoji: {
    fontSize: 26,
    marginBottom: 6,
  },
  noticeTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.primary,
  },
  noticeText: {
    fontSize: 14,
    color: COLORS.muted,
    marginTop: 8,
    textAlign: 'center',
  },
  noticeBtn: {
    marginTop: 16,
    backgroundColor: COLORS.primary,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  noticeBtnText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 13,
  },
});
