import React, { useState } from 'react';
import { View, Text, TextInput, Pressable, StyleSheet } from 'react-native';
import { colors, radius } from '../theme';
import MapModal from './MapModal';
import { useLang } from '../i18n';

export default function LocationPicker({
  pin,
  address,
  onPinChange,
  onAddressChange,
  onReset,
  canReset,
}: {
  pin: string | null;
  address: string;
  onPinChange: (pin: string) => void;
  onAddressChange: (text: string) => void;
  onReset?: () => void;
  canReset?: boolean;
}) {
  const [mapOpen, setMapOpen] = useState(false);
  const { t, isRTL } = useLang();

  return (
    <View>
      <View style={styles.labelRow}>
        <Text style={styles.label}>{t('location')}</Text>
        {canReset && onReset ? (
          <Pressable onPress={onReset} hitSlop={8}>
            <Text style={styles.reset}>{t('reset')}</Text>
          </Pressable>
        ) : null}
      </View>

      <Pressable style={[styles.map, pin ? styles.mapSet : null]} onPress={() => setMapOpen(true)}>
        {pin ? (
          <View style={{ alignItems: 'center' }}>
            <Text style={styles.mapSetText}>{t('map_pinned')}</Text>
            <Text style={styles.coords}>{pin}</Text>
            <Text style={styles.tapAgain}>{t('map_tap_open')}</Text>
          </View>
        ) : (
          <Text style={styles.mapText}>{t('map_set_tap')}</Text>
        )}
      </Pressable>

      <TextInput
        style={[styles.input, isRTL && { textAlign: 'right', writingDirection: 'rtl' }]}
        placeholder={t('landmark_ph')}
        placeholderTextColor={colors.textHint}
        value={address}
        onChangeText={onAddressChange}
        multiline
      />

      <MapModal
        visible={mapOpen}
        initial={pin}
        onClose={() => setMapOpen(false)}
        onPick={(coord) => {
          onPinChange(coord);
          setMapOpen(false);
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  labelRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 },
  label: { fontSize: 12, color: colors.textHint },
  reset: { fontSize: 13, color: colors.info, fontWeight: '600' },
  map: {
    height: 96,
    borderRadius: radius.md,
    borderWidth: 1,
    borderStyle: 'dashed',
    borderColor: colors.borderStrong,
    backgroundColor: colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  mapSet: { borderStyle: 'solid', borderColor: colors.info, backgroundColor: colors.infoBg },
  mapText: { color: colors.textMuted, fontSize: 14 },
  mapSetText: { color: colors.info, fontSize: 14, fontWeight: '600' },
  coords: { color: colors.info, fontSize: 12, marginTop: 4 },
  tapAgain: { color: colors.info, fontSize: 11, marginTop: 4, opacity: 0.8 },
  input: {
    borderWidth: 1,
    borderColor: colors.borderStrong,
    borderRadius: radius.md,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 15,
    color: colors.text,
    backgroundColor: colors.bg,
    minHeight: 56,
    textAlignVertical: 'top',
    marginBottom: 14,
  },
});
