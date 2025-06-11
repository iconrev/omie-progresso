import responseErrorDefault from "../responseErrorDefault";
import ApiBase from "../api_base";

const Api = new ApiBase();

const getPDF = async (companyId, reportType, year) => {
	try {
		const url = `/cadastros/empresas/${companyId}/reports/${reportType}/${year}`;

		const response = await Api.get(url);
		return response.data;
	} catch (error) {
		return responseErrorDefault(error);
	}
};

const PlanoService = {
	getPDF,
};
export default PlanoService;
