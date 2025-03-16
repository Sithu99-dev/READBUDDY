// firebaseConfig.js
import firebase from '@react-native-firebase/app';
import '@react-native-firebase/storage'; // Import storage to ensure it’s registered

// Firebase is usually auto-initialized on native side with google-services.json/GoogleService-Info.plist
// But you can explicitly check initialization if needed:
if (!firebase.apps.length) {
  firebase.initializeApp(); // This is optional if auto-init works
}

export default firebase;