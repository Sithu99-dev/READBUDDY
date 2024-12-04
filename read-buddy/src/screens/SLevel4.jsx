import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native';

export default function SLevel4({ navigation }) {
  return (
    <View style={styles.container}>
        
        {/* <View style={styles.topButtons}>

          <TouchableOpacity onPress={() => navigation.navigate('Home')}>
              <Text
              style={{fontSize: 15,
                  fontWeight: 600,
                  color: '#12181e',   
                  padding: 10,
                  margin: 5,
                  backgroundColor: '#85fe78',
                  borderRadius: 10,
                          
              }}
              >              
                <Image source={require('../assets/home_icon.png')} style={styles.btnIcon} />
              </Text>
          </TouchableOpacity>
          
        </View> */}

      <Text style={styles.instruction}>Touch on the Mic button and discribe the Image.</Text>      
      <Image
        // style={styles.tinyLogo}
        style={{width: '80%', height: '70%'}}
        source={{
          uri: 'https://cdn.pixabay.com/photo/2017/07/15/19/42/train-track-2507499_1280.jpg',
        }}
      />

      <View style={styles.micBtnContainer}>

      <TouchableOpacity>
          <Text
          style={styles.micBtnTxt}
          >              
            <Image source={require('../assets/mic2.png')} style={styles.micBtnIcon} />
          </Text>
      </TouchableOpacity>

      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  topButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 200,
    position: 'absolute',
    top:15,    
    left: 15
    },
    btnIcon: { width: 30, height: 30, marginRight: 10 },

    instruction: {
      fontSize: 23,
      fontWeight: 600,
      margin:20,
      padding:18,
      borderColor:'#27ac1f',
      borderWidth: 1,
      color:'#27ac1f'
    },

    micBtnContainer: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      marginTop: 20,
      },

      micBtnIcon: { width: 50, height: 50, marginRight: 10 },

      micBtnTxt: {
        fontSize: 15,
        fontWeight: 600,
        color: '#12181e',   
        padding: 10,
        margin: 5,
        backgroundColor: '#85fe78',
        borderRadius: 35,
      }
});