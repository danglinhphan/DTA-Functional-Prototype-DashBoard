import { NextResponse } from 'next/server';
import { loadProjectData } from '@/lib/data';

export async function GET() {
  try {
    const data = await loadProjectData();
    return NextResponse.json(data);
  } catch (error) {
    console.error('Error loading project data:', error);
    return NextResponse.json({ error: 'Failed to load project data' }, { status: 500 });
  }
}