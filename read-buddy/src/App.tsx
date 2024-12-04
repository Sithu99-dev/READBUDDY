// In App.js in a new project

import * as React from 'react';
import { View, Text } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import DashboardScreen from './screens/Dashboard';
import ReadingScreen from './screens/ReadingScreen';
import WritingScreen from './screens/WritingScreen';
import SpeechScreen from './screens/SpeechScreen';
import FocusScreen from './screens/FocusScreen';
import R1Scanned from './screens/R1Scanned';
import R2TextSettings from './screens/R2TextSettings';
import WLevel1 from './screens/WLevel1';
import WLevel2 from './screens/WLevel2';
import WLevel3 from './screens/WLevel3';
import WLevel4 from './screens/WLevel4';
import SLevel1 from './screens/SLevel1';
import SLevel2 from './screens/SLevel2';
import SLevel3 from './screens/SLevel3';
import SLevel4 from './screens/SLevel4';

function HomeScreen() {
  return (
    <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
      <Text>Home Screen</Text>
    </View>
  );
}

const Stack = createNativeStackNavigator();

function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator>
        <Stack.Screen name="Home" component={DashboardScreen} />
        <Stack.Screen name="Reading" component={R2TextSettings} />
        <Stack.Screen name="Writing" component={WritingScreen} />
        <Stack.Screen name="Speech" component={SpeechScreen} />
        <Stack.Screen name="Focus" component={FocusScreen} />
        <Stack.Screen name="Scanned Text" component={R1Scanned} />
        <Stack.Screen name="Text Settings" component={R2TextSettings} />
        <Stack.Screen name="Writing Level 1" component={WLevel1} />
        <Stack.Screen name="Writing Level 2" component={WLevel2} />
        <Stack.Screen name="Writing Level 3" component={WLevel3} />
        <Stack.Screen name="Writing Level 4" component={WLevel4} />
        <Stack.Screen name="Speech Level 1" component={SLevel1} />
        <Stack.Screen name="Speech Level 2" component={SLevel2} />
        <Stack.Screen name="Speech Level 3" component={SLevel3} />
        <Stack.Screen name="Speech Level 4" component={SLevel4} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}

export default App;