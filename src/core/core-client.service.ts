import { HttpStatus } from "@nestjs/common";
import CoingeckoError from "src/errors/coingecko.error";

import type { LoggerService } from "@makebelieve21213-packages/logger";
import type { CoinGeckoModuleOptions } from "src/types/module-options.interface";

// Базовый класс для работы с CoinGecko API
export default abstract class CoreClientService {
	protected readonly baseUrl: string;
	protected readonly timeout: number;

	constructor(
		protected readonly options: CoinGeckoModuleOptions,
		protected readonly logger: LoggerService
	) {
		this.baseUrl = this.options.baseUrl || "https://api.coingecko.com/api/v3";
		this.timeout = this.options.timeout || 30000;
	}

	// Выполняет HTTP запрос к CoinGecko API с обработкой ошибок и таймаутом
	protected async makeRequest<T>(endpoint: string, params?: Record<string, unknown>): Promise<T> {
		const url = new URL(`${this.baseUrl}${endpoint}`);

		if (params) {
			Object.entries(params).forEach(([key, value]) => {
				if (value !== undefined && value !== null) {
					url.searchParams.append(key, String(value));
				}
			});
		}

		const controller = new AbortController();
		const timeoutId = setTimeout(() => controller.abort(), this.timeout);

		try {
			const response = await fetch(url.toString(), {
				method: "GET",
				headers: {
					"Content-Type": "application/json",
					...(this.options.apiKey && { "x-cg-pro-api-key": this.options.apiKey }),
				},
				signal: controller.signal,
			});

			clearTimeout(timeoutId);

			const data = (await response.json()) as T;

			if (!response.ok) {
				// Логируем тело ответа для диагностики ошибок
				const errorDetails =
					typeof data === "object" && data !== null ? JSON.stringify(data) : String(data);
				this.logger.error(
					`CoinGecko API error: ${response.status}. Response body: ${errorDetails.substring(0, 500)}`
				);
				throw new CoingeckoError(
					`CoinGecko API error: ${response.status}. ${errorDetails.substring(0, 200)}`,
					response.status >= HttpStatus.INTERNAL_SERVER_ERROR
						? HttpStatus.BAD_GATEWAY
						: HttpStatus.BAD_REQUEST
				);
			}

			return data;
		} catch (error: Error | unknown) {
			clearTimeout(timeoutId);

			if (error instanceof CoingeckoError) {
				throw error;
			}

			if (error instanceof Error && error.name === "AbortError") {
				throw new CoingeckoError("Request timeout", HttpStatus.REQUEST_TIMEOUT);
			}

			this.logger.error(
				`CoinGecko API request failed: ${error instanceof Error ? error.message : String(error)}`
			);

			throw new CoingeckoError("Failed to fetch data from CoinGecko API", HttpStatus.BAD_GATEWAY);
		}
	}
}
