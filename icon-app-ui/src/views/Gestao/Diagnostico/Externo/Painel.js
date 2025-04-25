import { Component } from "react";
import { Card, CardBody, CardHeader, Button, Row, Col } from "reactstrap";
import Graph from "../../../Graficos/Externo/Avaliacao2";
import LoadingSpinner from "../../../../components/LoadingSpinner";
import CompanyService from "../../../../service/CompanyService";

class Grafico_Externo extends Component {
	constructor(props) {
		super(props);

		this.company = CompanyService.getDataCompany();

		this.state = {
			isLoading: true,
			companyId: this.company.id,
			exercicio_definido: this.company.exercicioDefinido,
		};
	}

	async componentDidMount() {
		this.setState({
			isLoading: false,
		});
	}

	handleButtonEnter = (e, resource) => {
		e.preventDefault();
		this.props.history.push(
			`/hub/${this.company.id}/gestao/categoria/diagnostico/externo/${resource}`
		);
	};

	renderChart = (title, resource, labels = []) => {
		return (
			<Col xs="12" sm="9" md="6" lg="5" xl="3">
				<Card>
					<CardHeader>
						<Row className={"align-items-center"}>
							<Col>{title}</Col>
							<Col>
								<div className="card-header-actions">
									<Button
										block
										color="success"
										onClick={(e) => this.handleButtonEnter(e, resource)}
										className="btn btn-sm  mr-1 float-right"
									>
										Detalhes
									</Button>
								</div>
							</Col>
						</Row>
					</CardHeader>
					<CardBody>
						<div className="chart-wrapper">
							<Graph
								{...this.props}
								onClick={(e) => this.handleButtonEnter(e, resource)}
								data={resource}
								labels={labels}
							/>
						</div>
					</CardBody>
				</Card>
			</Col>
		);
	};

	loaded = () => {
		return (
			<div className="animated fadeIn">
				<Row className={"justify-content-center"}>
					{this.renderChart("Concorrentes", "concorrentes", [
						"Preço",
						"Qualidade",
						"Entrega",
						"Inovação",
						"Portifolio",
					])}
					{this.renderChart("Clientes", "clientes", [
						"Preço",
						"Qualidade",
						"Entrega",
						"Inovação",
						"Portifolio",
					])}
					{this.renderChart("Fornecedores", "fornecedores", [
						"Preço",
						"Qualidade",
						"Entrega",
						"Inovação",
						"Portifolio",
					])}
					{this.renderChart("Macro Ambiente", "macro")}
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

export default Grafico_Externo;
