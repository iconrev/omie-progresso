const storage = sessionStorage;
const SOBREVIVENCIA = "sobrevivencia";
const CONCORRENTES = "externo_concorrentes";
const FORNECEDORES = "externo_fornecedores";
const CLIENTES = "externo_clientes";
const SWOT = "externo_swot";
const resources = {
	concorrentes: CONCORRENTES,
	fornecedores: FORNECEDORES,
	clientes: CLIENTES,
};

const FINANCEIRO_DATA = "interno_financeiro_data";
const FINANCEIRO_AVALIACAO = "interno_financeiro_avaliacao";
const resourcesInterno = {
	financeiro: {
		avaliacao: FINANCEIRO_AVALIACAO,
		data: FINANCEIRO_DATA,
	},
};

const CacheDemoService = (function () {
	const setSobrevivencia = (data) => {
		storage.setItem(SOBREVIVENCIA, JSON.stringify(data));
	};

	const getSobrevivencia = () => {
		return JSON.parse(storage.getItem(SOBREVIVENCIA));
	};

	const updateSobrevivencia = (year, data) => {
		const sobrevivencia = getSobrevivencia();
		sobrevivencia["questionarios"][parseInt(year)] = data["avaliacao"];
		setSobrevivencia(sobrevivencia);
		console.info("Sobrevivencia atualizado com sucesso");
	};

	const getResource = (resource) => {
		return JSON.parse(storage.getItem(resources[resource]));
	};

	const setResource = (resource, data) => {
		storage.setItem(resources[resource], JSON.stringify(data));
		console.info(`Resource [${resource}] atualizado com sucesso`);
	};

	const updateResource = (resource, year, data) => {
		const dataResource = getResource(resource);
		dataResource[resource][parseInt(year)] = data[resource];
		setResource(resource, dataResource);
		console.info(`Cache ${resource} atualizado com sucesso`);
	};

	const setSwot = (swotName, data) => {
		const swot = JSON.parse(storage.getItem(SWOT));
		if (swot) {
			swot[swotName] = data;
			storage.setItem(SWOT, JSON.stringify(swot));
			return;
		}
		storage.setItem(
			SWOT,
			JSON.stringify({
				[swotName]: data,
			})
		);
	};

	const getSwot = (swotName) => {
		const swot = JSON.parse(storage.getItem(SWOT));
		return swot ? swot[swotName] : null;
	};

	const updateSwot = (swotName, year, data) => {
		const swot = JSON.parse(storage.getItem(SWOT));
		const swotYear = swot[swotName]["swot"][parseInt(year)];
		for (let i = 0; i < data["swot"].length; i++) {
			const swotItemIndex = swotYear.findIndex(
				(item) => item.id === data["swot"][i].id
			);
			swotYear[swotItemIndex] = {
				...swotYear[swotItemIndex],
				...data["swot"][i],
			};
		}
		setSwot(swotName, swot[swotName]);
	};

	const setIternoData = (resource, data) => {
		storage.setItem(resourcesInterno[resource]["data"], JSON.stringify(data));
	};

	const getInternoData = (resource) => {
		return JSON.parse(storage.getItem(resourcesInterno[resource]["data"]));
	};

	const updateTableResultados = (resource, year, data) => {
		const storageResource = getInternoData(resource);
		const storageDre = storageResource["data"];
		console.info("storageDre", storageDre);
		const indexStorage = storageDre["ano_exercicio"].findIndex(
			(item) => item === year
		);
		console.info(`indexStorage`, indexStorage);
		const dre = data.dre;
		console.info(year, dre);
	};

	const clearCache = () => {
		storage.removeItem(SOBREVIVENCIA);
		storage.removeItem(CONCORRENTES);
		storage.removeItem(FORNECEDORES);
		storage.removeItem(CLIENTES);
		storage.removeItem(SWOT);
		storage.removeItem(FINANCEIRO_DATA);
		storage.removeItem(FINANCEIRO_AVALIACAO);
	};

	return {
		clearCache: clearCache,
		setSobrevivencia: setSobrevivencia,
		getSobrevivencia: getSobrevivencia,
		updateSobrevivencia: updateSobrevivencia,
		getSwot: getSwot,
		setSwot: setSwot,
		updateSwot: updateSwot,
		getResource: getResource,
		setResource: setResource,
		updateResource: updateResource,
		setIternoData: setIternoData,
		getInternoData: getInternoData,
		updateTableResultados: updateTableResultados,
	};
})();

export default CacheDemoService;
