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
import ReactTimeAgo from "react-time-ago/commonjs/ReactTimeAgo";
import LoadingSpinner from "../../../../components/LoadingSpinner";
import PaginationTable from "../../../../components/PaginationTable";
import BadgeSituacaoEmpresa from "../../../../components/BadgeSituacaoEmpresa";
import BadgeEmpresa from "../../../../components/BadgeEmpresa";
import { toast } from "react-toastify";
import * as services from "../../../../service/services";
import { pluralize } from "../../../Utils/Generic";
import ButtonDownloadReport from "./ButtonReportDownload";
import userService from "../../../../service/UserService";

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
		text: "companyId",
		hidden: true,
		headerAlign: "center",
	},
	{
		dataField: "companyName",
		text: "Nome",
		classes: () => "align-middle",
		formatter: (cell, row) => {
			return (
				<>
					<div>{row.companyName}</div>
					<div className={"small text-muted"}>{row.cnpj}</div>
				</>
			);
		},
	},
	{
		dataField: "active",
		text: "Situação",
		headerClasses: "text-center",
		classes: () => "text-center align-middle",
		headerStyle: () => {
			return { width: "10%" };
		},
		formatter: (cell) => {
			return <BadgeSituacaoEmpresa status={cell} />;
		},
	},
	{
		dataField: "empresa_homologada",
		text: "Perfil",
		headerClasses: "text-center",
		classes: () => "text-center align-middle",
		headerStyle: () => {
			return { width: "10%" };
		},
		formatter: (cell) => {
			if (cell === null) cell = "user_default";
			return <BadgeEmpresa status={cell} />;
		},
	},
	{
		dataField: "lastAccess",
		text: "Atividade",
		headerClasses: "text-center",
		classes: () => "text-center align-middle",
		headerStyle: () => {
			return { width: "10%" };
		},
		formatter: (cell, row) => {
			const activity =
				row.lastAccess === null || !row.lastAccess ? (
					<>
						<div className={"small text-muted"}>Último acesso</div>
						<strong>-</strong>
					</>
				) : (
					<>
						<div className={"small text-muted"}>Último acesso</div>
						<strong>
							<ReactTimeAgo
								date={Date.parse(
									row.lastAccess.substring(0, row.lastAccess.length - 1)
								)}
							/>
						</strong>
					</>
				);
			return activity;
		},
	},
	{
		text: "Usuários Ativos",
		headerClasses: "text-center",
		classes: () => "text-center align-middle",
		headerStyle: () => {
			return { width: "10%" };
		},
		formatter: (cell, row) => {
			return row.users;
		},
	},
	{
		text: "Contato Financeiro",
		headerClasses: "text-center",
		classes: () => "align-middle",
		formatter: (cell, row) => {
			return (
				<>
					<div>{row.financeiro_contato}</div>
					<div className={"small text-muted"}>
						E-mail: {row.financeiro_contato_email}
					</div>
					<div className={"small text-muted"}>
						Telefone: {row.financeiro_contato_celular}
					</div>
				</>
			);
		},
	},
];

const CardPremium = (props) => {
	const [state, setState] = useState(initialState);
	const { isLoading, items, rows, currentPage, totalPages } = state;

	const handlePagination = useCallback(async (page, text) => {
		const { data } = await services.getEmpresasPremium(page, text);
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
	}, [currentPage, handlePagination]);

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
						<strong>Painel de Empresas Premium</strong>
					</Col>
				</Row>
			</CardHeader>
			<CardBody>
				<PaginationTable
					keyField={"id"}
					columns={columns}
					data={items}
					totalText={`${rows} ${pluralize(rows, "empresa")} ${pluralize(
						rows,
						"encontrada"
					)}`}
					currentPage={currentPage}
					totalPages={totalPages}
					handlePagination={handlePagination}
					placeholder={"Pesquisar por Nome e CNPJ"}
				/>
			</CardBody>
			<CardFooter>
				<ButtonDownloadReport />
				<Button color={"primary"} className={"float-right"} onClick={goBack}>
					Voltar
				</Button>
			</CardFooter>
		</Card>
	);
};

export default CardPremium;
