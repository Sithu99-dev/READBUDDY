// Game.tsx
import React, { useEffect, useState } from "react";
import { SafeAreaView, StyleSheet, View, Text, Dimensions } from "react-native";
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
import LevelSelection from "./LevelSelection";

// Constants for initial game setup
const SNAKE_INITIAL_POSITION: Coordinate[] = [{ x: 5, y: 5 }];
const FOOD_INITIAL_POSITION: Coordinate = { x: 5, y: 20 };
const GAME_BOUNDS = { xMin: 0, xMax: 35, yMin: 0, yMax: 59 };
const MOVE_INTERVAL = 200;
const SCORE_INCREMENT = 10;

// Calculate grid size based on screen dimensions
// const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get("window");
// const GRID_SIZE = Math.min(
//   Math.floor(SCREEN_WIDTH / GAME_BOUNDS.xMax),
//   Math.floor((SCREEN_HEIGHT - 100) / GAME_BOUNDS.yMax) // 100 for header and other UI elements
// );

// Function to randomly select a fruit emoji from a list
function getRandomFruitEmoji(): string {
  const fruitEmojis = ["🍎", "🍊", "🍋", "🍇", "🍉", "🍓", "🍑", "🍍"];
  const randomIndex = Math.floor(Math.random() * fruitEmojis.length);
  return fruitEmojis[randomIndex];
}

// Main component for the game
export default function Game(): JSX.Element {
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

  // Initialize wrong fruits based on level, increasing difficulty
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

  // Handle selection of game level
  const handleLevelSelect = (selectedLevel: number) => {
    setLevel(selectedLevel);
    setIsLevelSelected(true);
    initializeWrongFruits(selectedLevel * 2); // Number of wrong fruits increases with level
  };

  // Determine the movement interval based on game level
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

  // Function to spawn new food in the game field
  const spawnNewFood = () => {
    const newFoodPosition = randomFoodPosition(
      GAME_BOUNDS.xMax,
      GAME_BOUNDS.yMax,
      [...snake, ...wrongFruits]
    );

    // Ensure the new food position is within bounds
    if (
      newFoodPosition.x >= GAME_BOUNDS.xMin &&
      newFoodPosition.x <= GAME_BOUNDS.xMax &&
      newFoodPosition.y >= GAME_BOUNDS.yMin &&
      newFoodPosition.y <= GAME_BOUNDS.yMax
    ) {
      setFood(newFoodPosition);
      setRightFruitEmoji(getRandomFruitEmoji());
    } else {
      // Retry spawning if out of bounds
      spawnNewFood();
    }
  };

  // Move the snake in the current direction
  const moveSnake = () => {
    const snakeHead = snake[0];
    const newHead: Coordinate = { ...snakeHead };

    // Change direction based on current direction
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

    // Check for game over conditions using existing checkGameOver function
    if (checkGameOver(newHead, GAME_BOUNDS)) {
      setIsGameOver(true);
      return;
    }

    // Check collision with itself
    if (snake.some(segment => segment.x === newHead.x && segment.y === newHead.y)) {
      setIsGameOver(true);
      return;
    }

    // Check collision with wrong fruits
    const hasEatenWrongFruit = wrongFruits.some(
      (fruit) => fruit.x === newHead.x && fruit.y === newHead.y
    );
    if (hasEatenWrongFruit) {
      setIsGameOver(true);
      return;
    }

    const tolerance = 2;
    // Check if snake eats food
    if (Math.abs(newHead.x - food.x) <= tolerance && Math.abs(newHead.y - food.y) <= tolerance) {
      spawnNewFood();
      setSnake([newHead, ...snake]);
      setScore(prevScore => prevScore + SCORE_INCREMENT);
    } else {
      setSnake([newHead, ...snake.slice(0, -1)]);
    }
  };

  // Handle directional gestures on the screen
  const handleGesture = (event: GestureEventType) => {
    const { translationX, translationY } = event.nativeEvent;
    let newDirection = direction;

    // Determine the new direction based on gesture magnitude
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

  // Restart the game with initial settings
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
  };

  // Toggle pause state
  const pauseGame = () => {
    setIsPaused(!isPaused);
  };

  // Render game components based on game state
  if (!isLevelSelected) {
    return <LevelSelection onLevelSelect={handleLevelSelect} />;
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
          {isGameOver && (
            <View style={styles.gameOverOverlay}>
              <Text style={styles.gameOverText}>Game Over</Text>
              <Text style={styles.gameOverScore}>Score: {score}</Text>
              <Text style={styles.gameOverInstruction} onPress={reloadGame}>
                Tap to Restart
              </Text>
            </View>
          )}
        </SafeAreaView>
      </PanGestureHandler>
    </GestureHandlerRootView>
  );
}

// Styles for the Game component
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.primary, // Set the primary background color
  },
  boundaries: {
    flex: 1,
    borderColor: Colors.primary, // Border color around the game area
    borderWidth: 12,
    borderBottomLeftRadius: 30, // Rounded corners at the bottom
    borderBottomRightRadius: 30,
    backgroundColor: Colors.background, // Background color of the game grid
    position: "relative",
  },
  headerContent: {
    flexDirection: "row", // Arrange header items in a row
    alignItems: "center",
  },
  levelText: {
    fontSize: 18,
    color: "#12181e",
    textAlign: "center",
    marginLeft: 10, // Space between score and level text
  },
  gameOverOverlay: {
    position: "absolute", // Position the overlay over the game area
    top: "40%",
    left: "10%",
    right: "10%",
    backgroundColor: "rgba(0,0,0,0.7)", // Semi-transparent background
    padding: 20,
    borderRadius: 10,
    alignItems: "center", // Center the text within the overlay
  },
  gameOverText: {
    fontSize: 32,
    color: "#fff",
    marginBottom: 10, // Space below the "Game Over" text
  },
  gameOverScore: {
    fontSize: 24,
    color: "#fff",
    marginBottom: 20, // Space below the score text
  },
  gameOverInstruction: {
    fontSize: 18,
    color: "#fff",
    textDecorationLine: "underline", // Underline to indicate it's clickable
  },
});
