import React, { useEffect, useRef, useState } from 'react';
import { SafeAreaView, StyleSheet, ActivityIndicator, View } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { colors } from './src/theme';
import { Booking, Service, TimePref, nextRef } from './src/data';
import LoginScreen from './src/screens/LoginScreen';
import HomeScreen from './src/screens/HomeScreen';
import RequestScreen from './src/screens/RequestScreen';
import BookingScreen from './src/screens/BookingScreen';
import ProfileScreen from './src/screens/ProfileScreen';

type Screen = 'login' | 'home' | 'request' | 'booking' | 'profile';

const DEMO_PROVIDER = 'Ahmad H.';
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
  const timers = useRef<ReturnType<typeof setTimeout>[]>([]);

  const after = (ms: number, fn: () => void) => {
    const t = setTimeout(fn, ms);
    timers.current.push(t);
  };

  useEffect(() => () => timers.current.forEach(clearTimeout), []);

  // On launch, keep the user logged in if they signed in before.
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
  }, []);

  const handleLogin = (enteredPhone: string) => {
    setPhone(enteredPhone);
    AsyncStorage.setItem(AUTH_KEY, '1').catch(() => {});
    AsyncStorage.setItem(PHONE_KEY, enteredPhone).catch(() => {});
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
    setScreen('home');
  };

  if (!ready) {
    return (
      <View style={styles.loading}>
        <ActivityIndicator color={colors.textMuted} />
      </View>
    );
  }

  const handleSubmit = (data: {
    description: string;
    hasPhoto: boolean;
    landmark: string;
    pin?: string;
    timePref: TimePref;
    dayLabel?: string;
    timeWindow?: string;
    saveAsDefault?: boolean;
  }) => {
    if (!pickedService) return;
    if (data.saveAsDefault && (data.landmark.trim() || data.pin)) {
      saveDefaults(data.landmark.trim(), data.pin || '');
    }
    const newBooking: Booking = {
      ref: nextRef(),
      service: pickedService,
      description: data.description,
      hasPhoto: data.hasPhoto,
      landmark: data.landmark,
      pin: data.pin,
      timePref: data.timePref,
      dayLabel: data.dayLabel,
      timeWindow: data.timeWindow,
      status: 'requested',
    };
    setBooking(newBooking);
    setScreen('booking');

    // Simulate the dispatcher sending a quote a few seconds later.
    after(2500, () =>
      setBooking((b) =>
        b
          ? {
              ...b,
              status: 'quoted',
              quoteAmount: 35,
              quoteCurrency: 'USD',
              quoteNote: `${pickedService.name} service + check`,
            }
          : b
      )
    );
  };

  const handleAccept = () => {
    setBooking((b) => (b ? { ...b, status: 'assigned', providerName: DEMO_PROVIDER } : b));
    after(2500, () => setBooking((b) => (b ? { ...b, status: 'on_way' } : b)));
    after(5000, () => setBooking((b) => (b ? { ...b, status: 'completed' } : b)));
  };

  const handleDecline = () => {
    setBooking(null);
    setScreen('home');
  };

  const handleRate = (stars: number) => {
    setBooking((b) => (b ? { ...b, status: 'rated', rating: stars } : b));
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
          onBack={() => setScreen('home')}
          onSubmit={handleSubmit}
        />
      )}

      {screen === 'booking' && booking && (
        <BookingScreen
          booking={booking}
          onBack={() => setScreen('home')}
          onAccept={handleAccept}
          onDecline={handleDecline}
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
