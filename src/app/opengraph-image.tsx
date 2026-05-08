import { ImageResponse } from 'next/og';

export const size = {
  width: 1200,
  height: 630,
};

export const contentType = 'image/png';

export default function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          background: '#050505',
          color: 'white',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          padding: '72px',
          fontFamily: 'Arial',
        }}
      >
        <div style={{ fontSize: 30, color: '#60a5fa', marginBottom: 28 }}>TrackSpend AI</div>
        <div style={{ fontSize: 74, fontWeight: 800, lineHeight: 1.05, width: 920 }}>
          Find hidden AI tooling savings
        </div>
        <div style={{ fontSize: 30, color: '#d4d4d8', marginTop: 32, width: 820 }}>
          Audit plans, seats, overlap, and credit opportunities in minutes.
        </div>
      </div>
    ),
    size
  );
}
