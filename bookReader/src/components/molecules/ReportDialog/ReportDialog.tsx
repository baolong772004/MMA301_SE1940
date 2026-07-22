import { useState } from 'react';
import { Modal, Pressable, TextInput, View } from 'react-native';

import { useTheme } from '@/theme';

import { AppText, Button } from '@/components/atoms';

type Properties = {
  readonly loading?: boolean;
  readonly onClose: () => void;
  readonly onSubmit: (reason: string) => void;
  readonly reasons: readonly string[];
  readonly targetLabel: string;
  readonly visible: boolean;
};

function ReportDialog({
  loading = false,
  onClose,
  onSubmit,
  reasons,
  targetLabel,
  visible,
}: Properties) {
  const { colors, gutters } = useTheme();
  const [customReason, setCustomReason] = useState('');
  const [selectedReason, setSelectedReason] = useState('');

  const reason = customReason.trim() || selectedReason;

  return (
    <Modal
      animationType="fade"
      onRequestClose={onClose}
      transparent
      visible={visible}
    >
      <Pressable
        onPress={onClose}
        style={{
          alignItems: 'center',
          backgroundColor: 'rgba(0,0,0,0.55)',
          flex: 1,
          justifyContent: 'center',
          padding: 20,
        }}
      >
        <Pressable
          onPress={() => undefined}
          style={{
            backgroundColor: colors.surfaceContainerLowest,
            borderColor: colors.outlineVariant,
            borderRadius: 20,
            borderWidth: 1,
            maxWidth: 420,
            padding: 24,
            width: '100%',
          }}
        >
          <AppText color="onSurface" variant="headlineMd">
            Báo cáo vi phạm
          </AppText>
          <AppText
            color="onSurfaceVariant"
            style={gutters.marginTop_8}
            variant="bodyMd"
          >
            Chọn lý do báo cáo {targetLabel}. Báo cáo sẽ được gửi đến quản trị viên để xử lý.
          </AppText>

          <View style={[gutters.gap_8, gutters.marginTop_16]}>
            {reasons.map((item) => (
              <Pressable
                key={item}
                onPress={() => {
                  setCustomReason('');
                  setSelectedReason(item);
                }}
                style={{
                  backgroundColor:
                    selectedReason === item && !customReason
                      ? colors.primaryContainer
                      : colors.surfaceVariant,
                  borderColor:
                    selectedReason === item && !customReason
                      ? colors.primary
                      : colors.outlineVariant,
                  borderRadius: 10,
                  borderWidth: 1,
                  paddingHorizontal: 12,
                  paddingVertical: 10,
                }}
              >
                <AppText
                  color={
                    selectedReason === item && !customReason
                      ? 'onPrimaryContainer'
                      : 'onSurface'
                  }
                  variant="bodyMd"
                >
                  {item}
                </AppText>
              </Pressable>
            ))}
          </View>

          <TextInput
            maxLength={500}
            multiline
            onChangeText={setCustomReason}
            placeholder="Hoặc nhập lý do khác..."
            placeholderTextColor={colors.onSurfaceVariant}
            style={{
              borderColor: colors.outlineVariant,
              borderRadius: 10,
              borderWidth: 1,
              color: colors.onSurface,
              height: 92,
              marginTop: 12,
              padding: 12,
              textAlignVertical: 'top',
            }}
            value={customReason}
          />

          <View style={{ flexDirection: 'row', gap: 12, marginTop: 20 }}>
            <View style={{ flex: 1 }}>
              <Button fullWidth label="Hủy" onPress={onClose} variant="outlined" />
            </View>
            <View style={{ flex: 1 }}>
              <Button
                disabled={loading || !reason}
                fullWidth
                label={loading ? 'Đang gửi...' : 'Gửi báo cáo'}
                onPress={() => {
                  onSubmit(reason);
                }}
              />
            </View>
          </View>
        </Pressable>
      </Pressable>
    </Modal>
  );
}

export default ReportDialog;
