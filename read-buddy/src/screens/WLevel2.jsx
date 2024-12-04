import React, { useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native';
import SoundPlayer from 'react-native-sound-player'
// import SketchCanvas from '@terrylinla/react-native-sketch-canvas';

export default function WLevel2({ navigation }) {

  // const canvasRef = useRef(null);

    // Function to play the audio file
    const playAudio = () => {
      try {
        SoundPlayer.playSoundFile('sample_sound', 'mp3'); // 'sample_sound' is the filename without extension
      } catch (e) {
        console.log('Error playing sound file', e);
      }
    };



    // Function to clear the drawing pad
    // const clearCanvas = () => {
    //   canvasRef.current.clear();
    // };

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

      {/* Wrapping SketchCanvas in a View with specific dimensions */}
      <View style={{ width: '100%', height: 300, backgroundColor: '#f0f0f0' }}>
          {/* <SketchCanvas
            ref={canvasRef}
            style={{ flex: 1 }}
            strokeColor={'#000000'}
            strokeWidth={4}
          /> */}

          <Text style={{textAlign:'center', padding:20}}>replace the drawing canvas here</Text>
        </View>

      <View style={styles.fixToText}>
            <TouchableOpacity >
              <Text style={styles.positiveBtn}>Submit</Text>
            </TouchableOpacity>

            {/* <TouchableOpacity onPress={clearCanvas}> */}
            <TouchableOpacity >
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
