import type { CryptoPrice, CryptoPriceRaw } from "src/types/api-types";

// Преобразует сырые данные от API (snake_case) в наш формат (camelCase)
export default function transformRawPrice(raw: CryptoPriceRaw): CryptoPrice {
	return {
		id: raw.id,
		symbol: raw.symbol,
		name: raw.name,
		image: raw.image,
		currentPrice: raw.current_price,
		marketCap: raw.market_cap,
		marketCapRank: raw.market_cap_rank,
		fullyDilutedValuation: raw.fully_diluted_valuation,
		totalVolume: raw.total_volume,
		high24h: raw.high_24h,
		low24h: raw.low_24h,
		priceChange24h: raw.price_change_24h,
		priceChangePercentage24h: raw.price_change_percentage_24h,
		marketCapChange24h: raw.market_cap_change_24h,
		marketCapChangePercentage24h: raw.market_cap_change_percentage_24h,
		circulatingSupply: raw.circulating_supply,
		totalSupply: raw.total_supply,
		maxSupply: raw.max_supply,
		ath: raw.ath,
		athChangePercentage: raw.ath_change_percentage,
		athDate: raw.ath_date,
		atl: raw.atl,
		atlChangePercentage: raw.atl_change_percentage,
		atlDate: raw.atl_date,
		lastUpdated: raw.last_updated,
	};
}
