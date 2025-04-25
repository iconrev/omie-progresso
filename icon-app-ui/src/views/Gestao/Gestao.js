import React, { Component } from "react";
import { Button, Card, CardBody, CardHeader, Col, Row } from "reactstrap";
import Grafico_Diagnostico from "./Graficos/Gestao_Diagnostico";
import Grafico_Metas from "./Graficos/Gestao_Metas";
import Grafico_Diretrizes from "./Graficos/Gestao_Diretrizes";
import LoadingSpinner from "../../components/LoadingSpinner";
import ModalPermissions from "./ModalPermissions";
import CompanyService from "../../service/CompanyService";

class Diagnostico extends Component {
	constructor(props) {
		super(props);

		this.company = CompanyService.getDataCompany();
		console.info(this.company);
		if (!this.company) return this.props.history.push("/");

		this.state = {
			isLoading: true,
			id: this.company.id,
			modalPermissions: false,
			modalExercicio: false,
		};
	}

	componentDidMount() {
		this.setState({
			isLoading: false,
		});
	}

	handleButtonEnter = (e, resource) => {
		e.preventDefault();
		this.props.setCog(false);
		resource = resource.replace("acesso_", "");
		this.props.history.push(
			`/hub/${this.state.id}/gestao/categoria/${resource}`
		);
	};

	renderCardModule = (
		chart,
		title,
		module,
		permissions,
		needPremium = false
	) => {
		const graph = React.createElement(chart, {
			onClick: (e) => this.handleButtonEnter(e, module),
			modalAtivarTrial: this.props.modalAtivarTrial,
		});

		let btnDetalhes = null;
		if (permissions) {
			const isDemo = this.company.isDemo;
			const isHelp = this.company.isHelp;
			if (isDemo || isHelp || permissions.indexOf(module) > -1) {
				const isPremium = this.company.isPremium;
				if (isDemo || (needPremium && isPremium) || !needPremium) {
					btnDetalhes = (
						<div className="card-header-actions">
							<Button
								block
								color="success"
								onClick={(e) => this.handleButtonEnter(e, module)}
								className="btn btn-sm mr-1 float-right"
							>
								Detalhes
							</Button>
						</div>
					);
				}
			}
		}

		return (
			<Col xs={12} sm={6} md={6} lg={6} xl={4} className={""}>
				<div className={"p-2 h-100"}>
					<Card className="card-dashboard h-100 m-0">
						<CardHeader className={"align-middle"}>
							<Row className={"align-items-center"}>
								<Col>{title}</Col>
								<Col>{btnDetalhes}</Col>
							</Row>
						</CardHeader>
						<CardBody>{graph}</CardBody>
					</Card>
				</div>
			</Col>
		);
	};

	loaded = () => {
		const permissions = this.company.permissions;

		return (
			<div className="animated fadeIn">
				<Row className={"justify-content-center pb-3"}>
					{this.renderCardModule(
						Grafico_Diagnostico,
						"Diagnóstico",
						"acesso_diagnostico",
						permissions
					)}
					{this.renderCardModule(
						Grafico_Metas,
						"Estratégia e Metas",
						"acesso_metas",
						permissions
					)}
					{this.renderCardModule(
						Grafico_Diretrizes,
						"Gestão por Diretriz / OKR",
						"acesso_diretrizes",
						permissions,
						true
					)}
					<ModalPermissions
						isOpen={this.state.modalPermissions}
						{...this.props}
					/>
				</Row>
			</div>
		);
	};

	render() {
		return this.state && this.state.isLoading ? (
			<LoadingSpinner isLoading={this.state.isLoading} />
		) : (
			this.loaded()
		);
	}
}

export default Diagnostico;
