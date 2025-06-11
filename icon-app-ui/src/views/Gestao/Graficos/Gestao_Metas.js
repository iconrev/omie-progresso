import { Component } from "react";
import { Bar } from "react-chartjs-2";
import { Badge, Button, Row, Col, Container } from "reactstrap";
import Generic from "../../Utils/Generic";
import LoadingSpinner from "../../../components/LoadingSpinner";
import CompanyService from "../../../service/CompanyService";
import Metas from "../../../service/Metas";

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

class Gestao_Metas extends Component {
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
		if (
			this.company.isDemo ||
			this.company.isHelp ||
			this.company.permissions.includes("acesso_metas")
		) {
			await this.loadData();
		}
		this.setState({
			isLoading: false,
		});
	}

	loadData = async () => {
		await Metas.getGestaoGrafico()
			.then(async (result) => {
				let { status, analise } = result;

				if (status !== "success") {
					return this.setState({
						error: true,
					});
				}

				analise = analise[this.state.exercicio_definido];

				if (analise.status !== "success") {
					return this.setState({
						error: true,
					});
				}

				const { perspectivas } = analise;
				const labels = [];
				const dataset = [];
				let media = 0;

				if (perspectivas.length > 0) {
					for (let i = 0; i < perspectivas.length; i++) {
						let perspectiva = perspectivas[i];
						let value = perspectiva.percentual;
						let label = perspectiva.title;
						dataset.push(value);
						labels.push(label);
						media += value;
					}
					media = media / perspectivas.length;
				}

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
					labels: labels,
					media: media,
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
							<strong>Definição de Metas</strong>{" "}
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

export default Gestao_Metas;
