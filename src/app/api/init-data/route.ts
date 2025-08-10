import { NextResponse } from 'next/server';
import { initializeSampleData } from '@/lib/sample-data';

export async function POST() {
  try {
    // Only allow in development environment for safety
    if (process.env.NODE_ENV === 'production') {
      return NextResponse.json(
        { error: 'Sample data initialization not allowed in production' },
        { status: 403 }
      );
    }

    console.log('Starting sample data initialization...');
    await initializeSampleData();

    return NextResponse.json({
      success: true,
      message: 'Sample relationship data initialized successfully',
      data: {
        organizations: 1,
        users: 1,
        people: 5,
        relationships: 5,
        vectorContexts: 5
      }
    });

  } catch (error) {
    console.error('Error initializing sample data:', error);
    return NextResponse.json(
      {
        error: 'Failed to initialize sample data',
        details: process.env.NODE_ENV === 'development' ? (error as Error).message : undefined
      },
      { status: 500 }
    );
  }
}

export async function GET() {
  return NextResponse.json({
    endpoint: 'Sample Data Initialization',
    description: 'POST to initialize sample relationship data for development',
    note: 'Only available in development environment'
  });
} 