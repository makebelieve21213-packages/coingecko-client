// Типы для CoinGecko API запросов и ответов

export interface CryptoPriceRaw {
	id: string;
	symbol: string;
	name: string;
	image: string;
	current_price: number;
	market_cap: number;
	market_cap_rank: number;
	fully_diluted_valuation?: number;
	total_volume: number;
	high_24h: number;
	low_24h: number;
	price_change_24h: number;
	price_change_percentage_24h: number;
	market_cap_change_24h: number;
	market_cap_change_percentage_24h: number;
	circulating_supply: number;
	total_supply?: number;
	max_supply?: number;
	ath: number;
	ath_change_percentage: number;
	ath_date: string;
	atl: number;
	atl_change_percentage: number;
	atl_date: string;
	last_updated: string;
}

export interface MarketDataParams {
	vsCurrency?: string;
	ids?: string;
	category?: string;
	order?: string;
	perPage?: number;
	page?: number;
	sparkline?: boolean;
	priceChangePercentage?: string;
}

export interface CryptoPrice {
	id: string;
	symbol: string;
	name: string;
	image: string;
	currentPrice: number;
	marketCap: number;
	marketCapRank: number;
	fullyDilutedValuation?: number;
	totalVolume: number;
	high24h: number;
	low24h: number;
	priceChange24h: number;
	priceChangePercentage24h: number;
	marketCapChange24h: number;
	marketCapChangePercentage24h: number;
	circulatingSupply: number;
	totalSupply?: number;
	maxSupply?: number;
	ath: number;
	athChangePercentage: number;
	athDate: string;
	atl: number;
	atlChangePercentage: number;
	atlDate: string;
	lastUpdated: string;
}

export interface PriceData {
	[id: string]: Record<string, number>;
}

export interface CryptoDetails {
	id: string;
	symbol: string;
	name: string;
	assetPlatformId?: string;
	platforms: Record<string, string>;
	blockTimeInMinutes?: number;
	hashingAlgorithm?: string;
	categories: string[];
	publicNotice?: string;
	additionalNotices: unknown[];
	description: {
		en: string;
	};
	links: {
		homepage: string[];
		blockchainSite: string[];
		officialForumUrl: string[];
		chatUrl: string[];
		announcementUrl: string[];
		twitterScreenName: string;
		facebookUsername: string;
		bitcointalkThreadIdentifier?: number;
		telegramChannelIdentifier: string;
		subredditUrl: string;
		reposUrl: {
			github: string[];
			bitbucket: string[];
		};
	};
	image: {
		thumb: string;
		small: string;
		large: string;
	};
	countryOrigin?: string;
	genesisDate?: string;
	contractAddress?: string;
	sentimentVotesUpPercentage?: number;
	sentimentVotesDownPercentage?: number;
	icoData?: unknown;
	marketCapRank?: number;
	coingeckoRank?: number;
	coingeckoScore?: number;
	developerScore?: number;
	communityScore?: number;
	liquidityScore?: number;
	publicInterestScore?: number;
	marketData: {
		currentPrice: Record<string, number>;
		totalValueLocked?: unknown;
		mcapToTvlRatio?: unknown;
		fdvToTvlRatio?: unknown;
		roi?: unknown;
		ath: Record<string, number>;
		athChangePercentage: Record<string, number>;
		athDate: Record<string, string>;
		atl: Record<string, number>;
		atlChangePercentage: Record<string, number>;
		atlDate: Record<string, string>;
		marketCap: Record<string, number>;
		marketCapRank?: number;
		fullyDilutedValuation: Record<string, number>;
		totalVolume: Record<string, number>;
		high24h: Record<string, number>;
		low24h: Record<string, number>;
		priceChange24h: number;
		priceChangePercentage24h: number;
		priceChangePercentage7d: number;
		priceChangePercentage14d: number;
		priceChangePercentage30d: number;
		priceChangePercentage60d: number;
		priceChangePercentage200d: number;
		priceChangePercentage1y: number;
		marketCapChange24h: number;
		marketCapChangePercentage24h: number;
		priceChange24hInCurrency: Record<string, number>;
		priceChangePercentage1hInCurrency: Record<string, number>;
		priceChangePercentage24hInCurrency: Record<string, number>;
		priceChangePercentage7dInCurrency: Record<string, number>;
		priceChangePercentage14dInCurrency: Record<string, number>;
		priceChangePercentage30dInCurrency: Record<string, number>;
		priceChangePercentage60dInCurrency: Record<string, number>;
		priceChangePercentage200dInCurrency: Record<string, number>;
		priceChangePercentage1yInCurrency: Record<string, number>;
		marketCapChange24hInCurrency: Record<string, number>;
		marketCapChangePercentage24hInCurrency: Record<string, number>;
		totalSupply?: number;
		maxSupply?: number;
		circulatingSupply: number;
		lastUpdated: string;
	};
	communityData?: {
		facebookLikes?: number;
		twitterFollowers?: number;
		redditAveragePosts48h?: number;
		redditAverageComments48h?: number;
		redditSubscribers?: number;
		redditAccountsActive48h?: number;
		telegramChannelUserCount?: number;
	};
	developerData?: {
		forks?: number;
		stars?: number;
		subscribers?: number;
		totalIssues?: number;
		closedIssues?: number;
		pullRequestsMerged?: number;
		pullRequestContributors?: number;
		codeAdditionsDeletions4Weeks?: {
			additions?: number;
			deletions?: number;
		};
		commitCount4Weeks?: number;
	};
	publicInterestStats?: {
		alexaRank?: number;
		bingMatches?: number;
	};
	statusUpdates?: unknown[];
	lastUpdated: string;
	tickers?: unknown[];
}

export interface CryptoHistoricalData {
	prices: [number, number][];
	marketCaps: [number, number][];
	totalVolumes: [number, number][];
}

export interface CryptoSearchResult {
	id: string;
	name: string;
	symbol: string;
	marketCapRank?: number;
	thumb: string;
	large: string;
}

export interface TrendingCrypto {
	item: {
		id: string;
		coinId: number;
		name: string;
		symbol: string;
		marketCapRank: number;
		thumb: string;
		small: string;
		large: string;
		slug: string;
		priceBtc: number;
		score: number;
	};
}

export interface CryptoMarketData {
	data: {
		activeCryptocurrencies: number;
		upcomingIcos: number;
		ongoingIcos: number;
		endedIcos: number;
		markets: number;
		totalMarketCap: Record<string, number>;
		totalVolume: Record<string, number>;
		marketCapPercentage: Record<string, number>;
		marketCapChangePercentage24hUsd: number;
		updatedAt: number;
	};
}
