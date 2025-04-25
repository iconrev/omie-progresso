import { Component } from "react";
import { Bar } from "react-chartjs-2";
import { Badge, Button, Row, Col, Container } from "reactstrap";
import Generic from "../../Utils/Generic";
import LoadingSpinner from "../../../components/LoadingSpinner";
import CompanyService from "../../../service/CompanyService";
import Diagnostico from "../../../service/Diagnostico";

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

class Grafico_Diagnostico extends Component {
	constructor(props) {
		super(props);

		this.company = CompanyService.getDataCompany();

		this.state = {
			isLoading: true,
			companyId: this.company.id,
			exercicio_definido: this.company.exercicioDefinido,
			error: false,
			isAuthorized: false,
			labels: ["Sobrevivência", "Diagnóstico Externo", "Diagnóstico Interno"],
			media: 0,
		};
	}

	async componentDidMount() {
		if (!this.state.companyId) {
			this.setState({
				error: true,
			});
			console.error("Não foi possível encontrar a empresa");
		} else {
			if (
				this.company.isDemo ||
				this.company.isHelp ||
				this.company.permissions.includes("acesso_diagnostico")
			) {
				await this.loadData();
			}
		}

		this.setState({
			isLoading: false,
		});
	}

	async loadData() {
		await Diagnostico.getGestaoGrafico()
			.then((response) => {
				let { status, sobrevivencia, ambiente_externo, ambiente_interno } =
					response;

				if (status !== "success") {
					return this.setState({
						error: true,
					});
				}

				sobrevivencia = sobrevivencia[this.state.exercicio_definido] || false;
				ambiente_externo =
					ambiente_externo[this.state.exercicio_definido] || false;
				ambiente_interno =
					ambiente_interno[this.state.exercicio_definido] || false;

				sobrevivencia = sobrevivencia ? sobrevivencia["percentual"] : 0;
				ambiente_externo = ambiente_externo
					? ambiente_externo["percentual"]
					: 0;
				ambiente_interno = ambiente_interno
					? ambiente_interno["percentual"]
					: 0;

				const data = [];
				let media = sobrevivencia + ambiente_externo + ambiente_interno;

				data.push({
					data: [
						sobrevivencia * 100,
						ambiente_externo * 100,
						ambiente_interno * 100,
					],
					borderWidth: 1,
					backgroundColor: ["#FF6384", "#36A2EB", "#FFCE56"],
					hoverBackgroundColor: ["#FF6384", "#36A2EB", "#FFCE56"],
				});
				this.setState({
					datasets: data,
					media: (media / 3) * 100,
					isAuthorized: true,
				});
			})
			.catch((error) => {
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
	}

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

	loaded = () => {
		if (this.state.error) return this.renderErroInfo();
		if (!this.state.isAuthorized) return this.renderUnauthorized();

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
							<strong>Competitividade</strong>{" "}
							<Badge color="secondary" pill style={{ position: "static" }}>
								{Generic.formatNumber(this.state.media)}%
							</Badge>
						</Button>
					</Col>
				</Row>
			</div>
		);
	};

	render() {
		return this.state.isLoading ? (
			<LoadingSpinner position={"relative"} />
		) : (
			this.loaded()
		);
	}
}

export default Grafico_Diagnostico;
