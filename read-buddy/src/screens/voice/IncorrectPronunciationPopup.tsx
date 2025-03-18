import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Modal } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';

const IncorrectPronunciationPopup = ({ visible, onClose, onStartAnimation }) => {
  return (
    <Modal
      transparent={true}
      visible={visible}
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={styles.modalBackground}>
        <View style={styles.modalContainer}>
          <View style={styles.contentContainer}>
            <Text style={styles.titleText}>
              Incorrect pronunciation. Click 
              <Text style={styles.highlightText}> 'Start Animation' </Text> 
              to hear the correct one.
            </Text>
            
            <TouchableOpacity 
              style={styles.closeButtonContainer}
              onPress={onClose}
            >
              <LinearGradient
                style={styles.closeButton}
                colors={['#03cdc0', '#7e34de']}
                start={{x: 0, y: 0}}
                end={{x: 1, y: 0}}
              >
                <Text style={styles.closeButtonText}>Close</Text>
              </LinearGradient>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalBackground: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContainer: {
    width: '80%',
    backgroundColor: 'white',
    borderRadius: 15,
    padding: 20,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  contentContainer: {
    width: '100%',
    alignItems: 'center',
  },
  titleText: {
    fontSize: 22,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 20,
    color: '#333',
  },
  highlightText: {
    color: 'red',
    fontWeight: 'bold',
  },
  closeButtonContainer: {
    borderRadius: 20,
    overflow: 'hidden',
    marginTop: 10,
    alignSelf: 'flex-end',
  },
  closeButton: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
  },
  closeButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default IncorrectPronunciationPopup;