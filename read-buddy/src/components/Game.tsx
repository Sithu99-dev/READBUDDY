/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable react-hooks/exhaustive-deps */
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
import { useFocusEffect } from '@react-navigation/native';
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

// Load bite sound effect
const biteSound = new Sound('bite.mp3', Sound.MAIN_BUNDLE, (error) => {
  if (error) {console.log('Failed to load bite sound:', error);}
  else {console.log('Bite sound loaded successfully');}
});

// Load crash sound effect
const crashSound = new Sound('crash.mp3', Sound.MAIN_BUNDLE, (error) => {
  if (error) {console.log('Failed to load crash sound:', error);}
  else {console.log('Crash sound loaded successfully');}
});

// Function to randomly select a fruit emoji to display
function getRandomFruitEmoji(): string {
  const fruitEmojis = ['🍎', '🍊', '🍋', '🍇', '🍉', '🍓', '🍑', '🍍'];
  const randomIndex = Math.floor(Math.random() * fruitEmojis.length);
  return fruitEmojis[randomIndex];
}

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

  // Background sound states
  const [backgroundSound, setBackgroundSound] = useState<Sound | null>(null);
  const [isSoundEnabled, setIsSoundEnabled] = useState<boolean>(true);
  const [soundLoaded, setSoundLoaded] = useState<boolean>(false);

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

  // Handle screen focus/blur for navigation
  useFocusEffect(
    React.useCallback(() => {
      // Screen is focused - resume background sound if enabled
      console.log('Snake Game screen focused');
      if (backgroundSound && soundLoaded && isSoundEnabled) {
        backgroundSound.play((success) => {
          if (success) {
            console.log('Background sound resumed on screen focus');
          } else {
            console.log('Failed to resume background sound on screen focus');
          }
        });
      }

      // Return cleanup function for when screen loses focus
      return () => {
        console.log('Snake Game screen lost focus - pausing background sound');
        if (backgroundSound && soundLoaded) {
          backgroundSound.pause();
        }
      };
    }, [backgroundSound, soundLoaded, isSoundEnabled])
  );
  useEffect(() => {
    console.log('Initializing background sound...');

    const initializeBackgroundSound = () => {
      // Try loading from main bundle first
      let sound = new Sound('game_background.mp3', Sound.MAIN_BUNDLE, (error) => {
        if (error) {
          console.log('Failed to load background sound from main bundle, trying raw folder:', error);

          // Try loading from raw folder (Android)
          sound = new Sound('game_background.mp3', null, (error) => {
            if (error) {
              console.log('Failed to load background sound from raw folder:', error);
              setSoundLoaded(false);
              return;
            }

            console.log('Background sound loaded successfully from raw folder');
            setupBackgroundSound(sound);
          });
        } else {
          console.log('Background sound loaded successfully from main bundle');
          setupBackgroundSound(sound);
        }
      });
    };

    const setupBackgroundSound = (sound: Sound) => {
      setSoundLoaded(true);
      setBackgroundSound(sound);

      // Set sound properties
      sound.setNumberOfLoops(-1); // Loop indefinitely
      sound.setVolume(0.3); // Set volume to 30%

      // Play background music if sound is enabled
      if (isSoundEnabled) {
        sound.play((success) => {
          if (success) {
            console.log('Background sound started playing successfully');
          } else {
            console.log('Background sound playback failed');
          }
        });
      }
    };

    initializeBackgroundSound();

    // Cleanup when component unmounts
    return () => {
      if (backgroundSound) {
        console.log('Cleaning up background sound...');
        backgroundSound.stop(() => {
          backgroundSound.release();
        });
      }
    };
  }, []);

  // Control background sound based on game state
  useEffect(() => {
    if (backgroundSound && soundLoaded && isSoundEnabled) {
      console.log('Adjusting background volume for game state - Level Selected:', isLevelSelected, 'Game Over:', isGameOver, 'Paused:', isPaused);

      if (!isLevelSelected) {
        backgroundSound.setVolume(0.2); // Lower volume in level selection
      } else if (isGameOver) {
        backgroundSound.setVolume(0.1); // Even lower volume when game over
      } else if (isPaused) {
        backgroundSound.setVolume(0.15); // Lower volume when paused
      } else {
        backgroundSound.setVolume(0.3); // Normal volume during gameplay
      }
    }
  }, [isLevelSelected, isGameOver, isPaused, backgroundSound, isSoundEnabled, soundLoaded]);

  // Toggle background sound function
  const toggleBackgroundSound = () => {
    console.log('Toggling background sound. Current state:', isSoundEnabled);

    if (!soundLoaded) {
      console.log('Background sound not loaded yet, cannot toggle');
      Alert.alert('Sound Error', 'Background music is not loaded yet. Please try again in a moment.');
      return;
    }

    const newSoundState = !isSoundEnabled;
    setIsSoundEnabled(newSoundState);

    if (backgroundSound) {
      if (newSoundState) {
        // Turn sound on
        console.log('Turning background sound ON');
        backgroundSound.play((success) => {
          if (success) {
            console.log('Background sound resumed successfully');
          } else {
            console.log('Failed to resume background sound');
          }
        });
      } else {
        // Turn sound off
        console.log('Turning background sound OFF');
        backgroundSound.pause();
      }
    }
  };

  // Handle navigation away from game (like going to GameOverScreen)
  const handleNavigation = () => {
    console.log('Navigating away from game - pausing background sound');
    if (backgroundSound && soundLoaded) {
      backgroundSound.pause();
    }
  };

  // Fetch leaderboard data on component mount
  useEffect(() => {
    const fetchLeaderboard = async () => {
      if (!loggedInUser) {return;}

      try {
        // Get top 3 players from Firestore
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

        // Get current user's score
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

  // Update high score if current score is better
  const updateHighScore = async (newScore: number) => {
    if (!loggedInUser) {return;}

    try {
      const userRef = firestore().collection('snake_game_leadersboard').doc(loggedInUser);
      const userDoc = await userRef.get();

      if (userDoc.exists) {
        const userData = userDoc.data();
        const storedScore = userData?.score || 0;
        if (newScore > storedScore) {
          // Update score in Firestore
          await userRef.update({ score: newScore });
          setCurrentUserScore(newScore);
          console.log('High score updated:', newScore);

          // Refresh leaderboard
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

  // Initialize wrong fruits (obstacles) based on level
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

  // Handle level selection
  const handleLevelSelect = (selectedLevel: number) => {
    setLevel(selectedLevel);
    setIsLevelSelected(true);
    initializeWrongFruits(selectedLevel * 2);
  };

  // Calculate move interval based on level (higher level = faster snake)
  const getMoveInterval = () => {
    const speedIncrease = (level - 1) * 20;
    const interval = MOVE_INTERVAL - speedIncrease;
    return interval > 50 ? interval : 50; // Minimum 50ms
  };

  // Set up game loop to move snake at regular intervals
  useEffect(() => {
    if (!isGameOver && isLevelSelected) {
      const intervalId = setInterval(() => {
        if (!isPaused) {moveSnake();}
      }, getMoveInterval());
      return () => clearInterval(intervalId);
    }
  }, [snake, isGameOver, isPaused, level, isLevelSelected]);

  // Spawn new food at random position
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

  // Main game logic to move snake and handle collisions
  const moveSnake = () => {
    const snakeHead = snake[0];
    const newHead: Coordinate = { ...snakeHead };

    // Update head position based on direction
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

    // Check if snake hit boundary
    if (checkGameOver(newHead, GAME_BOUNDS)) {
      setIsGameOver(true);
      crashSound.play((success) => {
        if (success) {console.log('Crash sound played successfully');}
        else {console.log('Crash sound playback failed');}
      });
      return;
    }

    // Check if snake hit itself
    if (snake.some(segment => segment.x === newHead.x && segment.y === newHead.y)) {
      setIsGameOver(true);
      crashSound.play((success) => {
        if (success) {console.log('Crash sound played successfully');}
        else {console.log('Crash sound playback failed');}
      });
      return;
    }

    // Check if snake hit wrong fruit
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

    // Check if snake ate food
    const foodTolerance = 2;
    if (Math.abs(newHead.x - food.x) <= foodTolerance && Math.abs(newHead.y - food.y) <= foodTolerance) {
      const timeTaken = (Date.now() - fruitSpawnTime) / 1000;
      setTimeToReachFruit(prev => [...prev, timeTaken]);
      spawnNewFood();
      setSnake([newHead, ...snake]); // Add new head without removing tail (grow snake)
      setScore(prevScore => prevScore + SCORE_INCREMENT);
      biteSound.play((success) => {
        if (success) {console.log('Bite sound played successfully');}
        else {console.log('Bite sound playback failed');}
      });
    } else {
      setSnake([newHead, ...snake.slice(0, -1)]); // Remove tail when moving
    }
  };

  // Handle swipe gestures to change direction
  const handleGesture = (event: GestureEventType) => {
    const { translationX, translationY } = event.nativeEvent;
    let newDirection = direction;

    // Determine primary swipe direction
    if (Math.abs(translationX) > Math.abs(translationY)) {
      // Horizontal swipe
      if (translationX > 0 && direction !== Direction.Left) {
        newDirection = Direction.Right;
      } else if (translationX < 0 && direction !== Direction.Right) {
        newDirection = Direction.Left;
      }
    } else {
      // Vertical swipe
      if (translationY > 0 && direction !== Direction.Up) {
        newDirection = Direction.Down;
      } else if (translationY < 0 && direction !== Direction.Down) {
        newDirection = Direction.Up;
      }
    }

    setDirection(newDirection);
  };

  // Reset game to initial state
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

      let result;

      if (timeToReachFruit.length === 0) {
        result = gameResults.find(record =>
          record.level === level && record.result.includes('Low')
        );
      } else {
        result = gameResults.find(record =>
          record.level === level &&
          averageSpeed >= record.rangemin &&
          averageSpeed <= record.rangemax
        );

        if (!result) {
          const levelResults = gameResults.filter(record => record.level === level);

          if (levelResults.length > 0) {
            result = levelResults.find(record => record.result.includes('Medium'));

            console.warn(`No exact range match found for level ${level} with speed ${averageSpeed}`);
          }
        }
      }

      const gameResult = result || {
        result: 'Unknown',
        description: 'No matching performance range found.',
        topic1: '', topic2: '', topic3: '', topic4: '', topic5: '', topic6: '', topic7: '',
        message1: '', message2: '', message3: '', message4: '', message5: '', message6: '', message7: '',
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
            onPress: () => {
              handleNavigation(); // Pause sound before navigating
              navigation.navigate('GameOverScreen', { score, result: gameResult });
            },
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

        {/* Sound toggle button */}
        <TouchableOpacity style={styles.soundButton} onPress={toggleBackgroundSound}>
          <Text style={styles.soundButtonText}>
            {!soundLoaded ? '⏳' : (isSoundEnabled ? '🔊' : '🔇')}
          </Text>
        </TouchableOpacity>

        <ScrollView contentContainerStyle={styles.levelSelectionContainer}>
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
                  <View style={styles.scoreItem} />
                  <View style={styles.scoreItem} />
                  <View style={styles.scoreItem} />
                </>
              )}
            </View>
            {!soundLoaded && (
              <Text style={styles.soundStatusText}>Loading background music...</Text>
            )}
          </View>

          <Text style={styles.levelSelectionTitle}>Level Selection</Text>

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
          {/* Sound toggle button for game screen */}
          <TouchableOpacity style={styles.soundButtonGame} onPress={toggleBackgroundSound}>
            <Text style={styles.soundButtonText}>
              {!soundLoaded ? '⏳' : (isSoundEnabled ? '🔊' : '🔇')}
            </Text>
          </TouchableOpacity>

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

// Get window dimensions for responsive layout
const windowHeight = Dimensions.get('window').height;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.primary,
  },
  levelSelectionBackground: {
    flex: 1,
    backgroundColor: '#5ECCD9',
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
  soundStatusText: {
    fontSize: 14,
    color: '#666',
    marginTop: 10,
    fontStyle: 'italic',
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
  // Sound button styles
  soundButton: {
    position: 'absolute',
    top: 50,
    right: 20,
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 10,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  soundButtonGame: {
    position: 'absolute',
    top: 10,
    left: 15,
    marginLeft:45,
    marginTop:20,
    width: 30,
    height: 30,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 10,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  soundButtonText: {
    fontSize: 20,
  },
});
