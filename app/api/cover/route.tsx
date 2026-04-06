import { ImageResponse } from 'next/og';
import { Client } from '@notionhq/client';

export const runtime = 'edge';

const notion = new Client({ auth: process.env.NOTION_TOKEN });

// Robust font fetcher with error handling
async function getFontData(fontParam: string) {
  try {
    const url = `https://fonts.googleapis.com/css2?family=${fontParam.replace(/ /g, '+')}:wght@700`;
    const css = await (await fetch(url)).text();
    const resource = css.match(/src: url\((.+)\) format\('(opentype|truetype)'\)/);
    const fontUrl = resource ? resource[1] : css.match(/src: url\((.+)\)/)?.[1];
    
    if (!fontUrl) return null;
    
    const res = await fetch(fontUrl);
    if (!res.ok) return null;
    return await res.arrayBuffer();
  } catch (e) {
    console.error("Font fetch failed", e);
    return null;
  }
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const isDark = searchParams.get('theme') !== 'light';
  const fontParam = searchParams.get('font') || 'Space Grotesk';
  
  const bgColor = isDark ? '#191919' : '#FFFFFF';
  const textColor = isDark ? '#FFFFFF' : '#37352F';
  const subTextColor = isDark ? 'rgba(255, 255, 255, 0.5)' : 'rgba(55, 53, 47, 0.6)';

  try {
    // PARALLEL EXECUTION: Fetch font and Notion data at the same time
    const [fontData, response] = await Promise.all([
      getFontData(fontParam),
      notion.databases.query({
        database_id: process.env.NOTION_DATABASE_ID!,
        page_size: 100,
      })
    ]);

    const results = response.results;
    if (!results || results.length === 0) throw new Error("No entries found in database.");
    
    const randomEntry = results[Math.floor(Math.random() * results.length)] as any;
    const quote = randomEntry.properties.Name.title[0]?.plain_text || "Rarity earns respect.";
    const author = randomEntry.properties.Author?.rich_text[0]?.plain_text || "";

    return new ImageResponse(
      (
        <div style={{
          height: '100%', width: '100%', display: 'flex', flexDirection: 'column',
          alignItems: 'center', justifyContent: 'center', backgroundColor: bgColor,
          padding: '120px 240px', textAlign: 'center',
          fontFamily: fontData ? 'CustomFont' : 'sans-serif', // Fallback to sans-serif if font fails
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
        fonts: fontData ? [
          {
            name: 'CustomFont',
            data: fontData,
            style: 'normal',
          },
        ] : [],
        headers: {
          'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
        },
      }
    );
  } catch (e: any) {
    // Returns the actual error message to the screen for easier debugging
    return new Response(`Execution Error: ${e.message}`, { status: 500 });
  }
}
