import { useState, useEffect } from 'react';
import { useStreaming } from './useSharedStreaming';
import { useUserRegistration } from './useUserRegistration';

export const useKunturStatus = (initialStatus = 'off') => {
    const [status, setStatus] = useState(initialStatus);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    // Obtener funciones de streaming
    const streamingContext = useStreaming();
    const { startAllStreams, stopAllStreams } = streamingContext || { 
        startAllStreams: () => { }, 
        stopAllStreams: () => { } 
    };

    // Obtener contexto de usuario - CORREGIDO: usar 'loading' no 'isLoading'
    const { user, loading: userLoading } = useUserRegistration();

    const fetchStatus = async () => {
        setLoading(true);
        setError(null);

        try {
            await new Promise(resolve => setTimeout(resolve, 1500));

            const mockResponse = {
                status: 'off',
                timestamp: new Date().toISOString(),
                location: 'Centro Comercial "El Tejar"'
            };

            setStatus(mockResponse.status);
        } catch (err) {
            setError('Error al obtener el estado de Kuntur');
        } finally {
            setLoading(false);
        }
    };

    // Activar Kuntur
    const activateKuntur = async () => {
        setLoading(true);
        setError(null);

        try {
            // Simular llamada a API para activar
            await new Promise(resolve => setTimeout(resolve, 2000));

            setStatus('on');

            // Iniciar streaming automáticamente
            startAllStreams();
        } catch (err) {
            setError('Error al activar Kuntur');
        } finally {
            setLoading(false);
        }
    };

    // Desactivar Kuntur
    const deactivateKuntur = async () => {
        setLoading(true);
        setError(null);

        try {
            // Detener streaming primero
            await stopAllStreams();

            // Simular llamada a API para desactivar
            await new Promise(resolve => setTimeout(resolve, 2000));

            setStatus('off');
        } catch (err) {
            setError('Error al desactivar Kuntur');
        } finally {
            setLoading(false);
        }
    };

    // Función para manejar el toggle de Kuntur
    const toggleKuntur = async () => {
        if (status === 'off') {
            await activateKuntur();
        } else {
            await deactivateKuntur();
        }
    };

    useEffect(() => {
        fetchStatus();
    }, []);

    return {
        status,
        loading,  // Solo el loading del hook de Kuntur
        error,
        activateKuntur,
        deactivateKuntur,
        toggleKuntur,
        refetchStatus: fetchStatus,
        hasUser: !!user,
        userLoading  // Devolver userLoading por separado si es necesario
    };
};