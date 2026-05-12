const mockUsers = [
  { email: 'test@example.com', password: 'password123', nombre: 'Test User' },
];

export function validateEmail(email) {
  const value = String(email || '').trim();
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

export function validatePassword(password) {
  return String(password || '').length >= 8;
}

export function login(email, password) {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      const user = mockUsers.find(
        (item) => item.email === email && item.password === password
      );
      if (!user) {
        reject(new Error('Credenciales inválidas'));
        return;
      }
      resolve({ email: user.email, nombre: user.nombre });
    }, 1200);
  });
}

export function register(email, password, nombre) {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      const exists = mockUsers.some((item) => item.email === email);
      if (exists) {
        reject(new Error('El email ya está registrado'));
        return;
      }
      const user = { email, password, nombre };
      mockUsers.push(user);
      resolve({ email: user.email, nombre: user.nombre });
    }, 1400);
  });
}
