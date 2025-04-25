import responseErrorDefault from "../responseErrorDefault";
import ApiMetas from "../api_metas";
import CompanyService from "../CompanyService";

const Api_Metas = new ApiMetas();

const getUrlService = (path, allowDemo = true) => {
	const company = CompanyService.getDataCompany();
	const companyId = company ? company.id : undefined;
	const isDemo = company ? company.isDemo && allowDemo : undefined;
	const urlDemo = isDemo ? `${path.includes("?") ? "&" : "?"}demo=true` : "";
	return `/gestao/${companyId}/diretrizes${path}${urlDemo}`;
};

const getGestaoGrafico = async () => {
	return await new Promise(async (resolve) => {
		const url = getUrlService("/grafico");
		await Api_Metas.get(url)
			.then((response) => resolve(response.data))
			.catch((error) => resolve(responseErrorDefault(error)));
	});
};

const getDadosGraficosDiretrizes = async () => {
	return await new Promise(async (resolve) => {
		const url = getUrlService("/estrategias/grafico");
		await Api_Metas.get(url)
			.then((response) => resolve(response.data))
			.catch((error) => resolve(responseErrorDefault(error)));
	});
};

const getOrganizacaoDasEstrategias = async (trimestre = "") => {
	return await new Promise(async (resolve) => {
		const filter = trimestre !== "" ? `?trimestre=${trimestre}` : "";
		const url = getUrlService(`/estrategias/listar${filter}`);
		await Api_Metas.get(url)
			.then((response) => resolve(response.data))
			.catch((error) => resolve(responseErrorDefault(error)));
	});
};

const updateEstrategias = async (payload) => {
	return await new Promise(async (resolve) => {
		const url = getUrlService("/estrategias/salvar");
		await Api_Metas.post(url, payload)
			.then((response) => resolve(response.data))
			.catch((error) => resolve(responseErrorDefault(error)));
	});
};

const getTasksFromStrategyId = async (statregyId, perspective) => {
	return await new Promise(async (resolve) => {
		const url = getUrlService(
			`/estrategias/${statregyId}/${perspective}/tarefas/listar`
		);
		await Api_Metas.get(url)
			.then((response) => resolve(response.data))
			.catch((error) => resolve(responseErrorDefault(error)));
	});
};

const getResponsaveis = async () => {
	return await new Promise(async (resolve) => {
		const url = getUrlService(`/responsaveis/listar`);
		await Api_Metas.get(url)
			.then((response) => resolve(response.data))
			.catch((error) => resolve(responseErrorDefault(error)));
	});
};

const postNewTask = async (task) => {
	return await new Promise(async (resolve) => {
		const url = getUrlService("/estrategias/tarefas/nova");
		await Api_Metas.post(url, task)
			.then((response) => resolve(response.data))
			.catch((error) => resolve(responseErrorDefault(error)));
	});
};

const updateTask = async (task) => {
	return await new Promise(async (resolve) => {
		const url = getUrlService("/estrategias/tarefas/editar");
		await Api_Metas.post(url, task)
			.then((response) => resolve(response.data))
			.catch((error) => resolve(responseErrorDefault(error)));
	});
};

const getResumoEficienia = async () => {
	return await new Promise(async (resolve) => {
		const url = getUrlService("/eficiencia/resumo");
		await Api_Metas.get(url)
			.then((response) => resolve(response.data))
			.catch((error) => resolve(responseErrorDefault(error)));
	});
};

const getGraficosEficacia = async () => {
	return await new Promise(async (resolve) => {
		const url = getUrlService("/eficacia/graficos");
		await Api_Metas.get(url)
			.then((response) => resolve(response.data))
			.catch((error) => resolve(responseErrorDefault(error)));
	});
};

const getDadosDre = async () => {
	return await new Promise(async (resolve) => {
		const url = getUrlService("/eficacia/dre");
		await Api_Metas.get(url)
			.then((response) => resolve(response.data))
			.catch((error) => resolve(responseErrorDefault(error)));
	});
};

const updateDadosDre = async (payload) => {
	return await new Promise(async (resolve) => {
		const url = getUrlService("/eficacia/dre");
		await Api_Metas.post(url, payload)
			.then((response) => resolve(response.data))
			.catch((error) => resolve(responseErrorDefault(error)));
	});
};

const getDadosLevantamento = async () => {
	return await new Promise(async (resolve) => {
		const url = getUrlService("/eficacia/levantamento");
		await Api_Metas.get(url)
			.then((response) => resolve(response.data))
			.catch((error) => resolve(responseErrorDefault(error)));
	});
};

const updateDadosLevantamento = async (payload) => {
	return await new Promise(async (resolve) => {
		const url = getUrlService("/eficacia/levantamento");
		await Api_Metas.post(url, payload)
			.then((response) => resolve(response.data))
			.catch((error) => resolve(responseErrorDefault(error)));
	});
};

const getDadosDashboard = async () => {
	return await new Promise(async (resolve) => {
		const url = getUrlService("/eficacia/dashboard");
		await Api_Metas.get(url)
			.then((response) => resolve(response.data))
			.catch((error) => resolve(responseErrorDefault(error)));
	});
};

const getDadosDashboardReset = async () => {
	return await new Promise(async (resolve) => {
		const url = getUrlService("/eficacia/dashboard/meta/reset");
		await Api_Metas.get(url)
			.then((response) => resolve(response.data))
			.catch((error) => resolve(responseErrorDefault(error)));
	});
};

const getDadosDashboardMeta = async (payload) => {
	return await new Promise(async (resolve) => {
		const url = getUrlService("/eficacia/dashboard/meta");
		await Api_Metas.post(url, payload)
			.then((response) => resolve(response.data))
			.catch((error) => resolve(responseErrorDefault(error)));
	});
};

const Metas = {
	getGestaoGrafico,
	getDadosGraficosDiretrizes,
	getOrganizacaoDasEstrategias,
	updateEstrategias,
	getTasksFromStrategyId,
	getResponsaveis,
	postNewTask,
	updateTask,
	getResumoEficienia,
	getGraficosEficacia,
	getDadosDre,
	updateDadosDre,
	getDadosLevantamento,
	updateDadosLevantamento,
	getDadosDashboard,
	getDadosDashboardReset,
	getDadosDashboardMeta,
};

export default Metas;
