// screens/DashboardScreen.js
import React from 'react';
import { View, Text, Image, StyleSheet, TouchableOpacity, ImageBackground } from 'react-native';
import { AppContext } from '../App';
import LinearGradient from 'react-native-linear-gradient';

export default function DashboardScreen({ navigation }) {
  return (
    <ImageBackground 
      source={require("../assets/dashbordmain.png")}
      style={styles.container}>
      <AppContext.Consumer>
        {({ setLoggedInUser }) => (
          <View style={styles.logout}>
            <TouchableOpacity onPress={() => setLoggedInUser(null)}>
              <Text style={{ color: '#12181e', fontWeight: 'bold', marginTop: 20, backgroundColor: '#27ac1f', padding: 8, borderRadius: 8 }}>Logout</Text>
            </TouchableOpacity>
          </View>
        )}
      </AppContext.Consumer>

      <View style={styles.mainContainer}>
        <Text style={styles.mainTitle}>Let's Play{'\n'}     & Learn..!</Text>
        
        <View style={styles.buttonsContainer}>
          {/* Writing Button - Left aligned with Left Line */}
          <View style={styles.buttonWrapper}>
            <View style={styles.buttonLineLeft} />
            <TouchableOpacity 
              style={[styles.buttonLeft]} 
              onPress={() => navigation.navigate('Writing')}>
              <LinearGradient
                style={styles.button}
                colors={['#4AACA6', '#4778B3']} // Teal to blue gradient
                start={{x: 0, y: 0}}
                end={{x: 1, y: 1}}
              >
                <View style={styles.buttonContent}>
                  <Image 
                    source={require('../assets/writing.png')} 
                    style={styles.buttonIcon} 
                  />
                  <Text style={styles.buttonText}>Writing</Text>
                </View>
              </LinearGradient>
            </TouchableOpacity>
          </View>

          {/* Reading Button - Right aligned with Right Line */}
          <View style={styles.buttonWrapper}>
            <TouchableOpacity 
              style={[styles.buttonRight]} 
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
                  <Text style={styles.buttonText}>Reading</Text>
                </View>
              </LinearGradient>
            </TouchableOpacity>
            <View style={styles.buttonLineRight} />
          </View>

          {/* Speaking Button - Left aligned with Left Line */}
          <View style={styles.buttonWrapper}>
            <View style={styles.buttonLineLeft} />
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
                  <Text style={styles.buttonText}>Speaking</Text>
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
                  <Image 
                    source={require('../assets/focus.png')} 
                    style={styles.buttonIcon} 
                  />
                  <Text style={styles.buttonText}>Focus</Text>
                </View>
              </LinearGradient>
            </TouchableOpacity>
            <View style={styles.buttonLineRight} />
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
    fontStyle:'italic'
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
    width: '90%',
    justifyContent: 'center',
    borderRadius: 15,
    overflow: 'hidden',
  },
  buttonLeft: {
    width: '70%',
    marginLeft: 135,
  },
  buttonRight: {
    width: '70%',
    alignSelf: 'flex-end',
    marginRight: 30,
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
    fontSize: 32,
    flex: 1,
    textAlign: 'right',
    paddingRight: 20,
  },
  buttonLineLeft: {
    position: 'absolute',
    left: 0,
    width: 135,
    height: 8,
    backgroundColor: 'black',
    zIndex: 1,
    borderRadius: 15,
  },
  buttonLineRight: {
    position: 'absolute',
    right: 3,
    width: 135,
    height: 8,
    backgroundColor: 'black',
    zIndex: 1,
    borderRadius: 15,
  }
});