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
import BadgeEmpresa from "../../../components/BadgeEmpresa";
import BadgeSituacaoEmpresa from "../../../components/BadgeSituacaoEmpresa";
import userService from "../../../service/UserService";
import Geral from "../../../service/Geral";
import CompanyService from "../../../service/CompanyService";

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
		dataField: "cnpj",
		text: "CNPJ",
		align: "center",
		headerStyle: () => {
			return { width: "10%", textAlign: "center" };
		},
	},
	{
		dataField: "active",
		text: "Situação",
		align: "center",
		headerStyle: () => {
			return { width: "10%", textAlign: "center" };
		},
		formatter: (cell) => {
			return <BadgeSituacaoEmpresa status={cell} />;
		},
	},
	{
		dataField: "createdAt",
		text: "Data de Cadastro",
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
		dataField: "empresa_homologada",
		text: "Perfil",
		align: "center",
		headerStyle: () => {
			return { width: "10%", textAlign: "center" };
		},
		formatter: (cell) => {
			if (cell === null) cell = "user_default";
			return <BadgeEmpresa status={cell} />;
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
		dataField: "activeUsers",
		text: "Usuários Ativos",
		align: "center",
		headerStyle: () => {
			return { width: "10%", textAlign: "center" };
		},
	},
];

const columnAction = {
	dataField: "actions",
	formatter: (cell, row) => {
		const handleClick = async (event) => {
			event.preventDefault();

			const response = await Geral.getCompanyData(row.id);
			const { status, exercicios } = response;
			if (status === "success") {
				if (exercicios.length === 0) {
					toast.error("A empresa não possui exercícios cadastrados...");
				} else {
					CompanyService.setCompanyLocalStorage(response);
					window.location.href = `#/hub/${row.id}/gestao`;
				}
			} else {
				const { message } = response;
				toast.error(message);
			}
		};

		return (
			<Button className="success" onClick={handleClick}>
				Acessar
			</Button>
		);
	},
	text: "",
	align: "center",
	headerStyle: () => {
		return { width: "10%", textAlign: "center" };
	},
};

const PainelEmpresas = (props) => {
	const [state, setState] = useState(initialState);
	const dataUser = userService.getUser();

	const handlePagination = async (page, text) => {
		const { data } = await services.getEmpresas(page, text);
		if (data) {
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
		} else {
			toast.error("Não foi possível carregar os dados :(");
			setState({
				...initialState,
				isLoading: false,
			});
		}
	};

	useEffect(() => {
		if (!dataUser.isAdmin) {
			toast.error("Acesso negado!");
			return props.history.push("/");
		}

		(async () => {
			await handlePagination(currentPage, "");
		})();
	}, []);

	const { isLoading, items, rows, currentPage, totalPages } = state;

	if (isLoading) return <LoadingSpinner isLoading={isLoading} />;

	const goBack = (event) => {
		event.preventDefault();
		return props.history.push("/administrativo");
	};

	const goPremiumCompanies = (event) => {
		event.preventDefault();
		return props.history.push("/administrativo/empresas/premium");
	};

	if (dataUser.profile === "superadmin") {
		if (columns.length === 8) columns.push(columnAction);
	}

	return (
		<Card>
			<CardHeader>
				<Row>
					<Col xs="12" md="6" lg="6">
						<strong>Painel de Empresas</strong>
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
							? `${rows} empresas encontradas`
							: `${rows} empresa encontrada`
					}
					currentPage={currentPage}
					totalPages={totalPages}
					handlePagination={handlePagination}
					placeholder={"Pesquisar por Nome e CNPJ"}
				/>
			</CardBody>
			<CardFooter>
				<Button
					color={"dark"}
					className={"float-left"}
					onClick={goPremiumCompanies}
				>
					Empresas Premium
				</Button>
				<Button color={"primary"} className={"float-right"} onClick={goBack}>
					Voltar
				</Button>
			</CardFooter>
		</Card>
	);
};

export default PainelEmpresas;
