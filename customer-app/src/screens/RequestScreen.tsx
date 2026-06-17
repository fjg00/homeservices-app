import React, { useMemo, useState } from 'react';
import { View, Text, TextInput, Pressable, StyleSheet, ScrollView, Image } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { colors, radius } from '../theme';
import { Button, Header, Label } from '../ui';
import { Service, TimePref, timeWindows, svcName } from '../data';
import LocationPicker from '../components/LocationPicker';
import { useLang } from '../i18n';

const timeOptionIds: TimePref[] = ['asap', 'today', 'pickday'];
const timeKey: Record<TimePref, any> = { asap: 'asap', today: 'today', pickday: 'pick_day' };

export default function RequestScreen({
  service,
  defaultPhone,
  defaultAddress,
  defaultPin,
  submitting,
  onBack,
  onSubmit,
}: {
  service: Service;
  defaultPhone: string;
  defaultAddress: string;
  defaultPin: string;
  submitting?: boolean;
  onBack: () => void;
  onSubmit: (data: {
    phone: string;
    description: string;
    photoBase64?: string | null;
    landmark: string;
    pin?: string;
    timePref: TimePref;
    dayLabel?: string;
    timeWindow?: string;
    saveAsDefault?: boolean;
  }) => void;
}) {
  const { t, lang, isRTL } = useLang();
  const [phoneValue, setPhoneValue] = useState(defaultPhone);
  const [description, setDescription] = useState('');
  const [photo, setPhoto] = useState<{ uri: string; base64: string } | null>(null);
  const [landmark, setLandmark] = useState(defaultAddress);

  const pickPhoto = async () => {
    const res = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      quality: 0.5,
      base64: true,
    });
    if (!res.canceled && res.assets[0]?.base64) {
      setPhoto({ uri: res.assets[0].uri, base64: res.assets[0].base64 });
    }
  };
  const [pin, setPin] = useState<string | null>(defaultPin || null);
  const [timePref, setTimePref] = useState<TimePref>('asap');
  const [timeWindow, setTimeWindow] = useState<string | null>(null);
  const [day, setDay] = useState<string | null>(null);
  const [saveAsDefault, setSaveAsDefault] = useState(!defaultAddress && !defaultPin);

  const hasLocation = landmark.trim().length > 0 || !!pin;
  // Offer to save when the address or pin is new or different from the saved default.
  const offerSave =
    hasLocation && (landmark.trim() !== defaultAddress || (pin || '') !== (defaultPin || ''));

  const resetLocation = () => {
    setLandmark('');
    setPin(null);
    setSaveAsDefault(true);
  };

  const days = useMemo(() => {
    const arr: { key: string; label: string }[] = [];
    for (let i = 1; i <= 7; i++) {
      const d = new Date();
      d.setDate(d.getDate() + i);
      arr.push({
        key: d.toISOString().slice(0, 10),
        label: d.toLocaleDateString(undefined, { weekday: 'short', day: 'numeric', month: 'short' }),
      });
    }
    return arr;
  }, []);

  const needsWindow = timePref === 'today' || timePref === 'pickday';
  const needsDay = timePref === 'pickday';

  const canSubmit =
    phoneValue.trim().length >= 6 &&
    description.trim().length >= 3 &&
    (!needsWindow || !!timeWindow) &&
    (!needsDay || !!day);

  return (
    <View style={styles.wrap}>
      <Header title={`${svcName(service, lang)} · ${t('request_title')}`} onBack={onBack} />
      <ScrollView contentContainerStyle={styles.body} keyboardShouldPersistTaps="handled">
        <Label>{t('phone_number')}</Label>
        <TextInput
          style={[styles.input, isRTL && styles.rtl]}
          placeholder="+961 70 123 456"
          placeholderTextColor={colors.textHint}
          keyboardType="phone-pad"
          value={phoneValue}
          onChangeText={setPhoneValue}
        />

        <Label>{t('describe')}</Label>
        <TextInput
          style={[styles.input, styles.textarea, isRTL && styles.rtl]}
          placeholder={t('describe_ph')}
          placeholderTextColor={colors.textHint}
          multiline
          value={description}
          onChangeText={setDescription}
        />

        {photo ? (
          <View style={styles.photoRow}>
            <Image source={{ uri: photo.uri }} style={styles.thumb} />
            <Pressable style={styles.photoRemove} onPress={() => setPhoto(null)}>
              <Text style={styles.photoRemoveText}>✕</Text>
            </Pressable>
          </View>
        ) : (
          <Pressable style={styles.photoBtn} onPress={pickPhoto}>
            <Text style={styles.photoText}>{t('add_photo')}</Text>
          </Pressable>
        )}

        <LocationPicker
          pin={pin}
          address={landmark}
          onPinChange={setPin}
          onAddressChange={setLandmark}
          onReset={resetLocation}
          canReset={hasLocation}
        />

        {offerSave ? (
          <Pressable style={styles.checkRow} onPress={() => setSaveAsDefault((v) => !v)}>
            <View style={[styles.checkbox, saveAsDefault && styles.checkboxOn]}>
              {saveAsDefault ? <Text style={styles.checkMark}>✓</Text> : null}
            </View>
            <Text style={styles.checkLabel}>
              {defaultAddress ? t('update_default') : t('save_default')}
            </Text>
          </Pressable>
        ) : null}

        <Label>{t('when')}</Label>
        <View style={styles.chips}>
          {timeOptionIds.map((id) => {
            const on = timePref === id;
            return (
              <Pressable
                key={id}
                style={[styles.chip, on && styles.chipOn]}
                onPress={() => {
                  setTimePref(id);
                  if (id === 'asap') {
                    setTimeWindow(null);
                    setDay(null);
                  }
                }}
              >
                <Text style={[styles.chipText, on && styles.chipTextOn]}>{t(timeKey[id])}</Text>
              </Pressable>
            );
          })}
        </View>

        {needsDay ? (
          <>
            <Label>{t('which_day')}</Label>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.dayRow}
            >
              {days.map((d) => {
                const on = day === d.key;
                return (
                  <Pressable
                    key={d.key}
                    style={[styles.dayChip, on && styles.chipOn]}
                    onPress={() => setDay(d.key)}
                  >
                    <Text style={[styles.chipText, on && styles.chipTextOn]}>{d.label}</Text>
                  </Pressable>
                );
              })}
            </ScrollView>
          </>
        ) : null}

        {needsWindow ? (
          <>
            <Label>{t('time_window')}</Label>
            <View style={styles.windowGrid}>
              {timeWindows.map((w) => {
                const on = timeWindow === w;
                return (
                  <Pressable
                    key={w}
                    style={[styles.windowChip, on && styles.chipOn]}
                    onPress={() => setTimeWindow(w)}
                  >
                    <Text style={[styles.chipText, on && styles.chipTextOn]}>{w}</Text>
                  </Pressable>
                );
              })}
            </View>
          </>
        ) : null}

        <Button
          label={submitting ? t('submitting') : t('submit')}
          onPress={() =>
            onSubmit({
              phone: phoneValue,
              description,
              photoBase64: photo?.base64,
              landmark,
              pin: pin || undefined,
              timePref,
              dayLabel: day ? days.find((d) => d.key === day)?.label : undefined,
              timeWindow: timeWindow || undefined,
              saveAsDefault: offerSave && saveAsDefault,
            })
          }
          disabled={!canSubmit || submitting}
          style={{ marginTop: 22 }}
        />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { flex: 1, backgroundColor: colors.bg },
  body: { padding: 16, paddingBottom: 40 },
  input: {
    borderWidth: 1,
    borderColor: colors.borderStrong,
    borderRadius: radius.md,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 15,
    color: colors.text,
    backgroundColor: colors.bg,
    marginBottom: 14,
  },
  textarea: { minHeight: 80, textAlignVertical: 'top' },
  rtl: { textAlign: 'right', writingDirection: 'rtl' },
  landmark: { minHeight: 56, textAlignVertical: 'top' },
  checkRow: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 18, marginTop: -4 },
  checkbox: {
    width: 22,
    height: 22,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: colors.borderStrong,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkboxOn: { backgroundColor: colors.info, borderColor: colors.info },
  checkMark: { color: colors.onPrimary, fontSize: 13, fontWeight: '700' },
  checkLabel: { fontSize: 14, color: colors.text },
  photoBtn: {
    borderWidth: 1,
    borderColor: colors.borderStrong,
    borderRadius: radius.md,
    paddingVertical: 12,
    alignItems: 'center',
    marginBottom: 18,
  },
  photoText: { fontSize: 14, color: colors.text, fontWeight: '500' },
  photoRow: { marginBottom: 18, flexDirection: 'row', alignItems: 'flex-start' },
  thumb: { width: 84, height: 84, borderRadius: radius.md, backgroundColor: colors.surface },
  photoRemove: {
    marginLeft: 8,
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: colors.surface2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  photoRemoveText: { color: colors.textMuted, fontSize: 13, fontWeight: '700' },
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
  mapText: { color: colors.textMuted, fontSize: 14 },
  chips: { flexDirection: 'row', gap: 8 },
  chip: {
    flex: 1,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.pill,
    paddingVertical: 10,
    alignItems: 'center',
  },
  chipOn: { borderColor: colors.info, backgroundColor: colors.infoBg },
  chipText: { fontSize: 13, color: colors.textMuted },
  chipTextOn: { color: colors.info, fontWeight: '600' },
  dayRow: { gap: 8, paddingVertical: 12, paddingRight: 8 },
  dayChip: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.pill,
    paddingVertical: 10,
    paddingHorizontal: 14,
  },
  windowGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 12 },
  windowChip: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.pill,
    paddingVertical: 10,
    paddingHorizontal: 16,
  },
});
