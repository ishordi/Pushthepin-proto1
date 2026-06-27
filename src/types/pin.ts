/* Push The Pin — core domain types. All from PRS section 5. */

export type PinType = 'civic' | 'event' | 'help' | 'sell' | 'buy' | 'service';

export type CivicStatus =
  | 'submitted'
  | 'in_review'
  | 'routed'
  | 'waiting'
  | 'resolved'
  | 'closed';

export type CivicCategory =
  | 'pothole'
  | 'garbage'
  | 'water'
  | 'streetlight'
  | 'footpath'
  | 'other';

export interface Geocode {
  lat: number;
  lng: number;
}

export interface StatusHistoryEntry {
  status: CivicStatus;
  at: string; // ISO
  note?: string;
}

/* Civic pin — the only type with a full lifecycle */
export interface CivicPin {
  type: 'civic';
  id: string;
  category: CivicCategory;
  title: string;
  body: string;
  photo?: string;
  geocode: Geocode;
  createdAt: string; // ISO
  authorAnonymousLabel: string;
  clusterId: string;
  status: CivicStatus;
  statusHistory: StatusHistoryEntry[];
  groupId?: string; // set when part of a Collage
  resolutionPhoto?: string;
  confirmations: number;
  mockComplaintRef?: string; // mock BMC reference id, set when routed
}

/* Non-civic pins — post-and-appear, expiry only, no lifecycle */
export interface NonCivicPin {
  type: Exclude<PinType, 'civic'>;
  id: string;
  title: string;
  body: string;
  photo?: string;
  geocode: Geocode;
  createdAt: string; // ISO
  expiresAt: string; // ISO
  authorAnonymousLabel: string;
  clusterId: string;
  isBusiness?: true; // set only on business-origin posts
  interestedCount?: number; // events only
  // Business-origin posts only (isBusiness): identity is shown, never anonymous.
  businessName?: string;
  postType?: BusinessPostType;
  stats?: { views: number; taps: number }; // mocked reach
}

export type BusinessPostType = 'offer' | 'event' | 'notice';

export type Pin = CivicPin | NonCivicPin;

/* Type guards */
export function isCivic(pin: Pin): pin is CivicPin {
  return pin.type === 'civic';
}

/* Collage — geocode grouping of same-type civic pins */
export interface Collage {
  groupId: string;
  category: CivicCategory;
  geocode: Geocode;
  pinIds: string[];
  firstReportAt: string; // ISO
  latestReportAt: string; // ISO
}

/* Building and its private feed */
export interface Building {
  id: string;
  name: string;
  address: string;
  clusterId: string;
  geocode: Geocode;
  registeredAt: string; // ISO
}

export interface BuildingPost {
  id: string;
  buildingId: string;
  title: string;
  body: string;
  createdAt: string; // ISO
  authorLabel: string; // flat/floor label only, never a name
}

/* Business post — appears in Pulse, always marked isBusiness */
export interface BusinessPost {
  id: string;
  businessName: string;
  postType: 'offer' | 'event' | 'notice';
  title: string;
  body: string;
  createdAt: string; // ISO
  expiresAt: string; // ISO
  geocode: Geocode;
  clusterId: string;
  isBusiness: true;
  stats: { views: number; taps: number };
}

/* Government vision dashboard — mock data only */
export interface GovMockData {
  totalFiled: number;
  genuinelyFixed: number;
  neighbourConfirmedRate: number; // 0–1, the honest number
  headlineResolvedRate: number; // 0–1, the inflated "resolved" figure dashboards show
  byCategory: Array<{ category: CivicCategory; count: number; avgDaysOpen: number }>;
  byArea: Array<{ area: string; count: number }>;
  timeToResolutionDays: number; // median
  lastUpdated: string; // ISO, always mock
}
