import { ImageResponse } from 'next/og';
import { Client } from '@notionhq/client';

export const runtime = 'edge';

const notion = new Client({ auth: process.env.NOTION_TOKEN });

// Direct link to Space Grotesk Bold to save a network round-trip
const FONT_URL = 'https://fonts.gstatic.com/s/spacegrotesk/v15/V8mDoQDj3H3ovn-p7tRJqHcETAyO2G1l87e0i7T8S2nS.ttf';

async function getFont(fontParam: string) {
  // If user wants default, use the direct high-speed link
  if (fontParam === 'Space Grotesk') {
    return fetch(new URL(FONT_URL)).then((res) => res.arrayBuffer());
  }
  // Otherwise, fallback to the slower Google CSS search
  const url = `https://fonts.googleapis.com/css2?family=${fontParam.replace(/ /g, '+')}:wght@700`;
  const css = await (await fetch(url)).text();
  const resource = css.match(/src: url\((.+)\) format\('(opentype|truetype)'\)/);
  const fontUrl = resource ? resource[1] : css.match(/src: url\((.+)\)/)?.[1];
  if (!fontUrl) throw new Error('Font not found');
  return fetch(fontUrl).then((res) => res.arrayBuffer());
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const isDark = searchParams.get('theme') !== 'light';
  const fontParam = searchParams.get('font') || 'Space Grotesk';
  
  const bgColor = isDark ? '#191919' : '#FFFFFF';
  const textColor = isDark ? '#FFFFFF' : '#37352F';
  const subTextColor = isDark ? 'rgba(255, 255, 255, 0.5)' : 'rgba(55, 53, 47, 0.6)';

  try {
    // TUNNEL: Start both fetches at the exact same time
    const [fontData, response] = await Promise.all([
      getFont(fontParam),
      notion.databases.query({
        database_id: process.env.NOTION_DATABASE_ID!,
        page_size: 100,
      })
    ]);

    const results = response.results;
    const randomEntry = results[Math.floor(Math.random() * results.length)] as any;
    const quote = randomEntry.properties.Name.title[0]?.plain_text || "Rarity earns respect.";
    const author = randomEntry.properties.Author?.rich_text[0]?.plain_text || "";

    return new ImageResponse(
      (
        <div style={{
          height: '100%', width: '100%', display: 'flex', flexDirection: 'column',
          alignItems: 'center', justifyContent: 'center', backgroundColor: bgColor,
          padding: '120px 240px', textAlign: 'center', fontFamily: 'CustomFont',
        }}>
          <div style={{ 
            fontSize: 144, fontWeight: 700, color: textColor, 
            lineHeight: 1.1, marginBottom: author ? 60 : 0, letterSpacing: '-0.03em'
          }}>
            {quote}
          </div>
          {author && (
            <div style={{ fontSize: 64, fontWeight: 500, color: subTextColor }}>
              — {author}
            </div>
          )}
        </div>
      ),
      {
        width: 3000, height: 1200,
        fonts: [{ name: 'CustomFont', data: fontData, style: 'normal' }],
        headers: { 'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate' },
      }
    );
  } catch (e: any) {
    return new Response(`Error: ${e.message}`, { status: 500 });
  }
}
