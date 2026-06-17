import React, { useEffect, useRef, useState } from 'react';
import { SafeAreaView, StyleSheet, ActivityIndicator, View } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { colors } from './src/theme';
import { Booking, Service, TimePref } from './src/data';
import {
  insertBooking,
  updateBooking,
  upsertCustomer,
  fetchProviders,
  subscribeBooking,
} from './src/db';
import LoginScreen from './src/screens/LoginScreen';
import HomeScreen from './src/screens/HomeScreen';
import RequestScreen from './src/screens/RequestScreen';
import BookingScreen from './src/screens/BookingScreen';
import ProfileScreen from './src/screens/ProfileScreen';

type Screen = 'login' | 'home' | 'request' | 'booking' | 'profile';

const AUTH_KEY = 'isLoggedIn';
const PHONE_KEY = 'userPhone';
const ADDRESS_KEY = 'defaultAddress';
const PIN_KEY = 'defaultPin';

export default function App() {
  const [ready, setReady] = useState(false);
  const [screen, setScreen] = useState<Screen>('login');
  const [phone, setPhone] = useState('');
  const [defaultAddress, setDefaultAddress] = useState('');
  const [defaultPin, setDefaultPin] = useState('');
  const [pickedService, setPickedService] = useState<Service | null>(null);
  const [booking, setBooking] = useState<Booking | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const providerMap = useRef<Record<string, string>>({});
  const unsubBooking = useRef<(() => void) | null>(null);

  // Add the provider's name once we know which provider was assigned.
  const enrich = (b: Booking): Booking =>
    b.providerId ? { ...b, providerName: providerMap.current[b.providerId] } : b;

  useEffect(() => {
    return () => {
      if (unsubBooking.current) unsubBooking.current();
    };
  }, []);

  // On launch: restore session + load provider names for display.
  useEffect(() => {
    Promise.all([
      AsyncStorage.getItem(AUTH_KEY),
      AsyncStorage.getItem(PHONE_KEY),
      AsyncStorage.getItem(ADDRESS_KEY),
      AsyncStorage.getItem(PIN_KEY),
    ])
      .then(([auth, savedPhone, savedAddress, savedPin]) => {
        if (savedPhone) setPhone(savedPhone);
        if (savedAddress) setDefaultAddress(savedAddress);
        if (savedPin) setDefaultPin(savedPin);
        if (auth === '1') setScreen('home');
      })
      .finally(() => setReady(true));

    fetchProviders()
      .then((ps) => {
        providerMap.current = Object.fromEntries(ps.map((p) => [p.id, p.name]));
      })
      .catch(() => {});
  }, []);

  const handleLogin = (enteredPhone: string) => {
    setPhone(enteredPhone);
    AsyncStorage.setItem(AUTH_KEY, '1').catch(() => {});
    AsyncStorage.setItem(PHONE_KEY, enteredPhone).catch(() => {});
    upsertCustomer(enteredPhone);
    setScreen('home');
  };

  const saveDefaults = (addr: string, pin: string) => {
    setDefaultAddress(addr);
    setDefaultPin(pin);
    AsyncStorage.setItem(ADDRESS_KEY, addr).catch(() => {});
    AsyncStorage.setItem(PIN_KEY, pin).catch(() => {});
  };

  const handleSaveProfile = (newPhone: string, newAddress: string, newPin: string) => {
    setPhone(newPhone);
    AsyncStorage.setItem(PHONE_KEY, newPhone).catch(() => {});
    saveDefaults(newAddress, newPin);
    upsertCustomer(newPhone, { default_address: newAddress, default_pin: newPin });
    setScreen('home');
  };

  if (!ready) {
    return (
      <View style={styles.loading}>
        <ActivityIndicator color={colors.textMuted} />
      </View>
    );
  }

  const handleSubmit = async (data: {
    description: string;
    hasPhoto: boolean;
    landmark: string;
    pin?: string;
    timePref: TimePref;
    dayLabel?: string;
    timeWindow?: string;
    saveAsDefault?: boolean;
  }) => {
    if (!pickedService || submitting) return;
    if (data.saveAsDefault && (data.landmark.trim() || data.pin)) {
      saveDefaults(data.landmark.trim(), data.pin || '');
      upsertCustomer(phone, { default_address: data.landmark.trim(), default_pin: data.pin || '' });
    }

    setSubmitting(true);
    try {
      const created = await insertBooking({
        phone,
        service: pickedService,
        description: data.description,
        landmark: data.landmark,
        pin: data.pin,
        timePref: data.timePref,
        dayLabel: data.dayLabel,
        timeWindow: data.timeWindow,
      });
      setBooking(created);
      setScreen('booking');

      // Listen for the dispatcher's quote / assignment in real time.
      if (unsubBooking.current) unsubBooking.current();
      unsubBooking.current = subscribeBooking(created.id, (updated) => setBooking(enrich(updated)));
    } catch (e) {
      console.warn('insertBooking failed', e);
    } finally {
      setSubmitting(false);
    }
  };

  const handleRate = (stars: number) => {
    if (!booking) return;
    setBooking({ ...booking, rating: stars });
    updateBooking(booking.id, { rating: stars }).catch(() => {});
  };

  return (
    <SafeAreaView style={styles.root}>
      <StatusBar style="dark" />
      {screen === 'login' && <LoginScreen onDone={handleLogin} />}

      {screen === 'home' && (
        <HomeScreen
          activeBooking={booking}
          onOpenBooking={() => setScreen('booking')}
          onOpenProfile={() => setScreen('profile')}
          onPick={(s) => {
            setPickedService(s);
            setScreen('request');
          }}
        />
      )}

      {screen === 'profile' && (
        <ProfileScreen
          phone={phone}
          defaultAddress={defaultAddress}
          defaultPin={defaultPin}
          onBack={() => setScreen('home')}
          onSave={handleSaveProfile}
        />
      )}

      {screen === 'request' && pickedService && (
        <RequestScreen
          service={pickedService}
          defaultAddress={defaultAddress}
          defaultPin={defaultPin}
          submitting={submitting}
          onBack={() => setScreen('home')}
          onSubmit={handleSubmit}
        />
      )}

      {screen === 'booking' && booking && (
        <BookingScreen
          booking={booking}
          onBack={() => setScreen('home')}
          onRate={handleRate}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.bg },
  loading: { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.bg },
});
