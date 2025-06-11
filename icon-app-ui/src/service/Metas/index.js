import responseErrorDefault from "../responseErrorDefault";
import ApiMetas from "../../service/api_metas";
import CompanyService from "../CompanyService";

const Api_Metas = new ApiMetas();

const getUrlService = (path, allowDemo = true) => {
	const company = CompanyService.getDataCompany();
	const companyId = company ? company.id : undefined;
	const isDemo = company ? company.isDemo : undefined;
	const urlDemo = isDemo && allowDemo ? "?demo=true" : "";
	return `/gestao/${companyId}/metas${path}${urlDemo}`;
};

const getGestaoGrafico = async () => {
	return await new Promise(async (resolve) => {
		const url = getUrlService("/grafico");
		await Api_Metas.get(url)
			.then((response) => resolve(response.data))
			.catch((error) => resolve(responseErrorDefault(error)));
	});
};

const getDefinicao = async (perspectiva, resource) => {
	return await new Promise(async (resolve) => {
		const url = getUrlService(`/${perspectiva}/${resource}/definicao`);
		await Api_Metas.get(url)
			.then((response) => resolve(response.data))
			.catch((error) => resolve(responseErrorDefault(error)));
	});
};

const getMapa = async (mapaName) => {
	try {
		const url = getUrlService(`/mapa/${mapaName}`);
		const response = await Api_Metas.get(url);
		return response.data;
	} catch (error) {
		return responseErrorDefault(error);
	}
};

const postDefinicao = async (perspectiva, resource, payload) => {
	return await new Promise(async (resolve) => {
		const url = getUrlService(`/${perspectiva}/${resource}/definicao`, false);
		await Api_Metas.post(url, payload)
			.then((response) => resolve(response.data))
			.catch((error) => resolve(responseErrorDefault(error)));
	});
};

const postMapa = async (mapaName, payload) => {
	try {
		const url = getUrlService(`/mapa/${mapaName}`);
		const response = await Api_Metas.post(url, payload);
		return response.data;
	} catch (error) {
		return responseErrorDefault(error);
	}
};

const Metas = {
	getGestaoGrafico,
	getDefinicao,
	getMapa,
	postDefinicao,
	postMapa,
};

export default Metas;
