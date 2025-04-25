import responseErrorDefault from "../responseErrorDefault";
import ApiBase from "../api_base";

const Api = new ApiBase();

const postKeys = async (companyId, appKey, appSecret) => {
	try {
		const url = `/cadastros/empresas/${companyId}/integracao/omie`;
		const payload = {
			app_key: appKey,
			app_secret: appSecret,
		};
		const response = await Api.post(url, payload);
		return response.data;
	} catch (error) {
		return responseErrorDefault(error);
	}
};

const getKeys = async (companyId) => {
	try {
		const url = `/cadastros/empresas/${companyId}/integracao/omie`;
		const response = await Api.get(url);
		return response.data;
	} catch (error) {
		return responseErrorDefault(error);
	}
};

const Integracao = {
	postKeys,
	getKeys,
};
export default Integracao;
