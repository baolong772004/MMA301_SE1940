export type AuthorWork = {
  coverUri: string;
  id: string;
  status: 'completed' | 'ongoing';
  title: string;
};

export const authorStats = [
  {
    icon: 'auto_stories',
    id: 's1',
    labelKey: 'writer_studio.reads',
    value: '45.2K',
  },
  {
    icon: 'person',
    id: 's2',
    labelKey: 'writer_studio.followers',
    value: '1.2K',
  },
  {
    icon: 'star',
    id: 's3',
    labelKey: 'writer_studio.earnings',
    value: '$320',
  },
];

export const authorWorks: AuthorWork[] = [
  {
    coverUri: 'https://picsum.photos/seed/work1/150/225',
    id: 'w1',
    status: 'ongoing',
    title: 'The Legend of Yggdrasil',
  },
  {
    coverUri: 'https://picsum.photos/seed/work2/150/225',
    id: 'w2',
    status: 'completed',
    title: 'Shadow Lord Chronicles',
  },
  {
    coverUri: 'https://picsum.photos/seed/work3/150/225',
    id: 'w3',
    status: 'ongoing',
    title: 'Silent Forest Secrets',
  },
];
