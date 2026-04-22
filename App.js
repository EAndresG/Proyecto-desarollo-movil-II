import React from 'react';
import AppNavigator from './src/navigation/AppNavigator';
import { LibrosProvider } from './src/context/LibrosContext';

export default function App() {
  return (
    <LibrosProvider>
      <AppNavigator />
    </LibrosProvider>
  );
}
