import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';

import HomeScreen from '../screens/HomeScreen';
import LibroDetalleScreen from '../screens/LibroDetalleScreen';
import AgregarLibroScreen from '../screens/AgregarLibroScreen';
import AsistenteIAScreen from '../screens/AsistenteIAScreen';
import LectorPDFScreen from '../screens/LectorPDFScreen';
import LoginScreen from '../screens/auth/LoginScreen';
import RegisterScreen from '../screens/auth/RegisterScreen';

const Stack = createStackNavigator();

export default function AppNavigator() {
  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="Login">
        <Stack.Screen
          name="Login"
          component={LoginScreen}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="Register"
          component={RegisterScreen}
          options={{ headerShown: false }}
        />
        <Stack.Screen name="Home" component={HomeScreen} />
        <Stack.Screen name="LibroDetalle" component={LibroDetalleScreen} />
        <Stack.Screen name="AgregarLibro" component={AgregarLibroScreen} />
        <Stack.Screen name="LectorPDF" component={LectorPDFScreen} />
        <Stack.Screen
          name="AsistenteIA"
          component={AsistenteIAScreen}
          options={{ title: 'Asistente IA' }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
