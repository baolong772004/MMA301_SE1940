export type Author = {
  avatarUri?: string;
  handle?: string;
  id: string;
  name: string;
};

export type Chapter = {
  date: string;
  id: string;
  index: number;
  title: string;
};

export type Story = {
  author: Author;
  coverUri: string;
  genres?: string[];
  id: string;
  rating?: number;
  ratingCount?: number;
  status?: 'completed' | 'ongoing';
  title: string;
  views?: string;
};

export type ReadingProgress = {
  chapterLabel: string;
  progress: number; // 0..1
  story: Story;
};
