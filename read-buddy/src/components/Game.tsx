// import React, { useEffect, useState, useContext } from "react";
// import { SafeAreaView, StyleSheet, View, Text, Dimensions, ScrollView, TouchableOpacity } from "react-native";
// import { PanGestureHandler, GestureHandlerRootView } from "react-native-gesture-handler";
// import { Colors } from "../styles/colors";
// import { Direction, Coordinate, GestureEventType } from "../types/types";
// import { checkGameOver } from "../utils/checkGameOver";
// import { randomFoodPosition } from "../utils/randomFoodPosition";
// import Food from "./Food";
// import WrongFruit from "./WrongFruit";
// import Header from "./Header";
// import Score from "./Score";
// import Snake from "./Snake";
// import firestore from '@react-native-firebase/firestore';
// import { AppContext } from '../App.tsx';
// import gameResults from '../data/game_result.json';
// import Sound from 'react-native-sound';
// import GameOverScreen from './GameOverScreen';

// const SNAKE_INITIAL_POSITION: Coordinate[] = [{ x: 5, y: 5 }];
// const FOOD_INITIAL_POSITION: Coordinate = { x: 5, y: 20 };
// const GAME_BOUNDS = { xMin: 0, xMax: 35, yMin: 0, yMax: 59 };
// const MOVE_INTERVAL = 200;
// const SCORE_INCREMENT = 10;

// Sound.setCategory('Playback');

// const biteSound = new Sound('bite.mp3', Sound.MAIN_BUNDLE, (error) => {
//   if (error) console.log('Failed to load bite sound:', error);
//   else console.log('Bite sound loaded successfully');
// });

// const crashSound = new Sound('crash.mp3', Sound.MAIN_BUNDLE, (error) => {
//   if (error) console.log('Failed to load crash sound:', error);
//   else console.log('Crash sound loaded successfully');
// });

// function getRandomFruitEmoji(): string {
//   const fruitEmojis = ["🍎", "🍊", "🍋", "🍇", "🍉", "🍓", "🍑", "🍍"];
//   const randomIndex = Math.floor(Math.random() * fruitEmojis.length);
//   return fruitEmojis[randomIndex];
// }

// export default function Game(): JSX.Element {
//   const { loggedInUser } = useContext(AppContext);
//   const [direction, setDirection] = useState<Direction>(Direction.Right);
//   const [snake, setSnake] = useState<Coordinate[]>(SNAKE_INITIAL_POSITION);
//   const [food, setFood] = useState<Coordinate>(FOOD_INITIAL_POSITION);
//   const [wrongFruits, setWrongFruits] = useState<Coordinate[]>([]);
//   const [score, setScore] = useState<number>(0);
//   const [isGameOver, setIsGameOver] = useState<boolean>(false);
//   const [isPaused, setIsPaused] = useState<boolean>(false);
//   const [level, setLevel] = useState<number>(1);
//   const [isLevelSelected, setIsLevelSelected] = useState<boolean>(false);
//   const [rightFruitEmoji, setRightFruitEmoji] = useState<string>(getRandomFruitEmoji());
//   const [fruitSpawnTime, setFruitSpawnTime] = useState<number>(Date.now());
//   const [timeToReachFruit, setTimeToReachFruit] = useState<number[]>([]);
//   const [gameOverResult, setGameOverResult] = useState<{
//     result: string;
//     description: string;
//     topic1: string;
//     topic2: string;
//     topic3: string;
//     topic4: string;
//     topic5: string;
//     topic6: string;
//     topic7: string;
//     message1: string;
//     message2: string;
//     message3: string;
//     message4: string;
//     message5: string;
//     message6: string;
//     message7: string;
//   } | null>(null);
//   const [topPlayers, setTopPlayers] = useState<{ user_name: string; score: number; email: string }[]>([]);
//   const [currentUserScore, setCurrentUserScore] = useState<number>(0);

//   useEffect(() => {
//     const fetchLeaderboard = async () => {
//       if (!loggedInUser) return;

//       try {
//         const leaderboardSnapshot = await firestore()
//           .collection('snake_game_leadersboard')
//           .orderBy('score', 'desc')
//           .limit(3)
//           .get();
//         const topPlayersData = leaderboardSnapshot.docs.map((doc) => ({
//           user_name: doc.data().user_name || 'Unknown',
//           score: doc.data().score || 0,
//           email: doc.id,
//         }));
//         setTopPlayers(topPlayersData);

//         const currentUserDoc = await firestore()
//           .collection('snake_game_leadersboard')
//           .doc(loggedInUser)
//           .get();
//         if (currentUserDoc.exists) {
//           const userData = currentUserDoc.data();
//           setCurrentUserScore(userData?.score || 0);
//         }
//       } catch (error) {
//         console.error('Error fetching leaderboard:', error);
//       }
//     };

//     fetchLeaderboard();
//   }, [loggedInUser]);

//   const updateHighScore = async (newScore: number) => {
//     if (!loggedInUser) return;

//     try {
//       const userRef = firestore().collection('snake_game_leadersboard').doc(loggedInUser);
//       const userDoc = await userRef.get();

//       if (userDoc.exists) {
//         const userData = userDoc.data();
//         const storedScore = userData?.score || 0;
//         if (newScore > storedScore) {
//           await userRef.update({ score: newScore });
//           setCurrentUserScore(newScore);
//           console.log('High score updated:', newScore);

//           const leaderboardSnapshot = await firestore()
//             .collection('snake_game_leadersboard')
//             .orderBy('score', 'desc')
//             .limit(3)
//             .get();
//           const updatedTopPlayers = leaderboardSnapshot.docs.map((doc) => ({
//             user_name: doc.data().user_name || 'Unknown',
//             score: doc.data().score || 0,
//             email: doc.id,
//           }));
//           setTopPlayers(updatedTopPlayers);
//         }
//       }
//     } catch (error) {
//       console.error('Error updating high score:', error);
//     }
//   };

//   const initializeWrongFruits = (count: number) => {
//     const newWrongFruits: Coordinate[] = [];
//     for (let i = 0; i < count; i++) {
//       const position = randomFoodPosition(
//         GAME_BOUNDS.xMax,
//         GAME_BOUNDS.yMax,
//         [...snake, food, ...newWrongFruits]
//       );
//       newWrongFruits.push(position);
//     }
//     setWrongFruits(newWrongFruits);
//   };

//   const handleLevelSelect = (selectedLevel: number) => {
//     setLevel(selectedLevel);
//     setIsLevelSelected(true);
//     initializeWrongFruits(selectedLevel * 2);
//   };

//   const getMoveInterval = () => {
//     const speedIncrease = (level - 1) * 20;
//     const interval = MOVE_INTERVAL - speedIncrease;
//     return interval > 50 ? interval : 50;
//   };

//   useEffect(() => {
//     if (!isGameOver && isLevelSelected) {
//       const intervalId = setInterval(() => {
//         if (!isPaused) moveSnake();
//       }, getMoveInterval());
//       return () => clearInterval(intervalId);
//     }
//   }, [snake, isGameOver, isPaused, level, isLevelSelected]);

//   const spawnNewFood = () => {
//     const newFoodPosition = randomFoodPosition(
//       GAME_BOUNDS.xMax,
//       GAME_BOUNDS.yMax,
//       [...snake, ...wrongFruits]
//     );
//     if (
//       newFoodPosition.x >= GAME_BOUNDS.xMin &&
//       newFoodPosition.x <= GAME_BOUNDS.xMax &&
//       newFoodPosition.y >= GAME_BOUNDS.yMin &&
//       newFoodPosition.y <= GAME_BOUNDS.yMax
//     ) {
//       setFood(newFoodPosition);
//       setRightFruitEmoji(getRandomFruitEmoji());
//       setFruitSpawnTime(Date.now());
//     } else {
//       spawnNewFood();
//     }
//   };

//   const moveSnake = () => {
//     const snakeHead = snake[0];
//     const newHead: Coordinate = { ...snakeHead };

//     switch (direction) {
//       case Direction.Up:
//         newHead.y -= 1;
//         break;
//       case Direction.Down:
//         newHead.y += 1;
//         break;
//       case Direction.Left:
//         newHead.x -= 1;
//         break;
//       case Direction.Right:
//         newHead.x += 1;
//         break;
//       default:
//         break;
//     }

//     if (checkGameOver(newHead, GAME_BOUNDS)) {
//       setIsGameOver(true);
//       crashSound.play((success) => {
//         if (success) console.log('Crash sound played successfully');
//         else console.log('Crash sound playback failed');
//       });
//       return;
//     }

//     if (snake.some(segment => segment.x === newHead.x && segment.y === newHead.y)) {
//       setIsGameOver(true);
//       crashSound.play((success) => {
//         if (success) console.log('Crash sound played successfully');
//         else console.log('Crash sound playback failed');
//       });
//       return;
//     }

//     const tolerance = 1; // Tolerance for wrongFruits
//     const hasEatenWrongFruit = wrongFruits.some(
//       (fruit) => 
//         Math.abs(fruit.x - newHead.x) <= tolerance && 
//         Math.abs(fruit.y - newHead.y) <= tolerance
//     );
//     if (hasEatenWrongFruit) {
//       setIsGameOver(true);
//       crashSound.play((success) => {
//         if (success) console.log('Crash sound played successfully');
//         else console.log('Crash sound playback failed');
//       });
//       return;
//     }

//     const foodTolerance = 2; // Tolerance for food
//     if (Math.abs(newHead.x - food.x) <= foodTolerance && Math.abs(newHead.y - food.y) <= foodTolerance) {
//       const timeTaken = (Date.now() - fruitSpawnTime) / 1000;
//       setTimeToReachFruit(prev => [...prev, timeTaken]);
//       spawnNewFood();
//       setSnake([newHead, ...snake]);
//       setScore(prevScore => prevScore + SCORE_INCREMENT);
//       biteSound.play((success) => {
//         if (success) console.log('Bite sound played successfully');
//         else console.log('Bite sound playback failed');
//       });
//     } else {
//       setSnake([newHead, ...snake.slice(0, -1)]);
//     }
//   };

//   const handleGesture = (event: GestureEventType) => {
//     const { translationX, translationY } = event.nativeEvent;
//     let newDirection = direction;

//     if (Math.abs(translationX) > Math.abs(translationY)) {
//       if (translationX > 0 && direction !== Direction.Left) {
//         newDirection = Direction.Right;
//       } else if (translationX < 0 && direction !== Direction.Right) {
//         newDirection = Direction.Left;
//       }
//     } else {
//       if (translationY > 0 && direction !== Direction.Up) {
//         newDirection = Direction.Down;
//       } else if (translationY < 0 && direction !== Direction.Down) {
//         newDirection = Direction.Up;
//       }
//     }

//     setDirection(newDirection);
//   };

//   const reloadGame = () => {
//     setIsLevelSelected(false);
//     setLevel(1);
//     setSnake(SNAKE_INITIAL_POSITION);
//     setFood(FOOD_INITIAL_POSITION);
//     setWrongFruits([]);
//     setIsGameOver(false);
//     setScore(0);
//     setDirection(Direction.Right);
//     setIsPaused(false);
//     setRightFruitEmoji(getRandomFruitEmoji());
//     setTimeToReachFruit([]);
//     setFruitSpawnTime(Date.now());
//     setGameOverResult(null);
//   };

//   const pauseGame = () => {
//     setIsPaused(!isPaused);
//   };

//   useEffect(() => {
//     if (isGameOver) {
//       const averageSpeed = timeToReachFruit.length > 0 
//         ? timeToReachFruit.reduce((a, b) => a + b, 0) / timeToReachFruit.length 
//         : 0;

//       console.log(`Level: ${level}, Average Speed: ${averageSpeed}, Score: ${score}`);

//       let result;
//       if (averageSpeed === 0) {
//         result = gameResults.find(record => 
//           record.level === level && record.result.includes("Low")
//         );
//       } else {
//         result = gameResults.find(record => 
//           record.level === level && 
//           averageSpeed >= record.rangemin && 
//           averageSpeed <= record.rangemax
//         );
//       }

//       if (result) {
//         setGameOverResult({
//           result: result.result,
//           description: result.description,
//           topic1: result.topic1,
//           topic2: result.topic2,
//           topic3: result.topic3,
//           topic4: result.topic4,
//           topic5: result.topic5,
//           topic6: result.topic6,
//           topic7: result.topic7,
//           message1: result.message1,
//           message2: result.message2,
//           message3: result.message3,
//           message4: result.message4,
//           message5: result.message5,
//           message6: result.message6,
//           message7: result.message7,
//         });
//       } else {
//         setGameOverResult({
//           result: "Unknown",
//           description: "No matching performance range found.",
//           topic1: "", topic2: "", topic3: "", topic4: "", topic5: "", topic6: "", topic7: "",
//           message1: "", message2: "", message3: "", message4: "", message5: "", message6: "", message7: "",
//         });
//         console.log("No matching result found in game_result.json");
//       }

//       updateHighScore(score);
//     }
//   }, [isGameOver, score]);

//   if (!isLevelSelected) {
//     return (
//       <ScrollView contentContainerStyle={styles.levelSelectionContainer}>
//         <View style={styles.leaderboardContainer}>
//           <Text style={styles.leaderboardHeader}>Leaderboard</Text>
//           {topPlayers.map((player, index) => (
//             <View key={index} style={styles.leaderboardItem}>
//               <Text style={styles.leaderboardText}>
//                 {index + 1}. {player.user_name}: <Text style={styles.scoreText}>{player.score}</Text>
//               </Text>
//             </View>
//           ))}
//           <View style={styles.currentUserItem}>
//             <Text style={styles.leaderboardText}>
//               You: <Text style={styles.currentUserScore}>{currentUserScore}</Text>
//             </Text>
//           </View>
//         </View>

//         <Text style={styles.levelHeader}>Select Levels</Text>
//         {[1, 2, 3, 4, 5].map((lvl) => (
//           <TouchableOpacity
//             key={lvl}
//             style={styles.levelButton}
//             onPress={() => handleLevelSelect(lvl)}
//           >
//             <Text style={styles.levelText}>Level {lvl}</Text>
//           </TouchableOpacity>
//         ))}
//       </ScrollView>
//     );
//   }

//   return (
//     <GestureHandlerRootView style={{ flex: 1 }}>
//       <PanGestureHandler onGestureEvent={handleGesture}>
//         <SafeAreaView style={styles.container}>
//           <Header
//             reloadGame={reloadGame}
//             pauseGame={pauseGame}
//             isPaused={isPaused}
//             rightFruitEmoji={rightFruitEmoji}
//           >
//             <View style={styles.headerContent}>
//               <Score score={score} />
//               <Text style={styles.levelText}>Level: {level}</Text>
//             </View>
//           </Header>
//           <View style={styles.boundaries}>
//             <Snake snake={snake} />
//             <Food x={food.x} y={food.y} emoji={rightFruitEmoji} />
//             {wrongFruits.map((fruit, index) => (
//               <WrongFruit key={index} x={fruit.x} y={fruit.y} />
//             ))}
//           </View>
//           {isGameOver && gameOverResult && (
//             <View style={styles.gameOverOverlay}>
              
//               <GameOverScreen
//                 score={score}
//                 result={gameOverResult}
//                 onRestart={reloadGame}
//               />
//             </View>
//           )}
//         </SafeAreaView>
//       </PanGestureHandler>
//     </GestureHandlerRootView>
//   );
// }

// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//     backgroundColor: Colors.primary,
//   },
//   levelSelectionContainer: {
//     flexGrow: 1,
//     alignItems: 'center',
//     padding: 20,
//     backgroundColor: Colors.primary,
//   },
//   leaderboardContainer: {
//     width: '100%',
//     marginBottom: 20,
//     padding: 10,
//     backgroundColor: '#fff',
//     borderRadius: 10,
//     shadowColor: '#000',
//     shadowOffset: { width: 0, height: 2 },
//     shadowOpacity: 0.1,
//     shadowRadius: 5,
//     elevation: 3,
//   },
//   leaderboardHeader: {
//     fontSize: 24,
//     fontWeight: 'bold',
//     marginBottom: 10,
//     textAlign: 'center',
//     color: '#333',
//   },
//   leaderboardItem: {
//     marginVertical: 5,
//   },
//   currentUserItem: {
//     marginVertical: 5,
//     borderTopWidth: 1,
//     borderTopColor: '#ccc',
//     paddingTop: 5,
//   },
//   leaderboardText: {
//     fontSize: 18,
//     color: '#333',
//   },
//   scoreText: {
//     fontWeight: 'bold',
//     color: '#27ac1f',
//   },
//   currentUserScore: {
//     fontWeight: 'bold',
//     color: '#ff4500',
//   },
//   levelHeader: {
//     fontSize: 28,
//     fontWeight: 'bold',
//     marginVertical: 20,
//     color: '#fff',
//   },
//   levelButton: {
//     backgroundColor: '#85fe78',
//     padding: 15,
//     borderRadius: 10,
//     marginVertical: 10,
//     width: '80%',
//     alignItems: 'center',
//   },
//   levelText: {
//     fontSize: 20,
//     color: '#12181e',
//     fontWeight: '600',
//   },
//   boundaries: {
//     flex: 1,
//     borderColor: Colors.primary,
//     borderWidth: 12,
//     borderBottomLeftRadius: 30,
//     borderBottomRightRadius: 30,
//     backgroundColor: Colors.background,
//     position: "relative",
//   },
//   headerContent: {
//     flexDirection: "row",
//     alignItems: "center",
//   },
//   gameOverOverlay: {
//     position: "absolute",
//     top: 0,
//     left: 0,
//     right: 0,
//     bottom: 0,
//     justifyContent: "center",
//     alignItems: "center",
//     backgroundColor: 'rgba(0, 0, 0, 0.8)',
//   },
// });

import React, { useEffect, useState, useContext } from "react";
import {
  SafeAreaView,
  StyleSheet,
  View,
  Text,
  Dimensions,
  ScrollView,
  TouchableOpacity,
  Alert,
} from "react-native";
import { PanGestureHandler, GestureHandlerRootView } from "react-native-gesture-handler";
import { Colors } from "../styles/colors";
import { Direction, Coordinate, GestureEventType } from "../types/types";
import { checkGameOver } from "../utils/checkGameOver";
import { randomFoodPosition } from "../utils/randomFoodPosition";
import Food from "./Food";
import WrongFruit from "./WrongFruit";
import Header from "./Header";
import Score from "./Score";
import Snake from "./Snake";
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
  if (error) console.log('Failed to load bite sound:', error);
  else console.log('Bite sound loaded successfully');
});

const crashSound = new Sound('crash.mp3', Sound.MAIN_BUNDLE, (error) => {
  if (error) console.log('Failed to load crash sound:', error);
  else console.log('Crash sound loaded successfully');
});

function getRandomFruitEmoji(): string {
  const fruitEmojis = ["🍎", "🍊", "🍋", "🍇", "🍉", "🍓", "🍑", "🍍"];
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
      if (!loggedInUser) return;

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
    if (!loggedInUser) return;

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
        if (!isPaused) moveSnake();
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
        if (success) console.log('Crash sound played successfully');
        else console.log('Crash sound playback failed');
      });
      return;
    }

    if (snake.some(segment => segment.x === newHead.x && segment.y === newHead.y)) {
      setIsGameOver(true);
      crashSound.play((success) => {
        if (success) console.log('Crash sound played successfully');
        else console.log('Crash sound playback failed');
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
        if (success) console.log('Crash sound played successfully');
        else console.log('Crash sound playback failed');
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
        if (success) console.log('Bite sound played successfully');
        else console.log('Bite sound playback failed');
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
  
      let result;
      if (averageSpeed === 0) {
        result = gameResults.find(record => 
          record.level === level && record.result.includes("Low")
        );
      } else {
        result = gameResults.find(record => 
          record.level === level && 
          averageSpeed >= record.rangemin && 
          averageSpeed <= record.rangemax
        );
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
        "Game Over",
        `Your Score: ${score}`,
        [
          {
            text: "Tap to See Result",
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
      <ScrollView contentContainerStyle={styles.levelSelectionContainer}>
        <View style={styles.leaderboardContainer}>
          <Text style={styles.leaderboardHeader}>Leaderboard</Text>
          {topPlayers.map((player, index) => (
            <View key={index} style={styles.leaderboardItem}>
              <Text style={styles.leaderboardText}>
                {index + 1}. {player.user_name}: <Text style={styles.scoreText}>{player.score}</Text>
              </Text>
            </View>
          ))}
          <View style={styles.currentUserItem}>
            <Text style={styles.leaderboardText}>
              You: <Text style={styles.currentUserScore}>{currentUserScore}</Text>
            </Text>
          </View>
        </View>

        <Text style={styles.levelHeader}>Select Levels</Text>
        {[1, 2, 3, 4, 5].map((lvl) => (
          <TouchableOpacity
            key={lvl}
            style={styles.levelButton}
            onPress={() => handleLevelSelect(lvl)}
          >
            <Text style={styles.levelText}>Level {lvl}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
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
              <Text style={styles.levelText}>Level: {level}</Text>
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

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.primary,
  },
  levelSelectionContainer: {
    flexGrow: 1,
    alignItems: 'center',
    padding: 20,
    backgroundColor: Colors.primary,
  },
  leaderboardContainer: {
    width: '100%',
    marginBottom: 20,
    padding: 10,
    backgroundColor: '#fff',
    borderRadius: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 3,
  },
  leaderboardHeader: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 10,
    textAlign: 'center',
    color: '#333',
  },
  leaderboardItem: {
    marginVertical: 5,
  },
  currentUserItem: {
    marginVertical: 5,
    borderTopWidth: 1,
    borderTopColor: '#ccc',
    paddingTop: 5,
  },
  leaderboardText: {
    fontSize: 18,
    color: '#333',
  },
  scoreText: {
    fontWeight: 'bold',
    color: '#27ac1f',
  },
  currentUserScore: {
    fontWeight: 'bold',
    color: '#ff4500',
  },
  levelHeader: {
    fontSize: 28,
    fontWeight: 'bold',
    marginVertical: 20,
    color: '#fff',
  },
  levelButton: {
    backgroundColor: '#85fe78',
    padding: 15,
    borderRadius: 10,
    marginVertical: 10,
    width: '80%',
    alignItems: 'center',
  },
  levelText: {
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
    position: "relative",
  },
  headerContent: {
    flexDirection: "row",
    alignItems: "center",
  },
});