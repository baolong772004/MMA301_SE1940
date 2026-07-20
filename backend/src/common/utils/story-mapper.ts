export const AUTHOR_SELECT = {
  avatarUri: true,
  handle: true,
  id: true,
  name: true,
} as const;

export type StoryWithAuthor = {
  author: { avatarUri: null | string; handle: string; id: string; name: string };
  coverUri: string;
  createdAt: Date;
  description: string;
  genres: string;
  id: string;
  moderation: string;
  ratingAvg: number;
  ratingCount: number;
  status: string;
  title: string;
  updatedAt: Date;
  viewCount: number;
};

/** Chuẩn hóa Story trả về client: parse genres JSON, làm tròn rating. */
export function toStoryResponse(story: StoryWithAuthor) {
  return {
    author: story.author,
    coverUri: story.coverUri,
    createdAt: story.createdAt,
    description: story.description,
    genres: JSON.parse(story.genres) as string[],
    id: story.id,
    moderation: story.moderation,
    rating: Math.round(story.ratingAvg * 10) / 10,
    ratingCount: story.ratingCount,
    status: story.status,
    title: story.title,
    updatedAt: story.updatedAt,
    viewCount: story.viewCount,
  };
}
