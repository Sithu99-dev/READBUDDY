import React, { useState } from 'react';
import {
  TouchableOpacity,
  StyleSheet,
  View,
  Text,
} from 'react-native';
import ProfileDrawer from './ProfileDrawer';

interface ProfileButtonProps {
  navigation: any;
  userName?: string;
  position?: 'topRight' | 'topLeft' | 'bottomRight' | 'bottomLeft';
  top?: number;
  right?: number;
  bottom?: number;
  left?: number;
  size?: number;
}

const ProfileButton = ({ 
  navigation, 
  userName,
  position = 'topRight',
  top,
  right,
  bottom,
  left,
  size = 40
}: ProfileButtonProps) => {
  const [isDrawerVisible, setIsDrawerVisible] = useState(false);

  const openDrawer = () => {
    setIsDrawerVisible(true);
  };

  const closeDrawer = () => {
    setIsDrawerVisible(false);
  };

  // Get first letter of username for avatar
  const firstLetter = userName ? userName.charAt(0).toUpperCase() : 'U';

  // Calculate position styles based on props
  const getPositionStyle = () => {
    // Use provided values if they exist
    if (typeof top === 'number' || typeof right === 'number' || 
        typeof bottom === 'number' || typeof left === 'number') {
      return {
        top: typeof top === 'number' ? top : undefined,
        right: typeof right === 'number' ? right : undefined,
        bottom: typeof bottom === 'number' ? bottom : undefined,
        left: typeof left === 'number' ? left : undefined,
      };
    }

    // Otherwise use predefined positions
    switch (position) {
      case 'topRight':
        return { top: 40, right: 20 };
      case 'topLeft':
        return { top: 40, left: 20 };
      case 'bottomRight':
        return { bottom: 40, right: 20 };
      case 'bottomLeft':
        return { bottom: 40, left: 20 };
      default:
        return { top: 40, right: 20 };
    }
  };

  return (
    <>
      <TouchableOpacity 
        style={[
          styles.profileButton, 
          getPositionStyle()
        ]} 
        onPress={openDrawer}
      >
        <View 
          style={[
            styles.avatarContainer,
            { width: size, height: size, borderRadius: size/2 }
          ]}
        >
          <Text style={styles.avatarText}>{firstLetter}</Text>
        </View>
      </TouchableOpacity>

      <ProfileDrawer
        isVisible={isDrawerVisible}
        onClose={closeDrawer}
        navigation={navigation}
      />
    </>
  );
};

const styles = StyleSheet.create({
  profileButton: {
    position: 'absolute',
    zIndex: 10,
  },
  avatarContainer: {
    backgroundColor: '#03cdc0',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'white',
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
  },
  avatarText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: 'white',
  }
});

export default ProfileButton;