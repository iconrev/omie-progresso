import { useState, useEffect } from "react";
import { Redirect } from "react-router-dom";
import MateriaisExclusivos from "./MateriaisExclusivos/index";
import "../../assets/AreaAssociado/styles.css";
import * as services from "../../service/services";
import { toast } from "react-toastify";
import LoadingSpinner from "../../components/LoadingSpinner";
import DemoCompany from "./EmpresaDemo";
import CompanyService from "../../service/CompanyService";

const initialState = {
	items: [],
	currentPage: 1,
	rows: 0,
	totalPages: 0,
	isLoading: true,
};

const AreaAssociado = () => {
	const [isLoading, setLoading] = useState(true);
	const [isAuthorized, setIsAuthorized] = useState(true);
	const [stateFiles, setStateFiles] = useState(initialState);
	const [demoCompany, setDemoCompany] = useState([]);

	useEffect(() => {
		(async () => {
			CompanyService.removeCompanyLocalStorage();

			const handlePaginationFiles = async (page, text) => {
				const { data } = await services.getMateriaisAssociados(page, text);
				const { status } = data;

				if (status === "success") {
					setStateFiles({
						items: data.items,
						currentPage: data.current_page,
						rows: data.rows,
						totalPages: data.total_pages,
					});
				} else {
					if (status === "unauthorized") {
						toast.error("Acesso não autorizado");
						setIsAuthorized(false);
					}
					toast.error("Não foi possível carregar os dados :(");
				}
			};
			const handleCompany = async () => {
				const response = await services.getDemos();
				const { status, demos, message } = response;

				if (status === "success") {
					setDemoCompany(demos);
				} else {
					if (status === "unauthorized") {
						toast.error("Acesso não autorizado");
						setIsAuthorized(false);
					}
					toast.error(message);
				}
			};

			const promiseDocs = handlePaginationFiles(stateFiles.currentPage, "");
			const promiseDemos = handleCompany();

			await Promise.all([promiseDocs, promiseDemos]);

			setLoading(false);
		})();
	}, [stateFiles.currentPage]);

	if (isLoading) return <LoadingSpinner isLoading={isLoading} />;

	if (!isAuthorized) <Redirect to="/" />;

	return (
		<>
			<DemoCompany demos={demoCompany} />
			<MateriaisExclusivos files={stateFiles.items} />
		</>
	);
};

export default AreaAssociado;
