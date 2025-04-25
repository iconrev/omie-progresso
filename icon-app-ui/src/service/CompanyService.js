const COMPANY_ID = "empresa_id";
const COMPANY_NAME = "empresa_nome";
const COMPANY_CNPJ = "empresa_cnpj";
const OWNER = "empresa_creator";
const EXERCICIOS = "empresa_exercicios";
const EXERCICIO_DEFINIDO = "empresa_exercicio_definido";
const COMPANY_PREMIUM = "empresa_premium";
const COMPANY_PERMISSIONS = "empresa_permissions";
const COMPANY_PREMIUM_TRIAL = "empresa_premium_trial";
const COMPANY_PREMIUM_ASSOCIADA = "empresa_premium_associada";
const COMPANY_PREMIUM_FINAL = "empresa_premium_final";
const COMPANY_DEMO = "empresa_demo";
const COMPANY_HELP = "empresa_help";
const COMPANY_ROLES = "empresa_roles";
const TRIAL_AVAILABLE = "empresa_trial_available";

const SHOW_SAVE_BUTTON_TO_DEMO = false;

const CompanyService = (function () {
	function setCompanyLocalStorage(companyDetails) {
		const { empresa, exercicios, permissions, demo } = companyDetails;

		localStorage.setItem(COMPANY_ID, empresa.id);
		localStorage.setItem(COMPANY_NAME, empresa.nome);
		localStorage.setItem(COMPANY_CNPJ, empresa.cnpj);
		localStorage.setItem(OWNER, !!(empresa.owner === 1));
		localStorage.setItem(COMPANY_PREMIUM, !!(empresa.is_premium === 1));
		localStorage.setItem(COMPANY_PREMIUM_TRIAL, !!(empresa.is_trial === 1));
		localStorage.setItem(
			COMPANY_PREMIUM_ASSOCIADA,
			!!(empresa.is_associada === 1)
		);
		localStorage.setItem(COMPANY_PREMIUM_FINAL, empresa.data_final_premium);
		localStorage.setItem(COMPANY_PERMISSIONS, JSON.stringify(permissions));
		localStorage.setItem(COMPANY_ROLES, JSON.stringify(empresa.roles));
		localStorage.setItem(COMPANY_DEMO, !!demo);
		localStorage.setItem(COMPANY_HELP, empresa.is_ajuda);
		localStorage.setItem(TRIAL_AVAILABLE, !!empresa.trial_available);
		localStorage.setItem(EXERCICIOS, JSON.stringify(exercicios));

		const currentYear = exercicios.filter(
			(exercicio) => exercicio.current === true
		);
		if (currentYear.length > 0) {
			localStorage.setItem(EXERCICIO_DEFINIDO, currentYear[0]["ano"]);
		} else {
			localStorage.setItem(EXERCICIO_DEFINIDO, exercicios[0]["ano"]);
		}
	}

	function setExercicioDefinido(year) {
		localStorage.setItem(EXERCICIO_DEFINIDO, year);
	}

	function removeCompanyLocalStorage() {
		localStorage.removeItem(COMPANY_ID);
		localStorage.removeItem(COMPANY_NAME);
		localStorage.removeItem(COMPANY_CNPJ);
		localStorage.removeItem(OWNER);
		localStorage.removeItem(COMPANY_PREMIUM);
		localStorage.removeItem(COMPANY_PREMIUM_TRIAL);
		localStorage.removeItem(COMPANY_PREMIUM_ASSOCIADA);
		localStorage.removeItem(COMPANY_PREMIUM_FINAL);
		localStorage.removeItem(COMPANY_PERMISSIONS);
		localStorage.removeItem(COMPANY_ROLES);
		localStorage.removeItem(COMPANY_DEMO);
		localStorage.removeItem(COMPANY_HELP);
		localStorage.removeItem(TRIAL_AVAILABLE);
		localStorage.removeItem(EXERCICIOS);
		localStorage.removeItem(EXERCICIO_DEFINIDO);
	}

	function getCompanyId() {
		return localStorage.getItem(COMPANY_ID);
	}

	function getExercicioDefinido() {
		return JSON.parse(localStorage.getItem(EXERCICIO_DEFINIDO));
	}

	function getExercicios() {
		return JSON.parse(localStorage.getItem(EXERCICIOS));
	}

	function isPremium() {
		return localStorage.getItem(COMPANY_PREMIUM) === "true";
	}

	function setPremium(isPremium) {
		localStorage.setItem(COMPANY_PREMIUM, isPremium);
	}

	function setPremiumFinal(premiumFinal) {
		localStorage.setItem(COMPANY_PREMIUM_FINAL, premiumFinal);
	}

	function isOwner() {
		return localStorage.getItem(OWNER) === "true";
	}

	function isTrial() {
		return localStorage.getItem(COMPANY_PREMIUM_TRIAL) === "true";
	}

	function setTrial(isTrial) {
		localStorage.setItem(COMPANY_PREMIUM_TRIAL, isTrial);
	}

	function isAssociada() {
		return localStorage.getItem(COMPANY_PREMIUM_ASSOCIADA) === "true";
	}

	function setAssociada(isAssociada) {
		localStorage.setItem(COMPANY_PREMIUM_ASSOCIADA, isAssociada);
	}

	function isDemo() {
		return localStorage.getItem(COMPANY_DEMO) === "true";
	}

	function isHelp() {
		return localStorage.getItem(COMPANY_HELP) === "true";
	}

	function hasTrialAvailable() {
		return localStorage.getItem(TRIAL_AVAILABLE) === "true";
	}

	function setTrialAvailable(isTrialAvailable) {
		localStorage.setItem(TRIAL_AVAILABLE, isTrialAvailable);
	}

	function getPermissions() {
		if (localStorage.getItem(COMPANY_PERMISSIONS)) {
			return JSON.parse(localStorage.getItem(COMPANY_PERMISSIONS));
		}
		return [];
	}

	function getRoles() {
		if (localStorage.getItem(COMPANY_ROLES)) {
			return JSON.parse(localStorage.getItem(COMPANY_ROLES));
		}
		return [];
	}

	function getCompanyName() {
		return localStorage.getItem(COMPANY_NAME);
	}

	function getCompanyCnpj() {
		return localStorage.getItem(COMPANY_CNPJ);
	}

	function getData() {
		if (!getCompanyId()) {
			return null;
		}

		return {
			id: getCompanyId(),
			name: getCompanyName(),
			cnpj: getCompanyCnpj(),
			premiumFinal: localStorage.getItem(COMPANY_PREMIUM_FINAL),
			exercicios: getExercicios(),
			exercicioDefinido: getExercicioDefinido(),
			isPremium: isPremium(),
			isTrial: isTrial(),
			isAssociada: isAssociada(),
			isDemo: isDemo(),
			isHelp: isHelp(),
			hasTrialAvailable: hasTrialAvailable(),
			isOwner: isOwner(),
			permissions: getPermissions(),
			roles: getRoles(),
		};
	}

	function showButton() {
		return isDemo() ? SHOW_SAVE_BUTTON_TO_DEMO : true;
	}

	return {
		setCompanyLocalStorage: setCompanyLocalStorage,
		removeCompanyLocalStorage: removeCompanyLocalStorage,
		setExercicioDefinido: setExercicioDefinido,
		getDataCompany: getData,
		getCurrentCompanyId: getCompanyId,
		getCurrentCompanyName: getCompanyName,
		getCurrentCompanyCnpj: getCompanyCnpj,
		getExercicios: getExercicios,
		setPremium: setPremium,
		setTrial: setTrial,
		setAssociada: setAssociada,
		setPremiumFinal: setPremiumFinal,
		setTrialAvailable: setTrialAvailable,
		showSaveButtonToDemo: showButton,
	};
})();

export default CompanyService;
