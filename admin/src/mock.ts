import type { Booking, Provider, ServiceDef } from './types';

export const TIME_SLOTS = ['8–11 AM', '11 AM–2 PM', '2–5 PM', '5–8 PM'];

// Service catalog (mirrors the customer app).
export const services: ServiceDef[] = [
  { id: 'plumber', name: 'Plumber', icon: '🔧' },
  { id: 'electrician', name: 'Electrician', icon: '⚡' },
  { id: 'ac', name: 'AC', icon: '❄️' },
  { id: 'generator', name: 'Generator / Solar', icon: '🔋' },
  { id: 'appliance', name: 'Appliance Repair', icon: '🧺' },
  { id: 'painter', name: 'Painter', icon: '🎨' },
  { id: 'carpenter', name: 'Carpenter', icon: '🪚' },
  { id: 'cleaning', name: 'Cleaning', icon: '🧹' },
  { id: 'pest', name: 'Pest Control', icon: '🐜' },
  { id: 'locksmith', name: 'Locksmith', icon: '🔑' },
  { id: 'satellite', name: 'Satellite / TV', icon: '📡' },
  { id: 'internet', name: 'Internet & Network', icon: '📶' },
  { id: 'mechanic', name: 'Car Mechanic', icon: '🚗' },
  { id: 'carwash', name: 'Car Wash', icon: '🚿' },
  { id: 'handyman', name: 'Handyman', icon: '🛠️' },
];

export const serviceName = (id: string) => services.find((s) => s.id === id)?.name || id;
export const serviceIcon = (id: string) => services.find((s) => s.id === id)?.icon || '•';

// Days: 0=Sun, 1=Mon ... 6=Sat
const ALL = TIME_SLOTS;
const MORNINGS = [TIME_SLOTS[0], TIME_SLOTS[1]];
const AFTERNOONS = [TIME_SLOTS[2], TIME_SLOTS[3]];

export const providers: Provider[] = [
  { id: 'p1', name: 'Ahmad H.', phone: '+961 70 100 201', skills: ['ac', 'electrician'], zone: 'Achrafieh', load: 0, active: true, workdays: [1, 2, 3, 4, 5, 6], slots: ALL },
  { id: 'p2', name: 'Sami K.', phone: '+961 71 100 202', skills: ['ac', 'plumber'], zone: 'Metn', load: 1, active: true, workdays: [1, 2, 3, 4, 5], slots: MORNINGS },
  { id: 'p3', name: 'Rabih M.', phone: '+961 76 100 203', skills: ['electrician', 'generator'], zone: 'Jdeideh', load: 0, active: true, workdays: [0, 1, 2, 3, 4, 5, 6], slots: ALL },
  { id: 'p4', name: 'Georges A.', phone: '+961 70 100 204', skills: ['painter', 'carpenter'], zone: 'Baabda', load: 2, active: true, workdays: [1, 3, 5, 6], slots: AFTERNOONS },
  { id: 'p5', name: 'Walid T.', phone: '+961 71 100 205', skills: ['plumber', 'handyman'], zone: 'Hamra', load: 0, active: true, workdays: [1, 2, 3, 4, 5, 6], slots: ALL },
  { id: 'p6', name: 'Hassan B.', phone: '+961 76 100 206', skills: ['ac', 'appliance'], zone: 'Metn', load: 0, active: true, workdays: [2, 3, 4, 5, 6], slots: AFTERNOONS },
  { id: 'p7', name: 'Joseph K.', phone: '+961 70 100 207', skills: ['cleaning'], zone: 'Achrafieh', load: 0, active: false, workdays: [1, 2, 3, 4, 5], slots: MORNINGS },
];

export const initialBookings: Booking[] = [
  {
    id: 'b1',
    ref: 'HS-1042',
    serviceId: 'ac',
    serviceName: 'AC',
    icon: '❄️',
    customerName: 'Rana K.',
    customerPhone: '+961 70 123 456',
    description: 'Not cooling, makes a noise',
    area: 'Achrafieh',
    landmark: 'Near Sassine, blue building, 4th floor',
    pin: '33.88712, 35.51324',
    timePref: 'ASAP',
    createdAt: '2 min ago',
    status: 'requested',
  },
  {
    id: 'b2',
    ref: 'HS-1041',
    serviceId: 'plumber',
    serviceName: 'Plumber',
    icon: '🔧',
    customerName: 'Karim D.',
    customerPhone: '+961 71 998 220',
    description: 'Kitchen sink leaking under the cabinet',
    area: 'Hamra',
    landmark: 'Bliss street, above the pharmacy',
    pin: '33.89690, 35.48010',
    timePref: 'Today · 2–5 PM',
    createdAt: '18 min ago',
    status: 'quoted',
    quoteAmount: 50,
    quoteCurrency: 'USD',
    quoteNote: 'Leak repair + parts',
  },
  {
    id: 'b3',
    ref: 'HS-1040',
    serviceId: 'electrician',
    serviceName: 'Electrician',
    icon: '⚡',
    customerName: 'Nour S.',
    customerPhone: '+961 76 445 112',
    description: 'Half the apartment has no power',
    area: 'Jdeideh',
    landmark: 'Main road, next to the bakery',
    pin: '33.89901, 35.56720',
    timePref: 'Today · 11 AM–2 PM',
    createdAt: '40 min ago',
    status: 'accepted',
    quoteAmount: 28,
    quoteCurrency: 'USD',
    quoteNote: 'Breaker + wiring check',
  },
  {
    id: 'b4',
    ref: 'HS-1039',
    serviceId: 'painter',
    serviceName: 'Painter',
    icon: '🎨',
    customerName: 'Lea B.',
    customerPhone: '+961 70 882 010',
    description: 'Repaint one bedroom, walls + ceiling',
    area: 'Baabda',
    landmark: 'Old Saida road, white gate',
    pin: '33.83390, 35.54410',
    timePref: 'Sat',
    createdAt: '1 hr ago',
    status: 'assigned',
    quoteAmount: 120,
    quoteCurrency: 'USD',
    providerId: 'p4',
  },
];

// Completed jobs for the History tab.
export const historyBookings: Booking[] = [
  {
    id: 'h1', ref: 'HS-1038', serviceId: 'ac', serviceName: 'AC service', icon: '❄️',
    customerName: 'Maya R.', customerPhone: '+961 70 111 222', description: 'Service + gas',
    area: 'Achrafieh', landmark: '', pin: '', timePref: '', createdAt: 'Yesterday',
    status: 'paid', quoteAmount: 35, quoteCurrency: 'USD', providerId: 'p1', rating: 5,
  },
  {
    id: 'h2', ref: 'HS-1035', serviceId: 'plumber', serviceName: 'Plumber', icon: '🔧',
    customerName: 'Tarek N.', customerPhone: '+961 71 333 444', description: 'Blocked drain',
    area: 'Hamra', landmark: '', pin: '', timePref: '', createdAt: '2 days ago',
    status: 'paid', quoteAmount: 50, quoteCurrency: 'USD', providerId: 'p5', rating: 4,
  },
  {
    id: 'h3', ref: 'HS-1031', serviceId: 'electrician', serviceName: 'Electrician', icon: '⚡',
    customerName: 'Hadi F.', customerPhone: '+961 76 555 666', description: 'Outlet install',
    area: 'Jdeideh', landmark: '', pin: '', timePref: '', createdAt: '3 days ago',
    status: 'paid', quoteAmount: 28, quoteCurrency: 'USD', providerId: 'p3', rating: 5,
  },
  {
    id: 'h4', ref: 'HS-1027', serviceId: 'painter', serviceName: 'Painter', icon: '🎨',
    customerName: 'Carla M.', customerPhone: '+961 70 777 888', description: 'Living room',
    area: 'Baabda', landmark: '', pin: '', timePref: '', createdAt: '4 days ago',
    status: 'paid', quoteAmount: 120, quoteCurrency: 'USD', providerId: 'p4', rating: 3,
  },
  {
    id: 'h5', ref: 'HS-1024', serviceId: 'ac', serviceName: 'AC repair', icon: '❄️',
    customerName: 'Omar Z.', customerPhone: '+961 71 999 000', description: 'Not turning on',
    area: 'Metn', landmark: '', pin: '', timePref: '', createdAt: '5 days ago',
    status: 'paid', quoteAmount: 45, quoteCurrency: 'USD', providerId: 'p2',
  },
];
