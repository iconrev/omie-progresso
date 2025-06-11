import { Component } from "react";
import { Button, Card, CardBody, CardHeader, Col, Row } from "reactstrap";
import LoadingSpinner from "../../../../components/LoadingSpinner";
import Gauge from "../../../Graficos/Metas/Gauge";
import CompanyService from "../../../../service/CompanyService";
import Diretrizes from "../../../../service/Diretrizes";

class Diretrizes_Eficacia extends Component {
	constructor(props) {
		super(props);

		this.company = CompanyService.getDataCompany();

		this.state = {
			isLoading: true,
			companyId: this.company.id,
			exercicio_definido: this.company.exercicioDefinido,
			data: {
				dre: 0,
				levantamento: 0,
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
		const { gauges } = await Diretrizes.getGraficosEficacia();

		const { dre, levantamento } = gauges[this.state.exercicio_definido];
		const dreResponse = dre;
		const levantamentoResponse = levantamento;

		await this.setState({
			data: {
				dre: dreResponse,
				levantamento: levantamentoResponse,
			},
		});
	}

	redirect = (url) => {
		url = `/hub/${this.state.companyId}/gestao/categoria/${url}`;
		this.props.history.push(url);
	};

	renderCard = (resource, title, dev = false) => {
		let btn;
		if (resource === "estrategia") {
			btn = "Execução das Estratégias";
		}

		if (dev) {
			btn = (
				<Button block color="info" className="btn btn-sm mr-1 float-right">
					Em desenvolvimento
				</Button>
			);
		} else {
			btn = (
				<Button
					block
					color="success"
					onClick={() => this.redirect(`diretrizes/eficacia/${resource}`)}
					className="btn btn-sm mr-1 float-right"
				>
					Detalhes
				</Button>
			);
		}

		return (
			<Col xs="6" sm="5" md="4">
				<Card>
					<CardHeader>
						{title}
						<div className="card-header-actions">{btn}</div>
					</CardHeader>
					<CardBody>
						<Gauge
							id={`gauge-chart-diretrizes-${resource}`}
							label={title}
							percentual={this.state.data[resource]}
						/>
					</CardBody>
				</Card>
			</Col>
		);
	};

	loaded = () => {
		return (
			<div className="animated fadeIn">
				<Row>
					<Col xs="12" sm="1" md="2" />
					{this.renderCard("dre", "Dados Financeiros - DRE Mensal")}
					{this.renderCard("levantamento", "Dados Operacionais")}
				</Row>
				<Row>
					<Col xs="12" sm="1" md="2" />
					<Col xs="6" sm="5" md="4" />
					<Col xs="6" sm="5" md="4">
						<Button
							className="btn btn-sm btn-info mr-1 float-right"
							onClick={() => this.redirect("diretrizes")}
						>
							<i className="fa fa-arrow-left" /> Voltar
						</Button>
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

export default Diretrizes_Eficacia;
