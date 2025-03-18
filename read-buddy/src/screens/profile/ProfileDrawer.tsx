import React, { useState, useEffect, useContext } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Animated,
  Dimensions,
  Image,
  SafeAreaView,
  TouchableWithoutFeedback,
} from 'react-native';
import firestore from '@react-native-firebase/firestore';
import { AppContext } from '../../App';
import LinearGradient from 'react-native-linear-gradient';

const { width } = Dimensions.get('window');
const DRAWER_WIDTH = width * 0.7;

interface ProfileDrawerProps {
  isVisible: boolean;
  onClose: () => void;
  navigation: any;
}

const ProfileDrawer = ({ isVisible, onClose, navigation }: ProfileDrawerProps) => {
  const { loggedInUser, setLoggedInUser } = useContext(AppContext);
  const [userData, setUserData] = useState<any>(null);
  const [drawerAnimation] = useState(new Animated.Value(-DRAWER_WIDTH));

  // Fetch user data from Firestore
  useEffect(() => {
    const fetchUserData = async () => {
      if (!loggedInUser) {return;}

      try {
        const userDoc = await firestore()
          .collection('snake_game_leadersboard')
          .doc(loggedInUser)
          .get();

        if (userDoc.exists) {
          setUserData(userDoc.data());
        }
      } catch (error) {
        console.error('Error fetching user data:', error);
      }
    };

    fetchUserData();
  }, [loggedInUser]);

  // Animate drawer opening and closing
  useEffect(() => {
    Animated.timing(drawerAnimation, {
      toValue: isVisible ? 0 : -DRAWER_WIDTH,
      duration: 300,
      useNativeDriver: true,
    }).start();
  }, [isVisible, drawerAnimation]);

  const handleLogout = () => {
    setLoggedInUser(null);
    onClose();
  };

  const handleNavigate = (routeName: string) => {
    onClose();
    setTimeout(() => {
      navigation.navigate(routeName);
    }, 300);
  };

  if (!userData) {
    return null;
  }

  return (
    <TouchableWithoutFeedback onPress={onClose}>
      <View style={[styles.container, { display: isVisible ? 'flex' : 'none' }]}>
        <Animated.View
          style={[
            styles.drawer,
            { transform: [{ translateX: drawerAnimation }] },
          ]}
        >
          <TouchableWithoutFeedback>
            <SafeAreaView style={styles.drawerContent}>
              {/* Profile header with gradient background */}
              <LinearGradient
                colors={['#03cdc0', '#7e34de']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.profileHeader}
              >
                <View style={styles.avatarContainer}>
                  <Text style={styles.avatarText}>
                    {userData.user_name ? userData.user_name.charAt(0).toUpperCase() : 'U'}
                  </Text>
                </View>
                <Text style={styles.userName}>{userData.user_name || 'User'}</Text>
                <Text style={styles.userEmail}>{userData.email || 'email@example.com'}</Text>
              </LinearGradient>

              {/* User Information Section */}
              <View style={styles.infoSection}>
                <Text style={styles.sectionTitle}>Profile Information</Text>

                <View style={styles.infoItem}>
                  <Text style={styles.infoLabel}>Username:</Text>
                  <Text style={styles.infoValue}>{userData.user_name || 'N/A'}</Text>
                </View>

                <View style={styles.infoItem}>
                  <Text style={styles.infoLabel}>Email:</Text>
                  <Text style={styles.infoValue}>{userData.email || 'N/A'}</Text>
                </View>

                <View style={styles.infoItem}>
                  <Text style={styles.infoLabel}>Age:</Text>
                  <Text style={styles.infoValue}>{userData.age || 'N/A'}</Text>
                </View>

                <View style={styles.infoItem}>
                  <Text style={styles.infoLabel}>Score:</Text>
                  <Text style={styles.infoValue}>{userData.score || '0'}</Text>
                </View>
              </View>

              {/* Navigation Section */}
              <View style={styles.navigationSection}>
                <Text style={styles.sectionTitle}>Navigation</Text>

                <TouchableOpacity
                  style={styles.navItem}
                  onPress={() => handleNavigate('Home')}
                >
                  <Text style={styles.navText}>Home</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.navItem}
                  onPress={() => handleNavigate('Reading')}
                >
                  <Text style={styles.navText}>Reading</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.navItem}
                  onPress={() => handleNavigate('Writing')}
                >
                  <Text style={styles.navText}>Writing</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.navItem}
                  onPress={() => handleNavigate('Speech')}
                >
                  <Text style={styles.navText}>Speech</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.navItem}
                  onPress={() => handleNavigate('Focus')}
                >
                  <Text style={styles.navText}>Focus</Text>
                </TouchableOpacity>
              </View>

              {/* Logout Button */}
              <TouchableOpacity
                style={styles.logoutButton}
                onPress={handleLogout}
              >
                <Text style={styles.logoutText}>Logout</Text>
              </TouchableOpacity>
            </SafeAreaView>
          </TouchableWithoutFeedback>
        </Animated.View>
      </View>
    </TouchableWithoutFeedback>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    zIndex: 999,
  },
  drawer: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: DRAWER_WIDTH,
    height: '100%',
    backgroundColor: 'white',
    zIndex: 1000,
  },
  drawerContent: {
    flex: 1,
  },
  profileHeader: {
    padding: 20,
    alignItems: 'center',
    paddingTop: 40,
    paddingBottom: 30,
  },
  avatarContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 15,
  },
  avatarText: {
    fontSize: 36,
    fontWeight: 'bold',
    color: 'white',
  },
  userName: {
    fontSize: 20,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 5,
  },
  userEmail: {
    fontSize: 14,
    color: 'white',
    opacity: 0.8,
  },
  infoSection: {
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 15,
    color: '#333',
  },
  infoItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  infoLabel: {
    fontSize: 16,
    color: '#555',
  },
  infoValue: {
    fontSize: 16,
    color: '#333',
    fontWeight: '500',
  },
  navigationSection: {
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  navItem: {
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  navText: {
    fontSize: 16,
    color: '#333',
  },
  logoutButton: {
    margin: 20,
    padding: 15,
    backgroundColor: '#f5f5f5',
    borderRadius: 8,
    alignItems: 'center',
  },
  logoutText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#e74c3c',
  },
});

export default ProfileDrawer;
