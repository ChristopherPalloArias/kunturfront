// hooks/useCamera.js
import React, { createContext, useContext, useState } from 'react';

const CameraContext = createContext();

export const CameraProvider = ({ children }) => {
  const [cameraIp, setCameraIp] = useState(null);
  return (
    <CameraContext.Provider value={{ cameraIp, setCameraIp }}>
      {children}
    </CameraContext.Provider>
  );
};

export const useCamera = () => {
  const ctx = useContext(CameraContext);
  if (!ctx) throw new Error('useCamera debe usarse dentro de <CameraProvider>');
  return ctx;
};
