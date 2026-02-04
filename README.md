# Rate Media

A movie and TV show rating website that provides content analysis from different ideological perspectives.

## Features

- **Perspective Slider (0-10)**: Choose your viewing perspective from progressive (0) to traditional/conservative (10)
- **AI-Powered Analysis**: Uses Claude AI with web search to find and analyze content
- **Unique Report URLs**: Each analysis gets a unique URL with the perspective level and title
- **Dark Theme UI**: Monospace, terminal-inspired design

## How It Works

1. Select your perspective level (0-10)
   - **0-4**: Progressive/Liberal (focuses on inclusivity, diversity, LGBTQ+ representation)
   - **5-6**: Balanced/Neutral (mainstream perspective)
   - **7-10**: Traditional/Conservative (focuses on family values, moral content)

2. Enter a movie or TV show title

3. Get a detailed analysis including:
   - Content summary from your perspective
   - Rating (1-10)
   - Content concerns with severity levels
   - Positive aspects
   - Source links

## URL Structure

Reports are available at:
```
/report/[slug]?level=[0-10]
```

Example: `/report/the-matrix?level=8`

## Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **AI**: Claude API with web search
- **Deployment**: Vercel

## Development

```bash
# Install dependencies
npm install

# Set up environment variables
cp .env.local.example .env.local
# Add your ANTHROPIC_API_KEY

# Run development server
npm run dev
```

## Environment Variables

| Variable | Description |
|----------|-------------|
| `ANTHROPIC_API_KEY` | Your Anthropic API key for Claude |

## Deployment

Deploy to Vercel:

1. Connect your GitHub repository to Vercel
2. Add the `ANTHROPIC_API_KEY` environment variable in Vercel settings
3. Deploy from the `claude/movie-rating-ideology-filter-dkD1A` branch
