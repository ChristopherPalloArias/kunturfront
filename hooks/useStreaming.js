import { useState, useEffect } from 'react';

export const useStreaming = (cameraIpUrl = "http://192.168.1.51:8080") => {
    // Estados para video
    const [isVideoStreaming, setIsVideoStreaming] = useState(false);
    const [videoLoading, setVideoLoading] = useState(false);
    const [videoError, setVideoError] = useState(null);
    const [videoQuality, setVideoQuality] = useState('HD');

    // Estados para audio
    const [isAudioStreaming, setIsAudioStreaming] = useState(false);
    const [audioLoading, setAudioLoading] = useState(false);
    const [audioError, setAudioError] = useState(null);
    const [audioLevel, setAudioLevel] = useState(0);

    // Función para probar la conexión con IP Webcam
    const testIPWebcamConnection = async () => {
        try {
            // Endpoints específicos de IP Webcam para probar
            const endpoints = [
                '/shot.jpg',
                '/status.json',
                '/video',
                '/videofeed'
            ];
            
            for (const endpoint of endpoints) {
                try {
                    console.log(`Testing IP Webcam endpoint: ${cameraIpUrl}${endpoint}`);
                    const response = await fetch(`${cameraIpUrl}${endpoint}`, {
                        method: 'HEAD',
                        timeout: 8000,
                        headers: {
                            'Cache-Control': 'no-cache',
                            'Pragma': 'no-cache'
                        }
                    });
                    
                    if (response.ok) {
                        console.log(`IP Webcam endpoint ${endpoint} is working`);
                        return true;
                    }
                } catch (endpointError) {
                    console.log(`Endpoint ${endpoint} failed:`, endpointError.message);
                    continue;
                }
            }
            
            return false;
        } catch (error) {
            console.error('Error testing IP Webcam connection:', error);
            return false;
        }
    };

    // Función para obtener información de IP Webcam
    const getIPWebcamStatus = async () => {
        try {
            const response = await fetch(`${cameraIpUrl}/status.json`, {
                timeout: 5000,
                headers: {
                    'Cache-Control': 'no-cache'
                }
            });
            
            if (response.ok) {
                const status = await response.json();
                console.log('IP Webcam status:', status);
                return status;
            }
        } catch (error) {
            console.log('Could not get IP Webcam status:', error);
        }
        return null;
    };

    // Función para iniciar el stream de video
    const startVideoStream = async () => {
        setVideoLoading(true);
        setVideoError(null);
        
        try {
            // Probar conexión con IP Webcam
            const isConnected = await testIPWebcamConnection();
            
            if (!isConnected) {
                throw new Error('No se pudo conectar con IP Webcam.\n\nVerifica:\n• La aplicación IP Webcam está ejecutándose\n• La URL es correcta: ' + cameraIpUrl + '\n• El dispositivo está en la misma red');
            }

            // Obtener información de la cámara
            const status = await getIPWebcamStatus();
            if (status) {
                console.log('IP Webcam info:', {
                    video_chunk_len: status.video_chunk_len,
                    audio_enabled: status.audio_enabled,
                    curvals: status.curvals
                });
            }

            // Simular tiempo de conexión
            await new Promise(resolve => setTimeout(resolve, 1500));
            
            setIsVideoStreaming(true);
            setVideoLoading(false);
            
            console.log('IP Webcam stream started successfully');
        } catch (error) {
            console.error('Error starting IP Webcam stream:', error);
            setVideoError(error.message);
            setVideoLoading(false);
            setIsVideoStreaming(false);
        }
    };

    // Función para detener el stream de video
    const stopVideoStream = () => {
        setIsVideoStreaming(false);
        setVideoError(null);
        console.log('IP Webcam stream stopped');
    };

    // Función para cambiar la calidad del video
    const changeVideoQuality = (quality) => {
        setVideoQuality(quality);
        
        // Si está streaming, reiniciar para aplicar nueva calidad
        if (isVideoStreaming) {
            setVideoLoading(true);
            console.log(`Changing IP Webcam quality to: ${quality}`);
            setTimeout(() => {
                setVideoLoading(false);
            }, 800);
        }
    };

    // Función para limpiar errores de video
    const clearVideoError = () => {
        setVideoError(null);
    };

    // Función para limpiar errores de audio
    const clearAudioError = () => {
        setAudioError(null);
    };

    // Función para iniciar el stream de audio
    const startAudioStream = async () => {
        setAudioLoading(true);
        setAudioError(null);
        
        try {
            // Probar si IP Webcam tiene audio habilitado
            const status = await getIPWebcamStatus();
            if (status && !status.audio_enabled) {
                throw new Error('El audio no está habilitado en IP Webcam');
            }

            // Simular conexión de audio
            await new Promise(resolve => setTimeout(resolve, 1000));
            
            setIsAudioStreaming(true);
            setAudioLoading(false);
            
            // Simular niveles de audio
            const audioInterval = setInterval(() => {
                setAudioLevel(Math.random() * 100);
            }, 100);
            
            console.log('IP Webcam audio stream started');
            
            // Guardar el interval para limpiarlo después
            return () => clearInterval(audioInterval);
        } catch (error) {
            console.error('Error starting IP Webcam audio:', error);
            setAudioError(error.message);
            setAudioLoading(false);
            setIsAudioStreaming(false);
        }
    };

    // Función para detener el stream de audio
    const stopAudioStream = () => {
        setIsAudioStreaming(false);
        setAudioError(null);
        setAudioLevel(0);
        console.log('IP Webcam audio stream stopped');
    };

    // Efecto para auto-reconectar en caso de error
    useEffect(() => {
        let reconnectTimeout;
        
        if (videoError && isVideoStreaming) {
            // Intentar reconectar después de 10 segundos
            console.log('Attempting to reconnect IP Webcam in 10 seconds...');
            reconnectTimeout = setTimeout(() => {
                console.log('Reconnecting IP Webcam...');
                startVideoStream();
            }, 10000);
        }
        
        return () => {
            if (reconnectTimeout) {
                clearTimeout(reconnectTimeout);
            }
        };
    }, [videoError, isVideoStreaming]);

    // Función para obtener la URL del stream según la calidad
    const getStreamUrl = () => {
        const timestamp = Date.now();
        
        // Endpoints específicos de IP Webcam
        const endpoints = {
            'HD': `/shot.jpg?random=${timestamp}`,
            'SD': `/shot.jpg?random=${timestamp}`,
            'LOW': `/shot.jpg?random=${timestamp}`,
            'STREAM': `/video?${timestamp}`,
            'VIDEOFEED': `/videofeed?${timestamp}`
        };
        
        return `${cameraIpUrl}${endpoints[videoQuality] || endpoints['HD']}`;
    };

    // Función para obtener URLs adicionales de IP Webcam
    const getIPWebcamUrls = () => {
        return {
            snapshot: `${cameraIpUrl}/shot.jpg`,
            video: `${cameraIpUrl}/video`,
            videofeed: `${cameraIpUrl}/videofeed`,
            audio: `${cameraIpUrl}/audio.wav`,
            status: `${cameraIpUrl}/status.json`,
            settings: `${cameraIpUrl}/settings.json`
        };
    };

    return {
        // Estados de video
        isVideoStreaming,
        videoLoading,
        videoError,
        videoQuality,

        // Estados de audio  
        isAudioStreaming,
        audioLoading,
        audioError,
        audioLevel,

        // Funciones de video
        startVideoStream,
        stopVideoStream,
        changeVideoQuality,
        clearVideoError,

        // Funciones de audio
        startAudioStream,
        stopAudioStream,
        clearAudioError,

        // Utilidades específicas de IP Webcam
        cameraIpUrl,
        getStreamUrl,
        getIPWebcamUrls,
        testIPWebcamConnection,
        getIPWebcamStatus,
    };
};