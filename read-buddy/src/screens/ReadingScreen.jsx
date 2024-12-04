import React, { useState, useRef, useEffect } from 'react';
import { View, Text, Modal, Image, TouchableOpacity, StyleSheet, PermissionsAndroid, Platform } from 'react-native';

export default function ReadingScreen({ navigation }) {
  const [isModalVisible, setModalVisible] = useState(false);
  const [photo, setPhoto] = useState(null);
  const cameraRef = useRef(null);
  const [cameraAuthorized, setCameraAuthorized] = useState(false);

  useEffect(() => {
    // const requestCameraPermission = async () => {
    //   if (Platform.OS === 'android') {
    //     const granted = await PermissionsAndroid.request(
    //       PermissionsAndroid.PERMISSIONS.CAMERA,
    //       {
    //         title: 'Camera Permission',
    //         message: 'This app needs access to your camera to take pictures.',
    //         buttonNeutral: 'Ask Me Later',
    //         buttonNegative: 'Cancel',
    //         buttonPositive: 'OK',
    //       },
    //     );
    //     setCameraAuthorized(granted === PermissionsAndroid.RESULTS.GRANTED);
    //   } else {
    //     setCameraAuthorized(true); // iOS permissions are handled automatically
    //   }
    // };

    // requestCameraPermission();
  }, []);

  const openCamera = async () => {
    if (cameraRef.current) {
    //   const options = { quality: 0.5, base64: true };
    //   const data = await cameraRef.current.takePictureAsync(options);
    //   setPhoto({ uri: data.uri });
    //   setModalVisible(true);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.instruction}>Take a clear picture of your document.</Text>

      <View style={styles.cameraContainer}>
        {cameraAuthorized ? (
        <Text>Camera ready</Text>
        ) : (
        <Text>Camera not authorized</Text>
        )}
      </View>

      <TouchableOpacity style={styles.cameraButton} onPress={openCamera}>
        <Text style={styles.cameraIcon}>📷</Text>
      </TouchableOpacity>

      <Modal visible={isModalVisible} transparent={false} animationType="slide">
        <View style={styles.modalContainer}>
          {photo && <Image source={photo} style={styles.photo} />}

          <View style={styles.fixToText}>
            <TouchableOpacity onPress={() => { setModalVisible(false); navigation.navigate('Scanned Text'); }} >
              <Text style={styles.positiveBtn}>Scan the Text</Text>
            </TouchableOpacity>

            <TouchableOpacity onPress={() => setModalVisible(false)} >
              <Text style={styles.negativeBtn}>Retake</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center', position: 'relative' },
  instruction: { fontSize: 23, fontWeight: '600', margin: 20, padding: 18, borderColor: '#27ac1f', borderWidth: 1, color: '#27ac1f' },
  cameraContainer: { width: '100%', height: 400, marginVertical: 20 },
  camera: { flex: 1, justifyContent: 'flex-end', alignItems: 'center' },
  cameraButton: { backgroundColor: '#85fe78', padding: 20, borderRadius: 80 },
  cameraIcon: { fontSize: 40, color: 'white', padding: 20 },
  modalContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  photo: { width: 200, height: 300, marginBottom: 20 },
  fixToText: { flexDirection: 'row', justifyContent: 'space-between', gap: 50 },
  positiveBtn: { fontSize: 20, fontWeight: '600', color: '#12181e', padding: 10, margin: 5, backgroundColor: '#85fe78', borderRadius: 10 },
  negativeBtn: { fontSize: 20, fontWeight: '600', color: '#12181e', padding: 10, margin: 5, backgroundColor: '#bcbcbc', borderRadius: 10 }
});
