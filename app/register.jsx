import React from 'react';
import { StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import UserRegistrationForm from '../components/UserRegistrationForm';

export default function RegisterScreen() {
    const router = useRouter();

    const handleRegistrationComplete = () => {
        router.replace('/(tabs)');
    };

    return (
        <UserRegistrationForm onRegistrationComplete={handleRegistrationComplete} />
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
});
