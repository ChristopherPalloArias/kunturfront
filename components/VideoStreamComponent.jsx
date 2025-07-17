import React, { useState, useEffect, useRef } from 'react';
import { View, Text, TouchableOpacity, ActivityIndicator, StyleSheet, Image } from 'react-native';
import { VideoCameraIcon, PlayIcon, StopIcon } from 'react-native-heroicons/solid';
import Colors from '../constant/Colors';
import { FontFamily, FontSize } from '../constant/Typography';

export default function VideoStreamComponent({
    isStreaming,
    loading,
    error,
    quality,
    onStart,
    onStop,
    onQualityChange,
    onClearError,
    cameraIpUrl = "http://192.168.1.51:8080"
}) {
    const [imageError, setImageError] = useState(false);
    const [imageUrl, setImageUrl] = useState('');
    const [isImageLoading, setIsImageLoading] = useState(false);
    const [lastUpdate, setLastUpdate] = useState(Date.now());
    
    const refreshInterval = useRef(null);

    // Función para obtener la URL del stream
    const getStreamUrl = () => {
        const timestamp = Date.now();
        return `${cameraIpUrl}/shot.jpg?random=${timestamp}`;
    };

    // Función para actualizar la URL de la imagen
    const updateImageUrl = () => {
        if (isStreaming && !loading && !error) {
            const newUrl = getStreamUrl();
            console.log('Updating image URL:', newUrl);
            setImageUrl(newUrl);
            setLastUpdate(Date.now());
        }
    };

    // Effect para manejar el streaming
    useEffect(() => {
        if (isStreaming && !loading && !error) {
            console.log('Starting stream updates');
            
            // Actualizar inmediatamente
            updateImageUrl();
            
            // Configurar intervalo
            refreshInterval.current = setInterval(() => {
                updateImageUrl();
            }, 4000); // 4 segundos
        } else {
            console.log('Stopping stream updates');
            if (refreshInterval.current) {
                clearInterval(refreshInterval.current);
                refreshInterval.current = null;
            }
        }

        return () => {
            if (refreshInterval.current) {
                clearInterval(refreshInterval.current);
                refreshInterval.current = null;
            }
        };
    }, [isStreaming, loading, error]);

    // Effect para limpiar cuando cambia la calidad
    useEffect(() => {
        if (isStreaming) {
            updateImageUrl();
        }
    }, [quality]);

    // Limpiar al desmontar
    useEffect(() => {
        return () => {
            if (refreshInterval.current) {
                clearInterval(refreshInterval.current);
            }
        };
    }, []);

    const handleImageError = (errorEvent) => {
        console.error('Image error:', errorEvent.nativeEvent?.error);
        setImageError(true);
        setIsImageLoading(false);
    };

    const handleImageLoad = () => {
        console.log('Image loaded successfully');
        setImageError(false);
        setIsImageLoading(false);
    };

    const handleImageLoadStart = () => {
        console.log('Image load started');
        setIsImageLoading(true);
        setImageError(false);
    };

    const handleManualRefresh = () => {
        console.log('Manual refresh');
        updateImageUrl();
    };

    const renderVideoContent = () => {
        if (loading) {
            return (
                <View style={styles.loadingContainer}>
                    <ActivityIndicator size="large" color={Colors.primary[500]} />
                    <Text style={styles.loadingText}>Conectando a la cámara...</Text>
                </View>
            );
        }

        if (error) {
            return (
                <View style={styles.errorContainer}>
                    <Text style={styles.errorText}>{error}</Text>
                    <TouchableOpacity onPress={onClearError} style={styles.retryButton}>
                        <Text style={styles.retryButtonText}>Reintentar</Text>
                    </TouchableOpacity>
                </View>
            );
        }

        if (isStreaming) {
            if (imageError) {
                return (
                    <View style={styles.errorContainer}>
                        <VideoCameraIcon size={40} color={Colors.danger[500]} />
                        <Text style={styles.errorText}>Error al cargar el stream</Text>
                        <Text style={styles.errorSubtext}>
                            Verificando conexión...
                        </Text>
                        <TouchableOpacity onPress={handleManualRefresh} style={styles.retryButton}>
                            <Text style={styles.retryButtonText}>Reconectar</Text>
                        </TouchableOpacity>
                    </View>
                );
            }

            return (
                <View style={styles.streamingContainer}>
                    {/* Indicador de carga */}
                    {isImageLoading && (
                        <View style={styles.loadingOverlay}>
                            <ActivityIndicator size="small" color={Colors.primary[500]} />
                        </View>
                    )}
                    
                    {imageUrl && (
                        <Image
                            source={{ 
                                uri: imageUrl,
                                headers: {
                                    'Cache-Control': 'no-cache',
                                    'Pragma': 'no-cache'
                                }
                            }}
                            style={styles.videoStream}
                            onError={handleImageError}
                            onLoad={handleImageLoad}
                            onLoadStart={handleImageLoadStart}
                            resizeMode="cover"
                        />
                    )}
                    
                    <View style={styles.liveIndicator}>
                        <View style={[styles.liveDot, { 
                            backgroundColor: imageError ? Colors.danger[500] : Colors.success[500] 
                        }]} />
                        <Text style={styles.liveText}>
                            {imageError ? 'ERROR' : 'EN VIVO'}
                        </Text>
                    </View>
                    
                    <View style={styles.qualityBadge}>
                        <Text style={styles.qualityText}>{quality || 'HD'}</Text>
                    </View>
                    
                    <View style={styles.debugInfo}>
                        <Text style={styles.debugText}>
                            {new Date(lastUpdate).toLocaleTimeString()}
                        </Text>
                    </View>
                </View>
            );
        }

        return (
            <View style={styles.offlineContainer}>
                <VideoCameraIcon size={40} color={Colors.dark[400]} />
                <Text style={styles.offlineText}>Cámara desconectada</Text>
            </View>
        );
    };

    const renderControls = () => {
        if (loading) return null;

        return (
            <View style={styles.controlsContainer}>
                <View style={styles.controlsRow}>
                    <TouchableOpacity
                        style={[
                            styles.controlButton,
                            isStreaming ? styles.stopButton : styles.startButton
                        ]}
                        onPress={isStreaming ? onStop : onStart}
                    >
                        {isStreaming ? (
                            <StopIcon size={16} color={Colors.neutro} />
                        ) : (
                            <PlayIcon size={16} color={Colors.neutro} />
                        )}
                        <Text style={styles.controlButtonText}>
                            {isStreaming ? 'Detener' : 'Iniciar'}
                        </Text>
                    </TouchableOpacity>

                    {isStreaming && (
                        <TouchableOpacity
                            style={styles.refreshButton}
                            onPress={handleManualRefresh}
                        >
                            <Text style={styles.refreshButtonText}>⟳</Text>
                        </TouchableOpacity>
                    )}
                </View>

                <View style={styles.qualityControls}>
                    <Text style={styles.qualityLabel}>Modo:</Text>
                    {['HD', 'SD', 'LOW'].map((q) => (
                        <TouchableOpacity
                            key={q}
                            style={[
                                styles.qualityButton,
                                quality === q && styles.qualityButtonActive
                            ]}
                            onPress={() => onQualityChange(q)}
                        >
                            <Text style={[
                                styles.qualityButtonText,
                                quality === q && styles.qualityButtonTextActive
                            ]}>
                                {q}
                            </Text>
                        </TouchableOpacity>
                    ))}
                </View>

                <View style={styles.debugControls}>
                    <Text style={styles.debugLabel}>
                        IP Webcam: {cameraIpUrl}/shot.jpg
                    </Text>
                    <Text style={styles.debugLabel}>
                        Estado: {imageError ? 'Error' : 'OK'} | Carga: {isImageLoading ? 'Sí' : 'No'}
                    </Text>
                </View>
            </View>
        );
    };

    return (
        <View style={styles.container}>
            <View style={styles.videoArea}>
                {renderVideoContent()}
            </View>
            {renderControls()}
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        width: '100%',
        backgroundColor: Colors.neutro,
        borderRadius: 16,
        overflow: 'hidden',
    },
    videoArea: {
        height: 200,
        backgroundColor: Colors.dark[800],
        justifyContent: 'center',
        alignItems: 'center',
        position: 'relative',
    },
    loadingContainer: {
        justifyContent: 'center',
        alignItems: 'center',
        gap: 10,
    },
    loadingText: {
        color: Colors.neutro,
        fontFamily: FontFamily.regular,
        fontSize: FontSize.small,
    },
    loadingOverlay: {
        position: 'absolute',
        top: 10,
        right: 10,
        zIndex: 10,
        backgroundColor: 'rgba(0, 0, 0, 0.7)',
        padding: 6,
        borderRadius: 6,
    },
    errorContainer: {
        justifyContent: 'center',
        alignItems: 'center',
        gap: 10,
        paddingHorizontal: 20,
    },
    errorText: {
        color: Colors.danger[500],
        fontFamily: FontFamily.regular,
        fontSize: FontSize.small,
        textAlign: 'center',
    },
    errorSubtext: {
        color: Colors.dark[400],
        fontFamily: FontFamily.regular,
        fontSize: 10,
        textAlign: 'center',
    },
    retryButton: {
        backgroundColor: Colors.danger[500],
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 8,
    },
    retryButtonText: {
        color: Colors.neutro,
        fontFamily: FontFamily.regular,
        fontSize: FontSize.small,
    },
    streamingContainer: {
        width: '100%',
        height: '100%',
        position: 'relative',
    },
    videoStream: {
        width: '100%',
        height: '100%',
        backgroundColor: Colors.dark[800],
    },
    liveIndicator: {
        position: 'absolute',
        top: 10,
        left: 10,
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
        backgroundColor: 'rgba(0, 0, 0, 0.7)',
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 12,
    },
    liveDot: {
        width: 8,
        height: 8,
        borderRadius: 4,
    },
    liveText: {
        color: Colors.neutro,
        fontFamily: FontFamily.regular,
        fontSize: 10,
        fontWeight: 'bold',
    },
    qualityBadge: {
        position: 'absolute',
        top: 10,
        right: 10,
        backgroundColor: 'rgba(0, 0, 0, 0.7)',
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 8,
    },
    qualityText: {
        color: Colors.neutro,
        fontFamily: FontFamily.regular,
        fontSize: 10,
        fontWeight: 'bold',
    },
    debugInfo: {
        position: 'absolute',
        bottom: 10,
        left: 10,
        backgroundColor: 'rgba(0, 0, 0, 0.7)',
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 8,
    },
    debugText: {
        color: Colors.neutro,
        fontFamily: FontFamily.regular,
        fontSize: 8,
    },
    offlineContainer: {
        justifyContent: 'center',
        alignItems: 'center',
        gap: 10,
    },
    offlineText: {
        color: Colors.dark[400],
        fontFamily: FontFamily.regular,
        fontSize: FontSize.small,
    },
    controlsContainer: {
        padding: 16,
        backgroundColor: Colors.neutro,
        gap: 12,
    },
    controlsRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 10,
    },
    controlButton: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        paddingHorizontal: 16,
        paddingVertical: 10,
        borderRadius: 8,
        flex: 1,
        justifyContent: 'center',
    },
    startButton: {
        backgroundColor: Colors.primary[500],
    },
    stopButton: {
        backgroundColor: Colors.danger[500],
    },
    controlButtonText: {
        color: Colors.neutro,
        fontFamily: FontFamily.regular,
        fontSize: FontSize.small,
        fontWeight: 'bold',
    },
    refreshButton: {
        backgroundColor: Colors.dark[600],
        paddingHorizontal: 12,
        paddingVertical: 10,
        borderRadius: 8,
    },
    refreshButtonText: {
        color: Colors.neutro,
        fontSize: 18,
        fontWeight: 'bold',
    },
    qualityControls: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    qualityLabel: {
        color: Colors.dark[600],
        fontFamily: FontFamily.regular,
        fontSize: FontSize.small,
    },
    qualityButton: {
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 6,
        backgroundColor: Colors.dark[200],
    },
    qualityButtonActive: {
        backgroundColor: Colors.primary[500],
    },
    qualityButtonText: {
        color: Colors.dark[600],
        fontFamily: FontFamily.regular,
        fontSize: FontSize.small,
        fontWeight: 'bold',
    },
    qualityButtonTextActive: {
        color: Colors.neutro,
    },
    debugControls: {
        marginTop: 8,
        paddingTop: 8,
        borderTopWidth: 1,
        borderTopColor: Colors.dark[200],
    },
    debugLabel: {
        color: Colors.dark[500],
        fontFamily: FontFamily.regular,
        fontSize: 10,
        marginBottom: 2,
    },
});