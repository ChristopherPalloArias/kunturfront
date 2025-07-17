// app/(tabs)/resumen.jsx
import React from 'react';
import { StyleSheet, View, Text, ScrollView, Alert } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Colors from '../../constant/Colors';
import Header from '../../components/Header';
import VideoStreamComponent from '../../components/VideoStreamComponent';
import { MapPinIcon } from 'react-native-heroicons/solid';
import { FontFamily, FontSize } from '../../constant/Typography';
import { useStreaming } from '../../hooks/useStreaming';
import { useCamera } from '../../hooks/useCamera';

export default function ResumenScreen() {
  const { cameraIp } = useCamera();
  if (!cameraIp) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>
          No se ha registrado ninguna IP de cámara. Registra tu local primero.
        </Text>
      </View>
    );
  }

  const cameraIpUrl = cameraIp;
  const {
    isVideoStreaming,
    videoLoading,
    videoError,
    videoQuality,
    streamUrl,
    connectionStatus,
    startVideoStream,
    stopVideoStream,
    changeVideoQuality,
    clearVideoError,
    reconnectStream,      // para el botón de reconexión
  } = useStreaming(cameraIpUrl);

  const handleVideoStart = () => {
    Alert.alert(
      'Iniciar Stream',
      `¿Deseas conectar con la cámara en ${cameraIpUrl}?`,
      [
        { text: 'Cancelar', style: 'cancel' },
        { text: 'Conectar', onPress: startVideoStream }
      ]
    );
  };

  const handleVideoStop = () => {
    Alert.alert(
      'Detener Stream',
      '¿Deseas desconectar la cámara IP?',
      [
        { text: 'Cancelar', style: 'cancel' },
        { text: 'Desconectar', onPress: stopVideoStream }
      ]
    );
  };

  const handleQualityChange = (quality) => {
    if (isVideoStreaming) {
      Alert.alert(
        'Cambiar Calidad',
        `¿Deseas cambiar la calidad a ${quality}?`,
        [
          { text: 'Cancelar', style: 'cancel' },
          { text: 'Cambiar', onPress: () => changeVideoQuality(quality) }
        ]
      );
    } else {
      changeVideoQuality(quality);
    }
  };

  return (
    <LinearGradient
      colors={[Colors.secondary[500], Colors.primary[500]]}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 0 }}
      style={styles.background}
    >
      <View style={styles.container}>
        <Header />
        <View style={styles.content}>
          <View style={styles.location}>
            <MapPinIcon color={Colors.neutro} />
            <Text style={styles.locationText}>
              Centro Comercial "El Tejar"
            </Text>
          </View>

          {/* VideoStreamComponent con todos los props necesarios */}
          <VideoStreamComponent
            isStreaming={isVideoStreaming}
            loading={videoLoading}
            error={videoError}
            quality={videoQuality}

            streamUrl={streamUrl}
            connectionStatus={connectionStatus}
            onReconnect={reconnectStream}

            onStart={handleVideoStart}
            onStop={handleVideoStop}
            onQualityChange={handleQualityChange}
            onClearError={clearVideoError}

            cameraIpUrl={cameraIpUrl}
          />

          <Text style={styles.text}>Transcripción</Text>
          <View style={styles.transcriptionContainer}>
            <ScrollView showsVerticalScrollIndicator={false}>
              <Text style={styles.textTranscription}>
                {/* Aquí tu transcripción real */}
                Lorem ipsum dolor sit amet, consectetur adipisicing elit...
              </Text>
            </ScrollView>
          </View>
        </View>
      </View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  background: { flex: 1 },
  container: { flex: 1, marginTop: 64, marginHorizontal: 16 },
  content: { marginTop: 40, flex: 1, paddingTop: 20, gap: 20, width: '100%' },
  location: { flexDirection: 'row', alignItems: 'center', gap: 8, justifyContent: 'center' },
  locationText: {
    color: Colors.neutro,
    fontFamily: FontFamily.regular,
    fontSize: FontSize.small,
  },
  text: {
    borderLeftColor: Colors.neutro,
    paddingLeft: 16,
    borderLeftWidth: 4,
    color: Colors.neutro,
    fontFamily: FontFamily.bold,
    fontSize: FontSize.body,
  },
  transcriptionContainer: {
    backgroundColor: 'rgba(0, 0, 0, 0.25)',
    maxHeight: '40%',
    padding: 16,
    borderRadius: 16,
  },
  textTranscription: {
    color: Colors.neutro,
    fontFamily: FontFamily.light,
    fontSize: FontSize.small,
    lineHeight: 20,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  errorText: {
    color: Colors.danger[500],
    fontFamily: FontFamily.medium,
    fontSize: FontSize.medium,
    textAlign: 'center',
  },
});
