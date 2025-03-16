import storage from '@react-native-firebase/storage';
import React, { useRef, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  Alert,
  ActivityIndicator,
  ImageBackground,
} from 'react-native';
import SignatureScreen from 'react-native-signature-canvas';
import Tts from 'react-native-tts';
import Video from 'react-native-video';
import numbersData from '../data/numbers.json';
import { myurl } from '../data/url';

export default function WLevel2({ navigation }) {
  const signatureRef = useRef(null);

  const [modelResul, setModelResul] = useState(false);
  const [currentNum, setCurrentNum] = useState(null);
  const [videoUrl, setVideoUrl] = useState(null);
  const [loading, setLoading] = useState(false);

  

  const playAudio = () => {
    try {
      const randomIndex = Math.floor(Math.random() * numbersData.length);
      const selectedNum = numbersData[randomIndex];
      setCurrentNum(selectedNum);

      Tts.setDefaultLanguage('en-US');
      Tts.setDefaultRate(0.3);
      Tts.speak(selectedNum.num);
      console.log(`TTS: Speaking "${selectedNum.num}"`);
    } catch (e) {
      console.log('Error with TTS:', e);
      Alert.alert('Error', 'Failed to speak');
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
      setLoading(true);
      signatureRef.current.readSignature();
    } else {
      console.log('Signature ref is not ready');
    }
  };

  const click =() =>{
    console.log(currentNum.number)
    const fetchData = async () => {
      // setIsLoading(true);
      try {
        const response = await fetch(myurl+'/numbers', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ number: currentNum.number }),          
        });

        const data = await response.json();
        setModelResul(data["res"]);
      } catch (error) {
        console.error('Error:', error);
      } finally {
        // setIsLoading(false);
      }
    };

    fetchData();
  }

  const uploadSignature = async (base64Data) => {
    try {
      if (!base64Data || base64Data.length < 50) {
        console.log('Invalid or empty base64 data:', base64Data);
        Alert.alert('Error', 'Please draw something before submitting');
        setLoading(false);
        return;
      }
      console.log('Base64 Data:', base64Data.substring(0, 50) + '...');
      const base64String = base64Data.replace(/^data:image\/\w+;base64,/, '');
      console.log('Processed Base64:', base64String.substring(0, 50) + '...');

      const storageRef = storage().ref('numberscreenshots/my-screenshot.jpg');
      console.log('Uploading to:', storageRef.fullPath);
      await storageRef.putString(base64String, 'base64', { contentType: 'image/jpeg' });
      console.log('Upload complete');

      clearCanvas();
      click();

      if (modelResul === false && currentNum) {
        const videoRef = storage().ref(currentNum.answer);
        const url = await videoRef.getDownloadURL();
        console.log('Video URL fetched:', url);
        setVideoUrl(url);
        setLoading(false);
      } else if (modelResul === true) {
        Alert.alert('Success', 'Your Answer is correct');
        setLoading(false);
        // playAudio();
      }
    } catch (error) {
      console.error('Error uploading signature:', error);
      Alert.alert('Error', 'Failed to upload signature');
      setLoading(false);
    }
  };

  const webStyle = `
    .m-signature-pad { width: 100%; height: 100%; margin: 0; padding: 0;  }
    .m-signature-pad--body { border: none; width: 100%; height: 100%; }
    canvas { width: 100%; height: 100%; }
  `;

  return (
    <View style={styles.container}>
      {!videoUrl && (
        <View style={styles.insContainer}>
          <View>
            <Text style={styles.insTxt}>Click here to Listen the</Text>
            <Text style={styles.insTxt}>Number & write it below :</Text>
          </View>
          <TouchableOpacity onPress={playAudio}>
            <Text style={styles.speakBtnTxt}>
              <Image source={require('../assets/speaker0.png')} style={styles.speakBtnIcon} />
            </Text>
          </TouchableOpacity>
        </View>
      )}

      {!videoUrl && (
        // <ImageBackground
        //   source={require('../assets/kite.jpg')} // Replace with your desired background image
        //   style={styles.canvasContainer}
        //   resizeMode="cover"
        // >
        <View style={styles.canvasContainer}>
          <SignatureScreen
            ref={signatureRef}
            webStyle={webStyle}
            bgHeight={"100%"}
            bgWidth={"100%"}
            // imageType={'image/jpeg'}
            bgSrc={"https://i.ibb.co/8g7jnFF5/numbg.png"}
            onOK={uploadSignature}
            onEmpty={() => console.log('Signature is empty')}
            onBegin={() => console.log('Drawing started')}
            onEnd={() => console.log('Drawing ended')}
          />
          </View>
        // </ImageBackground>
      )}

      {videoUrl && (
        <View style={styles.videoContainer}>
          <Text style={styles.videoTxt}>Nice Try! Here is the correct answer</Text>
          <Video
            source={{ uri: videoUrl }}
            style={styles.video}
            controls={true}
            resizeMode="contain"
            onLoad={() => console.log('Video loaded')}
            onEnd={() => {
              console.log('Video ended');
              setVideoUrl(null);
            }}
            onError={(e) => {
              console.log('Video error:', e.error);
              Alert.alert('Error', 'Failed to play video');
              setVideoUrl(null);
            }}
          />
        </View>
      )}

      {!videoUrl && (
        <View style={styles.fixToText}>
          <TouchableOpacity onPress={submitCanvas} disabled={loading}>
            <Text style={styles.positiveBtn}>Submit</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={clearCanvas} disabled={loading}>
            <Text style={styles.negativeBtn}>Clear</Text>
          </TouchableOpacity>
        </View>
      )}

      {loading && (
        <View style={styles.loadingOverlay}>
          <ActivityIndicator size="large" color="#27ac1f" />
          <Text style={styles.loadingText}>Uploading...</Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    backgroundColor: '#fff',
    justifyContent: 'center',
  },
  insContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#27ac1f',
    padding: 18,
    gap: 15,
    marginBottom: 10,
    width: '90%',
  },
  insTxt: {
    fontSize: 23,
    fontWeight: '600',
    color: '#27ac1f',
  },
  speakBtnIcon: {
    width: 50,
    height: 50,
    marginRight: 10,
  },
  speakBtnTxt: {
    fontSize: 15,
    fontWeight: '600',
    color: '#12181e',
    padding: 10,
    backgroundColor: '#85fe78',
    borderRadius: 35,
  },
  canvasContainer: {
    width: '90%',
    height: 300,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#000',
    borderRadius: 10,
    overflow: 'hidden', // Ensure the image doesn’t bleed outside
  },
  videoContainer: {
    width: '90%',
    height: 400,
    backgroundColor: '#000',
    marginBottom: 10,
    borderRadius: 10,
  },
  video: {
    width: '100%',
    height: '100%',
  },
  videoTxt: {
    fontSize: 23,
    fontWeight: '600',
    color: '#27ac1f',
    textAlign: 'center',
  },
  fixToText: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 70,
    marginTop: 15,
    width: '90%',
  },
  positiveBtn: {
    fontSize: 20,
    fontWeight: '600',
    color: '#12181e',
    padding: 10,
    margin: 5,
    backgroundColor: '#85fe78',
    borderRadius: 10,
  },
  negativeBtn: {
    fontSize: 20,
    fontWeight: '600',
    color: '#12181e',
    padding: 10,
    margin: 5,
    backgroundColor: '#bcbcbc',
    borderRadius: 10,
  },
  loadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 10,
  },
  loadingText: {
    color: '#fff',
    fontSize: 18,
    marginTop: 10,
  },
});