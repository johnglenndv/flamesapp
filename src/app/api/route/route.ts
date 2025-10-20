
import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import dotenv from 'dotenv';

function getOrsApiKey() {
  try {
    const envFilePath = path.resolve(process.cwd(), 'API KEY.env');
    if (fs.existsSync(envFilePath)) {
      const envFileContent = fs.readFileSync(envFilePath, 'utf8');
      const envConfig = dotenv.parse(envFileContent);
      return envConfig.NEXT_PUBLIC_ORS_API_KEY;
    }
    return process.env.NEXT_PUBLIC_ORS_API_KEY;
  } catch (error) {
    console.error('Error reading API KEY.env:', error);
    return process.env.NEXT_PUBLIC_ORS_API_KEY;
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { startLat, startLng, endLat, endLng } = body;

    if (!startLat || !startLng || !endLat || !endLng) {
      return NextResponse.json({ message: 'Missing required coordinates' }, { status: 400 });
    }
    
    const orsApiKey = getOrsApiKey();
    if (!orsApiKey || orsApiKey === 'YOUR_ORS_API_KEY_HERE') {
      return NextResponse.json({ message: 'ORS API key is not configured on the server. Please add it to the API KEY.env file.' }, { status: 500 });
    }

    const orsUrl = `https://api.openrouteservice.org/v2/directions/driving-car?api_key=${orsApiKey}&start=${startLng},${startLat}&end=${endLng},${endLat}`;

    const orsResponse = await fetch(orsUrl);

    if (!orsResponse.ok) {
      const errorText = await orsResponse.text();
      console.error('ORS API Error:', errorText);
      try {
        const errorJson = JSON.parse(errorText);
        const errorMessage = errorJson.error?.message || `Error from routing service: ${orsResponse.statusText}`;
         return NextResponse.json({ message: errorMessage }, { status: orsResponse.status });
      } catch (e) {
         return NextResponse.json({ message: `Error from routing service: ${errorText}` }, { status: orsResponse.status });
      }
    }

    const routeData = await orsResponse.json();
    
    if (!routeData.features || routeData.features.length === 0) {
        return NextResponse.json({ message: 'No route found.' }, { status: 404 });
    }

    const path = routeData.features[0].geometry.coordinates;
    const summary = routeData.features[0].properties.summary;
    const distance = summary.distance; // in meters
    const duration = summary.duration; // in seconds

    return NextResponse.json({ path, distance, duration });

  } catch (error) {
    console.error('Routing API Error:', error);
    return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
  }
}
