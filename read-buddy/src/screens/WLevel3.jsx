import storage from '@react-native-firebase/storage';
import React, { useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, Alert } from 'react-native';
import SoundPlayer from 'react-native-sound-player';
import SignatureScreen from 'react-native-signature-canvas';

export default function WLevel3({ navigation }) {  

  const signatureRef = useRef(null);

  const playAudio = () => {
    try {
      SoundPlayer.playSoundFile('sample_sound', 'mp3');
    } catch (e) {
      console.log('Error playing sound file', e);
    }
  };

  const clearCanvas = () => {
    console.log('Clear button pressed');
    if (signatureRef.current) {
      signatureRef.current.clearSignature();
      console.log('Clear signature called');
    } else {
      console.log('Signature ref is not ready');
    }
  };

  const submitCanvas = () => {
    console.log('Submit button pressed');
    if (signatureRef.current) {
      signatureRef.current.readSignature(); // Triggers onOK with base64
    } else {
      console.log('Signature ref is not ready');
    }
  };

  const uploadSignature = async (base64Data) => {
    try {
      if (!base64Data || base64Data.length < 50) {
        console.log('Invalid or empty base64 data:', base64Data);
        Alert.alert('Error', 'Please draw something before submitting');
        return;
      }
      console.log('Base64 Data:', base64Data);
      const base64String = base64Data.replace(/^data:image\/\w+;base64,/, '');
      console.log('Processed Base64:', base64String);
  
      const storageRef = storage().ref('screenshots/my-screenshot.jpg');
      console.log('Storage Reference:', storageRef); // Log the ref
      console.log('Uploading to:', storageRef.fullPath);
      await storageRef.putString(base64String, 'base64', { contentType: 'image/jpeg' });
      console.log('Upload complete');
      Alert.alert('Success', 'Signature uploaded to Firebase');
    } catch (error) {
      console.error('Error uploading signature:', error);
      Alert.alert('Error', 'Failed to upload signature');
    }
  };

  const webStyle = `
    .m-signature-pad { width: 100%; height: 100%; margin: 0; padding: 0; }
    .m-signature-pad--body { border: none; width: 100%; height: 100%; }
    canvas { width: 100%; height: 100%; background-color: white; }
  `;

  return (
    <View style={styles.container}>
      <View style={styles.insContainer}>
        <Text style={styles.insTxt}>Click here for instructions : </Text>
        <TouchableOpacity onPress={playAudio}>
          <Text style={styles.speakBtnTxt}>
            <Image source={require('../assets/speaker0.png')} style={styles.speakBtnIcon} />
          </Text>
        </TouchableOpacity>
      </View>
      

      <View style={{ width: '100%', height: 300, backgroundColor: '#f0f0f0' }}>
        <SignatureScreen
          ref={signatureRef}
          webStyle={webStyle}
          onOK={uploadSignature} // Handle base64 directly
          onEmpty={() => console.log('Signature is empty')}
          onBegin={() => console.log('Drawing started')}
          onEnd={() => console.log('Drawing ended')}
        />
      </View>

      <View style={styles.fixToText}>
        <TouchableOpacity onPress={submitCanvas}>
          <Text style={styles.positiveBtn}>Submit</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={clearCanvas}>
          <Text style={styles.negativeBtn}>Clear</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center' },  

    btnIcon: { width: 30, height: 30, marginRight: 10 },

    insContainer: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      textAlign: 'center',
      alignItems: 'center',
      borderWidth: 1,
      borderColor:'#27ac1f',
      padding:18,
      gap: 15,
      marginBottom: 10,
      },

    insTxt : {
      fontSize: 23,
      fontWeight: 600,
      color:'#27ac1f'
    },

    speakBtnIcon: { width: 50, height: 50, marginRight: 10 },

    speakBtnTxt: {
      fontSize: 15,
      fontWeight: 600,
      color: '#12181e',   
      padding: 10,
      // margin: 5,
      backgroundColor: '#85fe78',
      borderRadius: 35,
    },

    fixToText: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      gap: 70,
      marginTop:15
    },

    positiveBtn:{fontSize: 20,
      fontWeight: 600,
      color: '#12181e',   
      padding: 10,
      margin: 5,
      backgroundColor: '#85fe78',
      borderRadius: 10,
    },
    negativeBtn:{fontSize: 20,
      fontWeight: 600,
      color: '#12181e',   
      padding: 10,
      margin: 5,
      backgroundColor: '#bcbcbc',
      borderRadius: 10,
    }
});
