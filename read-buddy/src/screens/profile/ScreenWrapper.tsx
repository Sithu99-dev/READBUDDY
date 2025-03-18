import React, { useState, useEffect, useContext } from 'react';
import { View, StyleSheet } from 'react-native';
import { AppContext } from '../../App';
import ProfileButton from './ProfileButton';
import firestore from '@react-native-firebase/firestore';

/**
 * Wrapper component that adds the ProfileButton to any screen
 * This makes it easy to include the profile button on all screens
 */
const ScreenWrapper = ({ children, navigation }) => {
  const { loggedInUser } = useContext(AppContext);
  const [userName, setUserName] = useState('');

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

  // Don't render the profile button if there's no logged in user
  if (!loggedInUser) {
    return <View style={styles.container}>{children}</View>;
  }

  return (
    <View style={styles.container}>
      {children}
      <ProfileButton navigation={navigation} userName={userName} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});

export default ScreenWrapper;