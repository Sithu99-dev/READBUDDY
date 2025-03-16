import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  Image,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
  FlatList,
  SafeAreaView,
} from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../App';
import LinearGradient from 'react-native-linear-gradient';

type OnboardingScreenProps = NativeStackScreenProps<RootStackParamList, 'Onboarding'>;

// Onboarding data - make sure these image paths are correct
const onboardingData = [
  {
    id: '1',
    title: 'The Real Estate Investment Community Is At Your Fingertips',
    description: 'We Are The Link Between The Property Offerer And Its Beneficiaries On A Large Scale',
    image: require('../../assets/bg2.jpg'),
  },
  {
    id: '2',
    title: 'Turn Your Home Into A Money Box Effortlessly',
    description: 'Renting Out A Home Can Be A Smart Financial Investment To Achieve Stable Returns.',
    image: require('../../assets/bg2.jpg'),
  },
  {
    id: '3',
    title: 'Find A House To Rent Easily',
    description: 'Through The Many Search Filters Provided By Minting SPACES, Find A House That Suits You Effortlessly While Guaranteeing The Rights Of Both Parties To Conclude The Lease Contract',
    image: require('../../assets/bg2.jpg'),
  },
];

// Star componentconst Star = ({ style }: { style: any }) => (
// Star component with gradient background
const Star = ({ style }: { style: any }) => (
    <View style={[styles.starContainer, style]}>
      <Text style={styles.starMultiColor}>✦</Text>
    </View>
  );

// Dot component
const Dot = ({ style }: { style: any }) => (
  <View style={[styles.dotContainer, style]}>
    <View style={styles.dot} />
  </View>
);

const OnboardingScreen: React.FC<OnboardingScreenProps> = ({ navigation }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const flatListRef = useRef<FlatList>(null);

  // Debug: Log at startup to check if images are loading
  React.useEffect(() => {
    console.log('Onboarding Screen Mounted');
    console.log('Image paths:', {
      image1: onboardingData[0].image,
      image2: onboardingData[1].image,
      image3: onboardingData[2].image,
    });
  }, []);

  // Handle skip - go directly to login
  const handleSkip = () => {
    navigation.replace('Login');
  };

  // Handle next button press
  const handleNext = () => {
    if (currentIndex < onboardingData.length - 1) {
      // Go to next onboarding page
      setCurrentIndex(currentIndex + 1);
      flatListRef.current?.scrollToIndex({ index: currentIndex + 1, animated: true });
    } else {
      // If on the last onboarding page, go to login
      navigation.replace('Login');
    }
  };

  // Handle back button press
  const handleBack = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
      flatListRef.current?.scrollToIndex({ index: currentIndex - 1, animated: true });
    }
  };

  // Render each onboarding item
  const renderItem = ({ item, index }: { item: typeof onboardingData[0], index: number }) => {
    return (
      <View style={styles.slide}>
        {/* Left curved shape */}
        <View style={styles.leftCurve} />

        {/* Right curved shape */}
        <View style={styles.rightCurve} />

        <LinearGradient
        style={styles.leftCurve}
        colors={['#4778B3', '#4AACA6']} // Blue to teal gradient
        start={{x: 0, y: 0}}
        end={{x: 1, y: 1}}
        />
        <LinearGradient
        style={styles.rightCurve}
        colors={['#4AACA6', '#4778B3']} // Teal to blue gradient
        start={{x: 0, y: 0}}
        end={{x: 1, y: 1}}
        />
        <LinearGradient
        style={styles.rightCurve}
        colors={['#4AACA6', '#4778B3']} // Teal to blue gradient
        start={{x: 0, y: 0}}
        end={{x: 1, y: 1}}
        />

        {/* Decorative elements - Stars and Dots */}
        <Star style={{ top: '15%', right: '25%' }} />
        <Star style={{ top: '10%', left: '40%' }} />
        <Star style={{ bottom: '40%', right: '25%' }} />
        <Star style={{ bottom: '82%', left: '20%' }} />
        <Star style={{ bottom: '60%', left: '90%' }} />
        <Star style={{ bottom: '55%', right: '90%' }} />

        <Dot style={{ top: '20%', right: '15%' }} />
        <Dot style={{ top: '35%', left: '10%' }} />
        <Dot style={{ bottom: '25%', right: '30%' }} />
        <Dot style={{ bottom: '40%', left: '25%' }} />

        {/* Skip button */}
        <TouchableOpacity style={styles.skipButton} onPress={handleSkip}>
          <Text style={styles.skipText}>Skip</Text>
        </TouchableOpacity>

        {/* Main content */}
        <View style={styles.contentContainer}>
          {/* Troubleshooting: Add a colored background to see image container */}
          <View style={styles.imageWrapper}>
            <Image
              source={item.image}
              style={styles.image}
              resizeMode="contain"
            />
          </View>

          <Text style={styles.title}>{item.title}</Text>
          <Text style={styles.description}>{item.description}</Text>
        </View>

        {/* Pagination dots */}
        {/* Pagination dots */}
        <View style={styles.paginationContainer}>
        {onboardingData.map((_, dotIndex) => (
            dotIndex === index ? (
            <LinearGradient
                key={dotIndex}
                style={[styles.paginationDot, styles.paginationDotActive, { marginRight: dotIndex < 2 ? 5 : 0 }]}
                colors={['#03cdc0', '#7e34de']} // Blue to purple gradient
                start={{x: 0, y: 0}}
                end={{x: 1, y: 0}}
            />
            ) : (
            <View
                key={dotIndex}
                style={[styles.paginationDot, styles.paginationDotInactive, { marginRight: dotIndex < 2 ? 5 : 0 }]}
            />
            )
        ))}
        </View>

        {/* Navigation buttons */}
        <View style={styles.buttonsContainer}>
          {index > 0 ? (
            <TouchableOpacity style={styles.backButton} onPress={handleBack}>
              <Text style={styles.backButtonText}>Back</Text>
            </TouchableOpacity>
          ) : <View style={styles.backButton} />}

            <TouchableOpacity onPress={handleNext}>
            <LinearGradient
                style={styles.nextButton}
                colors={['#03cdc0', '#7e34de']} // Blue to purple gradient
                start={{x: 0, y: 0}}
                end={{x: 1, y: 1}}
            >
                <Text style={styles.nextButtonText}>→</Text>
            </LinearGradient>
            </TouchableOpacity>
        </View>
      </View>
    );
  };

  // Handle scroll end to update currentIndex
  const handleScroll = (event: any) => {
    const contentOffsetX = event.nativeEvent.contentOffset.x;
    const newIndex = Math.round(contentOffsetX / width);
    if (newIndex !== currentIndex) {
      setCurrentIndex(newIndex);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <FlatList
        ref={flatListRef}
        data={onboardingData}
        renderItem={renderItem}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onMomentumScrollEnd={handleScroll}
        keyExtractor={item => item.id}
        bounces={false}
      />
    </SafeAreaView>
  );
};

const { width, height } = Dimensions.get('window');

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'white',
  },
  slide: {
    flex: 1,
    width,
    alignItems: 'center',
    backgroundColor: 'white',
    borderRadius: 30,
    overflow: 'hidden',
    position: 'relative',
  },
  leftCurve: {
    position: 'absolute',
    left: -70,
    top: 80,
    width: 140,
    height: 160,
    borderRadius: 70,
    opacity: 0.9,
  },
  rightCurve: {
    position: 'absolute',
    right: -70,
    bottom: 180,
    width: 140,
    height: 160,
    borderRadius: 70,
    opacity: 0.9,
  },
  imageWrapper: {
    width: width * 0.65,
    height: width * 0.65,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 40,
  },
  image: {
    width: '100%',
    height: '100%',
  },
  starContainer: {
    position: 'absolute',
    zIndex: 5,
  },
  star: {
    color: '#4AACA6',
    fontSize: 26,
  },
  starMultiColor: {
    fontSize: 26,
    color: '#03cdc0',
    textShadowColor: '#069990',
    textShadowOffset: { width: 1.5, height: 1.5 },
    textShadowRadius: 1,
  },

  starGradient: {
    borderRadius: 15,
    padding: 2,
  },
  starText: {
    fontSize: 26,
    color: 'white', // Text color over gradient
  },
  dotContainer: {
    position: 'absolute',
    zIndex: 5,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 3,
    backgroundColor: '#4AACA6',
  },
  skipButton: {
    position: 'absolute',
    top: 20,
    right: 20,
    zIndex: 10,
  },
  skipText: {
    fontSize: 18,
    color: '#333',
    fontWeight:'bold'
  },
  contentContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 30,
    marginTop: 80,
    marginBottom: 120,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    textAlign: 'center',
    marginBottom: 15,
    paddingHorizontal: 20,
  },
  description: {
    fontSize: 14,
    color: '#777',
    textAlign: 'center',
    lineHeight: 22,
    paddingHorizontal: 10,
  },
  paginationContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    position: 'absolute',
    bottom: 100,
    alignSelf: 'center',
  },
  paginationDot: {
    height: 10,
    borderRadius: 5,
  },
  paginationDotActive: {
    width: 30,
  },
  paginationDotInactive: {
    width: 10,
    backgroundColor: '#ccc',
  },
  buttonsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    paddingHorizontal: 20,
    position: 'absolute',
    bottom: 35,
  },
  backButton: {
    padding: 10,
    width: 80,
    justifyContent: 'center',
  },
  backButtonText: {
    fontSize: 18,
    color: '#333',
    fontWeight:'bold'
  },
  nextButton: {
    backgroundColor: '#5B73E8',
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
  },
  nextButtonText: {
    fontSize: 48,
    color: 'white',
    fontWeight: 'bold',
    marginTop:-15
  },
});

export default OnboardingScreen;