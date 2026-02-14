# Changelog

Все значимые изменения в этом проекте будут документироваться в этом файле.

Формат основан на [Keep a Changelog](https://keepachangelog.com/ru/1.0.0/),
и этот проект придерживается [Semantic Versioning](https://semver.org/lang/ru/).

## [1.0.3] - 2025-02-14

### Добавлено
- Новый метод `getPriceBySymbol()` для получения цены криптовалюты по её символу (например, btc, eth, usdt)
- Новый тип `PriceBySymbolResult` с полями: `coinId`, `symbol`, `price`, `vsCurrency`, `priceChange24h?`
- Поддержка параметров:
  - `vsCurrency` - валюта для отображения цены, по умолчанию "usd" (опциональный)
  - `include24hChange` - включить процентное изменение цены за 24 часа (опциональный)
- Метод возвращает `null` если монета с указанным символом не найдена
- Метод нормализует символ в нижний регистр (ETH → eth)
- Полное покрытие тестами нового метода (5 тестов)

### Обновлено
- README.md и llms.txt — добавлена документация по `getPriceBySymbol()`, обновлено имя пакета на `@makebelieve21213-packages/coingecko-client`
- .prettierignore и команды format/format:fix — включено форматирование конфигов (package.json, tsconfig.json, jest.config.ts, .prettierrc)

## [1.0.2] - 2025-12-29

### Добавлено
- Новый метод `getGlobalMarketCapChart()` для получения исторических данных общей рыночной капитализации криптовалютного рынка через CoinGecko Pro API
- Новый тип `GlobalMarketCapChartResponse` с интерфейсом для данных графика капитализации и объема
- Поддержка параметров:
  - `days` - количество дней истории данных (обязательный)
  - `vsCurrency` - валюта для сравнения, по умолчанию "usd" (опциональный)
- Полное покрытие тестами нового метода (8 тестов)

### Примечания
- Метод использует CoinGecko Pro API эндпоинт `/global/market_cap_chart`, который требует Pro API ключ
- Данные возвращаются в формате массива кортежей `[timestamp, value]`, где timestamp в миллисекундах

## [1.0.1] - 2025-11-30

### Добавлено
- Поддержка параметра `sparkline` в методе `getMarketData()` для получения данных sparkline за 7 дней
- Поддержка параметра `priceChangePercentage` в методе `getMarketData()` для получения изменений цен за разные периоды (например, "1h,24h,7d")
- Новые поля в типе `CryptoPrice`:
  - `sparklineIn7d?: { price: number[] }` - данные sparkline за 7 дней
  - `priceChangePercentage1hInCurrency?: number` - изменение цены за 1 час
  - `priceChangePercentage7dInCurrency?: number` - изменение цены за 7 дней
- Новые поля в типе `CryptoPriceRaw`:
  - `sparkline_in_7d?: { price: number[] }`
  - `price_change_percentage_1h_in_currency?: number`
  - `price_change_percentage_7d_in_currency?: number`

### Обновлено
- Функция `transformRawPrice()` теперь преобразует новые поля из snake_case в camelCase
- Документация обновлена с примерами использования новых параметров

## [1.0.0] - 2025-11-25

### Добавлено
- Базовая функциональность CoinGecko API клиента для NestJS
- NestJS модуль `CoinGeckoModule` с поддержкой `forRootAsync`
- Сервис `CoinGeckoService` для работы с CoinGecko API
- Поддержка всех основных методов CoinGecko API:
  - `getMarketData()` - получение рыночных данных с фильтрацией и сортировкой
  - `getSimplePrices()` - получение простых цен криптовалют
  - `getCoinDetails()` - получение детальной информации о криптовалюте
  - `getHistoricalData()` - получение исторических данных о ценах
  - `searchCoins()` - поиск криптовалют
  - `getTrendingCoins()` - получение трендовых криптовалют
  - `getGlobalMarketData()` - получение глобальных метрик рынка
- Автоматическая трансформация данных из snake_case в camelCase
- Поддержка API ключа для Pro API (опционально)
- Конфигурируемые таймауты и базовый URL
- Полная типизация TypeScript с экспортируемыми типами
- 100% покрытие тестами
- Обработка ошибок с детальным логированием
- Интеграция с `@makebelieve21213-packages/logger`

### Документация
- Подробный README с примерами использования
- llms.txt для контекста ИИ агентов
- Инструкции по развертыванию в Docker
- Руководство по внесению вклада (CONTRIBUTING.md)
