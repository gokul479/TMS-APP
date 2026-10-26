import React, { createContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { authService } from '../config/api';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [token, setToken] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadStoredAuth();
    }, []);

    const loadStoredAuth = async () => {
        const startTime = Date.now();
        try {
            const storedToken = await AsyncStorage.getItem('userToken');
            if (storedToken) {
                setToken(storedToken);
                const res = await authService.getProfile();
                setUser(res.data);
            }
        } catch (error) {
            console.log('Session expired or error loading profile:', error?.message);
            await AsyncStorage.removeItem('userToken');
            setToken(null);
            setUser(null);
        } finally {
            const elapsedTime = Date.now() - startTime;
            const remainingTime = Math.max(0, 1800 - elapsedTime);
            setTimeout(() => {
                setLoading(false);
            }, remainingTime);
        }
    };

    const login = async (email, password) => {
        const response = await authService.login(email, password);
        const { token: newToken, user: userData } = response.data;
        await AsyncStorage.setItem('userToken', newToken);
        setToken(newToken);
        setUser(userData);
        return response.data;
    };

    const logout = async () => {
        await AsyncStorage.removeItem('userToken');
        setToken(null);
        setUser(null);
    };

    return (
        <AuthContext.Provider
            value={{
                user,
                token,
                loading,
                login,
                logout,
                isAuthenticated: !!token,
                refreshProfile: loadStoredAuth,
            }}
        >
            {children}
        </AuthContext.Provider>
    );
};
