class ValidaMeta {
	constructor(metaOriginal, metaRevisada, resource, typeValidation) {
		this.metaOriginal = metaOriginal;
		this.metaRevisada = metaRevisada;
		this.resource = resource;
		this.typeValidation = typeValidation;
		this.statusMeta = false;
		this.statusMetaMessage = null;
		this.validate();
	}

	validateMeta() {
		this.statusMeta = true;
		this.statusMetaMessage = null;
	}

	get isValid() {
		return this.statusMeta;
	}

	get message() {
		return this.statusMetaMessage;
	}

	convertStringToFloat = (value) => {
		if (typeof value === "string") {
			while (value.indexOf("R$ ") > -1) {
				value = value.replace("R$ ", "");
			}
			while (value.indexOf("%") > -1) {
				value = value.replace("%", "");
			}
			while (value.indexOf(".") > -1) {
				value = value.replace(".", "");
			}
			while (value.indexOf(",") > -1) {
				value = value.replace(",", ".");
			}
		}
		if (/^([-+])?([0-9]+(\.[0-9]+)?|Infinity)$/.test(value))
			return Number(value);
		return NaN;
	};

	formatter = (value, decimals = 2) => {
		if (value) {
			try {
				return parseFloat(value)
					.toFixed(decimals)
					.replace(".", ",")
					.replace(/(\d)(?=(\d{3})+(?!\d))/g, "$1.");
			} catch (error) {
				console.error(error);
			}
		} else {
			if (decimals === 0) {
				return "0";
			} else {
				return "0,00";
			}
		}
	};

	getTotalMeta(metas) {
		let sum = 0;

		for (let index = 0; index < metas.length; index++) {
			const value = this.convertStringToFloat(
				this.formatter(this.convertStringToFloat(metas[index]))
			);
			sum += value;
		}

		return sum;
	}

	validate() {
		let totalMetaRevisada = this.convertStringToFloat(
			this.formatter(this.getTotalMeta(this.metaRevisada))
		);
		let totalMetaOriginal = this.convertStringToFloat(
			this.formatter(this.getTotalMeta(this.metaOriginal))
		);

		if (
			this.typeValidation !== "min_value" &&
			this.typeValidation !== "max_value"
		) {
			if (totalMetaOriginal !== totalMetaRevisada) {
				if (this.typeValidation === "average") {
					this.statusMetaMessage = "O valor médio da meta está incorreto.";
				} else {
					this.statusMetaMessage = "O valor total da meta está incorreto.";
				}
				return;
			}
		} else {
			const valueDecemberEdited =
				this.metaRevisada[this.metaRevisada.length - 1];
			const valueDecemberOriginal =
				this.metaOriginal[this.metaOriginal.length - 1];

			if (valueDecemberEdited !== valueDecemberOriginal) {
				this.statusMetaMessage =
					"O valor de Dezembro deve ser o mesmo do definido no módulo de Estratégias e Metas.";
				return;
			}
		}

		this.validateMeta();
	}
}

export default ValidaMeta;
