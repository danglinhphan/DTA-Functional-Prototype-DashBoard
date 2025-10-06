import { NextResponse } from 'next/server';
import { loadProjectData } from '@/lib/data';

// Cache for 5 minutes (300 seconds)
let cachedData: any = null;
let cacheTimestamp: number = 0;
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

export async function GET() {
  try {
    const now = Date.now();

    // Check if we have valid cached data
    if (cachedData && (now - cacheTimestamp) < CACHE_DURATION) {
      console.log('Serving from cache');
      return NextResponse.json(cachedData);
    }

    console.log('Loading fresh data');
    const data = await loadProjectData();

    // Cache the data
    cachedData = data;
    cacheTimestamp = now;

    return NextResponse.json(data);
  } catch (error) {
    console.error('Error loading project data:', error);
    return NextResponse.json({ error: 'Failed to load project data' }, { status: 500 });
  }
}

// Force refresh cache endpoint
export async function POST() {
  try {
    console.log('Force refreshing cache');
    const data = await loadProjectData();

    cachedData = data;
    cacheTimestamp = Date.now();

    return NextResponse.json({
      success: true,
      message: 'Cache refreshed',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error refreshing cache:', error);
    return NextResponse.json({ error: 'Failed to refresh cache' }, { status: 500 });
  }
}