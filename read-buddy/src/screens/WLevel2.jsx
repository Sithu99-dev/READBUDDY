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
import { myurl, numberDetector } from '../data/url';

export default function WLevel2({ navigation }) {
  const signatureRef = useRef(null);

  const [modelResul, setModelResul] = useState(false);
  const [currentNum, setCurrentNum] = useState(null);
  const [videoUrl, setVideoUrl] = useState(null);
  const [loading, setLoading] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  

  const playAudio = () => {
    try {
      const randomIndex = Math.floor(Math.random() * numbersData.length);
      const selectedNum = numbersData[randomIndex];
      setCurrentNum(selectedNum);

      Tts.setDefaultLanguage('en-US');
      Tts.setDefaultRate(0.3);
      Tts.speak(selectedNum.num);
      // console.log(TTS: Speaking "${selectedNum.num}");
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

  const uploadSignature = async (img) => {
    try {
      if (!img || img.length < 50) {
        console.log('Invalid or empty image data:', img);
        Alert.alert('Error', 'Please draw something before submitting');
        setLoading(false);
        return;
      }
      console.log('Image Data:', img.substring(0, 50) + '...');
      
      // Convert base64 to blob for form data
      
      // Create form data
      const formData = new FormData();
      formData.append('image', {
        uri: img,
        type: 'image/png',
        name: 'signature.png',
      });
      formData.append('expected_digit', currentNum.number.toString());

      // Send the image to prediction API
      try {
        const response = await fetch(numberDetector + '/predict', {
          method: 'POST',
          headers: {
            'Content-Type': 'multipart/form-data',
          },
          body: formData,
        });

        const predictionData = await response.json();
        console.log('Prediction response:', predictionData);
        
        // Get is_correct value from the response
        const isCorrect = predictionData.is_correct;
        
        // Update the model result state
        setModelResul(isCorrect);
        
        clearCanvas();
        
        // Handle the result immediately (don't rely on state update)
        if (!isCorrect && currentNum) {
          const videoRef = storage().ref(currentNum.answer);
          const url = await videoRef.getDownloadURL();
          console.log('Video URL fetched:', url);
          setVideoUrl(url);
          setLoading(false);
        } else if (isCorrect) {
          setLoading(false);
          setShowSuccess(true);
          // Hide success screen and play audio after 3 seconds
          setTimeout(() => {
            setShowSuccess(false);
            playAudio();
          }, 3000);
        }
      } catch (error) {
        console.error('Error predicting digit:', error);
        Alert.alert('Error', 'Failed to process your drawing');
        setLoading(false);
      }
    } catch (error) {
      console.error('Error uploading signature:', error);
      Alert.alert('Error', 'Failed to upload signature');
      setLoading(false);
    }
  };

  // const uploadSignature = async (base64Data) => {
  //   try {
  //     if (!base64Data || base64Data.length < 50) {
  //       console.log('Invalid or empty base64 data:', base64Data);
  //       Alert.alert('Error', 'Please draw something before submitting');
  //       setLoading(false);
  //       return;
  //     }
  //     console.log('Base64 Data:', base64Data.substring(0, 50) + '...');
  //     const base64String = base64Data.replace(/^data:image\/\w+;base64,/, '');
  //     console.log('Processed Base64:', base64String.substring(0, 50) + '...');

  //     // Send the image to prediction API
  //     try {
  //       const response = await fetch(numberDetector + '/predict_base64', {
  //         method: 'POST',
  //         headers: {
  //           'Content-Type': 'application/json',
  //         },
  //         body: JSON.stringify({
  //           image: base64String,
  //           expected_digit: currentNum.number
  //         }),
  //       });

  //       const predictionData = await response.json();
  //       console.log('Prediction response:', predictionData);
        
  //       // Get is_correct value from the response
  //       const isCorrect = predictionData.is_correct;
        
  //       // Update the model result state
  //       setModelResul(isCorrect);
        
  //       clearCanvas();
        
  //       // Handle the result immediately (don't rely on state update)
  //       if (!isCorrect && currentNum) {
  //         const videoRef = storage().ref(currentNum.answer);
  //         const url = await videoRef.getDownloadURL();
  //         console.log('Video URL fetched:', url);
  //         setVideoUrl(url);
  //         setLoading(false);
  //       } else if (isCorrect) {
  //         Alert.alert('Success', 'Your Answer is correct');
  //         setLoading(false);
  //         // playAudio();
  //       }
  //     } catch (error) {
  //       console.error('Error predicting digit:', error);
  //       Alert.alert('Error', 'Failed to process your drawing');
  //       setLoading(false);
  //     }
  //   } catch (error) {
  //     console.error('Error uploading signature:', error);
  //     Alert.alert('Error', 'Failed to upload signature');
  //     setLoading(false);
  //   }
  // };

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
            imageType={'image/png'}
            dataURL={''}
            penColor={'black'}
            backgroundColor={'white'}
            dotSize={2}
            minWidth={2}
            maxWidth={4}
            imageFormat={'image/png'}
            imageQuality={1.0}
            // bgSrc={"https://i.ibb.co/8g7jnFF5/numbg.png"}
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

      {showSuccess && (
        <View style={styles.successContainer}>
          <Image source={{ uri: 'https://cdn-icons-png.flaticon.com/512/190/190411.png' }} style={styles.successIcon} />
          <Text style={styles.successTitle}>Excellent!</Text>
          <Text style={styles.successMessage}>Your answer is correct!</Text>
          <View style={styles.successStars}>
            <Text style={styles.star}>⭐</Text>
            <Text style={styles.star}>⭐</Text>
            <Text style={styles.star}>⭐</Text>
          </View>
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
    overflow: 'hidden', // Ensure the image doesn't bleed outside
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
  successContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(39, 172, 31, 0.95)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 20,
  },
  successIcon: {
    width: 120,
    height: 120,
    marginBottom: 20,
  },
  successTitle: {
    fontSize: 36,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 10,
    textAlign: 'center',
  },
  successMessage: {
    fontSize: 24,
    color: '#fff',
    marginBottom: 20,
    textAlign: 'center',
  },
  successStars: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  star: {
    fontSize: 40,
    marginHorizontal: 5,
  },
});