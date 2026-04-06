import { ImageResponse } from 'next/og';

export const size = {
  width: 192,
  height: 192,
};

export const contentType = 'image/png';

export default function Icon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)',
          color: '#ffffff',
          fontSize: 112,
          fontWeight: 800,
          borderRadius: 40,
        }}
      >
        H
      </div>
    ),
    {
      ...size,
    }
  );
}