# Acquisitions

A Node.js application using Express, Neon Database, and Drizzle ORM.

## Prerequisites

- Docker
- Docker Compose
- Node.js 20+ (for local development without Docker)

## Quick Start

### Development (with Neon Local)

The development environment uses **Neon Local** running in Docker, which provides an ephemeral PostgreSQL database that automatically creates branches for testing.

1. **Clone the repository:**

   ```bash
   git clone https://github.com/PatrickC995/acquisitions.git
   cd acquisitions
   ```

2. **Copy the development environment file:**

   ```bash
   cp .env.example .env.development
   ```

   The `.env.development` file already contains the Neon Local connection string:

   ```
   DATABASE_URL=postgres://appuser:appuser@neon-local:5432/acquisitions
   ```

3. **Start the development environment:**

   ```bash
   docker-compose -f docker-compose.dev.yml up --build
   ```

   This will:
   - Start the Neon Local container with automatic branch creation
   - Build and start your application container
   - Connect your app to the Neon Local database

4. **Access the application:**
   - API: http://localhost:3000
   - Database: Accessible at `localhost:5432` (from host) or `neon-local:5432` (from other containers)

5. **Run database migrations:**

   ```bash
   # Exec into the running app container
   docker exec -it acquisitions-app npm run db:migrate
   ```

6. **Stop the development environment:**

   ```bash
   docker-compose -f docker-compose.dev.yml down
   ```

7. **Clean up (optional):**
   ```bash
   docker-compose -f docker-compose.dev.yml down -v
   ```

### Production (with Neon Cloud)

The production environment connects directly to your **Neon Cloud Database**.

1. **Get your Neon Cloud Database URL:**
   - Go to [Neon Console](https://console.neon.tech/)
   - Select your project
   - Copy the connection string (includes SSL)
   - Format: `postgres://user:password@ep-cool-name-123456.us-east-2.aws.neon.tech/dbname?sslmode=require`

2. **Configure production environment:**

   ```bash
   cp .env.example .env.production
   ```

   Edit `.env.production` and set:

   ```
   DATABASE_URL=your_neon_cloud_connection_string
   JWT_SECRET=your_strong_production_secret
   ARCJET_KEY=your_arcjet_key
   ```

3. **Build and run in production:**

   ```bash
   docker-compose -f docker-compose.prod.yml build
   docker-compose -f docker-compose.prod.yml up -d
   ```

4. **Access the production application:**
   - API: http://localhost:3000

5. **Stop production:**
   ```bash
   docker-compose -f docker-compose.prod.yml down
   ```

## Environment Variables

### Development (`.env.development`)

| Variable       | Description           | Default                                                   |
| -------------- | --------------------- | --------------------------------------------------------- |
| `NODE_ENV`     | Environment mode      | `development`                                             |
| `PORT`         | Application port      | `3000`                                                    |
| `DATABASE_URL` | Neon Local connection | `postgres://appuser:appuser@neon-local:5432/acquisitions` |
| `JWT_SECRET`   | JWT signing secret    | (random dev value)                                        |
| `LOG_LEVEL`    | Logging level         | `debug`                                                   |

### Production (`.env.production`)

| Variable       | Description           | Required     |
| -------------- | --------------------- | ------------ |
| `NODE_ENV`     | Environment mode      | `production` |
| `PORT`         | Application port      | `3000`       |
| `DATABASE_URL` | Neon Cloud connection | **Yes**      |
| `JWT_SECRET`   | JWT signing secret    | **Yes**      |
| `ARCJET_KEY`   | ArcJet security key   | Optional     |
| `LOG_LEVEL`    | Logging level         | `info`       |

## Database Setup

### Neon Local (Development)

Neon Local is automatically configured in `docker-compose.dev.yml`:

- **Image:** `neondatabase/neon-local:latest`
- **Database:** `acquisitions`
- **Owner:** `appuser`
- **Password:** `appuser`
- **Port:** `5432`
- **Auto-branch:** Enabled for ephemeral testing

The database persists data in a Docker volume (`neon-local-data`) between container restarts.

### Neon Cloud (Production)

1. Create a database in [Neon Console](https://console.neon.tech/)
2. Copy the connection string
3. Add `?sslmode=require` to the connection string
4. Set in `.env.production`

## Docker Files

### `Dockerfile`

Multi-stage build for production:

- Uses `node:20-alpine` for minimal image size
- Copies package files and installs production dependencies
- Copies source code
- Exposes port 3000
- Health check on `/health` endpoint

### `docker-compose.dev.yml`

Development configuration:

- **Neon Local:** Database service with auto-branch enabled
- **App:** Application with live reload, connected to Neon Local
- **Network:** Shared bridge network for inter-container communication

### `docker-compose.prod.yml`

Production configuration:

- **App:** Production-ready container with health checks
- **Restart:** Auto-restart on failure
- **Network:** Isolated bridge network

## Local Development (Without Docker)

If you prefer to run the app locally without Docker:

1. **Start Neon Local separately:**

   ```bash
   docker run -d --name neon-local -p 5432:5432 \
     -e NEON_DATABASE_NAME=acquisitions \
     -e NEON_DATABASE_OWNER=appuser \
     -e NEON_DATABASE_OWNER_PASSWORD=appuser \
     -e NEON_AUTO_BRANCH=true \
     -v neon-local-data:/var/lib/neon \
     neondatabase/neon-local:latest
   ```

2. **Install dependencies:**

   ```bash
   npm install
   ```

3. **Create `.env.development`:**

   ```
   DATABASE_URL=postgres://appuser:appuser@localhost:5432/acquisitions
   JWT_SECRET=dev_secret
   ```

4. **Run the app:**
   ```bash
   npm run dev
   ```

## Database Migrations

### Generate Migrations

```bash
npm run db:generate
```

### Apply Migrations

```bash
npm run db:migrate
```

### Drizzle Studio (GUI)

```bash
npm run db:studio
```

## Health Check

The application includes a health check endpoint:

- **URL:** `GET /health`
- **Response:** `{ "status": "ok" }`

## Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                      Development (Docker)                       │
├─────────────────┬───────────────────────────────────────────┤
│  Neon Local      │  Application                              │
│  Container       │  Container                                │
│                  │                                           │
│  postgres://...   │  node src/index.js                       │
│  neon-local:5432 │  PORT=3000                                │
└─────────────────┴───────────────────────────────────────────┘
                                    │
                                    ▼
┌─────────────────────────────────────────────────────────────┐
│                      Production (Docker)                        │
├─────────────────────────────────────────────────────────────┤
│  Application Container                                             │
│                                                                  │
│  node src/index.js                                                │
│  DATABASE_URL=postgres://...neon.tech...                        │
│  PORT=3000                                                       │
└─────────────────────────────────────────────────────────────┘
```

## Troubleshooting

### Neon Local Connection Issues

```bash
# Check if Neon Local is running
curl -I http://localhost:5432

# Test database connection
psql postgresql://appuser:appuser@localhost:5432/acquisitions
```

### Docker Compose Issues

```bash
# View logs
docker-compose -f docker-compose.dev.yml logs -f

# Check container status
docker-compose -f docker-compose.dev.yml ps

# Rebuild containers
docker-compose -f docker-compose.dev.yml build --no-cache
```

### Database Migration Issues

```bash
# Check migration status
ls -la drizzle/

# Reset migrations (careful!)
rm -rf drizzle/
npm run db:generate
npm run db:migrate
```

## Resources

- [Neon Local Documentation](https://neon.com/docs/local/neon-local)
- [Neon Database](https://neon.tech/)
- [Drizzle ORM](https://orm.drizzle.team/)
- [Express.js](https://expressjs.com/)

## License

ISC
