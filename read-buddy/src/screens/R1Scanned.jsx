import React from 'react';
import { View, Text, Button, StyleSheet, TouchableOpacity, Image } from 'react-native';

export default function R1Scanned({ navigation }) {
  return (
    <View style={styles.container}>

        <View style={styles.topButtons}>

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
          
        </View>


      <Text>Scanned Document View</Text>
        <TouchableOpacity onPress={() => navigation.navigate('Text Settings')}>
          <Text style={styles.positiveBtn}>Text Settings</Text>
        </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center'},
  topButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 200,
    position: 'absolute',
    top:15,    
    left: 15
    },
    positiveBtn:{fontSize: 15,
      fontWeight: 600,
      color: '#12181e',   
      padding: 10,
      margin: 5,
      backgroundColor: '#85fe78',
      borderRadius: 10,
    },
    btnIcon: { width: 30, height: 30, marginRight: 10 },
});
