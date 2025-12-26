# README Stats Generator 🚀

A production-ready, visually stunning web application for generating customizable GitHub profile stats cards with live preview, extensive customization options, and optimized caching.

![README Stats Generator](https://img.shields.io/badge/Next.js-16-black?style=for-the-badge&logo=next.js)
![TypeScript](https://img.shields.io/badge/TypeScript-5-blue?style=for-the-badge&logo=typescript)
![Tailwind CSS](https://img.shields.io/badge/Tailwind-4-38bdf8?style=for-the-badge&logo=tailwind-css)

## ✨ Features

- 🎨 **6 Beautiful Themes**: Dark, Light, Glass, Neon, GitHub, Cyberpunk
- ⚡ **Lightning Fast**: 3-layer caching (API → SVG → CDN)
- 📊 **7 Card Types**: Profile, Repositories, Commits, Streak, Languages, Skills, Trophies
- 🎯 **Live Preview**: Real-time SVG rendering as you customize
- 🔧 **Highly Customizable**: Themes, colors, layouts, and more
- 📱 **Responsive Design**: Works on desktop, tablet, and mobile
- 🚀 **Production Ready**: Built for scale with edge optimization

## 🚀 Quick Start

### Prerequisites

- Node.js 18+
- npm or yarn
- GitHub Personal Access Token (optional, for higher rate limits)

### Installation

1. **Clone the repository**

   ```bash
   git clone <your-repo-url>
   cd readme_stats
   ```

2. **Install dependencies**

   ```bash
   npm install
   ```

3. **Set up environment variables**

   ```bash
   cp .env.example .env.local
   ```

   Edit `.env.local` and add your GitHub token:

   ```env
   GITHUB_TOKEN=your_github_personal_access_token
   NEXT_PUBLIC_APP_URL=http://localhost:3000
   ```

4. **Run the development server**

   ```bash
   npm run dev
   ```

5. **Open your browser**
   Navigate to [http://localhost:3000](http://localhost:3000)

## 📖 Usage

### Using the Builder

1. Go to `/builder` page
2. Enter a GitHub username
3. Select your preferred theme
4. Choose which cards to display
5. Select layout (grid, row, or column)
6. Copy the generated Markdown or HTML code
7. Paste into your README!

### Direct API Usage

Generate stats cards directly via URL:

```markdown
![GitHub Stats](https://your-domain.com/api/generate?user=USERNAME&theme=dark&cards=profile,repositories,commits,streak&layout=grid)
```

#### API Parameters

| Parameter         | Type   | Default                               | Description                                              |
| ----------------- | ------ | ------------------------------------- | -------------------------------------------------------- |
| `user`            | string | **required**                          | GitHub username                                          |
| `theme`           | string | `dark`                                | Theme name (dark, light, glass, neon, github, cyberpunk) |
| `cards`           | string | `profile,repositories,commits,streak` | Comma-separated card types                               |
| `layout`          | string | `grid`                                | Layout type (grid, row, column)                          |
| `primaryColor`    | string | -                                     | Custom primary color (hex)                               |
| `secondaryColor`  | string | -                                     | Custom secondary color (hex)                             |
| `backgroundColor` | string | -                                     | Custom background color (hex)                            |
| `fontFamily`      | string | -                                     | Custom font family                                       |
| `borderRadius`    | number | -                                     | Border radius in pixels                                  |
| `cardSize`        | string | `medium`                              | Card size (small, medium, large)                         |

### Available Cards

- `profile` - Profile stats (followers, following, repos, gists)
- `repositories` - Repository statistics (total repos, stars, forks)
- `commits` - Commit activity (last 12 months)
- `streak` - Contribution streak (current, longest, total)
- `languages` - Top programming languages with percentages
- `skills` - Technology skills icons
- `trophies` - Achievements and milestones

## 🏗️ Architecture

### Tech Stack

- **Framework**: Next.js 16 (App Router)
- **Language**: TypeScript 5
- **Styling**: Tailwind CSS 4 + shadcn/ui
- **Animation**: Framer Motion
- **GitHub API**: Octokit (REST + GraphQL)
- **Deployment**: Vercel (optimized for Edge Functions)

### Project Structure

```
readme_stats/
├── app/
│   ├── api/
│   │   ├── github/route.ts      # GitHub data fetching
│   │   └── generate/route.ts    # SVG generation
│   ├── builder/page.tsx         # Builder interface
│   ├── page.tsx                 # Landing page
│   ├── layout.tsx               # Root layout
│   └── globals.css              # Global styles
├── lib/
│   ├── github/
│   │   ├── client.ts            # GitHub API client
│   │   ├── fetchers.ts          # Data fetching functions
│   │   └── types.ts             # TypeScript types
│   └── svg/
│       ├── builder.ts           # SVG builder utility
│       ├── themes.ts            # Theme definitions
│       ├── layout.ts            # Layout engine
│       ├── index.ts             # Main orchestrator
│       └── cards/               # Card components
│           ├── profile-stats.ts
│           ├── repositories.ts
│           ├── commits.ts
│           ├── streak.ts
│           ├── languages.ts
│           ├── skills.ts
│           └── trophies.ts
└── components/
    └── ui/                      # shadcn/ui components
```

### Caching Strategy

**3-Layer Caching:**

1. **GitHub API Cache** (1 hour TTL)

   - Caches raw GitHub API responses
   - Reduces API calls and protects against rate limits

2. **SVG Output Cache** (24 hours TTL)

   - Caches generated SVG by configuration hash
   - Instant response for repeated requests

3. **CDN Edge Cache** (24 hours)
   - Vercel Edge Network caches at edge locations
   - Global distribution with minimal latency

## 🔧 Development

### Build for Production

```bash
npm run build
npm start
```

### Linting

```bash
npm run lint
```

### Type Checking

```bash
npx tsc --noEmit
```

## 🚀 Deployment

### Deploy to Vercel

1. Push your code to GitHub
2. Import project in Vercel
3. Add environment variables:
   - `GITHUB_TOKEN`
   - `NEXT_PUBLIC_APP_URL`
4. Deploy!

### Environment Variables

| Variable              | Description                  | Required    |
| --------------------- | ---------------------------- | ----------- |
| `GITHUB_TOKEN`        | GitHub Personal Access Token | Recommended |
| `NEXT_PUBLIC_APP_URL` | Your deployed URL            | Yes         |

## 📊 Performance

- **Initial Load**: < 1s
- **SVG Generation**: < 500ms (cached: < 50ms)
- **GitHub API**: Rate limit aware (5,000 req/hr with token)
- **Edge Cached**: Served from nearest location globally

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📝 License

MIT License - feel free to use this project for personal or commercial purposes.

## 🙏 Acknowledgments

- Built with [Next.js](https://nextjs.org/)
- UI components from [shadcn/ui](https://ui.shadcn.com/)
- Styled with [Tailwind CSS](https://tailwindcss.com/)
- GitHub data via [Octokit](https://github.com/octokit)

---

**Made with ❤️ for the developer community**
