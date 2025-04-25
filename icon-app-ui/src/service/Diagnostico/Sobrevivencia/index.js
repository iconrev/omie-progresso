import responseErrorDefault from "../../responseErrorDefault";
import ApiBase from "../../api_base";
import CompanyService from "../../CompanyService";
import CacheDemoService from "../../CacheDemoService";

const Api_Base = new ApiBase();

const getGrafico = async () => {
	const company = CompanyService.getDataCompany();
	const companyId = company.id;
	const isDemo = company.isDemo;
	const urlDemo = isDemo ? "?demo=true" : "";
	return await new Promise(async (resolve) => {
		await Api_Base.get(
			`/gestao/diagnostico/sobrevivencia/questionario/empresa/${companyId}/avaliacao${urlDemo}`
		)
			.then((response) => resolve(response))
			.catch((error) => resolve(responseErrorDefault(error)));
	});
};

const getSobrevivenciaLista = async () => {
	const company = CompanyService.getDataCompany();
	const companyId = company.id;
	const isDemo = company.isDemo;
	const urlDemo = isDemo ? "?demo=true" : "";
	if (isDemo) {
		const response = CacheDemoService.getSobrevivencia();
		if (response) {
			console.info("Usando cache para Sobrevivencia");
			return response;
		}
	}

	console.info("Carregando Sobrevivencia via API");

	return await new Promise(async (resolve) => {
		await Api_Base.get(
			`/gestao/diagnostico/sobrevivencia/questionario/empresa/${companyId}${urlDemo}`
		)
			.then((response) => {
				if (isDemo) CacheDemoService.setSobrevivencia(response.data);
				return resolve(response.data);
			})
			.catch((error) => resolve(responseErrorDefault(error)));
	});
};

const updateSobrevivencia = async (data) => {
	const company = CompanyService.getDataCompany();
	const companyId = company.id;
	const isDemo = company.isDemo;
	const exercicio = company.exercicioDefinido;

	if (isDemo) {
		CacheDemoService.updateSobrevivencia(exercicio, data);
		return {
			status: "success",
			message: "Atualizado com sucesso",
		};
	}

	return await new Promise(async (resolve) => {
		await Api_Base.post(
			`/gestao/diagnostico/sobrevivencia/questionario/empresa/${companyId}`,
			data
		)
			.then((response) => resolve(response.data))
			.catch((error) => resolve(responseErrorDefault(error)));
	});
};

const SobrevivenciaService = (function () {
	return {
		getGrafico: getGrafico,
		getLista: getSobrevivenciaLista,
		update: updateSobrevivencia,
	};
})();

export default SobrevivenciaService;
