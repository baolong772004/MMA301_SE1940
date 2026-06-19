import type { BottomTabScreenProps } from '@react-navigation/bottom-tabs';
import type {
  CompositeScreenProps,
  NavigatorScreenParams,
} from '@react-navigation/native';
import type { StackScreenProps } from '@react-navigation/stack';

import type { Paths } from '@/navigation/paths';

export type MainTabParamList = {
  [Paths.Alerts]: undefined;
  [Paths.Home]: undefined;
  [Paths.Library]: undefined;
  [Paths.Profile]: undefined;
  [Paths.Write]: undefined;
};

export type MainTabScreenProps<
  S extends keyof MainTabParamList = keyof MainTabParamList,
> = CompositeScreenProps<
  BottomTabScreenProps<MainTabParamList, S>,
  StackScreenProps<RootStackParamList>
>;

export type RootScreenProps<
  S extends keyof RootStackParamList = keyof RootStackParamList,
> = StackScreenProps<RootStackParamList, S>;

export type RootStackParamList = {
  [Paths.Example]: undefined;
  [Paths.Main]: NavigatorScreenParams<MainTabParamList>;
  [Paths.Reader]: { storyId: string };
  [Paths.Search]: undefined;
  [Paths.Settings]: undefined;
  [Paths.Startup]: undefined;
  [Paths.StoryDetail]: { storyId: string };
  [Paths.Streak]: undefined;
};
