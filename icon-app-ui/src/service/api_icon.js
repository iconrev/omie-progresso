import axios from "axios";
import { stage } from "./config";
import { LocalStorageService } from "./localStorageService";
import userService from "./UserService";

const configs = {
	prod: {
		baseURL: "https://api.simbiose.omie.com.br",
	},
	qa: {
		baseURL: "https://api.simbiose-preview.omie.com.br",
	},
	"qa-local": {
		baseURL: "http://localhost:4444",
		baseURLexterno: "http://localhost:4459",
		baseURLinterno: "http://localhost:4446",
		baseURLmetas: "http://localhost:4449",
	},
};

const configApiIcon = configs[stage];

const apiIcon = axios.create({
	baseURL: configApiIcon.baseURL,
});

function getUrlRefreshTokenStage() {
	if (stage === "qa-local")
		return "qa-local/api/cadastros/usuarios/refreshToken";
	return "service-base/api/cadastros/usuarios/refreshToken";
}

async function getNewToken(refreshToken) {
	const url = getUrlRefreshTokenStage();
	const payload = {
		refreshToken: refreshToken,
	};
	return apiIcon.post(url, payload);
}

apiIcon.interceptors.request.use(
	async (config) => {
		const token = LocalStorageService.getAccessToken();
		if (token) {
			config.headers.Authorization = `Bearer ${token}`;
		}
		return config;
	},
	(error) => {
		Promise.reject(error);
	}
);

apiIcon.interceptors.response.use(
	function (response) {
		return response.data;
	},
	async function (error) {
		console.error(error);
		if (!error.response) {
			try {
				console.error(error.toJSON());
			} catch (errorCatch) {
				console.error(error);
				console.error(errorCatch);
			}
			return Promise.reject({
				data: {
					status: "gateway_timeout",
					message:
						"Não foi possível carregar os dados. Tente novamente mais tarde.",
				},
			});
		}

		const originalRequest = error.config;
		const status = error.response.status;

		if (status === 502) {
			try {
				console.error(error.toJSON());
			} catch (errorCatch) {
				console.error(error);
				console.error(errorCatch);
			}
			return Promise.reject({
				data: {
					status: "bad_gateway",
					message:
						"Não foi possível carregar os dados. Tente novamente mais tarde.",
				},
			});
		}

		if (status === 401) {
			// console.info("originalRequest", originalRequest)
			// await new Promise(resolve => setTimeout(resolve, 10000));

			if (
				originalRequest._retry ||
				originalRequest.url.includes("refreshToken")
			) {
				userService.doLogout();
				window.location = "/";
				return Promise.reject(error);
			}

			console.error(`Status: ${status} - ${error.response.data.message}`);

			if (originalRequest.url.includes("refresh-token")) {
				return Promise.reject(error);
			}
			originalRequest._retry = true;

			const refreshToken = LocalStorageService.getRefreshToken();

			if (refreshToken) {
				await getNewToken(refreshToken)
					.then((response) => {
						const credentials = response["AuthenticationResult"];
						if (credentials) {
							LocalStorageService.setToken(credentials["AccessToken"]);
							LocalStorageService.setRefreshToken(credentials["RefreshToken"]);
						}
						return apiIcon(originalRequest);
					})
					.catch((error) => {
						console.error(error);
					});
			}
		}

		// return Error object with Promise
		return Promise.reject(error);
	}
);

export { apiIcon, configApiIcon };
