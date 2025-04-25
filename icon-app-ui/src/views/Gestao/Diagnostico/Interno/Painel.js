import { Component } from "react";
import { Card, CardBody, CardHeader, Button, Row, Col } from "reactstrap";
import Gauge from "../../../Graficos/Interno/Gauge";
import LoadingSpinner from "../../../../components/LoadingSpinner";
import CompanyService from "../../../../service/CompanyService";

class Swot_Interno extends Component {
	constructor(props) {
		super(props);

		this.company = CompanyService.getDataCompany();

		this.state = {
			isLoading: true,
		};
	}

	async componentDidMount() {
		this.setState({
			isLoading: false,
		});
	}

	handleButtonEnter = (e, resource, subresource = null) => {
		e.preventDefault();

		if (subresource) {
			this.props.history.push(
				`/hub/${this.company.id}/gestao/categoria/diagnostico/interno/${resource}/${subresource}`
			);
		} else {
			this.props.history.push(
				`/hub/${this.company.id}/gestao/categoria/diagnostico/interno/${resource}`
			);
		}
	};

	renderChart = (title, resource, index) => {
		return (
			<Col xs="12" sm="6" md={"6"} lg="4" xl={"3"}>
				<Card>
					<CardHeader>
						{title}
						<div className="card-header-actions">
							<Button
								block
								color="success"
								onClick={(e) => this.handleButtonEnter(e, resource)}
								className="btn btn-sm mr-1 float-right"
							>
								Detalhes
							</Button>
						</div>
					</CardHeader>
					<CardBody>
						<Gauge id={"gauge-chart" + index} resource={resource} />
					</CardBody>
				</Card>
			</Col>
		);
	};

	loaded() {
		return (
			<div className="animated fadeIn">
				<Row>
					{this.renderChart("Financeiro", "financeiro", 1)}
					{this.renderChart("Comercial", "comercial", 2)}
					{this.renderChart("Processos", "processos", 3)}
					{this.renderChart("Pessoas", "pessoas", 4)}
				</Row>
			</div>
		);
	}

	render() {
		return this.state.isLoading ? <LoadingSpinner /> : this.loaded();
	}
}

export default Swot_Interno;
