import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '../../../lib/supabaseClient';

export async function POST(req: NextRequest) {
  // if (req.method !== 'POST') {
  //   return res.status(405).json({ error: 'Method not allowed' });
  // }

  const { uuid, country } = await req.json();
  if (!uuid || !country) {
    return NextResponse.json(
      { error: 'UUID and country are required' },
      { status: 400 }
    );
  }

  try {
    const countryTable = `approved_users_${country.replace(/\s+/g, '')}`; // Construct the table name dynamically
    const ip =  req.headers.get('x-forwarded-for') || 'Unknown IP'; // Use header to get IP address
    const location = await fetch(`https://ipinfo.io/${ip}/json`).then(res => res.json()); // // Use an IP location service to fetch location data (replace with actual API call)
    const device = req.headers.get('user-agent') || 'Unknown Device';

    const loginData = {
      last_login: new Date().toISOString(),  // Timestamp for last login
      location: location.city ? `${location.city}, ${location.region}` : 'Unknown Location',
      device, // Extracted device info
    };

    const { error } = await supabase
      .from(countryTable)
      .update(loginData)
      .eq('uuid', uuid);

      if (error) {
        console.error('Supabase error:', error);
        return NextResponse.json(
          { error: 'Failed to update last login in database' },
          { status: 500 }
        );
      }
  
      return NextResponse.json(
        { message: 'Last login updated successfully' },
        { status: 200 }
      );
    } catch (error) {
      console.error('Error:', error);
      return NextResponse.json(
        { error: 'An unexpected error occurred' },
        { status: 500 }
      );
    }
  }