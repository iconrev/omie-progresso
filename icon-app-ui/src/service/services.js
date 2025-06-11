import axios from "axios";
import ApiBase from "./api_base";
import CompanyService from "./CompanyService";
import responseErrorDefault from "./responseErrorDefault";
import userService from "./UserService";
import { LocalStorageService } from "./localStorageService";

const api_base = new ApiBase();

export const vincularUsuario = async (payload = {}) => {
	return await new Promise(async (resolve) => {
		await api_base
			.post(`/cadastros/migrar/usuarios/vincular`, payload)
			.then((response) => {
				const { status, profile, admin, contador } = response.data;

				if (status === "success") {
					userService.setContador(contador);
					userService.setAdmin(admin);
					userService.setProfile(profile);
					userService.setLogged(true);
				}

				return resolve(response);
			})
			.catch((error) => {
				console.error("ERROR VINCULAR", error);
				return resolve(responseErrorDefault(error));
			});
	});
};

export const logoutUsuario = async () => {
	LocalStorageService.clearStorage();
	userService.doLogout();
};

export const getAssociados = async (page = "0", query = "") => {
	return await new Promise((resolve) => {
		api_base
			.get(`/administrativo/associados?page=${page}&q=${query}`)
			.then((response) => resolve(response))
			.catch((error) => resolve(responseErrorDefault(error)));
	});
};

export const getUsuarios = async (page = "0", query = "") => {
	return await new Promise((resolve) => {
		api_base
			.get(`/administrativo/usuarios?page=${page}&q=${query}`)
			.then((response) => resolve(response))
			.catch((error) => resolve(responseErrorDefault(error)));
	});
};

export const getEmpresas = async (page = "0", query = "") => {
	return await new Promise((resolve) => {
		api_base
			.get(`/administrativo/empresas?page=${page}&q=${query}`)
			.then((response) => resolve(response))
			.catch((error) => resolve(responseErrorDefault(error)));
	});
};

export const createNewCompany = async (companyData) => {
	return await new Promise((resolve) => {
		api_base
			.post(`/cadastros/empresas`, companyData)
			.then((response) => resolve(response.data))
			.catch((error) => resolve(responseErrorDefault(error)));
	});
};

export const updateCompany = async (companyId, companyData) => {
	return await new Promise((resolve) => {
		api_base
			.put(`/cadastros/empresas/${companyId}`, companyData)
			.then((response) => resolve(response.data))
			.catch((error) => resolve(responseErrorDefault(error)));
	});
};

export const getPremiumCompanyReport = async () => {
	return await new Promise((resolve) => {
		api_base
			.get(`/administrativo/empresas/premium/download`)
			.then((response) => resolve(response))
			.catch((error) => resolve(responseErrorDefault(error)));
	});
};

export const getEmpresasPremium = async (page = "0", query = "") => {
	return await new Promise((resolve) => {
		api_base
			.get(`/administrativo/empresas/premium?page=${page}&q=${query}`)
			.then((response) => resolve(response))
			.catch((error) => resolve(responseErrorDefault(error)));
	});
};

export const getEmpresaDetalhesPremium = async (companyId) => {
	return await new Promise((resolve) => {
		api_base
			.get(`/cadastros/empresas/${companyId}/detalhes`)
			.then((response) => resolve(response))
			.catch((error) => resolve(responseErrorDefault(error)));
	});
};

export const getMateriaisAssociados = async (page = "0", query = "") => {
	return await new Promise((resolve) => {
		api_base
			.get(`/associados/materiais?page=${page}&q=${query}`)
			.then((response) => resolve(response))
			.catch((error) => resolve(responseErrorDefault(error)));
	});
};

export const getDemos = async () => {
	return await new Promise((resolve) => {
		api_base
			.get(`/associados/demo`)
			.then((response) => resolve(response.data))
			.catch((error) => resolve(responseErrorDefault(error)));
	});
};

export const getCompanyDetails = async (companyId, isDemo = false) => {
	return await new Promise((resolve) => {
		const urlDemo = isDemo ? `?demo=true` : ``;
		api_base
			.get(`/cadastros/empresas/${companyId}/detalhes${urlDemo}`)
			.then((response) => {
				CompanyService.setCompanyLocalStorage(response.data);
				return resolve(response.data);
			})
			.catch((error) => {
				CompanyService.removeCompanyLocalStorage();
				return resolve(responseErrorDefault(error));
			});
	});
};

export const getFileAssociadoById = async (id) => {
	return await new Promise((resolve) => {
		api_base
			.get(`/associados/materiais/download/${id}`)
			.then((response) => resolve(response))
			.catch((error) => resolve(responseErrorDefault(error)));
	});
};

export const getMateriaisAssociadosAdministrativo = async (
	page = "0",
	query = ""
) => {
	return await new Promise((resolve) => {
		api_base
			.get(`/administrativo/associados/materiais?page=${page}&q=${query}`)
			.then((response) => resolve(response))
			.catch((error) => resolve(responseErrorDefault(error)));
	});
};

export const uploadNewFile = async (payload) => {
	return await new Promise((resolve) => {
		api_base
			.post(`/administrativo/associados/materiais`, payload)
			.then((response) => resolve(response.data))
			.catch((error) => resolve(responseErrorDefault(error)));
	});
};

export const getRolesCompany = async (companyId) => {
	return await new Promise((resolve) => {
		api_base
			.get(`/helpers/company/${companyId}/roles`)
			.then((response) => resolve(response))
			.catch((error) => resolve(responseErrorDefault(error)));
	});
};

export const getUsersCompany = async (companyId) => {
	return await new Promise(async (resolve) => {
		await api_base
			.get(`/cadastros/empresas/${companyId}/usuarios`)
			.then((response) => resolve(response))
			.catch((error) => resolve(responseErrorDefault(error)));
	});
};

export const createNewUserInCompany = async (companyId, payload) => {
	return await new Promise((resolve) => {
		api_base
			.post(`/cadastros/empresas/${companyId}/usuarios/novo`, payload)
			.then((response) => resolve(response.data))
			.catch((error) => resolve(responseErrorDefault(error)));
	});
};

export const updateUserInCompany = async (companyId, payload) => {
	return await new Promise((resolve) => {
		api_base
			.post(`/cadastros/empresas/${companyId}/usuarios/update`, payload)
			.then((response) => resolve(response.data))
			.catch((error) => resolve(responseErrorDefault(error)));
	});
};

export const removeUserInCompany = async (companyId, payload) => {
	return await new Promise((resolve) => {
		api_base
			.post(`/cadastros/empresas/${companyId}/usuarios/remove`, payload)
			.then((response) => resolve(response.data))
			.catch((error) => resolve(responseErrorDefault(error)));
	});
};

export const cancelInvited = async (payload) => {
	return await new Promise((resolve) => {
		api_base
			.post(`/cadastros/empresas/usuarios/convite/cancelar`, payload)
			.then((response) => resolve(response))
			.catch((error) => resolve(responseErrorDefault(error)));
	});
};

export const resendInvited = async (payload) => {
	return await new Promise((resolve) => {
		api_base
			.post(`/cadastros/empresas/usuarios/convite/reenviar`, payload)
			.then((response) => resolve(response))
			.catch((error) => resolve(responseErrorDefault(error)));
	});
};

export const findCnpj = async (cnpj) => {
	return await new Promise((resolve) => {
		api_base
			.get(`/cadastros/empresas/cnpj/${cnpj}`)
			.then((response) => resolve(response))
			.catch((error) => resolve(responseErrorDefault(error)));
	});
};

export const findCep = async (cep) => {
	return await axios.get(`https://viacep.com.br/ws/${cep}/json/`);
};

export const activePremium = async (companyId, payload) => {
	return await new Promise((resolve) => {
		api_base
			.post(`/cadastros/empresas/${companyId}/ativar-premium`, payload)
			.then((response) => resolve(response.data))
			.catch((error) => resolve(responseErrorDefault(error)));
	});
};
