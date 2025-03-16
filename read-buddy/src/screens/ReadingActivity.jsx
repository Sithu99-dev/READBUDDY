import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, Image, StyleSheet } from 'react-native';
import { useNavigation } from '@react-navigation/native';

const ReadingActivity = () => {
 const [currentLevel, setCurrentLevel] = useState(1);
 const [options, setOptions] = useState([]);
 const [score, setScore] = useState(0);
 const navigation = useNavigation();

 useEffect(() => {
   shuffleOptions();
 }, [currentLevel]);

 const shuffleOptions = () => {
   const words = ['dog', 'bog'];
   const shuffled = words.sort(() => Math.random() - 0.5);
   setOptions(shuffled);
 };
 // calculate the score and navigate level 
 const checkAnswer = (selected) => {
    if (selected === 'dog') {
      if (currentLevel === 5) {
        
        const finalScore = score + 1;
        navigation.navigate('NextActivity', { finalScore });
      } else {
        setScore(prev => prev + 1);
        setCurrentLevel(prev => prev + 1);
      }
    } else {

      if (currentLevel === 5) {
        navigation.navigate('NextActivity', { finalScore: score });
      } else {
        setCurrentLevel(prev => prev + 1);
      }
    }
  };

 const getDisplayText = (word) => {
   switch (currentLevel) {
     case 1:
       return <Text style={[styles.optionText, styles.level1Text]}>{word}</Text>;
     case 2:
       return <Text style={[styles.optionText, styles.level2Text]}>
         <Text style={styles.firstLetter}>{word[0]}</Text>
         <Text>{word.slice(1)}</Text>
       </Text>;
     case 3:
       return <Text style={[styles.optionText, styles.level3Text]}>
         <Text style={styles.highlightedLetter}>{word[0]}</Text>
         <Text>{word.slice(1)}</Text>
       </Text>;
     case 4:
       return <Text style={[styles.optionText, styles.level4Text]}>
         <Text style={styles.blueHighlight}>{word[0]}</Text>
         <Text>{word.slice(1)}</Text>
       </Text>;
     case 5:
       return <Text style={[styles.optionText, styles.level5Text]}>
         <Text style={styles.purpleHighlight}>{word[0]}</Text>
         <Text>{word.slice(1)}</Text>
       </Text>;
     default:
       return <Text style={styles.optionText}>{word}</Text>;
   }
 };

 return (
   <View style={styles.container}>
     <Text style={styles.levelText}>LEVEL {currentLevel}</Text>
     <Text style={styles.scoreText}>{score} out of 5</Text>
     
     <View style={styles.card}>
       <Image 
         source={require('../assets/dog.png')}
         style={styles.image}
         resizeMode="contain"
       />
       
       <View style={styles.optionsContainer}>
         {options.map((option, index) => (
           <TouchableOpacity 
             key={index}
             style={styles.option}
             onPress={() => checkAnswer(option)}
           >
             {getDisplayText(option)}
           </TouchableOpacity>
         ))}
       </View>
     </View>
   </View>
 );
};

const styles = StyleSheet.create({
 container: {
   flex: 1,
   backgroundColor: '#1a1a1a',
   padding: 20,
   alignItems: 'center',
   justifyContent: 'center',
 },
 levelText: {
   color: 'white',
   fontSize: 24,
   fontWeight: 'bold',
   fontFamily: 'Arial',
   marginBottom: 10,
 },
 scoreText: {
   color: '#4CAF50',
   fontSize: 20,
   fontWeight: 'bold',
   marginBottom: 20,
 },
 card: {
   backgroundColor: 'white',
   borderRadius: 10,
   padding: 20,
   width: '90%',
   alignItems: 'center',
   borderWidth: 2,
   borderColor: 'white',
 },
 image: {
   width: 200,
   height: 200,
   marginBottom: 20,
 },
 optionsContainer: {
   width: '100%',
   gap: 10,
 },
 option: {
   backgroundColor: '#1a1a1a',
   padding: 15,
   borderRadius: 5,
   alignItems: 'center',
   marginBottom: 10,
 },
 optionText: {
   color: 'white',
   fontSize: 28,
   fontWeight: 'bold',
   fontFamily: 'Arial',
   letterSpacing: 12,
 },
 level1Text: {
   fontSize: 32,
   letterSpacing: 15,
 },
 level2Text: {
   fontSize: 30,
   letterSpacing: 12,
 },
 level3Text: {
   fontSize: 28,
   letterSpacing: 10,
 },
 level4Text: {
   fontSize: 26,
   letterSpacing: 8,
 },
 level5Text: {
   fontSize: 24,
   letterSpacing: 6,
 },
 firstLetter: {
   color: '#4CAF50',
   fontWeight: '900',
 },
 highlightedLetter: {
   color: '#ff6b6b',
   fontWeight: '900',
 },
 blueHighlight: {
   color: '#4287f5',
   fontWeight: '900',
 },
 purpleHighlight: {
   color: '#9c27b0',
   fontWeight: '900',
 }
});

export default ReadingActivity;