import React, { useRef, useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  TouchableOpacity, 
  StyleSheet, 
  Alert, 
  PermissionsAndroid, 
  ActivityIndicator,
  Image,
  SafeAreaView,
  StatusBar
} from 'react-native';
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
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#5FC3C0" />
      
      {/* Header with back button and settings */}
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton} 
          onPress={() => navigation.goBack()}
        >
          <Text style={styles.backButtonText}>←</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={styles.settingsButton}
          onPress={() => navigation.navigate('Text Settings', { scannedText: '', letterSettings: {} })}
        >
          <Image 
            source={require('../assets/settings.png')} 
            style={styles.settingsIcon}
            // If you don't have a settings icon, use this fallback:
            // For fallback text icon: <Text style={styles.settingsText}>⚙️</Text>
          />
        </TouchableOpacity>
      </View>

      {/* Main instruction text */}
      <Text style={styles.instruction}>
        Take a clear picture of your document
      </Text>

      {/* Camera viewport with document frame */}
      <View style={styles.cameraContainer}>
        <View style={styles.cameraFrame}>
          <View style={styles.scanLine} />
          
          {/* Corner markers */}
          <View style={[styles.cornerMarker, styles.topLeft]} />
          <View style={[styles.cornerMarker, styles.topRight]} />
          <View style={[styles.cornerMarker, styles.bottomLeft]} />
          <View style={[styles.cornerMarker, styles.bottomRight]} />
        </View>
        
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
          }}
        />
      </View>

      {/* Camera button at bottom */}
      {isProcessing ? (
        <View style={styles.loadingOverlay}>
          <ActivityIndicator size="large" color="#FFFFFF" />
          <Text style={styles.loadingText}>Processing...</Text>
        </View>
      ) : (
        <TouchableOpacity
          style={styles.cameraButton}
          onPress={takePicture}
          disabled={!cameraReady || isProcessing}
        >
          <View style={styles.cameraButtonInner}>
            <View style={styles.cameraButtonInnermost} />
          </View>
        </TouchableOpacity>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#5FC3C0', // Teal background from image
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 10,
    paddingBottom: 10,
  },
  backButton: {
    padding: 8,
  },
  backButtonText: {
    fontSize: 52,
    color: '#000',
    fontWeight: 'bold',
  },
  settingsIcon: {
    width: 24,
    height: 24,
    tintColor: '#000',
    fontWeight:'bold',
  },
  settingsButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(128, 128, 128, 0.4)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight:160,
    marginTop:15,
  },

  settingsText: {
    fontSize: 20,
    color: 'white',
  },
  instruction: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#000',
    marginVertical: 20,
    paddingHorizontal: 20,
  },
  cameraContainer: {
    width: '90%',
    height: 400,
    marginHorizontal: '5%',
    borderRadius: 25,
    overflow: 'hidden',
    backgroundColor: '#1E3D5C', // Dark blue background for camera frame
    position: 'relative',
    justifyContent: 'center',
    alignItems: 'center',
  },
  camera: {
    ...StyleSheet.absoluteFillObject,
  },
  cameraFrame: {
    position: 'absolute',
    width: '80%',
    height: '80%',
    borderRadius: 10,
    zIndex: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  cornerMarker: {
    position: 'absolute',
    width: 25,
    height: 25,
    borderColor: 'white',
    borderWidth: 3,
  },
  topLeft: {
    top: 0,
    left: 0,
    borderRightWidth: 0,
    borderBottomWidth: 0,
    borderTopLeftRadius: 5,
  },
  topRight: {
    top: 0,
    right: 0,
    borderLeftWidth: 0,
    borderBottomWidth: 0,
    borderTopRightRadius: 5,
  },
  bottomLeft: {
    bottom: 0,
    left: 0,
    borderRightWidth: 0,
    borderTopWidth: 0,
    borderBottomLeftRadius: 5,
  },
  bottomRight: {
    bottom: 0,
    right: 0,
    borderLeftWidth: 0,
    borderTopWidth: 0,
    borderBottomRightRadius: 5,
  },
  documentIcon: {
    width: 80,
    height: 100,
    tintColor: 'rgba(255, 255, 255, 0.8)',
  },
  scanLine: {
    position: 'absolute',
    height: 2,
    width: '100%',
    backgroundColor: '#4FC3F7',
    opacity: 0.7,
  },
  cameraButton: {
    alignSelf: 'center',
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: 'transparent',
    borderWidth: 3,
    borderColor: '#000',
    marginTop: 60,
    justifyContent: 'center',
    alignItems: 'center',
  },
  cameraButtonInner: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: 'transparent',
    borderWidth: 2,
    borderColor: '#000',
    justifyContent: 'center',
    alignItems: 'center',
  },
  cameraButtonInnermost: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#000',
  },
  loadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    zIndex: 20,
  },
  loadingText: {
    marginTop: 10,
    fontSize: 18,
    color: '#fff',
  },
});