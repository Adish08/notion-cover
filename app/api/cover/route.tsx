import { ImageResponse } from 'next/og';
import { Client } from '@notionhq/client';

export const runtime = 'edge';

const notion = new Client({ auth: process.env.NOTION_TOKEN });

// Helper to fetch Google Fonts binary
async function getFontData(fontFamily: string) {
  const url = `https://fonts.googleapis.com/css2?family=${fontFamily.replace(/ /g, '+')}:wght@700`;
  const css = await (await fetch(url)).text();
  const resource = css.match(/src: url\((.+)\) format\('(opentype|truetype)'\)/);
  
  if (!resource) {
    // Fallback if the specific weight/format isn't found
    const fallback = css.match(/src: url\((.+)\)/);
    if (fallback) return fetch(fallback[1]).then((res) => res.arrayBuffer());
    throw new Error('Font not found');
  }

  return fetch(resource[1]).then((res) => res.arrayBuffer());
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  
  // Theme & Font Config
  const isDark = searchParams.get('theme') !== 'light';
  const fontParam = searchParams.get('font') || 'Space Grotesk';
  
  const bgColor = isDark ? '#191919' : '#FFFFFF';
  const textColor = isDark ? '#FFFFFF' : '#37352F';
  const subTextColor = isDark ? 'rgba(255, 255, 255, 0.5)' : 'rgba(55, 53, 47, 0.6)';

  try {
    // 1. Fetch Font Data (Defaults to Space Grotesk)
    const fontData = await getFontData(fontParam);

    // 2. Fetch from Notion
    const response = await notion.databases.query({
      database_id: process.env.NOTION_DATABASE_ID!,
      page_size: 100,
    });

    const results = response.results;
    const randomEntry = results[Math.floor(Math.random() * results.length)] as any;
    const quote = randomEntry.properties.Name.title[0]?.plain_text || "Rarity earns respect.";
    const author = randomEntry.properties.Author?.rich_text[0]?.plain_text || "";

    return new ImageResponse(
      (
        <div style={{
          height: '100%', width: '100%', display: 'flex', flexDirection: 'column',
          alignItems: 'center', justifyContent: 'center', backgroundColor: bgColor,
          padding: '60px 120px', textAlign: 'center',
          fontFamily: 'CustomFont', // Link to the loaded font
        }}>
          <div style={{ 
            fontSize: 72, fontWeight: 700, color: textColor, 
            lineHeight: 1.1, marginBottom: author ? 30 : 0,
            letterSpacing: '-0.03em'
          }}>
            {quote}
          </div>
          
          {author && (
            <div style={{ fontSize: 32, fontWeight: 500, color: subTextColor }}>
              — {author}
            </div>
          )}
        </div>
      ),
      {
        width: 1500, height: 600,
        fonts: [
          {
            name: 'CustomFont',
            data: fontData,
            style: 'normal',
          },
        ],
        headers: {
          'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
        },
      }
    );
  } catch (e: any) {
    return new Response(`Error: ${e.message}`, { status: 500 });
  }
}
