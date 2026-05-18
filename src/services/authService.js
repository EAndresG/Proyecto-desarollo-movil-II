import AsyncStorage from '@react-native-async-storage/async-storage';

const USERS_KEY = 'auth:users';
const DEFAULT_USER = {
  email: 'test@example.com',
  password: 'password123',
  nombre: 'Test User',
};

async function ensureUsers() {
  const raw = await AsyncStorage.getItem(USERS_KEY);
  if (raw) {
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed)) return parsed;
  }
  await AsyncStorage.setItem(USERS_KEY, JSON.stringify([DEFAULT_USER]));
  return [DEFAULT_USER];
}

function normalizeEmail(email) {
  return String(email || '').trim().toLowerCase();
}

export function validateEmail(email) {
  const value = String(email || '').trim();
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

export function validatePassword(password) {
  return String(password || '').length >= 8;
}

export function login(email, password) {
  return new Promise((resolve, reject) => {
    setTimeout(async () => {
      try {
        const users = await ensureUsers();
        const normalizedEmail = normalizeEmail(email);
        const user = users.find(
          (item) => item.email === normalizedEmail && item.password === password
        );
        if (!user) {
          reject(new Error('Credenciales inválidas'));
          return;
        }
        resolve({ email: user.email, nombre: user.nombre });
      } catch (error) {
        reject(error);
      }
    }, 600);
  });
}

export function register(email, password, nombre) {
  return new Promise((resolve, reject) => {
    setTimeout(async () => {
      try {
        const users = await ensureUsers();
        const normalizedEmail = normalizeEmail(email);
        const exists = users.some((item) => item.email === normalizedEmail);
        if (exists) {
          reject(new Error('El email ya está registrado'));
          return;
        }
        const user = {
          email: normalizedEmail,
          password,
          nombre: String(nombre || '').trim() || 'Usuario',
        };
        const nextUsers = [...users, user];
        await AsyncStorage.setItem(USERS_KEY, JSON.stringify(nextUsers));
        resolve({ email: user.email, nombre: user.nombre });
      } catch (error) {
        reject(error);
      }
    }, 700);
  });
}
