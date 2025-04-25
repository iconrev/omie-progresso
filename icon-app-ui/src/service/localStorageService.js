const ACCESS_TOKEN = "access_token";
const REFRESH_TOKEN = "refresh_token";
const DATA_USER = "omie_portal_user";

class ClassLocalStorageService {
	setToken(accessToken) {
		localStorage.setItem(ACCESS_TOKEN, accessToken);
		console.info("Token salvo com sucesso");
	}

	setRefreshToken(refreshToken) {
		localStorage.setItem(REFRESH_TOKEN, refreshToken);
		console.info("Refresh token salvo com sucesso");
	}

	setUser(user) {
		console.info("user", user)
		localStorage.setItem(DATA_USER, JSON.stringify(user));
		console.info("Usuário salvo com sucesso");
	}

	getAccessToken() {
		return localStorage.getItem(ACCESS_TOKEN);
	}

	getRefreshToken() {
		return localStorage.getItem(REFRESH_TOKEN);
	}

	getUser() {
		const userStorage = localStorage.getItem(DATA_USER);
		if (userStorage) {
			const user = JSON.parse(userStorage);
			return user;
		}
		return null;
	}

	clearStorage() {
		localStorage.removeItem(ACCESS_TOKEN);
		localStorage.removeItem(REFRESH_TOKEN);
		localStorage.removeItem(DATA_USER);
		console.info("Storage limpo com sucesso");
	}
}

const LocalStorageService = new ClassLocalStorageService();

export { LocalStorageService };
