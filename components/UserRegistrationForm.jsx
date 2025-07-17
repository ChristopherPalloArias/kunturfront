import React, { useState, useRef, useEffect } from 'react';
import {
    View,
    Text,
    TextInput,
    TouchableOpacity,
    StyleSheet,
    Alert,
    ScrollView,
    ActivityIndicator,
    KeyboardAvoidingView,
    Platform,
    SafeAreaView
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import MapView, { Marker } from 'react-native-maps';
import { 
    BuildingStorefrontIcon, 
    VideoCameraIcon, 
    MapPinIcon,
    CheckCircleIcon,
    LockClosedIcon,
    EyeIcon,
    EyeSlashIcon
} from 'react-native-heroicons/solid';
import { useRouter } from 'expo-router';
import Colors from '../constant/Colors';
import { FontFamily, FontSize } from '../constant/Typography';
import { useUserRegistration } from '../hooks/useUserRegistration';

const UserRegistrationForm = () => {
    const router = useRouter();
    const { registerUser, registrationLoading, error, clearError } = useUserRegistration();
    
    const [formData, setFormData] = useState({
        nombre_local: '',
        ip_camara: '',
        ubicacion: '',
        latitud: null,
        longitud: null,
        password: ''
    });
    
    const [mapRegion, setMapRegion] = useState({
        latitude: -0.1807,
        longitude: -78.4678,
        latitudeDelta: 0.0922,
        longitudeDelta: 0.0421,
    });
    
    const [selectedLocation, setSelectedLocation] = useState(null);
    const [locationName, setLocationName] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [isLoadingLocation, setIsLoadingLocation] = useState(false);
    
    const mapRef = useRef(null);
    
    useEffect(() => {
        if (error) {
            Alert.alert('Error', error);
            clearError();
        }
    }, [error]);
    
    const handleInputChange = (field, value) => {
        setFormData(prev => ({
            ...prev,
            [field]: value
        }));
    };
    
    const getAddressFromCoordinates = async (latitude, longitude) => {
        try {
            setIsLoadingLocation(true);
            
            const response = await fetch(
                `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&addressdetails=1`
            );
            
            if (!response.ok) {
                throw new Error('Error en la respuesta del servidor');
            }
            
            const data = await response.json();
            
            if (data && data.display_name) {
                return data.display_name;
            } else {
                return "Dirección no encontrada";
            }
        } catch (error) {
            console.error("Error obteniendo dirección:", error);
            return "Error obteniendo dirección";
        } finally {
            setIsLoadingLocation(false);
        }
    };
    
    const handleMapPress = async (event) => {
        const { latitude, longitude } = event.nativeEvent.coordinate;
        
        setSelectedLocation({ latitude, longitude });
        
        setFormData(prev => ({
            ...prev,
            latitud: latitude,
            longitud: longitude
        }));
        
        setLocationName('Obteniendo dirección...');
        setFormData(prev => ({
            ...prev,
            ubicacion: 'Obteniendo dirección...'
        }));
        
        // Obtener la dirección real
        const address = await getAddressFromCoordinates(latitude, longitude);
        
        setLocationName(address);
        setFormData(prev => ({
            ...prev,
            ubicacion: address
        }));
    };
    
    const validateForm = () => {
        if (!formData.nombre_local.trim()) {
            Alert.alert('Error', 'El nombre del local es requerido');
            return false;
        }
        
        if (!formData.ip_camara.trim()) {
            Alert.alert('Error', 'La IP de la cámara es requerida');
            return false;
        }
        
        if (!formData.password.trim()) {
            Alert.alert('Error', 'La contraseña es requerida');
            return false;
        }
        
        if (formData.password.length < 6) {
            Alert.alert('Error', 'La contraseña debe tener al menos 6 caracteres');
            return false;
        }
        
        if (!formData.ubicacion.trim() || !formData.latitud || !formData.longitud) {
            Alert.alert('Error', 'Por favor selecciona una ubicación en el mapa');
            return false;
        }
        
        if (formData.ubicacion === 'Obteniendo dirección...' || formData.ubicacion === 'Error obteniendo dirección') {
            Alert.alert('Error', 'Por favor espera a que se obtenga la dirección o selecciona otra ubicación');
            return false;
        }
        
        return true;
    };
    
    const handleSubmit = async () => {
        if (!validateForm()) return;
        
        const result = await registerUser(formData);
        
        if (result.success) {
            Alert.alert('Éxito', 'Local registrado exitosamente', [
                { 
                    text: 'OK', 
                    onPress: () => {
                        router.push('/(tabs)');
                    }
                }
            ]);
        }
    };
    
    const togglePasswordVisibility = () => {
        setShowPassword(!showPassword);
    };
    
    return (
        <SafeAreaView style={styles.safeArea}>
            <KeyboardAvoidingView 
                style={styles.container}
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            >
                <LinearGradient
                    colors={[Colors.secondary[500], Colors.primary[500]]}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 0 }}
                    style={styles.background}
                >
                    {/* Header personalizado */}
                    <View style={styles.customHeader}>
                        <View style={styles.headerPlaceholder} />
                        <Text style={styles.headerTitle}>Registro de Local</Text>
                        <View style={styles.headerPlaceholder} />
                    </View>
                    
                    <ScrollView 
                        style={styles.scrollView}
                        showsVerticalScrollIndicator={false}
                        keyboardShouldPersistTaps="handled"
                        contentContainerStyle={styles.scrollContent}
                    >
                        <View style={styles.content}>
                            {/* Card principal */}
                            <View style={styles.formCard}>
                                <Text style={styles.cardTitle}>Información del Local</Text>
                                
                                {/* Nombre del local */}
                                <View style={styles.inputGroup}>
                                    <Text style={styles.label}>Nombre del local</Text>
                                    <View style={styles.inputContainer}>
                                        <BuildingStorefrontIcon size={20} color={Colors.primary[600]} />
                                        <TextInput
                                            style={styles.input}
                                            placeholder="Ingresa el nombre del local"
                                            value={formData.nombre_local}
                                            onChangeText={(text) => handleInputChange('nombre_local', text)}
                                            placeholderTextColor={Colors.neutro + '80'}
                                            autoCapitalize="words"
                                        />
                                    </View>
                                </View>
                                
                                {/* IP de la cámara */}
                                <View style={styles.inputGroup}>
                                    <Text style={styles.label}>IP de la cámara</Text>
                                    <View style={styles.inputContainer}>
                                        <VideoCameraIcon size={20} color={Colors.primary[600]} />
                                        <TextInput
                                            style={[styles.input, styles.urlInput]}
                                            placeholder="http://192.168.1.1:8080/video"
                                            value={formData.ip_camara}
                                            onChangeText={(text) => handleInputChange('ip_camara', text)}
                                            placeholderTextColor={Colors.primary[600]}
                                            keyboardType="url"
                                            autoCapitalize="none"
                                            multiline={false}
                                            scrollEnabled={true}
                                        />
                                    </View>
                                </View>
                                
                                {/* Contraseña */}
                                <View style={styles.inputGroup}>
                                    <Text style={styles.label}>Contraseña</Text>
                                    <View style={styles.inputContainer}>
                                        <LockClosedIcon size={20} color={Colors.primary[600]} />
                                        <TextInput
                                            style={styles.input}
                                            placeholder="Ingresa tu contraseña"
                                            value={formData.password}
                                            onChangeText={(text) => handleInputChange('password', text)}
                                            placeholderTextColor={Colors.neutro + '80'}
                                            secureTextEntry={!showPassword}
                                            autoCapitalize="none"
                                        />
                                        <TouchableOpacity
                                            onPress={togglePasswordVisibility}
                                            style={styles.eyeButton}
                                        >
                                            {showPassword ? (
                                                <EyeSlashIcon size={20} color={Colors.neutro + '60'} />
                                            ) : (
                                                <EyeIcon size={20} color={Colors.neutro + '60'} />
                                            )}
                                        </TouchableOpacity>
                                    </View>
                                    <Text style={styles.helperText}>
                                        Mínimo 6 caracteres
                                    </Text>
                                </View>
                            </View>
                            
                            {/* Card de ubicación */}
                            <View style={styles.formCard}>
                                <Text style={styles.cardTitle}>Ubicación</Text>
                                
                                {/* Mapa */}
                                <View style={styles.inputGroup}>
                                    <Text style={styles.label}>Selecciona la ubicación en el mapa</Text>
                                    <View style={styles.mapContainer}>
                                        <MapView
                                            ref={mapRef}
                                            style={styles.map}
                                            initialRegion={mapRegion}
                                            onPress={handleMapPress}
                                            showsUserLocation={true}
                                            showsMyLocationButton={true}
                                        >
                                            {selectedLocation && (
                                                <Marker
                                                    coordinate={selectedLocation}
                                                    title="Ubicación del Local"
                                                    description={locationName}
                                                />
                                            )}
                                        </MapView>
                                        <View style={styles.mapOverlay}>
                                            <MapPinIcon size={16} color={Colors.primary[600]} />
                                            <Text style={styles.mapInstructionText}>
                                                Toca el mapa para seleccionar
                                            </Text>
                                            {isLoadingLocation && (
                                                <ActivityIndicator size="small" color={Colors.primary[600]} />
                                            )}
                                        </View>
                                    </View>
                                </View>
                                
                                {/* Dirección */}
                                <View style={styles.inputGroup}>
                                    <Text style={styles.label}>Dirección</Text>
                                    <View style={styles.inputContainer}>
                                        <MapPinIcon size={20} color={Colors.primary[600]} />
                                        <TextInput
                                            style={[
                                                styles.input,
                                                styles.addressInput,
                                                isLoadingLocation && styles.inputLoading
                                            ]}
                                            placeholder="Se llenará automáticamente"
                                            value={formData.ubicacion}
                                            onChangeText={(text) => handleInputChange('ubicacion', text)}
                                            placeholderTextColor={Colors.neutro + '80'}
                                            multiline={true}
                                            numberOfLines={2}
                                            editable={!isLoadingLocation}
                                        />
                                        {isLoadingLocation && (
                                            <ActivityIndicator size="small" color={Colors.primary[600]} />
                                        )}
                                    </View>
                                </View>
                            </View>
                            
                            {/* Botón de registro */}
                            <TouchableOpacity
                                style={[
                                    styles.registerButton, 
                                    (registrationLoading || isLoadingLocation) && styles.disabledButton
                                ]}
                                onPress={handleSubmit}
                                disabled={registrationLoading || isLoadingLocation}
                                activeOpacity={0.8}
                            >
                                {registrationLoading ? (
                                    <ActivityIndicator color={Colors.neutro} size="small" />
                                ) : (
                                    <>
                                        <CheckCircleIcon size={20} color={Colors.neutro} />
                                        <Text style={styles.buttonText}>REGISTRAR LOCAL</Text>
                                    </>
                                )}
                            </TouchableOpacity>
                        </View>
                    </ScrollView>
                </LinearGradient>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    safeArea: {
        flex: 1,
        backgroundColor: Colors.primary[500],
    },
    container: {
        flex: 1,
    },
    background: {
        flex: 1,
    },
    customHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 20,
        paddingVertical: 15,
        borderBottomWidth: 1,
        borderBottomColor: 'rgba(255, 255, 255, 0.1)',
    },
    headerTitle: {
        fontSize: FontSize.large,
        fontFamily: FontFamily.bold,
        color: Colors.neutro,
    },
    headerPlaceholder: {
        width: 40,
    },
    scrollView: {
        flex: 1,
    },
    scrollContent: {
        flexGrow: 1,
    },
    content: {
        flex: 1,
        padding: 20,
        gap: 20,
        justifyContent: 'flex-start',
    },
    formCard: {
        backgroundColor: 'rgba(255, 255, 255, 0.95)',
        borderRadius: 16,
        padding: 20,
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.1,
        shadowRadius: 8,
        elevation: 5,
    },
    cardTitle: {
        fontSize: FontSize.body + 2,
        fontFamily: FontFamily.bold,
        color: Colors.primary[700],
        marginBottom: 16,
        textAlign: 'center',
    },
    inputGroup: {
        marginBottom: 16,
    },
    label: {
        fontSize: FontSize.small,
        fontFamily: FontFamily.medium,
        color: Colors.primary[700],
        marginBottom: 8,
    },
    inputContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: Colors.neutro + '10',
        borderRadius: 12,
        paddingHorizontal: 16,
        paddingVertical: 14,
        gap: 12,
        borderWidth: 1,
        borderColor: Colors.primary[200],
    },
    input: {
        flex: 1,
        fontSize: FontSize.body,
        fontFamily: FontFamily.regular,
        color: Colors.primary[800],
    },
    addressInput: {
        minHeight: 20,
    },
    urlInput: {
        fontSize: FontSize.body - 1,
        fontFamily: FontFamily.medium,
    },
    inputLoading: {
        opacity: 0.6,
    },
    eyeButton: {
        padding: 4,
    },
    helperText: {
        fontSize: FontSize.small - 2,
        fontFamily: FontFamily.regular,
        color: Colors.primary[600],
        marginTop: 4,
        marginLeft: 4,
    },
    mapContainer: {
        borderRadius: 12,
        overflow: 'hidden',
        backgroundColor: Colors.neutro + '10',
        borderWidth: 1,
        borderColor: Colors.primary[200],
    },
    map: {
        height: 180,
    },
    mapOverlay: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 8,
        padding: 12,
        backgroundColor: Colors.neutro + '95',
        borderTopWidth: 1,
        borderTopColor: Colors.primary[200],
    },
    mapInstructionText: {
        fontSize: FontSize.small,
        fontFamily: FontFamily.regular,
        color: Colors.primary[600],
    },
    registerButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: Colors.success[600],
        paddingVertical: 18,
        borderRadius: 12,
        gap: 8,
        shadowColor: Colors.success[600],
        shadowOffset: {
            width: 0,
            height: 4,
        },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 6,
    },
    disabledButton: {
        opacity: 0.6,
    },
    buttonText: {
        fontSize: FontSize.body,
        fontFamily: FontFamily.bold,
        color: Colors.neutro,
        letterSpacing: 0.5,
    },
});

export default UserRegistrationForm;