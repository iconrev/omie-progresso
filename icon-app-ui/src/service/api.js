// import { API } from "aws-amplify";
import { apiIcon, configApiIcon } from "./api_icon";
import { stage } from "./config";

class IconAPI {
	constructor(service) {
		if (typeof service === "undefined") {
			console.trace("Empty API Service");
			debugger; // eslint-disable-line no-debugger
		}
		this.service = service;
	}

	createUrl = (path) => {
		if (stage === "qa-local") {
			// eslint-disable-next-line
			if (this.service === "externo") return configApiIcon.baseURLexterno + "/qa-local/api/" + path;
			// eslint-disable-next-line
			if (this.service === "interno") return configApiIcon.baseURLinterno + "/qa-local/api/" + path;
			// eslint-disable-next-line
			if (this.service === "metas") return configApiIcon.baseURLmetas + "/qa-local/api/" + path;
			return configApiIcon.baseURL + "/qa-local/api/" + path;
		}
		return configApiIcon.baseURL + "/" + this.service + "/api/" + path;
	};

	post = async (path, reqData) => {
		path = path.replace(/^\//g, "");

		const url = this.createUrl(path);

		return new Promise(async (resolve, reject) => {
			try {
				const data = await apiIcon.post(url, reqData);
				resolve({
					data: data,
				});
			} catch (error) {
				reject(error);
			}
		});
	};

	put = async (path, reqData) => {
		path = path.replace(/^\//g, "");

		return new Promise(async (resolve, reject) => {
			try {
				const data = await apiIcon.put(this.createUrl(path), reqData);
				resolve({
					data: data,
				});
			} catch (error) {
				reject(error);
			}
		});
	};

	get = async (path, query = null) => {
		path = path.replace(/^\//g, "");

		return new Promise(async (resolve, reject) => {
			try {
				const data = await apiIcon.get(this.createUrl(path), { params: query });
				resolve({
					data: data,
				});
			} catch (error) {
				reject(error);
			}
		});
	};
}

export default IconAPI;
