# Notion Cover Generator

A dynamic cover image generator that pulls quotes from a Notion database and renders them as beautiful, customizable OG images.

## Overview

This project generates Open Graph (OG) images on-the-fly by fetching random quotes from a Notion database. Perfect for creating dynamic social media previews, blog headers, or any use case where you need personalized cover images.

**Live Demo:** [https://notion-cover-zeta.vercel.app/api/cover?theme=dark&font=Space+Grotesk](https://notion-cover-zeta.vercel.app/api/cover?theme=dark&font=Space+Grotesk)

## Features

- 🎨 **Dynamic Image Generation** - Creates high-quality 3000x1200px images on demand
- 🌙 **Dark & Light Themes** - Support for both dark and light mode rendering
- 🔤 **Custom Fonts** - Use any Google Font or default to Space Grotesk
- 📚 **Notion Integration** - Pulls quotes directly from your Notion database
- ⚡ **Edge Runtime** - Ultra-fast responses using Next.js Edge Runtime
- 🎯 **Random Quotes** - Serves a random quote with each request
- 💾 **No Caching** - Fresh content on every request (configurable)

## Tech Stack

- **Next.js 14+** - React framework with API routes
- **TypeScript** - Type-safe development
- **Notion API** - Database integration
- **next/og** - Server-side image generation
- **Vercel** - Deployment platform

## Setup

### Prerequisites

- Node.js 18+
- A Notion account with database containing quotes
- Notion API token

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/Adish08/notion-cover.git
   cd notion-cover
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Create a `.env.local` file with your credentials:
   ```env
   NOTION_TOKEN=your_notion_api_token
   NOTION_DATABASE_ID=your_notion_database_id
   ```

### Notion Database Setup

Your Notion database should have at least these properties:
- **Name** (Title) - The quote text
- **Author** (Rich Text, optional) - The quote author

Example structure:
| Name | Author |
|------|--------|
| Rarity earns respect | Your Author |

## Usage

### Generate a Cover Image

Make a GET request to the API endpoint:

```
/api/cover?theme=dark&font=Space+Grotesk
```

### Query Parameters

- **theme** - `dark` (default) or `light` - Controls the color scheme
- **font** - Google Font name (default: `Space+Grotesk`) - Any font available on Google Fonts

### Examples

```
# Dark theme with default font
https://your-domain.com/api/cover?theme=dark

# Light theme with custom font
https://your-domain.com/api/cover?theme=light&font=Playfair+Display

# Custom font only
https://your-domain.com/api/cover?font=Roboto+Mono
```

## Development

Start the development server:

```bash
npm run dev
```

Visit `http://localhost:3000/api/cover` in your browser to test.

## Build & Deployment

Build for production:

```bash
npm run build
npm start
```

### Deploy to Vercel

The easiest way to deploy is to use [Vercel](https://vercel.com):

1. Push your repository to GitHub
2. Import the repository in Vercel
3. Add your environment variables (`NOTION_TOKEN`, `NOTION_DATABASE_ID`)
4. Deploy!

## License

MIT License - see [LICENSE](LICENSE) file for details

## Contributing

Contributions are welcome! Feel free to submit issues and pull requests.