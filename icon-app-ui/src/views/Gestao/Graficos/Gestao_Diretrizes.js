import { Component } from "react";
import { Bar } from "react-chartjs-2";
import { Badge, Button, Row, Col, Spinner, Container } from "reactstrap";
import Generic from "../../Utils/Generic";
import LoadingSpinner from "../../../components/LoadingSpinner";
import MessageUpgrade from "../../../components/MessageUpgrade";
import CompanyService from "../../../service/CompanyService";
import Diretrizes from "../../../service/Diretrizes";

const formatDataChart = (tooltipItem, data) => {
	let value =
		data.datasets[tooltipItem.datasetIndex].data[tooltipItem.index] || 0.0;
	value = Generic.formatNumber(value, 2);
	return " " + value + "%";
};

const options = {
	legend: {
		display: false,
	},
	tooltips: {
		callbacks: {
			label: (tooltipItem, data) => formatDataChart(tooltipItem, data),
		},
	},
	// maintainAspectRatio: false,
	scales: {
		yAxes: [
			{
				ticks: {
					beginAtZero: true,
					max: 100,
				},
			},
		],
	},
};

class Grafico_Diretrizes extends Component {
	constructor(props) {
		super(props);

		this.company = CompanyService.getDataCompany();

		this.state = {
			isLoading: true,
			companyId: this.company.id,
			exercicio_definido: this.company.exercicioDefinido,
			error: false,
			isAuthorized: false,
		};
	}

	async componentDidMount() {
		if (!this.state.companyId) {
			this.setState({
				error: true,
			});
			console.error("Não foi possível encontrar a empresa");
		} else {
			const company = this.company;
			const hasPermission = company.permissions.includes("acesso_diretrizes");
			if (
				((company.isTrial || company.isPremium) && hasPermission) ||
				((company.isTrial || company.isPremium) && this.company.isHelp) ||
				company.isDemo
			) {
				await this.loadData();
			}
		}
		this.setState({
			isLoading: false,
		});
	}

	loadData = async () => {
		await Diretrizes.getGestaoGrafico()
			.then(async (result) => {
				let { status, analise } = result;

				if (status !== "success") {
					return this.setState({
						error: true,
					});
				}

				analise = analise[this.state.exercicio_definido];

				const dataset = [
					analise.on_time_tasks_percentage,
					analise.nivel_prenchimento,
					analise.eficacia,
				];

				let media = 0;
				media =
					analise.on_time_tasks_percentage +
					analise.nivel_prenchimento +
					analise.eficacia;
				media = media / 3;

				const data = [
					{
						data: dataset,
						borderWidth: 1,
						backgroundColor: ["#FF6384", "#36A2EB", "#FFCE56"],
						hoverBackgroundColor: ["#FF6384", "#36A2EB", "#FFCE56"],
					},
				];

				this.setState({
					datasets: data,
					labels: [
						"Execução das Estratégias",
						"Nível de Preenchimento",
						"Eficácia das Estratégias",
					],
					media: media,
					isAuthorized: true,
				});
			})
			.catch(async (error) => {
				console.error("Não foi possível encontrar os gráficos:", error);
				if (error.response) {
					if (error.response.status === 401) {
						return this.setState({
							isAuthorized: false,
						});
					}
				}
				this.setState({
					error: true,
				});
			});
	};

	renderChart = () => {
		return (
			<div className="">
				<Row>
					<Col>
						<Bar data={this.state} options={options} />
					</Col>
				</Row>
				<Row className={"mt-2"}>
					<Col>
						<Button
							color="primary"
							outline
							onClick={this.props.onClick}
							className="float-right"
						>
							<strong>Nível de Gestão</strong>{" "}
							<Badge color="secondary" pill style={{ position: "static" }}>
								{Generic.formatNumber(this.state.media)}%
							</Badge>
						</Button>
					</Col>
				</Row>
			</div>
		);
	};

	renderUpgradeInfo = () => {
		return (
			<Row className={"align-items-center h-100"}>
				<Col>
					<MessageUpgrade modalAtivarTrial={this.props.modalAtivarTrial} />
				</Col>
			</Row>
		);
	};

	renderErroInfo = () => {
		return (
			<Row className={"align-items-center h-100"}>
				<Col>
					<Container>
						<Row className={"align-items-center"}>
							<Col xs={12} sm={12} md={4} lg={3} className={"text-center"}>
								<i className="fa fa-exclamation-triangle fa-5x text-danger" />
							</Col>
							<Col xs={12} sm={12} md={8} lg={9} className={""}>
								<div className="lead">
									<h3>Erro</h3>
									<p>Desculpe mas não foi possível carregar o gráfico :(</p>
								</div>
							</Col>
						</Row>
					</Container>
				</Col>
			</Row>
		);
	};

	renderUnauthorized = () => {
		return (
			<Row className={"align-items-center h-100"}>
				<Col>
					<Container className={"h-100"}>
						<Row className={"align-items-center h-100"}>
							<Col sm={4} md={4} lg={3} className={"text-center"}>
								<i className="fa fa-exclamation-triangle fa-5x" />
							</Col>
							<Col sm={8} md={8} lg={9} className={""}>
								<div className="lead">
									<br />
									<h3>Acesso Restrito</h3>
									<p>
										Desculpe, mas esse módulo não está liberado para seu perfil
										:(
									</p>
									<br />
								</div>
							</Col>
						</Row>
					</Container>
				</Col>
			</Row>
		);
	};

	renderDesenvolvimento = () => {
		return (
			<Container>
				<Row className={"align-items-center"}>
					<Col sm={3} md={3} lg={2} className={"text-center"}>
						<Spinner size="lg" color="primary" />
					</Col>
					<Col sm={9} md={9} lg={10}>
						<div className="lead">
							<br />
							<p>
								<h3>
									<span className="align-middle">EM DESENVOLVIMENTO</span>
								</h3>
							</p>
							<p>Em breve novas informações.</p>
							<br />
						</div>
					</Col>
				</Row>
			</Container>
		);
	};

	loaded() {
		if (!this.company.isPremium && !this.company.isDemo) {
			return this.renderUpgradeInfo();
		}

		if (this.state.error) {
			return this.renderErroInfo();
		}

		if (!this.state.isAuthorized) {
			return this.renderUnauthorized();
		}

		return this.renderChart();
	}

	render() {
		return this.state.isLoading ? (
			<LoadingSpinner position={"relative"} />
		) : (
			this.loaded()
		);
	}
}

export default Grafico_Diretrizes;
