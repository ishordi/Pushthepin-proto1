/*
  Push The Pin — seed data.
  All author labels are anonymous. No real names anywhere.
  Coordinates are real Bandra West streets.
  Dates are relative to 2026-06-27 (today when the prototype was built).
*/

import type { CivicPin, NonCivicPin, Collage, Building, BuildingPost, GovMockData } from '../types/pin';

const CLUSTER = 'h-west';

/* ── Helper ── */
function daysAgo(n: number): string {
  const d = new Date('2026-06-27T10:00:00.000Z');
  d.setDate(d.getDate() - n);
  return d.toISOString();
}
function hoursAgo(n: number): string {
  const d = new Date('2026-06-27T10:00:00.000Z');
  d.setHours(d.getHours() - n);
  return d.toISOString();
}
function daysFromNow(n: number): string {
  const d = new Date('2026-06-27T10:00:00.000Z');
  d.setDate(d.getDate() + n);
  return d.toISOString();
}
function hoursFromNow(n: number): string {
  const d = new Date('2026-06-27T10:00:00.000Z');
  d.setHours(d.getHours() + n);
  return d.toISOString();
}

/* ── Collage: three civic pins at the same Waroda Road geocode ── */
const WARODA_GEOCODE = { lat: 19.0548, lng: 72.8265 };
const WARODA_GROUP = 'waroda-road-group';

export const SEED_CIVIC_PINS: CivicPin[] = [
  /* Waroda Road trio — these three form the seeded collage */
  {
    id: 'civic-001',
    type: 'civic',
    category: 'pothole',
    title: 'Open drain cover near St Andrew lane',
    body: 'The drain cover has been missing for a few days. Someone has put a stone on it but it shifts. Spot near the lane entrance.',
    geocode: WARODA_GEOCODE,
    createdAt: daysAgo(9),
    authorAnonymousLabel: 'A neighbour on Waroda Road',
    clusterId: CLUSTER,
    status: 'routed',
    statusHistory: [
      { status: 'submitted', at: daysAgo(9) },
      { status: 'in_review', at: daysAgo(8) },
      { status: 'routed', at: daysAgo(7), note: 'Sent to BMC H-West ward office' },
    ],
    groupId: WARODA_GROUP,
    confirmations: 0,
    mockComplaintRef: 'BMC-HW-2026-04471',
  },
  {
    id: 'civic-002',
    type: 'civic',
    category: 'garbage',
    title: 'Garbage not cleared, Waroda Road corner',
    body: 'The corner bin has not been cleared in three days. It is overflowing onto the footpath.',
    geocode: WARODA_GEOCODE,
    createdAt: daysAgo(6),
    authorAnonymousLabel: 'Resident, H-West',
    clusterId: CLUSTER,
    status: 'routed',
    statusHistory: [
      { status: 'submitted', at: daysAgo(6) },
      { status: 'in_review', at: daysAgo(5) },
      { status: 'routed', at: daysAgo(4), note: 'Forwarded to BMC solid waste management' },
    ],
    groupId: WARODA_GROUP,
    confirmations: 0,
    mockComplaintRef: 'BMC-HW-2026-04512',
  },
  {
    id: 'civic-003',
    type: 'civic',
    category: 'garbage',
    title: 'Pile building up again, Waroda Road',
    body: 'Same spot, pile building up again. Adding this to the existing group.',
    geocode: WARODA_GEOCODE,
    createdAt: daysAgo(1),
    authorAnonymousLabel: 'A neighbour near Ranwar village',
    clusterId: CLUSTER,
    status: 'submitted',
    statusHistory: [
      { status: 'submitted', at: daysAgo(1) },
    ],
    groupId: WARODA_GROUP,
    confirmations: 0,
  },

  /* Single-report civic pins — the common path */
  {
    id: 'civic-004',
    type: 'civic',
    category: 'water',
    title: 'Water logging at Hill Road junction',
    body: 'After yesterday\'s rain the junction was knee-deep for a couple of hours. The storm drain appears blocked.',
    photo: 'mock:before-hill-road',
    geocode: { lat: 19.0531, lng: 72.8289 },
    createdAt: daysAgo(14),
    authorAnonymousLabel: 'Resident, Hill Road area',
    clusterId: CLUSTER,
    status: 'closed',
    statusHistory: [
      { status: 'submitted', at: daysAgo(14) },
      { status: 'in_review', at: daysAgo(13) },
      { status: 'routed', at: daysAgo(12), note: 'Sent to BMC storm water drain department' },
      { status: 'waiting', at: daysAgo(12) },
      { status: 'resolved', at: daysAgo(3), note: 'Resolution photo added' },
      { status: 'closed', at: daysAgo(2), note: '4 neighbours confirmed fixed' },
    ],
    resolutionPhoto: 'mock:after-hill-road',
    confirmations: 4,
    mockComplaintRef: 'BMC-HW-2026-04189',
  },
  {
    id: 'civic-005',
    type: 'civic',
    category: 'streetlight',
    title: 'Streetlight out near Pali Naka',
    body: 'The lamp at the Pali Naka end of the lane has been dark for two nights. Spot near the auto stand.',
    geocode: { lat: 19.0611, lng: 72.8291 },
    createdAt: daysAgo(2),
    authorAnonymousLabel: 'A neighbour near Pali Naka',
    clusterId: CLUSTER,
    status: 'submitted',
    statusHistory: [
      { status: 'submitted', at: daysAgo(2) },
    ],
    confirmations: 0,
  },
  {
    id: 'civic-006',
    type: 'civic',
    category: 'footpath',
    title: 'Broken footpath tile, Turner Road',
    body: 'A large tile has cracked and one corner is lifted. It is a tripping hazard, especially in the evening when the light is poor.',
    geocode: { lat: 19.0580, lng: 72.8330 },
    createdAt: daysAgo(8),
    authorAnonymousLabel: 'Resident, Turner Road',
    clusterId: CLUSTER,
    status: 'waiting',
    statusHistory: [
      { status: 'submitted', at: daysAgo(8) },
      { status: 'in_review', at: daysAgo(7) },
      { status: 'routed', at: daysAgo(6), note: 'Sent to BMC roads department' },
      { status: 'waiting', at: daysAgo(6) },
    ],
    confirmations: 0,
    mockComplaintRef: 'BMC-HW-2026-04398',
  },
];

/* ── Non-civic seed pins ── */
export const SEED_NON_CIVIC_PINS: NonCivicPin[] = [
  {
    id: 'event-001',
    type: 'event',
    title: 'Sunday morning cleanup walk, Carter Road',
    body: 'Meet at the Carter Road promenade near the amphitheatre at 7 am. Bring a bag if you can. An hour, no more.',
    geocode: { lat: 19.0662, lng: 72.8201 },
    createdAt: daysAgo(3),
    expiresAt: daysFromNow(3),
    authorAnonymousLabel: 'A neighbour on Carter Road',
    clusterId: CLUSTER,
    interestedCount: 11,
  },
  {
    id: 'event-002',
    type: 'event',
    title: 'Open mic tonight at a Ranwar cafe',
    body: 'Acoustic sets from 8 pm. Walk-ins welcome. Small place, come early if you want a seat.',
    geocode: { lat: 19.0556, lng: 72.8271 },
    createdAt: hoursAgo(4),
    expiresAt: hoursFromNow(8),
    authorAnonymousLabel: 'Resident, Ranwar village',
    clusterId: CLUSTER,
    interestedCount: 23,
  },
  {
    id: 'event-003',
    type: 'event',
    title: 'Society Ganpati planning meet',
    body: 'Short planning meet for this year\'s Ganpati. All residents welcome. Ground floor common area.',
    geocode: { lat: 19.0590, lng: 72.8300 },
    createdAt: daysAgo(1),
    expiresAt: daysFromNow(5),
    authorAnonymousLabel: 'Resident, H-West',
    clusterId: CLUSTER,
    interestedCount: 7,
  },
  {
    id: 'help-001',
    type: 'help',
    title: 'Anyone have a ladder I can borrow for an hour',
    body: 'Need to fix a ceiling light. Happy to come collect and return same day.',
    geocode: { lat: 19.0561, lng: 72.8331 },
    createdAt: hoursAgo(6),
    expiresAt: daysFromNow(1),
    authorAnonymousLabel: 'A neighbour near Linking Road',
    clusterId: CLUSTER,
  },
  {
    id: 'help-002',
    type: 'help',
    title: 'Lost grey tabby near Veronica Road',
    body: 'Our cat has been missing since yesterday evening. Grey tabby, no collar, very friendly. Please message if you see her.',
    geocode: { lat: 19.0540, lng: 72.8280 },
    createdAt: daysAgo(1),
    expiresAt: daysFromNow(4),
    authorAnonymousLabel: 'Resident, Veronica Road area',
    clusterId: CLUSTER,
  },
  {
    id: 'sell-001',
    type: 'sell',
    title: 'Barely used study table',
    body: 'Solid wood study table, light brown finish. Used for about six months. Dismantled and ready for pickup.',
    geocode: { lat: 19.0596, lng: 72.8295 },
    createdAt: daysAgo(2),
    expiresAt: daysFromNow(7),
    authorAnonymousLabel: 'Resident, H-West',
    clusterId: CLUSTER,
  },
  {
    id: 'buy-001',
    type: 'buy',
    title: 'Looking for a second-hand cycle',
    body: 'Any condition considered. Adult size. Will come to collect. Budget around 2k.',
    geocode: { lat: 19.0650, lng: 72.8270 },
    createdAt: daysAgo(1),
    expiresAt: daysFromNow(7),
    authorAnonymousLabel: 'A neighbour near Bandra Reclamation',
    clusterId: CLUSTER,
  },
  {
    id: 'service-001',
    type: 'service',
    title: 'Maths and science home tutor available',
    body: 'Classes 8 to 10. Small batches only, three students maximum. Available weekday evenings and Saturday mornings.',
    geocode: { lat: 19.0441, lng: 72.8191 },
    createdAt: daysAgo(5),
    expiresAt: daysFromNow(60),
    authorAnonymousLabel: 'Resident, Bandra West',
    clusterId: CLUSTER,
  },
  /* A business post — appears in the feed, clearly marked as a business,
     never masquerading as a resident. Identity is shown (businesses aren't
     anonymous); only residents are. */
  {
    id: 'biz-001',
    type: 'sell',
    title: '20% off whole cakes this weekend',
    body: 'Weekend special on whole cakes — order by Saturday noon for same-day pickup. All flavours available.',
    geocode: { lat: 19.0583, lng: 72.8307 },
    createdAt: daysAgo(1),
    expiresAt: daysFromNow(2),
    authorAnonymousLabel: 'The Bandra Bakehouse',
    clusterId: CLUSTER,
    isBusiness: true,
    businessName: 'The Bandra Bakehouse',
    postType: 'offer',
    stats: { views: 142, taps: 31 },
  },
];

/* ── Collage definitions ── */
export const SEED_COLLAGES: Collage[] = [
  {
    groupId: WARODA_GROUP,
    category: 'garbage',
    geocode: WARODA_GEOCODE,
    pinIds: ['civic-001', 'civic-002', 'civic-003'],
    firstReportAt: daysAgo(9),
    latestReportAt: daysAgo(1),
  },
];

/* ── Example building ── */
export const SEED_BUILDINGS: Building[] = [
  {
    id: 'building-001',
    name: 'Pali Hill Apartments',
    address: 'Pali Hill, Bandra West',
    clusterId: CLUSTER,
    geocode: { lat: 19.0611, lng: 72.8262 },
    registeredAt: daysAgo(30),
  },
];

export const SEED_BUILDING_POSTS: BuildingPost[] = [
  {
    id: 'bp-001',
    buildingId: 'building-001',
    title: 'Lift out of service — expected back Monday',
    body: 'The service company is coming Monday morning. Please use the staircase until then. Sorry for the inconvenience.',
    createdAt: daysAgo(1),
    authorLabel: 'Flat 4B',
  },
  {
    id: 'bp-002',
    buildingId: 'building-001',
    title: 'Water tanker timing this week',
    body: 'BMC supply is thin this week. Building tanker is booked for Tuesday and Friday, 7 am. Fill up overnight storage if you can.',
    createdAt: daysAgo(2),
    authorLabel: 'Flat 1A',
  },
  {
    id: 'bp-003',
    buildingId: 'building-001',
    title: 'Ganpati planning — quick note',
    body: 'We will do a brief meeting this Sunday at 6 pm in the ground floor area. Just 30 minutes to sort the basics. All welcome.',
    createdAt: daysAgo(3),
    authorLabel: 'Flat 3C',
  },
];

/* Business posts now live in the feed as NonCivicPins (isBusiness), see
   SEED_NON_CIVIC_PINS above. The standalone BusinessPost seed was removed. */

/* ── Government vision mock data ── */
export const SEED_GOV_DATA: GovMockData = {
  totalFiled: 218,
  genuinelyFixed: 46,
  neighbourConfirmedRate: 0.21,
  headlineResolvedRate: 0.78,
  byCategory: [
    { category: 'pothole', count: 61, avgDaysOpen: 34 },
    { category: 'garbage', count: 55, avgDaysOpen: 8 },
    { category: 'water', count: 42, avgDaysOpen: 21 },
    { category: 'streetlight', count: 31, avgDaysOpen: 18 },
    { category: 'footpath', count: 29, avgDaysOpen: 47 },
  ],
  byArea: [
    { area: 'Waroda Road / Ranwar', count: 52 },
    { area: 'Hill Road', count: 39 },
    { area: 'Pali Naka / Pali Hill', count: 34 },
    { area: 'Carter Road / Bandstand', count: 48 },
    { area: 'Linking Road', count: 45 },
  ],
  timeToResolutionDays: 29,
  lastUpdated: daysAgo(1),
};
