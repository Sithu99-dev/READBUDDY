import React, { useEffect, useState, useContext } from 'react';
import {
  SafeAreaView,
  StyleSheet,
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Alert,
  ImageBackground,
  Dimensions,
} from 'react-native';
import { PanGestureHandler, GestureHandlerRootView } from 'react-native-gesture-handler';
import { Colors } from '../styles/colors';
import { Direction, Coordinate, GestureEventType } from '../types/types';
import { checkGameOver } from '../utils/checkGameOver';
import { randomFoodPosition } from '../utils/randomFoodPosition';
import Food from './Food';
import WrongFruit from './WrongFruit';
import Header from './Header';
import Score from './Score';
import Snake from './Snake';
import firestore from '@react-native-firebase/firestore';
import { AppContext } from '../App.tsx';
import gameResults from '../data/game_result.json';
import Sound from 'react-native-sound';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../App.tsx'; // Adjust path if needed

const SNAKE_INITIAL_POSITION: Coordinate[] = [{ x: 5, y: 5 }];
const FOOD_INITIAL_POSITION: Coordinate = { x: 5, y: 20 };
const GAME_BOUNDS = { xMin: 0, xMax: 35, yMin: 0, yMax: 59 };
const MOVE_INTERVAL = 200;
const SCORE_INCREMENT = 10;

Sound.setCategory('Playback');

const biteSound = new Sound('bite.mp3', Sound.MAIN_BUNDLE, (error) => {
  if (error) {console.log('Failed to load bite sound:', error);}
  else {console.log('Bite sound loaded successfully');}
});

const crashSound = new Sound('crash.mp3', Sound.MAIN_BUNDLE, (error) => {
  if (error) {console.log('Failed to load crash sound:', error);}
  else {console.log('Crash sound loaded successfully');}
});

function getRandomFruitEmoji(): string {
  const fruitEmojis = ['🍎', '🍊', '🍋', '🍇', '🍉', '🍓', '🍑', '🍍'];
  const randomIndex = Math.floor(Math.random() * fruitEmojis.length);
  return fruitEmojis[randomIndex];
}

// Type the navigation prop using RootStackParamList
export default function Game({ navigation }: NativeStackScreenProps<RootStackParamList, 'Game'>): JSX.Element {
  const { loggedInUser } = useContext(AppContext);
  const [direction, setDirection] = useState<Direction>(Direction.Right);
  const [snake, setSnake] = useState<Coordinate[]>(SNAKE_INITIAL_POSITION);
  const [food, setFood] = useState<Coordinate>(FOOD_INITIAL_POSITION);
  const [wrongFruits, setWrongFruits] = useState<Coordinate[]>([]);
  const [score, setScore] = useState<number>(0);
  const [isGameOver, setIsGameOver] = useState<boolean>(false);
  const [isPaused, setIsPaused] = useState<boolean>(false);
  const [level, setLevel] = useState<number>(1);
  const [isLevelSelected, setIsLevelSelected] = useState<boolean>(false);
  const [rightFruitEmoji, setRightFruitEmoji] = useState<string>(getRandomFruitEmoji());
  const [fruitSpawnTime, setFruitSpawnTime] = useState<number>(Date.now());
  const [timeToReachFruit, setTimeToReachFruit] = useState<number[]>([]);
  const [gameOverResult, setGameOverResult] = useState<{
    result: string;
    description: string;
    topic1: string;
    topic2: string;
    topic3: string;
    topic4: string;
    topic5: string;
    topic6: string;
    topic7: string;
    message1: string;
    message2: string;
    message3: string;
    message4: string;
    message5: string;
    message6: string;
    message7: string;
  } | null>(null);
  const [topPlayers, setTopPlayers] = useState<{ user_name: string; score: number; email: string }[]>([]);
  const [currentUserScore, setCurrentUserScore] = useState<number>(0);

  useEffect(() => {
    const fetchLeaderboard = async () => {
      if (!loggedInUser) {return;}

      try {
        const leaderboardSnapshot = await firestore()
          .collection('snake_game_leadersboard')
          .orderBy('score', 'desc')
          .limit(3)
          .get();
        const topPlayersData = leaderboardSnapshot.docs.map((doc) => ({
          user_name: doc.data().user_name || 'Unknown',
          score: doc.data().score || 0,
          email: doc.id,
        }));
        setTopPlayers(topPlayersData);

        const currentUserDoc = await firestore()
          .collection('snake_game_leadersboard')
          .doc(loggedInUser)
          .get();
        if (currentUserDoc.exists) {
          const userData = currentUserDoc.data();
          setCurrentUserScore(userData?.score || 0);
        }
      } catch (error) {
        console.error('Error fetching leaderboard:', error);
      }
    };

    fetchLeaderboard();
  }, [loggedInUser]);

  const updateHighScore = async (newScore: number) => {
    if (!loggedInUser) {return;}

    try {
      const userRef = firestore().collection('snake_game_leadersboard').doc(loggedInUser);
      const userDoc = await userRef.get();

      if (userDoc.exists) {
        const userData = userDoc.data();
        const storedScore = userData?.score || 0;
        if (newScore > storedScore) {
          await userRef.update({ score: newScore });
          setCurrentUserScore(newScore);
          console.log('High score updated:', newScore);

          const leaderboardSnapshot = await firestore()
            .collection('snake_game_leadersboard')
            .orderBy('score', 'desc')
            .limit(3)
            .get();
          const updatedTopPlayers = leaderboardSnapshot.docs.map((doc) => ({
            user_name: doc.data().user_name || 'Unknown',
            score: doc.data().score || 0,
            email: doc.id,
          }));
          setTopPlayers(updatedTopPlayers);
        }
      }
    } catch (error) {
      console.error('Error updating high score:', error);
    }
  };

  const initializeWrongFruits = (count: number) => {
    const newWrongFruits: Coordinate[] = [];
    for (let i = 0; i < count; i++) {
      const position = randomFoodPosition(
        GAME_BOUNDS.xMax,
        GAME_BOUNDS.yMax,
        [...snake, food, ...newWrongFruits]
      );
      newWrongFruits.push(position);
    }
    setWrongFruits(newWrongFruits);
  };

  const handleLevelSelect = (selectedLevel: number) => {
    setLevel(selectedLevel);
    setIsLevelSelected(true);
    initializeWrongFruits(selectedLevel * 2);
  };

  const getMoveInterval = () => {
    const speedIncrease = (level - 1) * 20;
    const interval = MOVE_INTERVAL - speedIncrease;
    return interval > 50 ? interval : 50;
  };

  useEffect(() => {
    if (!isGameOver && isLevelSelected) {
      const intervalId = setInterval(() => {
        if (!isPaused) {moveSnake();}
      }, getMoveInterval());
      return () => clearInterval(intervalId);
    }
  }, [snake, isGameOver, isPaused, level, isLevelSelected]);

  const spawnNewFood = () => {
    const newFoodPosition = randomFoodPosition(
      GAME_BOUNDS.xMax,
      GAME_BOUNDS.yMax,
      [...snake, ...wrongFruits]
    );
    if (
      newFoodPosition.x >= GAME_BOUNDS.xMin &&
      newFoodPosition.x <= GAME_BOUNDS.xMax &&
      newFoodPosition.y >= GAME_BOUNDS.yMin &&
      newFoodPosition.y <= GAME_BOUNDS.yMax
    ) {
      setFood(newFoodPosition);
      setRightFruitEmoji(getRandomFruitEmoji());
      setFruitSpawnTime(Date.now());
    } else {
      spawnNewFood();
    }
  };

  const moveSnake = () => {
    const snakeHead = snake[0];
    const newHead: Coordinate = { ...snakeHead };

    switch (direction) {
      case Direction.Up:
        newHead.y -= 1;
        break;
      case Direction.Down:
        newHead.y += 1;
        break;
      case Direction.Left:
        newHead.x -= 1;
        break;
      case Direction.Right:
        newHead.x += 1;
        break;
      default:
        break;
    }

    if (checkGameOver(newHead, GAME_BOUNDS)) {
      setIsGameOver(true);
      crashSound.play((success) => {
        if (success) {console.log('Crash sound played successfully');}
        else {console.log('Crash sound playback failed');}
      });
      return;
    }

    if (snake.some(segment => segment.x === newHead.x && segment.y === newHead.y)) {
      setIsGameOver(true);
      crashSound.play((success) => {
        if (success) {console.log('Crash sound played successfully');}
        else {console.log('Crash sound playback failed');}
      });
      return;
    }

    const tolerance = 1;
    const hasEatenWrongFruit = wrongFruits.some(
      (fruit) =>
        Math.abs(fruit.x - newHead.x) <= tolerance &&
        Math.abs(fruit.y - newHead.y) <= tolerance
    );
    if (hasEatenWrongFruit) {
      setIsGameOver(true);
      crashSound.play((success) => {
        if (success) {console.log('Crash sound played successfully');}
        else {console.log('Crash sound playback failed');}
      });
      return;
    }

    const foodTolerance = 2;
    if (Math.abs(newHead.x - food.x) <= foodTolerance && Math.abs(newHead.y - food.y) <= foodTolerance) {
      const timeTaken = (Date.now() - fruitSpawnTime) / 1000;
      setTimeToReachFruit(prev => [...prev, timeTaken]);
      spawnNewFood();
      setSnake([newHead, ...snake]);
      setScore(prevScore => prevScore + SCORE_INCREMENT);
      biteSound.play((success) => {
        if (success) {console.log('Bite sound played successfully');}
        else {console.log('Bite sound playback failed');}
      });
    } else {
      setSnake([newHead, ...snake.slice(0, -1)]);
    }
  };

  const handleGesture = (event: GestureEventType) => {
    const { translationX, translationY } = event.nativeEvent;
    let newDirection = direction;

    if (Math.abs(translationX) > Math.abs(translationY)) {
      if (translationX > 0 && direction !== Direction.Left) {
        newDirection = Direction.Right;
      } else if (translationX < 0 && direction !== Direction.Right) {
        newDirection = Direction.Left;
      }
    } else {
      if (translationY > 0 && direction !== Direction.Up) {
        newDirection = Direction.Down;
      } else if (translationY < 0 && direction !== Direction.Down) {
        newDirection = Direction.Up;
      }
    }

    setDirection(newDirection);
  };

  const reloadGame = () => {
    setIsLevelSelected(false);
    setLevel(1);
    setSnake(SNAKE_INITIAL_POSITION);
    setFood(FOOD_INITIAL_POSITION);
    setWrongFruits([]);
    setIsGameOver(false);
    setScore(0);
    setDirection(Direction.Right);
    setIsPaused(false);
    setRightFruitEmoji(getRandomFruitEmoji());
    setTimeToReachFruit([]);
    setFruitSpawnTime(Date.now());
    setGameOverResult(null);
  };

  const pauseGame = () => {
    setIsPaused(!isPaused);
  };

  useEffect(() => {
    if (isGameOver) {
      const averageSpeed = timeToReachFruit.length > 0
        ? timeToReachFruit.reduce((a, b) => a + b, 0) / timeToReachFruit.length
        : 0;
  
      console.log(`Level: ${level}, Average Speed: ${averageSpeed}, Score: ${score}`);
  
      // Find matching result based on level and average speed range
      let result;
      
      if (timeToReachFruit.length === 0) {
        // If player didn't eat any food, find a "Low" result for their level
        result = gameResults.find(record =>
          record.level === level && record.result.includes('Low')
        );
      } else {
        // Find result where level matches and speed is within range
        result = gameResults.find(record =>
          record.level === level &&
          averageSpeed >= record.rangemin &&
          averageSpeed <= record.rangemax
        );
        
        // If no matching range found, find closest one
        if (!result) {
          const levelResults = gameResults.filter(record => record.level === level);
          
          if (levelResults.length > 0) {
            // Default to "Medium" if we can't determine the exact match
            result = levelResults.find(record => record.result.includes('Medium'));
            
            // Log warning about unmatched range
            console.warn(`No exact range match found for level ${level} with speed ${averageSpeed}`);
          }
        }
      }
  
      const gameResult = result || {
        result: "Unknown",
        description: "No matching performance range found.",
        topic1: "", topic2: "", topic3: "", topic4: "", topic5: "", topic6: "", topic7: "",
        message1: "", message2: "", message3: "", message4: "", message5: "", message6: "", message7: "",
      };
      
      setGameOverResult(gameResult);
  
      if (!navigation) {
        console.error('Navigation prop is undefined in Game component');
        return;
      }
  
      Alert.alert(
        'Game Over',
        `Your Score: ${score}`,
        [
          {
            text: 'Tap to See Result',
            onPress: () => navigation.navigate('GameOverScreen', { score, result: gameResult }),
          },
        ],
        { cancelable: false }
      );
  
      updateHighScore(score);
    }
  }, [isGameOver, score, navigation]);
  
  if (!isLevelSelected) {
    return (
      <ImageBackground 
      source={require('../assets/speakingbg.png')}
        style={styles.levelSelectionBackground}
        imageStyle={{opacity: 0.3}}>
        <ScrollView contentContainerStyle={styles.levelSelectionContainer}>
          {/* Scoreboard Section */}
          <View style={styles.scoreboardContainer}>
            <Text style={styles.scoreboardTitle}>Scoreboard</Text>
            <View style={styles.scoreboardItems}>
              {topPlayers.map((player, index) => (
                <View key={index} style={styles.scoreItem}>
                  <Text style={styles.scoreItemText}>
                    {index + 1}. {player.user_name}: {player.score}
                  </Text>
                </View>
              ))}
              {topPlayers.length === 0 && (
                <>
                  <View style={styles.scoreItem}></View>
                  <View style={styles.scoreItem}></View>
                  <View style={styles.scoreItem}></View>
                </>
              )}
            </View>
          </View>
          
          {/* Level Selection Title */}
          <Text style={styles.levelSelectionTitle}>Level Selection</Text>
          
          {/* Level Buttons */}
          <View style={styles.levelsContainer}>
            <TouchableOpacity 
              style={[styles.levelButton, styles.level1]}
              onPress={() => handleLevelSelect(1)}>
              <Text style={styles.levelButtonText}>Level 01</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={[styles.levelButton, styles.level2]}
              onPress={() => handleLevelSelect(2)}>
              <Text style={styles.levelButtonText}>Level 02</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={[styles.levelButton, styles.level3]}
              onPress={() => handleLevelSelect(3)}>
              <Text style={styles.levelButtonText}>Level 03</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={[styles.levelButton, styles.level4]}
              onPress={() => handleLevelSelect(4)}>
              <Text style={styles.levelButtonText}>Level 04</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={[styles.levelButton, styles.level5]}
              onPress={() => handleLevelSelect(5)}>
              <Text style={styles.levelButtonText}>Level 05</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </ImageBackground>
    );
  }

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <PanGestureHandler onGestureEvent={handleGesture}>
        <SafeAreaView style={styles.container}>
          <Header
            reloadGame={reloadGame}
            pauseGame={pauseGame}
            isPaused={isPaused}
            rightFruitEmoji={rightFruitEmoji}
          >
            <View style={styles.headerContent}>
              <Score score={score} />
              <Text style={styles.gameLevelText}>Level: {level}</Text>
            </View>
          </Header>
          <View style={styles.boundaries}>
            <Snake snake={snake} />
            <Food x={food.x} y={food.y} emoji={rightFruitEmoji} />
            {wrongFruits.map((fruit, index) => (
              <WrongFruit key={index} x={fruit.x} y={fruit.y} />
            ))}
          </View>
        </SafeAreaView>
      </PanGestureHandler>
    </GestureHandlerRootView>
  );
}

const windowHeight = Dimensions.get('window').height;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.primary,
  },
  levelSelectionBackground: {
    flex: 1,
    backgroundColor: '#5ECCD9', // Turquoise background color
  },
  levelSelectionContainer: {
    flexGrow: 1,
    alignItems: 'center',
    paddingVertical: 20,
    paddingHorizontal: 20,
  },
  scoreboardContainer: {
    width: '90%',
    backgroundColor: 'white',
    borderRadius: 25,
    paddingVertical: 15,
    paddingHorizontal: 15,
    alignItems: 'center',
    marginBottom: 20,
  },
  scoreboardTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: 'black',
    marginBottom: 10,
  },
  scoreboardItems: {
    width: '100%',
  },
  scoreItem: {
    backgroundColor: '#E8E8E8', // Light gray background
    borderRadius: 10,
    height: 40,
    justifyContent: 'center',
    paddingHorizontal: 10,
    marginVertical: 5,
  },
  scoreItemText: {
    fontSize: 16,
    color: '#333',
  },
  levelSelectionTitle: {
    fontSize: 26,
    fontWeight: 'bold',
    color: 'black',
    marginVertical: 15,
    alignSelf: 'flex-start',
    marginLeft: '5%',
  },
  levelsContainer: {
    width: '90%',
    alignItems: 'center',
  },
  levelButton: {
    width: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 25,
    marginVertical: 8,
    borderWidth: 2,
    borderColor: 'white',
  },
  level1: {
    backgroundColor: 'rgba(153, 222, 186, 0.9)', 
    height: 60,
    width: '70%',
    marginRight:120,
  },
  level2: {
    backgroundColor: 'rgba(244, 214, 176, 0.9)', 
    height: 65,
    width: '80%',
    marginRight:90,
  },
  level3: {
    backgroundColor: 'rgba(244, 182, 172, 0.9)',
    height: 70,
    width: '90%',
    marginRight:70,
  },
  level4: {
    backgroundColor: 'rgba(239, 148, 148, 0.9)', 
    height: 75,
    width: '100%',
    marginRight:40,
  },
  level5: {
    backgroundColor: 'rgba(236, 135, 135, 0.9)',
    height: 80,
    width: '110%',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight:10,

  },
  levelButtonText: {
    fontSize: 22,
    fontWeight: 'bold',
    color: 'black',
  },
  gameLevelText: {
    fontSize: 20,
    color: '#12181e',
    fontWeight: '600',
  },
  boundaries: {
    flex: 1,
    borderColor: Colors.primary,
    borderWidth: 12,
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
    backgroundColor: Colors.background,
    position: 'relative',
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
});