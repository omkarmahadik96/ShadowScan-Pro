# ShadowScan Pro — Architecture Documentation

## System Flow
1. **Scheduler** triggers **Source Workers** (HIBP, Tor Forum, etc.)
2. **Workers** fetch raw data and pass to **Monitoring Engine**
3. **Monitoring Engine** performs:
   - **Classification** (Regex/NLP)
   - **Normalization** (Entity Extraction)
   - **Deduplication** (SHA-256)
   - **Severity Scoring** (Mathematical Formula)
4. **Intelligence Services** link findings via **Entity Resolver** (Graph)
5. **Alert Engine** evaluates findings against **Alert Rules**
6. **Notifiers** dispatch alerts via Socket.io, Email, or Slack
7. **Frontend** displays real-time telemetry via **WebSocket**

## Data Pipeline
Raw Data -> Normalized Finding -> Scored Incident -> Alert Notification -> UI Update

## Tech Stack
- **Backend**: Node.js, Express, Socket.io, Prisma, PostgreSQL, Redis, Elasticsearch
- **Frontend**: React, Zustand, Recharts, D3.js, Lucide Icons
- **Infrastructure**: Docker, Nginx, Tor Proxy
