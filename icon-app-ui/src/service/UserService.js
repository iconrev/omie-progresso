import ApiBase from "./api_base";
import LogoDefault from "../assets/img/brand/omie_logo_novo.png";
import CompanyService from "./CompanyService";
import { LocalStorageService } from "./localStorageService";

const Api_Base = new ApiBase();

const storage = localStorage;
const USER_LOGO = "user_logo";
const CONTADOR = "user_contador";
const ADMIN = "user_admin";
const PROFILE = "user_profile";
const COMPANIES = "user_companies";
const COMPANIES_ASSOCIATE = "user_companies_associates";

class UserService {
	constructor() {
		this._isLogged = false;
		this.cognitoId = null;
		this.email = null;
		this.firstName = null;
		this.lastName = null;
		this.name = null;
	}

	async setUserFromCognito(attributes) {
		this.cognitoId = attributes.sub;
		this.email = attributes.email;
		this.firstName = attributes.name;
		this.lastName = attributes.family_name;
		this.name = this.firstName + " " + this.lastName;
		this._isLogged = true;
	}

	clearStorage() {
		localStorage.removeItem(USER_LOGO);
		localStorage.removeItem(ADMIN);
		localStorage.removeItem(PROFILE);
		localStorage.removeItem(CONTADOR);
		localStorage.removeItem(COMPANIES);
		localStorage.removeItem(COMPANIES_ASSOCIATE);
		CompanyService.removeCompanyLocalStorage();
		LocalStorageService.clearStorage();
	}

	doLogout() {
		this.clearStorage();
		this.setLogged(false);
	}

	setLogged(isLogged) {
		localStorage.setItem("isUserLoggedIn", isLogged);
		this._isLogged = isLogged;
	}

	setContador(isContador) {
		storage.setItem(CONTADOR, isContador);
	}

	setAdmin(isAdmin) {
		storage.setItem(ADMIN, isAdmin);
	}

	setProfile(profile) {
		storage.setItem(PROFILE, profile);
	}

	setLogo(logo) {
		storage.setItem(USER_LOGO, JSON.stringify(logo));
	}

	setCompanies(companies) {
		storage.setItem(COMPANIES, JSON.stringify(companies || []));
	}

	setCompaniesAssociate(companiesAssociate) {
		storage.setItem(
			COMPANIES_ASSOCIATE,
			JSON.stringify(companiesAssociate || [])
		);
	}

	async getLogo() {
		const storageLogo = JSON.parse(storage.getItem(USER_LOGO));
		if (storageLogo) return storageLogo;

		const response = await Api_Base.get(`/cadastros/logo`);
		const { status, logo } = response.data;

		if (status !== "success") {
			storage.removeItem(USER_LOGO);
			console.warn(`Não foi possível carregar o logo do usuário.`);
			this.setLogo(LogoDefault);
			return LogoDefault;
		}

		this.setLogo(logo);
		return logo;
	}

	isLogged() {
		return this._isLogged;
	}

	isContador() {
		return storage.getItem(CONTADOR) === "true";
	}

	isAdmin() {
		return storage.getItem(ADMIN) === "true";
	}

	getProfile() {
		return storage.getItem(PROFILE);
	}

	getCompanies() {
		return JSON.parse(storage.getItem(COMPANIES));
	}

	getCompaniesAssociate() {
		return JSON.parse(storage.getItem(COMPANIES_ASSOCIATE));
	}

	getUser() {
		return {
			cognitoId: this.cognitoId,
			email: this.email,
			firstName: this.firstName,
			lastName: this.lastName,
			name: this.name,
			isAdmin: this.isAdmin(),
			isContador: this.isContador(),
			profile: this.getProfile(),
			companies: this.getCompanies(),
			companiesAssociate: this.getCompaniesAssociate(),
		};
	}
}

const userService = new UserService();

window.omie = {
	simbiose: {
		getUser: userService.getUser,
	},
};

export default userService;
