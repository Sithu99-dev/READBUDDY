import React, { useRef, useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Alert, PermissionsAndroid, ActivityIndicator } from 'react-native';
import { Camera, useCameraDevices } from 'react-native-vision-camera';
import MlkitOcr from 'react-native-mlkit-ocr';

export default function ReadingText({ navigation }) {
  const cameraRef = useRef(null);
  const devices = useCameraDevices();
  const device = devices.back || devices.rear || Object.values(devices)[0]; // Fallback
  const [cameraReady, setCameraReady] = useState(false);
  const [hasPermission, setHasPermission] = useState(false);
  const [isCameraActive, setIsCameraActive] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    if (!device && hasPermission) {
      console.log('Waiting for back camera...');
      const timer = setTimeout(() => {
        console.log('Retrying device check');
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [device, hasPermission]);

  useEffect(() => {
    const checkPermissions = async () => {
      const granted = await PermissionsAndroid.check(PermissionsAndroid.PERMISSIONS.CAMERA);
      if (granted) {
        setHasPermission(true);
      } else {
        const result = await PermissionsAndroid.request(PermissionsAndroid.PERMISSIONS.CAMERA, {
          title: 'Camera Permission',
          message: 'This app needs camera access to scan documents.',
          buttonNeutral: 'Ask Me Later',
          buttonNegative: 'Cancel',
          buttonPositive: 'OK',
        });
        setHasPermission(result === PermissionsAndroid.RESULTS.GRANTED);
      }
    };

    checkPermissions();
  }, []);

  useEffect(() => {
    console.log('Devices updated:', JSON.stringify(devices, null, 2));
    if (devices.back) {
      console.log('Back camera detected:', JSON.stringify(devices.back, null, 2));
    } else {
      console.log('No back camera detected yet');
    }
  }, [devices]);

  const takePicture = async () => {
    if (cameraRef.current) {
      try {
        setIsProcessing(true);
        const photo = await cameraRef.current.takePhoto({ quality: 0.5 });
        console.log('Photo captured:', photo.path);

        const result = await MlkitOcr.detectFromUri(`file://${photo.path}`);
        console.log('OCR Result:', result);

        const extractedText = result.map(block => block.text).join('\n');
        console.log('Extracted Text:', extractedText);

        setIsCameraActive(false);
        console.log('Camera deactivated before navigation');

        if (extractedText) {
          navigation.navigate('Scanned Text', { scannedText: extractedText });
        } else {
          Alert.alert('Error', 'No text detected');
        }
      } catch (error) {
        console.log('Error capturing photo or extracting text:', error);
        Alert.alert('Error', 'Failed to process the photo');
      } finally {
        setIsProcessing(false);
      }
    }
  };

  if (!hasPermission) {
    return (
      <View style={styles.container}>
        <Text>Camera permission denied. Please enable it in settings.</Text>
      </View>
    );
  }

  if (!devices || Object.keys(devices).length === 0) {
    return (
      <View style={styles.container}>
        <Text>Loading camera devices...</Text>
      </View>
    );
  }

  if (!device) {
    return (
      <View style={styles.container}>
        <Text>No back camera found. Devices: {JSON.stringify(devices, null, 2)}</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Text Settings Button */}
      <TouchableOpacity
        style={styles.textSettingsButton}
        onPress={() => navigation.navigate('Text Settings', { scannedText: '', letterSettings: {} })}
      >
        <Text style={styles.textSettingsText}>Text Settings</Text>
      </TouchableOpacity>

      <Text style={styles.instruction}>Take a clear picture of your document.</Text>

      <View style={styles.cameraContainer}>
        <Camera
          ref={cameraRef}
          style={styles.camera}
          device={device}
          isActive={isCameraActive}
          photo={true}
          onInitialized={() => {
            console.log('Camera initialized');
            setCameraReady(true);
          }}
          onError={(error) => {
            console.log('Camera error:', error);
            // Alert.alert('Error', 'Failed to initialize camera: ' + error.message);
          }}
        />
      </View>

      {isProcessing ? (
        <View style={styles.loadingOverlay}>
          <ActivityIndicator size="large" color="#27ac1f" />
          <Text style={styles.loadingText}>Processing...</Text>
        </View>
      ) : (
        <TouchableOpacity
          style={styles.cameraButton}
          onPress={takePicture}
          disabled={!cameraReady || isProcessing}
        >
          <Text style={styles.cameraIcon}>📷</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  textSettingsButton: {
    backgroundColor: '#85fe78',
    padding: 10,
    borderRadius: 10,
    marginTop: 20, // Space from top of screen
    marginBottom: 10, // Space before instruction
  },
  textSettingsText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#12181e',
    textAlign: 'center',
  },
  instruction: {
    fontSize: 23,
    fontWeight: '600',
    margin: 20,
    padding: 18,
    borderColor: '#27ac1f',
    borderWidth: 1,
    color: '#27ac1f',
  },
  cameraContainer: {
    width: '100%',
    height: 400,
    marginVertical: 20,
    overflow: 'hidden',
  },
  camera: {
    flex: 1,
  },
  cameraButton: {
    backgroundColor: '#85fe78',
    padding: 20,
    borderRadius: 80,
  },
  cameraIcon: {
    fontSize: 40,
    color: 'white',
    padding: 20,
  },
  loadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  loadingText: {
    marginTop: 10,
    fontSize: 18,
    color: '#fff',
  },
});