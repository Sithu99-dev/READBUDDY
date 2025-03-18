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
  ScrollView,
} from 'react-native';
import firestore from '@react-native-firebase/firestore';
import { AppContext } from '../../App';
import LinearGradient from 'react-native-linear-gradient';
// Using a simple Text component for icons instead of external library

const { width } = Dimensions.get('window');
const DRAWER_WIDTH = width * 0.75;

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
      if (!loggedInUser) return;

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
              <ScrollView showsVerticalScrollIndicator={false}>
              {/* Profile header with gentle gradient background */}
              <LinearGradient
                colors={['#4a9dff', '#7c64ff']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.profileHeader}
              >
                <View style={styles.closeButton}>
                  <TouchableOpacity onPress={onClose}>
                    <Text style={styles.iconText}>←</Text>
                  </TouchableOpacity>
                </View>
                
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
                <Text style={styles.sectionTitle}>My Profile</Text>

                <View style={styles.infoItem}>
                  <Text style={styles.itemIcon}>👤</Text>
                  <Text style={styles.infoLabel}>Username:</Text>
                  <Text style={styles.infoValue}>{userData.user_name || 'N/A'}</Text>
                </View>

                <View style={styles.infoItem}>
                  <Text style={styles.itemIcon}>✉️</Text>
                  <Text style={styles.infoLabel}>Email:</Text>
                  <Text style={styles.infoValue}>{userData.email || 'N/A'}</Text>
                </View>

                <View style={styles.infoItem}>
                  <Text style={styles.itemIcon}>🎂</Text>
                  <Text style={styles.infoLabel}>Age:</Text>
                  <Text style={styles.infoValue}>{userData.age || 'N/A'}</Text>
                </View>

                <View style={styles.infoItem}>
                  <Text style={styles.itemIcon}>🏆</Text>
                  <Text style={styles.infoLabel}>Score:</Text>
                  <Text style={styles.infoValue}>{userData.score || '0'}</Text>
                </View>
              </View>

              {/* Navigation Section */}
              <View style={styles.navigationSection}>
                <Text style={styles.sectionTitle}>Where to Go</Text>

                <TouchableOpacity
                  style={styles.navItem}
                  onPress={() => handleNavigate('Home')}
                >
                  <Text style={styles.navIcon}>🏠</Text>
                  <Text style={styles.navText}>Home</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.navItem}
                  onPress={() => handleNavigate('Reading')}
                >
                  <Text style={styles.navIcon}>📚</Text>
                  <Text style={styles.navText}>Reading</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.navItem}
                  onPress={() => handleNavigate('Writing')}
                >
                  <Text style={styles.navIcon}>✏️</Text>
                  <Text style={styles.navText}>Writing</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.navItem}
                  onPress={() => handleNavigate('Speech')}
                >
                  <Text style={styles.navIcon}>🎤</Text>
                  <Text style={styles.navText}>Speech</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.navItem}
                  onPress={() => handleNavigate('Focus')}
                >
                  <Text style={styles.navIcon}>👁️</Text>
                  <Text style={styles.navText}>Focus</Text>
                </TouchableOpacity>
              </View>

              {/* Logout Button */}
              <TouchableOpacity
                style={styles.logoutButton}
                onPress={handleLogout}
              >
                <Text style={styles.logoutIcon}>🚪</Text>
                <Text style={styles.logoutText}>Logout</Text>
              </TouchableOpacity>
              </ScrollView>
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
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
    zIndex: 999,
  },
  drawer: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: DRAWER_WIDTH,
    height: '100%',
    backgroundColor: '#FFFFFF',
    zIndex: 1000,
    borderTopRightRadius: 20,
    borderBottomRightRadius: 20,
    shadowColor: "#000",
    shadowOffset: {
      width: 2,
      height: 0,
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  closeButton: {
    position: 'absolute',
    top: 10,
    left: 10,
    padding: 5,
  },
  iconText: {
    fontSize: 32,
    color: 'white',
    fontWeight: 'bold',
  },
  drawerContent: {
    flex: 1,
    paddingBottom: 20,
  },
  profileHeader: {
    padding: 20,
    alignItems: 'center',
    paddingTop: 50,
    paddingBottom: 30,
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
  },
  avatarContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 15,
    borderWidth: 3,
    borderColor: 'rgba(255, 255, 255, 0.7)',
  },
  avatarText: {
    fontSize: 36,
    fontWeight: 'bold',
    color: 'white',
    fontFamily: 'OpenDyslexic-Bold',
  },
  userName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 5,
    fontFamily: 'OpenDyslexic-Bold',
  },
  userEmail: {
    fontSize: 16,
    color: 'white',
    opacity: 0.9,
    fontFamily: 'OpenDyslexic-Regular',
  },
  infoSection: {
    padding: 20,
    backgroundColor: '#f9f9f9',
    margin: 10,
    borderRadius: 15,
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 15,
    color: '#333',
    fontFamily: 'OpenDyslexic-Bold',
    borderBottomWidth: 2,
    borderBottomColor: '#4a9dff',
    paddingBottom: 5,
  },
  infoItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 5,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  itemIcon: {
    marginRight: 10,
    fontSize: 24,
    color: "#4a9dff",
  },
  infoLabel: {
    fontSize: 16,
    color: '#555',
    fontFamily: 'OpenDyslexic-Regular',
    width: 100,
  },
  infoValue: {
    fontSize: 16,
    color: '#333',
    fontWeight: '500',
    fontFamily: 'OpenDyslexic-Regular',
    flex: 1,
  },
  navigationSection: {
    padding: 20,
    margin: 10,
    backgroundColor: '#f9f9f9',
    borderRadius: 15,
  },
  navItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 15,
    paddingHorizontal: 5,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  navIcon: {
    marginRight: 15,
    fontSize: 28,
    color: "#4a9dff",
  },
  navText: {
    fontSize: 18,
    color: '#333',
    fontFamily: 'OpenDyslexic-Regular',
  },
  logoutButton: {
    margin: 20,
    marginBottom: 30,
    padding: 15,
    backgroundColor: '#f9f9f9',
    borderRadius: 12,
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#e74c3c',
  },
  logoutIcon: {
    marginRight: 10,
    fontSize: 24,
    color: "#e74c3c",
  },
  logoutText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#e74c3c',
    fontFamily: 'OpenDyslexic-Bold',
  },
});

export default ProfileDrawer;