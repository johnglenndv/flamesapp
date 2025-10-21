import { NextResponse } from 'next/server';
import pool from '../../../lib/db';

export async function GET() {
  try {
    const [rows] = await pool.execute(`
      SELECT t1.node_id AS id,
             t1.temperature AS temp,
             t1.humidity,
             t1.latitude AS lat,
             t1.longitude AS lon,
             t1.timestamp
      FROM node_data t1
      INNER JOIN (
          SELECT node_id, MAX(timestamp) AS latest_time
          FROM node_data
          GROUP BY node_id
      ) t2 ON t1.node_id = t2.node_id AND t1.timestamp = t2.latest_time
      ORDER BY t1.node_id;
    `);

    const now = new Date();
    const data = (rows as any[]).map((node) => {
      const lastUpdate = new Date(node.timestamp);
      const diffMinutes = (now.getTime() - lastUpdate.getTime()) / 60000;
      const status = diffMinutes <= 2 ? 'Active' : 'Inactive';
      return { ...node, status };
    });

    return NextResponse.json(data);
  } catch (error) {
    console.error('Error fetching node data:', error);
    return NextResponse.json({ error: 'Failed to fetch node data' }, { status: 500 });
  }
}
