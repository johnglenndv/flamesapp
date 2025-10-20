
'use client';

import React, { createContext, useState, useContext, ReactNode } from 'react';
import { LatLngBounds } from 'leaflet';

const dagupanPosition: [number, number] = [16.0471, 120.3344];

type Suggestion = {
  place_id: number;
  lat: string;
  lon: string;
  display_name: string;
};

export interface Location {
  id: string;
  lat: number;
  lng: number;
  name: string;
  description?: string;
}

type AppContextType = {
  selectedLocation: Suggestion | null;
  setSelectedLocation: (location: Suggestion | null) => void;
  mapCenter: [number, number];
  setMapCenter: (center: [number, number]) => void;
  mapZoom: number;
  setMapZoom: (zoom: number) => void;
  clickedLocation: Location | null;
  setClickedLocation: (location: Location | null) => void;
  mapBounds: LatLngBounds | null;
  setMapBounds: (bounds: LatLngBounds | null) => void;
};

const AppContext = createContext<AppContextType | undefined>(undefined);

export function AppProvider({ children }: { children: ReactNode }) {
  const [selectedLocation, setSelectedLocation] = useState<Suggestion | null>(null);
  const [mapCenter, setMapCenter] = useState<[number, number]>(dagupanPosition);
  const [mapZoom, setMapZoom] = useState<number>(13);
  const [clickedLocation, setClickedLocation] = useState<Location | null>(null);
  const [mapBounds, setMapBounds] = useState<LatLngBounds | null>(null);

  return (
    <AppContext.Provider value={{ 
      selectedLocation, setSelectedLocation,
      mapCenter, setMapCenter,
      mapZoom, setMapZoom,
      clickedLocation, setClickedLocation,
      mapBounds, setMapBounds
    }}>
      {children}
    </AppContext.Provider>
  );
}

export function useAppContext() {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useAppContext must be used within a AppProvider');
  }
  return context;
}
