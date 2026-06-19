import type { AppStorage } from '@/services/storage';

import { fireEvent, render, screen } from '@testing-library/react-native';
import { Button, Text, View } from 'react-native';

import { ThemeProvider, useTheme } from '@/theme';

const createMockStorage = (): AppStorage => {
  const map = new Map<string, string>();
  return {
    delete: (key) => {
      map.delete(key);
    },
    getString: (key) => map.get(key),
    set: (key, value) => {
      map.set(key, value);
    },
  };
};

function TestChildComponent() {
  const { changeTheme, variant } = useTheme();
  return (
    <View>
      <Text testID="theme-variant">{variant}</Text>
      <Button
        onPress={() => {
          changeTheme('dark');
        }}
        testID="change-btn"
        title="button"
      />
    </View>
  );
}

describe('ThemeProvider', () => {
  let storage: AppStorage;

  beforeEach(() => {
    storage = createMockStorage();
  });

  it('initializes with the default theme when no theme is defined in storage', () => {
    render(
      <ThemeProvider storage={storage}>
        <TestChildComponent />
      </ThemeProvider>,
    );
    // Assert that the theme context is initialized with 'default'
    expect(screen.getByText('default')).toBeTruthy();
  });

  it('loads the theme from storage if defined', () => {
    storage.set('theme', 'dark');

    render(
      <ThemeProvider storage={storage}>
        <TestChildComponent />
      </ThemeProvider>,
    );

    // Assert that the theme context is initialized with 'dark'
    expect(screen.getByText('dark')).toBeTruthy();
  });

  it('changes the theme when calling changeTheme', () => {
    render(
      <ThemeProvider storage={storage}>
        <TestChildComponent />
      </ThemeProvider>,
    );

    // Assert that the theme context is initialized with 'default'
    expect(screen.getByText('default')).toBeTruthy();
    fireEvent.press(screen.getByTestId('change-btn'));

    // Assert that the theme has changed to 'light'
    expect(screen.getByText('dark')).toBeTruthy();
  });
});
