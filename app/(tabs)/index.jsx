import React, { useEffect } from 'react';
import { StyleSheet, View, Text, TouchableOpacity, ActivityIndicator } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import Colors from '../../constant/Colors';
import { FontFamily, FontSize } from '../../constant/Typography';
import Header from '../../components/Header';
import { MapPinIcon, ShieldExclamationIcon, ShieldCheckIcon, PowerIcon } from "react-native-heroicons/solid";
import { useKunturStatus } from '../../hooks/useKunturStatus';
import { useUserRegistration } from '../../hooks/useUserRegistration';

export default function ControlScreen() {
    const router = useRouter();
    const primaryColor = Colors.primary[500];
    const secondaryColor = Colors.secondary[500];
    const { status, loading, error, activateKuntur, deactivateKuntur } = useKunturStatus();
    const { user, loading: userLoading, isUserRegistered } = useUserRegistration();

    useEffect(() => {
        if (!userLoading && !isUserRegistered()) {
            router.push('/register');
        }
    }, [userLoading, isUserRegistered, router]);

    const getStatusColors = () => {
        if (status === 'on') {
            return {
                icon: Colors.success[900],
                background: Colors.success[200],
                border: Colors.success[900]
            };
        }
        return {
            icon: Colors.danger[900],
            background: Colors.danger[200],
            border: Colors.danger[900]
        };
    };

    const statusColors = getStatusColors();

    const getStatusInfo = () => {
        if (loading) {
            return {
                text: 'Conectando...',
                icon: null,
                buttonText: 'Cargando...'
            };
        }
        if (status === 'on') {
            return {
                text: 'Kuntur Activado',
                icon: <ShieldCheckIcon size={120} color={statusColors.icon} />,
                buttonText: 'Desactivar Kuntur'
            };
        }
        return {
            text: 'Kuntur Apagado',
            icon: <ShieldExclamationIcon size={120} color={statusColors.icon} />,
            buttonText: 'Activar Kuntur'
        };
    };

    const statusInfo = getStatusInfo();

    const handleButtonPress = async () => {
        if (loading) {
            return;
        }
        
        if (!isUserRegistered()) {
            router.push('/register');
            return;
        }
        
        try {
            if (status === 'on') {
                await deactivateKuntur();
            } else {
                await activateKuntur();
            }
        } catch (error) {
            console.error('Error in handleButtonPress:', error);
        }
    };

    // Mostrar loading mientras se verifica el usuario
    if (userLoading) {
        return (
            <LinearGradient
                colors={[secondaryColor, primaryColor]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.background}
            >
                <View style={styles.loadingContainer}>
                    <ActivityIndicator size="large" color={Colors.neutro} />
                    <Text style={styles.loadingText}>Cargando...</Text>
                </View>
            </LinearGradient>
        );
    }

    if (!isUserRegistered()) {
        return null;
    }

    return (
        <LinearGradient
            colors={[secondaryColor, primaryColor]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.background}
        >
            <View style={styles.container}>
                <Header />

                <View style={styles.content}>
                    <View style={styles.location}>
                        <MapPinIcon size={16} color={Colors.neutro} />
                        <Text style={styles.locationText}>
                            {user?.ubicacion || 'Ubicación no disponible'}
                        </Text>
                    </View>

                    {/* Contenedor de notificaciones - posicionado fuera del control */}
                    <View style={styles.notificationsContainer}>
                        {error && (
                            <View style={styles.errorContainer}>
                                <Text style={styles.errorText}>{error}</Text>
                            </View>
                        )}
                    </View>

                    <View style={styles.control}>
                        <View style={styles.controlContent}>
                            <View style={[styles.iconContainer, {
                                backgroundColor: statusColors.background,
                                borderColor: statusColors.border
                            }]}>
                                {loading ? (
                                    <ActivityIndicator size="large" color={statusColors.icon} />
                                ) : (
                                    statusInfo.icon
                                )}
                            </View>
                            
                            <Text style={[styles.statusText, { color: statusColors.icon }]}>
                                {statusInfo.text}
                            </Text>
                        </View>

                        <TouchableOpacity
                            style={[styles.button, {
                                backgroundColor: statusColors.background,
                                borderColor: statusColors.border
                            }]}
                            onPress={handleButtonPress}
                            disabled={loading}
                        >
                            <PowerIcon size={16} color={statusColors.icon} />
                            <Text style={[styles.buttonText, { color: statusColors.icon }]}>
                                {statusInfo.buttonText}
                            </Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </View>
        </LinearGradient>
    );
}

const styles = StyleSheet.create({
    background: {
        flex: 1,
    },
    container: {
        flex: 1,
        marginTop: 64,
        marginHorizontal: 16,
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        gap: 16,
    },
    loadingText: {
        color: Colors.neutro,
        fontFamily: FontFamily.regular,
        fontSize: FontSize.body,
    },
    content: {
        marginTop: 52,
        justifyContent: 'center',
        alignItems: 'center',
        width: '100%',
        flex: 1,
    },
    location: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 6,
        marginBottom: 10,
        width: '100%',
        paddingHorizontal: 20,
    },
    locationText: {
        color: Colors.neutro,
        fontFamily: FontFamily.regular,
        fontSize: FontSize.small,
        textAlign: 'center',
        flex: 1,
    },
    notificationsContainer: {
        width: '100%',
        gap: 8,
        marginBottom: 10,
    },
    control: {
        alignItems: 'center',
        justifyContent: 'space-between',
        backgroundColor: 'rgba(0, 0, 0, 0.25)',
        width: '100%',
        flex: 1,
        maxHeight: '75%',
        borderRadius: 16,
        paddingTop: 40,
        paddingBottom: 30,
    },
    controlContent: {
        alignItems: 'center',
        gap: 20,
        flex: 1,
        justifyContent: 'center',
    },
    iconContainer: {
        justifyContent: 'center',
        alignItems: 'center',
        width: 175,
        height: 175,
        borderRadius: 1000,
        borderWidth: 2,
    },
    statusText: {
        textAlign: 'center',
        width: '80%',
        fontFamily: FontFamily.regular,
        fontSize: FontSize.body,
    },
    buttonText: {
        fontFamily: FontFamily.regular,
        fontSize: FontSize.body,
    },
    button: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        paddingHorizontal: 24,
        paddingVertical: 12,
        borderRadius: 32,
        borderWidth: 2,
    },
    errorContainer: {
        backgroundColor: Colors.danger[200],
        padding: 12,
        borderRadius: 8,
        borderWidth: 1,
        borderColor: Colors.danger[900],
        marginHorizontal: 20,
        width: '90%',
        alignSelf: 'center',
    },
    errorText: {
        color: Colors.danger[900],
        fontFamily: FontFamily.regular,
        fontSize: FontSize.small,
        textAlign: 'center',
    },
});