import React from 'react';
import AppNavigator from './src/navigation/AppNavigator';
import { LibrosProvider } from './src/context/LibrosContext';
import { AuthProvider } from './src/context/AuthContext';

export default function App() {
  return (
    <AuthProvider>
      <LibrosProvider>
        <AppNavigator />
      </LibrosProvider>
    </AuthProvider>
  );
}
