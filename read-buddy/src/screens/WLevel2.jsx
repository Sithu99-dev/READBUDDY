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
  SafeAreaView,
  Dimensions,
} from 'react-native';
import SignatureScreen from 'react-native-signature-canvas';
import LinearGradient from 'react-native-linear-gradient';
import Tts from 'react-native-tts';
import Video from 'react-native-video';
import numbersData from '../data/numbers.json';
import { myurl } from '../data/url';
import { useNavigation } from '@react-navigation/native';

export default function WLevel2({ navigation }) {
  const signatureRef = useRef(null);

  const [modelResul, setModelResul] = useState(false);
  const [currentNum, setCurrentNum] = useState(numbersData[0]);
  const [videoUrl, setVideoUrl] = useState(null);
  const [loading, setLoading] = useState(false);
  const [showGrid, setShowGrid] = useState(true);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [successScreen, setSuccessScreen] = useState(false);
  const nav = useNavigation();

  const goBack = () => {
    nav.goBack();
  };

  const playAudio = () => {
    try {
      console.log(currentIndex)
      const selectedNum = numbersData[currentIndex];
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

  const click = async () =>{
    console.log('==================================');
    console.log(currentNum.number);
    const fetchData = async () => {
      // setIsLoading(true);
      try {
        console.log(`Calling ${myurl}/numbers`);
        const response = await fetch(myurl + '/numbers', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ number: currentNum.number }),
        });

        const data = await response.json();
        console.log(`Model result ${JSON.stringify(data)}`);
        setModelResul(data.res);
        return data.res;
      } catch (error) {
        console.error('Error:', error);
        throw new Error(`${error}`);
      } finally {
        // setIsLoading(false);r
      }
    };

    return await fetchData();
  };

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
      let res = await click();
      console.log(`Model result ${res}`);

      if (res === false && currentNum) {
        const videoRef = storage().ref(currentNum.answer);
        const url = await videoRef.getDownloadURL();
        console.log('Video URL fetched:', url);
        setVideoUrl(url);
        setLoading(false);
      } else if (res === true) {
        Alert.alert('Success', 'Your Answer is correct');
        setLoading(false);
        if(currentIndex < 9) {
          var index = currentIndex + 1;
          console.log(`Current index ${index}`);
          setCurrentIndex(index);
        }else {
          setCurrentIndex(0);
          setSuccessScreen(true);
        }

        // playAudio();
      }
    } catch (error) {
      console.error('Error : ', error);
      Alert.alert('Error', 'Failed to upload signature');
      setLoading(false);
    }
  };

  // Toggle the grid visibility
  const toggleGrid = () => {
    setShowGrid(!showGrid);
  };

  // Create a grid canvas style with CSS
  const createWebStyle = () => {
    const gridSize = 20; // Size of each grid cell in pixels
    const gridColor = '#E0E0E0'; // Light gray grid lines

    const baseStyle = `
      .m-signature-pad { width: 100%; height: 100%; margin: 0; padding: 0; }
      .m-signature-pad--body { border: none; width: 100%; height: 100%; }
      canvas { width: 100%; height: 100%; background-color: white; }
      .m-signature-pad--footer { display: none; }
      body { margin: 0; }
    `;

    // Only add grid if showGrid is true
    const gridStyle = showGrid ? `
      canvas { 
        background-size: ${gridSize}px ${gridSize}px;
        background-image:
          linear-gradient(to right, ${gridColor} 1px, transparent 1px),
          linear-gradient(to bottom, ${gridColor} 1px, transparent 1px);
      }
    ` : '';

    return baseStyle + gridStyle;
  };

  if(successScreen) {
    return (
      <View style={styles.container}>
         <View>
          <Text style={styles.insTxt}>All the Numbers Completed</Text>
          <TouchableOpacity onPress={goBack} disabled={loading}>
            <Text style={styles.negativeBtn}>Go Back</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }
  return (
    <ImageBackground source={require('../assets/sp.png')} style={styles.background} imageStyle={{opacity: 0.3}}>
      <SafeAreaView style={styles.container}>
        {!videoUrl && (
          <>
            <View style={styles.instructionCard}>
              <View style={styles.instructionContentContainer}>
              <Text style={styles.instructionText}>
              Write the number on the grid. You can also remove the grid if you prefer.
                </Text>
                <Text style={styles.instructionText}>
                  Click here to Listen the Number.
                </Text>
                <TouchableOpacity onPress={playAudio} style={styles.speakerButton}>
                  <Image source={require('../assets/speaker0.png')} style={styles.speakerIcon} />
                </TouchableOpacity>
              </View>
            </View>

            <View style={styles.signatureCardContainer}>
              <View style={styles.signatureCard}>
                <View style={styles.canvasContainer}>
                  <SignatureScreen
                    ref={signatureRef}
                    webStyle={createWebStyle()}
                    onOK={uploadSignature}
                    onEmpty={() => console.log('Signature is empty')}
                    onBegin={() => console.log('Drawing started')}
                    onEnd={() => console.log('Drawing ended')}
                  />
                </View>

                {/* Grid Toggle Button */}
                <TouchableOpacity
                  style={styles.gridToggleButton}
                  onPress={toggleGrid}
                >
                  <Text style={styles.gridToggleText}>
                    {showGrid ? 'Hide Grid' : 'Show Grid'}
                  </Text>
                </TouchableOpacity>

                {/* Action buttons at the bottom of the white card */}
                <View style={styles.actionButtonsContainer}>
                  <TouchableOpacity
                    style={styles.actionButton}
                    onPress={clearCanvas}
                    disabled={loading}
                  >
                    <Text style={styles.actionButtonText}>CLEAR</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={styles.actionButton}
                    onPress={submitCanvas}
                    disabled={loading}
                  >
                    <Text style={styles.actionButtonText}>NEXT</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          </>
        )}

        {videoUrl && (
          <View style={styles.mainContainer}>
            <View style={styles.feedbackContainer}>
              <Text style={styles.feedbackText}>
                Nice Try! Here is the correct answer
              </Text>
              <Image
                source={require('../assets/mascot.png')}
                style={styles.mascotImage}
              />
            </View>

            <View style={styles.videoContainer}>

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

            <TouchableOpacity
              onPress={() => setVideoUrl(null)}
              style={styles.buttonTouchable}
            >
              <LinearGradient
                style={styles.nextButton}
                colors={['#03cdc0', '#7e34de']} // Blue to purple gradient
                start={{x: 0, y: 0}}
                end={{x: 1, y: 0}}
              >
                <Text style={styles.nextButtonText}>TRY AGAIN</Text>
              </LinearGradient>
            </TouchableOpacity>
          </View>
        )}

        {loading && (
          <View style={styles.loadingOverlay}>
            <ActivityIndicator size="large" color="#4e9ede" />
            <Text style={styles.loadingText}>Uploading...</Text>
          </View>
        )}
      </SafeAreaView>
    </ImageBackground>
  );
}

const { width, height } = Dimensions.get('window');

const styles = StyleSheet.create({
  background: {
    flex: 1,
    width: '100%',
  },
  container: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 20,
    paddingHorizontal: 15,
  },
  mainContainer: {
    flex: 1,
    width: '100%',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 10,
  },
  feedbackContainer: {
    width: '100%',
    height: height * 0.3,
    backgroundColor: 'rgba(151, 216, 196, 0.8)',
    borderRadius: 15,
    borderWidth: 2,
    borderColor: '#fff',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    marginBottom: 5,
    position: 'relative',
  },
  feedbackText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'navy',
    textAlign: 'center',
    flex: 1,
  },
  mascotImage: {
    width: 100,
    height: 180,
    resizeMode: 'contain',
  },
  videoContainer: {
    width: '100%',
    height: height * 0.4,
    backgroundColor: 'rgba(151, 216, 196, 0.5)',
    borderRadius: 15,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
    position: 'relative',
  },
  videoLabel: {
    position: 'absolute',
    bottom: 20,
    fontSize: 48,
    fontWeight: 'bold',
    color: 'rgba(77, 122, 111, 0.7)',
    textAlign: 'center',
  },
  video: {
    width: '100%',
    height: '90%',
    borderRadius: 15,
  },
  buttonTouchable: {
    width: '80%',
    overflow: 'hidden',
    borderRadius: 30,
    marginBottom: 20,
  },
  nextButton: {
    paddingVertical: 15,
    borderRadius: 30,
    width: '100%',
    alignItems: 'center',
  },
  nextButtonText: {
    color: 'white',
    fontSize: 22,
    fontWeight: 'bold',
  },
  instructionCard: {
    width: '100%',
    backgroundColor: 'rgba(151, 216, 196, 0.9)',
    borderRadius: 15,
    padding: 20,
    alignItems: 'center',
    marginBottom: 15,
  },
  instructionContentContainer: {
    width: '100%',
    alignItems: 'center',
  },
  instructionText: {
    fontSize: 20,
    color: 'black',
    fontWeight: '600',
    marginBottom: 15,
    textAlign: 'center',
  },
  speakerButton: {
    backgroundColor: '#4e9ede',
    width: 70,
    height: 70,
    borderRadius: 35,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 5,
  },
  speakerIcon: {
    width: 40,
    height: 40,
    tintColor: 'white',
  },
  signatureCardContainer: {
    width: '100%',
    flex: 1,
    marginVertical: 10,
  },
  signatureCard: {
    width: '100%',
    height: '100%',
    backgroundColor: 'white',
    borderRadius: 15,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    justifyContent: 'space-between',
  },
  canvasContainer: {
    flex: 1,
    width: '100%',
    backgroundColor: 'white',
  },
  gridToggleButton: {
    position: 'absolute',
    top: 10,
    right: 10,
    backgroundColor: 'rgba(78, 158, 222, 0.8)',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 15,
    zIndex: 10,
  },
  gridToggleText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  actionButtonsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 15,
    paddingHorizontal: 15,
    backgroundColor: 'white',
    marginBottom: 20,
  },
  actionButton: {
    backgroundColor: '#4e9ede',
    paddingVertical: 15,
    paddingHorizontal: 20,
    borderRadius: 30,
    width: '48%',
    alignItems: 'center',
    marginBottom: 30,
  },
  actionButtonText: {
    color: 'white',
    fontSize: 24,
    fontWeight: 'bold',

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
