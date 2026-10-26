import React, { useContext } from 'react';
import { StyleSheet, View, ActivityIndicator } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import { AuthProvider, AuthContext } from './src/context/AuthContext';
import LoginScreen from './src/screens/LoginScreen';
import DashboardScreen from './src/screens/DashboardScreen';
import ComplaintFormScreen from './src/screens/ComplaintFormScreen';
import ComplaintsListScreen from './src/screens/ComplaintsListScreen';
import ReportsScreen from './src/screens/ReportsScreen';
import AdminMasterScreen from './src/screens/AdminMasterScreen';

import SplashScreen from './src/components/SplashScreen';

const Stack = createNativeStackNavigator();

function RootNavigator() {
    const { isAuthenticated, loading } = useContext(AuthContext);

    if (loading) {
        return <SplashScreen />;
    }

    return (
        <Stack.Navigator
            screenOptions={{
                headerStyle: {
                    backgroundColor: '#141e33',
                },
                headerTintColor: '#38bdf8',
                headerTitleStyle: {
                    fontWeight: '800',
                    fontSize: 18,
                    color: '#f8fafc',
                },
                headerShadowVisible: false,
                contentStyle: {
                    backgroundColor: '#090d16',
                },
            }}
        >
            {!isAuthenticated ? (
                <Stack.Screen
                    name="Login"
                    component={LoginScreen}
                    options={{ headerShown: false }}
                />
            ) : (
                <>
                    <Stack.Screen
                        name="Dashboard"
                        component={DashboardScreen}
                        options={{ title: 'TMS Control Panel' }}
                    />
                    <Stack.Screen
                        name="CreateTicket"
                        component={ComplaintFormScreen}
                        options={{ title: 'Raise Ticket' }}
                    />
                    <Stack.Screen
                        name="ComplaintsList"
                        component={ComplaintsListScreen}
                        options={{ title: 'All Complaints & Tickets' }}
                    />
                    <Stack.Screen
                        name="Reports"
                        component={ReportsScreen}
                        options={{ title: 'Analytics & Reports' }}
                    />
                    <Stack.Screen
                        name="AdminMaster"
                        component={AdminMasterScreen}
                        options={{ headerShown: false }}
                    />
                </>
            )}
        </Stack.Navigator>
    );
}

export default function App() {
    return (
        <AuthProvider>
            <NavigationContainer>
                <StatusBar style="light" />
                <RootNavigator />
            </NavigationContainer>
        </AuthProvider>
    );
}

const styles = StyleSheet.create({
    loadingContainer: {
        flex: 1,
        backgroundColor: '#090d16',
        justifyContent: 'center',
        alignItems: 'center',
    },
});
