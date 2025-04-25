import qs from "qs";
import responseErrorDefault from "../responseErrorDefault";
import ApiBase from "../api_base";

const Api = new ApiBase();

const getUrlService = (path, querystrings = null) => {
	const base = `/administrativo${path}`;
	if (!querystrings) return base;

	querystrings = qs.stringify(querystrings);

	return `${base}?${querystrings}`;
};

const getLogs = async (filter) => {
	try {
		const url = getUrlService(`/logs`, filter);
		const response = await Api.get(url);
		return response.data;
	} catch (error) {
		return responseErrorDefault(error);
	}
};

const Administrativo = {
	getLogs,
};
export default Administrativo;
