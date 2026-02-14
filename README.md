# @makebelieve21213-packages/coingecko-client

CoinGecko API клиент для NestJS с поддержкой TypeScript и полной типобезопасностью.

## 📋 Содержание

- [Возможности](#-возможности)
- [Требования](#-требования)
- [Установка](#-установка)
- [Структура пакета](#-структура-пакета)
- [Быстрый старт](#-быстрый-старт)
- [API Reference](#-api-reference)
- [Примеры использования](#-примеры-использования)
- [Troubleshooting](#-troubleshooting)
- [Тестирование](#-тестирование)

## 🚀 Возможности

- ✅ **NestJS интеграция** - глобальный модуль с forRootAsync для простой интеграции
- ✅ **Type-safe API** - полная типобезопасность TypeScript с экспортируемыми типами
- ✅ **HTTP клиент** - использование нативного fetch API с поддержкой таймаутов
- ✅ **Конфигурация** - поддержка API ключа через ConfigModule (опционально для Pro API)
- ✅ **Трансформация данных** - автоматическое преобразование snake_case → camelCase
- ✅ **Обработка ошибок** - детальная обработка ошибок API с логированием
- ✅ **100% покрытие тестами** - надежность и качество кода

## 📋 Требования

- **Node.js**: >= 22.11.0
- **NestJS**: >= 11.0.0

## 📦 Установка

```bash
npm install @makebelieve21213-packages/coingecko-client
```

### Зависимости

```json
{
  "@nestjs/common": "^11.0.0",
  "@nestjs/config": "^11.0.0",
  "@makebelieve21213-packages/logger": "^1.0.0",
  "reflect-metadata": "^0.1.13 || ^0.2.0"
}
```

## 📁 Структура пакета

```
src/
├── main/                    # NestJS модуль
├── core/                    # HTTP клиент
├── types/                   # TypeScript типы
├── utils/                   # Утилиты
├── errors/                  # Кастомные ошибки
└── index.ts                 # Экспорты
```

## 🏗️ Архитектура

Пакет предоставляет NestJS глобальный модуль `CoinGeckoModule` для работы с CoinGecko API через HTTP запросы.

**Основные компоненты:**
- `CoinGeckoModule` - NestJS глобальный модуль
- `CoinGeckoService` - сервис для работы с API
- `CoinGeckoModuleOptions` - конфигурация клиента
- Типы: `CryptoPrice`, `PriceBySymbolResult`, `CryptoDetails`, `CryptoHistoricalData`, `CryptoSearchResult`, `TrendingCrypto`, `CryptoMarketData`

## 🔧 Быстрый старт

### Шаг 1: Настройка переменных окружения

```env
COINGECKO_API_KEY=your-api-key-here  # Опционально для Pro API
COINGECKO_BASE_URL=https://api.coingecko.com/api/v3  # Опционально
COINGECKO_TIMEOUT=30000  # Опционально
```

### Шаг 2: Создание конфигурации

Создайте файл `coingecko.config.ts` в вашем сервисе:

```typescript
import { registerAs } from "@nestjs/config";
import type { CoinGeckoModuleOptions } from "@makebelieve21213-packages/coingecko-client";
import { EnvVariable } from "src/types/enums";

export type CoinGeckoConfiguration = CoinGeckoModuleOptions;

const coingeckoConfig = registerAs<CoinGeckoConfiguration>(
  "coingecko",
  (): CoinGeckoConfiguration => ({
    apiKey: process.env[EnvVariable.COINGECKO_API_KEY],
    baseUrl: process.env[EnvVariable.COINGECKO_BASE_URL] || "https://api.coingecko.com/api/v3",
    timeout: Number(process.env[EnvVariable.COINGECKO_TIMEOUT]) || 30000,
  }),
);

export default coingeckoConfig;
```

### Шаг 3: Регистрация модуля

```typescript
// app.module.ts
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { CoinGeckoModule } from '@makebelieve21213-packages/coingecko-client';
import coingeckoConfig from 'src/configs/coingecko.config';
import type { CoinGeckoConfiguration } from 'src/configs/coingecko.config';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [coingeckoConfig],
    }),
    CoinGeckoModule.forRootAsync<[CoinGeckoConfiguration]>({
      useFactory: (config: CoinGeckoConfiguration) => config,
      inject: [coingeckoConfig.KEY],
      imports: [ConfigModule],
    }),
  ],
})
export class AppModule {}
```

### Шаг 4: Использование сервиса

```typescript
// crypto-data.service.ts
import { Injectable } from '@nestjs/common';
import { CoinGeckoService } from '@makebelieve21213-packages/coingecko-client';
import type { CryptoPrice } from '@makebelieve21213-packages/coingecko-client';

@Injectable()
export class CryptoDataService {
  constructor(private readonly coingecko: CoinGeckoService) {}

  async getTopCryptoAssets(limit: number = 100): Promise<CryptoPrice[]> {
    return await this.coingecko.getMarketData({ perPage: limit });
  }
}
```

## 📚 API Reference

### CoinGeckoModule

**forRootAsync(options):**

```typescript
CoinGeckoModule.forRootAsync<[CoinGeckoConfiguration]>({
  useFactory: (config: CoinGeckoConfiguration) => config,
  inject: [coingeckoConfig.KEY],
  imports: [ConfigModule],
})
```

**Экспортирует:** `CoinGeckoService` (глобально)

### CoinGeckoService

**Конфигурация:**
- `apiKey?: string` - API ключ (опционально, для Pro API)
- `baseUrl?: string` - базовый URL (по умолчанию: https://api.coingecko.com/api/v3)
- `timeout?: number` - таймаут запросов в мс (по умолчанию: 30000)

**Методы:**

#### `getMarketData(params?)`

Получает рыночные данные криптовалют с фильтрацией и сортировкой. Автоматически преобразует данные из snake_case в camelCase.

```typescript
async getMarketData(params?: MarketDataParams): Promise<CryptoPrice[]>
```

**Параметры:**
- `vsCurrency?: string` - валюта для отображения цен (по умолчанию: "usd")
- `ids?: string` - фильтр по ID криптовалют (через запятую)
- `category?: string` - фильтр по категории
- `order?: string` - порядок сортировки (по умолчанию: "market_cap_desc")
- `perPage?: number` - количество результатов на странице (по умолчанию: 100)
- `page?: number` - номер страницы (по умолчанию: 1)
- `sparkline?: boolean` - включить данные sparkline за 7 дней (по умолчанию: false)
- `priceChangePercentage?: string` - периоды для изменения цен (например: "1h,24h,7d")

#### `getSimplePrices(ids, include24hChange?)`

Получает простые цены криптовалют по их ID.

```typescript
getSimplePrices(ids: string[], include24hChange?: boolean): Promise<PriceData>
```

#### `getPriceBySymbol(symbol, options?)`

Получает цену криптовалюты по её символу (например, btc, eth, usdt).

```typescript
async getPriceBySymbol(
  symbol: string,
  options?: { vsCurrency?: string; include24hChange?: boolean }
): Promise<PriceBySymbolResult | null>
```

**Параметры:**
- `symbol` - символ криптовалюты (btc, eth, usdt и т.д.)
- `vsCurrency?: string` - валюта для отображения цены (по умолчанию: "usd")
- `include24hChange?: boolean` - включить процентное изменение за 24 часа

**Возвращает:** `PriceBySymbolResult` с полями `coinId`, `symbol`, `price`, `vsCurrency`, `priceChange24h?` или `null` если монета не найдена.

#### `getCoinDetails(coinId)`

Получает детальную информацию о криптовалюте.

```typescript
getCoinDetails(coinId: string): Promise<CryptoDetails>
```

#### `getHistoricalData(coinId, days, interval?)`

Получает исторические данные о ценах, рыночной капитализации и объеме.

```typescript
getHistoricalData(coinId: string, days: number, interval?: "hourly" | "daily"): Promise<CryptoHistoricalData>
```

#### `searchCoins(query)`

Выполняет поиск криптовалют по запросу.

```typescript
async searchCoins(query: string): Promise<CryptoSearchResult[]>
```

#### `getTrendingCoins()`

Получает список трендовых криптовалют за последние 24 часа.

```typescript
async getTrendingCoins(): Promise<TrendingCrypto[]>
```

#### `getGlobalMarketData()`

Получает глобальные метрики криптовалютного рынка.

```typescript
getGlobalMarketData(): Promise<CryptoMarketData>
```

## 🧪 Примеры использования

### Получение топ криптовалют

```typescript
const topAssets = await this.coingecko.getMarketData({ perPage: 50 });
topAssets.forEach(asset => {
  console.log(`${asset.name}: $${asset.currentPrice}`);
  console.log(`Market Cap: $${asset.marketCap}`);
});
```

### Получение рыночных данных с sparkline и изменениями цен

```typescript
const assets = await this.coingecko.getMarketData({
  vsCurrency: "usd",
  order: "market_cap_desc",
  perPage: 100,
  sparkline: true,
  priceChangePercentage: "1h,24h,7d",
});

assets.forEach(asset => {
  console.log(`${asset.name}: $${asset.currentPrice}`);
  console.log(`24h Change: ${asset.priceChangePercentage24h}%`);
  console.log(`1h Change: ${asset.priceChangePercentage1hInCurrency}%`);
  console.log(`7d Change: ${asset.priceChangePercentage7dInCurrency}%`);
  if (asset.sparklineIn7d) {
    console.log(`Sparkline data points: ${asset.sparklineIn7d.price.length}`);
  }
});
```

### Получение простых цен

```typescript
const prices = await this.coingecko.getSimplePrices(['bitcoin', 'ethereum'], true);
console.log(`BTC: $${prices.bitcoin.usd}`);
console.log(`ETH: $${prices.ethereum.usd}`);
```

### Получение цены по символу

```typescript
const btcPrice = await this.coingecko.getPriceBySymbol('btc');
if (btcPrice) {
  console.log(`BTC: $${btcPrice.price}`);
  console.log(`Coin ID: ${btcPrice.coinId}`);
}

// С кастомной валютой и изменением за 24 часа
const ethPrice = await this.coingecko.getPriceBySymbol('eth', {
  vsCurrency: 'eur',
  include24hChange: true,
});
if (ethPrice) {
  console.log(`ETH: €${ethPrice.price}`);
  console.log(`24h Change: ${ethPrice.priceChange24h}%`);
}
```

### Получение детальной информации

```typescript
const btcDetails = await this.coingecko.getCoinDetails('bitcoin');
console.log(`Name: ${btcDetails.name}`);
console.log(`Market Cap Rank: ${btcDetails.marketCapRank}`);
```

### Получение исторических данных

```typescript
const historicalData = await this.coingecko.getHistoricalData('bitcoin', 7, 'daily');
console.log(`Price points: ${historicalData.prices.length}`);
```

### Поиск и трендовые криптовалюты

```typescript
// Поиск
const searchResults = await this.coingecko.searchCoins('bitcoin');

// Трендовые
const trending = await this.coingecko.getTrendingCoins();

// Глобальные метрики
const globalData = await this.coingecko.getGlobalMarketData();
```

## 🚨 Troubleshooting

### Request timeout

**Решение:** Увеличить `COINGECKO_TIMEOUT`, проверить интернет-соединение, использовать Pro API ключ.

### Rate limit exceeded

**Решение:** Использовать Pro API ключ, уменьшить частоту запросов, реализовать кэширование.

### Coin not found

**Решение:** Проверить правильность ID (нижний регистр), использовать `searchCoins()` для поиска.

### Трансформация данных не работает

**Решение:** Использовать `getMarketData()` для автоматической трансформации, для других методов данные в исходном формате API.

## 🧪 Тестирование

Пакет имеет **100% покрытие тестами**.

```bash
pnpm test                # Все тесты
pnpm test:coverage       # С покрытием
pnpm test:watch          # Watch режим
```

## 🔧 Конфигурация

```typescript
interface CoinGeckoModuleOptions {
  apiKey?: string;        // API ключ (опционально, для Pro API)
  baseUrl?: string;       // Базовый URL (опционально)
  timeout?: number;       // Таймаут в мс (опционально)
}
```

**Примечание:** Конфигурация должна создаваться в сервисе, который использует пакет.

## 📦 Зависимости

- `@nestjs/common` - NestJS core
- `@nestjs/config` - NestJS config
- `@makebelieve21213-packages/logger` - Логирование
- `reflect-metadata` - TypeScript decorators

## 📄 Лицензия

UNLICENSED (private package)

## 👥 Автор

Skryabin Aleksey
