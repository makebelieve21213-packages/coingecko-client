import { LoggerService } from "@makebelieve21213-packages/logger";
import { Module, Global, DynamicModule, Provider } from "@nestjs/common";
import CoinGeckoService from "src/main/coingecko-client.service";
import {
	CoinGeckoModuleOptions,
	CoinGeckoModuleAsyncOptions,
} from "src/types/module-options.interface";
import { COINGECKO_CLIENT_OPTIONS } from "src/utils/injection-keys";

// Глобальный модуль для CoinGecko API клиента
@Global()
@Module({})
export default class CoinGeckoModule {
	// Регистрация модуля с динамическими опциями через useFactory
	static forRootAsync<T extends unknown[]>(options: CoinGeckoModuleAsyncOptions<T>): DynamicModule {
		const providers: Provider[] = [
			{
				provide: COINGECKO_CLIENT_OPTIONS,
				useFactory: options.useFactory,
				inject: options.inject || [],
			},
			{
				provide: CoinGeckoService,
				useFactory: (
					moduleOptions: CoinGeckoModuleOptions,
					logger: LoggerService
				): CoinGeckoService => {
					return new CoinGeckoService(moduleOptions, logger);
				},
				inject: [COINGECKO_CLIENT_OPTIONS, LoggerService],
			},
		];

		return {
			module: CoinGeckoModule,
			imports: options.imports || [],
			providers,
			exports: [CoinGeckoService],
		};
	}
}
