import { Component } from "react";
import {
	Button,
	Card,
	CardBody,
	CardFooter,
	CardHeader,
	Col,
	Row,
} from "reactstrap";
import { toast } from "react-toastify";
import LoadingSpinner from "../../../components/LoadingSpinner";
import Gauge from "../../Graficos/Metas/Gauge";
import CompanyService from "../../../service/CompanyService";
import Diretrizes from "../../../service/Diretrizes";

class Diretrizes_Mapa extends Component {
	constructor(props) {
		super(props);

		this.company = CompanyService.getDataCompany();
		if (!this.company) return this.props.history.push("/");

		this.state = {
			isLoading: true,
			companyId: this.company.id,
			exercicio_definido: this.company.exercicioDefinido,

			data: {
				eficiencia: 0,
				nivel_prenchimento: 0,
				eficacia: 0,
			},
		};
	}

	async componentDidMount() {
		if (this.company.isPremium || this.company.isDemo) {
			await this.loadData();
			this.setState({
				isLoading: false,
			});
		} else {
			console.warn("Acesso negado");
			return this.redirect();
		}
	}

	async loadData() {
		let eficiencia = 0;
		let eficaciaResponse = 0;
		let nivelPreenchimentoResponse = 0;

		const result = await Diretrizes.getDadosGraficosDiretrizes();
		let { status, analise } = result;

		if (status !== "success") {
			toast.error("Não foi possível carregar os dados da página");
			return this.redirect("/gestao");
		}

		let { on_time_tasks_percentage, eficacia, nivel_prenchimento } =
			analise[this.state.exercicio_definido];
		eficiencia = on_time_tasks_percentage;
		eficaciaResponse = eficacia;
		nivelPreenchimentoResponse = nivel_prenchimento;

		this.setState({
			data: {
				eficiencia: eficiencia,
				nivel_prenchimento: nivelPreenchimentoResponse,
				eficacia: eficaciaResponse,
			},
		});
	}

	redirect = (url) => {
		url = `/hub/${this.state.companyId}/gestao${url === "" ? "" : "/" + url}`;
		return this.props.history.push(url);
	};

	renderTitleCard = (title) => {
		return (
			<Row className={"align-items-center"}>
				<Col>
					<p className="h5">{title}</p>
				</Col>
			</Row>
		);
	};

	renderChartCard = (resource, title) => {
		return (
			<Gauge
				id={`gauge-chart-diretrizes-` + resource}
				label={title}
				percentual={this.state.data[resource]}
			/>
		);
	};

	renderCardExecucaoEstrategias = () => {
		return (
			<Col xs="6" sm="5" md="4">
				<Card>
					<CardHeader>
						{this.renderTitleCard("Execução das Estratégias")}
					</CardHeader>
					<CardBody>
						{this.renderChartCard("eficiencia", "Execução das Estratégias")}
					</CardBody>
					<CardFooter>
						<Row>
							<Col>
								<Button
									block
									color="success"
									onClick={() =>
										this.redirect(`categoria/diretrizes/estrategias`)
									}
									className="btn mr-1 "
								>
									Planejamento
								</Button>
							</Col>
							<Col>
								<Button
									block
									color="success"
									onClick={() =>
										this.redirect(`categoria/diretrizes/eficiencia`)
									}
									className={"btn mr-1 "}
								>
									Status
								</Button>
							</Col>
						</Row>
					</CardFooter>
				</Card>
			</Col>
		);
	};

	renderCardEficacia = () => {
		return (
			<Col xs="6" sm="5" md="4">
				<Card>
					<CardHeader>
						{this.renderTitleCard("Eficácia das Estratégias")}
					</CardHeader>
					<CardBody>
						{this.renderChartCard("eficacia", "Eficácia das Estratégias")}
					</CardBody>
					<CardFooter>
						<Row className="d-flex justify-content-center">
							<Col>
								<Button
									block
									color="success"
									onClick={() =>
										this.redirect(`categoria/diretrizes/dashboard`)
									}
									className={"btn mr-1 "}
								>
									Dashboard
								</Button>
							</Col>
						</Row>
					</CardFooter>
				</Card>
			</Col>
		);
	};

	renderCardPreenchimento = () => {
		return (
			<Col xs="6" sm="5" md="4">
				<Card>
					<CardHeader>
						{this.renderTitleCard("Nível de Preenchimento")}
					</CardHeader>
					<CardBody>
						{this.renderChartCard(
							"nivel_prenchimento",
							"Eficácia das Estratégias"
						)}
					</CardBody>
					<CardFooter>
						<Row className="d-flex justify-content-center">
							<Col>
								<Button
									block
									color="success"
									onClick={() => this.redirect(`categoria/diretrizes/eficacia`)}
									className={"btn mr-1 "}
								>
									Atualizar Dados
								</Button>
							</Col>
						</Row>
					</CardFooter>
				</Card>
			</Col>
		);
	};

	loaded = () => {
		return (
			<div className="animated fadeIn">
				<Row>
					{this.renderCardExecucaoEstrategias()}
					{this.renderCardPreenchimento()}
					{this.renderCardEficacia()}
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

export default Diretrizes_Mapa;
