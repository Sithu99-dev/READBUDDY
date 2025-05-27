// data/url.js - Replace your existing url.js file with this

import firestore from '@react-native-firebase/firestore';

// Default fallback URLs
const DEFAULT_URLS = {
//   myurl: "https://84fa-34-87-185-114.ngrok-free.app",
//   numberDetector: "https://73e5-35-237-39-5.ngrok-free.app"
};

// Cache to store URLs
let urlCache = null;

/**
 * Initialize URLs in Firebase Firestore (Run this once to set up)
 * You can call this function from your app or run it manually
 */
// export const setupUrlsInFirebase = async () => {
//   try {
//     console.log('Setting up URLs in Firebase...');
    
//     await firestore()
//       .collection('config')
//       .doc('api_urls')
//       .set({
//         myurl: "https://84fa-34-87-185-114.ngrok-free.app",
//         numberDetector: "https://73e5-35-237-39-5.ngrok-free.app",
//         createdAt: firestore.FieldValue.serverTimestamp(),
//         lastUpdated: firestore.FieldValue.serverTimestamp()
//       });
    
//     console.log('✅ URLs successfully stored in Firebase!');
//     return true;
//   } catch (error) {
//     console.error('❌ Error setting up URLs in Firebase:', error);
//     return false;
//   }
// };

/**
 * Get URLs from Firebase
 */
const getUrlsFromFirebase = async () => {
  try {
    // Return cached URLs if available
    if (urlCache) {
      console.log('Using cached URLs');
      return urlCache;
    }

    console.log('Fetching URLs from Firebase...');
    
    const doc = await firestore()
      .collection('config')
      .doc('api_urls')
      .get();

    if (doc.exists) {
      const data = doc.data();
      
      // Cache the URLs
      urlCache = {
        myurl: data.myurl,
        numberDetector: data.numberDetector
      };
      
      console.log('✅ URLs loaded from Firebase:', urlCache);
      return urlCache;
    } else {
      console.log('⚠️ No URL config found in Firebase, using defaults');
      return DEFAULT_URLS;
    }
  } catch (error) {
    console.error('❌ Error fetching URLs from Firebase:', error);
    console.log('Using fallback URLs');
    return DEFAULT_URLS;
  }
};

/**
 * Update URLs in Firebase (when your ngrok URLs change)
 */
export const updateUrlsInFirebase = async (newMyUrl, newNumberDetectorUrl) => {
  try {
    console.log('Updating URLs in Firebase...');
    
    await firestore()
      .collection('config')
      .doc('api_urls')
      .update({
        myurl: newMyUrl,
        numberDetector: newNumberDetectorUrl,
        lastUpdated: firestore.FieldValue.serverTimestamp()
      });
    
    // Clear cache so next fetch gets new URLs
    urlCache = null;
    
    console.log('✅ URLs updated in Firebase');
    return true;
  } catch (error) {
    console.error('❌ Error updating URLs:', error);
    return false;
  }
};

/**
 * Get the myurl - this replaces your current export
 */
let myurlPromise = null;
export const getMyUrl = async () => {
  if (!myurlPromise) {
    myurlPromise = getUrlsFromFirebase().then(urls => urls.myurl);
  }
  return myurlPromise;
};

/**
 * Get the numberDetector URL
 */
let numberDetectorPromise = null;
export const getNumberDetectorUrl = async () => {
  if (!numberDetectorPromise) {
    numberDetectorPromise = getUrlsFromFirebase().then(urls => urls.numberDetector);
  }
  return numberDetectorPromise;
};

// For backward compatibility - these will be populated after first Firebase call
export let myurl = DEFAULT_URLS.myurl;
export let numberDetector = DEFAULT_URLS.numberDetector;

// Initialize URLs when module loads
(async () => {
  try {
    const urls = await getUrlsFromFirebase();
    myurl = urls.myurl;
    numberDetector = urls.numberDetector;
  } catch (error) {
    console.log('Using default URLs due to initialization error');
  }
})();

/**
 * Helper function to refresh URLs (call this when your ngrok URLs change)
 */
export const refreshUrls = async () => {
  urlCache = null; // Clear cache
  myurlPromise = null;
  numberDetectorPromise = null;
  
  const urls = await getUrlsFromFirebase();
  myurl = urls.myurl;
  numberDetector = urls.numberDetector;
  
  return urls;
};