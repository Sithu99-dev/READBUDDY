import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ImageBackground, Image } from 'react-native';

export default function ReadingScreen({ navigation }) {
  return (
    <ImageBackground
      source={require("../assets/readingmain.png")}
      style={styles.container}
      imageStyle={{opacity: 0.7}}>
      <View style={styles.contentContainer}>
        {/* Book graphic at the top */}
       
        
        {/* Buttons container */}
        <View style={styles.buttonsContainer}>
          {/* Input text button */}
          <TouchableOpacity 
            style={styles.button}
            onPress={() => navigation.navigate('Text Input')}
          >
            <View style={styles.iconContainer}>
              <Image 
                source={require("../assets/book.png")}
                style={styles.buttonIcon}
              />
            </View>
            <Text style={styles.buttonText}>Input text</Text>
          </TouchableOpacity>
          
          {/* Text Scanning button */}
          <TouchableOpacity 
            style={styles.button}
            onPress={() => navigation.navigate('Text Reading')}
          >
            <View style={styles.iconContainer}>
              <Image 
                source={require("../assets/scan.png")}
                style={styles.buttonIcon}
              />
            </View>
            <Text style={styles.buttonText}>Text Scanning</Text>
          </TouchableOpacity>
          
          {/* Reading Challenge button */}
          <TouchableOpacity 
            style={styles.button}
            onPress={() => navigation.navigate('Reading Challenge')}
          >
            <View style={styles.iconContainer}>
              <Image 
                source={require("../assets/books1.png")}
                style={styles.buttonIcon}
              />
            </View>
            <View style={styles.multilineButtonText}>
              <Text style={styles.buttonText}>Reading Challenge</Text>
            </View>
          </TouchableOpacity>
        </View>
        
        {/* Bottom reading figure */}
      </View>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    width: '100%',
    height: '100%',
  },
  contentContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 20,
  },
  headerGraphic: {
    width: '100%',
    height: '25%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  bookImage: {
    width: '80%',
    height: '80%',
  },
  buttonsContainer: {
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    flexGrow: 1,
  },
  button: {
    width: '85%',
    height: 75,
    backgroundColor: '#5EBFB5',
    borderRadius: 37.5,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    marginVertical: 15,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
    marginBottom:30
  },
  iconContainer: {
    width: 50,
    height: 50,
    backgroundColor: 'white',
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
    marginLeft: 5,
  },
  buttonIcon: {
    width: 30,
    height: 30,
  },
  buttonText: {
    color: 'white',
    fontSize: 28,
    fontWeight: 'bold',
  },
  multilineButtonText: {
    flexDirection: 'column',
    alignItems: 'flex-start',
  },
  footerGraphic: {
    width: '100%',
    height: '25%',
    alignItems: 'flex-end',
    justifyContent: 'flex-end',
    paddingRight: 20,
  },
  readingPersonImage: {
    width: 150,
    height: 150,
  },
});