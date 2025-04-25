import { useState, useEffect } from "react";
import {
	Card,
	CardBody,
	CardHeader,
	Col,
	Row,
	Button,
	CardFooter,
} from "reactstrap";
import LoadingSpinner from "../../../components/LoadingSpinner";
import * as services from "../../../service/services";
import PaginationTable from "../../../components/PaginationTable";
import ReactTimeAgo from "react-time-ago";
import { toast } from "react-toastify";
import ModalDocumento from "./ModalDocumento";
import userService from "../../../service/UserService";

const onClickDownloadFile = async (file) => {
	const { data } = await services.getFileAssociadoById(file.id);
	const { status } = data;

	if (status === "success") {
		let { url } = data;
		url = url.replace(".sa-east-1", "");

		window.open(url, "_blank").focus();
	} else {
		toast.error("Não foi possível efetuar o download :(");
	}
};

const onClickDev = () => {
	toast.info("Em desenvolvimento");
};

const initialState = {
	items: [],
	currentPage: 1,
	rows: 0,
	totalPages: 0,
	isLoading: true,
};

const columnsFiles = [
	{
		dataField: "id",
		text: "FileId",
		hidden: true,
	},
	{
		dataField: "title",
		text: "Título",
		headerStyle: () => {
			return { width: "20%", textAlign: "center" };
		},
	},
	{
		dataField: "description",
		text: "Descrição",
		align: "center",
		headerStyle: () => {
			return { width: "40%", textAlign: "center" };
		},
	},
	{
		dataField: "downloads",
		text: "Downloads",
		align: "center",
		headerStyle: () => {
			return { width: "10%", textAlign: "center" };
		},
	},
	{
		dataField: "createdAt",
		text: "Data upload",
		align: "center",
		headerStyle: () => {
			return { width: "10%", textAlign: "center" };
		},
		formatter: (cell) => {
			if (cell === null) return "-";
			return <ReactTimeAgo date={Date.parse(cell)} />;
		},
	},
	{
		dataField: "id",
		text: "Funções",
		align: "center",
		headerStyle: () => {
			return { width: "20%", textAlign: "center" };
		},
		formatter: (cell, row) => {
			return (
				<Row>
					<Col>
						<Button
							className={"ml-1 mr-1"}
							title={"Download"}
							onClick={() => onClickDownloadFile(row)}
							color={"success"}
						>
							<span className="fa fa-download" />
						</Button>
						<Button
							className={"ml-1 mr-1"}
							title={"Excluir"}
							onClick={onClickDev}
							color={"danger"}
						>
							<span className="fa fa-trash" />
						</Button>
						<Button
							className={"ml-1 mr-1"}
							title={"Ocultar"}
							onClick={onClickDev}
							color={"info"}
						>
							<span className="fa fa-low-vision" />
						</Button>
					</Col>
				</Row>
			);
		},
	},
];

const columns = [
	{
		dataField: "id",
		text: "UserId",
		hidden: true,
		headerAlign: "center",
	},
	{
		dataField: "nome",
		text: "Nome",
		headerStyle: () => {
			return { width: "30%", textAlign: "center" };
		},
	},
	{
		dataField: "email",
		text: "E-mail",
		align: "center",
		headerStyle: () => {
			return { width: "20%", textAlign: "center" };
		},
	},
	{
		dataField: "crc",
		text: "CRC/CPF",
		align: "center",
		headerStyle: () => {
			return { width: "10%", textAlign: "center" };
		},
	},
	{
		dataField: "phone",
		text: "Telefone",
		align: "center",
		headerStyle: () => {
			return { width: "10%", textAlign: "center" };
		},
	},
	{
		dataField: "since",
		text: "Associação",
		align: "center",
		headerStyle: () => {
			return { width: "10%", textAlign: "center" };
		},
		formatter: (cell) => {
			return <ReactTimeAgo date={Date.parse(cell)} />;
		},
	},
	{
		dataField: "lastAccess",
		text: "Último acesso",
		align: "center",
		headerStyle: () => {
			return { width: "10%", textAlign: "center" };
		},
		formatter: (cell) => {
			if (cell === null) return "-";
			return <ReactTimeAgo date={Date.parse(cell)} />;
		},
	},
	{
		dataField: "companies",
		text: "Empresas",
		align: "center",
		headerStyle: () => {
			return { width: "10%", textAlign: "center" };
		},
	},
];

const PainelAssociados = (props) => {
	const [state, setState] = useState(initialState);
	const [stateFiles, setStateFiles] = useState(initialState);
	const [modal, setModal] = useState(false);

	const handlePagination = async (page, text) => {
		const { data } = await services.getAssociados(page, text);
		const { status } = data;

		if (status === "success") {
			setState({
				items: data.items,
				currentPage: data.current_page,
				rows: data.rows,
				totalPages: data.total_pages,
				isLoading: false,
			});
		} else {
			toast.error("Não foi possível carregar os dados :(");
			setState({
				...initialState,
				isLoading: false,
			});
		}
	};

	const handlePaginationFiles = async (page, text) => {
		const { data } = await services.getMateriaisAssociadosAdministrativo(
			page,
			text
		);
		const { status } = data;

		if (status === "success") {
			setStateFiles({
				items: data.items,
				currentPage: data.current_page,
				rows: data.rows,
				totalPages: data.total_pages,
				isLoading: false,
			});
		} else {
			toast.error("Não foi possível carregar os dados :(");
			await setStateFiles({
				...initialState,
				isLoading: false,
			});
		}
	};

	useEffect(() => {
		const dataUser = userService.getUser();
		if (!dataUser.isAdmin) {
			toast.error("Acesso negado!");
			return props.history.push("/");
		}

		(async () => {
			handlePagination(state.currentPage, "");
			handlePaginationFiles(stateFiles.currentPage, "");
		})();
	}, []);

	if (state.isLoading || stateFiles.isLoading)
		return <LoadingSpinner isLoading={state.isLoading} />;

	const goBack = (event) => {
		event.preventDefault();
		props.history.push("/administrativo");
	};

	const toggle = () => setModal(!modal);

	return (
		<>
			<Card>
				<CardHeader>
					<Row>
						<Col xs="12" md="6" lg="6">
							<strong>Painel de Associados</strong>
						</Col>
					</Row>
				</CardHeader>
				<CardBody>
					<PaginationTable
						keyField={"id"}
						columns={columns}
						data={state.items}
						totalText={`${state.rows} associados encontrados`}
						currentPage={state.currentPage}
						totalPages={state.totalPages}
						handlePagination={handlePagination}
						placeholder={"Pesquisar por Nome e E-mail"}
					/>
				</CardBody>
				<CardFooter>
					<Button color={"primary"} className={"float-right"} onClick={goBack}>
						Voltar
					</Button>
				</CardFooter>
			</Card>

			<Card>
				<CardHeader>
					<Row>
						<Col xs="12" md="6" lg="6">
							<strong>Materiais Exclusivos para Associados</strong>
						</Col>
					</Row>
				</CardHeader>
				<CardBody>
					<PaginationTable
						keyField={"id"}
						columns={columnsFiles}
						data={stateFiles.items}
						totalText={`${stateFiles.rows} documento${
							stateFiles.rows > 1 ? "s" : ""
						} encontrado${stateFiles.rows > 1 ? "s" : ""}`}
						currentPage={stateFiles.currentPage}
						totalPages={stateFiles.totalPages}
						handlePagination={handlePagination}
						placeholder={"Pesquisar por Nome e E-mail"}
					/>
				</CardBody>
				<CardFooter>
					<Button color={"warning"} onClick={toggle}>
						Adicionar novo arquivo
					</Button>
				</CardFooter>

				<ModalDocumento
					isOpen={modal}
					toggle={toggle}
					className={""}
					title={"Adicionar novo arquivo"}
				/>
			</Card>
		</>
	);
};

export default PainelAssociados;
