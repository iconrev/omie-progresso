export const isCnpjValid = (cnpj) => {
	if (!cnpj) return false;

	// Aceita receber o valor como string, número ou array com todos os dígitos
	const isString = typeof cnpj === "string";
	const validTypes = isString || Number.isInteger(cnpj) || Array.isArray(cnpj);

	// Elimina valor em formato inválido
	if (!validTypes) return false;

	// Filtro inicial para entradas do tipo string
	if (isString) {
		// Limita ao máximo de 18 caracteres, para CNPJ formatado
		if (cnpj.length > 18) return false;
	}

	// Guarda um array com todos os dígitos do valor
	const match = cnpj.toString().match(/\d/g);
	const numbers = Array.isArray(match) ? match.map(Number) : [];

	// Valida a quantidade de dígitos
	if (numbers.length !== 14) return false;

	// Elimina inválidos com todos os dígitos iguais
	const items = [...new Set(numbers)];
	if (items.length === 1) return false;

	// Cálculo validador
	const calc = (x) => {
		const slice = numbers.slice(0, x);
		let factor = x - 7;
		let sum = 0;

		for (let i = x; i >= 1; i--) {
			const n = slice[x - i];
			// eslint-disable-next-line no-plusplus
			sum += n * factor--;
			if (factor < 2) factor = 9;
		}

		const result = 11 - (sum % 11);

		return result > 9 ? 0 : result;
	};

	// Separa os 2 últimos dígitos de verificadores
	const digits = numbers.slice(12);

	// Valida 1o. dígito verificador
	const digit0 = calc(12);
	if (digit0 !== digits[0]) return false;

	// Valida 2o. dígito verificador
	const digit1 = calc(13);
	return digit1 === digits[1];
};

export const formatCnpj = (cnpj) => {
	cnpj = cnpj.toString().match(/\d/g).join("");
	cnpj = cnpj.replace(/^(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})/, "$1.$2.$3/$4-$5");
	return cnpj;
};

export const maskCnpj = (value) => {
	value = value.replace(/\D/g, ""); //Remove tudo o que não é dígito
	value = value.replace(/(\d{2})(\d)/, "$1.$2"); //Coloca um ponto entre o terceiro e o quarto dígitos
	value = value.replace(/(\d{3})(\d)/, "$1.$2"); //Coloca um ponto entre o terceiro e o quarto dígitos
	//de novo (para o segundo bloco de números)
	value = value.replace(/(\d{3})(\d)/, "$1/$2"); //Coloca um hífen entre o terceiro e o quarto dígitos
	value = value.replace(/(\d{4})(\d)/, "$1-$2");
	return value;

	//99.999.999/9999-99
};
