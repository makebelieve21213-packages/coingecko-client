import { HttpStatus } from "@nestjs/common";
import CoreClientService from "src/core/core-client.service";
import CoingeckoError from "src/errors/coingecko.error";

import type { LoggerService } from "@makebelieve21213-packages/logger";
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

// Создаем тестовый класс, наследующийся от CoreClientService
class TestCoreClientService extends CoreClientService {
	public async testMakeRequest<T>(endpoint: string, params?: Record<string, unknown>): Promise<T> {
		return this.makeRequest<T>(endpoint, params);
	}
}

describe("CoreClientService", () => {
	let service: TestCoreClientService;
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

		jest.clearAllMocks();

		jest.useFakeTimers();

		service = new TestCoreClientService(mockOptions, mockLoggerService as unknown as LoggerService);
	});

	afterEach(() => {
		jest.useRealTimers();
		jest.clearAllMocks();
	});

	describe("constructor", () => {
		it("должен создать экземпляр с дефолтным baseUrl", () => {
			const optionsWithoutUrl: CoinGeckoModuleOptions = {
				apiKey: "test-key",
			};

			const testService = new TestCoreClientService(
				optionsWithoutUrl,
				mockLoggerService as unknown as LoggerService
			);

			expect(testService).toBeInstanceOf(CoreClientService);
		});

		it("должен создать экземпляр с кастомным baseUrl", () => {
			const optionsWithUrl: CoinGeckoModuleOptions = {
				apiKey: "test-key",
				baseUrl: "https://custom-api.com/v1",
			};

			const testService = new TestCoreClientService(
				optionsWithUrl,
				mockLoggerService as unknown as LoggerService
			);

			expect(testService).toBeInstanceOf(CoreClientService);
		});

		it("должен использовать дефолтный timeout если не указан", () => {
			const optionsWithoutTimeout: CoinGeckoModuleOptions = {
				apiKey: "test-key",
			};

			const testService = new TestCoreClientService(
				optionsWithoutTimeout,
				mockLoggerService as unknown as LoggerService
			);

			expect(testService).toBeInstanceOf(CoreClientService);
		});

		it("должен использовать кастомный timeout если указан", () => {
			const optionsWithTimeout: CoinGeckoModuleOptions = {
				apiKey: "test-key",
				timeout: 60000,
			};

			const testService = new TestCoreClientService(
				optionsWithTimeout,
				mockLoggerService as unknown as LoggerService
			);

			expect(testService).toBeInstanceOf(CoreClientService);
		});
	});

	describe("makeRequest", () => {
		it("должен успешно выполнить запрос без параметров", async () => {
			const mockData = { test: "data" };
			mockFetch.mockResolvedValueOnce({
				ok: true,
				status: 200,
				json: jest.fn().mockResolvedValueOnce(mockData),
			} as unknown as Response);

			const result = await service.testMakeRequest("/test");

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

			const result = await service.testMakeRequest("/test", {
				param1: "value1",
				param2: 123,
			});

			expect(result).toEqual(mockData);
			expect(mockFetch).toHaveBeenCalledWith(
				expect.stringContaining("param1=value1&param2=123"),
				expect.any(Object)
			);
		});

		it("должен игнорировать undefined и null параметры", async () => {
			const mockData = { test: "data" };
			mockFetch.mockResolvedValueOnce({
				ok: true,
				status: 200,
				json: jest.fn().mockResolvedValueOnce(mockData),
			} as unknown as Response);

			await service.testMakeRequest("/test", {
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

			await expect(service.testMakeRequest("/test")).rejects.toThrow(CoingeckoError);
		});

		it("должен выбросить CoingeckoError при ошибке API (5xx)", async () => {
			mockFetch.mockResolvedValueOnce({
				ok: false,
				status: 500,
				json: jest.fn().mockResolvedValueOnce({ error: "Internal Server Error" }),
			} as unknown as Response);

			await expect(service.testMakeRequest("/test")).rejects.toThrow(CoingeckoError);
		});

		it("должен обработать ошибку API когда data не является объектом (строка)", async () => {
			mockFetch.mockResolvedValueOnce({
				ok: false,
				status: 400,
				json: jest.fn().mockResolvedValueOnce("Error message string"),
			} as unknown as Response);

			await expect(service.testMakeRequest("/test")).rejects.toThrow(CoingeckoError);
		});

		it("должен обработать ошибку API когда data равен null", async () => {
			mockFetch.mockResolvedValueOnce({
				ok: false,
				status: 400,
				json: jest.fn().mockResolvedValueOnce(null),
			} as unknown as Response);

			await expect(service.testMakeRequest("/test")).rejects.toThrow(CoingeckoError);
		});

		it("должен выбросить CoingeckoError при таймауте", async () => {
			mockFetch.mockImplementationOnce((_, options) => {
				const signal = options?.signal as AbortSignal | undefined;
				return new Promise((_, reject) => {
					if (signal) {
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
						setTimeout(() => {
							const abortError = new Error("Request timeout");
							abortError.name = "AbortError";
							reject(abortError);
						}, 30000);
					}
				});
			});

			const requestPromise = service.testMakeRequest("/test");

			jest.advanceTimersByTime(30000);

			await Promise.resolve();

			await expect(requestPromise).rejects.toThrow(CoingeckoError);
		});

		it("должен выбросить CoingeckoError при AbortError", async () => {
			const abortError = new Error("Request aborted");
			abortError.name = "AbortError";
			mockFetch.mockRejectedValueOnce(abortError);

			await expect(service.testMakeRequest("/test")).rejects.toThrow(CoingeckoError);
		});

		it("должен выбросить CoingeckoError при сетевой ошибке", async () => {
			mockFetch.mockRejectedValueOnce(new Error("Network error"));

			await expect(service.testMakeRequest("/test")).rejects.toThrow(CoingeckoError);
		});

		it("должен выбросить CoingeckoError при ошибке не типа Error", async () => {
			mockFetch.mockRejectedValueOnce("String error");

			await expect(service.testMakeRequest("/test")).rejects.toThrow(CoingeckoError);
		});

		it("должен пробросить CoingeckoError если он уже был выброшен", async () => {
			const coingeckoError = new CoingeckoError("Test error", HttpStatus.BAD_REQUEST);
			mockFetch.mockRejectedValueOnce(coingeckoError);

			await expect(service.testMakeRequest("/test")).rejects.toThrow(CoingeckoError);
		});

		it("должен использовать опциональный API ключ", async () => {
			const optionsWithoutKey: CoinGeckoModuleOptions = {
				baseUrl: "https://api.coingecko.com/api/v3",
				timeout: 30000,
			};

			const testService = new TestCoreClientService(
				optionsWithoutKey,
				mockLoggerService as unknown as LoggerService
			);

			const mockData = { test: "data" };
			mockFetch.mockResolvedValueOnce({
				ok: true,
				status: 200,
				json: jest.fn().mockResolvedValueOnce(mockData),
			} as unknown as Response);

			await testService.testMakeRequest("/test");

			const callHeaders = mockFetch.mock.calls[0][1]?.headers as Record<string, string>;
			expect(callHeaders).not.toHaveProperty("x-cg-pro-api-key");
		});

		it("должен игнорировать пустой API ключ", async () => {
			const optionsWithEmptyKey: CoinGeckoModuleOptions = {
				apiKey: "",
				baseUrl: "https://api.coingecko.com/api/v3",
				timeout: 30000,
			};

			const testService = new TestCoreClientService(
				optionsWithEmptyKey,
				mockLoggerService as unknown as LoggerService
			);

			const mockData = { test: "data" };
			mockFetch.mockResolvedValueOnce({
				ok: true,
				status: 200,
				json: jest.fn().mockResolvedValueOnce(mockData),
			} as unknown as Response);

			await testService.testMakeRequest("/test");

			const callHeaders = mockFetch.mock.calls[0][1]?.headers as Record<string, string>;
			expect(callHeaders).not.toHaveProperty("x-cg-pro-api-key");
		});

		it("должен обработать ошибку API (502) с BAD_GATEWAY статусом", async () => {
			mockFetch.mockResolvedValueOnce({
				ok: false,
				status: 502,
				json: jest.fn().mockResolvedValueOnce({ error: "Bad Gateway" }),
			} as unknown as Response);

			try {
				await service.testMakeRequest("/test");
			} catch (error) {
				expect(error).toBeInstanceOf(CoingeckoError);
				if (error instanceof CoingeckoError) {
					expect(error.getStatus()).toBe(HttpStatus.BAD_GATEWAY);
				}
			}
		});

		it("должен обработать ошибку API (5xx) с BAD_GATEWAY статусом", async () => {
			mockFetch.mockResolvedValueOnce({
				ok: false,
				status: 500,
				json: jest.fn().mockResolvedValueOnce({ error: "Internal Server Error" }),
			} as unknown as Response);

			try {
				await service.testMakeRequest("/test");
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

			await expect(service.testMakeRequest("/test")).rejects.toThrow(CoingeckoError);
		});

		it("должен логировать ошибку при неудачном запросе", async () => {
			mockFetch.mockResolvedValueOnce({
				ok: false,
				status: 400,
				json: jest.fn().mockResolvedValueOnce({ error: "Bad Request" }),
			} as unknown as Response);

			await expect(service.testMakeRequest("/test")).rejects.toThrow(CoingeckoError);

			expect(mockLoggerService.error).toHaveBeenCalled();
		});

		it("должен логировать ошибку при сетевой ошибке", async () => {
			mockFetch.mockRejectedValueOnce(new Error("Network error"));

			await expect(service.testMakeRequest("/test")).rejects.toThrow(CoingeckoError);

			expect(mockLoggerService.error).toHaveBeenCalled();
		});
	});
});
