import { initializeApp, getApps } from 'firebase/app';
import { getFirestore, collection, addDoc, getDocs, query, orderBy, limit, serverTimestamp } from 'firebase/firestore';
import firebaseConfig from '../../firebase-applet-config.json';

const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];

export const db = firebaseConfig.firestoreDatabaseId
  ? getFirestore(app, firebaseConfig.firestoreDatabaseId)
  : getFirestore(app);

export interface AnswerRecord {
  questionId: number;
  questionAnswer: string;
  userAnswer: string | null;
  isCorrect: boolean;
  points: number;
}

export interface ScoreEntry {
  id?: string;
  playerName: string;
  score: number;
  answers: AnswerRecord[];
  createdAt?: any;
}

export async function savePlayerScore(playerName: string, score: number, answers: AnswerRecord[]) {
  try {
    const scoresRef = collection(db, 'scores');
    const docRef = await addDoc(scoresRef, {
      playerName: playerName.trim() || 'Аниме Фан',
      score,
      answers,
      createdAt: serverTimestamp(),
    });
    return docRef.id;
  } catch (error) {
    console.error('Error saving score to Firestore:', error);
    throw error;
  }
}

export async function fetchTopScores(): Promise<ScoreEntry[]> {
  try {
    const scoresRef = collection(db, 'scores');
    const q = query(scoresRef, orderBy('score', 'desc'), limit(10));
    const querySnapshot = await getDocs(q);
    const results: ScoreEntry[] = [];
    querySnapshot.forEach((doc) => {
      const data = doc.data();
      results.push({
        id: doc.id,
        playerName: data.playerName || 'Нэргүй',
        score: data.score || 0,
        answers: data.answers || [],
        createdAt: data.createdAt,
      });
    });
    return results;
  } catch (error) {
    console.error('Error fetching scores from Firestore:', error);
    return [];
  }
}
