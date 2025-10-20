'use client';

import { MapContainer, TileLayer, Marker, Popup, useMap, useMapEvents, Polyline } from 'react-leaflet'; 
import 'leaflet/dist/leaflet.css';
import L, { LatLng, LatLngBounds } from 'leaflet';
import { useEffect, useRef, useState } from 'react';
import { Waypoints, Home, LocateFixed, MapPin, Clock, Route, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';

interface Location {
    id: string; 
    lat: number;
    lng: number;
    name: string;
    description?: string;
}

interface Gateway {
    id: string;
    name: string;
    lat: number;
    lon: number;
    status: 'Active' | 'Inactive';
}

interface Node {
    id: string;
    name: string;
    lat: number;
    lon: number;
    status: string;
    temp: number;
    humidity: number;
}

type MapProps = {
    positions?: Location[];
    nodes?: Node[];
    gateways?: Gateway[];
    center?: [number, number];
    zoom?: number;
    routeTo?: [number, number] | null;
    onMoveEnd?: (center: [number, number], bounds: LatLngBounds) => void;
    onZoomEnd?: (zoom: number) => void;
    onRemoveLocation?: (id: string) => void;
    onSaveLocation: (location: { name: string; description: string; lat: number; lng: number }) => Promise<boolean>;
    onCoordsSearch: (coords: { lat: number, lng: number }) => boolean;
    onNodeClick?: (node: Node) => void;
};

function MapInvalidator() {
    const map = useMap();
    useEffect(() => {
        const handleResize = () => { map.invalidateSize(); };
        window.addEventListener('resize', handleResize);
        handleResize();
        return () => window.removeEventListener('resize', handleResize);
    }, [map]);
    return null;
}

function ChangeView({ center, zoom }: { center: [number, number]; zoom: number }) {
    const map = useMap();
    useEffect(() => {
        map.setView(center, zoom);
    }, [center, zoom, map]);
    return null;
}

function MapEvents({ onMoveEnd, onZoomEnd, onMapClick }: Pick<MapProps, 'onMoveEnd' | 'onZoomEnd'> & { onMapClick: (e: L.LeafletMouseEvent) => void }) {
    const map = useMapEvents({
        click: onMapClick,
        moveend: () => {
            const center = map.getCenter();
            onMoveEnd?.([center.lat, center.lng], map.getBounds());
        },
        zoomend: () => {
            const center = map.getCenter();
            onZoomEnd?.(map.getZoom());
            onMoveEnd?.([center.lat, center.lng], map.getBounds());
        },
        load: () => {
            const center = map.getCenter();
            onMoveEnd?.([center.lat, center.lng], map.getBounds());
        }
    });
    return null;
}

const dagupanPosition: [number, number] = [16.046882, 120.341154];

function CustomControls() {
    const map = useMap();
    const homeRef = useRef<HTMLDivElement>(null);
    const locationRef = useRef<HTMLDivElement>(null);
    const zoomRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (homeRef.current) L.DomEvent.disableClickPropagation(homeRef.current);
        if (locationRef.current) L.DomEvent.disableClickPropagation(locationRef.current);
        if (zoomRef.current) L.DomEvent.disableClickPropagation(zoomRef.current);
    }, []);

    const handleHomeClick = () => {
        map.flyTo(dagupanPosition, 13);
    };

    const handleMyLocationClick = () => {
        map.locate().on('locationfound', function (e) {
            map.flyTo(e.latlng, 16);
            toast.success("Moved to your location!");
        }).on('locationerror', function(){
            toast.error("Could not access your location.");
        });
    };

    return (
        <>
            <div ref={homeRef} className="leaflet-top leaflet-right">
                <div className="leaflet-control mt-4 mr-2.5">
                    <button
                        onClick={handleHomeClick}
                        className={cn("map-control-button h-10 w-10 rounded-full")}
                        title="Reset View"
                    >
                        <Home className="h-5 w-5"/>
                    </button>
                </div>
            </div>
             <div ref={locationRef} className="leaflet-bottom leaflet-right">
                <div className="leaflet-control mr-2.5 zoom-control-container" style={{ bottom: '20px' }}>
                     <button
                        onClick={handleMyLocationClick}
                        className={cn("map-control-button h-10 w-10 rounded-full")}
                        title="My Location"
                    >
                        <LocateFixed className="h-5 w-5" />
                    </button>
                    <div ref={zoomRef} className={cn("map-control-button zoom-control")}>
                        <button onClick={() => map.zoomIn()} className="zoom-in" title="Zoom in">+</button>
                        <div className="zoom-separator"></div>
                        <button onClick={() => map.zoomOut()} className="zoom-out" title="Zoom out">-</button>
                    </div>
                </div>
            </div>
        </>
    );
}

//HEADQUARTERS PNG===================================================================================================================================
const hqIcon = new L.Icon({
    iconUrl: '/HQ.png',
    iconRetinaUrl: '/HQ.png',
    iconSize: [80, 80],
    iconAnchor: [40, 70],
    popupAnchor: [0, -60]
});

//NODE IMAGE==========================================================================================================================
const nodeIcon = new L.Icon({
    iconUrl: '/HQ.png',
    iconRetinaUrl: '/HQ.png',
    iconSize: [50, 50],
    iconAnchor: [20, 35],
    popupAnchor: [0, -30],
});
//ORS STARTING POINT ICON
const startIcon = new L.Icon({
    iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-green.png',
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41]
});

//ORS END POINT ICON
const endIcon = new L.Icon({
    iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png',
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41]
//==========================================================================================================================
});


export default function Map({ 
    positions = [],
    nodes = [],
    gateways = [],
    center = dagupanPosition, 
    zoom = 13,
    routeTo = null,
    onMoveEnd,
    onZoomEnd,
    onRemoveLocation,
    onSaveLocation,
    onCoordsSearch,
    onNodeClick,
}: MapProps) {
    const mapRef = useRef<L.Map>(null);
    const [isRoutingPanelOpen, setIsRoutingPanelOpen] = useState(false);
    const [startPoint, setStartPoint] = useState<LatLng | null>(null);
    const [endPoint, setEndPoint] = useState<LatLng | null>(null);
    const [routePolyline, setRoutePolyline] = useState<[number, number][] | null>(null);
    const addLocationRef = useRef<HTMLDivElement>(null);
    
    const [routeDistance, setRouteDistance] = useState<number | null>(null);
    const [routeDuration, setRouteDuration] = useState<number | null>(null);

    const [isLocationPanelOpen, setIsLocationPanelOpen] = useState(false);
    const [newPinCoords, setNewPinCoords] = useState<{ lat: number; lng: number } | null>(null);
    const [locationName, setLocationName] = useState('');
    const [locationDesc, setLocationDesc] = useState('');
    const [isLocationSaved, setIsLocationSaved] = useState(false);
    const [coordsInput, setCoordsInput] = useState('');
    
    const calculateAndDrawRoute = async (start: LatLng, end: LatLng) => {
        if (!start || !end) {
            toast.warning("Please select a start and end point.");
            return;
        }

        try {
            const response = await fetch('/api/route', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ startLat: start.lat, startLng: start.lng, endLat: end.lat, endLng: end.lng })
            });

            if (!response.ok) {
                const errorBody = await response.text();
                try {
                    const errorJson = JSON.parse(errorBody);
                    throw new Error(errorJson.message || 'Failed to calculate route.');
                } catch (e) {
                     throw new Error(errorBody || `Error from routing service: ${response.statusText}`);
                }
            }
            
            const data = await response.json();
            const invertedPath = data.path.map((coord: [number, number]) => [coord[1], coord[0]] as [number, number]);
            setRoutePolyline(invertedPath);
            
            setRouteDistance(data.distance);
            setRouteDuration(data.duration);

            const bounds = L.latLngBounds(invertedPath);
            mapRef.current?.flyToBounds(bounds, { padding: [50, 50] });

        } catch (error: any) {
            console.error("Routing error:", error);
            toast.error(error.message);
        }
    };
    
    useEffect(() => {
        if (routeTo) {
            // Find the nearest gateway to the route destination
            let nearestGatewayPos: [number, number] = dagupanPosition;
            let minDistance = Infinity;

            const endLat = routeTo[0];
            const endLon = routeTo[1];

            gateways.forEach(gateway => {
                const dist = Math.sqrt(Math.pow(endLat - gateway.lat, 2) + Math.pow(endLon - gateway.lon, 2));
                if (dist < minDistance) {
                    minDistance = dist;
                    nearestGatewayPos = [gateway.lat, gateway.lon];
                }
            });

            const end = L.latLng(routeTo[0], routeTo[1]);
            const start = L.latLng(nearestGatewayPos[0], nearestGatewayPos[1]);

            setStartPoint(start);
            setEndPoint(end);
            calculateAndDrawRoute(start, end);
        }
    }, [routeTo, gateways]);


    useEffect(() => {
        if (addLocationRef.current) L.DomEvent.disableClickPropagation(addLocationRef.current);
      }, []);

    useEffect(() => {
        delete (L.Icon.Default.prototype as any)._getIconUrl;
        L.Icon.Default.mergeOptions({
            iconRetinaUrl: '/Pinpoint.png',
            iconUrl: '/Pinpoint.png',
            shadowUrl: null, 		
            iconSize: [55, 55], 		
            iconAnchor: [22, 44], 	
            popupAnchor: [1, -34] 	
        });
    }, []);

    const handleMapClick = (e: L.LeafletMouseEvent) => {
        if (isRoutingPanelOpen) {
            if (!startPoint) {
                setStartPoint(e.latlng);
                toast.info("Start point selected. Click on map for end point.");
            } else if (!endPoint) {
                setEndPoint(e.latlng);
                toast.success("End point selected. Calculate route.");
            } else {
                toast.warning("Start/end points already selected. Clear route to select new points.");
            }
        } else {
            setNewPinCoords(e.latlng);
            setIsLocationPanelOpen(true);
        }
    };
    
    const handleCoordsSearch = () => {
        const parts = coordsInput.split(',').map(part => part.trim());
        if (parts.length !== 2) {
          toast.error('Invalid format. Please use "latitude, longitude".');
          return;
        }
        
        const lat = parseFloat(parts[0]);
        const lng = parseFloat(parts[1]);
    
        if (isNaN(lat) || isNaN(lng) || lat < -90 || lat > 90 || lng < -180 || lng > 180) {
          toast.error('Invalid latitude or longitude values.');
          return;
        }
    
        const newCoords = { lat, lng };
        setNewPinCoords(newCoords);
        onCoordsSearch(newCoords);
        setCoordsInput('');
    };

    const handleSaveLocation = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newPinCoords || !locationName) {
          toast.warning('Please provide a name for the location.');
          return;
        }
        
        const success = await onSaveLocation({
            name: locationName,
            description: locationDesc,
            lat: newPinCoords.lat,
            lng: newPinCoords.lng,
        });

        if (success) {
          setIsLocationSaved(true);
          setTimeout(() => {
            setIsLocationSaved(false);
            setNewPinCoords(null);
            setLocationName('');
            setLocationDesc('');
            setIsLocationPanelOpen(false);
          }, 1000);
        }
    };

    const handleCancelAddLocation = () => {
        setNewPinCoords(null);
        setLocationName('');
        setLocationDesc('');
        setCoordsInput('');
        setIsLocationPanelOpen(false);
    };

    
    const handleClearRoute = () => {
        setStartPoint(null);
        setEndPoint(null);
        setRoutePolyline(null);
        setRouteDistance(null);
        setRouteDuration(null);
        toast.info("Route cleared.");
    };

    return (
        <div className="relative h-full w-full">
            <MapContainer 
                ref={mapRef}
                center={center} 
                zoom={zoom} 
                style={{ height: '100%', width: '100%' }}
                zoomControl={false}
            >
                <TileLayer
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />
                
                {positions.map((pos) => (
                    <Marker key={pos.id} position={[pos.lat, pos.lng]}
                        eventHandlers={{
                            click: (e) => {
                                if (isRoutingPanelOpen) handleMapClick(e);
                                else e.target._map.flyTo(e.latlng, 15);
                            },
                        }}
                    >
                        <Popup>
                            <b>{pos.name}</b><br />{pos.description}
                            <br />
                            {onRemoveLocation && (
                                <button
                                    style={{ marginTop: '10px', color: 'red', cursor: 'pointer', background: 'none', border: 'none', padding: 0 }}
                                    onClick={(e) => { e.stopPropagation(); onRemoveLocation(pos.id); }}
                                >
                                    Remove
                                </button>
                            )}
                        </Popup>
                    </Marker>
                ))}
                
                {nodes.map((node) => (
                    <Marker key={node.id} position={[node.lat, node.lon]} icon={nodeIcon}
                        eventHandlers={{
                            click: (e) => {
                                if (onNodeClick) onNodeClick(node);
                                if (isRoutingPanelOpen) handleMapClick(e);
                                else e.target._map.flyTo(e.latlng, 15);
                            },
                        }}
                    >
                        <Popup><b>{node.name}</b><br />Status: {node.status}</Popup>
                    </Marker>
                ))}

                {gateways.map(gateway => (
                    <Marker key={gateway.id} position={[gateway.lat, gateway.lon]} icon={hqIcon}
                        eventHandlers={{
                            click: (e) => {
                                 if (isRoutingPanelOpen) handleMapClick(e);
                                 else e.target._map.flyTo([gateway.lat, gateway.lon], 15);
                            }
                        }}
                    //Headquarters Text============================================================================================================================================
                    > 
                        <Popup><b>{gateway.name}</b><br />F.L.A.M.E.S. Gateway</Popup>
                    </Marker>
                ))}
                

                
                {startPoint && <Marker position={startPoint} icon={startIcon}><Popup>Start Point</Popup></Marker>}
                {endPoint && <Marker position={endPoint} icon={endIcon}><Popup>End Point</Popup></Marker>}

                {routePolyline && <Polyline positions={routePolyline} color="blue" />}
                
                {newPinCoords && <Marker position={newPinCoords}><Popup>New location</Popup></Marker>}
                
                <MapInvalidator />
                <ChangeView center={center} zoom={zoom} />
                <MapEvents onMoveEnd={onMoveEnd} onZoomEnd={onZoomEnd} onMapClick={handleMapClick} />
                <CustomControls />
            </MapContainer>

            {routeDistance !== null && routeDuration !== null && (
                <div className="absolute top-4 left-1/2 -translate-x-1/2 z-[401] bg-card/90 backdrop-blur-sm p-3 rounded-lg shadow-lg flex items-center gap-4">
                    <div className="flex items-center gap-2">
                        <Route className="h-5 w-5 text-green-500" />
                        <p className="font-semibold text-green-500">{(routeDistance / 1000).toFixed(2)} km</p>
                    </div>
                     <div className="w-[1px] h-6 bg-border"></div>
                    <div className="flex items-center gap-2">
                        <Clock className="h-5 w-5 text-muted-foreground" />
                        <p className="font-semibold">~{(routeDuration / 60).toFixed(0)} mins</p>
                    </div>
                    <Button variant="ghost" size="icon" className="h-6 w-6 ml-2" onClick={handleClearRoute}>
                        <X className="h-4 w-4" />
                    </Button>
                </div>
            )}

            <div 
                ref={addLocationRef}
                className="absolute top-4 left-4 z-[401] flex flex-col items-start gap-2"
            >
                <Button
                    variant="default"
                    className="shadow-lg"
                    size="icon"
                    title="Add Location"
                    onClick={() => setIsLocationPanelOpen(!isLocationPanelOpen)}
                >
                    <MapPin className="h-5 w-5" />
                </Button>
                
                {isLocationPanelOpen && (
                    <div className="location-panel w-72">
                        {newPinCoords ? (
                            <form onSubmit={handleSaveLocation} className="space-y-4">
                                <div className="space-y-2">
                                    <Label htmlFor="location-name">Location Name</Label>
                                    <Input id="location-name" placeholder="e.g., Evacuation Center" value={locationName} onChange={e => setLocationName(e.target.value)} />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="location-desc">Description</Label>
                                    <Textarea id="location-desc" placeholder="Optional notes" value={locationDesc} onChange={e => setLocationDesc(e.target.value)} />
                                </div>
                                <div className="space-y-2">
                                    <Label>Coordinates</Label>
                                    <p className="text-sm text-muted-foreground">{newPinCoords.lat.toFixed(6)}, {newPinCoords.lng.toFixed(6)}</p>
                                </div>
                                <div className='flex gap-2'>
                                    <Button type="submit" disabled={!locationName} className={cn(isLocationSaved && 'bg-green-500')}>
                                      {isLocationSaved ? 'Saved!' : 'Save Pinned Location'}
                                    </Button>
                                    <Button variant="ghost" type="button" onClick={handleCancelAddLocation}>Cancel</Button>
                                </div>
                            </form>
                        ) : (
                            <div className="space-y-4">
                                <p className='text-sm text-muted-foreground'>Click on the map to select a point or enter coordinates below.</p>
                                <div className="flex gap-2">
                                    <Input
                                        type="text"
                                        placeholder="lat, lng (e.g., 16.04, 120.33)"
                                        value={coordsInput}
                                        onChange={e => setCoordsInput(e.target.value)}
                                        onKeyDown={e => e.key === 'Enter' && handleCoordsSearch()}
                                    />
                                    <Button onClick={handleCoordsSearch}>Go</Button>
                                </div>
                            </div>
                        )}
                    </div>
                )}
                 <Button
                    variant="default"
                    className="shadow-lg"
                    size="icon"
                    title="Route Planner"
                    onClick={() => setIsRoutingPanelOpen(!isRoutingPanelOpen)}
                >
                    <Waypoints className="h-5 w-5" />
                </Button>
                {isRoutingPanelOpen && (
                     <div className="location-panel flex gap-2">
                        <Button variant="secondary" onClick={() => { if(startPoint && endPoint) calculateAndDrawRoute(startPoint, endPoint)}} disabled={!startPoint || !endPoint}>Calculate</Button>_
                        <Button variant="ghost" onClick={handleClearRoute}>Clear</Button>
                    </div>
                )}
            </div>
        </div>
    );
}

    
