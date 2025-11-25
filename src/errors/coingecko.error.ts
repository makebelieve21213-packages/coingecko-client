import { HttpException, HttpStatus } from "@nestjs/common";

// Пользовательская ошибка для CoinGecko API
export default class CoingeckoError extends HttpException {
	constructor(message: string, statusCode: number = HttpStatus.BAD_GATEWAY) {
		super(message, statusCode);
		this.name = "CoingeckoError";
	}

	// Преобразует ошибку из Error, HttpException или unknown в CoingeckoError
	static fromError(error: Error | HttpException | unknown, defaultMessage?: string): CoingeckoError {
		if (error instanceof CoingeckoError) {
			return error;
		}

		if (error instanceof HttpException) {
			return new CoingeckoError(
				error.message || defaultMessage || "CoinGecko API error",
				error.getStatus()
			);
		}

		if (error instanceof Error) {
			return new CoingeckoError(
				error.message || defaultMessage || "CoinGecko API error",
				HttpStatus.BAD_GATEWAY
			);
		}

		return new CoingeckoError(
			defaultMessage || String(error) || "CoinGecko API error",
			HttpStatus.BAD_GATEWAY
		);
	}
}
