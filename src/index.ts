export { default as CoinGeckoModule } from "src/main/coingecko-client.module";
export { default as CoinGeckoService } from "src/main/coingecko-client.service";
export { default as CoingeckoError } from "src/errors/coingecko.error";

export type {
	CoinGeckoModuleOptions,
	CoinGeckoModuleAsyncOptions,
} from "src/types/module-options.interface";
export type * from "src/types/api-types";
