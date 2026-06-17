import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  Keyboard,
  TouchableWithoutFeedback,
  ScrollView,
} from 'react-native';
import { colors, radius } from '../theme';
import { Button, Header, Label } from '../ui';
import LocationPicker from '../components/LocationPicker';
import { useLang } from '../i18n';

export default function ProfileScreen({
  phone,
  defaultAddress,
  defaultPin,
  onBack,
  onSave,
}: {
  phone: string;
  defaultAddress: string;
  defaultPin: string;
  onBack: () => void;
  onSave: (phone: string, address: string, pin: string) => void;
}) {
  const { t, lang, setLang, isRTL } = useLang();
  const [phoneValue, setPhoneValue] = useState(phone);
  const [addressValue, setAddressValue] = useState(defaultAddress);
  const [pinValue, setPinValue] = useState<string | null>(defaultPin || null);

  const changed =
    phoneValue.trim() !== phone ||
    addressValue.trim() !== defaultAddress ||
    (pinValue || '') !== (defaultPin || '');
  const canSave = phoneValue.trim().length >= 6 && changed;
  const rtl = isRTL && styles.rtl;

  return (
    <View style={styles.wrap}>
      <Header title={t('profile')} onBack={onBack} />
      <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
        <ScrollView contentContainerStyle={styles.body} keyboardShouldPersistTaps="handled">
          <Label>{t('language')}</Label>
          <View style={styles.langRow}>
            <Text
              style={[styles.langBtn, lang === 'en' && styles.langOn]}
              onPress={() => setLang('en')}
            >
              English
            </Text>
            <Text
              style={[styles.langBtn, lang === 'ar' && styles.langOn]}
              onPress={() => setLang('ar')}
            >
              العربية
            </Text>
          </View>

          <View style={{ height: 16 }} />

          <Label>{t('phone_number')}</Label>
          <TextInput
            style={[styles.input, rtl]}
            placeholder="+961 70 123 456"
            placeholderTextColor={colors.textHint}
            keyboardType="phone-pad"
            value={phoneValue}
            onChangeText={setPhoneValue}
          />
          <Text style={[styles.hint, rtl]}>{t('profile_phone_hint')}</Text>

          <View style={{ height: 24 }} />

          <Text style={[styles.sectionTitle, rtl]}>{t('default_address')}</Text>
          <Text style={[styles.hint, { marginBottom: 10 }, rtl]}>{t('default_address_hint')}</Text>
          <LocationPicker
            pin={pinValue}
            address={addressValue}
            onPinChange={setPinValue}
            onAddressChange={setAddressValue}
            onReset={() => {
              setAddressValue('');
              setPinValue(null);
            }}
            canReset={addressValue.trim().length > 0 || !!pinValue}
          />

          <Button
            label={t('save')}
            onPress={() => onSave(phoneValue.trim(), addressValue.trim(), pinValue || '')}
            disabled={!canSave}
            style={{ marginTop: 12 }}
          />
        </ScrollView>
      </TouchableWithoutFeedback>
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
    fontSize: 16,
    color: colors.text,
    backgroundColor: colors.bg,
    marginBottom: 8,
    minHeight: 48,
  },
  sectionTitle: { fontSize: 16, fontWeight: '600', color: colors.text, marginBottom: 4 },
  hint: { fontSize: 12, color: colors.textHint },
  rtl: { textAlign: 'right', writingDirection: 'rtl' },
  langRow: { flexDirection: 'row', gap: 10 },
  langBtn: {
    borderWidth: 1,
    borderColor: colors.borderStrong,
    borderRadius: radius.md,
    paddingHorizontal: 16,
    paddingVertical: 10,
    fontSize: 15,
    color: colors.textMuted,
    overflow: 'hidden',
  },
  langOn: { borderColor: colors.info, backgroundColor: colors.infoBg, color: colors.info, fontWeight: '600' },
});
