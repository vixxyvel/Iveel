import { ProfileInfo, MediaItem } from '../types';
import effyImg from '../assets/images/effy_bus_stop_photo_1785728015994.jpg';
import aibImg from '../assets/images/aib_poster_image_1785727933160.jpg';

export const IVEEL_PROFILE: ProfileInfo = {
  name: 'Iveel (Ивээл)',
  age: 15,
  hobbies: ['Төгөлдөр хуур тоглох (Piano)', 'Дуу сонсох (Listening to Music)'],
  favoriteSinger: 'Wisp',
  favoriteSong: 'Nuht (The Tourists)',
  youtubeVideoId: 'DZzefP6HzoM',
  socialAccounts: [
    {
      platform: 'Facebook',
      username: 'Iveel Ankhbayar',
      url: 'https://www.facebook.com/search/top?q=Iveel%20Ankhbayar'
    }
  ],
  favoriteShows: [
    {
      title: 'Skins',
      character: 'Effy Stonem',
      image: effyImg
    },
    {
      title: 'Alice in Borderland (AIB)',
      image: aibImg
    }
  ],
  favoriteGames: ['Roblox', 'Mobile Legends: Bang Bang (MLBB)'],
  favoriteColors: ['Har (Хар / Black)', 'Tsenkher (Цэнхэр / Blue)'],
  funFacts: [
    'Дуртай дүр: Effy Stonem (Skins)',
    'Дуртай кино/цуврал: Alice in Borderland (AIB)',
    'Дуртай дуучин: Wisp',
    'Дуртай дуу: Nuht (The Tourists)',
    'Дуртай тоглоом: Roblox, MLBB',
    'Дуртай өнгө: Хар, Цэнхэр',
    'Төгөлдөр хуур тоглох болон хөгжим сонсох сонирхолтой'
  ]
};

export const SYNERGY_FEATURES: MediaItem[] = [
  {
    title: 'Nuht — The Tourists',
    category: 'Featured Track',
    image: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?q=80&w=800&auto=format&fit=crop',
    description: 'Iveel-ийн хамгийн дуртай дуучин Wisp болон дуртай дуу The Tourists-ийн "Nuht".',
    youtubeId: 'DZzefP6HzoM',
    tags: ['Wisp', 'The Tourists', 'Nuht', 'Melody']
  },
  {
    title: 'Piano & Music Synergy',
    category: 'Creative Passion',
    image: 'https://images.unsplash.com/photo-1520523839897-bd0b52f945a0?q=80&w=800&auto=format&fit=crop',
    description: 'Төгөлдөр хуур тоглох ба дуу хөгжимд сонирхолтой.',
    tags: ['Piano', 'Melody', 'Harmony']
  }
];

export const SYNTHESIS_FEATURES: MediaItem[] = [
  {
    title: 'Skins & Effy Stonem',
    category: 'Favorite Series',
    image: effyImg,
    description: 'Skins цувралын Effy-гийн дүр болон AIB (Alice in Borderland) дуртай кино.',
    tags: ['Skins', 'Effy', 'AIB', 'Drama']
  },
  {
    title: 'Alice in Borderland (AIB)',
    category: 'Favorite Movie/Series',
    image: aibImg,
    description: 'Адал явдалт, амьд үлдэх тэмцэл бүхий триллер цуврал.',
    tags: ['AIB', 'Thriller', 'Tokyo', 'Survival']
  }
];

