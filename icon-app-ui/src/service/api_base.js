import IconAPI from "./api";

class ApiBase extends IconAPI {
	constructor() {
		super("service-base");
	}
}

const Api_Base = new ApiBase();

export { Api_Base };
export default ApiBase;
