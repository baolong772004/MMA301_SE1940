import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import MainTabs from '@/navigation/MainTabs';
import { Paths } from '@/navigation/paths';
import type { RootStackParamList } from '@/navigation/types';
import { useTheme } from '@/theme';

import { Example, Reader, Search, Settings, Startup, StoryDetail, Streak } from '@/screens';

const Stack = createStackNavigator<RootStackParamList>();

function ApplicationNavigator() {
  const { navigationTheme, variant } = useTheme();

  return (
    <SafeAreaProvider>
      <NavigationContainer theme={navigationTheme}>
        <Stack.Navigator key={variant} screenOptions={{ headerShown: false }}>
          <Stack.Screen component={Startup} name={Paths.Startup} />
          <Stack.Screen component={MainTabs} name={Paths.Main} />
          <Stack.Screen component={Example} name={Paths.Example} />
          <Stack.Screen component={StoryDetail} name={Paths.StoryDetail} />
          <Stack.Screen component={Reader} name={Paths.Reader} />
          <Stack.Screen component={Search} name={Paths.Search} />
          <Stack.Screen component={Settings} name={Paths.Settings} />
          <Stack.Screen component={Streak} name={Paths.Streak} />
        </Stack.Navigator>
      </NavigationContainer>
    </SafeAreaProvider>
  );
}

export default ApplicationNavigator;
