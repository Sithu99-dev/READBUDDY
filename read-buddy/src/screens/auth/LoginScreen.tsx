import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  SafeAreaView,
  ImageBackground,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import firestore from '@react-native-firebase/firestore';
import LinearGradient from 'react-native-linear-gradient';
import { RootStackParamList } from '../../App';
import { AppContext } from '../../App';

type LoginScreenProps = NativeStackScreenProps<RootStackParamList, 'Login'>;

function LoginScreen({ navigation }: LoginScreenProps) {
  const [userName, setUserName] = useState('');
  const [password, setPassword] = useState('');

  const handleLogin = async (setLoggedInUser: (user: string | null) => void) => {
    try {
      // Using username for login
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
        Alert.alert('Error', 'Username not found');
      }
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Login failed');
    }
  };

  return (
    <AppContext.Consumer>
      {({ setLoggedInUser }) => (
        <View style={styles.container}>
          {/* Top image section */}
          <View style={styles.imageContainer}>
            <ImageBackground
              source={require('../../assets/bg2.jpg')}
              style={styles.backgroundImage}
              imageStyle={{opacity: 0.7}}
              resizeMode="cover"
            >
              <Text style={styles.welcomeText}>Hello,{'\n'}Welcome Back!</Text>
            </ImageBackground>
          </View>

          {/* Login form section with rounded corners */}
          <View style={styles.formOuterContainer}>
            <View style={styles.formContainer}>
              <View style={styles.divider} />

              <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                style={styles.keyboardView}
              >
                <ScrollView contentContainerStyle={styles.scrollContainer}>
                  <Text style={styles.formTitle}>Enter to your account</Text>

                  <Text style={styles.label}>Username</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="Enter your username"
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

                  <TouchableOpacity
                    onPress={() => handleLogin(setLoggedInUser)}
                  >
                       <LinearGradient
                                      style={styles.loginButton}
                                      colors={['#03cdc0', '#7e34de']} // Blue to purple gradient
                                      start={{x: 0, y: 0}}
                                      end={{x: 1, y: 0}}
                                    >
                    <Text style={styles.loginButtonText}>login</Text>
                    </LinearGradient>
                  </TouchableOpacity>

                  <View style={styles.signupContainer}>
                    <Text style={styles.signupText}>Don't have an account? </Text>
                    <TouchableOpacity onPress={() => navigation.navigate('Register')}>
                      <Text style={styles.signupLink}>Sign up</Text>
                    </TouchableOpacity>
                  </View>
                </ScrollView>
              </KeyboardAvoidingView>
            </View>
          </View>
        </View>
      )}
    </AppContext.Consumer>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'transparent',
  },
  keyboardView: {
    flex: 1,
    width: '100%',
  },
  scrollContainer: {
    flexGrow: 1,
    paddingBottom: 20,
  },
  imageContainer: {
    height: '45%',
    width: '100%',
  },
  backgroundImage: {
    width: '100%',
    height: '100%',
    justifyContent: 'flex-end',
  },
  welcomeText: {
    fontSize: 34,
    fontWeight: 'bold',
    color: '#000',
    marginLeft: 30,
    marginBottom: 90,
    lineHeight: 42,
  },
  formOuterContainer: {
    flex: 1,
    backgroundColor: 'white',
    marginTop: -40, // Pull up to overlap with image
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    overflow: 'hidden',
  },
  formContainer: {
    flex: 1,
    paddingHorizontal: 30,
    paddingTop: 20,
  },
  divider: {
    width: 80,
    height: 5,
    backgroundColor: '#000',
    alignSelf: 'center',
    marginTop: 10,
    marginBottom: 10,
    borderRadius: 5,
  },
  formTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 30,
    textAlign: 'center',
  },
  label: {
    fontSize: 18,
    marginBottom: 10,
    color: '#000',
  },
  input: {
    backgroundColor: '#E8E8E8',
    borderRadius: 10,
    padding: 15,
    marginBottom: 10,
    fontSize: 16,
  },
  loginButton: {
    backgroundColor: '#3498db',
    borderRadius: 30,
    padding: 15,
    alignItems: 'center',
    marginVertical: 20,
  },
  loginButtonText: {
    color: 'white',
    fontSize: 20,
    fontWeight: 'bold',
    textTransform: 'lowercase',
  },
  signupContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 10,
  },
  signupText: {
    color: '#555',
    fontSize: 16,
  },
  signupLink: {
    color: 'purple',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default LoginScreen;
