import { TokenAnalysis } from '../types';
import sharp from 'sharp';
import satori from 'satori';
import { join } from 'path';
import * as fs from 'fs';

export async function generateReportImage(analysis: TokenAnalysis): Promise<Buffer> {
  // Load font
  const fontPath = join(process.cwd(), 'public/fonts/Inter-Regular.ttf');
  const fontData = fs.readFileSync(fontPath);

  const jsx = {
    type: 'div',
    props: {
      style: {
        background: '#1a1b1e',
        width: '1200px',
        height: '630px',
        padding: '40px',
        display: 'flex',
        flexDirection: 'column',
        color: 'white',
      },
      children: [
        {
          type: 'h1',
          props: {
            style: { fontSize: '48px', marginBottom: '24px' },
            children: `Token Analysis: ${analysis.address}`,
          },
        },
        {
          type: 'div',
          props: {
            style: {
              display: 'flex',
              gap: '24px',
              marginBottom: '32px',
            },
            children: [
              {
                type: 'div',
                props: {
                  style: {
                    background: '#2c2d31',
                    padding: '24px',
                    borderRadius: '12px',
                    flex: 1,
                  },
                  children: [
                    {
                      type: 'h2',
                      props: {
                        style: { fontSize: '64px', marginBottom: '8px' },
                        children: `${analysis.overall_score}/100`,
                      },
                    },
                    {
                      type: 'p',
                      props: {
                        style: { fontSize: '24px', color: '#9ca3af' },
                        children: 'Overall Score',
                      },
                    },
                  ],
                },
              },
              // Add more metric boxes here
            ],
          },
        },
        {
          type: 'p',
          props: {
            style: { fontSize: '20px', lineHeight: '1.6' },
            children: analysis.summary,
          },
        },
      ],
    },
  };

  const svg = await satori(jsx, {
    width: 1200,
    height: 630,
    fonts: [
      {
        name: 'Inter',
        data: fontData,
        style: 'normal',
      },
    ],
  });

  return await sharp(Buffer.from(svg))
    .png()
    .toBuffer();
} 