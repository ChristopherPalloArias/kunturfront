import { useState, useEffect } from 'react';

export const useStreaming = (cameraIpUrl) => {
  if (!cameraIpUrl) {
    throw new Error('useStreaming: debes pasar cameraIpUrl al hook');
  }

  // Estados de video
  const [isVideoStreaming, setIsVideoStreaming] = useState(false);
  const [videoLoading, setVideoLoading] = useState(false);
  const [videoError, setVideoError] = useState(null);
  const [videoQuality, setVideoQuality] = useState('HD');
  const [streamUrl, setStreamUrl] = useState('');
  const [connectionStatus, setConnectionStatus] = useState('disconnected');

  // Estados de audio
  const [isAudioStreaming, setIsAudioStreaming] = useState(false);
  const [audioLoading, setAudioLoading] = useState(false);
  const [audioError, setAudioError] = useState(null);
  const [audioLevel, setAudioLevel] = useState(0);

  // Prueba de conexión a distintos endpoints
  const testIPWebcamConnection = async () => {
    setConnectionStatus('testing');
    const endpoints = ['/videofeed', '/video', '/shot.jpg', '/status.json'];
    for (const ep of endpoints) {
      try {
        const res = await fetch(`${cameraIpUrl}${ep}`, { method: 'HEAD' });
        if (res.ok) {
          setConnectionStatus('connected');
          return { success: true };
        }
      } catch {}
    }
    setConnectionStatus('failed');
    return { success: false };
  };

  // Construye la URL de stream según la calidad
  const getStreamUrl = () => {
    const t = Date.now();
    const map = {
      HD: `/videofeed?${t}`,
      SD: `/videofeed?${t}`,
      LOW: `/videofeed?${t}`,
      STREAM: `/video?${t}`,
      SNAPSHOT: `/shot.jpg?rnd=${t}`,
    };
    return `${cameraIpUrl}${map[videoQuality] || map.HD}`;
  };

  // Inicia el stream de video
  const startVideoStream = async () => {
    setVideoLoading(true);
    setVideoError(null);
    try {
      const { success } = await testIPWebcamConnection();
      if (!success) {
        throw new Error(`No se pudo conectar a ${cameraIpUrl}`);
      }
      const url = getStreamUrl();
      setStreamUrl(url);
      // Pequeña espera para simular conexión
      await new Promise(r => setTimeout(r, 500));
      setIsVideoStreaming(true);
      setConnectionStatus('streaming');
    } catch (err) {
      setVideoError(err.message);
      setConnectionStatus('failed');
    } finally {
      setVideoLoading(false);
    }
  };

  // Detiene el stream de video
  const stopVideoStream = () => {
    setIsVideoStreaming(false);
    setStreamUrl('');
    setConnectionStatus('disconnected');
  };

  // Cambia la calidad del stream
  const changeVideoQuality = (quality) => {
    setVideoQuality(quality);
    if (isVideoStreaming) {
      setStreamUrl(getStreamUrl());
    }
  };

  // Inicia el stream de audio
  const startAudioStream = async () => {
    setAudioLoading(true);
    setAudioError(null);
    try {
      // opcional: verificar status.json
      await new Promise(r => setTimeout(r, 500));
      setIsAudioStreaming(true);
      // simula nivel de audio
      const iv = setInterval(() => setAudioLevel(Math.random() * 100), 200);
      return () => clearInterval(iv);
    } catch (err) {
      setAudioError(err.message);
    } finally {
      setAudioLoading(false);
    }
  };

  // Detiene el stream de audio
  const stopAudioStream = () => {
    setIsAudioStreaming(false);
    setAudioLevel(0);
  };

  // Reconectar video tras un error
  const reconnectStream = () => {
    stopVideoStream();
    setTimeout(startVideoStream, 1000);
  };

  return {
    // Video
    isVideoStreaming,
    videoLoading,
    videoError,
    videoQuality,
    streamUrl,
    connectionStatus,
    startVideoStream,
    stopVideoStream,
    changeVideoQuality,
    clearVideoError: () => setVideoError(null),
    reconnectStream,

    // Audio
    isAudioStreaming,
    audioLoading,
    audioError,
    audioLevel,
    startAudioStream,
    stopAudioStream,
    clearAudioError: () => setAudioError(null),
  };
};
