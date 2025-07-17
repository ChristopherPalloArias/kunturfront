import { StyleSheet, View, Text, Alert } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Colors from '../../constant/Colors';
import Header from '../../components/Header';
import VideoStreamComponent from '../../components/VideoStreamComponent';
import AudioStreamComponent from '../../components/AudioStreamComponent';
import { MapPinIcon } from 'react-native-heroicons/solid';
import { FontFamily, FontSize } from '../../constant/Typography';
import { useStreaming } from '../../hooks/useSharedStreaming';

export default function StreamingScreen() {
    const primaryColor = Colors.primary[500];
    const secondaryColor = Colors.secondary[500];
    
    // URL de tu cámara IP (cambia esto por tu IP real)
    const cameraIpUrl = "http://192.168.1.51:8080";

    const {
        isVideoStreaming,
        videoLoading,
        videoError,
        videoQuality,

        isAudioStreaming,
        audioLoading,
        audioError,
        audioLevel,

        startVideoStream,
        stopVideoStream,
        changeVideoQuality,

        clearVideoError,
        clearAudioError,
    } = useStreaming(cameraIpUrl);

    const handleVideoStart = () => {
        Alert.alert(
            "Iniciar Stream",
            "¿Deseas conectar con la cámara IP?",
            [
                { text: "Cancelar", style: "cancel" },
                { text: "Conectar", onPress: startVideoStream }
            ]
        );
    };

    const handleVideoStop = () => {
        Alert.alert(
            "Detener Stream",
            "¿Deseas desconectar la cámara IP?",
            [
                { text: "Cancelar", style: "cancel" },
                { text: "Desconectar", onPress: stopVideoStream }
            ]
        );
    };

    const handleQualityChange = (quality) => {
        if (isVideoStreaming) {
            Alert.alert(
                "Cambiar Calidad",
                `¿Deseas cambiar la calidad a ${quality}?`,
                [
                    { text: "Cancelar", style: "cancel" },
                    { text: "Cambiar", onPress: () => changeVideoQuality(quality) }
                ]
            );
        } else {
            changeVideoQuality(quality);
        }
    };

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
                        <MapPinIcon color={Colors.neutro} />
                        <Text style={styles.locationText}>Centro Comercial "El Tejar"</Text>
                    </View>

                    <VideoStreamComponent
                        isStreaming={isVideoStreaming}
                        loading={videoLoading}
                        error={videoError}
                        quality={videoQuality}
                        onStart={handleVideoStart}
                        onStop={handleVideoStop}
                        onQualityChange={handleQualityChange}
                        onClearError={clearVideoError}
                        cameraIpUrl={cameraIpUrl}
                    />

                    <AudioStreamComponent
                        isStreaming={isAudioStreaming}
                        loading={audioLoading}
                        error={audioError}
                        audioLevel={audioLevel}
                        onClearError={clearAudioError}
                    />

                    {/* Información adicional */}
                    <View style={styles.infoContainer}>
                        <Text style={styles.infoTitle}>Información de Conexión</Text>
                        <Text style={styles.infoText}>
                            📡 Cámara IP: {cameraIpUrl}
                        </Text>
                        <Text style={styles.infoText}>
                            🎥 Calidad: {videoQuality}
                        </Text>
                        <Text style={styles.infoText}>
                            🔗 Estado: {isVideoStreaming ? 'Conectado' : 'Desconectado'}
                        </Text>
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
    content: {
        marginTop: 40,
        flex: 1,
        paddingTop: 20,
        gap: 20,
        width: '100%',
    },
    location: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        justifyContent: 'center',
    },
    locationText: {
        color: Colors.neutro,
        fontFamily: FontFamily.regular,
        fontSize: FontSize.small,
    },
    infoContainer: {
        backgroundColor: 'rgba(255, 255, 255, 0.1)',
        padding: 16,
        borderRadius: 12,
        marginTop: 10,
    },
    infoTitle: {
        color: Colors.neutro,
        fontFamily: FontFamily.regular,
        fontSize: FontSize.medium,
        fontWeight: 'bold',
        marginBottom: 8,
    },
    infoText: {
        color: Colors.neutro,
        fontFamily: FontFamily.regular,
        fontSize: FontSize.small,
        marginBottom: 4,
        opacity: 0.8,
    },
});