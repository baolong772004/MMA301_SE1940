import { Pressable, ScrollView, View } from 'react-native';

import { useTheme } from '@/theme';

import { AppText } from '@/components/atoms';

type Properties = {
  readonly activeIndex: number;
  readonly onChange: (index: number) => void;
  readonly tabs: string[];
};

function Tabs({ activeIndex, onChange, tabs }: Properties) {
  const { borders, colors, gutters, layout } = useTheme();

  return (
    <View style={[borders.wBottom_1, borders.outlineVariant]}>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={[
          layout.row,
          gutters.gap_32,
        ]}
      >
        {tabs.map((tab, index) => {
          const active = index === activeIndex;
          return (
            <Pressable
              key={`${tab}-${index}`}
              onPress={() => {
                onChange(index);
              }}
              style={{
                borderBottomColor: active ? colors.primary : 'transparent',
                borderBottomWidth: 2,
                paddingBottom: 12,
              }}
            >
              <AppText
                color={active ? 'primary' : 'onSurfaceVariant'}
                variant="labelMd"
              >
                {tab}
              </AppText>
            </Pressable>
          );
        })}
      </ScrollView>
    </View>
  );
}

export default Tabs;
