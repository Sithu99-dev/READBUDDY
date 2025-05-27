import { Fragment } from "react";
import { StyleSheet, View } from "react-native";
import { Colors } from "../styles/colors";
import { Coordinate } from "../types/types";

interface SnakeProps {
  snake: Coordinate[];
}

export default function Snake({ snake }: SnakeProps): JSX.Element {
  return (
    <Fragment>
      {snake.map((segment: Coordinate, index: number) => {
        const segmentStyle = {
          left: segment.x * 10,
          top: segment.y * 10,
        };

        // Different styles for head vs body segments
        const isHead = index === 0;
        const isTail = index === snake.length - 1;
        
        // Calculate opacity for gradient effect
        const opacity = 1 - (index * 0.1);
        const minOpacity = 0.6;
        const finalOpacity = Math.max(opacity, minOpacity);

        return (
          <View key={index} style={[styles.snakeContainer, segmentStyle]}>
            {/* Main snake segment */}
            <View 
              style={[
                styles.snake,
                isHead ? styles.snakeHead : styles.snakeBody,
                isTail ? styles.snakeTail : null,
                { opacity: finalOpacity }
              ]} 
            />
            
            {/* Head details */}
            {isHead && (
              <View style={styles.headDetails}>
                <View style={styles.eye} />
                <View style={[styles.eye, styles.rightEye]} />
              </View>
            )}
            
            {/* Body pattern for non-head segments */}
            {!isHead && (
              <View style={[styles.bodyPattern, { opacity: finalOpacity * 0.7 }]} />
            )}
            
            {/* Shine effect */}
            <View style={[styles.shine, { opacity: finalOpacity * 0.8 }]} />
          </View>
        );
      })}
    </Fragment>
  );
}

const styles = StyleSheet.create({
  snakeContainer: {
    width: 15,
    height: 15,
    position: "absolute",
    justifyContent: 'center',
    alignItems: 'center',
  },
  snake: {
    width: 15,
    height: 15,
    borderRadius: 7.5,
    position: "absolute",
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.3,
    shadowRadius: 3,
    elevation: 4,
  },
  snakeHead: {
    backgroundColor: '#2E8B57', // Sea Green
    borderWidth: 1.5,
    borderColor: '#228B22', // Forest Green
    width: 16,
    height: 16,
    borderRadius: 8,
    shadowColor: '#2E8B57',
    shadowOpacity: 0.5,
    shadowRadius: 4,
    elevation: 6,
  },
  snakeBody: {
    backgroundColor: '#32CD32', // Lime Green
    borderWidth: 1,
    borderColor: '#228B22', // Forest Green
  },
  snakeTail: {
    backgroundColor: '#90EE90', // Light Green
    width: 13,
    height: 13,
    borderRadius: 6.5,
  },
  headDetails: {
    position: 'absolute',
    width: 16,
    height: 16,
    justifyContent: 'center',
    alignItems: 'center',
    flexDirection: 'row',
  },
  eye: {
    width: 3,
    height: 3,
    borderRadius: 1.5,
    backgroundColor: '#FF0000', // Red eyes
    position: 'absolute',
    left: 3,
    top: 4,
    shadowColor: '#FF0000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.8,
    shadowRadius: 1,
    elevation: 2,
  },
  rightEye: {
    left: 9,
  },
  bodyPattern: {
    position: 'absolute',
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#228B22', // Darker green for pattern
    opacity: 0.6,
  },
  shine: {
    position: 'absolute',
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#FFFFFF',
    opacity: 0.4,
    top: 2,
    left: 2,
  },
});