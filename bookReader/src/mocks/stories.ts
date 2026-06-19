import type { Chapter, ReadingProgress, Story } from '@/models';

export const recommendedStories: Story[] = [
  {
    author: {
      avatarUri: 'https://picsum.photos/seed/auth1/100/100',
      handle: '@johndoe',
      id: 'auth1',
      name: 'John Doe',
    },
    coverUri: 'https://picsum.photos/seed/story1/300/450',
    genres: ['Fantasy', 'Adventure'],
    id: '1',
    rating: 4.5,
    ratingCount: 120,
    status: 'completed',
    title: 'Whispers of the Wind',
    views: '12K',
  },
  {
    author: {
      avatarUri: 'https://picsum.photos/seed/auth2/100/100',
      handle: '@janesmith',
      id: 'auth2',
      name: 'Jane Smith',
    },
    coverUri: 'https://picsum.photos/seed/story2/300/450',
    genres: ['Mystery', 'Thriller'],
    id: '2',
    rating: 4.2,
    ratingCount: 85,
    status: 'ongoing',
    title: 'Shadow in the Mirror',
    views: '8.5K',
  },
  {
    author: {
      avatarUri: 'https://picsum.photos/seed/auth3/100/100',
      handle: '@alexj',
      id: 'auth3',
      name: 'Alex Johnson',
    },
    coverUri: 'https://picsum.photos/seed/story3/300/450',
    genres: ['Sci-Fi', 'Steampunk'],
    id: '3',
    rating: 4.8,
    ratingCount: 310,
    status: 'ongoing',
    title: 'The Clockwork City',
    views: '32K',
  },
  {
    author: {
      avatarUri: 'https://picsum.photos/seed/auth1/100/100',
      handle: '@johndoe',
      id: 'auth1',
      name: 'John Doe',
    },
    coverUri: 'https://picsum.photos/seed/story4/300/450',
    genres: ['Romance', 'Drama'],
    id: '4',
    rating: 4,
    ratingCount: 64,
    status: 'completed',
    title: 'Beyond the Horizon',
    views: '5K',
  },
  {
    author: {
      avatarUri: 'https://picsum.photos/seed/auth2/100/100',
      handle: '@janesmith',
      id: 'auth2',
      name: 'Jane Smith',
    },
    coverUri: 'https://picsum.photos/seed/story5/300/450',
    genres: ['Fantasy', 'Magic'],
    id: '5',
    rating: 4.7,
    ratingCount: 215,
    status: 'ongoing',
    title: 'Echoes of Eternity',
    views: '22K',
  },
  {
    author: {
      avatarUri: 'https://picsum.photos/seed/auth3/100/100',
      handle: '@alexj',
      id: 'auth3',
      name: 'Alex Johnson',
    },
    coverUri: 'https://picsum.photos/seed/story6/300/450',
    genres: ['Adventure', 'Drama'],
    id: '6',
    rating: 4.3,
    ratingCount: 92,
    status: 'completed',
    title: 'The Silent Forest',
    views: '9.2K',
  },
];

export const continueReading: ReadingProgress[] = [
  {
    chapterLabel: 'Ch. 2: Unexpected Discovery',
    progress: 0.4,
    story: recommendedStories[1],
  },
  {
    chapterLabel: 'Ch. 4: Dark Paths',
    progress: 0.75,
    story: recommendedStories[2],
  },
];

export const featuredStory: Story = {
  author: {
    avatarUri: 'https://picsum.photos/seed/auth1/100/100',
    handle: '@johndoe',
    id: 'auth1',
    name: 'John Doe',
  },
  coverUri: 'https://picsum.photos/seed/featured/300/450',
  genres: ['Fantasy', 'Adventure', 'Action'],
  id: 'featured',
  rating: 4.9,
  ratingCount: 1540,
  status: 'ongoing',
  title: 'NovaTales Chronicles',
  views: '150K',
};

export const chapters: Chapter[] = [
  {
    date: '2026-06-01',
    id: 'c1',
    index: 1,
    title: 'Chapter 1: The Beginning',
  },
  {
    date: '2026-06-02',
    id: 'c2',
    index: 2,
    title: 'Chapter 2: Unexpected Discovery',
  },
  {
    date: '2026-06-03',
    id: 'c3',
    index: 3,
    title: 'Chapter 3: The Journey',
  },
  {
    date: '2026-06-04',
    id: 'c4',
    index: 4,
    title: 'Chapter 4: Dark Paths',
  },
  {
    date: '2026-06-05',
    id: 'c5',
    index: 5,
    title: 'Chapter 5: Resolution',
  },
];
