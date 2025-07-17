// app/_layout.jsx
import { Stack } from 'expo-router';
import { StatusBar, View, Image, StyleSheet } from 'react-native';
import { useEffect, useState } from 'react';
import useCustomFonts from '../hooks/useCustomFonts';
import { UserProvider } from '../hooks/useUserRegistration';
import { CameraProvider } from '../hooks/useCamera';

export default function RootLayout() {
  const fontsLoaded = useCustomFonts();
  const [appReady, setAppReady] = useState(false);

  useEffect(() => {
    if (fontsLoaded) {
      const timeout = setTimeout(() => setAppReady(true), 500);
      return () => clearTimeout(timeout);
    }
  }, [fontsLoaded]);

  if (!fontsLoaded || !appReady) {
    return (
      <View style={styles.splashContainer}>
        <Image
          source={require('../assets/splash.gif')}
          style={styles.splashImage}
          resizeMode="contain"
        />
      </View>
    );
  }

  return (
    <UserProvider>
      <CameraProvider>
        <StatusBar barStyle="light-content" />
        <Stack
          screenOptions={{
            headerShown: false,
            contentStyle: styles.container,
          }}
          initialRouteName="register"
        >
          <Stack.Screen name="register" />
          <Stack.Screen name="(tabs)" />
          {/*
            La pantalla de streaming ahora vive dentro de (tabs),
            no aquí en el root layout, así evitamos el warning.
          */}
        </Stack>
      </CameraProvider>
    </UserProvider>
  );
}

const styles = StyleSheet.create({
  splashContainer: {
    flex: 1,
    backgroundColor: '#000',
    justifyContent: 'center',
    alignItems: 'center',
  },
  splashImage: {
    width: '100%',
    height: '100%',
  },
  container: {
    flex: 1,
  },
});
