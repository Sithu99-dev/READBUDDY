import * as React from 'react';
import { useState, useEffect } from 'react';
import { StyleSheet } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import './utils/firebaseConfig';

// Import screens
import DashboardScreen from './screens/Dashboard';
import ReadingScreen from './screens/ReadingScreen';
import WritingScreen from './screens/WritingScreen';
import SpeechScreen from './screens/SpeechScreen';
import FocusScreen from './screens/FocusScreen';
import R1Scanned from './screens/R1Scanned';
import R2TextSettings from './screens/R2TextSettings';
import WLevel1 from './screens/WLevel1';
import WLevel2 from './screens/WLevel2';
import WLevel3 from './screens/WLevel3';
import WLevel4 from './screens/WLevel4';
import SLevel1 from './screens/SLevel1';
import SLevel2 from './screens/SLevel2';
import SLevel3 from './screens/SLevel3';
import SLevel4 from './screens/SLevel4';
import ReadingText from './screens/ReadingText';
import ReadingChallenge from './screens/ReadingChallenge';
import LetterAnimation from './screens/LetterAnimation';
import GameOverScreen from './components/GameOverScreen';
import Game from './components/Game';
import WordWrite from './screens/WordsWrite';
import TextInputScreen from './screens/TextInputScreen';
import SplashScreen from './screens/welcomeScreen/SplashScreen';
import OnboardingScreen from './screens/welcomeScreen/OnboardingScreen';
import LoginScreen from './screens/auth/LoginScreen';
import RegisterScreen from './screens/auth/RegisterScreen';

// Import the wrapper component
import ScreenWrapper from './screens/profile/ScreenWrapper';
// import { setupUrlsInFirebase } from './data/url';


// Define navigation param lists
export type RootStackParamList = {
  Login: undefined;
  Register: undefined;
  Home: undefined;
  Reading: undefined;
  Writing: undefined;
  Speech: undefined;
  Focus: undefined;
  Splash: undefined;
  Onboarding: undefined;

  'Text Reading': undefined;
  'Scanned Text': { scannedText: string; letterSettings?: object };
  'Text Settings': { scannedText?: string; inputText?: string; letterSettings: object };
  'Text Input': undefined;
  'Reading Challenge': undefined;
  'Writing Letters': undefined;
  'Writing Numbers': undefined;
  'Writing Level 3': undefined;
  'Writing Level 4': undefined;
  'Speech Level 1': undefined;
  'Speech Level 2': undefined;
  'Speech Level 3': undefined;
  'Speech Level 4': undefined;
  'Say the word': undefined;
  GameOverScreen: {
    score: number;
    result: {
      result: string;
      description: string;
      topic1: string;
      topic2: string;
      topic3: string;
      topic4: string;
      topic5: string;
      topic6: string;
      topic7: string;
      message1: string;
      message2: string;
      message3: string;
      message4: string;
      message5: string;
      message6: string;
      message7: string;
    };
  };
  Game: undefined;
  Words: undefined;
};

const Stack = createNativeStackNavigator<RootStackParamList>();

export const AppContext = React.createContext<{
  loggedInUser: string | null;
  setLoggedInUser: (user: string | null) => void;
}>({
  loggedInUser: null,
  setLoggedInUser: () => {},
});

// Create wrapper functions for all screens to add the ProfileButton
const withScreenWrapper = (Component) => {
  return ({ navigation, route }) => (
    <ScreenWrapper navigation={navigation}>
      <Component navigation={navigation} route={route} />
    </ScreenWrapper>
  );
};

function App() {
  const [loggedInUser, setLoggedInUser] = useState<string | null>(null);
  const [initializing, setInitializing] = useState(true);

  //  useEffect(() => {
  //   // Run initialization when app starts
  //   const initializeUrls = async () => {
  //     console.log('Setting up URLs in Firebase...');
  //     const success = await setupUrlsInFirebase();
  //     if (success) {
  //       console.log('✅ URLs are now stored in Firebase!');
  //     } else {
  //       console.log('❌ Failed to store URLs in Firebase');
  //     }
  //   };

  //   // Call the function
  //   initializeUrls();
  // }, []); 

  useEffect(() => {
    setInitializing(false);
  }, []);

  if (initializing) return null;

  return (
    <AppContext.Provider value={{ loggedInUser, setLoggedInUser }}>
      <NavigationContainer>
        <Stack.Navigator screenOptions={{ headerShown: false }}>
          {loggedInUser ? (
            <React.Fragment>
              <Stack.Screen name="Home" component={withScreenWrapper(DashboardScreen)} />
              <Stack.Screen name="Reading" component={withScreenWrapper(ReadingScreen)} />
              <Stack.Screen name="Writing" component={withScreenWrapper(WritingScreen)} />
              <Stack.Screen name="Speech" component={withScreenWrapper(SpeechScreen)} />
              <Stack.Screen name="Focus" component={withScreenWrapper(FocusScreen)} />
              <Stack.Screen name="Text Reading" component={withScreenWrapper(ReadingText)} />
              <Stack.Screen name="Scanned Text" component={withScreenWrapper(R1Scanned)} />
              <Stack.Screen name="Text Settings" component={withScreenWrapper(R2TextSettings)} />
              <Stack.Screen name="Text Input" component={withScreenWrapper(TextInputScreen)} />
              <Stack.Screen name="Reading Challenge" component={withScreenWrapper(ReadingChallenge)} />
              <Stack.Screen name="Writing Letters" component={withScreenWrapper(WLevel1)} />
              <Stack.Screen name="Writing Numbers" component={withScreenWrapper(WLevel2)} />
              <Stack.Screen name="Writing Level 3" component={withScreenWrapper(WLevel3)} />
              <Stack.Screen name="Writing Level 4" component={withScreenWrapper(WLevel4)} />
              <Stack.Screen name="Speech Level 1" component={withScreenWrapper(SLevel1)} />
              <Stack.Screen name="Speech Level 2" component={withScreenWrapper(SLevel2)} />
              <Stack.Screen name="Speech Level 3" component={withScreenWrapper(SLevel3)} />
              <Stack.Screen name="Speech Level 4" component={withScreenWrapper(SLevel4)} />
              <Stack.Screen name="Say the word" component={withScreenWrapper(LetterAnimation)} />
              <Stack.Screen name="Game" component={withScreenWrapper(Game)} />
              <Stack.Screen name="GameOverScreen" component={withScreenWrapper(GameOverScreen)} />
              <Stack.Screen name="Words" component={withScreenWrapper(WordWrite)} />
            </React.Fragment>
          ) : (
            <React.Fragment>
              <Stack.Screen name="Splash" component={SplashScreen} />
              <Stack.Screen name="Onboarding" component={OnboardingScreen} />
              <Stack.Screen name="Login" component={LoginScreen} />
              <Stack.Screen name="Register" component={RegisterScreen} />
            </React.Fragment>
          )}
        </Stack.Navigator>
      </NavigationContainer>
    </AppContext.Provider>
  );
}

export default App;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
    padding: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    alignSelf: 'flex-start',
    marginLeft: '10%',
    marginBottom: 5,
  },
  input: {
    width: '80%',
    padding: 10,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 5,
    marginBottom: 15,
    color: '#000',
  },
  button: {
    backgroundColor: '#007AFF',
    padding: 10,
    borderRadius: 5,
    width: '80%',
    alignItems: 'center',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
  },
  link: {
    color: '#007AFF',
    marginTop: 10,
  },
});