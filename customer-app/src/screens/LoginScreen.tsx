import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  Keyboard,
  TouchableWithoutFeedback,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { colors, radius } from '../theme';
import { Button, Label } from '../ui';
import { useLang } from '../i18n';

export default function LoginScreen({ onDone }: { onDone: (phone: string) => void }) {
  const [phone, setPhone] = useState('');
  const { t, lang, setLang, isRTL } = useLang();

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
      <KeyboardAvoidingView
        style={styles.wrap}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <View style={styles.langRow}>
          <Text style={[styles.langBtn, lang === 'en' && styles.langOn]} onPress={() => setLang('en')}>EN</Text>
          <Text style={[styles.langBtn, lang === 'ar' && styles.langOn]} onPress={() => setLang('ar')}>عربي</Text>
        </View>
        <View style={styles.logo}>
          <Text style={styles.logoMark}>🛠️</Text>
        </View>
        <Text style={styles.title}>{t('brand')}</Text>
        <Text style={styles.subtitle}>{t('login_sub')}</Text>

        <View style={styles.form}>
          <Label>{t('phone')}</Label>
          <TextInput
            style={[styles.input, isRTL && styles.rtl]}
            placeholder="+961 70 123 456"
            placeholderTextColor={colors.textHint}
            keyboardType="phone-pad"
            value={phone}
            onChangeText={setPhone}
          />
          <Text style={styles.hint}>{t('login_hint')}</Text>
          <Button
            label={t('continue')}
            onPress={() => onDone(phone.trim())}
            disabled={phone.trim().length < 6}
            style={{ marginTop: 12 }}
          />
        </View>
      </KeyboardAvoidingView>
    </TouchableWithoutFeedback>
  );
}

const styles = StyleSheet.create({
  wrap: { flex: 1, paddingHorizontal: 24, justifyContent: 'center', backgroundColor: colors.bg },
  logo: { alignItems: 'center', marginBottom: 16 },
  logoMark: { fontSize: 44 },
  title: { fontSize: 24, fontWeight: '700', color: colors.text, textAlign: 'center' },
  subtitle: { fontSize: 14, color: colors.textMuted, textAlign: 'center', marginTop: 6, marginBottom: 28 },
  form: { gap: 4 },
  input: {
    height: 48,
    borderWidth: 1,
    borderColor: colors.borderStrong,
    borderRadius: radius.md,
    paddingHorizontal: 14,
    fontSize: 16,
    color: colors.text,
    backgroundColor: colors.bg,
    marginBottom: 8,
  },
  hint: { fontSize: 12, color: colors.textHint, textAlign: 'center' },
  rtl: { textAlign: 'right', writingDirection: 'rtl' },
  langRow: { flexDirection: 'row', justifyContent: 'center', gap: 16, marginBottom: 20 },
  langBtn: { fontSize: 14, fontWeight: '600', color: colors.textHint, paddingHorizontal: 10, paddingVertical: 4 },
  langOn: { color: colors.text },
});
