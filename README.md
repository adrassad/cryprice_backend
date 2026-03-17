# AAVE Health Factor Bot

## 📑 Table of Contents

-   [Overview](#overview)
-   [Features](#features)
-   [System Architecture](#system-architecture)
-   [Core Services](#core-services)
-   [Notifications](#notifications)
-   [Internationalization](#internationalization)
-   [Public API](#public-api)
-   [Background Workers](#background-workers)
-   [Storage](#storage)
-   [Security](#security)
-   [Scalability](#scalability)
-   [License](#license)

------------------------------------------------------------------------

## 📌 Overview

A **Telegram bot and backend service** for monitoring **AAVE lending
positions and Health Factor risk** across multiple blockchain networks.

The system tracks user wallets, analyzes collateral and borrow
positions, calculates liquidation risk, and sends **Telegram
notifications** when a Health Factor approaches critical thresholds.

------------------------------------------------------------------------

## 🚀 Features

-   Monitor **AAVE lending positions**
-   Track **Health Factor** and liquidation risk
-   **Multi-network support** (Ethereum, Polygon, Arbitrum, Optimism)
-   Real-time **token price updates**
-   **Price change alerts (\>5%)**
-   **Quick asset lookup via ticker input (e.g. BTC, ETH)**
-   **Telegram notifications**
-   **PostgreSQL** persistent storage
-   **Redis** caching layer
-   **Background workers**
-   **Localization (EN / RU)**
-   Public **REST API**

------------------------------------------------------------------------

## 🧠 System Architecture

The architecture is designed for scalability and real-time monitoring of
DeFi positions across multiple networks.

``` mermaid
flowchart TB

subgraph USERS["Users"]
U1["Telegram User"]
U2["External API Client"]
end

subgraph ENTRY["Entry Layer"]
TG["Telegram Bot"]
API["REST API"]
end

subgraph BOT["Bot Layer"]
CMD["Command Handlers"]
SCENES["Scenes / User Flows"]
I18N["Localization"]
NOTIFY["Notification Service"]
end

subgraph DOMAIN["Domain Services"]
US["User Service"]
WS["Wallet Service"]
AS["Asset Service"]
NS["Network Service"]
PS["Price Service"]
POS["Positions Service"]
HF["HealthFactor Service"]
SUB["Subscription Service"]
end

subgraph BC["Blockchain Integration"]
ADAPTER["AAVE Adapter"]
ABI["ABI Registry"]
RPC["RPC Providers"]
CONTRACT["Smart Contract Calls"]
end

subgraph DATA["Data Layer"]
POSTGRES["PostgreSQL"]
REDIS["Redis"]
end

subgraph WORKERS["Background Workers"]
CRON1["Price Worker"]
CRON2["Assets Worker"]
CRON3["HealthFactor Worker"]
end

U1 --> TG
U2 --> API

TG --> CMD
CMD --> SCENES
CMD --> I18N
CMD --> NOTIFY

CMD --> WS
CMD --> POS
CMD --> HF

API --> US
API --> WS
API --> PS
API --> AS
API --> NS
API --> POS
API --> HF
API --> SUB

POS --> ADAPTER
HF --> ADAPTER

ADAPTER --> ABI
ADAPTER --> RPC
RPC --> CONTRACT

CONTRACT --> POSTGRES

US --> POSTGRES
WS --> POSTGRES
AS --> POSTGRES
NS --> POSTGRES
PS --> POSTGRES
SUB --> POSTGRES

PS --> REDIS
AS --> REDIS
HF --> REDIS

CRON1 --> PS
CRON2 --> AS
CRON3 --> HF

REDIS --> API
POSTGRES --> API
```

------------------------------------------------------------------------

## 🧩 Core Services

### Asset Service

-   Manage supported assets
-   Store metadata
-   Handle collateral parameters

### Price Service

-   Fetch and normalize prices
-   Cache in Redis
-   Detect price changes (\>5%)

### Network Service

-   Manage blockchain networks
-   Store RPC endpoints and chain IDs

### Wallet Service

-   Add/remove wallets
-   Validate format
-   Link to users

### User Service

-   Manage users
-   Store preferences and language

### Positions Service

-   Fetch AAVE reserves
-   Calculate collateral, debt, borrow capacity

### HealthFactor Service

-   Compute Health Factor
-   Detect liquidation risk
-   Normalize across networks

### Subscription Service

-   Manage plans (Free / Pro)
-   Wallet & notification limits
-   Feature gating

------------------------------------------------------------------------

## 🔔 Notifications

-   Health Factor alerts
-   Price change alerts (\>5%)

------------------------------------------------------------------------

## 🌍 Internationalization

-   English
-   Russian

Language is auto-detected from Telegram.

------------------------------------------------------------------------

## 🔌 Public API

### Health

GET /health

### Assets

GET /assets

### Prices

GET /prices

### Networks

GET /networks

------------------------------------------------------------------------

## ⚙️ Background Workers

-   Price Worker
-   Assets Worker
-   Health Factor Worker

------------------------------------------------------------------------

## 🗄 Storage

### PostgreSQL

-   users
-   wallets
-   assets
-   positions
-   subscriptions

### Redis

-   price caching
-   fast reads

------------------------------------------------------------------------

## 🔐 Security

-   No private keys stored
-   Read-only wallet tracking
-   Input validation
-   Sensitive data not exposed

------------------------------------------------------------------------

## 📈 Scalability

-   Stateless API
-   Horizontal scaling via workers
-   Redis caching layer

------------------------------------------------------------------------

## 📜 License

MIT
