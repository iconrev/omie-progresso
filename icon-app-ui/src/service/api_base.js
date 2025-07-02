import IconAPI from "./api";

class ApiBase extends IconAPI {
	constructor() {
		super("https://jqkxgseqqf.execute-api.sa-east-1.amazonaws.com/qa-r");
	}
}

const Api_Base = new ApiBase();

export { Api_Base };
export default ApiBase;
