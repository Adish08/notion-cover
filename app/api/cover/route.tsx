import { ImageResponse } from 'next/og';
import { Client } from '@notionhq/client';

export const runtime = 'edge';

const notion = new Client({ auth: process.env.NOTION_TOKEN });

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  
  // Notion-Specific Color Palette
  const isDark = searchParams.get('theme') !== 'light';
  const bgColor = isDark ? '#191919' : '#FFFFFF';
  const textColor = isDark ? '#FFFFFF' : '#37352F';
  const subTextColor = isDark ? 'rgba(255, 255, 255, 0.5)' : 'rgba(55, 53, 47, 0.6)';

  try {
    const response = await notion.databases.query({
      database_id: process.env.NOTION_DATABASE_ID!,
      page_size: 100,
    });

    const results = response.results;
    const randomEntry = results[Math.floor(Math.random() * results.length)] as any;
    
    // Fetching both Name (Quote) and Author from your DB
    const quote = randomEntry.properties.Name.title[0]?.plain_text || "Rarity earns respect.";
    const author = randomEntry.properties.Author?.rich_text[0]?.plain_text || "";

    return new ImageResponse(
      (
        <div style={{
          height: '100%', width: '100%', display: 'flex', flexDirection: 'column',
          alignItems: 'center', justifyContent: 'center', backgroundColor: bgColor,
          padding: '40px 100px', textAlign: 'center',
        }}>
          {/* Big H2 Style Quote */}
          <div style={{ 
            fontSize: 68, fontWeight: 700, color: textColor, 
            lineHeight: 1.1, marginBottom: author ? 30 : 0,
            letterSpacing: '-0.02em'
          }}>
            {quote}
          </div>
          
          {/* Subtle Author Text */}
          {author && (
            <div style={{ 
              fontSize: 28, fontWeight: 500, color: subTextColor 
            }}>
              — {author}
            </div>
          )}
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
  } catch (e: any) {
    return new Response(`Error: ${e.message}`, { status: 500 });
  }
}
