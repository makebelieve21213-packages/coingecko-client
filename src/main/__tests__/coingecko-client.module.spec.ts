import { LoggerService } from "@makebelieve21213-packages/logger";
import { Module } from "@nestjs/common";
import { Test } from "@nestjs/testing";
import CoinGeckoModule from "src/main/coingecko-client.module";
import CoinGeckoService from "src/main/coingecko-client.service";
import { COINGECKO_CLIENT_OPTIONS } from "src/utils/injection-keys";

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

// Тестовый модуль для предоставления LoggerService
@Module({
	providers: [
		{
			provide: LoggerService,
			useValue: mockLoggerService,
		},
	],
	exports: [LoggerService],
})
class TestLoggerModule {}

describe("CoinGeckoModule", () => {
	describe("forRootAsync", () => {
		it("должен создать модуль с синхронной фабрикой", async () => {
			const options: CoinGeckoModuleOptions = {
				apiKey: "test-api-key",
				baseUrl: "https://api.coingecko.com/api/v3",
				timeout: 30000,
			};

			const module = await Test.createTestingModule({
				imports: [
					TestLoggerModule,
					CoinGeckoModule.forRootAsync({
						imports: [TestLoggerModule],
						useFactory: () => options,
					}),
				],
			}).compile();

			const service = module.get<CoinGeckoService>(CoinGeckoService);
			const optionsToken = module.get<CoinGeckoModuleOptions>(COINGECKO_CLIENT_OPTIONS);

			expect(service).toBeInstanceOf(CoinGeckoService);
			expect(optionsToken).toEqual(options);
		});

		it("должен создать модуль с асинхронной фабрикой", async () => {
			const options: CoinGeckoModuleOptions = {
				apiKey: "test-api-key",
			};

			const module = await Test.createTestingModule({
				imports: [
					TestLoggerModule,
					CoinGeckoModule.forRootAsync({
						imports: [TestLoggerModule],
						useFactory: async () => {
							await new Promise((resolve) => setTimeout(resolve, 10));
							return options;
						},
					}),
				],
			}).compile();

			const service = module.get<CoinGeckoService>(CoinGeckoService);

			expect(service).toBeInstanceOf(CoinGeckoService);
		});

		it("должен создать модуль с inject зависимостями", async () => {
			const options: CoinGeckoModuleOptions = {
				apiKey: "test-api-key",
			};

			// Создаем отдельный модуль с провайдером для тестирования inject
			@Module({
				providers: [
					{
						provide: "TEST_CONFIG_TOKEN",
						useValue: options,
					},
				],
				exports: ["TEST_CONFIG_TOKEN"],
			})
			class TestConfigModule {}

			const module = await Test.createTestingModule({
				imports: [
					TestLoggerModule,
					TestConfigModule,
					CoinGeckoModule.forRootAsync({
						imports: [TestLoggerModule, TestConfigModule],
						useFactory: (injectedOptions: CoinGeckoModuleOptions) => injectedOptions,
						inject: ["TEST_CONFIG_TOKEN"],
					}),
				],
			}).compile();

			const service = module.get<CoinGeckoService>(CoinGeckoService);

			expect(service).toBeInstanceOf(CoinGeckoService);
		});

		it("должен создать модуль с imports", async () => {
			const options: CoinGeckoModuleOptions = {
				apiKey: "test-api-key",
			};

			const TestModule = class TestModule {};

			const module = await Test.createTestingModule({
				imports: [
					TestLoggerModule,
					CoinGeckoModule.forRootAsync({
						imports: [TestLoggerModule, TestModule],
						useFactory: () => options,
					}),
				],
			}).compile();

			const service = module.get<CoinGeckoService>(CoinGeckoService);

			expect(service).toBeInstanceOf(CoinGeckoService);
		});

		it("должен экспортировать CoinGeckoService", async () => {
			const options: CoinGeckoModuleOptions = {
				apiKey: "test-api-key",
			};

			const module = await Test.createTestingModule({
				imports: [
					TestLoggerModule,
					CoinGeckoModule.forRootAsync({
						imports: [TestLoggerModule],
						useFactory: () => options,
					}),
				],
			}).compile();

			const service = module.get<CoinGeckoService>(CoinGeckoService);

			expect(service).toBeDefined();
		});

		it("должен создать модуль без inject если не указан", async () => {
			const options: CoinGeckoModuleOptions = {
				apiKey: "test-api-key",
			};

			const module = await Test.createTestingModule({
				imports: [
					TestLoggerModule,
					CoinGeckoModule.forRootAsync({
						imports: [TestLoggerModule],
						useFactory: () => options,
					}),
				],
			}).compile();

			const service = module.get<CoinGeckoService>(CoinGeckoService);

			expect(service).toBeInstanceOf(CoinGeckoService);
		});

		it("должен создать модуль без imports если не указан", async () => {
			const options: CoinGeckoModuleOptions = {
				apiKey: "test-api-key",
			};

			const dynamicModule = CoinGeckoModule.forRootAsync({
				useFactory: () => options,
			} as { useFactory: () => CoinGeckoModuleOptions });

			expect(dynamicModule.imports).toEqual([]);
			expect(dynamicModule.providers).toBeDefined();
			expect(dynamicModule.exports).toEqual([CoinGeckoService]);
		});

		it("должен создать модуль с пустым массивом inject", async () => {
			const options: CoinGeckoModuleOptions = {
				apiKey: "test-api-key",
			};

			const module = await Test.createTestingModule({
				imports: [
					TestLoggerModule,
					CoinGeckoModule.forRootAsync({
						imports: [TestLoggerModule],
						useFactory: () => options,
						inject: [],
					}),
				],
			}).compile();

			const service = module.get<CoinGeckoService>(CoinGeckoService);

			expect(service).toBeInstanceOf(CoinGeckoService);
		});
	});
});
