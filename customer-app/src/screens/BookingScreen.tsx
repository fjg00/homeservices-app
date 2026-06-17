import React from 'react';
import { View, Text, Pressable, StyleSheet, ScrollView } from 'react-native';
import { colors, radius } from '../theme';
import { Button, Header } from '../ui';
import { Booking, BookingStatus } from '../data';

const steps: { key: BookingStatus; label: string }[] = [
  { key: 'requested', label: 'Requested' },
  { key: 'quoted', label: 'Quote ready' },
  { key: 'assigned', label: 'Provider assigned' },
  { key: 'on_way', label: 'On the way' },
  { key: 'completed', label: 'Done · pay cash' },
];

const order: BookingStatus[] = ['requested', 'quoted', 'assigned', 'on_way', 'completed', 'rated'];

export default function BookingScreen({
  booking,
  onBack,
  onAccept,
  onDecline,
  onRate,
}: {
  booking: Booking;
  onBack: () => void;
  onAccept: () => void;
  onDecline: () => void;
  onRate: (stars: number) => void;
}) {
  const currentIdx = order.indexOf(booking.status);

  return (
    <View style={styles.wrap}>
      <Header title={`Booking ${booking.ref}`} onBack={onBack} />
      <ScrollView contentContainerStyle={styles.body}>
        {steps.map((step) => {
          const stepIdx = order.indexOf(step.key);
          const done = stepIdx < currentIdx;
          const now = stepIdx === currentIdx;

          return (
            <View key={step.key}>
              <View style={styles.stepRow}>
                <View
                  style={[
                    styles.dot,
                    done && styles.dotDone,
                    now && styles.dotNow,
                  ]}
                >
                  {done ? <Text style={styles.dotCheck}>✓</Text> : null}
                </View>
                <Text style={[styles.stepLabel, !done && !now && styles.stepFuture]}>
                  {step.label}
                </Text>
              </View>

              {step.key === 'quoted' && booking.status === 'quoted' ? (
                <View style={styles.quoteBox}>
                  <Text style={styles.quoteLabel}>Your quote</Text>
                  <Text style={styles.quoteAmount}>
                    ${booking.quoteAmount}{' '}
                    <Text style={styles.quoteCur}>{booking.quoteCurrency}</Text>
                  </Text>
                  {booking.quoteNote ? (
                    <Text style={styles.quoteNote}>{booking.quoteNote}</Text>
                  ) : null}
                  <View style={styles.quoteActions}>
                    <Button label="Accept" onPress={onAccept} style={{ flex: 1 }} />
                    <Button label="Decline" variant="outline" onPress={onDecline} style={{ flex: 1 }} />
                  </View>
                </View>
              ) : null}

              {(step.key === 'assigned' || step.key === 'on_way') &&
              booking.providerName &&
              currentIdx >= order.indexOf('assigned') ? (
                step.key === 'assigned' ? (
                  <View style={styles.providerCard}>
                    <View style={styles.avatar}>
                      <Text style={styles.avatarText}>
                        {booking.providerName.slice(0, 1)}
                      </Text>
                    </View>
                    <Text style={styles.providerName}>
                      {booking.providerName} — your {booking.service.name.toLowerCase()}
                    </Text>
                  </View>
                ) : null
              ) : null}
            </View>
          );
        })}

        {booking.status === 'completed' ? (
          <RatePrompt onRate={onRate} />
        ) : null}

        {booking.status === 'rated' ? (
          <View style={styles.thanks}>
            <Text style={styles.thanksText}>
              {'★'.repeat(booking.rating || 0)}
              {'☆'.repeat(5 - (booking.rating || 0))}
            </Text>
            <Text style={styles.thanksSub}>Thanks for your rating!</Text>
          </View>
        ) : null}
      </ScrollView>
    </View>
  );
}

function RatePrompt({ onRate }: { onRate: (n: number) => void }) {
  const [stars, setStars] = React.useState(0);
  return (
    <View style={styles.rateBox}>
      <Text style={styles.rateTitle}>Rate the service</Text>
      <View style={styles.starsRow}>
        {[1, 2, 3, 4, 5].map((n) => (
          <Pressable key={n} onPress={() => setStars(n)} hitSlop={6}>
            <Text style={[styles.star, n <= stars && styles.starOn]}>★</Text>
          </Pressable>
        ))}
      </View>
      <Button
        label="Submit rating"
        onPress={() => onRate(stars)}
        disabled={stars === 0}
        style={{ marginTop: 12 }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { flex: 1, backgroundColor: colors.bg },
  body: { padding: 20 },
  stepRow: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 10 },
  dot: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 1,
    borderColor: colors.borderStrong,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dotDone: { backgroundColor: colors.success, borderColor: colors.success },
  dotNow: { borderColor: colors.info, borderWidth: 2 },
  dotCheck: { color: colors.onPrimary, fontSize: 12, fontWeight: '700' },
  stepLabel: { fontSize: 15, color: colors.text },
  stepFuture: { color: colors.textHint },
  quoteBox: {
    marginLeft: 34,
    marginVertical: 8,
    borderWidth: 1,
    borderColor: colors.info,
    backgroundColor: colors.infoBg,
    borderRadius: radius.md,
    padding: 16,
  },
  quoteLabel: { fontSize: 13, color: colors.info },
  quoteAmount: { fontSize: 26, fontWeight: '700', color: colors.info, marginTop: 4 },
  quoteCur: { fontSize: 14, fontWeight: '400' },
  quoteNote: { fontSize: 13, color: colors.info, marginTop: 4 },
  quoteActions: { flexDirection: 'row', gap: 10, marginTop: 14 },
  providerCard: {
    marginLeft: 34,
    marginVertical: 6,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    padding: 12,
  },
  avatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: colors.infoBg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: { color: colors.info, fontWeight: '700', fontSize: 14 },
  providerName: { fontSize: 14, color: colors.text, flex: 1 },
  rateBox: {
    marginTop: 16,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.lg,
    padding: 18,
    alignItems: 'center',
  },
  rateTitle: { fontSize: 16, fontWeight: '600', color: colors.text, marginBottom: 10 },
  starsRow: { flexDirection: 'row', gap: 6 },
  star: { fontSize: 34, color: colors.border },
  starOn: { color: colors.star },
  thanks: { marginTop: 16, alignItems: 'center' },
  thanksText: { fontSize: 26, color: colors.star },
  thanksSub: { fontSize: 14, color: colors.textMuted, marginTop: 4 },
});
