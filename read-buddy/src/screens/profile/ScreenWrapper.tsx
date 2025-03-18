import React, { useState, useEffect, useContext } from 'react';
import {
  View,
  StyleSheet,
  TouchableOpacity,
  Text,
  Platform,
  SafeAreaView,
  StatusBar
} from 'react-native';
import { AppContext } from '../../App';
import firestore from '@react-native-firebase/firestore';
import LinearGradient from 'react-native-linear-gradient';
import ProfileDrawer from './ProfileDrawer';

/**
 * Wrapper component that adds navigation buttons directly on the background
 * without a separate white top bar
 */
const ScreenWrapper = ({ children, navigation, hideBackButton = false, backgroundColor = '#5FC3C0', screenName }) => {
  const { loggedInUser } = useContext(AppContext);
  const [userName, setUserName] = useState('');
  const [isDrawerVisible, setIsDrawerVisible] = useState(false);

  // Check if current screen is Dashboard
  const isDashboard = screenName === 'Home' || navigation?.getState()?.routes?.[navigation.getState().index]?.name === 'Home';
  
  // Decide whether to hide back button
  const shouldHideBackButton = hideBackButton || isDashboard;

  useEffect(() => {
    const fetchUserData = async () => {
      if (!loggedInUser) return;

      try {
        const userDoc = await firestore()
          .collection('snake_game_leadersboard')
          .doc(loggedInUser)
          .get();

        if (userDoc.exists) {
          const data = userDoc.data();
          setUserName(data.user_name || '');
        }
      } catch (error) {
        console.error('Error fetching user data:', error);
      }
    };

    fetchUserData();
  }, [loggedInUser]);

  const handleGoBack = () => {
    if (navigation.canGoBack()) {
      navigation.goBack();
    }
  };

  const openDrawer = () => {
    setIsDrawerVisible(true);
  };

  const closeDrawer = () => {
    setIsDrawerVisible(false);
  };

  // Get first letter of username for avatar
  const firstLetter = userName ? userName.charAt(0).toUpperCase() : 'S';

  // Don't render the navigation buttons if there's no logged in user
  if (!loggedInUser) {
    return <View style={[styles.container, { backgroundColor }]}>{children}</View>;
  }

  return (
    <View style={[styles.container, { backgroundColor }]}>
      <StatusBar backgroundColor={backgroundColor} barStyle="dark-content" />
      
      {/* Buttons directly on the background */}
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.buttonsContainer}>
          {/* Back Button */}
          {!shouldHideBackButton ? (
            <TouchableOpacity
              style={styles.buttonWrapper}
              onPress={handleGoBack}
              activeOpacity={0.7}
            >
              <LinearGradient
                colors={['#36D1DC', '#5B86E5']}
                start={{x: 0, y: 0}}
                end={{x: 1, y: 1}}
                style={styles.button}
              >
                <Text style={styles.backButtonText}>←</Text>
              </LinearGradient>
            </TouchableOpacity>
          ) : (
            <View style={styles.emptySpace} />
          )}
          
          {/* Profile Button */}
          <TouchableOpacity
            style={styles.buttonWrapper}
            onPress={openDrawer}
            activeOpacity={0.7}
          >
            <LinearGradient
              colors={['#36D1DC', '#5B86E5']}
              start={{x: 0, y: 0}}
              end={{x: 1, y: 1}}
              style={styles.button}
            >
              <Text style={styles.profileButtonText}>{firstLetter}</Text>
            </LinearGradient>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
      
      {/* Main content */}
      <View style={styles.childrenContainer}>
        {children}
      </View>
      
      {/* Profile Drawer */}
      <ProfileDrawer
        isVisible={isDrawerVisible}
        onClose={closeDrawer}
        navigation={navigation}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  safeArea: {
    width: '100%',
  },
  buttonsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: Platform.OS === 'ios' ? 15 : 20,
    paddingBottom: 10,
  },
  buttonWrapper: {
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
    borderRadius: 24,
  },
  button: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  backButtonText: {
    fontSize: 38,
    fontWeight: 'bold',
    color: 'white',
    textAlign: 'center',
    marginTop: -5,
  },
  profileButtonText: {
    fontSize: 22,
    fontWeight: 'bold',
    color: 'white',
  },
  emptySpace: {
    width: 48,
  },
  childrenContainer: {
    flex: 1,
  }
});

export default ScreenWrapper;