
'use client';

import { useState, useEffect } from 'react';
import { collection, query, onSnapshot, orderBy } from 'firebase/firestore';
import { db } from '../lib/firebase';
import type { Location } from '@/context/app-context';

export function useLocations() {
  const [locations, setLocations] = useState<Location[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const q = query(collection(db, 'locations'), orderBy('name'));
    const unsubscribe = onSnapshot(
      q,
      (querySnapshot) => {
        const locationsData: Location[] = [];
        querySnapshot.forEach((doc) => {
          const data = doc.data();
          locationsData.push({
            id: doc.id,
            lat: data.latitude,
            lng: data.longitude,
            name: data.name,
            description: data.description,
          });
        });
        setLocations(locationsData);
        setLoading(false);
      },
      (error) => {
        console.error("Error fetching locations: ", error);
        setLoading(false);
      }
    );

    // Cleanup subscription on unmount
    return () => unsubscribe();
  }, []);

  return { locations, loading };
}
