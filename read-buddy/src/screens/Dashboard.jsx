// screens/DashboardScreen.js
import React from 'react';
import { View, Text, Image, StyleSheet, TouchableOpacity, ImageBackground } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';

export default function DashboardScreen({ navigation }) {
  return (
    <ImageBackground
      source={require('../assets/dashbordmain.png')}
      style={styles.container}>
      <View style={styles.mainContainer}>
        <Text style={styles.mainTitle}>Let's Play{'\n'}     & Learn..!</Text>

        <View style={styles.buttonsContainer}>
          {/* Writing Button - Left aligned with Left Line */}
          <View style={styles.buttonWrapper}>
            <TouchableOpacity
              style={[styles.buttonLeft]}
              onPress={() => navigation.navigate('Reading')}>
              <LinearGradient
                style={styles.button}
                colors={['#4AACA6', '#4778B3']} // Teal to blue gradient
                start={{x: 0, y: 0}}
                end={{x: 1, y: 1}}
              >
                <View style={styles.buttonContent}>
                  <Image
                      source={require('../assets/reading.png')}
                    style={styles.buttonIcon}
                  />

                  <Text style={styles.buttonText}>Readability Checker</Text>
                </View>
              </LinearGradient>
            </TouchableOpacity>
          </View>

          {/* Reading Button - Right aligned with Right Line */}
          <View style={styles.buttonWrapper}>
            <TouchableOpacity
              style={[styles.buttonRight]}
              onPress={() => navigation.navigate('Writing')}>
              <LinearGradient
                style={styles.button}
                colors={['#4AACA6', '#4778B3']} // Teal to blue gradient
                start={{x: 0, y: 0}}
                end={{x: 1, y: 1}}
              >
                <View style={styles.buttonContent}>

                 <Text style={styles.buttonText}>Writing Coach</Text>
                 <Image
                    source={require('../assets/writing.png')}
                    style={styles.buttonIcon}
                  />
                </View>
              </LinearGradient>
            </TouchableOpacity>

          </View>

          {/* Speaking Button - Left aligned with Left Line */}
          <View style={styles.buttonWrapper}>
            <TouchableOpacity
              style={[styles.buttonLeft]}
              onPress={() => navigation.navigate('Speech')}>
              <LinearGradient
                style={styles.button}
                colors={['#4AACA6', '#4778B3']} // Teal to blue gradient
                start={{x: 0, y: 0}}
                end={{x: 1, y: 1}}
              >
                <View style={styles.buttonContent}>
                  <Image
                    source={require('../assets/speaking.png')}
                    style={styles.buttonIcon}
                  />
                  <Text style={styles.buttonText}>Pronunciation Assit</Text>
                </View>
              </LinearGradient>
            </TouchableOpacity>
          </View>

          {/* Focus Button - Right aligned with Right Line */}
          <View style={styles.buttonWrapper}>
            <TouchableOpacity
              style={[styles.buttonRight]}
              onPress={() => navigation.navigate('Focus')}>
              <LinearGradient
                style={styles.button}
                colors={['#4AACA6', '#4778B3']} // Teal to blue gradient
                start={{x: 0, y: 0}}
                end={{x: 1, y: 1}}
              >
                <View style={styles.buttonContent}>
                 <Text style={styles.buttonText}>Focus Challenge</Text>
                  <Image
                    source={require('../assets/focus.png')}
                    style={styles.buttonIcon}
                  />
                </View>
              </LinearGradient>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#d7e9f1',
  },
  logout: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignContent: 'flex-end',
    width: '100%',
    paddingHorizontal: 20,
  },
  mainContainer: {
    flex: 1,
    paddingHorizontal: 20,
    justifyContent: 'center',
  },
  mainTitle: {
    fontSize: 54,
    fontWeight: 'bold',
    color: 'black',
    marginLeft:40,
    marginBottom: 60,
    fontStyle:'italic',
  },
  buttonsContainer: {
    justifyContent: 'center',
    alignItems: 'stretch',
  },
  buttonWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 10,
    position: 'relative',
    width: '100%',
  },
  button: {
    height: 80,
    width: '130%',
    justifyContent: 'center',
    borderRadius: 15,
    overflow: 'hidden',
  },
  buttonLeft: {
    width: '70%',
    marginLeft:20,
    marginBottom:10,
  },
  buttonRight: {
    width: '70%',
    justifyContent: 'center',
    marginLeft:20,
    marginBottom:10,
  },
  buttonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  buttonIcon: {
    width: 40,
    height: 40,
  },
  buttonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 26,
    flex: 1,
    textAlign: 'center',
    paddingRight: 20,
  },
});
