// hooks/useKunturStatus.js
import { useState, useEffect } from 'react';
import { useStreaming } from './useStreaming';
import { useUserRegistration } from './useUserRegistration';
import { useCamera } from './useCamera';

export const useKunturStatus = (initialStatus = 'off') => {
  const [status, setStatus] = useState(initialStatus);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Obtener la IP desde el contexto de cámara
  const { cameraIp } = useCamera();
  if (!cameraIp) {
    throw new Error('useKunturStatus: no hay cameraIp en el contexto');
  }

  // Pasar siempre cameraIp al hook de streaming
  const {
    startAllStreams,
    stopAllStreams,
    // otros métodos si los necesitas...
  } = useStreaming(cameraIp);

  const { user, loading: userLoading } = useUserRegistration();

  const fetchStatus = async () => {
    setLoading(true);
    setError(null);
    try {
      await new Promise(r => setTimeout(r, 1500));
      setStatus('off'); // o lo que venga de tu API
    } catch {
      setError('Error al obtener el estado de Kuntur');
    } finally {
      setLoading(false);
    }
  };

  const activateKuntur = async () => {
    setLoading(true);
    setError(null);
    try {
      await new Promise(r => setTimeout(r, 2000));
      setStatus('on');
      startAllStreams();
    } catch {
      setError('Error al activar Kuntur');
    } finally {
      setLoading(false);
    }
  };

  const deactivateKuntur = async () => {
    setLoading(true);
    setError(null);
    try {
      await stopAllStreams();
      await new Promise(r => setTimeout(r, 2000));
      setStatus('off');
    } catch {
      setError('Error al desactivar Kuntur');
    } finally {
      setLoading(false);
    }
  };

  const toggleKuntur = () => {
    return status === 'off' ? activateKuntur() : deactivateKuntur();
  };

  useEffect(() => {
    fetchStatus();
  }, []);

  return {
    status,
    loading,
    error,
    activateKuntur,
    deactivateKuntur,
    toggleKuntur,
    refetchStatus: fetchStatus,
    hasUser: !!user,
    userLoading,
  };
};
