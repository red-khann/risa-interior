import { ImageResponse } from 'next/og';

export const runtime = 'edge';

// 🎯 Brand Constants
export const alt = 'RISA Interior & Contractors | Luxury Architectural Excellence';
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

export default async function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          background: '#0B0B0B', // Rich Black
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          border: '20px solid #D9C5A0', // Champagne Gold Border
        }}
      >
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          {/* Studio Name */}
          <h1 style={{ 
            fontSize: 80, 
            color: 'white', 
            letterSpacing: '0.2em', 
            textTransform: 'uppercase',
            margin: 0 
          }}>
            RISA
          </h1>
          {/* Subtitle */}
          <div style={{ 
            fontSize: 30, 
            color: '#D9C5A0', 
            marginTop: 20, 
            letterSpacing: '0.4em',
            textTransform: 'uppercase' 
          }}>
            Interior & Contractors
          </div>
          <div style={{ 
            fontSize: 18, 
            color: '#ffffff80', 
            marginTop: 40, 
            letterSpacing: '0.1em' 
          }}>
            Luxury Architectural Excellence
          </div>
        </div>
      </div>
    ),
    { ...size }
  );
}