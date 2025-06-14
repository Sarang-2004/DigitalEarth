export interface FireData {
  id: number;
  location: string;
  city: string | null;
  state: string | null;
  country: string | null;
  full_address: string;
  coordinates: {
    lat: number;
    lng: number;
  };
  intensity: 'High' | 'Medium' | 'Low';
  size: string;
  temperature: string;
  windSpeed: string;
  status: 'Active' | 'Contained' | 'Extinguished';
  lastUpdate: string;
  cause: string;
  threat: string;
} 