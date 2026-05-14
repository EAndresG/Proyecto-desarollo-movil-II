import React from 'react';
import AppNavigator from './src/navigation/AppNavigator';
import { LibrosProvider } from './src/context/LibrosContext';
import { AuthProvider } from './src/context/AuthContext';
import { NavigationContainer } from '@react-navigation/native';

export default function App() {
  return (
    <AuthProvider>
      <LibrosProvider>
        <NavigationContainer>
          <AppNavigator />
        </NavigationContainer>
      </LibrosProvider>
    </AuthProvider>
  );
}
