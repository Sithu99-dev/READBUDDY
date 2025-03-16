// import storage from '@react-native-firebase/storage';
// import React, { useRef, useState, useEffect } from 'react';
// import {
//   View,
//   Text,
//   StyleSheet,
//   TouchableOpacity,
//   Image,
//   Alert,
//   ActivityIndicator,
// } from 'react-native';
// import SignatureScreen from 'react-native-signature-canvas';
// import Tts from 'react-native-tts';
// import Video from 'react-native-video';
// import writingWordsData from '../data/writing_words.json';
// import lettersData from '../data/letters.json';
// import { myurl } from '../data/url';

// export default function WLevel1({ navigation, route }) {
//   const signatureRef = useRef(null);
//   const level = route.params?.level || 1;
//   const [modelResult, setModelResult] = useState([]); // Current word result
//   const [allResults, setAllResults] = useState([]); // Results for all 5 words
//   const [currentWord, setCurrentWord] = useState(null);
//   const [wordList, setWordList] = useState([]); // 5 selected words
//   const [currentWordIndex, setCurrentWordIndex] = useState(0); // Index in wordList
//   const [currentLetterIndex, setCurrentLetterIndex] = useState(0);
//   const [videoUrl, setVideoUrl] = useState(null);
//   const [loading, setLoading] = useState(false);
//   const [videoQueue, setVideoQueue] = useState([]);

//   const levelWords = writingWordsData.filter((word) => word.level === String(level));

//   const click =() =>{
//     const fetchData = async () => {
//       // setIsLoading(true);
//       try {
//         const response = await fetch(myurl+'/words', {
//           method: 'POST',
//           headers: {
//             'Content-Type': 'application/json',
//           },
//           body: JSON.stringify({ word: currentWord.word }),
//         });

//         const data = await response.json();
//         setModelResult(data["res"]);
//       } catch (error) {
//         console.error('Error:', error);
//       } finally {
//         // setIsLoading(false);
//       }
//     };

//     fetchData();
//   }

//   useEffect(() => {
//     resetLevel();
//   }, [level]);

//   const capitalizeFirstLetter = (word) => {
//     if (!word) return '';
//     return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
//   };

//   const selectFiveWords = () => {
//     const shuffled = [...levelWords].sort(() => 0.5 - Math.random());
//     const selected = shuffled.slice(0, Math.min(5, levelWords.length)).map((word) => ({
//       ...word,
//       word: capitalizeFirstLetter(word.word),
//     }));
//     return selected;
//   };

//   const resetLevel = () => {
//     const newWordList = selectFiveWords();
//     setWordList(newWordList);
//     setCurrentWord(newWordList[0]);
//     setCurrentWordIndex(0);
//     setCurrentLetterIndex(0);
//     setModelResult([]);
//     setAllResults([]);
//     setVideoUrl(null);
//     setVideoQueue([]);
//   };

//   const moveToNextWord = () => {
//     if (currentWordIndex + 1 < wordList.length) {
//       setCurrentWord(wordList[currentWordIndex + 1]);
//       setCurrentWordIndex(currentWordIndex + 1);
//       setCurrentLetterIndex(0);
//       setModelResult([]);
//       setVideoUrl(null);
//       setVideoQueue([]);
//     } else {
//       checkLevelCompletion();
//     }
//   };

//   const checkLevelCompletion = () => {
//     const allCorrect = allResults.every((result) => result.every((res) => res === true));
//     if (allCorrect) {
//       Alert.alert(
//         'Congratulations!',
//         `You've completed Level ${level} perfectly!`,
//         [
//           { text: 'Back to Levels', onPress: () => navigation.goBack() },
//         ]
//       );
//     } else {
//       Alert.alert(
//         'Keep Going!',
//         'Some answers were incorrect. Try this level again to improve!',
//         [
//           { text: 'Try Again', onPress: () => resetLevel() },
//           { text: 'Back to Levels', onPress: () => navigation.goBack() },
//         ]
//       );
//     }
//   };

//   const playAudio = () => {
//     try {
//       if (currentWord) {
//         Tts.setDefaultLanguage('en-US');
//         Tts.setDefaultRate(0.3);
//         Tts.speak(currentWord.word);
//         console.log(`TTS: Speaking "${currentWord.word}"`);
//       }
//     } catch (e) {
//       console.log('Error with TTS:', e);
//       Alert.alert('Error', 'Failed to speak');
//     }
//   };

//   const clearCanvas = () => {
//     console.log('Clear button pressed');
//     if (signatureRef.current) {
//       signatureRef.current.clearSignature();
//       console.log('Clear signature called');
//     } else {
//       console.log('Signature ref is not ready');
//     }
//   };

//   const nextLetter = () => {
//     console.log('Next button pressed');
//     if (signatureRef.current) {
//       setLoading(true);
//       signatureRef.current.readSignature();
//     } else {
//       console.log('Signature ref is not ready');
//     }
//   };

//   const submitWord = () => {
//     console.log('Submit button pressed');
//     if (signatureRef.current) {
//       setLoading(true);
//       signatureRef.current.readSignature();
      
//     } else {
//       console.log('Signature ref is not ready');
//     }
//   };

//   const uploadSignature = async (base64Data) => {
//     try {
//       if (!base64Data || base64Data.length < 50) {
//         console.log('Invalid or empty base64 data:', base64Data);
//         Alert.alert('Error', 'Please draw something before submitting');
//         setLoading(false);
//         return;
//       }
//       const base64String = base64Data.replace(/^data:image\/\w+;base64,/, '');
//       const storageRef = storage().ref(`screenshots/img_${currentLetterIndex}.jpg`);
//       await storageRef.putString(base64String, 'base64', { contentType: 'image/jpeg' });
//       console.log(`Uploaded img_${currentLetterIndex}.jpg`);

//       clearCanvas();

//       if (currentLetterIndex < currentWord.word.length - 1) {
//         setCurrentLetterIndex(currentLetterIndex + 1);
//         setLoading(false);
//       } else {
//         const simulatedResult = Array(currentWord.word.length)
//           .fill(null)
//           .map(() => Math.random() > 0.5); // Simulate ML result
        
//         setModelResult(simulatedResult);
//         setAllResults([...allResults, simulatedResult]);
//         setLoading(false);

//         if (simulatedResult.every((res) => res === true)) {
//           moveToNextWord();
//         } else {
//           const incorrectIndices = simulatedResult
//             .map((res, idx) => (res === false ? idx : null))
//             .filter((idx) => idx !== null);
//           const videosToPlay = incorrectIndices.map((idx) => {
//             const letter = currentWord.word[idx];
//             const letterData = lettersData.find((l) => l.letter === letter);
//             return letterData ? letterData.answer : null;
//           }).filter(Boolean);
//           setVideoQueue(videosToPlay);
//           loadFirstVideo(videosToPlay);
//         }
//       }
//     } catch (error) {
//       console.error('Error uploading signature:', error);
//       Alert.alert('Error', 'Failed to upload signature');
//       setLoading(false);
//     }
//   };

//   const loadFirstVideo = async (queue) => {
//     if (queue.length > 0) {
//       const videoPath = queue[0];
//       try {
//         const videoRef = storage().ref(videoPath);
//         const url = await videoRef.getDownloadURL();
//         setVideoUrl(url);
//       } catch (error) {
//         console.error('Error fetching video:', error);
//         Alert.alert('Error', 'Failed to fetch video');
//         setVideoQueue(queue.slice(1));
//         loadFirstVideo(queue.slice(1));
//       }
//     }
//   };

//   const nextVideo = () => {
//     if (videoQueue.length > 0) {
//       const nextQueue = videoQueue.slice(1);
//       setVideoQueue(nextQueue);
//       if (nextQueue.length > 0) {
//         loadFirstVideo(nextQueue);
//       } else {
//         setVideoUrl(null);
//         moveToNextWord();
//       }
//     }
//   };

//   const getOrdinal = (index) => {
//     const n = index + 1;
//     if (n % 10 === 1 && n % 100 !== 11) return `${n}st`;
//     if (n % 10 === 2 && n % 100 !== 12) return `${n}nd`;
//     if (n % 10 === 3 && n % 100 !== 13) return `${n}rd`;
//     return `${n}th`;
//   };

//   const webStyle = `
//     .m-signature-pad { width: 100%; height: 100%; margin: 0; padding: 0; }
//     .m-signature-pad--body { border: none; width: 100%; height: 100%; }
//     canvas { width: 100%; height: 100%; background-color: white; }
//   `;

//   return (
//     <View style={styles.container}>
//       {!videoUrl && (
                
//         <View style={styles.insContainer}>
//           <View style={styles.container2}>
//             <Text style={styles.insTxt}>
//               {/* Write the {getOrdinal(currentLetterIndex)} letter of "{currentWord?.word}"  */}
//               Write the {getOrdinal(currentLetterIndex)} letter of this word 
//             </Text>
//             <Text style={styles.insTxt}>
//               (Word {currentWordIndex + 1}/5)
//             </Text>            
//             <Text style={styles.insTxt2}>
//               Write the word letter-by-letter on the cavas
//             </Text>
//             <Text style={styles.insTxt2}>
//               1st Letter should be in Capital
//             </Text>
//             <Text style={styles.insTxt2}>
//               (eg: Man)
//             </Text>
//           </View>
//           <TouchableOpacity onPress={playAudio} >
//             <Text style={styles.speakBtnTxt}>
//               <Image source={require('../assets/speaker0.png')} style={styles.speakBtnIcon} />
//             </Text>
//           </TouchableOpacity>
          
//         </View>
       
//       )}

//       {!videoUrl && (
//         <View style={styles.canvasContainer}>
//           <SignatureScreen
//             ref={signatureRef}
//             webStyle={webStyle}
//             onOK={uploadSignature}
//             onEmpty={() => console.log('Signature is empty')}
//             onBegin={() => console.log('Drawing started')}
//             onEnd={() => console.log('Drawing ended')}
//           />
//         </View>
//       )}

//       {videoUrl && (
//         <View style={styles.videoContainer}>
//           <Text style={styles.videoTxt}>Nice Try! Here is the correct way to write it</Text>
//           <Video
//             source={{ uri: videoUrl }}
//             style={styles.video}
//             controls={true}
//             resizeMode="contain"
//             onLoad={() => console.log('Video loaded')}
//             onError={(e) => {
//               console.log('Video error:', e.error);
//               Alert.alert('Error', 'Failed to play video');
//               nextVideo();
//             }}
//           />
//           <TouchableOpacity onPress={nextVideo} style={styles.nextVideoBtn}>
//             <Text style={styles.nextVideoBtnText}>Next</Text>
//           </TouchableOpacity>
//         </View>
//       )}

//       {!videoUrl && (
//         <View style={styles.fixToText}>
//           {currentLetterIndex < (currentWord?.word.length - 1 || 0) ? (
//             <TouchableOpacity onPress={nextLetter} disabled={loading}>
//               <Text style={styles.positiveBtn}>Next</Text>
//             </TouchableOpacity>
//           ) : (
//             <TouchableOpacity onPress={submitWord} disabled={loading}>
//               <Text style={styles.positiveBtn}>Submit</Text>
//             </TouchableOpacity>
//           )}
//           <TouchableOpacity onPress={clearCanvas} disabled={loading}>
//             <Text style={styles.negativeBtn}>Clear</Text>
//           </TouchableOpacity>
//         </View>
//       )}

//       {loading && (
//         <View style={styles.loadingOverlay}>
//           <ActivityIndicator size="large" color="#27ac1f" />
//           <Text style={styles.loadingText}>Uploading...</Text>
//         </View>
//       )}
//     </View>
//   );
// }

// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//     alignItems: 'center',
//     backgroundColor: '#fff',
//     justifyContent: 'center',
//   },
//   container2: {
//     alignItems: 'center',
//     justifyContent:'center'
    
//   },
//   insContainer: {
//     flexDirection: 'column',
//     justifyContent: 'space-between',
//     alignItems: 'center',
//     borderWidth: 1,
//     borderColor: '#27ac1f',
//     padding: 18,
//     gap: 15,
//     marginBottom: 10,
//     width: '90%',
//   },
//   insTxt: {
//     fontSize: 23,
//     fontWeight: '600',
//     color: '#27ac1f',
//     textAlign:'center'
//   },

//   insTxt2: {
//     fontSize: 18,
//     fontWeight: '600',
//     color: '#27ac1f',
//   },
//   speakBtnContainer:{
//     flex:1
//   },
//   insTextContainer: {
//     flexDirection: 'column',
//     flex: 2,
//   },
//   speakBtnIcon: {
//     width: 50,
//     height: 50,
//     marginRight: 10,
//   },
//   speakBtnTxt: {
//     fontSize: 15,
//     fontWeight: '600',
//     color: '#12181e',
//     padding: 10,
//     backgroundColor: '#85fe78',
//     borderRadius: 35,
//   },
//   canvasContainer: {
//     width: '90%',
//     height: 300,
//     backgroundColor: '#f0f0f0',
//     borderWidth: 1,
//     borderColor: '#000',
//     marginBottom: 10,
//   },
//   videoContainer: {
//     width: '90%',
//     height: 400,
//     backgroundColor: '#000',
//     marginBottom: 10,
//     alignItems: 'center',
//   },
//   video: {
//     width: '100%',
//     height: '80%',
//   },
//   videoTxt: {
//     fontSize: 23,
//     fontWeight: '600',
//     color: '#27ac1f',
//     textAlign: 'center',
//     marginBottom: 10,
//   },
//   nextVideoBtn: {
//     paddingVertical: 10,
//     paddingHorizontal: 20,
//     backgroundColor: '#85fe78',
//     borderRadius: 10,
//     marginTop: 10,
//   },
//   nextVideoBtnText: {
//     fontSize: 20,
//     fontWeight: '600',
//     color: '#12181e',
//   },
//   fixToText: {
//     flexDirection: 'row',
//     justifyContent: 'space-between',
//     gap: 70,
//     marginTop: 15,
//     width: '90%',
//   },
//   positiveBtn: {
//     fontSize: 20,
//     fontWeight: '600',
//     color: '#12181e',
//     padding: 10,
//     margin: 5,
//     backgroundColor: '#85fe78',
//     borderRadius: 10,
//   },
//   negativeBtn: {
//     fontSize: 20,
//     fontWeight: '600',
//     color: '#12181e',
//     padding: 10,
//     margin: 5,
//     backgroundColor: '#bcbcbc',
//     borderRadius: 10,
//   },
//   loadingOverlay: {
//     ...StyleSheet.absoluteFillObject,
//     backgroundColor: 'rgba(0, 0, 0, 0.5)',
//     justifyContent: 'center',
//     alignItems: 'center',
//     zIndex: 10,
//   },
//   loadingText: {
//     color: '#fff',
//     fontSize: 18,
//     marginTop: 10,
//   },
// });

import storage from '@react-native-firebase/storage';
import React, { useRef, useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  Alert,
  ActivityIndicator,
} from 'react-native';
import SignatureScreen from 'react-native-signature-canvas';
import Tts from 'react-native-tts';
import Video from 'react-native-video';
import writingWordsData from '../data/writing_words.json';
import lettersData from '../data/letters.json';
import { myurl } from '../data/url';

export default function WLevel1({ navigation, route }) {
  const signatureRef = useRef(null);
  const level = route.params?.level || 1;
  const [modelResult, setModelResult] = useState([]); // Current word result (for display if needed)
  const [allResults, setAllResults] = useState([]); // Results for all 5 words
  const [currentWord, setCurrentWord] = useState(null);
  const [wordList, setWordList] = useState([]); // 5 selected words
  const [currentWordIndex, setCurrentWordIndex] = useState(0); // Index in wordList
  const [currentLetterIndex, setCurrentLetterIndex] = useState(0);
  const [videoUrl, setVideoUrl] = useState(null);
  const [loading, setLoading] = useState(false);
  const [videoQueue, setVideoQueue] = useState([]);

  const levelWords = writingWordsData.filter((word) => word.level === String(level));

  const click = async () => {
    try {
      const response = await fetch(myurl + '/words', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ word: currentWord.word }),
      });
      const data = await response.json();
      console.log('API Response:', data);
      // Convert 0/1 to false/true
      const result = data["res"].map((val) => val !== 0);
      return result;
    } catch (error) {
      console.error('Error fetching model result:', error);
      return null;
    }
  };

  useEffect(() => {
    resetLevel();
  }, [level]);

  const capitalizeFirstLetter = (word) => {
    if (!word) return '';
    return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
  };

  const selectFiveWords = () => {
    const shuffled = [...levelWords].sort(() => 0.5 - Math.random());
    const selected = shuffled.slice(0, Math.min(5, levelWords.length)).map((word) => ({
      ...word,
      word: capitalizeFirstLetter(word.word),
    }));
    return selected;
  };

  const resetLevel = () => {
    const newWordList = selectFiveWords();
    setWordList(newWordList);
    setCurrentWord(newWordList[0]);
    setCurrentWordIndex(0);
    setCurrentLetterIndex(0);
    setModelResult([]);
    setAllResults([]);
    setVideoUrl(null);
    setVideoQueue([]);
  };

  const moveToNextWord = () => {
    if (currentWordIndex + 1 < wordList.length) {
      setCurrentWord(wordList[currentWordIndex + 1]);
      setCurrentWordIndex(currentWordIndex + 1);
      setCurrentLetterIndex(0);
      setModelResult([]);
      setVideoUrl(null);
      setVideoQueue([]);
    } else {
      checkLevelCompletion();
    }
  };

  const checkLevelCompletion = () => {
    const allCorrect = allResults.every((result) => result.every((res) => res === true));
    if (allCorrect) {
      Alert.alert(
        'Congratulations!',
        `You've completed Level ${level} perfectly!`,
        [{ text: 'Back to Levels', onPress: () => navigation.goBack() }]
      );
    } else {
      Alert.alert(
        'Keep Going!',
        'Some answers were incorrect. Try this level again to improve!',
        [
          { text: 'Try Again', onPress: () => resetLevel() },
          { text: 'Back to Levels', onPress: () => navigation.goBack() },
        ]
      );
    }
  };

  const playAudio = () => {
    try {
      if (currentWord) {
        Tts.setDefaultLanguage('en-US');
        Tts.setDefaultRate(0.3);
        Tts.speak(currentWord.word);
        console.log(`TTS: Speaking "${currentWord.word}"`);
      }
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

  const nextLetter = () => {
    console.log('Next button pressed');
    if (signatureRef.current) {
      setLoading(true);
      signatureRef.current.readSignature();
    } else {
      console.log('Signature ref is not ready');
    }
  };

  const submitWord = () => {
    console.log('Submit button pressed');
    if (signatureRef.current) {
      setLoading(true);
      signatureRef.current.readSignature();
    } else {
      console.log('Signature ref is not ready');
    }
  };

  const uploadSignature = async (base64Data) => {
    try {
      if (!base64Data || base64Data.length < 50) {
        console.log('Invalid or empty base64 data:', base64Data);
        Alert.alert('Error', 'Please draw something before submitting');
        setLoading(false);
        return;
      }
      const base64String = base64Data.replace(/^data:image\/\w+;base64,/, '');
      const storageRef = storage().ref(`screenshots/img_${currentLetterIndex}.jpg`);
      await storageRef.putString(base64String, 'base64', { contentType: 'image/jpeg' });
      console.log(`Uploaded img_${currentLetterIndex}.jpg`);

      clearCanvas();

      if (currentLetterIndex < currentWord.word.length - 1) {
        setCurrentLetterIndex(currentLetterIndex + 1);
        setLoading(false);
      } else {
        const result = await click();
        console.log('Model Result:', result);
        if (result === null) {
          setLoading(false);
          Alert.alert('Error', 'Failed to get model result. Please try again.');
          return;
        }

        setModelResult(result);
        setAllResults([...allResults, result]);
        setLoading(false);

        if (result.every((res) => res === true)) {
          console.log('All letters correct, moving to next word');
          moveToNextWord();
        } else {
          console.log('Some letters incorrect, queuing videos');
          const incorrectIndices = result
            .map((res, idx) => (res === false ? idx : null))
            .filter((idx) => idx !== null);
          const videosToPlay = incorrectIndices.map((idx) => {
            const letter = currentWord.word[idx];
            const letterData = lettersData.find((l) => l.letter === letter);
            return letterData ? letterData.answer : null;
          }).filter(Boolean);
          console.log('Videos to play:', videosToPlay);

          if (videosToPlay.length > 0) {
            setVideoQueue(videosToPlay);
            loadFirstVideo(videosToPlay);
          } else {
            console.log('No videos available, moving to next word');
            moveToNextWord();
          }
        }
      }
    } catch (error) {
      console.error('Error uploading signature:', error);
      Alert.alert('Error', 'Failed to upload signature');
      setLoading(false);
    }
  };

  const loadFirstVideo = async (queue) => {
    if (queue.length > 0) {
      const videoPath = queue[0];
      try {
        const videoRef = storage().ref(videoPath);
        const url = await videoRef.getDownloadURL();
        setVideoUrl(url);
      } catch (error) {
        console.error('Error fetching video:', error);
        Alert.alert('Error', 'Failed to fetch video');
        setVideoQueue(queue.slice(1));
        loadFirstVideo(queue.slice(1));
      }
    }
  };

  const nextVideo = () => {
    if (videoQueue.length > 0) {
      const nextQueue = videoQueue.slice(1);
      setVideoQueue(nextQueue);
      if (nextQueue.length > 0) {
        loadFirstVideo(nextQueue);
      } else {
        setVideoUrl(null);
        moveToNextWord();
      }
    }
  };

  const getOrdinal = (index) => {
    const n = index + 1;
    if (n % 10 === 1 && n % 100 !== 11) return `${n}st`;
    if (n % 10 === 2 && n % 100 !== 12) return `${n}nd`;
    if (n % 10 === 3 && n % 100 !== 13) return `${n}rd`;
    return `${n}th`;
  };

  const webStyle = `
    .m-signature-pad { width: 100%; height: 100%; margin: 0; padding: 0; }
    .m-signature-pad--body { border: none; width: 100%; height: 100%; }
    canvas { width: 100%; height: 100%; background-color: white; }
  `;

  return (
    <View style={styles.container}>
      {!videoUrl && (
        <View style={styles.insContainer}>
          <View style={styles.container2}>
            <Text style={styles.insTxt}>
              Write the {getOrdinal(currentLetterIndex)} letter of this word
            </Text>
            <Text style={styles.insTxt}>(Word {currentWordIndex + 1}/5)</Text>
            <Text style={styles.insTxt2}>Write the word letter-by-letter on the canvas</Text>
            <Text style={styles.insTxt2}>1st Letter should be in Capital</Text>
            <Text style={styles.insTxt2}>(eg: Man)</Text>
          </View>
          <TouchableOpacity onPress={playAudio}>
            <Text style={styles.speakBtnTxt}>
              <Image source={require('../assets/speaker0.png')} style={styles.speakBtnIcon} />
            </Text>
          </TouchableOpacity>
        </View>
      )}

      {!videoUrl && (
        <View style={styles.canvasContainer}>
          <SignatureScreen
            ref={signatureRef}
            webStyle={webStyle}
            onOK={uploadSignature}
            onEmpty={() => console.log('Signature is empty')}
            onBegin={() => console.log('Drawing started')}
            onEnd={() => console.log('Drawing ended')}
          />
        </View>
      )}

      {videoUrl && (
        <View style={styles.videoContainer}>
          <Text style={styles.videoTxt}>Nice Try! Here is the correct way to write it</Text>
          <Video
            source={{ uri: videoUrl }}
            style={styles.video}
            controls={true}
            resizeMode="contain"
            onLoad={() => console.log('Video loaded')}
            onError={(e) => {
              console.log('Video error:', e.error);
              Alert.alert('Error', 'Failed to play video');
              nextVideo();
            }}
          />
          <TouchableOpacity onPress={nextVideo} style={styles.nextVideoBtn}>
            <Text style={styles.nextVideoBtnText}>Next</Text>
          </TouchableOpacity>
        </View>
      )}

      {!videoUrl && (
        <View style={styles.fixToText}>
          {currentLetterIndex < (currentWord?.word.length - 1 || 0) ? (
            <TouchableOpacity onPress={nextLetter} disabled={loading}>
              <Text style={styles.positiveBtn}>Next</Text>
            </TouchableOpacity>
          ) : (
            <TouchableOpacity onPress={submitWord} disabled={loading}>
              <Text style={styles.positiveBtn}>Submit</Text>
            </TouchableOpacity>
          )}
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
  container2: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  insContainer: {
    flexDirection: 'column',
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
    textAlign: 'center',
  },
  insTxt2: {
    fontSize: 18,
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
    backgroundColor: '#f0f0f0',
    borderWidth: 1,
    borderColor: '#000',
    marginBottom: 10,
  },
  videoContainer: {
    width: '90%',
    height: 400,
    backgroundColor: '#000',
    marginBottom: 10,
    alignItems: 'center',
  },
  video: {
    width: '100%',
    height: '80%',
  },
  videoTxt: {
    fontSize: 23,
    fontWeight: '600',
    color: '#27ac1f',
    textAlign: 'center',
    marginBottom: 10,
  },
  nextVideoBtn: {
    paddingVertical: 10,
    paddingHorizontal: 20,
    backgroundColor: '#85fe78',
    borderRadius: 10,
    marginTop: 10,
  },
  nextVideoBtnText: {
    fontSize: 20,
    fontWeight: '600',
    color: '#12181e',
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