import type { InjectionToken, ModuleMetadata, OptionalFactoryDependency } from "@nestjs/common";

// Опции конфигурации для CoinGecko Client модуля
export interface CoinGeckoModuleOptions {
	// API ключ CoinGecko (опционально, для Pro API)
	apiKey?: string;
	// Базовый URL API (по умолчанию https://api.coingecko.com/api/v3)
	baseUrl?: string;
	// Таймаут запросов в миллисекундах (по умолчанию 30000)
	timeout?: number;
}

// Тип для функции фабрики с динамическими аргументами
type CoinGeckoModuleOptionsFactory<T extends unknown[] = []> = (
	...args: T
) => Promise<CoinGeckoModuleOptions> | CoinGeckoModuleOptions;

// Асинхронные опции для динамической конфигурации модуля через useFactory
export interface CoinGeckoModuleAsyncOptions<T extends unknown[] = []>
	extends Pick<ModuleMetadata, "imports"> {
	useFactory: CoinGeckoModuleOptionsFactory<T>;
	inject?: (InjectionToken | OptionalFactoryDependency)[];
}
