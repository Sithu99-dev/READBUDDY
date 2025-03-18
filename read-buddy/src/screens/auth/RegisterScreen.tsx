import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  ImageBackground,
} from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import firestore from '@react-native-firebase/firestore';
import LinearGradient from 'react-native-linear-gradient';
import { RootStackParamList } from '../../App';

type RegisterScreenProps = NativeStackScreenProps<RootStackParamList, 'Register'>;

function RegisterScreen({ navigation }: RegisterScreenProps) {
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
          textSettings: defaultTextSettings,
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
      {/* Background Image for the top section */}
      <View style={styles.topSection}>
        <ImageBackground
          source={require('../../assets/bg2.jpg')}
          style={styles.backgroundImage}
          imageStyle={{opacity: 0.7}}
          resizeMode="cover"
        >
         {/* Empty background */}
        </ImageBackground>
      </View>
      
      {/* Form Section */}
      <View style={styles.formSection}>
         <View style={styles.headerContainer}>
            <View style={styles.divider} />
          </View>
        <Text style={styles.title}>Sign Up your account</Text>
        
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.keyboardView}
        >
          <ScrollView contentContainerStyle={styles.scrollContainer}>
            <View style={styles.formContainer}>
              <Text style={styles.label}>Username</Text>
              <TextInput
                style={styles.input}
                placeholder="Enter your name"
                placeholderTextColor="#8c8c8c"
                value={userName}
                onChangeText={setUserName}
                autoCapitalize="none"
              />
              
              <Text style={styles.label}>Email</Text>
              <TextInput
                style={styles.input}
                placeholder="Enter your email"
                placeholderTextColor="#8c8c8c"
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
              />
              
              <Text style={styles.label}>Password</Text>
              <TextInput
                style={styles.input}
                placeholder="Enter your password"
                placeholderTextColor="#8c8c8c"
                value={password}
                onChangeText={setPassword}
                secureTextEntry
              />
              
              <Text style={styles.label}>Age</Text>
              <TextInput
                style={styles.input}
                placeholder="Enter your age"
                placeholderTextColor="#8c8c8c"
                value={age}
                onChangeText={setAge}
                keyboardType="numeric"
              />
              
              <TouchableOpacity onPress={handleRegister}>
                <LinearGradient
                  style={styles.registerButton}
                  colors={['#03cdc0', '#7e34de']} // Blue to purple gradient
                  start={{x: 0, y: 0}}
                  end={{x: 1, y: 0}}
                >
                  <Text style={styles.registerButtonText}>SIGN UP</Text>
                </LinearGradient>
              </TouchableOpacity>
              
              <View style={styles.loginContainer}>
                <Text style={styles.loginText}>Already have an account? </Text>
                <TouchableOpacity onPress={() => navigation.navigate('Login')}>
                  <Text style={styles.loginLink}>Sign In</Text>
                </TouchableOpacity>
              </View>
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  topSection: {
    height: 150, // Increased height to push white screen further down
  },
  backgroundImage: {
    width: '100%',
    height: '100%',
    justifyContent: 'flex-end',
  },
  headerContainer: {
    justifyContent: 'flex-end',
    alignItems: 'center',
    paddingTop: 20, // Added top padding
    paddingBottom: 10,
  },
  divider: {
    width: 80,
    height: 5,
    backgroundColor: '#000',
    borderRadius: 5,
  },
  keyboardView: {
    flex: 1,
  },
  formSection: {
    flex: 1,
    backgroundColor: 'white',
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    marginTop: 0, // Removed negative margin to position it below the image section
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginVertical: 15,
    color: '#000',
  },
  scrollContainer: {
    flexGrow: 1,
    paddingHorizontal: 30,
  },
  formContainer: {
    flex: 1,
    paddingBottom: 20,
  },
  label: {
    fontSize: 18,
    marginBottom: 10,
    color: '#000',
    fontWeight: '500',
  },
  input: {
    backgroundColor: '#E8E8E8',
    borderRadius: 10,
    padding: 15,
    marginBottom: 20,
    fontSize: 16,
    color :'#000',
  },
  registerButton: {
    borderRadius: 30,
    padding: 15,
    alignItems: 'center',
    marginVertical: 20,
  },
  registerButtonText: {
    color: 'white',
    fontSize: 20,
    fontWeight: 'bold',
  },
  loginContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 10,
  },
  loginText: {
    color: '#555',
    fontSize: 16,
  },
  loginLink: {
    color: 'purple',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default RegisterScreen;