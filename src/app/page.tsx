'use client';

import { useEffect, useState, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Search, X, MapPin, Users, Trash2, Thermometer, Droplets, ChevronDown, Flame, Clock } from 'lucide-react';
import { useAppContext } from '@/context/app-context';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import dynamic from 'next/dynamic';
import { useDebounce } from '@/hooks/use-debounce';
import { addDoc, collection, deleteDoc, doc } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { toast } from 'sonner';
import { useLocations } from '@/hooks/use-locations';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';


const Map = dynamic(() => import('@/components/map'), {
  ssr: false,
});

type Suggestion = {
  place_id: number;
  lat: string;
  lon: string;
  display_name: string;
};

type Incident = {
  id: string;
  location: string;
  status: 'Active' | 'Contained' | 'Resolved';
  team: string;
  lat: number;
  lon: number;
};

interface Node {
    id: string;
    name: string;
    lat: number;
    lon: number;
    status: string;
    temp: number;
    humidity: number;
    gatewayId: string;
}

interface Gateway {
    id: string;
    name: string;
    lat: number;
    lon: number;
    status: 'Active' | 'Inactive';
}

const gateways: Gateway[] = [
    { id: 'GW-DAG', name: 'Dagupan Headquarters', lat: 16.046882, lon: 120.341154, status: 'Active' },
];



const allIncidents: Incident[] = [
  { id: 'INC-001', location: 'A.B. Fernandez Ave', status: 'Active', team: 'Pantal', lat: 16.041, lon: 120.334 },
  { id: 'INC-002', location: 'Perez Boulevard', status: 'Contained', team: 'Calmay', lat: 16.046, lon: 120.328 },
  { id: 'INC-003', location: 'Tapestry (Bonuan)', status: 'Resolved', team: 'Bonuan', lat: 16.077, lon: 120.354 },
  { id: 'INC-004', location: 'Malued District', status: 'Active', team: 'Pantal', lat: 16.035, lon: 120.345 },
  { id: 'INC-006', location: 'Bonuan Gueset', status: 'Active', team: 'Bonuan', lat: 16.072, lon: 120.362 },
];


export default function Home() {
  const {
    selectedLocation,
    setSelectedLocation,
    mapCenter,
    mapZoom,
    setMapCenter,
    setMapZoom,
    clickedLocation,
    setClickedLocation,
    mapBounds,
    setMapBounds
  } = useAppContext();

  const { locations: savedLocations } = useLocations();

  const [search, setSearch] = useState(
    selectedLocation ? selectedLocation.display_name.split(',')[0] : ''
  );
  const debouncedSearch = useDebounce(search, 200);
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [isFocused, setIsFocused] = useState(false);
  const [routeTo, setRouteTo] = useState<[number, number] | null>(null);
  const [selectedNodeData, setSelectedNodeData] = useState<Node | null>(null);
  const [showPinnedLocationsList, setShowPinnedLocationsList] = useState(false);

  //jg
  // ✅ Fetch live node data from MySQL via API route
const [nodes, setNodes] = useState<Node[]>([]);


//jg
useEffect(() => {
  const fetchNodes = async () => {
    try {
      const res = await fetch('/api/nodes');
      if (!res.ok) throw new Error('Failed to fetch nodes');

      const data = await res.json(); // ✅ define data inside the async function

      // 🧠 Temporary mapping — all nodes belong to Dagupan HQ
      const updated = data.map((n: any) => ({
        ...n,
        gatewayId: 'GW-DAG', // temporary static gateway
        name: `Node ${n.id}`, // fallback label
        status: 'Active', // placeholder status
        temp: parseFloat(n.temp).toFixed(4), // show 4 decimal places
      }));

      setNodes(updated);
    } catch (error) {
      console.error('Error fetching node data:', error);
    }
  };
//jg
  fetchNodes(); // initial fetch
  const interval = setInterval(fetchNodes, 5000); // refresh every 5 seconds
  return () => clearInterval(interval);
}, []);



//REALTIME NODES
//jg
const allNodes = nodes;



  useEffect(() => {
    if (!selectedLocation) {
      setSearch('');
    }
  }, [selectedLocation]);


  useEffect(() => {
    if (clickedLocation) {
      setMapCenter([clickedLocation.lat, clickedLocation.lng]);
      setMapZoom(16);
      setClickedLocation(null);
    }
  }, [clickedLocation, setMapCenter, setMapZoom, setClickedLocation]);


  useEffect(() => {
    if (selectedLocation) {
      const newCenter: [number, number] = [
        parseFloat(selectedLocation.lat),
        parseFloat(selectedLocation.lon),
      ];
      setMapCenter(newCenter);
      setMapZoom(15);
    }
  }, [selectedLocation, setMapCenter, setMapZoom]);

  const fetchSuggestions = async (query: string) => {
    if (query.length > 2) {
      try {
        const response = await fetch(
          `https://nominatim.openstreetmap.org/search?q=${query}&format=json&countrycodes=ph`
        );
        const data = await response.json();
        setSuggestions(data);
      } catch (error) {
        console.error('Error fetching suggestions:', error);
        setSuggestions([]);
      }
    } else {
      setSuggestions([]);
    }
  };

  useEffect(() => {
    fetchSuggestions(debouncedSearch);
  }, [debouncedSearch]);

  const handleSuggestionClick = (suggestion: Suggestion) => {
    setSelectedLocation(suggestion);
    setSearch(suggestion.display_name.split(',')[0]);
    setSuggestions([]);
    setIsFocused(false);
  };

  const clearSearch = () => {
    setSearch('');
    setSuggestions([]);
    setSelectedLocation(null);
  };

  const handleSaveLocation = async (location: { name: string; description: string; lat: number; lng: number }) => {
    try {
      await addDoc(collection(db, 'locations'), {
        name: location.name,
        description: location.description,
        latitude: location.lat,
        longitude: location.lng,
      });

      toast.success('Location saved successfully');
      return true;
    } catch (error) {
      console.error('Error adding document: ', error);
      toast.error('Failed to save location.');
      return false;
    }
  };

  const handleRemoveLocation = async (id: string) => {
    try {
      await deleteDoc(doc(db, 'locations', id));
      toast.success('Location removed');
    } catch (error) {
      console.error('Error removing document: ', error);
      toast.error('Failed to remove location.');
    }
  };
  
  const handleCoordsSearch = (coords: { lat: number, lng: number }) => {
      setMapCenter([coords.lat, coords.lng]);
      setMapZoom(16);
      toast.success('Map centered on coordinates.');
      return true;
  };


  const showSuggestions = suggestions.length > 0 && isFocused;
  
  const visibleGateways = useMemo(() => {
    if (!mapBounds) return gateways;
    return gateways.filter(gw => mapBounds.contains([gw.lat, gw.lon]));
  }, [mapBounds]);
  
  const displayedGateways = visibleGateways;

  return (
    <div className="flex flex-col h-full w-full p-4 gap-4 overflow-hidden">
      {/* Top Row: Search and Stats */}
      <div className="w-full">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Search Location</CardTitle>
                    <Search className="h-4 w-4 text-muted-foreground"/>
                </CardHeader>
                <CardContent className="py-2.5 flex flex-col gap-2">
                    <div className="relative">
                        <Input
                          type="text"
                          placeholder="Search Dagupan..."
                          className="text-sm h-9"
                          value={search}
                          onChange={(e) => setSearch(e.target.value)}
                          onFocus={() => setIsFocused(true)}
                          onBlur={() => setTimeout(() => setIsFocused(false), 150)}
                        />
                        {search && (
                          <Button
                            variant="ghost"
                            size="icon"
                            className="absolute right-1 top-1/2 -translate-y-1/2 h-7 w-7"
                            onClick={clearSearch}
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                     {showSuggestions && (
                        <div className="border rounded-md max-h-40 overflow-y-auto">
                          <ul className="divide-y">
                            {suggestions.map((suggestion) => (
                              <li
                                key={suggestion.place_id}
                                className="p-2 hover:bg-muted cursor-pointer text-sm"
                                onMouseDown={() => handleSuggestionClick(suggestion)}
                              >
                                {suggestion.display_name}
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Node Status</CardTitle>
                    <CardDescription>{selectedNodeData ? selectedNodeData.name : 'Select a node'}</CardDescription>
                </CardHeader>
                <CardContent className="py-2.5">
                    {selectedNodeData ? (
                        <div className="flex justify-around items-center h-full pt-1">
                            <div className="text-center">
                                <div className="flex items-center justify-center gap-1">
                                    <Thermometer className="h-5 w-5 text-red-500" />
                                    <span className="text-xl font-bold">{Number(selectedNodeData.temp)?.toFixed(2)}°C</span>
                                </div>
                                <p className="text-xs text-muted-foreground">Temperature</p>
                            </div>
                            <div className="text-center">
                               <div className="flex items-center justify-center gap-1">
                                    <Droplets className="h-5 w-5 text-blue-500" />
                                    <span className="text-xl font-bold">{selectedNodeData.humidity}%</span>
                                </div>
                                <p className="text-xs text-muted-foreground">Humidity</p>
                            </div>
                        </div>
                    ) : (
                        <div className="text-center py-2 flex items-center justify-center h-full">
                            <p className="text-sm text-muted-foreground">Click a node to see its status.</p>
                        </div>
                    )}
                </CardContent>
            </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Pinned Locations</CardTitle>
                     <MapPin className="h-4 w-4 text-muted-foreground"/>
                </CardHeader>
                <CardContent className="py-2.5">
                    {showPinnedLocationsList ? (
                        <div>
                            <Button variant="outline" onClick={() => setShowPinnedLocationsList(false)} className="mb-2 w-full h-8 text-xs">Hide</Button>
                            <div className="max-h-[40px] overflow-y-auto pr-2">
                                <ul className="space-y-2">
                                    {savedLocations.length > 0 ? (
                                        savedLocations.map(location => (
                                            <li key={location.id} className="flex justify-between items-center p-1 rounded-md hover:bg-muted group">
                                                <button
                                                    className="flex-1 text-left"
                                                    onClick={() => {
                                                        setRouteTo([location.lat, location.lng]);
                                                        setClickedLocation(location);
                                                    }}
                                                >
                                                    <p className="font-semibold text-sm">{location.name}</p>
                                                    <p className="text-xs text-muted-foreground">{location.description}</p>
                                                </button>
                                                 <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    className="h-7 w-7"
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        if (window.confirm('Are you sure you want to remove this location?')) {
                                                            handleRemoveLocation(location.id);
                                                        }
                                                    }}
                                                >
                                                    <Trash2 className="h-4 w-4 text-destructive/70 group-hover:text-destructive" />
                                                </Button>
                                            </li>
                                        ))
                                    ) : (
                                        <p className="text-sm text-muted-foreground text-center py-2">No locations pinned.</p>
                                    )}
                                </ul>
                            </div>
                        </div>
                    ) : (
                      <div className="flex items-center justify-between h-full pt-1">
                          <div>
                            <p className="text-xl font-bold">{savedLocations.length}</p>
                            <p className="text-xs text-muted-foreground">locations saved</p>
                          </div>
                          <Button variant="outline" onClick={() => setShowPinnedLocationsList(true)}>View All</Button>
                      </div>
                    )}
                </CardContent>
              </Card>
            </div>
      </div>
      
      {/* Bottom Row: Map and Info Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 flex-1 min-h-0">
          <Card className="lg:col-span-2 h-full min-h-[400px] lg:min-h-0 relative rounded-lg overflow-hidden">
            <Map
              center={mapCenter}
              zoom={mapZoom}
              positions={savedLocations}
              nodes={allNodes}
              gateways={gateways}
              routeTo={routeTo}
              onRemoveLocation={handleRemoveLocation}
              onMoveEnd={(center, bounds) => {
                  setMapCenter(center);
                  setMapBounds(bounds);
              }}
              onZoomEnd={setMapZoom}
              onSaveLocation={handleSaveLocation}
              onCoordsSearch={handleCoordsSearch}
              onNodeClick={(nodeFromMap) => {
                // The 'nodeFromMap' object is coming from the map component
                // and its type definition is missing 'gatewayId'.

                // We find the *full* node object from our local 'allNodes' state,
                // which we know has the correct 'gatewayId' property.
                const fullNode = allNodes.find(n => n.id === nodeFromMap.id);
                
                // Set the state with the full, correct node object.
                setSelectedNodeData(fullNode || null);
              }}
              
            />
          </Card>
          
          <div className="flex flex-col gap-4 overflow-y-auto">
            <Card> 
                 <CardHeader>
                    <CardTitle>Network Status</CardTitle>
                    <CardDescription>Gateways in map view</CardDescription>
                </CardHeader>
                <CardContent className="text-sm space-y-2">
 {displayedGateways.length > 0 ? (
    displayedGateways.map(gateway => {
      const gatewayNodes = allNodes.filter(node => node.gatewayId === gateway.id);
      const activeCount = gatewayNodes.filter(n => n.status === 'Active').length;

      const gatewayStatus =
        gatewayNodes.length === 0
          ? 'Active'
          : activeCount === gatewayNodes.length
          ? 'Active'
          : activeCount === 0
          ? 'Inactive'
          : 'Partial';

      return (
        <Collapsible key={gateway.id} className="space-y-2" defaultOpen>
          <CollapsibleTrigger asChild>
            <button className="flex justify-between items-center w-full p-2 rounded-md hover:bg-muted transition-colors group">
              <div className="flex items-center gap-2">
                <div
                  className={cn(
                    'h-2.5 w-2.5 rounded-full',
                    gatewayStatus === 'Active'
                      ? 'bg-green-500 animate-pulse'
                      : gatewayStatus === 'Partial'
                      ? 'bg-yellow-500 animate-pulse'
                      : 'bg-red-500'
                  )}
                ></div>
                <p className="font-semibold">{gateway.name}</p>
              </div>
              <div className="flex items-center gap-2">
                <div
                  className={cn(
                    'px-2 py-0.5 rounded-full text-xs',
                    gatewayStatus === 'Active'
                      ? 'bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300'
                      : gatewayStatus === 'Partial'
                      ? 'bg-yellow-100 dark:bg-yellow-900 text-yellow-700 dark:text-yellow-300'
                      : 'bg-red-100 dark:bg-red-900 text-red-700 dark:text-red-300'
                  )}
                >
                  {gatewayStatus}
                </div>
                <ChevronDown className="w-4 h-4 text-muted-foreground transition-transform group-data-[state=open]:rotate-180" />
              </div>
            </button>
          </CollapsibleTrigger>

          <CollapsibleContent className="pl-4 space-y-1 pt-1 border-l ml-4">
            <div className="flex items-center gap-2 text-xs text-muted-foreground mb-2">
              <Users className="w-3 h-3" />
              <span>
                {activeCount} / {gatewayNodes.length} Nodes Active
              </span>
            </div>
            {gatewayNodes.map(node => (
              <button
                key={node.id}
                className="flex items-center gap-2 text-xs w-full text-left p-1 rounded-md hover:bg-muted"
                onClick={() => {
                  setSelectedNodeData(node);
                  setRouteTo([node.lat, node.lon]);
                  setClickedLocation({
                    lat: node.lat,
                    lng: node.lon,
                    id: node.id,
                    name: node.name,
                  });
                }}
              >
                <span
                  className={cn(
                    'h-2 w-2 rounded-full',
                    node.status === 'Active' ? 'bg-green-500' : 'bg-red-500'
                  )}
                ></span>
                <p>{node.name}</p>
              </button>
            ))}
          </CollapsibleContent>
        </Collapsible>
      );
    })
  ) : (
    <p className="text-muted-foreground text-center">
      No gateways in the current area.
    </p>
  )}
</CardContent>

            </Card>
            <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                    <div>
                        <CardTitle>Live Incidents</CardTitle>
                        <CardDescription>Active and recent fire events</CardDescription>
                    </div>
                    <Badge variant="destructive" className="flex items-center gap-1">
                      <Flame className="h-3 w-3" />
                      {allIncidents.length}
                    </Badge>
                </CardHeader>
                <CardContent className="text-sm space-y-4">
                    {allIncidents.map(incident => (
                        <Collapsible key={incident.id} className="border-b pb-2 last:border-b-0">
                          <div className="flex justify-between items-center w-full group">
                              <div>
                                <p className="font-semibold">{incident.location}</p>
                                <p className="text-xs text-muted-foreground">Status: {incident.status}</p>
                              </div>
                              <CollapsibleTrigger asChild>
                                <Button variant="outline" size="sm" className="h-7">Details</Button>
                              </CollapsibleTrigger>
                          </div>
                          <CollapsibleContent className="space-y-2 pt-2">
                             <div className="flex items-center gap-2">
                                <Users className="w-4 h-4 text-muted-foreground"/>
                                <span>Assigned Team: <strong>{incident.team}</strong></span>
                             </div>
                             <div className="flex items-center gap-2">
                                <MapPin className="w-4 h-4 text-muted-foreground"/>
                                <span className="font-mono text-xs">{incident.lat.toFixed(6)}, {incident.lon.toFixed(6)}</span>
                             </div>
                             <Button 
                                size="sm"
                                className="w-full mt-2"
                                onClick={() => {
                                  setRouteTo([incident.lat, incident.lon]);
                                  setClickedLocation({ lat: incident.lat, lng: incident.lon, id: incident.id, name: incident.location });
                                }}
                             >
                                Show on Map & Route
                             </Button>
                          </CollapsibleContent>
                        </Collapsible>
                    ))}
                </CardContent>
            </Card>
          </div>
      </div>
    </div>
  );
}
