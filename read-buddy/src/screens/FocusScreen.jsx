import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ImageBackground, SafeAreaView } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';

export default function FocusScreen({ navigation }) {
  return (
    <ImageBackground
      source={require('../assets/speakingbg.png')}
      imageStyle={{opacity: 0.5}}
      style={styles.container}
      resizeMode="cover"
    >
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.contentContainer}>
          {/* Title at the top */}
          <Text style={styles.title}>Check Your Focus</Text>

          {/* Empty spacer view to push content up */}
          <View style={styles.spacer} />

          {/* Button positioned higher with LinearGradient */}
          <TouchableOpacity
            onPress={() => navigation.navigate('Game')}
            style={styles.buttonWrapper}
          >
            <View style={styles.splashContainer}>
              <LinearGradient
                style={styles.button}
                colors={['#03cdc0', '#7e34de']} // Blue to purple gradient
                start={{x: 0, y: 0}}
                end={{x: 1, y: 0}}
              >
                <Text style={styles.buttonText}>Start Game</Text>
              </LinearGradient>
            </View>
          </TouchableOpacity>

          {/* Additional bottom space */}
          <View style={styles.bottomSpace} />
        </View>
      </SafeAreaView>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    width: '100%',
    height: '100%',
  },
  safeArea: {
    flex: 1,
  },
  contentContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 30,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#2D3335',
    textAlign: 'center',
    marginBottom: 20,
    marginTop: 30,
  },
  spacer: {
    flex: 0.3,
  },
  buttonWrapper: {
    marginBottom: 10,
  },
  splashContainer: {
    overflow: 'hidden',
    borderRadius: 25,
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
  },
  button: {
    paddingVertical: 15,
    paddingHorizontal: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  buttonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  bottomSpace: {
    flex: 0.2, // Creates additional space at the bottom
  },
});
