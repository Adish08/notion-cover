import { ImageResponse } from 'next/og';
import { Client } from '@notionhq/client';

export const runtime = 'edge'; // High speed, low latency

const notion = new Client({ auth: process.env.NOTION_TOKEN });

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  
  // Theme Toggle: Defaults to Dark
  const isDark = searchParams.get('theme') !== 'light';
  const bgColor = isDark ? '#0F172A' : '#F8FAFC';
  const textColor = isDark ? '#F1F5F9' : '#1E293B';

  try {
    // 1. Fetch from Notion
    const response = await notion.databases.query({
      database_id: process.env.NOTION_DATABASE_ID!,
      page_size: 100, // Fetch up to 100 for randomizing
    });

    // 2. Pick a random entry
    const results = response.results;
    const randomEntry = results[Math.floor(Math.random() * results.length)] as any;
    const codeSnippet = randomEntry.properties.Code.title[0]?.plain_text || "Be the Rarity.";

    // 3. Return the Image with Cache-Control headers
    return new ImageResponse(
      (
        <div style={{
          height: '100%', width: '100%', display: 'flex', flexDirection: 'column',
          alignItems: 'center', justifyContent: 'center', backgroundColor: bgColor,
          padding: '80px', textAlign: 'center', fontFamily: 'sans-serif'
        }}>
          <div style={{ fontSize: 48, fontWeight: 'bold', color: textColor, marginBottom: '20px' }}>
            {codeSnippet}
          </div>
          <div style={{ fontSize: 18, color: isDark ? '#64748B' : '#94A3B8', letterSpacing: '0.1em' }}>
            DAILY CODE
          </div>
        </div>
      ),
      {
        width: 1500, height: 600,
        headers: {
          'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
          'Pragma': 'no-cache',
          'Expires': '0',
        },
      }
    );
  } catch (e) {
    return new Response(`Failed to generate image`, { status: 500 });
  }
}
