import { LoggerService } from "@makebelieve21213-packages/logger";
import { Injectable, Inject } from "@nestjs/common";
import CoreClientService from "src/core/core-client.service";
import { COINGECKO_CLIENT_OPTIONS } from "src/utils/injection-keys";
import transformRawPrice from "src/utils/transform.utils";

import type {
	MarketDataParams,
	CryptoPrice,
	CryptoPriceRaw,
	PriceData,
	CryptoDetails,
	CryptoHistoricalData,
	CryptoSearchResult,
	TrendingCrypto,
	CryptoMarketData,
} from "src/types/api-types";
import type { CoinGeckoModuleOptions } from "src/types/module-options.interface";

// Сервис для работы с CoinGecko API
@Injectable()
export default class CoinGeckoService extends CoreClientService {
	constructor(
		@Inject(COINGECKO_CLIENT_OPTIONS)
		protected readonly options: CoinGeckoModuleOptions,
		protected readonly logger: LoggerService
	) {
		super(options, logger);
		this.logger.setContext(CoinGeckoService.name);
	}

	// Получает рыночные данные криптовалют с фильтрацией и сортировкой
	async getMarketData(params: MarketDataParams = {}): Promise<CryptoPrice[]> {
		// Запрашиваем сырые данные от API (в snake_case)
		const rawResponse = await this.makeRequest<CryptoPriceRaw[]>("/coins/markets", {
			vs_currency: params.vsCurrency || "usd",
			ids: params.ids,
			category: params.category,
			order: params.order || "market_cap_desc",
			per_page: params.perPage || 100,
			page: params.page || 1,
			sparkline: params.sparkline || false,
			price_change_percentage: params.priceChangePercentage,
		});

		if (!Array.isArray(rawResponse)) {
			this.logger.warn(`CoinGecko getMarketData: Expected array, got ${typeof rawResponse}`);
			return [];
		}

		// Преобразуем сырые данные в наш формат (camelCase)
		return rawResponse.map((raw) => transformRawPrice(raw));
	}

	// Получает простые цены криптовалют по их ID с опциональным изменением за 24 часа
	getSimplePrices(ids: string[], include24hChange = false): Promise<PriceData> {
		return this.makeRequest<PriceData>("/simple/price", {
			ids: ids.join(","),
			vs_currencies: "usd",
			include_24hr_change: include24hChange,
		});
	}

	// Получает детальную информацию о криптовалюте включая метрики, профиль и данные разработчиков
	getCoinDetails(coinId: string): Promise<CryptoDetails> {
		return this.makeRequest<CryptoDetails>(`/coins/${coinId}`, {
			localization: false,
			tickers: false,
			market_data: true,
			community_data: true,
			developer_data: true,
			sparkline: false,
		});
	}

	// Получает исторические данные о ценах, рыночной капитализации и объеме за указанный период
	getHistoricalData(
		coinId: string,
		days: number,
		interval: "hourly" | "daily" = "daily"
	): Promise<CryptoHistoricalData> {
		return this.makeRequest<CryptoHistoricalData>(`/coins/${coinId}/market_chart`, {
			vs_currency: "usd",
			days,
			interval: interval === "hourly" ? "hourly" : undefined,
		});
	}

	// Выполняет поиск криптовалют по запросу и возвращает список результатов
	async searchCoins(query: string): Promise<CryptoSearchResult[]> {
		const response = await this.makeRequest<{ coins: CryptoSearchResult[] }>("/search", {
			query,
		});

		return response.coins || [];
	}

	// Получает список трендовых криптовалют за последние 24 часа
	async getTrendingCoins(): Promise<TrendingCrypto[]> {
		const response = await this.makeRequest<{ coins: TrendingCrypto[] }>("/search/trending");

		return response.coins || [];
	}

	// Получает глобальные метрики криптовалютного рынка включая общую капитализацию и объем
	getGlobalMarketData(): Promise<CryptoMarketData> {
		return this.makeRequest<CryptoMarketData>("/global");
	}
}
