// hooks/useUserRegistration.js - Versión con debug
import { useState, useEffect, createContext, useContext } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { userService } from '../services/userService';

const UserContext = createContext();

export const UserProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [registrationLoading, setRegistrationLoading] = useState(false);
    const [error, setError] = useState(null);

    const USER_STORAGE_KEY = '@kuntur_user_data';

useEffect(() => {
    console.log('=== useEffect TRIGGERED in useUserRegistration ===');
    
    const clearDataInDevelopment = async () => {
        if (__DEV__) { 
            console.log('DESARROLLO: Limpiando AsyncStorage...');
            await AsyncStorage.removeItem(USER_STORAGE_KEY);
            console.log('DESARROLLO: AsyncStorage limpiado');
        }
    };
    
    const initializeUser = async () => {
        await clearDataInDevelopment();
        await checkUserData();
    };
    
    initializeUser();
}, []);

    const checkUserData = async () => {
        console.log('=== checkUserData STARTED ===');
        console.log('Current loading state:', loading);
        
        try {
            console.log('Setting loading to TRUE');
            setLoading(true);
            
            console.log('Getting data from AsyncStorage...');
            const userData = await AsyncStorage.getItem(USER_STORAGE_KEY);
            console.log('Retrieved userData:', userData);
            
            if (userData) {
                const parsedUser = JSON.parse(userData);
                console.log('Parsed user:', parsedUser);
                setUser(parsedUser);
                console.log('User set in state');
            } else {
                console.log('No user data found in AsyncStorage');
            }
        } catch (error) {
            console.error('Error al verificar datos de usuario:', error);
            setError('Error al cargar datos del usuario');
        } finally {
            console.log('Setting loading to FALSE');
            setLoading(false);
            console.log('=== checkUserData COMPLETED ===');
        }
    };

    // Registrar nuevo usuario
    const registerUser = async (userData) => {
        try {
            setRegistrationLoading(true);
            setError(null);

            if (!userData.nombre_local || !userData.ip_camara || !userData.ubicacion || !userData.latitud || !userData.longitud) {
                throw new Error('Todos los campos son requeridos');
            }

            if (!userData.password) {
                throw new Error('La contraseña es requerida');
            }

            const result = await userService.registerUser(userData);

            if (result.success) {
                const userDataToStore = {
                    nombre_local: userData.nombre_local,
                    ip_camara: userData.ip_camara,
                    ubicacion: userData.ubicacion,
                    latitud: userData.latitud,
                    longitud: userData.longitud,
                    registered_at: new Date().toISOString(),
                };

                await AsyncStorage.setItem(USER_STORAGE_KEY, JSON.stringify(userDataToStore));
                
                setUser(userDataToStore);
                
                return { success: true, message: 'Usuario registrado exitosamente' };
            }

            throw new Error(result.message || 'Error al registrar usuario');
        } catch (error) {
            console.error('Error al registrar usuario:', error);
            setError(error.message);
            return { success: false, message: error.message };
        } finally {
            setRegistrationLoading(false);
        }
    };

    // Login de usuario
    const loginUser = async (credentials) => {
        try {
            setRegistrationLoading(true);
            setError(null);

            const result = await userService.loginUser(credentials);

            if (result.success) {
                const userData = await userService.getUserData();
                
                // Guardar en AsyncStorage
                await AsyncStorage.setItem(USER_STORAGE_KEY, JSON.stringify(userData));
                
                // Actualizar estado
                setUser(userData);
                
                return { success: true, message: 'Login exitoso' };
            }

            throw new Error(result.message || 'Error al iniciar sesión');
        } catch (error) {
            console.error('Error al hacer login:', error);
            setError(error.message);
            return { success: false, message: error.message };
        } finally {
            setRegistrationLoading(false);
        }
    };

    // Actualizar datos del usuario
    const updateUser = async (newData) => {
        try {
            setRegistrationLoading(true);
            setError(null);

            const updatedUser = { ...user, ...newData };
            
            await AsyncStorage.setItem(USER_STORAGE_KEY, JSON.stringify(updatedUser));
            
            setUser(updatedUser);
            
            return { success: true, message: 'Usuario actualizado exitosamente' };
        } catch (error) {
            console.error('Error al actualizar usuario:', error);
            setError(error.message);
            return { success: false, message: error.message };
        } finally {
            setRegistrationLoading(false);
        }
    };

    // Cerrar sesión
    const logout = async () => {
        try {
            await userService.logout();
            
            await AsyncStorage.removeItem(USER_STORAGE_KEY);
            
            setUser(null);
            setError(null);
            
            return { success: true, message: 'Sesión cerrada' };
        } catch (error) {
            console.error('Error al cerrar sesión:', error);
            await AsyncStorage.removeItem(USER_STORAGE_KEY);
            setUser(null);
            setError(null);
            
            return { success: true, message: 'Sesión cerrada localmente' };
        }
    };

    const clearUser = async () => {
        try {
            await AsyncStorage.removeItem(USER_STORAGE_KEY);
            setUser(null);
            setError(null);
        } catch (error) {
            console.error('Error al limpiar datos del usuario:', error);
        }
    };

    const isUserRegistered = () => {
        const registered = user !== null;
        console.log('isUserRegistered called - user:', user, 'result:', registered);
        return registered;
    };

    const checkLocalExists = async (nombreLocal) => {
        try {
            const result = await userService.checkUserExists(nombreLocal);
            return result.exists;
        } catch (error) {
            console.error('Error al verificar local:', error);
            return false;
        }
    };

    console.log('=== USER PROVIDER STATE ===');
    console.log('user:', user);
    console.log('loading:', loading);
    console.log('registrationLoading:', registrationLoading);
    console.log('error:', error);
    console.log('===========================');

    const value = {
        user,
        loading,
        registrationLoading,
        error,
        registerUser,
        loginUser,
        updateUser,
        logout,
        clearUser,
        isUserRegistered,
        checkUserData,
        checkLocalExists,
        clearError: () => setError(null),
    };

    return (
        <UserContext.Provider value={value}>
            {children}
        </UserContext.Provider>
    );
};

export const useUserRegistration = () => {
    const context = useContext(UserContext);
    if (!context) {
        throw new Error('useUserRegistration must be used within a UserProvider');
    }
    return context;
};