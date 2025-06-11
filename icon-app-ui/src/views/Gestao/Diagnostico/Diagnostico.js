import { Component } from "react";
import {
	Button,
	Card,
	CardBody,
	CardHeader,
	Col,
	Row,
	Label,
} from "reactstrap";
import GaugeChart from "react-gauge-chart";
import LoadingSpinner from "../../../components/LoadingSpinner";
import SwotAnalysis from "./Swot/SwotAnalysis";
import { toast } from "react-toastify";
import CompanyService from "../../../service/CompanyService";
import SobrevivenciaService from "../../../service/Diagnostico/Sobrevivencia/index";
import AmbienteExternoService from "../../../service/Diagnostico/AmbienteExterno";
import AmbienteInternoService from "../../../service/Diagnostico/AmbienteInterno";

const gauge_color = {
	colors: ["#EA4228", "#F5CD19", "#5BE12C"],
};

class Diagnostico_Mapa extends Component {
	constructor(props) {
		super(props);

		this.company = CompanyService.getDataCompany();
		if (!this.company) return this.props.history.push("/");

		this.toggleModalSwot = this.toggleModalSwot.bind(this);

		this.state = {
			isLoading: true,
			id: this.company.id,
			exercicio_definido: this.company.exercicioDefinido,
			percent_sobrevivencia: 0.0,
			percent_diagnostico_externo: 0.0,
			percent_diagnostico_interno: 0.0,
			texto_externo: "",
			texto_sobrevivencia: "",
			texto_interno: "",
			modalSwot: false,
			statusSwot: true,
		};
	}

	async componentDidMount() {
		await this.loadGraphData();
		this.setState({
			isLoading: false,
		});
	}

	async loadGraphData() {
		let percent_sobrevivencia = 0,
			texto_sobrevivencia = "";
		let percent_diagnostico_externo = 0,
			texto_externo = "";
		let percent_diagnostico_interno = 0,
			texto_interno = "";

		const promiseSobrevivencia = this.getSobrevivencia();
		const promiseExterno = this.getExterno();
		const promiseInterno = this.getInterno();

		await Promise.all([promiseSobrevivencia, promiseExterno, promiseInterno])
			.then(async (response) => {
				const [sobrevivencia, externo, interno] = response;

				percent_sobrevivencia = sobrevivencia.percent_sobrevivencia;
				texto_sobrevivencia = sobrevivencia.texto_sobrevivencia;
				percent_diagnostico_externo = externo.percent_diagnostico_externo;
				texto_externo = externo.texto_externo;
				percent_diagnostico_interno = interno.percent_diagnostico_interno;
				texto_interno = interno.texto_interno;
			})
			.catch((error) => {
				console.error(error);
				toast.error("Ocorreu um erro ao buscar os dados do diagnóstico.");
			});

		this.setState({
			percent_sobrevivencia: percent_sobrevivencia,
			texto_sobrevivencia: texto_sobrevivencia,
			percent_diagnostico_externo: percent_diagnostico_externo,
			texto_externo: texto_externo,
			percent_diagnostico_interno: percent_diagnostico_interno,
			texto_interno: texto_interno,
		});
	}

	getSobrevivencia = async () => {
		let percent_sobrevivencia = 0;
		let texto_sobrevivencia = "";

		await SobrevivenciaService.getGrafico()
			.then((response) => {
				const { avaliacao } = response.data;
				let avaliacaoYear = avaliacao[this.state.exercicio_definido];

				percent_sobrevivencia = avaliacaoYear.percentual;
				texto_sobrevivencia = avaliacaoYear.texto;
			})
			.catch((err) => {
				console.error(err);
				toast.error("Não foi possível buscar os dados de Sobrevivência");
			});

		return {
			percent_sobrevivencia: percent_sobrevivencia,
			texto_sobrevivencia: texto_sobrevivencia,
		};
	};

	getExterno = async () => {
		let percent_diagnostico_externo = 0;
		let texto_externo = "";

		await AmbienteExternoService.getGrafico()
			.then((response) => {
				const { avaliacao } = response.data;
				let avaliacaoYear = avaliacao[this.state.exercicio_definido];

				percent_diagnostico_externo =
					parseFloat((avaliacaoYear.percentual * 100).toFixed(0)) / 100;
				texto_externo = avaliacaoYear.texto;
			})
			.catch((err) => {
				console.error(err);
				toast.error("Não foi possível buscar os dados do Ambiente Externo");
			});

		return {
			percent_diagnostico_externo: percent_diagnostico_externo,
			texto_externo: texto_externo,
		};
	};

	getInterno = async () => {
		let percent_diagnostico_interno = 0;
		let texto_interno = "";

		await AmbienteInternoService.getGrafico()
			.then((response) => {
				const { avaliacao } = response;
				let avaliacaoYear = avaliacao[this.state.exercicio_definido];

				percent_diagnostico_interno = avaliacaoYear.percentual;
				texto_interno = avaliacaoYear.texto;
			})
			.catch((err) => {
				console.error(err);
				toast.error("Não foi possível buscar os dados do Ambiente Interno");
			});

		return {
			percent_diagnostico_interno: percent_diagnostico_interno,
			texto_interno: texto_interno,
		};
	};

	handleAmbienteExternoClick = (e) => {
		e.preventDefault();
		this.props.history.push(
			`/hub/${this.state.id}/gestao/categoria/diagnostico/externo`
		);
	};

	handleSobrevivenciaClick = (e) => {
		e.preventDefault();
		this.props.history.push(
			`/hub/${this.state.id}/gestao/categoria/diagnostico/sobrevivencia`
		);
	};

	handleAmbienteInternoClick = (e) => {
		e.preventDefault();
		this.props.history.push(
			`/hub/${this.state.id}/gestao/categoria/diagnostico/interno`
		);
	};

	toggleModalSwot() {
		this.setState({
			modalSwot: !this.state.modalSwot,
		});
	}

	updateStatusSwot = async () => {
		this.setState({
			statusSwot: !this.state.statusSwot,
		});

		if (!this.state.statusSwot) {
			toast.error("Ocorreu um problema ao carregar o SWOT :(");
			await this.updateStatusSwot();
		}
	};

	modalSwot = () => {
		if (!this.state.modalSwot) return null;

		return (
			<SwotAnalysis
				toggle={this.toggleModalSwot}
				isOpen={this.state.modalSwot}
				idCompany={this.state.id}
				updateStatus={this.updateStatusSwot}
				quantidadeItens={10}
			/>
		);
	};

	btnSwotClick = async (e) => {
		e.preventDefault();
		this.toggleModalSwot();
	};

	btnSwot = () => {
		return (
			<Row className={"justify-content-center mt-3 mb-3"}>
				<Col xs="8" sm={"6"} md={"5"} lg={"4"}>
					<Button
						size="lg"
						className={"btn-pill"}
						block={true}
						onClick={this.btnSwotClick}
					>
						SWOT
					</Button>
				</Col>
			</Row>
		);
	};

	renderChart = (title, detalhes, data, texto, key) => {
		return (
			<Col xs="12" sm={"6"} md={"6"} lg={"4"} className={"p-2"}>
				<div>
					<Card className={"h-100"}>
						<CardHeader>
							<Row className={"align-items-center"}>
								<Col>{title}</Col>
								<Col>
									<div className="card-header-actions">
										<Button
											block
											color="success"
											onClick={detalhes}
											className="btn btn-sm mr-1 float-right"
										>
											Detalhes
										</Button>
									</div>
								</Col>
							</Row>
						</CardHeader>
						<CardBody className={""}>
							<GaugeChart
								className="chart-wrapper"
								id={"gauge-chart" + key}
								textColor="#212121"
								needleColor="#CDC9C9"
								needleBaseColor="#CDC9C9"
								percent={data}
								colors={gauge_color.colors}
							/>
							<blockquote className={"p-0 m-0"}>
								<Label
									style={{
										fontSize: 14,
										fontFamily: "Arial",
										fontStyle: "italic",
									}}
								>
									{texto}
								</Label>
							</blockquote>
						</CardBody>
					</Card>
				</div>
			</Col>
		);
	};

	loaded = () => {
		return (
			<div className="animated fadeIn">
				<Row>
					{this.renderChart(
						"Sobrevivência",
						this.handleSobrevivenciaClick,
						this.state.percent_sobrevivencia,
						this.state.texto_sobrevivencia,
						1
					)}
					{this.renderChart(
						"Ambiente Externo",
						this.handleAmbienteExternoClick,
						this.state.percent_diagnostico_externo,
						this.state.texto_externo,
						2
					)}
					{this.renderChart(
						"Ambiente Interno",
						this.handleAmbienteInternoClick,
						this.state.percent_diagnostico_interno,
						this.state.texto_interno,
						3
					)}
				</Row>
				{this.btnSwot()}
				{this.modalSwot()}
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

export default Diagnostico_Mapa;
