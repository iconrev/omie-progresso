import responseErrorDefault from "../responseErrorDefault";
import ApiBase from "../api_base";

const Api_Base = new ApiBase();

const getCompanyData = async (companyId) => {
	return await new Promise(async (resolve) => {
		const url = `/cadastros/empresas/${companyId}/detalhes`;
		await Api_Base.get(url)
			.then((response) => resolve(response.data))
			.catch((error) => resolve(responseErrorDefault(error)));
	});
};

const getSheeTemplateDre = async (companyId, year) => {
	return await new Promise(async (resolve) => {
		const url = `/gestao/${companyId}/download/planilha/${year}/dre`;
		await Api_Base.get(url)
			.then((response) => resolve(response.data))
			.catch((error) => resolve(responseErrorDefault(error)));
	});
};

const getSheeTemplateDiagnostic = async (companyId, year) => {
	return await new Promise(async (resolve) => {
		const url = `/gestao/${companyId}/download/planilha/${year}/diagnostico`;
		await Api_Base.get(url)
			.then((response) => resolve(response.data))
			.catch((error) => resolve(responseErrorDefault(error)));
	});
};

const uploadSheet = async (companyId, payload) => {
	console.info(companyId);
	console.info(payload);

	return await new Promise(async (resolve) => {
		const url = `/gestao/${companyId}/upload/planilha`;
		await Api_Base.post(url, payload)
			.then((response) => resolve(response.data))
			.catch((error) => resolve(responseErrorDefault(error)));
	});
};

const Geral = {
	getCompanyData,
	getSheeTemplateDre,
	getSheeTemplateDiagnostic,
	uploadSheet,
};

export default Geral;
