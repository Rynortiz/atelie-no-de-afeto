import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import LoginScreen from '../screens/LoginScreen';
import RegisterScreen from '../screens/RegisterScreen';
import ProductListScreen from '../screens/ProductListScreen';
import ProductFormScreen from '../screens/ProductFormScreen';
import ProductDetailScreen from '../screens/ProductDetailScreen';
import { LoadingView } from '../components/StateViews';
import { useAuth } from '../contexts/AuthContext';
import { colors } from '../theme/theme';

const Stack = createNativeStackNavigator();
export default function AppNavigator() {
  const { isAuthenticated, loading } = useAuth();

  if (loading) return <LoadingView message="Iniciando..." />;

  return (
    <NavigationContainer>
      <Stack.Navigator
        screenOptions={{
          headerStyle: { backgroundColor: colors.primary },
          headerTintColor: colors.textInverse,
          contentStyle: { backgroundColor: colors.background },
        }}>
        {isAuthenticated ? (
          <>
            <Stack.Screen
              name="ProductList"
              component={ProductListScreen}
              options={{ title: 'Produtos' }}
            />
            <Stack.Screen
              name="ProductForm"
              component={ProductFormScreen}
              options={{ title: 'Produto' }}
            />
            <Stack.Screen
              name="ProductDetail"
              component={ProductDetailScreen}
              options={{
                title: '',
                headerTransparent: true,
                headerTintColor: colors.textInverse,
                headerShadowVisible: false,
              }}
            />
          </>
        ) : (
          <>
            <Stack.Screen
              name="Login"
              component={LoginScreen}
              options={{ headerShown: false }}
            />
            <Stack.Screen
              name="Register"
              component={RegisterScreen}
              options={{
                title: '',
                headerTransparent: true,
                headerTintColor: colors.primaryDark,
                headerShadowVisible: false,
                headerStyle: { backgroundColor: 'rgba(253, 248, 244, 0.85)' },
              }}
            />
          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}