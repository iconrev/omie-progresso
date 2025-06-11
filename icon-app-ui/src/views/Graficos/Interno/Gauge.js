import { Component } from "react";
import GaugeChart from "react-gauge-chart";
import { toast } from "react-toastify";
import CompanyService from "../../../service/CompanyService";
import LoadingSpinner from "../../../components/LoadingSpinner";
import AmbienteInternoService from "../../../service/Diagnostico/AmbienteInterno";
import { Row, Col, Container } from "reactstrap";

const gauge_color = {
	colors: ["#EA4228", "#F5CD19", "#5BE12C"],
};

class Processos extends Component {
	constructor(props) {
		super(props);

		this.company = CompanyService.getDataCompany();

		this.state = {
			isLoading: true,
			isAuthorized: true,
			hasError: false,
			percentual: 0,
			ano: null,
		};
	}

	async componentDidMount() {
		await this.loadGraphData();
		this.setState({
			isLoading: false,
		});
	}

	async loadGraphData() {
		const response = await AmbienteInternoService.getGraficoResource(
			this.props.resource
		);

		const { status, avaliacao } = response;

		if (status !== "success") {
			if (status === "fatal_error") {
				this.setState({
					hasError: true,
				});
			}
			if (status === "unauthorized") {
				this.setState({
					isAuthorized: false,
				});
			}
			toast.error("Erro ao buscar dados de " + this.props.resource);
			return;
		}

		const ano = avaliacao[this.company.exercicioDefinido]["ano"];
		const percentual = avaliacao[this.company.exercicioDefinido]["percentual"];

		const calc = Math.floor(percentual).toFixed();

		this.setState({
			percentual: parseFloat(calc),
			ano: ano,
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

	render() {
		if (this.state.isLoading) return <LoadingSpinner position={"relative"} />;
		if (this.state.hasError) return this.renderErroInfo();
		if (!this.state.isAuthorized) return this.renderUnauthorized();

		return (
			<GaugeChart
				className="chart-wrapper"
				id={this.props.id}
				textColor="#212121"
				percent={this.state.percentual / 100}
				needleColor="#CDC9C9"
				needleBaseColor="#CDC9C9"
				colors={gauge_color.colors}
				style={{ width: "100%" }}
			/>
		);
	}
}

export default Processos;
