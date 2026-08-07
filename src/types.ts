export type ModalType = 'synergy' | 'synthesis' | 'discover' | 'music' | 'idol' | null;

export interface ChatMessage {
  id: string;
  sender: 'user' | 'bot';
  text: string;
  timestamp: string;
}

export interface MediaItem {
  title: string;
  category: string;
  image: string;
  description: string;
  youtubeId?: string;
  tags: string[];
}

export interface ProfileInfo {
  name: string;
  age: number;
  hobbies: string[];
  favoriteSinger: string;
  favoriteSong: string;
  youtubeVideoId: string;
  socialAccounts?: {
    platform: string;
    username: string;
    url?: string;
  }[];
  favoriteShows: {
    title: string;
    character?: string;
    image: string;
  }[];
  favoriteGames: string[];
  favoriteColors: string[];
  funFacts: string[];
}
