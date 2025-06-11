/* eslint-disable max-len */
import { Component } from "react";
import {
	Button,
	Card,
	CardBody,
	CardFooter,
	CardHeader,
	Col,
	Row,
	Badge,
	UncontrolledTooltip,
} from "reactstrap";
import LoadingSpinner from "../../../../components/LoadingSpinner";
import { toast } from "react-toastify";
import BootstrapTable from "react-bootstrap-table-next";
import "../../../../assets/objectivesstyle.css";
import Generic from "../../../Utils/Generic";
import CustomCard from "../../../../components/CustomCard";
import CompanyService from "../../../../service/CompanyService";
import Diretrizes from "../../../../service/Diretrizes";
import "../../../../assets/Gestao/Diretrizes/Execucao/Eficiencia/eficienciastyle.scss";

class Diretrizes_Eficiencia extends Component {
	constructor(props) {
		super(props);

		this.company = CompanyService.getDataCompany();

		this.state = {
			isLoading: true,
			companyId: this.company.id,
			exercicio_definido: this.company.exercicioDefinido,
			data: {
				strategies: [],
				tasks: 0,
				on_time: 0,
				expired: 0,
				finish: 0,
				percentage_on_time: 0,
				percentage_expired: 0,
				percentage_finish: 0,
			},
		};
	}

	async componentDidMount() {
		await this.loadData();
		this.setState({
			isLoading: false,
		});
	}

	async loadData() {
		const result = await Diretrizes.getResumoEficienia();

		const { analise, status, message } = result;

		if (status === "success") {
			this.setState({
				data: analise[this.state.exercicio_definido],
			});
		} else {
			toast.error(message);
		}
	}

	redirect = (url) => {
		url = `/hub/${this.state.companyId}/gestao/categoria/${url}`;
		this.props.history.push(url);
	};

	renderTable = () => {
		const baseConfig = {
			sort: true,
			align: "center",
			headerAlign: "center",
			headerStyle: () => {
				return { width: "10%" };
			},
		};

		const columns = [
			{
				...baseConfig,
				dataField: "Estrategia.perspectiva",
				text: "Categoria",
				formatter: (cellContent, row) => {
					return (
						<Badge
							className={`background background-${row["Estrategia.perspectiva"]} text-white`}
						>
							{row["Estrategia.perspectiva"]}
						</Badge>
					);
				},
			},
			{
				dataField: "descricao",
				text: "Estratégia",
				sort: true,
				formatter: (cell, row) => {
					const redirectToStrategy = () => {
						this.props.history.push({
							pathname: `/hub/${this.state.companyId}/gestao/categoria/diretrizes/estrategias/${row["Estrategia.perspectiva"]}/${row.id}`,
							state: row,
						});
					};

					return (
						<div
							onClick={redirectToStrategy}
							className={"cursor-pointer"}
							title={"Acessar estratégia"}
						>
							{cell}
						</div>
					);
				},
			},
			{
				...baseConfig,
				dataField: "info.tasks",
				text: "Tarefas",
				formatter: (cellContent, row) => {
					if (row.info.tasks === 0) {
						return (
							<div>
								<i
									id={"danger-" + row.id}
									className="fa fa-exclamation-triangle color-red"
								/>
								<UncontrolledTooltip target={"danger-" + row.id}>
									Esta estratégia não contém tarefas
								</UncontrolledTooltip>
							</div>
						);
					} else {
						return row.info.tasks;
					}
				},
			},
			{
				...baseConfig,
				dataField: "info.on_time",
				text: "No prazo",
				formatter: (cellContent, row) =>
					row.info.tasks - row.info.realizado - row.info.expired,
			},
			{
				...baseConfig,
				dataField: "info.expired",
				text: "Atrasadas",
				formatter: (cellContent, row) => {
					const expireds = row.info.expired;
					if (expireds > 0) {
						const plural = expireds > 1 ? "s" : "";
						const msg =
							"Esta estratégia contém " +
							expireds +
							" tarefa" +
							plural +
							" atrasada" +
							plural;
						return (
							<div>
								{expireds}{" "}
								<i
									id={"danger-" + row.id}
									className="fa fa-exclamation-triangle color-red"
								/>
								<UncontrolledTooltip target={"danger-" + row.id}>
									{msg}
								</UncontrolledTooltip>
							</div>
						);
					} else {
						return expireds;
					}
				},
			},
			{
				dataField: "info.realizado",
				text: "Implementadas",
				sort: true,
				align: "center",
				headerAlign: "center",
				formatter: (cellContent, row) => row.info.realizado,
			},
		];

		const defaultSorted = [
			{
				dataField: "descricao",
				order: "asc",
			},
		];

		return (
			<Row>
				<Col>
					<BootstrapTable
						keyField="unique_id"
						data={this.state.data["strategies"]}
						columns={columns}
						defaultSortDirection="desc"
						defaultSorted={defaultSorted}
						striped
						hover
					/>
				</Col>
			</Row>
		);
	};

	renderWidgets = () => {
		return (
			<Row>
				<Col>
					<CustomCard
						value={Generic.formatNumber(this.state.data.tasks, 0)}
						color={"info"}
						title={"Tarefas"}
						subtitle={`Total de tarefas para as ${this.state.data.strategies.length} estratégias`}
					/>
				</Col>
				<Col>
					<CustomCard
						value={Generic.formatNumber(this.state.data.on_time, 0)}
						color={"warning"}
						perc={this.state.data.percentage_on_time}
						title={"Tarefas no Prazo"}
						subtitle={`${Generic.formatNumber(
							this.state.data.percentage_on_time,
							2
						)}% estão dentro do prazo`}
					/>
				</Col>
				<Col>
					<CustomCard
						value={Generic.formatNumber(this.state.data.expired, 0)}
						color={"danger"}
						title={"Tarefas Atrasadas"}
						perc={this.state.data.percentage_expired}
						subtitle={`${Generic.formatNumber(
							this.state.data.percentage_expired,
							2
						)}% estão atrasadas`}
					/>
				</Col>
				<Col>
					<CustomCard
						value={Generic.formatNumber(this.state.data.finish, 0)}
						color={"success"}
						title={"Tarefas Concluídas"}
						perc={this.state.data.percentage_finish}
						subtitle={`${Generic.formatNumber(
							this.state.data.percentage_finish,
							2
						)}% foram concluídas`}
					/>
				</Col>
			</Row>
		);
	};

	loaded = () => {
		return (
			<div className="animated fadeIn">
				<Row>
					<Col>
						<Card className="card-accent-secondary">
							<CardHeader>
								<strong>Análise da Eficiência</strong>
								<Button
									className="btn btn-sm btn-info mr-1 float-right"
									onClick={() => this.redirect("diretrizes")}
								>
									<i className="fa fa-arrow-left" /> Voltar
								</Button>
							</CardHeader>
							<CardBody>
								{this.renderWidgets()}
								{this.renderTable()}
							</CardBody>
							<CardFooter>
								<Button
									className="btn btn-sm btn-info mr-1 float-right"
									onClick={() => this.redirect("diretrizes")}
								>
									<i className="fa fa-arrow-left" /> Voltar
								</Button>
							</CardFooter>
						</Card>
					</Col>
				</Row>
			</div>
		);
	};

	render() {
		return this.state.isLoading ? (
			<LoadingSpinner isLoading={this.state.isLoading} />
		) : (
			this.loaded()
		);
	}
}

export default Diretrizes_Eficiencia;
