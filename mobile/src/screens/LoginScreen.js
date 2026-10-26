import React, { useState, useContext, useEffect, useRef } from 'react';
import {
    StyleSheet,
    Text,
    View,
    TextInput,
    TouchableOpacity,
    ActivityIndicator,
    Alert,
    KeyboardAvoidingView,
    Platform,
    ScrollView,
    Animated,
    Easing,
} from 'react-native';
import { AuthContext } from '../context/AuthContext';

export default function LoginScreen() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const { login } = useContext(AuthContext);

    // Pulse Logo Animation
    const scaleAnim = useRef(new Animated.Value(0.95)).current;
    const opacityAnim = useRef(new Animated.Value(0.6)).current;

    useEffect(() => {
        Animated.loop(
            Animated.sequence([
                Animated.parallel([
                    Animated.timing(scaleAnim, {
                        toValue: 1.06,
                        duration: 1400,
                        easing: Easing.out(Easing.ease),
                        useNativeDriver: true,
                    }),
                    Animated.timing(opacityAnim, {
                        toValue: 1,
                        duration: 1400,
                        easing: Easing.out(Easing.ease),
                        useNativeDriver: true,
                    }),
                ]),
                Animated.parallel([
                    Animated.timing(scaleAnim, {
                        toValue: 0.95,
                        duration: 1400,
                        easing: Easing.in(Easing.ease),
                        useNativeDriver: true,
                    }),
                    Animated.timing(opacityAnim, {
                        toValue: 0.6,
                        duration: 1400,
                        easing: Easing.in(Easing.ease),
                        useNativeDriver: true,
                    }),
                ]),
            ])
        ).start();
    }, [scaleAnim, opacityAnim]);

    const handleLogin = async () => {
        const cleanEmail = email.trim();
        const cleanPassword = password.trim();

        if (!cleanEmail || !cleanPassword) {
            Alert.alert('Required Fields', 'Please enter email and password.');
            return;
        }

        try {
            setIsSubmitting(true);
            await login(cleanEmail, cleanPassword);
        } catch (error) {
            const errorMsg =
                error.response?.data?.message || error.message || 'Login failed. Check server connection or credentials.';
            Alert.alert('Login Failed', errorMsg);
        } finally {
            setIsSubmitting(false);
        }
    };

    const fillDemoCredentials = (demoEmail, demoPass) => {
        setEmail(demoEmail);
        setPassword(demoPass);
    };

    return (
        <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            style={styles.container}
        >
            <ScrollView contentContainerStyle={styles.scrollContainer} keyboardShouldPersistTaps="handled">
                {/* Hero Header with Animated Glowing Logo */}
                <View style={styles.headerBox}>
                    <Animated.View
                        style={[
                            styles.logoGlowAura,
                            {
                                transform: [{ scale: scaleAnim }],
                                opacity: opacityAnim,
                            },
                        ]}
                    />
                    <Animated.View
                        style={[
                            styles.logoBadge,
                            {
                                transform: [{ scale: scaleAnim }],
                            },
                        ]}
                    >
                        <Text style={styles.logoIcon}>🎟️</Text>
                    </Animated.View>
                    <Text style={styles.appTitle}>TMS Mobile</Text>
                    <Text style={styles.subtitle}>Ticket & Complaint Management System</Text>
                </View>

                {/* Login Card */}
                <View style={styles.card}>
                    <Text style={styles.cardTitle}>Sign In to Account</Text>

                    {/* Quick Demo Fill Chips */}
                    <Text style={styles.demoTitle}>Quick Fill Demo Account:</Text>
                    <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.demoScroll}>
                        <TouchableOpacity
                            style={styles.demoChip}
                            onPress={() => fillDemoCredentials('admin@example.com', 'Passw0rd!')}
                        >
                            <Text style={styles.demoChipText}>👑 SuperAdmin</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            style={styles.demoChip}
                            onPress={() => fillDemoCredentials('john@example.com', 'Passw0rd!')}
                        >
                            <Text style={styles.demoChipText}>👤 User / Student</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            style={styles.demoChip}
                            onPress={() => fillDemoCredentials('jane@example.com', 'Passw0rd!')}
                        >
                            <Text style={styles.demoChipText}>🛠️ Tech Staff</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            style={styles.demoChip}
                            onPress={() => fillDemoCredentials('mike@example.com', 'Passw0rd!')}
                        >
                            <Text style={styles.demoChipText}>🔧 Plumber</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            style={styles.demoChip}
                            onPress={() => fillDemoCredentials('sarah@example.com', 'Passw0rd!')}
                        >
                            <Text style={styles.demoChipText}>⚡ Electrician</Text>
                        </TouchableOpacity>
                    </ScrollView>

                    <Text style={styles.label}>Email Address</Text>
                    <TextInput
                        style={styles.input}
                        placeholder="e.g. admin@example.com"
                        placeholderTextColor="#64748b"
                        keyboardType="email-address"
                        autoCapitalize="none"
                        value={email}
                        onChangeText={setEmail}
                    />

                    <Text style={styles.label}>Password</Text>
                    <View style={styles.passwordContainer}>
                        <TextInput
                            style={styles.passwordInput}
                            placeholder="••••••••"
                            placeholderTextColor="#64748b"
                            secureTextEntry={!showPassword}
                            value={password}
                            onChangeText={setPassword}
                        />
                        <TouchableOpacity
                            style={styles.eyeBtn}
                            onPress={() => setShowPassword(!showPassword)}
                        >
                            <Text style={styles.eyeText}>{showPassword ? '👁️' : '🙈'}</Text>
                        </TouchableOpacity>
                    </View>

                    <TouchableOpacity
                        style={[styles.button, isSubmitting && styles.buttonDisabled]}
                        onPress={handleLogin}
                        disabled={isSubmitting}
                        activeOpacity={0.8}
                    >
                        {isSubmitting ? (
                            <ActivityIndicator color="#fff" />
                        ) : (
                            <Text style={styles.buttonText}>Log In ➔</Text>
                        )}
                    </TouchableOpacity>
                </View>

                {/* Footer Info */}
                <View style={styles.footerNote}>
                    <Text style={styles.footerText}>⚡ TMS Portal v2.0 • Secure API Authentication</Text>
                </View>
            </ScrollView>
        </KeyboardAvoidingView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#090d16',
    },
    scrollContainer: {
        flexGrow: 1,
        justifyContent: 'center',
        padding: 24,
    },
    headerBox: {
        alignItems: 'center',
        marginBottom: 28,
        position: 'relative',
    },
    logoGlowAura: {
        position: 'absolute',
        top: -6,
        width: 84,
        height: 84,
        borderRadius: 30,
        backgroundColor: 'rgba(56, 189, 248, 0.25)',
        borderWidth: 1,
        borderColor: 'rgba(56, 189, 248, 0.4)',
    },
    logoBadge: {
        width: 72,
        height: 72,
        borderRadius: 24,
        backgroundColor: '#1e293b',
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 2,
        borderColor: '#0284c7',
        marginBottom: 14,
        shadowColor: '#38bdf8',
        shadowOffset: { width: 0, height: 6 },
        shadowOpacity: 0.4,
        shadowRadius: 10,
        elevation: 6,
    },
    logoIcon: {
        fontSize: 34,
    },
    appTitle: {
        fontSize: 30,
        fontWeight: '800',
        color: '#f8fafc',
        letterSpacing: 0.5,
    },
    subtitle: {
        fontSize: 14,
        color: '#94a3b8',
        marginTop: 6,
        textAlign: 'center',
    },
    card: {
        backgroundColor: '#141e33',
        borderRadius: 20,
        padding: 24,
        borderWidth: 1,
        borderColor: '#24344d',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.4,
        shadowRadius: 12,
        elevation: 8,
    },
    cardTitle: {
        fontSize: 20,
        fontWeight: '700',
        color: '#f8fafc',
        marginBottom: 16,
    },
    demoTitle: {
        fontSize: 12,
        fontWeight: '600',
        color: '#38bdf8',
        marginBottom: 8,
    },
    demoScroll: {
        flexDirection: 'row',
        marginBottom: 18,
    },
    demoChip: {
        backgroundColor: '#1e293b',
        paddingHorizontal: 12,
        paddingVertical: 7,
        borderRadius: 12,
        marginRight: 8,
        borderWidth: 1,
        borderColor: '#0284c7',
    },
    demoChipText: {
        color: '#cbd5e1',
        fontSize: 12,
        fontWeight: '600',
    },
    label: {
        fontSize: 13,
        fontWeight: '600',
        color: '#cbd5e1',
        marginBottom: 6,
        marginTop: 6,
    },
    input: {
        backgroundColor: '#090d16',
        borderRadius: 12,
        paddingHorizontal: 16,
        paddingVertical: 14,
        fontSize: 15,
        color: '#f8fafc',
        borderWidth: 1,
        borderColor: '#24344d',
        marginBottom: 14,
    },
    passwordContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#090d16',
        borderRadius: 12,
        borderWidth: 1,
        borderColor: '#24344d',
        marginBottom: 20,
    },
    passwordInput: {
        flex: 1,
        paddingHorizontal: 16,
        paddingVertical: 14,
        fontSize: 15,
        color: '#f8fafc',
    },
    eyeBtn: {
        paddingHorizontal: 14,
    },
    eyeText: {
        fontSize: 18,
    },
    button: {
        backgroundColor: '#0284c7',
        borderRadius: 12,
        paddingVertical: 16,
        alignItems: 'center',
        marginTop: 8,
        shadowColor: '#0284c7',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 4,
    },
    buttonDisabled: {
        backgroundColor: '#0369a1',
        opacity: 0.7,
    },
    buttonText: {
        color: '#ffffff',
        fontSize: 16,
        fontWeight: '700',
        letterSpacing: 0.5,
    },
    footerNote: {
        marginTop: 28,
        alignItems: 'center',
    },
    footerText: {
        color: '#475569',
        fontSize: 12,
        fontWeight: '500',
    },
});
