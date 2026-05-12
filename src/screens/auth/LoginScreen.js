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

export default function LoginScreen({ navigation }) {
  const { login, loading, error, clearError } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [localError, setLocalError] = useState('');
  const [noticeVisible, setNoticeVisible] = useState(false);
  const noticeOpacity = useRef(new Animated.Value(0)).current;
  const noticeScale = useRef(new Animated.Value(0.96)).current;
  const shakeAnim = useRef(new Animated.Value(0)).current;

  const isEmailValid = useMemo(() => validateEmail(email), [email]);
  const isPasswordValid = useMemo(() => validatePassword(password), [password]);
  const isDisabled = !email.trim() || !password.trim() || !isEmailValid || !isPasswordValid;

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
    if (!email.trim() || !password.trim()) {
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

    try {
      await login(email.trim(), password);
      navigation.reset({ index: 0, routes: [{ name: 'Home' }] });
    } catch (err) {
      setLocalError(err?.message || 'Credenciales inválidas');
    }
  }, [email, password, isEmailValid, isPasswordValid, login, navigation]);

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
        <Text style={styles.title}>BookShelf</Text>
        <Text style={styles.subtitle}>Inicia sesión para continuar</Text>

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

        <TouchableOpacity style={styles.forgotBtn} activeOpacity={0.8}>
          <Text style={styles.forgotText}>¿Olvidaste tu contraseña?</Text>
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
            <Text style={styles.primaryBtnText}>Iniciar sesión</Text>
          )}
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.linkBtn}
          onPress={() => navigation.navigate('Register')}
        >
          <Text style={styles.linkText}>¿No tienes cuenta? Regístrate</Text>
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
    fontSize: 26,
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
  forgotBtn: {
    alignSelf: 'flex-end',
    marginTop: 10,
  },
  forgotText: {
    fontSize: 12,
    color: COLORS.primary,
    fontWeight: '600',
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
