import { HttpException, HttpStatus } from "@nestjs/common";
import CoingeckoError from "src/errors/coingecko.error";

describe("CoingeckoError", () => {
	describe("constructor", () => {
		it("должен создать экземпляр CoingeckoError с сообщением и статусом", () => {
			const error = new CoingeckoError("Test error", HttpStatus.BAD_REQUEST);

			expect(error).toBeInstanceOf(CoingeckoError);
			expect(error).toBeInstanceOf(HttpException);
			expect(error.message).toBe("Test error");
			expect(error.getStatus()).toBe(HttpStatus.BAD_REQUEST);
			expect(error.name).toBe("CoingeckoError");
		});

		it("должен использовать дефолтный статус BAD_GATEWAY если не указан", () => {
			const error = new CoingeckoError("Test error");

			expect(error.getStatus()).toBe(HttpStatus.BAD_GATEWAY);
		});

		it("должен установить правильное имя ошибки", () => {
			const error = new CoingeckoError("Test error");

			expect(error.name).toBe("CoingeckoError");
		});
	});

	describe("fromError", () => {
		it("должен вернуть тот же экземпляр если передан CoingeckoError", () => {
			const originalError = new CoingeckoError("Original error", HttpStatus.BAD_REQUEST);
			const result = CoingeckoError.fromError(originalError);

			expect(result).toBe(originalError);
			expect(result.message).toBe("Original error");
			expect(result.getStatus()).toBe(HttpStatus.BAD_REQUEST);
		});

		it("должен преобразовать HttpException в CoingeckoError", () => {
			const httpException = new HttpException("HTTP error", HttpStatus.NOT_FOUND);
			const result = CoingeckoError.fromError(httpException);

			expect(result).toBeInstanceOf(CoingeckoError);
			expect(result.message).toBe("HTTP error");
			expect(result.getStatus()).toBe(HttpStatus.NOT_FOUND);
		});

		it("должен использовать defaultMessage для HttpException без сообщения", () => {
			const httpException = new HttpException("", HttpStatus.NOT_FOUND);
			const result = CoingeckoError.fromError(httpException, "Default message");

			expect(result).toBeInstanceOf(CoingeckoError);
			expect(result.message).toBe("Default message");
			expect(result.getStatus()).toBe(HttpStatus.NOT_FOUND);
		});

		it("должен использовать дефолтное сообщение для HttpException без сообщения и defaultMessage", () => {
			const httpException = new HttpException("", HttpStatus.NOT_FOUND);
			const result = CoingeckoError.fromError(httpException);

			expect(result).toBeInstanceOf(CoingeckoError);
			expect(result.message).toBe("CoinGecko API error");
			expect(result.getStatus()).toBe(HttpStatus.NOT_FOUND);
		});

		it("должен преобразовать Error в CoingeckoError", () => {
			const error = new Error("Standard error");
			const result = CoingeckoError.fromError(error);

			expect(result).toBeInstanceOf(CoingeckoError);
			expect(result.message).toBe("Standard error");
			expect(result.getStatus()).toBe(HttpStatus.BAD_GATEWAY);
		});

		it("должен использовать defaultMessage для Error без сообщения", () => {
			const error = new Error("");
			const result = CoingeckoError.fromError(error, "Default message");

			expect(result).toBeInstanceOf(CoingeckoError);
			expect(result.message).toBe("Default message");
			expect(result.getStatus()).toBe(HttpStatus.BAD_GATEWAY);
		});

		it("должен использовать дефолтное сообщение для Error без сообщения и defaultMessage", () => {
			const error = new Error("");
			const result = CoingeckoError.fromError(error);

			expect(result).toBeInstanceOf(CoingeckoError);
			expect(result.message).toBe("CoinGecko API error");
			expect(result.getStatus()).toBe(HttpStatus.BAD_GATEWAY);
		});

		it("должен преобразовать unknown (строка) в CoingeckoError", () => {
			const unknownError = "String error";
			const result = CoingeckoError.fromError(unknownError);

			expect(result).toBeInstanceOf(CoingeckoError);
			expect(result.message).toBe("String error");
			expect(result.getStatus()).toBe(HttpStatus.BAD_GATEWAY);
		});

		it("должен преобразовать unknown (число) в CoingeckoError", () => {
			const unknownError = 123;
			const result = CoingeckoError.fromError(unknownError);

			expect(result).toBeInstanceOf(CoingeckoError);
			expect(result.message).toBe("123");
			expect(result.getStatus()).toBe(HttpStatus.BAD_GATEWAY);
		});

		it("должен преобразовать unknown (null) в CoingeckoError", () => {
			const unknownError = null;
			const result = CoingeckoError.fromError(unknownError);

			expect(result).toBeInstanceOf(CoingeckoError);
			expect(result.message).toBe("null");
			expect(result.getStatus()).toBe(HttpStatus.BAD_GATEWAY);
		});

		it("должен преобразовать unknown (undefined) в CoingeckoError", () => {
			const unknownError = undefined;
			const result = CoingeckoError.fromError(unknownError);

			expect(result).toBeInstanceOf(CoingeckoError);
			expect(result.message).toBe("undefined");
			expect(result.getStatus()).toBe(HttpStatus.BAD_GATEWAY);
		});

		it("должен использовать defaultMessage для unknown", () => {
			const unknownError = null;
			const result = CoingeckoError.fromError(unknownError, "Custom default message");

			expect(result).toBeInstanceOf(CoingeckoError);
			expect(result.message).toBe("Custom default message");
			expect(result.getStatus()).toBe(HttpStatus.BAD_GATEWAY);
		});

		it("должен использовать defaultMessage для unknown (строка) вместо String(error)", () => {
			const unknownError = "String error";
			const result = CoingeckoError.fromError(unknownError, "Custom default message");

			expect(result).toBeInstanceOf(CoingeckoError);
			expect(result.message).toBe("Custom default message");
			expect(result.getStatus()).toBe(HttpStatus.BAD_GATEWAY);
		});

		it("должен использовать defaultMessage для unknown (число) вместо String(error)", () => {
			const unknownError = 123;
			const result = CoingeckoError.fromError(unknownError, "Custom default message");

			expect(result).toBeInstanceOf(CoingeckoError);
			expect(result.message).toBe("Custom default message");
			expect(result.getStatus()).toBe(HttpStatus.BAD_GATEWAY);
		});

		it("должен использовать defaultMessage для unknown (объект) вместо String(error)", () => {
			const unknownError = { code: 500, message: "Server error" };
			const result = CoingeckoError.fromError(unknownError, "Custom default message");

			expect(result).toBeInstanceOf(CoingeckoError);
			expect(result.message).toBe("Custom default message");
			expect(result.getStatus()).toBe(HttpStatus.BAD_GATEWAY);
		});

		it("должен использовать defaultMessage для unknown (undefined) вместо дефолтного сообщения", () => {
			const unknownError = undefined;
			const result = CoingeckoError.fromError(unknownError, "Custom default message");

			expect(result).toBeInstanceOf(CoingeckoError);
			expect(result.message).toBe("Custom default message");
			expect(result.getStatus()).toBe(HttpStatus.BAD_GATEWAY);
		});

		it("должен преобразовать объект в CoingeckoError", () => {
			const unknownError = { code: 500, message: "Server error" };
			const result = CoingeckoError.fromError(unknownError);

			expect(result).toBeInstanceOf(CoingeckoError);
			expect(result.message).toBe("[object Object]");
			expect(result.getStatus()).toBe(HttpStatus.BAD_GATEWAY);
		});

		it("должен обработать Error с пустым сообщением и использовать defaultMessage", () => {
			const error = new Error();
			const result = CoingeckoError.fromError(error, "Custom message");

			expect(result).toBeInstanceOf(CoingeckoError);
			expect(result.message).toBe("Custom message");
		});

		it("должен использовать дефолтное сообщение когда String(error) возвращает пустую строку", () => {
			// Создаем объект, который при String() вернет пустую строку
			const emptyStringError = "";
			const result = CoingeckoError.fromError(emptyStringError);

			expect(result).toBeInstanceOf(CoingeckoError);
			expect(result.message).toBe("CoinGecko API error");
			expect(result.getStatus()).toBe(HttpStatus.BAD_GATEWAY);
		});
	});
});
