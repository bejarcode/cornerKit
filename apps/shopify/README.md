# cornerKit Shopify App

Shopify embedded app for applying iOS-style squircle corners to Shopify storefronts.

## Quick Start

### Prerequisites

- Node.js 20+
- npm 10+
- A [Shopify Partner account](https://partners.shopify.com/)
- A development store

### Setup

1. **Clone and install dependencies:**
   ```bash
   cd apps/shopify
   npm install
   ```

2. **Set up environment:**
   ```bash
   cp .env.example .env
   ```

3. **Configure Shopify app:**

   Create a new app in the [Shopify Partners Dashboard](https://partners.shopify.com/):
   - Go to Apps > Create app
   - Choose "Create app manually"
   - Note your API key and API secret

4. **Update configuration:**

   Edit `.env` with your credentials:
   ```env
   SHOPIFY_API_KEY=your_api_key
   SHOPIFY_API_SECRET=your_api_secret
   ```

5. **Start development:**
   ```bash
   npm run dev
   ```

   This will:
   - Start the Remix development server
   - Create a tunnel for Shopify to reach your local server
   - Open the app in your development store

## Project Structure

```
apps/shopify/
├── app/
│   ├── routes/
│   │   ├── _index.tsx          # Root redirect
│   │   ├── app.tsx             # App layout with App Bridge
│   │   ├── app._index.tsx      # Dashboard route
│   │   ├── auth.login.tsx      # OAuth initiation
│   │   └── auth.$.tsx          # OAuth callback
│   ├── components/
│   │   ├── Dashboard.tsx       # Main dashboard UI
│   │   ├── LoadingState.tsx    # Loading skeletons
│   │   └── ErrorBoundary.tsx   # Error displays
│   ├── lib/
│   │   ├── shopify.server.ts   # Shopify app config
│   │   ├── db.server.ts        # Prisma client
│   │   └── session.server.ts   # Session utilities
│   └── styles/
│       └── app.css             # Custom styles
├── prisma/
│   └── schema.prisma           # Database schema
├── extensions/
│   └── theme-extension/        # Theme App Extension (Feature 007)
└── shopify.app.toml            # App manifest
```

## Available Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start development with Shopify CLI |
| `npm run build` | Build for production |
| `npm run type-check` | Run TypeScript type checking |
| `npm test` | Run tests |
| `npm run setup` | Generate Prisma client and run migrations |

## Environment Variables

| Variable | Required | Description |
|----------|----------|-------------|
| `SHOPIFY_API_KEY` | Yes | App API key from Partners Dashboard |
| `SHOPIFY_API_SECRET` | Yes | App API secret from Partners Dashboard |
| `SCOPES` | Yes | OAuth scopes (default: `read_themes,write_themes`) |
| `DATABASE_URL` | Yes | Database connection string |
| `SHOPIFY_APP_URL` | No | App URL (auto-set by Shopify CLI in dev) |

## Database

### Development (SQLite)
```env
DATABASE_URL="file:./dev.db"
```

### Production (PostgreSQL)
```env
DATABASE_URL="postgresql://user:password@host:5432/database"
```

### Migrations

```bash
# Create a migration
npx prisma migrate dev --name migration_name

# Apply migrations in production
npx prisma migrate deploy

# Reset database (development only)
npx prisma migrate reset
```

## Tech Stack

- **Framework**: Remix 2.x
- **UI**: Shopify Polaris v13
- **Embedded**: App Bridge React v4
- **Auth**: @shopify/shopify-app-remix
- **Database**: Prisma ORM (SQLite/PostgreSQL)
- **Language**: TypeScript (strict mode)

## Deployment

### Fly.io (Recommended)

1. Install Fly CLI: `brew install flyctl`
2. Login: `fly auth login`
3. Create app: `fly launch`
4. Set secrets:
   ```bash
   fly secrets set SHOPIFY_API_KEY=your_key
   fly secrets set SHOPIFY_API_SECRET=your_secret
   fly secrets set SCOPES=read_themes,write_themes
   ```
5. Deploy: `fly deploy`

### Other Platforms

See [Shopify deployment docs](https://shopify.dev/docs/apps/deployment) for Heroku, Railway, Render, etc.

## Troubleshooting

### Common Issues

| Issue | Solution |
|-------|----------|
| "Invalid API key" | Check `SHOPIFY_API_KEY` in `.env` matches Partners Dashboard |
| "App blocked by CSP" | Ensure app URL in Partners Dashboard matches `SHOPIFY_APP_URL` |
| OAuth redirect loop | Clear browser cookies, check `authPathPrefix` matches route structure |
| Prisma client error | Run `npm run setup` to regenerate Prisma client |
| "Session not found" | Run `npx prisma migrate reset` to clear stale sessions |

### Debug Mode

Enable verbose logging:
```bash
DEBUG=shopify:* npm run dev
```

### Resetting Development

```bash
# Reset database and reinstall
npx prisma migrate reset
npm run dev
```

## Learn More

- [Shopify App Development](https://shopify.dev/docs/apps)
- [Remix Documentation](https://remix.run/docs)
- [Polaris Components](https://polaris.shopify.com/)
- [cornerKit Documentation](https://github.com/bejarcode/cornerKit)
