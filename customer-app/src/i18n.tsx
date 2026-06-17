import React, { createContext, useContext } from 'react';
import { Lang } from './data';

export const strings = {
  en: {
    brand: 'Home services',
    login_sub: 'Enter your phone number to get started',
    phone: 'Phone',
    login_hint: "We'll use this number to reach you about your bookings.",
    continue: 'Continue',

    home_prompt: 'What do you need?',
    my_booking: 'My booking',
    need_help: 'Need help?',
    whatsapp: 'Message us on WhatsApp',

    // status (home card + booking)
    st_requested: 'Request sent — we’ll confirm shortly',
    st_accepted: 'Accepted — your pro is being arranged',
    st_on_way: 'Your pro is on the way',
    st_done: 'Done — view your receipt',
    st_cancelled: 'Cancelled',

    request_title: 'request',
    describe: 'Describe the problem',
    describe_ph: 'e.g. Not cooling, makes a noise…',
    add_photo: '＋ Add photo',
    photo_added: '✓ Photo added',
    location: 'Location',
    reset: 'Reset',
    map_set_tap: '📍 Tap to set location on map',
    map_pinned: '📍 Location pinned',
    map_tap_open: 'Tap to open map',
    landmark_ph: 'Landmark / directions (e.g. near Sassine, blue building, 4th floor)',
    save_default: 'Save as my default address',
    update_default: 'Update my default address',
    when: 'When',
    asap: 'ASAP',
    today: 'Today',
    pick_day: 'Pick day',
    which_day: 'Which day',
    time_window: 'Time window',
    submit: 'Submit request',
    submitting: 'Submitting…',

    // map modal
    map_title: 'Set your location',
    map_hint: 'Tap the map to drop a pin, then drag to adjust',
    map_no_pin: 'No pin yet — tap the map',
    use_location: 'Use this location',
    cancel: 'Cancel',

    // booking screen
    booking: 'Booking',
    step_requested: 'Request sent',
    step_accepted: 'Accepted',
    step_on_way: 'On the way',
    step_done: 'Done',
    your_pro: 'your',
    cancelled_msg: 'This booking was cancelled.',
    receipt: '🧾 Receipt',
    r_service: 'Service',
    r_provider: 'Provider',
    r_date: 'Date',
    r_payment: 'Payment',
    r_cash: 'Cash',
    r_total: 'Total',
    rate_title: 'Rate the service',
    submit_rating: 'Submit rating',
    thanks_rating: 'Thanks for your rating!',

    // profile
    profile: 'Profile',
    phone_number: 'Phone number',
    profile_phone_hint: "This is the number we'll call you on about your bookings.",
    default_address: 'Default address',
    default_address_hint: "We'll fill this in automatically when you book, so you don't set it each time.",
    save: 'Save',
    language: 'Language',
  },
  ar: {
    brand: 'خدمات منزلية',
    login_sub: 'أدخل رقم هاتفك لتبدأ',
    phone: 'الهاتف',
    login_hint: 'منستعمل هالرقم لنتواصل معك بخصوص طلباتك.',
    continue: 'متابعة',

    home_prompt: 'شو بتحتاج؟',
    my_booking: 'طلبي',
    need_help: 'بدك مساعدة؟',
    whatsapp: 'راسلنا على واتساب',

    st_requested: 'انبعت الطلب — رح نأكد قريباً',
    st_accepted: 'تمت الموافقة — عم نجهّزلك صنايعي',
    st_on_way: 'الصنايعي بطريقه إلك',
    st_done: 'خلصت — شوف الإيصال',
    st_cancelled: 'ملغى',

    request_title: 'طلب',
    describe: 'وصّف المشكلة',
    describe_ph: 'مثلاً: مش مبرّد، عم يعمل صوت…',
    add_photo: '＋ أضف صورة',
    photo_added: '✓ تمت إضافة الصورة',
    location: 'الموقع',
    reset: 'إعادة تعيين',
    map_set_tap: '📍 اضغط لتحديد موقعك على الخريطة',
    map_pinned: '📍 تم تحديد الموقع',
    map_tap_open: 'اضغط لفتح الخريطة',
    landmark_ph: 'معلم / إرشادات (مثلاً قرب ساسين، بناية زرقا، طابق ٤)',
    save_default: 'احفظه كعنواني الافتراضي',
    update_default: 'حدّث عنواني الافتراضي',
    when: 'متى',
    asap: 'بأسرع وقت',
    today: 'اليوم',
    pick_day: 'اختر يوم',
    which_day: 'أي يوم',
    time_window: 'الوقت',
    submit: 'أرسل الطلب',
    submitting: 'جاري الإرسال…',

    map_title: 'حدّد موقعك',
    map_hint: 'اضغط على الخريطة لوضع دبوس، ثم اسحبه للتعديل',
    map_no_pin: 'ما في دبوس بعد — اضغط على الخريطة',
    use_location: 'استخدم هذا الموقع',
    cancel: 'إلغاء',

    booking: 'طلب',
    step_requested: 'انبعت الطلب',
    step_accepted: 'تمت الموافقة',
    step_on_way: 'بطريقه إلك',
    step_done: 'خلصت',
    your_pro: 'لـ',
    cancelled_msg: 'تم إلغاء هذا الطلب.',
    receipt: '🧾 الإيصال',
    r_service: 'الخدمة',
    r_provider: 'الصنايعي',
    r_date: 'التاريخ',
    r_payment: 'الدفع',
    r_cash: 'كاش',
    r_total: 'المجموع',
    rate_title: 'قيّم الخدمة',
    submit_rating: 'أرسل التقييم',
    thanks_rating: 'شكراً لتقييمك!',

    profile: 'الملف الشخصي',
    phone_number: 'رقم الهاتف',
    profile_phone_hint: 'هذا الرقم يلي رح نتصل فيك عليه بخصوص طلباتك.',
    default_address: 'العنوان الافتراضي',
    default_address_hint: 'منعبّيه تلقائياً وقت ما تحجز، حتى ما تكتبه كل مرة.',
    save: 'حفظ',
    language: 'اللغة',
  },
} as const;

export type StringKey = keyof typeof strings.en;

type Ctx = { lang: Lang; setLang: (l: Lang) => void; t: (k: StringKey) => string; isRTL: boolean };
const LangContext = createContext<Ctx>({ lang: 'en', setLang: () => {}, t: (k) => k, isRTL: false });

export function LangProvider({ lang, setLang, children }: { lang: Lang; setLang: (l: Lang) => void; children: React.ReactNode }) {
  const t = (k: StringKey) => (strings[lang] as Record<string, string>)[k] ?? k;
  return <LangContext.Provider value={{ lang, setLang, t, isRTL: lang === 'ar' }}>{children}</LangContext.Provider>;
}

export const useLang = () => useContext(LangContext);
