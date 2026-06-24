import type { RootScreenProps } from '@/navigation/types';

import { View } from 'react-native';

import { Paths } from '@/navigation/paths';
import { useTheme } from '@/theme';

import { SafeScreen } from '@/components/templates';
import { AppText, Button } from '@/components/atoms';
import { StatCard } from '@/components/molecules';

function AdminHome({ navigation }: RootScreenProps<Paths.Admin>) {
  const { layout, gutters, colors } = useTheme();

  return (
    <SafeScreen>
      <View style={[layout.flex_1, gutters.padding_24, gutters.gap_24] as any}>
        <View style={[layout.row, layout.itemsCenter, layout.justifyBetween] as any}>
          <AppText variant="headlineLg">Tổng quan</AppText>
          <View style={[layout.row, layout.itemsCenter] as any}>
            <AppText variant="labelMd" style={{ marginRight: 12 }}>Xin chào, Admin</AppText>
            <Button
              label="Đăng xuất"
              variant="outlined"
              onPress={() => navigation.reset({ index: 0, routes: [{ name: Paths.Login }] })}
            />
          </View>
        </View>

        <View style={[layout.row, gutters.gap_16] as any}>
          <StatCard icon="people" label="Tổng người dùng" value="124,592" />
          <StatCard icon="book" label="Tổng truyện" value="8,430" />
          <StatCard icon="currency-usd" label="Doanh thu" value="$12,450" />
        </View>

        <View style={[{ height: 240, borderRadius: 12, backgroundColor: 'rgba(0,0,0,0.03)' }]} />
      </View>
    </SafeScreen>
  );
}

export default AdminHome;
