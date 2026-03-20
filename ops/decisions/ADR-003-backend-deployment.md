# Backend Deployment Guide

Date: 2026-03-20
Author: Backend Engineer
Related: TASK-006 (Deployment Strategy)

## Backend Readiness Summary

### Build Configuration

Current setup uses `output: 'standalone'` in `next.config.js`:
- Produces optimized server bundle in `.next/standalone/`
- Includes minimal `node_modules` subset
- Server entry point: `server.js`

### Data Layer Architecture

**Key Challenge**: Data files reside outside web/ directory at `../data/`

**Solution Implemented** (`web/lib/data/paths.ts`):
1. Environment variable override: `DATA_DIR` can specify custom path
2. Runtime resolution checks multiple locations:
   - Project root: `../data` (development mode)
   - Standalone output: `./data` (copied during deployment)
   - Custom path via env var

### Environment Variables

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| `DATA_DIR` | No | Auto-detected | Path to CSV data directory |
| `NODE_ENV` | No | `production` | Runtime environment |

### Deployment Requirements

#### Data Files
The following CSVs must be accessible at runtime:
- `player_statistics.csv`
- `civilization_statistics.csv`
- `map_statistics.csv`
- `ttl_s5_matches.csv`
- `matches.csv` (standings)
- `player_civs.csv`
- `map_outcomes.csv`
- `civ_drafts.csv`
- `map_results.csv`
- `players.csv`
- `tournament_info.json`

#### Deployment Strategies

**Option 1: Copy data to standalone output**
```bash
# After build
cp -r ../data .next/standalone/
# Deploy .next/standalone/ directory
```

**Option 2: Mount data volume**
```bash
# Set env var to mounted data location
DATA_DIR=/app/data node server.js
```

**Option 3: Docker volume mount**
```dockerfile
# In Dockerfile, copy data alongside standalone
COPY --from=builder /app/data /app/data
ENV DATA_DIR=/app/data
```

### API Routes Status

All API routes verified working:
- `GET /api/players/[name]` - Player profile data
- `GET /api/civs/matchups` - Civilization matchup matrix
- `GET /api/maps/breakdowns` - All map breakdowns
- `GET /api/maps/[name]/breakdown` - Specific map breakdown

### Build Verification

```bash
cd web/
npm run build
# Expected: 0 errors, 11 static pages generated
# Bundle size: ~87-96 kB per page
```

### Runtime Dependencies

Production dependencies (from package.json):
- next: 14.2.28
- react: ^18.3.1
- react-dom: ^18.3.1
- zod: ^4.3.6

### Security Considerations

1. Data files are read-only - never written to by web app
2. All inputs validated with Zod schemas
3. File paths resolved safely with path.join
4. No secrets or credentials in data files

### Monitoring Endpoints

Health check endpoint available at:
- `/test-data` - Renders sample data to verify data layer connectivity

## Next Steps for Full-Stack Architect

1. Choose deployment target (Vercel, Cloudflare, self-hosted)
2. Configure data directory strategy based on target
3. Set up CI/CD pipeline to copy data files during build
4. Document final deployment runbook in ops/decisions/

## Backend Sign-off

[x] All adapters tested and working
[x] API routes compile without errors
[x] Build produces standalone output
[x] Data path resolution handles multiple deployment scenarios
[x] Environment variable configuration ready
[x] No backend blockers for deployment
