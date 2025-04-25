import responseErrorDefault from "../responseErrorDefault";
import ApiBase from "../../service/api_base";
import CompanyService from "../CompanyService";

const Api_Base = new ApiBase();

const getUrlService = (path, allowDemo = true) => {
	const company = CompanyService.getDataCompany();
	const companyId = company ? company.id : undefined;
	const isDemo = company ? company.isDemo && allowDemo : undefined;
	const urlDemo = isDemo ? `${path.includes("?") ? "&" : "?"}demo=true` : "";
	return `/gestao/${companyId}/diagnostico${path}${urlDemo}`;
};

const getGestaoGrafico = async () => {
	return await new Promise(async (resolve) => {
		await Api_Base.get(getUrlService(`/grafico`))
			.then((response) => resolve(response.data))
			.catch((error) => resolve(responseErrorDefault(error)));
	});
};

const getSwot = async (quantidadeItens) => {
	return await new Promise(async (resolve) => {
		await Api_Base.get(getUrlService(`/swot?items=${quantidadeItens}`))
			.then((response) => resolve(response.data))
			.catch((error) => resolve(responseErrorDefault(error)));
	});
};

export default {
	getGestaoGrafico,
	getSwot,
};
