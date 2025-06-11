import responseErrorDefault from "../../responseErrorDefault";
import ApiBase_Interno from "../../api_interno";
import CompanyService from "../../CompanyService";
import CacheDemoService from "../../CacheDemoService";

const Api_Interno = new ApiBase_Interno();

const getGrafico = async () => {
	const company = CompanyService.getDataCompany();
	const companyId = company.id;
	const isDemo = company.isDemo;
	const urlDemo = isDemo ? "?demo=true" : "";
	return await new Promise(async (resolve) => {
		await Api_Interno.get(
			`/gestao/${companyId}/diagnostico/interno/avaliacao${urlDemo}`
		)
			.then((response) => resolve(response.data))
			.catch((error) => resolve(responseErrorDefault(error)));
	});
};

const getGraficoResource = async (resource) => {
	const company = CompanyService.getDataCompany();
	const companyId = company.id;
	const isDemo = company.isDemo;
	const urlDemo = isDemo ? "?demo=true" : "";
	return await new Promise(async (resolve) => {
		await Api_Interno.get(
			`/gestao/${companyId}/diagnostico/interno/${resource}/gauge${urlDemo}`
		)
			.then((response) => resolve(response.data))
			.catch((error) => resolve(responseErrorDefault(error)));
	});
};

const getResourceInternoAvaliacao = async (resource) => {
	const company = CompanyService.getDataCompany();
	const companyId = company.id;
	const isDemo = company.isDemo;
	const urlDemo = isDemo ? "?demo=true" : "";
	return await new Promise(async (resolve) => {
		await Api_Interno.get(
			`/gestao/${companyId}/diagnostico/interno/${resource}/avaliacao${urlDemo}`
		)
			.then((response) => resolve(response.data))
			.catch((error) => resolve(responseErrorDefault(error)));
	});
};

const updateResourceInternoAvaliacao = async (resource, ano, payload) => {
	const company = CompanyService.getDataCompany();
	const companyId = company.id;
	const isDemo = company.isDemo;
	const urlDemo = isDemo ? "?demo=true" : "";

	return await new Promise(async (resolve) => {
		await Api_Interno.post(
			`/gestao/${companyId}/diagnostico/interno/${resource}/avaliacao${urlDemo}`,
			payload
		)
			.then((response) => resolve(response.data))
			.catch((error) => resolve(responseErrorDefault(error)));
	});
};

const importOmie = async (year) => {
	const companyId = CompanyService.getDataCompany().id;

	try {
		const url = `/gestao/${companyId}/diagnostico/interno/financeiro/dados/integracao/omie/${year}`;
		const response = await Api_Interno.get(url);
		const payload = response.data;

		if (payload.status === "success") {
			if (payload.result.status === "success") {
				return {
					status: "success",
					message: payload.result,
				};
			}
			return {
				status: payload.result.status,
				message: payload.result,
			};
		}

		return {
			status: "failed",
			message: "Não foi possível importar da Omie",
		};
	} catch (error) {
		return responseErrorDefault(error);
	}
};

const getResourceInternoData = async (resource, years) => {
	const company = CompanyService.getDataCompany();
	const companyId = company.id;
	const isDemo = company.isDemo;

	console.info(`Carregando Ambiente Interno - ${resource} - Data via API`);

	return await new Promise(async (resolve) => {
		const queryString = { ano: years.join(",") };
		if (isDemo) queryString["demo"] = "true";
		await Api_Interno.get(
			`/gestao/${companyId}/diagnostico/interno/${resource}/dados`,
			queryString
		)
			.then((response) => {
				if (isDemo) CacheDemoService.setIternoData(resource, response.data);
				return resolve(response.data);
			})
			.catch((error) => resolve(responseErrorDefault(error)));
	});
};

const updateTableResultados = async (resource, payload) => {
	const company = CompanyService.getDataCompany();
	const companyId = company.id;
	const isDemo = company.isDemo;
	const urlDemo = isDemo ? "?demo=true" : "";

	return await new Promise(async (resolve) => {
		await Api_Interno.post(
			`/gestao/${companyId}/diagnostico/interno/${resource}/dados${urlDemo}`,
			payload
		)
			.then((response) => resolve(response.data))
			.catch((error) => resolve(responseErrorDefault(error)));
	});
};

const updateDespesa = async (newDescription, oldDestiprition) => {
	const company = CompanyService.getDataCompany();

	if (!company) {
		return {
			status: "company_not_found",
			message: "Não foi possível carregar os dados da empresa",
		};
	}

	const companyId = company.id;
	const isDemo = company.isDemo;
	const urlDemo = isDemo ? "?demo=true" : "";

	return await new Promise(async (resolve) => {
		const payload = {
			new: newDescription,
			old: oldDestiprition,
		};
		await Api_Interno.put(
			`/gestao/${companyId}/diagnostico/interno/financeiro/dados/categoria${urlDemo}`,
			payload
		)
			.then((response) => resolve(response.data))
			.catch((error) => resolve(responseErrorDefault(error)));
	});
};

const AmbienteInternoService = (function () {
	return {
		getGrafico: getGrafico,
		getGraficoResource: getGraficoResource,
		getResourceInternoAvaliacao: getResourceInternoAvaliacao,
		updateResourceInternoAvaliacao: updateResourceInternoAvaliacao,

		updateTableResultados: updateTableResultados,
		getResourceInternoData: getResourceInternoData,
		updateDespesa: updateDespesa,
		importOmie: importOmie,
	};
})();

export default AmbienteInternoService;
