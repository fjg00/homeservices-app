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
  const [phoneValue, setPhoneValue] = useState(phone);
  const [addressValue, setAddressValue] = useState(defaultAddress);
  const [pinValue, setPinValue] = useState<string | null>(defaultPin || null);

  const changed =
    phoneValue.trim() !== phone ||
    addressValue.trim() !== defaultAddress ||
    (pinValue || '') !== (defaultPin || '');
  const canSave = phoneValue.trim().length >= 6 && changed;

  return (
    <View style={styles.wrap}>
      <Header title="Profile" onBack={onBack} />
      <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
        <ScrollView contentContainerStyle={styles.body} keyboardShouldPersistTaps="handled">
          <Label>Phone number</Label>
          <TextInput
            style={styles.input}
            placeholder="+961 70 123 456"
            placeholderTextColor={colors.textHint}
            keyboardType="phone-pad"
            value={phoneValue}
            onChangeText={setPhoneValue}
          />
          <Text style={styles.hint}>This is the number we'll call you on about your bookings.</Text>

          <View style={{ height: 24 }} />

          <Text style={styles.sectionTitle}>Default address</Text>
          <Text style={[styles.hint, { marginBottom: 10 }]}>
            We'll fill this in automatically when you book, so you don't set it each time.
          </Text>
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
            label="Save"
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
});
