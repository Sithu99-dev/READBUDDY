import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  Image,
  StyleSheet,
  Animated,
  Dimensions,
} from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../App';

type SplashScreenProps = NativeStackScreenProps<RootStackParamList, 'Splash'>;

const SplashScreen: React.FC<SplashScreenProps> = ({ navigation }) => {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  
  useEffect(() => {
    // Fade in animation
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 1500,
      useNativeDriver: true,
    }).start();
    
    // Auto-navigate to Login screen after 2.5 seconds
    const timer = setTimeout(() => {
      navigation.replace('Onboarding');
    }, 2500);
    
    return () => clearTimeout(timer);
  }, [fadeAnim, navigation]);

  return (
    <View style={styles.container}>
      {/* Background Image */}
      <Image
        source={require('../../assets/sp.png')}
        style={styles.backgroundImage}
        resizeMode="cover"
      />
      
      {/* Blue Border */}
      <View style={styles.borderTop} />
      <View style={styles.borderRight} />
      <View style={styles.borderBottom} />
      <View style={styles.borderLeft} />
      
      {/* Blue Corner Squares */}
      <View style={styles.cornerTopLeft} />
      <View style={styles.cornerTopRight} />
      <View style={styles.cornerBottomRight} />
      <View style={styles.cornerBottomLeft} />
      
      {/* Logo Image and Text */}
      <Animated.View
        style={{
          opacity: fadeAnim,
          alignItems: 'center',
        }}
      >
        <Image
          source={require('../../assets/bg2.jpg')}
          style={styles.logo}
          resizeMode="contain"
        />
        
        <Text style={styles.mainText}>READBUDDY</Text>
        <Text style={styles.subText}>Learn. Read. Grow.</Text>
      </Animated.View>
    </View>
  );
};

const { width, height } = Dimensions.get('window');
const BORDER_COLOR = '#16E1FF'; // Bright blue border
const BORDER_WIDTH = 2;
const CORNER_SIZE = 8;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  backgroundImage: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: '100%',
    height: '100%',
  },
  borderTop: {
    position: 'absolute',
    top: 0,
    left: CORNER_SIZE,
    right: CORNER_SIZE,
    height: BORDER_WIDTH,
    backgroundColor: BORDER_COLOR,
  },
  borderRight: {
    position: 'absolute',
    top: CORNER_SIZE,
    right: 0,
    bottom: CORNER_SIZE,
    width: BORDER_WIDTH,
    backgroundColor: BORDER_COLOR,
  },
  borderBottom: {
    position: 'absolute',
    bottom: 0,
    left: CORNER_SIZE,
    right: CORNER_SIZE,
    height: BORDER_WIDTH,
    backgroundColor: BORDER_COLOR,
  },
  borderLeft: {
    position: 'absolute',
    top: CORNER_SIZE,
    left: 0,
    bottom: CORNER_SIZE,
    width: BORDER_WIDTH,
    backgroundColor: BORDER_COLOR,
  },
  cornerTopLeft: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: CORNER_SIZE,
    height: CORNER_SIZE,
    borderTopWidth: BORDER_WIDTH,
    borderLeftWidth: BORDER_WIDTH,
    borderColor: BORDER_COLOR,
  },
  cornerTopRight: {
    position: 'absolute',
    top: 0,
    right: 0,
    width: CORNER_SIZE,
    height: CORNER_SIZE,
    borderTopWidth: BORDER_WIDTH,
    borderRightWidth: BORDER_WIDTH,
    borderColor: BORDER_COLOR,
  },
  cornerBottomRight: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: CORNER_SIZE,
    height: CORNER_SIZE,
    borderBottomWidth: BORDER_WIDTH,
    borderRightWidth: BORDER_WIDTH,
    borderColor: BORDER_COLOR,
  },
  cornerBottomLeft: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    width: CORNER_SIZE,
    height: CORNER_SIZE,
    borderBottomWidth: BORDER_WIDTH,
    borderLeftWidth: BORDER_WIDTH,
    borderColor: BORDER_COLOR,
  },
  logo: {
    width: width * 0.4,
    height: width * 0.4,
    marginBottom: 20,
  },
  mainText: {
    fontSize: 38,
    fontWeight: 'bold',
    color: 'white',
    textAlign: 'center',
    marginBottom: 10,
    textShadowColor: 'rgba(0,0,0,0.1)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },
  subText: {
    fontSize: 20,
    fontWeight: '500',
    color: 'white',
    textAlign: 'center',
    opacity: 0.9,
  },
});

export default SplashScreen;