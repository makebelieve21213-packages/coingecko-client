import { HttpStatus } from "@nestjs/common";
import CoingeckoError from "src/errors/coingecko.error";
import CoinGeckoService from "src/main/coingecko-client.service";

import type { LoggerService } from "@makebelieve21213-packages/logger";
import type {
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

// Мокируем LoggerService
const mockLoggerService = {
	log: jest.fn(),
	error: jest.fn(),
	warn: jest.fn(),
	debug: jest.fn(),
	verbose: jest.fn(),
	setContext: jest.fn(),
};

jest.mock("@makebelieve21213-packages/logger", () => ({
	LoggerService: jest.fn().mockImplementation(() => mockLoggerService),
}));

// Мокируем глобальный fetch
global.fetch = jest.fn();

describe("CoinGeckoService", () => {
	let service: CoinGeckoService;
	let mockOptions: CoinGeckoModuleOptions;
	let mockFetch: jest.MockedFunction<typeof fetch>;

	beforeEach(() => {
		mockOptions = {
			apiKey: "test-api-key",
			baseUrl: "https://api.coingecko.com/api/v3",
			timeout: 30000,
		};

		mockFetch = global.fetch as jest.MockedFunction<typeof fetch>;
		mockFetch.mockClear();

		// Очищаем все моки logger перед каждым тестом
		jest.clearAllMocks();

		jest.useFakeTimers();
	});

	afterEach(() => {
		jest.useRealTimers();
		jest.clearAllMocks();
	});

	describe("constructor", () => {
		it("должен создать экземпляр сервиса с дефолтными опциями", () => {
			const defaultOptions: CoinGeckoModuleOptions = {
				apiKey: "test-key",
			};

			service = new CoinGeckoService(defaultOptions, mockLoggerService as unknown as LoggerService);

			expect(service).toBeInstanceOf(CoinGeckoService);
			expect(mockLoggerService.setContext).toHaveBeenCalledWith("CoinGeckoService");
		});

		it("должен создать экземпляр сервиса с кастомными опциями", () => {
			service = new CoinGeckoService(mockOptions, mockLoggerService as unknown as LoggerService);

			expect(service).toBeInstanceOf(CoinGeckoService);
			expect(mockLoggerService.setContext).toHaveBeenCalledWith("CoinGeckoService");
		});

		it("должен использовать дефолтный baseUrl если не указан", () => {
			const optionsWithoutUrl: CoinGeckoModuleOptions = {
				apiKey: "test-key",
			};

			service = new CoinGeckoService(optionsWithoutUrl, mockLoggerService as unknown as LoggerService);

			expect(service).toBeInstanceOf(CoinGeckoService);
		});

		it("должен использовать кастомный baseUrl если указан", () => {
			const optionsWithUrl: CoinGeckoModuleOptions = {
				apiKey: "test-key",
				baseUrl: "https://custom-api.com/v1",
			};

			service = new CoinGeckoService(optionsWithUrl, mockLoggerService as unknown as LoggerService);

			expect(service).toBeInstanceOf(CoinGeckoService);
		});

		it("должен использовать дефолтный timeout если не указан", () => {
			const optionsWithoutTimeout: CoinGeckoModuleOptions = {
				apiKey: "test-key",
			};

			service = new CoinGeckoService(
				optionsWithoutTimeout,
				mockLoggerService as unknown as LoggerService
			);

			expect(service).toBeInstanceOf(CoinGeckoService);
		});

		it("должен использовать кастомный timeout если указан", () => {
			const optionsWithTimeout: CoinGeckoModuleOptions = {
				apiKey: "test-key",
				timeout: 60000,
			};

			service = new CoinGeckoService(
				optionsWithTimeout,
				mockLoggerService as unknown as LoggerService
			);

			expect(service).toBeInstanceOf(CoinGeckoService);
		});

		it("должен принять logger в конструкторе и установить контекст", () => {
			const customLogger = {
				log: jest.fn(),
				error: jest.fn(),
				warn: jest.fn(),
				debug: jest.fn(),
				verbose: jest.fn(),
				setContext: jest.fn(),
			};

			service = new CoinGeckoService(mockOptions, customLogger as unknown as LoggerService);

			expect(service).toBeInstanceOf(CoinGeckoService);
			expect(customLogger.setContext).toHaveBeenCalledWith("CoinGeckoService");
			expect(customLogger.setContext).toHaveBeenCalledTimes(1);
		});

		it("должен создать экземпляр сервиса с logger через конструктор", () => {
			const testLogger = {
				log: jest.fn(),
				error: jest.fn(),
				warn: jest.fn(),
				debug: jest.fn(),
				verbose: jest.fn(),
				setContext: jest.fn(),
			};

			const testOptions: CoinGeckoModuleOptions = {
				apiKey: "test-key",
			};

			service = new CoinGeckoService(testOptions, testLogger as unknown as LoggerService);

			expect(service).toBeInstanceOf(CoinGeckoService);
			expect(testLogger.setContext).toHaveBeenCalledWith("CoinGeckoService");
		});

		it("должен использовать переданный logger в методах", async () => {
			service = new CoinGeckoService(mockOptions, mockLoggerService as unknown as LoggerService);

			const mockObjectResponse = { error: "Invalid response", data: null };

			mockFetch.mockResolvedValueOnce({
				ok: true,
				status: 200,
				json: jest.fn().mockResolvedValueOnce(mockObjectResponse),
			} as unknown as Response);

			await service.getMarketData();

			expect(mockLoggerService.warn).toHaveBeenCalled();
			expect(mockLoggerService.warn).toHaveBeenCalledWith(
				expect.stringContaining("CoinGecko getMarketData: Expected array, got object")
			);
		});
	});

	describe("makeRequest", () => {
		beforeEach(() => {
			service = new CoinGeckoService(mockOptions, mockLoggerService as unknown as LoggerService);
		});

		it("должен успешно выполнить запрос без параметров", async () => {
			const mockData = { test: "data" };
			mockFetch.mockResolvedValueOnce({
				ok: true,
				status: 200,
				json: jest.fn().mockResolvedValueOnce(mockData),
			} as unknown as Response);

			const result = await (
				service as unknown as { makeRequest: <T>(endpoint: string) => Promise<T> }
			).makeRequest("/test");

			expect(result).toEqual(mockData);
			expect(mockFetch).toHaveBeenCalledWith(
				expect.stringContaining("/test"),
				expect.objectContaining({
					method: "GET",
					headers: expect.objectContaining({
						"Content-Type": "application/json",
						"x-cg-pro-api-key": "test-api-key",
					}),
				})
			);
		});

		it("должен успешно выполнить запрос с параметрами", async () => {
			const mockData = { test: "data" };
			mockFetch.mockResolvedValueOnce({
				ok: true,
				status: 200,
				json: jest.fn().mockResolvedValueOnce(mockData),
			} as unknown as Response);

			const result = await (
				service as unknown as {
					makeRequest: <T>(endpoint: string, params?: Record<string, unknown>) => Promise<T>;
				}
			).makeRequest("/test", {
				param1: "value1",
				param2: 123,
			});

			expect(result).toEqual(mockData);
			expect(mockFetch).toHaveBeenCalledWith(
				expect.stringContaining("param1=value1&param2=123"),
				expect.any(Object)
			);
		});

		it("должен успешно выполнить запрос с пустым объектом params", async () => {
			const mockData = { test: "data" };
			mockFetch.mockResolvedValueOnce({
				ok: true,
				status: 200,
				json: jest.fn().mockResolvedValueOnce(mockData),
			} as unknown as Response);

			const result = await (
				service as unknown as {
					makeRequest: <T>(endpoint: string, params?: Record<string, unknown>) => Promise<T>;
				}
			).makeRequest("/test", {});

			expect(result).toEqual(mockData);
		});

		it("должен игнорировать undefined и null параметры", async () => {
			const mockData = { test: "data" };
			mockFetch.mockResolvedValueOnce({
				ok: true,
				status: 200,
				json: jest.fn().mockResolvedValueOnce(mockData),
			} as unknown as Response);

			await (
				service as unknown as {
					makeRequest: <T>(endpoint: string, params?: Record<string, unknown>) => Promise<T>;
				}
			).makeRequest("/test", {
				param1: "value1",
				param2: undefined,
				param3: null,
			});

			const callUrl = mockFetch.mock.calls[0][0] as string;
			expect(callUrl).toContain("param1=value1");
			expect(callUrl).not.toContain("param2");
			expect(callUrl).not.toContain("param3");
		});

		it("должен выбросить CoingeckoError при ошибке API (4xx)", async () => {
			mockFetch.mockResolvedValueOnce({
				ok: false,
				status: 400,
				json: jest.fn().mockResolvedValueOnce({ error: "Bad Request" }),
			} as unknown as Response);

			await expect(
				(service as unknown as { makeRequest: <T>(endpoint: string) => Promise<T> }).makeRequest(
					"/test"
				)
			).rejects.toThrow(CoingeckoError);
		});

		it("должен выбросить CoingeckoError при ошибке API (5xx)", async () => {
			mockFetch.mockResolvedValueOnce({
				ok: false,
				status: 500,
				json: jest.fn().mockResolvedValueOnce({ error: "Internal Server Error" }),
			} as unknown as Response);

			await expect(
				(service as unknown as { makeRequest: <T>(endpoint: string) => Promise<T> }).makeRequest(
					"/test"
				)
			).rejects.toThrow(CoingeckoError);
		});

		it("должен обработать ошибку API когда data не является объектом (строка)", async () => {
			mockFetch.mockResolvedValueOnce({
				ok: false,
				status: 400,
				json: jest.fn().mockResolvedValueOnce("Error message string"),
			} as unknown as Response);

			await expect(
				(service as unknown as { makeRequest: <T>(endpoint: string) => Promise<T> }).makeRequest(
					"/test"
				)
			).rejects.toThrow(CoingeckoError);
		});

		it("должен обработать ошибку API когда data равен null", async () => {
			mockFetch.mockResolvedValueOnce({
				ok: false,
				status: 400,
				json: jest.fn().mockResolvedValueOnce(null),
			} as unknown as Response);

			await expect(
				(service as unknown as { makeRequest: <T>(endpoint: string) => Promise<T> }).makeRequest(
					"/test"
				)
			).rejects.toThrow(CoingeckoError);
		});

		it("должен выбросить CoingeckoError при таймауте", async () => {
			mockFetch.mockImplementationOnce((_, options) => {
				const signal = options?.signal as AbortSignal | undefined;
				return new Promise((_, reject) => {
					if (signal) {
						// Слушаем событие abort от AbortController
						const onAbort = () => {
							const abortError = new Error("Request timeout");
							abortError.name = "AbortError";
							reject(abortError);
						};

						if (signal.aborted) {
							onAbort();
						} else {
							signal.addEventListener("abort", onAbort);
						}
					} else {
						// Fallback если signal не передан
						setTimeout(() => {
							const abortError = new Error("Request timeout");
							abortError.name = "AbortError";
							reject(abortError);
						}, 30000);
					}
				});
			});

			const requestPromise = (
				service as unknown as { makeRequest: <T>(endpoint: string) => Promise<T> }
			).makeRequest("/test");

			// Промотаем таймеры на время таймаута, чтобы сработал setTimeout в makeRequest
			jest.advanceTimersByTime(30000);

			// Дождемся выполнения всех промисов
			await Promise.resolve();

			await expect(requestPromise).rejects.toThrow(CoingeckoError);
		});

		it("должен выбросить CoingeckoError при AbortError", async () => {
			const abortError = new Error("Request aborted");
			abortError.name = "AbortError";
			mockFetch.mockRejectedValueOnce(abortError);

			await expect(
				(service as unknown as { makeRequest: <T>(endpoint: string) => Promise<T> }).makeRequest(
					"/test"
				)
			).rejects.toThrow(CoingeckoError);
		});

		it("должен выбросить CoingeckoError при сетевой ошибке", async () => {
			mockFetch.mockRejectedValueOnce(new Error("Network error"));

			await expect(
				(service as unknown as { makeRequest: <T>(endpoint: string) => Promise<T> }).makeRequest(
					"/test"
				)
			).rejects.toThrow(CoingeckoError);
		});

		it("должен выбросить CoingeckoError при ошибке не типа Error", async () => {
			mockFetch.mockRejectedValueOnce("String error");

			await expect(
				(service as unknown as { makeRequest: <T>(endpoint: string) => Promise<T> }).makeRequest(
					"/test"
				)
			).rejects.toThrow(CoingeckoError);
		});

		it("должен пробросить CoingeckoError если он уже был выброшен", async () => {
			const coingeckoError = new CoingeckoError("Test error", HttpStatus.BAD_REQUEST);
			mockFetch.mockRejectedValueOnce(coingeckoError);

			await expect(
				(service as unknown as { makeRequest: <T>(endpoint: string) => Promise<T> }).makeRequest(
					"/test"
				)
			).rejects.toThrow(CoingeckoError);
		});

		it("должен использовать опциональный API ключ", async () => {
			const optionsWithoutKey: CoinGeckoModuleOptions = {
				baseUrl: "https://api.coingecko.com/api/v3",
				timeout: 30000,
			};

			service = new CoinGeckoService(optionsWithoutKey, mockLoggerService as unknown as LoggerService);

			const mockData = { test: "data" };
			mockFetch.mockResolvedValueOnce({
				ok: true,
				status: 200,
				json: jest.fn().mockResolvedValueOnce(mockData),
			} as unknown as Response);

			await (service as unknown as { makeRequest: <T>(endpoint: string) => Promise<T> }).makeRequest(
				"/test"
			);

			const callHeaders = mockFetch.mock.calls[0][1]?.headers as Record<string, string>;
			expect(callHeaders).not.toHaveProperty("x-cg-pro-api-key");
		});

		it("должен игнорировать пустой API ключ", async () => {
			const optionsWithEmptyKey: CoinGeckoModuleOptions = {
				apiKey: "",
				baseUrl: "https://api.coingecko.com/api/v3",
				timeout: 30000,
			};

			service = new CoinGeckoService(
				optionsWithEmptyKey,
				mockLoggerService as unknown as LoggerService
			);

			const mockData = { test: "data" };
			mockFetch.mockResolvedValueOnce({
				ok: true,
				status: 200,
				json: jest.fn().mockResolvedValueOnce(mockData),
			} as unknown as Response);

			await (service as unknown as { makeRequest: <T>(endpoint: string) => Promise<T> }).makeRequest(
				"/test"
			);

			const callHeaders = mockFetch.mock.calls[0][1]?.headers as Record<string, string>;
			expect(callHeaders).not.toHaveProperty("x-cg-pro-api-key");
		});

		it("должен обработать пустой массив в ответе", async () => {
			const mockData: unknown[] = [];
			mockFetch.mockResolvedValueOnce({
				ok: true,
				status: 200,
				json: jest.fn().mockResolvedValueOnce(mockData),
			} as unknown as Response);

			const result = await (
				service as unknown as { makeRequest: <T>(endpoint: string) => Promise<T> }
			).makeRequest("/test");

			expect(result).toEqual(mockData);
		});

		it("должен обработать непустой массив в ответе", async () => {
			const mockData = [{ id: 1 }, { id: 2 }];
			mockFetch.mockResolvedValueOnce({
				ok: true,
				status: 200,
				json: jest.fn().mockResolvedValueOnce(mockData),
			} as unknown as Response);

			const result = await (
				service as unknown as { makeRequest: <T>(endpoint: string) => Promise<T> }
			).makeRequest("/test");

			expect(result).toEqual(mockData);
		});

		it("должен обработать ошибку API когда data является объектом", async () => {
			mockFetch.mockResolvedValueOnce({
				ok: false,
				status: 400,
				json: jest.fn().mockResolvedValueOnce({ error: "Bad Request", code: 400 }),
			} as unknown as Response);

			await expect(
				(service as unknown as { makeRequest: <T>(endpoint: string) => Promise<T> }).makeRequest(
					"/test"
				)
			).rejects.toThrow(CoingeckoError);
		});

		it("должен обработать ошибку API (502) с BAD_GATEWAY статусом", async () => {
			mockFetch.mockResolvedValueOnce({
				ok: false,
				status: 502,
				json: jest.fn().mockResolvedValueOnce({ error: "Bad Gateway" }),
			} as unknown as Response);

			try {
				await (service as unknown as { makeRequest: <T>(endpoint: string) => Promise<T> }).makeRequest(
					"/test"
				);
			} catch (error) {
				expect(error).toBeInstanceOf(CoingeckoError);
				if (error instanceof CoingeckoError) {
					expect(error.getStatus()).toBe(HttpStatus.BAD_GATEWAY);
				}
			}
		});

		it("должен обработать ошибку когда error является Error но не AbortError", async () => {
			const customError = new Error("Custom error");
			customError.name = "CustomError";
			mockFetch.mockRejectedValueOnce(customError);

			await expect(
				(service as unknown as { makeRequest: <T>(endpoint: string) => Promise<T> }).makeRequest(
					"/test"
				)
			).rejects.toThrow(CoingeckoError);
		});

		it("должен обработать ошибку API (5xx) с BAD_GATEWAY статусом", async () => {
			mockFetch.mockResolvedValueOnce({
				ok: false,
				status: 500,
				json: jest.fn().mockResolvedValueOnce({ error: "Internal Server Error" }),
			} as unknown as Response);

			try {
				await (service as unknown as { makeRequest: <T>(endpoint: string) => Promise<T> }).makeRequest(
					"/test"
				);
			} catch (error) {
				expect(error).toBeInstanceOf(CoingeckoError);
				if (error instanceof CoingeckoError) {
					expect(error.getStatus()).toBe(HttpStatus.BAD_GATEWAY);
				}
			}
		});

		it("должен обработать ошибку когда data не является объектом (число)", async () => {
			mockFetch.mockResolvedValueOnce({
				ok: false,
				status: 400,
				json: jest.fn().mockResolvedValueOnce(123),
			} as unknown as Response);

			await expect(
				(service as unknown as { makeRequest: <T>(endpoint: string) => Promise<T> }).makeRequest(
					"/test"
				)
			).rejects.toThrow(CoingeckoError);
		});
	});

	describe("getMarketData", () => {
		beforeEach(() => {
			service = new CoinGeckoService(mockOptions, mockLoggerService as unknown as LoggerService);
		});

		it("должен получить рыночные данные с дефолтными параметрами", async () => {
			const mockRawData: CryptoPriceRaw[] = [
				{
					id: "bitcoin",
					symbol: "btc",
					name: "Bitcoin",
					image: "https://example.com/btc.png",
					current_price: 50000,
					market_cap: 1000000000,
					market_cap_rank: 1,
					total_volume: 50000000,
					high_24h: 51000,
					low_24h: 49000,
					price_change_24h: 1000,
					price_change_percentage_24h: 2,
					market_cap_change_24h: 20000000,
					market_cap_change_percentage_24h: 2,
					circulating_supply: 20000000,
					ath: 60000,
					ath_change_percentage: -16.67,
					ath_date: "2021-11-10",
					atl: 1000,
					atl_change_percentage: 4900,
					atl_date: "2013-01-01",
					last_updated: "2024-01-01",
				},
			];

			const expectedData: CryptoPrice[] = [
				{
					id: "bitcoin",
					symbol: "btc",
					name: "Bitcoin",
					image: "https://example.com/btc.png",
					currentPrice: 50000,
					marketCap: 1000000000,
					marketCapRank: 1,
					totalVolume: 50000000,
					high24h: 51000,
					low24h: 49000,
					priceChange24h: 1000,
					priceChangePercentage24h: 2,
					marketCapChange24h: 20000000,
					marketCapChangePercentage24h: 2,
					circulatingSupply: 20000000,
					ath: 60000,
					athChangePercentage: -16.67,
					athDate: "2021-11-10",
					atl: 1000,
					atlChangePercentage: 4900,
					atlDate: "2013-01-01",
					lastUpdated: "2024-01-01",
				},
			];

			mockFetch.mockResolvedValueOnce({
				ok: true,
				status: 200,
				json: jest.fn().mockResolvedValueOnce(mockRawData),
			} as unknown as Response);

			const result = await service.getMarketData();

			expect(result).toEqual(expectedData);
			expect(mockFetch).toHaveBeenCalledWith(
				expect.stringContaining("/coins/markets"),
				expect.any(Object)
			);
		});

		it("должен получить рыночные данные с кастомными параметрами", async () => {
			const mockData: CryptoPrice[] = [];
			mockFetch.mockResolvedValueOnce({
				ok: true,
				status: 200,
				json: jest.fn().mockResolvedValueOnce(mockData),
			} as unknown as Response);

			await service.getMarketData({
				vsCurrency: "eur",
				ids: "bitcoin,ethereum",
				category: "defi",
				order: "gecko_desc",
				perPage: 50,
				page: 2,
				sparkline: true,
				priceChangePercentage: "24h",
			});

			const callUrl = mockFetch.mock.calls[0][0] as string;
			expect(callUrl).toContain("vs_currency=eur");
			expect(callUrl).toMatch(/ids=bitcoin(%2C|,)ethereum/);
			expect(callUrl).toContain("category=defi");
			expect(callUrl).toContain("order=gecko_desc");
			expect(callUrl).toContain("per_page=50");
			expect(callUrl).toContain("page=2");
			expect(callUrl).toContain("sparkline=true");
			expect(callUrl).toContain("price_change_percentage=24h");
		});

		it("должен использовать дефолтные значения для falsy параметров в getMarketData", async () => {
			const mockData: CryptoPrice[] = [];
			mockFetch.mockResolvedValueOnce({
				ok: true,
				status: 200,
				json: jest.fn().mockResolvedValueOnce(mockData),
			} as unknown as Response);

			await service.getMarketData({
				vsCurrency: "",
				order: "",
				perPage: 0,
				page: 0,
				sparkline: false,
			});

			const callUrl = mockFetch.mock.calls[0][0] as string;
			expect(callUrl).toContain("vs_currency=usd");
			expect(callUrl).toContain("order=market_cap_desc");
			expect(callUrl).toContain("per_page=100");
			expect(callUrl).toContain("page=1");
			expect(callUrl).toContain("sparkline=false");
		});

		it("должен вернуть пустой массив если API вернул объект вместо массива", async () => {
			const mockObjectResponse = { error: "Invalid response", data: null };

			mockFetch.mockResolvedValueOnce({
				ok: true,
				status: 200,
				json: jest.fn().mockResolvedValueOnce(mockObjectResponse),
			} as unknown as Response);

			const result = await service.getMarketData();

			expect(result).toEqual([]);
		});

		it("должен вернуть пустой массив если API вернул null вместо массива", async () => {
			mockFetch.mockResolvedValueOnce({
				ok: true,
				status: 200,
				json: jest.fn().mockResolvedValueOnce(null),
			} as unknown as Response);

			const result = await service.getMarketData();

			expect(result).toEqual([]);
		});

		it("должен вернуть пустой массив если API вернул строку вместо массива", async () => {
			mockFetch.mockResolvedValueOnce({
				ok: true,
				status: 200,
				json: jest.fn().mockResolvedValueOnce("invalid response"),
			} as unknown as Response);

			const result = await service.getMarketData();

			expect(result).toEqual([]);
		});

		it("должен преобразовать данные с опциональными полями", async () => {
			const mockRawData: CryptoPriceRaw[] = [
				{
					id: "ethereum",
					symbol: "eth",
					name: "Ethereum",
					image: "https://example.com/eth.png",
					current_price: 3000,
					market_cap: 500000000,
					market_cap_rank: 2,
					fully_diluted_valuation: 600000000,
					total_volume: 30000000,
					high_24h: 3100,
					low_24h: 2900,
					price_change_24h: 100,
					price_change_percentage_24h: 3.33,
					market_cap_change_24h: 15000000,
					market_cap_change_percentage_24h: 3,
					circulating_supply: 120000000,
					total_supply: 120000000,
					max_supply: undefined,
					ath: 4000,
					ath_change_percentage: -25,
					ath_date: "2021-11-10",
					atl: 100,
					atl_change_percentage: 2900,
					atl_date: "2015-10-20",
					last_updated: "2024-01-01",
				},
			];

			const expectedData: CryptoPrice[] = [
				{
					id: "ethereum",
					symbol: "eth",
					name: "Ethereum",
					image: "https://example.com/eth.png",
					currentPrice: 3000,
					marketCap: 500000000,
					marketCapRank: 2,
					fullyDilutedValuation: 600000000,
					totalVolume: 30000000,
					high24h: 3100,
					low24h: 2900,
					priceChange24h: 100,
					priceChangePercentage24h: 3.33,
					marketCapChange24h: 15000000,
					marketCapChangePercentage24h: 3,
					circulatingSupply: 120000000,
					totalSupply: 120000000,
					maxSupply: undefined,
					ath: 4000,
					athChangePercentage: -25,
					athDate: "2021-11-10",
					atl: 100,
					atlChangePercentage: 2900,
					atlDate: "2015-10-20",
					lastUpdated: "2024-01-01",
				},
			];

			mockFetch.mockResolvedValueOnce({
				ok: true,
				status: 200,
				json: jest.fn().mockResolvedValueOnce(mockRawData),
			} as unknown as Response);

			const result = await service.getMarketData();

			expect(result).toEqual(expectedData);
		});

		it("должен получить рыночные данные с sparkline и priceChangePercentage", async () => {
			const mockRawData: CryptoPriceRaw[] = [
				{
					id: "bitcoin",
					symbol: "btc",
					name: "Bitcoin",
					image: "https://example.com/btc.png",
					current_price: 50000,
					market_cap: 1000000000,
					market_cap_rank: 1,
					total_volume: 50000000,
					high_24h: 51000,
					low_24h: 49000,
					price_change_24h: 1000,
					price_change_percentage_24h: 2,
					price_change_percentage_1h_in_currency: 0.5,
					price_change_percentage_7d_in_currency: 5.2,
					market_cap_change_24h: 20000000,
					market_cap_change_percentage_24h: 2,
					circulating_supply: 20000000,
					ath: 60000,
					ath_change_percentage: -16.67,
					ath_date: "2021-11-10",
					atl: 1000,
					atl_change_percentage: 4900,
					atl_date: "2013-01-01",
					sparkline_in_7d: {
						price: [48000, 49000, 49500, 50000, 50500, 51000, 50000],
					},
					last_updated: "2024-01-01",
				},
			];

			const expectedData: CryptoPrice[] = [
				{
					id: "bitcoin",
					symbol: "btc",
					name: "Bitcoin",
					image: "https://example.com/btc.png",
					currentPrice: 50000,
					marketCap: 1000000000,
					marketCapRank: 1,
					totalVolume: 50000000,
					high24h: 51000,
					low24h: 49000,
					priceChange24h: 1000,
					priceChangePercentage24h: 2,
					priceChangePercentage1hInCurrency: 0.5,
					priceChangePercentage7dInCurrency: 5.2,
					marketCapChange24h: 20000000,
					marketCapChangePercentage24h: 2,
					circulatingSupply: 20000000,
					ath: 60000,
					athChangePercentage: -16.67,
					athDate: "2021-11-10",
					atl: 1000,
					atlChangePercentage: 4900,
					atlDate: "2013-01-01",
					sparklineIn7d: {
						price: [48000, 49000, 49500, 50000, 50500, 51000, 50000],
					},
					lastUpdated: "2024-01-01",
				},
			];

			mockFetch.mockResolvedValueOnce({
				ok: true,
				status: 200,
				json: jest.fn().mockResolvedValueOnce(mockRawData),
			} as unknown as Response);

			const result = await service.getMarketData({
				sparkline: true,
				priceChangePercentage: "1h,24h,7d",
			});

			expect(result).toEqual(expectedData);
			const callUrl = mockFetch.mock.calls[0][0] as string;
			expect(callUrl).toContain("sparkline=true");
			expect(callUrl).toContain("price_change_percentage=1h%2C24h%2C7d");
		});

		it("должен получить рыночные данные с sparkline без priceChangePercentage", async () => {
			const mockRawData: CryptoPriceRaw[] = [
				{
					id: "ethereum",
					symbol: "eth",
					name: "Ethereum",
					image: "https://example.com/eth.png",
					current_price: 3000,
					market_cap: 500000000,
					market_cap_rank: 2,
					total_volume: 30000000,
					high_24h: 3100,
					low_24h: 2900,
					price_change_24h: 100,
					price_change_percentage_24h: 3.33,
					market_cap_change_24h: 15000000,
					market_cap_change_percentage_24h: 3,
					circulating_supply: 120000000,
					ath: 4000,
					ath_change_percentage: -25,
					ath_date: "2021-11-10",
					atl: 100,
					atl_change_percentage: 2900,
					atl_date: "2015-10-20",
					sparkline_in_7d: {
						price: [2800, 2900, 2950, 3000, 3050, 3100, 3000],
					},
					last_updated: "2024-01-01",
				},
			];

			mockFetch.mockResolvedValueOnce({
				ok: true,
				status: 200,
				json: jest.fn().mockResolvedValueOnce(mockRawData),
			} as unknown as Response);

			const result = await service.getMarketData({
				sparkline: true,
			});

			expect(result[0]).toHaveProperty("sparklineIn7d");
			expect(result[0].sparklineIn7d).toEqual({
				price: [2800, 2900, 2950, 3000, 3050, 3100, 3000],
			});
			const callUrl = mockFetch.mock.calls[0][0] as string;
			expect(callUrl).toContain("sparkline=true");
		});

		it("должен получить рыночные данные с priceChangePercentage без sparkline", async () => {
			const mockRawData: CryptoPriceRaw[] = [
				{
					id: "bitcoin",
					symbol: "btc",
					name: "Bitcoin",
					image: "https://example.com/btc.png",
					current_price: 50000,
					market_cap: 1000000000,
					market_cap_rank: 1,
					total_volume: 50000000,
					high_24h: 51000,
					low_24h: 49000,
					price_change_24h: 1000,
					price_change_percentage_24h: 2,
					price_change_percentage_1h_in_currency: 0.5,
					price_change_percentage_7d_in_currency: 5.2,
					market_cap_change_24h: 20000000,
					market_cap_change_percentage_24h: 2,
					circulating_supply: 20000000,
					ath: 60000,
					ath_change_percentage: -16.67,
					ath_date: "2021-11-10",
					atl: 1000,
					atl_change_percentage: 4900,
					atl_date: "2013-01-01",
					last_updated: "2024-01-01",
				},
			];

			mockFetch.mockResolvedValueOnce({
				ok: true,
				status: 200,
				json: jest.fn().mockResolvedValueOnce(mockRawData),
			} as unknown as Response);

			const result = await service.getMarketData({
				priceChangePercentage: "1h,24h,7d",
			});

			expect(result[0]).toHaveProperty("priceChangePercentage1hInCurrency", 0.5);
			expect(result[0]).toHaveProperty("priceChangePercentage7dInCurrency", 5.2);
			expect(result[0].sparklineIn7d).toBeUndefined();
			const callUrl = mockFetch.mock.calls[0][0] as string;
			expect(callUrl).toContain("sparkline=false");
			expect(callUrl).toContain("price_change_percentage=1h%2C24h%2C7d");
		});

		it("должен обработать данные без новых полей когда они не запрошены", async () => {
			const mockRawData: CryptoPriceRaw[] = [
				{
					id: "bitcoin",
					symbol: "btc",
					name: "Bitcoin",
					image: "https://example.com/btc.png",
					current_price: 50000,
					market_cap: 1000000000,
					market_cap_rank: 1,
					total_volume: 50000000,
					high_24h: 51000,
					low_24h: 49000,
					price_change_24h: 1000,
					price_change_percentage_24h: 2,
					market_cap_change_24h: 20000000,
					market_cap_change_percentage_24h: 2,
					circulating_supply: 20000000,
					ath: 60000,
					ath_change_percentage: -16.67,
					ath_date: "2021-11-10",
					atl: 1000,
					atl_change_percentage: 4900,
					atl_date: "2013-01-01",
					last_updated: "2024-01-01",
				},
			];

			mockFetch.mockResolvedValueOnce({
				ok: true,
				status: 200,
				json: jest.fn().mockResolvedValueOnce(mockRawData),
			} as unknown as Response);

			const result = await service.getMarketData();

			expect(result[0].sparklineIn7d).toBeUndefined();
			expect(result[0].priceChangePercentage1hInCurrency).toBeUndefined();
			expect(result[0].priceChangePercentage7dInCurrency).toBeUndefined();
			const callUrl = mockFetch.mock.calls[0][0] as string;
			expect(callUrl).toContain("sparkline=false");
		});
	});

	describe("getSimplePrices", () => {
		beforeEach(() => {
			service = new CoinGeckoService(mockOptions, mockLoggerService as unknown as LoggerService);
		});

		it("должен получить простые цены", async () => {
			const mockData: PriceData = {
				bitcoin: { usd: 50000 },
				ethereum: { usd: 3000 },
			};

			mockFetch.mockResolvedValueOnce({
				ok: true,
				status: 200,
				json: jest.fn().mockResolvedValueOnce(mockData),
			} as unknown as Response);

			const result = await service.getSimplePrices(["bitcoin", "ethereum"]);

			expect(result).toEqual(mockData);
			const callUrl = mockFetch.mock.calls[0][0] as string;
			expect(callUrl).toMatch(/ids=bitcoin(%2C|,)ethereum/);
			expect(callUrl).toContain("vs_currencies=usd");
		});

		it("должен получить простые цены с изменением за 24 часа", async () => {
			const mockData: PriceData = {
				bitcoin: { usd: 50000, usd_24h_change: 2.5 },
			};

			mockFetch.mockResolvedValueOnce({
				ok: true,
				status: 200,
				json: jest.fn().mockResolvedValueOnce(mockData),
			} as unknown as Response);

			const result = await service.getSimplePrices(["bitcoin"], true);

			expect(result).toEqual(mockData);
			const callUrl = mockFetch.mock.calls[0][0] as string;
			expect(callUrl).toContain("include_24hr_change=true");
		});
	});

	describe("getCoinDetails", () => {
		beforeEach(() => {
			service = new CoinGeckoService(mockOptions, mockLoggerService as unknown as LoggerService);
		});

		it("должен получить детальную информацию о монете", async () => {
			const mockData: CryptoDetails = {
				id: "bitcoin",
				symbol: "btc",
				name: "Bitcoin",
				platforms: {},
				categories: [],
				additionalNotices: [],
				links: {
					homepage: [],
					blockchainSite: [],
					officialForumUrl: [],
					chatUrl: [],
					announcementUrl: [],
					twitterScreenName: "",
					facebookUsername: "",
					telegramChannelIdentifier: "",
					subredditUrl: "",
					reposUrl: {
						github: [],
						bitbucket: [],
					},
				},
				image: {
					thumb: "",
					small: "",
					large: "",
				},
				description: { en: "Bitcoin description" },
				marketData: {
					currentPrice: { usd: 50000 },
					marketCap: { usd: 1000000000 },
					totalVolume: { usd: 50000000 },
					ath: {},
					athChangePercentage: {},
					athDate: {},
					atl: {},
					atlChangePercentage: {},
					atlDate: {},
					fullyDilutedValuation: {},
					high24h: {},
					low24h: {},
					priceChange24h: 0,
					priceChangePercentage24h: 0,
					priceChangePercentage7d: 0,
					priceChangePercentage14d: 0,
					priceChangePercentage30d: 0,
					priceChangePercentage60d: 0,
					priceChangePercentage200d: 0,
					priceChangePercentage1y: 0,
					marketCapChange24h: 0,
					marketCapChangePercentage24h: 0,
					priceChange24hInCurrency: {},
					priceChangePercentage1hInCurrency: {},
					priceChangePercentage24hInCurrency: {},
					priceChangePercentage7dInCurrency: {},
					priceChangePercentage14dInCurrency: {},
					priceChangePercentage30dInCurrency: {},
					priceChangePercentage60dInCurrency: {},
					priceChangePercentage200dInCurrency: {},
					priceChangePercentage1yInCurrency: {},
					marketCapChange24hInCurrency: {},
					marketCapChangePercentage24hInCurrency: {},
					circulatingSupply: 0,
					lastUpdated: "",
				},
				lastUpdated: "",
			};

			mockFetch.mockResolvedValueOnce({
				ok: true,
				status: 200,
				json: jest.fn().mockResolvedValueOnce(mockData),
			} as unknown as Response);

			const result = await service.getCoinDetails("bitcoin");

			expect(result).toEqual(mockData);
			expect(mockFetch).toHaveBeenCalledWith(
				expect.stringContaining("/coins/bitcoin"),
				expect.any(Object)
			);
		});
	});

	describe("getHistoricalData", () => {
		beforeEach(() => {
			service = new CoinGeckoService(mockOptions, mockLoggerService as unknown as LoggerService);
		});

		it("должен получить исторические данные с daily интервалом", async () => {
			const mockData: CryptoHistoricalData = {
				prices: [[1609459200000, 50000]],
				marketCaps: [[1609459200000, 1000000000]],
				totalVolumes: [[1609459200000, 50000000]],
			};

			mockFetch.mockResolvedValueOnce({
				ok: true,
				status: 200,
				json: jest.fn().mockResolvedValueOnce(mockData),
			} as unknown as Response);

			const result = await service.getHistoricalData("bitcoin", 7, "daily");

			expect(result).toEqual(mockData);
			const callUrl = mockFetch.mock.calls[0][0] as string;
			expect(callUrl).toContain("/coins/bitcoin/market_chart");
			expect(callUrl).toContain("days=7");
			expect(callUrl).not.toContain("interval");
		});

		it("должен получить исторические данные с дефолтным daily интервалом", async () => {
			const mockData: CryptoHistoricalData = {
				prices: [[1609459200000, 50000]],
				marketCaps: [[1609459200000, 1000000000]],
				totalVolumes: [[1609459200000, 50000000]],
			};

			mockFetch.mockResolvedValueOnce({
				ok: true,
				status: 200,
				json: jest.fn().mockResolvedValueOnce(mockData),
			} as unknown as Response);

			const result = await service.getHistoricalData("bitcoin", 7);

			expect(result).toEqual(mockData);
			const callUrl = mockFetch.mock.calls[0][0] as string;
			expect(callUrl).toContain("/coins/bitcoin/market_chart");
			expect(callUrl).toContain("days=7");
			expect(callUrl).not.toContain("interval");
		});

		it("должен получить исторические данные с hourly интервалом", async () => {
			const mockData: CryptoHistoricalData = {
				prices: [[1609459200000, 50000]],
				marketCaps: [[1609459200000, 1000000000]],
				totalVolumes: [[1609459200000, 50000000]],
			};

			mockFetch.mockResolvedValueOnce({
				ok: true,
				status: 200,
				json: jest.fn().mockResolvedValueOnce(mockData),
			} as unknown as Response);

			const result = await service.getHistoricalData("bitcoin", 1, "hourly");

			expect(result).toEqual(mockData);
			const callUrl = mockFetch.mock.calls[0][0] as string;
			expect(callUrl).toContain("interval=hourly");
		});
	});

	describe("searchCoins", () => {
		beforeEach(() => {
			service = new CoinGeckoService(mockOptions, mockLoggerService as unknown as LoggerService);
		});

		it("должен выполнить поиск монет", async () => {
			const mockData = {
				coins: [
					{
						id: "bitcoin",
						name: "Bitcoin",
						symbol: "btc",
						marketCapRank: 1,
						thumb: "https://example.com/btc.png",
						large: "https://example.com/btc-large.png",
					},
				] as CryptoSearchResult[],
			};

			mockFetch.mockResolvedValueOnce({
				ok: true,
				status: 200,
				json: jest.fn().mockResolvedValueOnce(mockData),
			} as unknown as Response);

			const result = await service.searchCoins("bitcoin");

			expect(result).toEqual(mockData.coins);
			const callUrl = mockFetch.mock.calls[0][0] as string;
			expect(callUrl).toContain("/search");
			expect(callUrl).toContain("query=bitcoin");
		});

		it("должен вернуть пустой массив если coins отсутствует", async () => {
			const mockData = {};

			mockFetch.mockResolvedValueOnce({
				ok: true,
				status: 200,
				json: jest.fn().mockResolvedValueOnce(mockData),
			} as unknown as Response);

			const result = await service.searchCoins("bitcoin");

			expect(result).toEqual([]);
		});
	});

	describe("getTrendingCoins", () => {
		beforeEach(() => {
			service = new CoinGeckoService(mockOptions, mockLoggerService as unknown as LoggerService);
		});

		it("должен получить трендовые монеты", async () => {
			const mockData = {
				coins: [
					{
						item: {
							id: "bitcoin",
							name: "Bitcoin",
							symbol: "btc",
							marketCapRank: 1,
							thumb: "https://example.com/btc.png",
							large: "https://example.com/btc-large.png",
						},
					},
				] as TrendingCrypto[],
			};

			mockFetch.mockResolvedValueOnce({
				ok: true,
				status: 200,
				json: jest.fn().mockResolvedValueOnce(mockData),
			} as unknown as Response);

			const result = await service.getTrendingCoins();

			expect(result).toEqual(mockData.coins);
			expect(mockFetch).toHaveBeenCalledWith(
				expect.stringContaining("/search/trending"),
				expect.any(Object)
			);
		});

		it("должен вернуть пустой массив если coins отсутствует", async () => {
			const mockData = {};

			mockFetch.mockResolvedValueOnce({
				ok: true,
				status: 200,
				json: jest.fn().mockResolvedValueOnce(mockData),
			} as unknown as Response);

			const result = await service.getTrendingCoins();

			expect(result).toEqual([]);
		});
	});

	describe("getGlobalMarketData", () => {
		beforeEach(() => {
			service = new CoinGeckoService(mockOptions, mockLoggerService as unknown as LoggerService);
		});

		it("должен получить глобальные метрики рынка", async () => {
			const mockData: CryptoMarketData = {
				data: {
					activeCryptocurrencies: 10000,
					upcomingIcos: 0,
					ongoingIcos: 0,
					endedIcos: 0,
					markets: 500,
					totalMarketCap: { usd: 2000000000000 },
					totalVolume: { usd: 100000000000 },
					marketCapPercentage: { btc: 50, eth: 20 },
					marketCapChangePercentage24hUsd: 2.5,
					updatedAt: 1234567890,
				},
			};

			mockFetch.mockResolvedValueOnce({
				ok: true,
				status: 200,
				json: jest.fn().mockResolvedValueOnce(mockData),
			} as unknown as Response);

			const result = await service.getGlobalMarketData();

			expect(result).toEqual(mockData);
			expect(mockFetch).toHaveBeenCalledWith(expect.stringContaining("/global"), expect.any(Object));
		});
	});
});
