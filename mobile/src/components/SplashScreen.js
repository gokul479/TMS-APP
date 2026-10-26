import React, { useEffect, useRef } from 'react';
import { StyleSheet, View, Text, Animated, Easing, ActivityIndicator } from 'react-native';

export default function SplashScreen() {
    // Animation references
    const scaleAnim = useRef(new Animated.Value(0.92)).current;
    const opacityAnim = useRef(new Animated.Value(0.5)).current;
    const rotateAnim = useRef(new Animated.Value(0)).current;

    useEffect(() => {
        // Continuous pulsing scale and opacity animation loop
        Animated.loop(
            Animated.sequence([
                Animated.parallel([
                    Animated.timing(scaleAnim, {
                        toValue: 1.08,
                        duration: 1200,
                        easing: Easing.out(Easing.ease),
                        useNativeDriver: true,
                    }),
                    Animated.timing(opacityAnim, {
                        toValue: 1,
                        duration: 1200,
                        easing: Easing.out(Easing.ease),
                        useNativeDriver: true,
                    }),
                ]),
                Animated.parallel([
                    Animated.timing(scaleAnim, {
                        toValue: 0.92,
                        duration: 1200,
                        easing: Easing.in(Easing.ease),
                        useNativeDriver: true,
                    }),
                    Animated.timing(opacityAnim, {
                        toValue: 0.5,
                        duration: 1200,
                        easing: Easing.in(Easing.ease),
                        useNativeDriver: true,
                    }),
                ]),
            ])
        ).start();

        // Subtle rotation pulse for logo icon
        Animated.loop(
            Animated.sequence([
                Animated.timing(rotateAnim, {
                    toValue: 1,
                    duration: 1500,
                    easing: Easing.inOut(Easing.ease),
                    useNativeDriver: true,
                }),
                Animated.timing(rotateAnim, {
                    toValue: 0,
                    duration: 1500,
                    easing: Easing.inOut(Easing.ease),
                    useNativeDriver: true,
                }),
            ])
        ).start();
    }, [scaleAnim, opacityAnim, rotateAnim]);

    const spin = rotateAnim.interpolate({
        inputRange: [0, 1],
        outputRange: ['-5deg', '5deg'],
    });

    return (
        <View style={styles.container}>
            {/* Background Glow Circle */}
            <Animated.View
                style={[
                    styles.glowCircle,
                    {
                        transform: [{ scale: scaleAnim }],
                        opacity: opacityAnim,
                    },
                ]}
            />

            {/* Logo Badge Container */}
            <Animated.View
                style={[
                    styles.logoBadge,
                    {
                        transform: [{ scale: scaleAnim }, { rotate: spin }],
                    },
                ]}
            >
                <Text style={styles.logoIcon}>🎟️</Text>
            </Animated.View>

            {/* App Titles */}
            <View style={styles.textContainer}>
                <Text style={styles.appTitle}>TMS Mobile</Text>
                <Text style={styles.subtitle}>Ticket & Complaint Management System</Text>
            </View>

            {/* Loading Indicator */}
            <View style={styles.loadingBox}>
                <ActivityIndicator size="large" color="#38bdf8" style={styles.spinner} />
                <Text style={styles.loadingText}>Initializing Secure Portal...</Text>
            </View>

            {/* Footer Brand */}
            <View style={styles.footer}>
                <Text style={styles.footerText}>⚡ Powered by TMS Cloud v2.0</Text>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#090d16',
        justifyContent: 'center',
        alignItems: 'center',
        padding: 24,
    },
    glowCircle: {
        position: 'absolute',
        width: 180,
        height: 180,
        borderRadius: 90,
        backgroundColor: 'rgba(56, 189, 248, 0.15)',
        borderWidth: 1,
        borderColor: 'rgba(56, 189, 248, 0.3)',
    },
    logoBadge: {
        width: 90,
        height: 90,
        borderRadius: 28,
        backgroundColor: '#141e33',
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 2,
        borderColor: '#0284c7',
        marginBottom: 24,
        shadowColor: '#38bdf8',
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.6,
        shadowRadius: 16,
        elevation: 10,
    },
    logoIcon: {
        fontSize: 44,
    },
    textContainer: {
        alignItems: 'center',
        marginBottom: 40,
    },
    appTitle: {
        fontSize: 32,
        fontWeight: '900',
        color: '#f8fafc',
        letterSpacing: 1,
        textShadowColor: 'rgba(56, 189, 248, 0.5)',
        textShadowOffset: { width: 0, height: 2 },
        textShadowRadius: 8,
    },
    subtitle: {
        fontSize: 13,
        fontWeight: '600',
        color: '#94a3b8',
        marginTop: 6,
        letterSpacing: 0.5,
    },
    loadingBox: {
        alignItems: 'center',
        marginTop: 10,
    },
    spinner: {
        marginBottom: 12,
    },
    loadingText: {
        fontSize: 13,
        color: '#38bdf8',
        fontWeight: '600',
        letterSpacing: 0.3,
    },
    footer: {
        position: 'absolute',
        bottom: 30,
    },
    footerText: {
        color: '#475569',
        fontSize: 12,
        fontWeight: '500',
    },
});
