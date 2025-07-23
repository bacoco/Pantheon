export interface TGVStation {
  id: string;
  name: string;
  city: string;
  code: string;
}

export interface TGVSearchParams {
  departureStation: string;
  arrivalStation: string;
  departureDate: string;
  returnDate?: string;
  passengers: {
    adults: number;
    children?: number;
    seniors?: number;
  };
  travelClass?: 'first' | 'second';
}

export interface TGVTrain {
  trainNumber: string;
  departureTime: string;
  arrivalTime: string;
  duration: string;
  price: {
    amount: number;
    currency: string;
  };
  availability: 'available' | 'limited' | 'sold_out';
  travelClass: 'first' | 'second';
  directTrain: boolean;
}

export interface TGVSearchResult {
  searchId: string;
  outbound: TGVTrain[];
  return?: TGVTrain[];
  searchParams: TGVSearchParams;
  searchDate: string;
}

// Popular TGV stations
export const TGV_STATIONS: TGVStation[] = [
  { id: '1', name: 'Paris Gare de Lyon', city: 'Paris', code: 'FRPLY' },
  { id: '2', name: 'Paris Gare du Nord', city: 'Paris', code: 'FRPNO' },
  { id: '3', name: 'Paris Gare Montparnasse', city: 'Paris', code: 'FRPMO' },
  { id: '4', name: 'Lyon Part-Dieu', city: 'Lyon', code: 'FRLPD' },
  { id: '5', name: 'Marseille Saint-Charles', city: 'Marseille', code: 'FRMSC' },
  { id: '6', name: 'Lille Europe', city: 'Lille', code: 'FRLLE' },
  { id: '7', name: 'Bordeaux Saint-Jean', city: 'Bordeaux', code: 'FRBOJ' },
  { id: '8', name: 'Nantes', city: 'Nantes', code: 'FRNTE' },
  { id: '9', name: 'Strasbourg', city: 'Strasbourg', code: 'FRXWG' },
  { id: '10', name: 'Nice Ville', city: 'Nice', code: 'FRNIC' },
];