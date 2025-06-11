import { Component } from "react";
import { Card, CardBody, CardHeader, Col, Row, Button } from "reactstrap";
import CompanyService from "../../service/CompanyService";

class Hub extends Component {
	state = {
		id: CompanyService.getCurrentCompanyId(),
	};

	componentDidMount() {
		// pass
	}

	handleButtonEnter = (e) => {
		e.preventDefault();
		this.props.history.push(`/hub/${this.state.id}/gestao`);
	};
	render() {
		return (
			<div className="animated fadeIn">
				<Row>
					<Col xs="6">
						<Card>
							<CardHeader>
								Gestão
								<div className="card-header-actions">
									<Button
										block
										color="light"
										onClick={this.handleButtonEnter}
										className="btn btn-sm btn-info mr-1 float-right"
									>
										Detalhes
									</Button>
								</div>
							</CardHeader>
							<CardBody>
								<div className="chart-wrapper" />
							</CardBody>
						</Card>
					</Col>
					<Col xs="6">
						<Card>
							<CardHeader>
								Desempenho
								<div className="card-header-actions">
									<a href="#/" className="card-header-action">
										<small className="text-muted">Detalhes</small>
									</a>
								</div>
							</CardHeader>
							<CardBody>
								<div className="chart-wrapper" />
							</CardBody>
						</Card>
					</Col>
				</Row>
			</div>
		);
	}
}

export default Hub;
