import { useState, useEffect, useCallback } from "react";
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
import BadgeProfile from "../../../components/BadgeProfile";
import userService from "../../../service/UserService";

const initialState = {
	items: [],
	currentPage: 1,
	rows: 0,
	totalPages: 0,
	isLoading: true,
};

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
		formatter: (cell, row) => {
			return (
				<>
					<p style={{ margin: 0, fontSize: "400" }}>{row.nome}</p>
					<small className="text-muted font-italic">{row.id}</small>
				</>
			);
		},
	},
	{
		dataField: "email",
		text: "E-mail",
		align: "center",
		headerStyle: () => {
			return { width: "30%", textAlign: "center" };
		},
	},
	{
		dataField: "profile",
		text: "Perfil",
		align: "center",
		headerStyle: () => {
			return { width: "10%", textAlign: "center" };
		},
		formatter: (cell) => {
			if (cell === null) cell = "user_default";
			return <BadgeProfile profile={cell} />;
		},
	},
	{
		dataField: "createdAt",
		text: "Data de Registro",
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

const PainelUsuarios = (props) => {
	const [state, setState] = useState(initialState);
	const { isLoading, items, rows, currentPage, totalPages } = state;

	const handlePagination = useCallback(async (page, text) => {
		const { data } = await services.getUsuarios(page, text);
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
	}, []);

	useEffect(() => {
		(async () => {
			await handlePagination(currentPage, "");
		})();
	}, []);

	const dataUser = userService.getUser();
	if (!dataUser.isAdmin) {
		toast.error("Acesso negado!");
		return props.history.push("/");
	}

	if (isLoading) return <LoadingSpinner isLoading={isLoading} />;

	const goBack = (event) => {
		event.preventDefault();
		props.history.push("/administrativo");
	};

	return (
		<Card>
			<CardHeader>
				<Row>
					<Col xs="12" md="6" lg="6">
						<strong>Painel de Usuários</strong>
					</Col>
				</Row>
			</CardHeader>
			<CardBody>
				<PaginationTable
					keyField={"id"}
					columns={columns}
					data={items}
					totalText={
						rows > 1
							? `${rows} usuários encontrados`
							: `${rows} usuários encontrado`
					}
					currentPage={currentPage}
					totalPages={totalPages}
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
	);
};

export default PainelUsuarios;
