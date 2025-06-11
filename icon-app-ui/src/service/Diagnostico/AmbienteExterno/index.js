import responseErrorDefault from "../../responseErrorDefault";
import ApiBase_Externo from "../../api_externo";
import CompanyService from "../../CompanyService";
import CacheDemoService from "../../CacheDemoService";

const Api_Externo = new ApiBase_Externo();
// const company = CompanyService.getDataCompany();
// const companyId = company.id;
// const isDemo = company.isDemo;
// const urlDemo = (isDemo) ? '?demo=true' : '';
// const exercicio = company.exercicioDefinido;

const getGrafico = async () => {
	const company = CompanyService.getDataCompany();
	const companyId = company.id;
	const urlDemo = company.isDemo ? "?demo=true" : "";
	return await new Promise((resolve) => {
		Api_Externo.get(
			`/gestao/${companyId}/diagnostico/externo/avaliacao${urlDemo}`
		)
			.then((response) => resolve(response))
			.catch((error) => resolve(responseErrorDefault(error)));
	});
};

const getGraficoResource = async (resource) => {
	const company = CompanyService.getDataCompany();
	const companyId = company.id;
	const urlDemo = company.isDemo ? "?demo=true" : "";
	return await new Promise((resolve) => {
		Api_Externo.get(
			`/gestao/diagnostico/externo/${resource}/empresa/${companyId}/avaliacao${urlDemo}`
		)
			.then((response) => resolve(response))
			.catch((error) => resolve(responseErrorDefault(error)));
	});
};

const getSwotOptions = async (swot) => {
	const company = CompanyService.getDataCompany();
	const companyId = company.id;
	return await new Promise((resolve) => {
		Api_Externo.get(
			`gestao/diagnostico/externo/swot/empresa/${companyId}/tabela?nome=${swot}`
		)
			.then((response) => resolve(response.data))
			.catch((error) => resolve(responseErrorDefault(error)));
	});
};

const getSwot = async (swot) => {
	const company = CompanyService.getDataCompany();
	const companyId = company.id;
	const urlDemo = company.isDemo ? "?demo=true" : "";
	if (company.isDemo) {
		const response = CacheDemoService.getSwot(swot);
		if (response) {
			console.info(`Usando cache para Swot ${swot}`);
			return response;
		}
	}

	console.info(`Carregando Swot ${swot} via API`);

	let url = `/gestao/diagnostico/externo/${swot}/empresa/${companyId}`;
	if (swot !== "macro") {
		url = `/gestao/diagnostico/externo/${swot}/empresa/${companyId}/swot`;
	}
	return await new Promise((resolve) => {
		Api_Externo.get(url + urlDemo)
			.then((response) => {
				if (company.isDemo) CacheDemoService.setSwot(swot, response.data);
				return resolve(response.data);
			})
			.catch((error) => resolve(responseErrorDefault(error)));
	});
};

const updateSwot = async (swot, data) => {
	const company = CompanyService.getDataCompany();
	const companyId = company.id;
	const exercicio = company.exercicioDefinido;
	if (company.isDemo) {
		CacheDemoService.updateSwot(swot, exercicio, data);
		return {
			status: "success",
			message: "Atualizado com sucesso",
		};
	}

	return await new Promise((resolve) => {
		Api_Externo.post(
			`gestao/diagnostico/externo/${swot}/empresa/${companyId}/swot`,
			data
		)
			.then((response) => resolve(response.data))
			.catch((error) => resolve(responseErrorDefault(error)));
	});
};

const getListaResource = async (resource) => {
	const company = CompanyService.getDataCompany();
	const companyId = company.id;
	const urlDemo = company.isDemo ? "?demo=true" : "";

	if (company.isDemo) {
		const response = CacheDemoService.getResource(resource);
		if (response) {
			console.info(`Usando cache para ${resource}`);
			return response;
		}
	}

	console.info(`Carregando ${resource} via API`);

	return await new Promise((resolve) => {
		Api_Externo.get(
			`/gestao/diagnostico/externo/${resource}/empresa/${companyId}${urlDemo}`
		)
			.then((response) => {
				if (company.isDemo)
					CacheDemoService.setResource(resource, response.data);
				return resolve(response.data);
			})
			.catch((error) => resolve(responseErrorDefault(error)));
	});
};

const updateResource = async (resource, data) => {
	const company = CompanyService.getDataCompany();
	const companyId = company.id;
	const exercicio = company.exercicioDefinido;

	if (company.isDemo) {
		CacheDemoService.updateResource(resource, exercicio, data);
		return {
			status: "success",
			message: "Atualizado com sucesso",
		};
	}

	return await new Promise((resolve) => {
		Api_Externo.post(
			`/gestao/diagnostico/externo/${resource}/empresa/${companyId}`,
			data
		)
			.then((response) => resolve(response.data))
			.catch((error) => resolve(responseErrorDefault(error)));
	});
};

const putNewItemSwot = async (resource, type, description) => {
	const company = CompanyService.getDataCompany();
	const url = `gestao/diagnostico/externo/swot/empresa/${company.id}/tabela/options/${resource}/${type}`;
	const payload = {
		descricao: description,
	};
	console.info("url", url);
	return await new Promise((resolve) => {
		Api_Externo.post(url, payload)
			.then((response) => resolve(response.data))
			.catch((error) => resolve(responseErrorDefault(error)));
	});
};

const AmbienteExternoService = (function () {
	return {
		getGrafico: getGrafico,
		getGraficoResource: getGraficoResource,
		getSwotOptions: getSwotOptions,
		getSwot: getSwot,
		updateSwot: updateSwot,
		getListaResource: getListaResource,
		updateResource: updateResource,
		putNewItemSwot: putNewItemSwot,
	};
})();

export default AmbienteExternoService;
