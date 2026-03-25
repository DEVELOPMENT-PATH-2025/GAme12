import { create } from 'zustand';

export type GameStatus = 'idle' | 'racing' | 'finished';

interface GameState {
  status: GameStatus;
  currentWord: string;
  typedChars: string;
  correctCharsCount: number;
  totalKeystrokes: number;
  startTime: number | null;
  endTime: number | null;
  wpm: number;
  accuracy: number;
  streak: number;
  maxStreak: number;
  playerPosition: number;
  ghostPosition: number;
  targetWPM: number;
  timeLeft: number;

  // Actions
  startGame: () => void;
  resetGame: () => void;
  handleInput: (input: string) => void;
  updatePositions: (delta: number) => void;
  tick: () => void;
}

const WORDS = [
  "react", "three", "fiber", "zustand", "typing", "racer", "mobile", "android",
  "keyboard", "velocity", "ghost", "camera", "smooth", "infinite", "track",
  "accuracy", "streak", "performance", "state", "logic", "environment",
  "coding", "developer", "engine", "graphics", "shader", "material", "mesh",
  "geometry", "vector", "position", "rotation", "scale", "animation", "frame",
  "request", "permission", "metadata", "package", "dependency", "import",
  "export", "default", "function", "component", "interface", "type", "string",
  "number", "boolean", "array", "object", "const", "let", "var", "async",
  "await", "promise", "fetch", "response", "json", "error", "catch", "finally"
];

const getRandomWord = () => WORDS[Math.floor(Math.random() * WORDS.length)];

export const useGameStore = create<GameState>((set, get) => ({
  status: 'idle',
  currentWord: getRandomWord(),
  typedChars: '',
  correctCharsCount: 0,
  totalKeystrokes: 0,
  startTime: null,
  endTime: null,
  wpm: 0,
  accuracy: 0,
  streak: 0,
  maxStreak: 0,
  playerPosition: 0,
  ghostPosition: 0,
  targetWPM: 40,
  timeLeft: 60,

  startGame: () => {
    set({
      status: 'racing',
      startTime: Date.now(),
      timeLeft: 60,
      playerPosition: 0,
      ghostPosition: 0,
      correctCharsCount: 0,
      totalKeystrokes: 0,
      wpm: 0,
      accuracy: 0,
      streak: 0,
      maxStreak: 0,
      typedChars: '',
      currentWord: getRandomWord(),
    });
  },

  resetGame: () => {
    set({
      status: 'idle',
      playerPosition: 0,
      ghostPosition: 0,
      timeLeft: 60,
      typedChars: '',
      currentWord: getRandomWord(),
    });
  },

  handleInput: (input: string) => {
    const { currentWord, typedChars, status, correctCharsCount, totalKeystrokes, streak, maxStreak } = get();
    if (status !== 'racing') return;

    const newTypedChars = input;
    const isCorrect = currentWord.startsWith(newTypedChars);
    
    let newCorrectCharsCount = correctCharsCount;
    let newStreak = streak;
    let newMaxStreak = maxStreak;

    // If the input is correct and longer than before, increment correct count
    if (isCorrect && newTypedChars.length > typedChars.length) {
      newCorrectCharsCount += 1;
      newStreak += 1;
      newMaxStreak = Math.max(newMaxStreak, newStreak);
    } else if (!isCorrect && newTypedChars.length > typedChars.length) {
      newStreak = 0;
    }

    // If word is completed correctly
    if (newTypedChars === currentWord) {
      set({
        currentWord: getRandomWord(),
        typedChars: '',
        correctCharsCount: newCorrectCharsCount,
        totalKeystrokes: totalKeystrokes + 1,
        streak: newStreak,
        maxStreak: newMaxStreak,
      });
      return;
    }

    set({
      typedChars: newTypedChars,
      correctCharsCount: newCorrectCharsCount,
      totalKeystrokes: totalKeystrokes + 1,
      streak: newStreak,
      maxStreak: newMaxStreak,
    });
  },

  updatePositions: (delta: number) => {
    const { status, playerPosition, ghostPosition, targetWPM, correctCharsCount, startTime } = get();
    if (status !== 'racing') return;

    // Player speed is based on correct characters
    // Let's say 1 correct char = 1 unit of distance
    // We update playerPosition directly based on correctCharsCount in the UI/Logic
    // But for smooth movement, we can interpolate.
    // Actually, let's make playerPosition = correctCharsCount * 2 (scaling factor)
    
    // Ghost speed: targetWPM * 5 (chars per word) / 60 (seconds) = chars per second
    const ghostCharsPerSecond = (targetWPM * 5) / 60;
    const newGhostPosition = ghostPosition + ghostCharsPerSecond * delta * 2;

    set({
      playerPosition: correctCharsCount * 2,
      ghostPosition: newGhostPosition,
    });
  },

  tick: () => {
    const { status, startTime, correctCharsCount, totalKeystrokes } = get();
    if (status !== 'racing' || !startTime) return;

    const now = Date.now();
    const elapsedMinutes = (now - startTime) / 60000;
    const newTimeLeft = Math.max(0, 60 - (now - startTime) / 1000);

    const newWpm = elapsedMinutes > 0 ? Math.round((correctCharsCount / 5) / elapsedMinutes) : 0;
    const newAccuracy = totalKeystrokes > 0 ? Math.round((correctCharsCount / totalKeystrokes) * 100) : 0;

    if (newTimeLeft <= 0) {
      set({ status: 'finished', endTime: now, timeLeft: 0 });
    } else {
      set({ wpm: newWpm, accuracy: newAccuracy, timeLeft: newTimeLeft });
    }
  }
}));
