

import * as React from 'react';
import { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator, NativeStackScreenProps } from '@react-navigation/native-stack';
import firestore from '@react-native-firebase/firestore';
import './utils/firebaseConfig';
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
import TextInputScreen from './screens/TextInputScreen'; // Ensure correct path
import SplashScreen from './screens/welcomeScreen/SplashScreen';
import OnboardingScreen from './screens/welcomeScreen/OnboardingScreen';

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

function LoginScreen({ navigation }: NativeStackScreenProps<RootStackParamList, 'Login'>) {
  const [userName, setUserName] = useState('');
  const [password, setPassword] = useState('');

  const handleLogin = async (setLoggedInUser: (user: string | null) => void) => {
    try {
      const usersSnapshot = await firestore()
        .collection('snake_game_leadersboard')
        .where('user_name', '==', userName)
        .get();

      if (!usersSnapshot.empty) {
        const userDoc = usersSnapshot.docs[0];
        const data = userDoc.data();
        if (data.password === password) {
          setLoggedInUser(data.email);
        } else {
          Alert.alert('Error', 'Invalid password');
        }
      } else {
        Alert.alert('Error', 'User name not found');
      }
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Login failed');
    }
  };

  return (
    <AppContext.Consumer>
      {({ setLoggedInUser }) => (
        <View style={styles.container}>
          <Text style={styles.title}>Login</Text>
          <Text style={styles.label}>User Name</Text>
          <TextInput
            style={styles.input}
            placeholder="Enter your user name"
            value={userName}
            onChangeText={setUserName}
            autoCapitalize="none"
          />
          <Text style={styles.label}>Password</Text>
          <TextInput
            style={styles.input}
            placeholder="Enter your password"
            value={password}
            onChangeText={setPassword}
            secureTextEntry
          />
          <TouchableOpacity style={styles.button} onPress={() => handleLogin(setLoggedInUser)}>
            <Text style={styles.buttonText}>Login</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => navigation.navigate('Register')}>
            <Text style={styles.link}>Need an account? Register</Text>
          </TouchableOpacity>
        </View>
      )}
    </AppContext.Consumer>
  );
}

function RegisterScreen({ navigation }: NativeStackScreenProps<RootStackParamList, 'Register'>) {
  const [userName, setUserName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [age, setAge] = useState('');

  const handleRegister = async () => {
    try {
      const ageNum = parseInt(age, 10);
      if (isNaN(ageNum) || ageNum <= 18) {
        Alert.alert('Error', 'Age must be greater than 18');
        return;
      }

      const usersSnapshot = await firestore()
        .collection('snake_game_leadersboard')
        .where('user_name', '==', userName)
        .get();

      if (!usersSnapshot.empty) {
        Alert.alert('Error', 'User name already exists');
        return;
      }

      // Fetch default text settings from rb_text_settings/rbts1
      const settingsDoc = await firestore()
        .collection('rb_text_settings')
        .doc('rbts1')
        .get();

      if (!settingsDoc.exists) {
        Alert.alert('Error', 'Default text settings not found in Firestore');
        return;
      }

      const defaultTextSettings = settingsDoc.data()?.textSettings;
      if (!defaultTextSettings) {
        Alert.alert('Error', 'Settings field missing in rbts1 document');
        return;
      }

      await firestore()
        .collection('snake_game_leadersboard')
        .doc(email)
        .set({
          user_name: userName,
          email,
          password,
          age: ageNum,
          score: 0,
          textSettings: defaultTextSettings, // Use fetched settings
          textScore: "1.0",
        });

      Alert.alert('Success', 'Registered! Please log in.');
      navigation.navigate('Login');
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Registration failed');
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Register</Text>
      <Text style={styles.label}>User Name</Text>
      <TextInput
        style={styles.input}
        placeholder="Enter your user name"
        value={userName}
        onChangeText={setUserName}
        autoCapitalize="none"
      />
      <Text style={styles.label}>Email</Text>
      <TextInput
        style={styles.input}
        placeholder="Enter your email"
        value={email}
        onChangeText={setEmail}
        keyboardType="email-address"
        autoCapitalize="none"
      />
      <Text style={styles.label}>Password</Text>
      <TextInput
        style={styles.input}
        placeholder="Enter your password"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
      />
      <Text style={styles.label}>Age</Text>
      <TextInput
        style={styles.input}
        placeholder="Enter your age"
        value={age}
        onChangeText={setAge}
        keyboardType="numeric"
      />
      <TouchableOpacity style={styles.button} onPress={handleRegister}>
        <Text style={styles.buttonText}>Register</Text>
      </TouchableOpacity>
      <TouchableOpacity onPress={() => navigation.navigate('Login')}>
        <Text style={styles.link}>Already have an account? Login</Text>
      </TouchableOpacity>
    </View>
  );
}

function App() {
  const [loggedInUser, setLoggedInUser] = useState<string | null>(null);
  const [initializing, setInitializing] = useState(true);

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
              <Stack.Screen name="Home" component={DashboardScreen} />
              <Stack.Screen name="Reading" component={ReadingScreen} />
              <Stack.Screen name="Writing" component={WritingScreen} />
              <Stack.Screen name="Speech" component={SpeechScreen} />
              <Stack.Screen name="Focus" component={FocusScreen} />
              <Stack.Screen name="Text Reading" component={ReadingText} />
              <Stack.Screen name="Scanned Text" component={R1Scanned} />
              <Stack.Screen name="Text Settings" component={R2TextSettings} />
              <Stack.Screen name="Text Input" component={TextInputScreen} />
              <Stack.Screen name="Reading Challenge" component={ReadingChallenge} />
              <Stack.Screen name="Writing Letters" component={WLevel1} />
              <Stack.Screen name="Writing Numbers" component={WLevel2} />
              <Stack.Screen name="Writing Level 3" component={WLevel3} />
              <Stack.Screen name="Writing Level 4" component={WLevel4} />
              <Stack.Screen name="Speech Level 1" component={SLevel1} />
              <Stack.Screen name="Speech Level 2" component={SLevel2} />
              <Stack.Screen name="Speech Level 3" component={SLevel3} />
              <Stack.Screen name="Speech Level 4" component={SLevel4} />
              <Stack.Screen name="Say the word" component={LetterAnimation} />
              <Stack.Screen name="Game" component={Game} />
              <Stack.Screen name="GameOverScreen" component={GameOverScreen} />
              <Stack.Screen name="Words" component={WordWrite} />
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