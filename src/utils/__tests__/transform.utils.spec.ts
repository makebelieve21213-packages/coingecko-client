import transformRawPrice from "src/utils/transform.utils";

import type { CryptoPriceRaw } from "src/types/api-types";

describe("transformRawPrice", () => {
	it("должен преобразовать все поля из snake_case в camelCase", () => {
		const raw: CryptoPriceRaw = {
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
		};

		const result = transformRawPrice(raw);

		expect(result).toEqual({
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
		});
	});

	it("должен преобразовать данные с опциональными полями", () => {
		const raw: CryptoPriceRaw = {
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
			max_supply: 120000000,
			ath: 4000,
			ath_change_percentage: -25,
			ath_date: "2021-11-10",
			atl: 100,
			atl_change_percentage: 2900,
			atl_date: "2015-10-20",
			last_updated: "2024-01-01",
		};

		const result = transformRawPrice(raw);

		expect(result).toEqual({
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
			maxSupply: 120000000,
			ath: 4000,
			athChangePercentage: -25,
			athDate: "2021-11-10",
			atl: 100,
			atlChangePercentage: 2900,
			atlDate: "2015-10-20",
			lastUpdated: "2024-01-01",
		});
	});

	it("должен обработать данные без опциональных полей", () => {
		const raw: CryptoPriceRaw = {
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
		};

		const result = transformRawPrice(raw);

		expect(result.fullyDilutedValuation).toBeUndefined();
		expect(result.totalSupply).toBeUndefined();
		expect(result.maxSupply).toBeUndefined();
	});

	it("должен обработать данные с undefined опциональными полями", () => {
		const raw: CryptoPriceRaw = {
			id: "bitcoin",
			symbol: "btc",
			name: "Bitcoin",
			image: "https://example.com/btc.png",
			current_price: 50000,
			market_cap: 1000000000,
			market_cap_rank: 1,
			fully_diluted_valuation: undefined,
			total_volume: 50000000,
			high_24h: 51000,
			low_24h: 49000,
			price_change_24h: 1000,
			price_change_percentage_24h: 2,
			market_cap_change_24h: 20000000,
			market_cap_change_percentage_24h: 2,
			circulating_supply: 20000000,
			total_supply: undefined,
			max_supply: undefined,
			ath: 60000,
			ath_change_percentage: -16.67,
			ath_date: "2021-11-10",
			atl: 1000,
			atl_change_percentage: 4900,
			atl_date: "2013-01-01",
			last_updated: "2024-01-01",
		};

		const result = transformRawPrice(raw);

		expect(result.fullyDilutedValuation).toBeUndefined();
		expect(result.totalSupply).toBeUndefined();
		expect(result.maxSupply).toBeUndefined();
	});

	it("должен обработать нулевые значения", () => {
		const raw: CryptoPriceRaw = {
			id: "bitcoin",
			symbol: "btc",
			name: "Bitcoin",
			image: "https://example.com/btc.png",
			current_price: 0,
			market_cap: 0,
			market_cap_rank: 0,
			total_volume: 0,
			high_24h: 0,
			low_24h: 0,
			price_change_24h: 0,
			price_change_percentage_24h: 0,
			market_cap_change_24h: 0,
			market_cap_change_percentage_24h: 0,
			circulating_supply: 0,
			ath: 0,
			ath_change_percentage: 0,
			ath_date: "2021-11-10",
			atl: 0,
			atl_change_percentage: 0,
			atl_date: "2013-01-01",
			last_updated: "2024-01-01",
		};

		const result = transformRawPrice(raw);

		expect(result.currentPrice).toBe(0);
		expect(result.marketCap).toBe(0);
		expect(result.marketCapRank).toBe(0);
		expect(result.priceChange24h).toBe(0);
		expect(result.priceChangePercentage24h).toBe(0);
	});

	it("должен обработать отрицательные значения", () => {
		const raw: CryptoPriceRaw = {
			id: "bitcoin",
			symbol: "btc",
			name: "Bitcoin",
			image: "https://example.com/btc.png",
			current_price: -100,
			market_cap: 1000000000,
			market_cap_rank: 1,
			total_volume: 50000000,
			high_24h: 51000,
			low_24h: 49000,
			price_change_24h: -1000,
			price_change_percentage_24h: -2,
			market_cap_change_24h: -20000000,
			market_cap_change_percentage_24h: -2,
			circulating_supply: 20000000,
			ath: 60000,
			ath_change_percentage: -16.67,
			ath_date: "2021-11-10",
			atl: 1000,
			atl_change_percentage: 4900,
			atl_date: "2013-01-01",
			last_updated: "2024-01-01",
		};

		const result = transformRawPrice(raw);

		expect(result.currentPrice).toBe(-100);
		expect(result.priceChange24h).toBe(-1000);
		expect(result.priceChangePercentage24h).toBe(-2);
		expect(result.marketCapChange24h).toBe(-20000000);
		expect(result.marketCapChangePercentage24h).toBe(-2);
	});

	it("должен обработать очень большие числа", () => {
		const raw: CryptoPriceRaw = {
			id: "bitcoin",
			symbol: "btc",
			name: "Bitcoin",
			image: "https://example.com/btc.png",
			current_price: 999999999999,
			market_cap: 999999999999999,
			market_cap_rank: 1,
			total_volume: 99999999999,
			high_24h: 999999999999,
			low_24h: 999999999999,
			price_change_24h: 99999999999,
			price_change_percentage_24h: 999.99,
			market_cap_change_24h: 999999999999,
			market_cap_change_percentage_24h: 999.99,
			circulating_supply: 999999999999,
			ath: 999999999999,
			ath_change_percentage: 999.99,
			ath_date: "2021-11-10",
			atl: 1,
			atl_change_percentage: 99999999,
			atl_date: "2013-01-01",
			last_updated: "2024-01-01",
		};

		const result = transformRawPrice(raw);

		expect(result.currentPrice).toBe(999999999999);
		expect(result.marketCap).toBe(999999999999999);
		expect(result.priceChangePercentage24h).toBe(999.99);
	});

	it("должен сохранить строковые значения как есть", () => {
		const raw: CryptoPriceRaw = {
			id: "custom-id-123",
			symbol: "CUSTOM",
			name: "Custom Coin Name",
			image: "https://custom.com/image.png",
			current_price: 100,
			market_cap: 1000000,
			market_cap_rank: 100,
			total_volume: 50000,
			high_24h: 110,
			low_24h: 90,
			price_change_24h: 10,
			price_change_percentage_24h: 10,
			market_cap_change_24h: 100000,
			market_cap_change_percentage_24h: 10,
			circulating_supply: 1000000,
			ath: 200,
			ath_change_percentage: -50,
			ath_date: "2020-01-01",
			atl: 50,
			atl_change_percentage: 100,
			atl_date: "2019-01-01",
			last_updated: "2024-12-31T23:59:59Z",
		};

		const result = transformRawPrice(raw);

		expect(result.id).toBe("custom-id-123");
		expect(result.symbol).toBe("CUSTOM");
		expect(result.name).toBe("Custom Coin Name");
		expect(result.image).toBe("https://custom.com/image.png");
		expect(result.athDate).toBe("2020-01-01");
		expect(result.atlDate).toBe("2019-01-01");
		expect(result.lastUpdated).toBe("2024-12-31T23:59:59Z");
	});
});
