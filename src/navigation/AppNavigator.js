import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';

import HomeScreen from '../screens/HomeScreen';
import LibroDetalleScreen from '../screens/LibroDetalleScreen';
import AgregarLibroScreen from '../screens/AgregarLibroScreen';

const Stack = createStackNavigator();

export default function AppNavigator() {
  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="Home">
        <Stack.Screen name="Home" component={HomeScreen} />
        <Stack.Screen name="LibroDetalle" component={LibroDetalleScreen} />
        <Stack.Screen name="AgregarLibro" component={AgregarLibroScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
