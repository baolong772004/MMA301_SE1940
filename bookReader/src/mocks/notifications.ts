export type Notification = {
  avatarUri?: string;
  iconName?: string;
  id: string;
  message: string;
  time: string;
  unread: boolean;
};

export const todayNotifications: Notification[] = [
  {
    avatarUri: 'https://picsum.photos/seed/auth1/100/100',
    id: 'n1',
    message: 'John Doe published a new chapter for Whispers of the Wind.',
    time: '2 hours ago',
    unread: true,
  },
  {
    iconName: 'star',
    id: 'n2',
    message: 'Your story The Legend of Yggdrasil reached 100 stars!',
    time: '5 hours ago',
    unread: true,
  },
];

export const earlierNotifications: Notification[] = [
  {
    avatarUri: 'https://picsum.photos/seed/auth2/100/100',
    id: 'n3',
    message: 'Jane Smith started following your Writer Studio.',
    time: '1 day ago',
    unread: false,
  },
  {
    iconName: 'fire',
    id: 'n4',
    message: 'You completed your 7-day reading streak! Keep it up!',
    time: '3 days ago',
    unread: false,
  },
];
