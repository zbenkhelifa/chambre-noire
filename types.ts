export enum LevelStatus {
  LOCKED = 'LOCKED',
  ACTIVE = 'ACTIVE',
  COMPLETED = 'COMPLETED'
}

export interface LevelData {
  id: number;
  title: string;
  description: string;
  concept: string;
  mission: string;
  initialCode: string;
  validationRegex: RegExp[];
  targetValues?: Record<string, number | string>;
  imageUrl: string;
  hintPrompt: string;
  courseContent: {
    title: string;
    body: string;
    keyPoints: string[];
  };
}

export interface StudentResult {
  name: string;
  progress: number; // Max level reached
  completed: boolean;
  score: number; // Based on attempts or time (simulated)
}

export interface GameState {
  currentLevelId: number;
  levels: Record<number, LevelStatus>;
  isGameComplete: boolean;
  studentName: string;
  isLoggedIn: boolean;
  showCourse: boolean; // Showing the educational content?
}

export interface ChatMessage {
  role: 'user' | 'model';
  text: string;
}
