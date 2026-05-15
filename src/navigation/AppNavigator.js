import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';

import HomeScreen from '../screens/HomeScreen';
import LibroDetalleScreen from '../screens/LibroDetalleScreen';
import AgregarLibroScreen from '../screens/AgregarLibroScreen';
import AsistenteIAScreen from '../screens/AsistenteIAScreen';
import LectorPDFScreen from '../screens/LectorPDFScreen';
import PerfilScreen from '../screens/PerfilScreen';
import MetasScreen from '../screens/MetasScreen';
import EstadisticasScreenPlaceholder from '../screens/app/EstadisticasScreenPlaceholder';
import RecordatoriosScreen from '../screens/RecordatoriosScreen';
import LoginScreen from '../screens/auth/LoginScreen';
import RegisterScreen from '../screens/auth/RegisterScreen';
import useAuth from '../hooks/useAuth';

const AuthStack = createStackNavigator();
const AppStack = createStackNavigator();

function AuthNavigator() {
  return (
    <AuthStack.Navigator>
      <AuthStack.Screen
        name="Login"
        component={LoginScreen}
        options={{ headerShown: false }}
      />
      <AuthStack.Screen
        name="Register"
        component={RegisterScreen}
        options={{ headerShown: false }}
      />
    </AuthStack.Navigator>
  );
}

function MainNavigator() {
  return (
    <AppStack.Navigator>
      <AppStack.Screen name="Home" component={HomeScreen} />
      <AppStack.Screen name="Perfil" component={PerfilScreen} />
      <AppStack.Screen name="Estadisticas" component={EstadisticasScreenPlaceholder} />
      <AppStack.Screen
        name="Recordatorios"
        component={RecordatoriosScreen}
        options={{ headerShown: false }}
      />
      <AppStack.Screen name="Metas" component={MetasScreen} />
      <AppStack.Screen name="LibroDetalle" component={LibroDetalleScreen} />
      <AppStack.Screen name="AgregarLibro" component={AgregarLibroScreen} />
      <AppStack.Screen name="LectorPDF" component={LectorPDFScreen} />
      <AppStack.Screen
        name="AsistenteIA"
        component={AsistenteIAScreen}
        options={{ title: 'Asistente IA' }}
      />
    </AppStack.Navigator>
  );
}

export default function AppNavigator() {
  const { isAuthenticated } = useAuth();
  return isAuthenticated ? <MainNavigator /> : <AuthNavigator />;
}
