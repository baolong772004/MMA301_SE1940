import type { Story } from '@/models';

import { recommendedStories } from './stories';

export const readingStories: Story[] = [
  recommendedStories[0],
  recommendedStories[1],
];

export const savedStories: Story[] = [
  recommendedStories[2],
  recommendedStories[3],
];

export const completedStories: Story[] = [];
