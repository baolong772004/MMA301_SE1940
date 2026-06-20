import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';

import { Paths } from '@/navigation/paths';
import type { MainTabParamList } from '@/navigation/types';
import { useTheme } from '@/theme';

import { AppIcon } from '@/components/atoms';
import { Alerts, Home, Library, Profile, Write } from '@/screens';

const Tab = createBottomTabNavigator<MainTabParamList>();

const ICONS: Record<keyof MainTabParamList, string> = {
  [Paths.Alerts]: 'notifications',
  [Paths.Home]: 'home',
  [Paths.Library]: 'auto_stories',
  [Paths.Profile]: 'person',
  [Paths.Write]: 'edit_note',
};

const LABELS: Record<keyof MainTabParamList, string> = {
  [Paths.Alerts]: 'Alerts',
  [Paths.Home]: 'Home',
  [Paths.Library]: 'Library',
  [Paths.Profile]: 'Profile',
  [Paths.Write]: 'Write',
};

function MainTabs() {
  const { colors } = useTheme();

  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarActiveTintColor: colors.primary,
        tabBarIcon: ({ focused }) => (
          <AppIcon
            color={focused ? 'primary' : 'onSurfaceVariant'}
            name={ICONS[route.name]}
          />
        ),
        tabBarInactiveTintColor: colors.onSurfaceVariant,
        tabBarLabel: LABELS[route.name],
        tabBarStyle: {
          backgroundColor: colors.surface,
          borderTopColor: colors.surfaceVariant,
        },
      })}
    >
      <Tab.Screen component={Home} name={Paths.Home} />
      <Tab.Screen component={Library} name={Paths.Library} />
      <Tab.Screen component={Write} name={Paths.Write} />
      <Tab.Screen component={Alerts} name={Paths.Alerts} />
      <Tab.Screen component={Profile} name={Paths.Profile} />
    </Tab.Navigator>
  );
}

export default MainTabs;
