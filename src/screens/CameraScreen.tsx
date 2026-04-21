import React, { useState, useRef } from 'react';
import {
  View,
  StyleSheet,
  TouchableOpacity,
  Text,
  Alert,
  ActivityIndicator,
  Image,
} from 'react-native';
import { CameraView, useCameraPermissions } from 'expo-camera';

interface CameraScreenProps {
  onPhotoCaptured: (photoUri: string) => void;
}

export const CameraScreen: React.FC<CameraScreenProps> = ({ onPhotoCaptured }) => {
  const cameraRef = useRef<CameraView>(null);
  const [permission, requestPermission] = useCameraPermissions();
  const [isCapturing, setIsCapturing] = useState(false);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);

  // Request camera permissions
  if (!permission) {
    return <View />;
  }

  if (!permission.granted) {
    return (
      <View style={styles.container}>
        <Text style={styles.permissionText}>Camera access is required</Text>
        <TouchableOpacity
          style={styles.permissionButton}
          onPress={requestPermission}
        >
          <Text style={styles.permissionButtonText}>Grant Permission</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const takePicture = async () => {
    if (cameraRef.current && !isCapturing) {
      try {
        setIsCapturing(true);
        const photo = await cameraRef.current.takePictureAsync({
          quality: 0.8,
          base64: false,
        });

        if (photo) {
          setCapturedImage(photo.uri);
        }
      } catch (error) {
        Alert.alert('Error', 'Failed to capture photo');
        console.error('Camera error:', error);
      } finally {
        setIsCapturing(false);
      }
    }
  };

  const confirmPhoto = () => {
    if (capturedImage) {
      onPhotoCaptured(capturedImage);
      setCapturedImage(null);
    }
  };

  const retakePhoto = () => {
    setCapturedImage(null);
  };

  // Show preview of captured image
  if (capturedImage) {
    return (
      <View style={styles.container}>
        <Image
          source={{ uri: capturedImage }}
          style={styles.previewImage}
        />
        <View style={styles.buttonContainer}>
          <TouchableOpacity
            style={[styles.button, styles.retakeButton]}
            onPress={retakePhoto}
          >
            <Text style={styles.buttonText}>Retake</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.button, styles.confirmButton]}
            onPress={confirmPhoto}
          >
            <Text style={styles.buttonText}>Confirm</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  // Camera view
  return (
    <View style={styles.container}>
      <CameraView
        ref={cameraRef}
        style={styles.camera}
        facing="back"
      >
        <View style={styles.overlay}>
          <View style={styles.focusFrame} />
        </View>
      </CameraView>

      <View style={styles.bottomContainer}>
        <TouchableOpacity
          style={[
            styles.captureButton,
            isCapturing && styles.captureButtonDisabled,
          ]}
          onPress={takePicture}
          disabled={isCapturing}
        >
          {isCapturing ? (
            <ActivityIndicator color="#fff" size="large" />
          ) : (
            <View style={styles.captureButtonInner} />
          )}
        </TouchableOpacity>
        <Text style={styles.captureText}>Capture Receipt</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  camera: {
    flex: 1,
  },
  overlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  focusFrame: {
    width: 280,
    height: 350,
    borderWidth: 2,
    borderColor: '#fff',
    borderRadius: 8,
    opacity: 0.7,
  },
  bottomContainer: {
    backgroundColor: '#0f1419',
    paddingBottom: 20,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
  },
  captureButton: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#3b82f6',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
    shadowColor: '#3b82f6',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 8,
    elevation: 8,
  },
  captureButtonDisabled: {
    opacity: 0.5,
  },
  captureButtonInner: {
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: '#2563eb',
  },
  captureText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  previewImage: {
    flex: 1,
    resizeMode: 'contain',
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingHorizontal: 20,
    paddingBottom: 20,
    backgroundColor: '#1a1f2e',
    borderTopWidth: 1,
    borderTopColor: '#2a3141',
  },
  button: {
    paddingVertical: 12,
    paddingHorizontal: 30,
    borderRadius: 8,
    minWidth: 120,
    alignItems: 'center',
  },
  retakeButton: {
    backgroundColor: '#6b7280',
  },
  confirmButton: {
    backgroundColor: '#10b981',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  permissionText: {
    fontSize: 18,
    color: '#e2e8f0',
    textAlign: 'center',
    marginBottom: 20,
  },
  permissionButton: {
    backgroundColor: '#3b82f6',
    paddingVertical: 12,
    paddingHorizontal: 30,
    borderRadius: 8,
    alignItems: 'center',
  },
  permissionButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});
