import { Component } from "react";
import { Card, CardBody, CardHeader, Button, Row, Col } from "reactstrap";
import Gauge from "../../Graficos/Metas/Gauge";
import LoadingSpinner from "../../../components/LoadingSpinner";
import MapaObjetivoMetas from "./Mapa/MapaObjetivoMetas";
import { toast } from "react-toastify";
import MessageUpgrade from "../../../components/MessageUpgrade";
import CompanyService from "../../../service/CompanyService";
import Metas from "../../../service/Metas";

class Categoria extends Component {
	constructor(props) {
		super(props);

		this.company = CompanyService.getDataCompany();
		if (!this.company) return this.props.history.push("/");

		this.state = {
			isLoading: true,
			companyId: this.company.id,
			exercicio_definido: this.company.exercicioDefinido,
			modalMetas: false,
			perspectivas: [
				{
					title: "Financeiro",
					recurso: "financeiro",
					percentual: 0,
				},
				{
					title: "Comercial",
					recurso: "comercial",
					percentual: 0.0,
				},
				{
					title: "Processos",
					recurso: "processos",
					percentual: 0.0,
				},
				{
					title: "Pessoas",
					recurso: "pessoas",
					percentual: 0.0,
				},
			],
			enableEstrategias: false,
		};
	}

	async componentDidMount() {
		await this.loadData();
		this.setState({
			isLoading: false,
		});
	}

	loadData = async () => {
		await Metas.getGestaoGrafico()
			.then(async (result) => {
				let { analise } = result;
				analise = analise[this.state.exercicio_definido];

				const { perspectivas, total } = analise;
				if (perspectivas.length > 0) {
					this.setState({
						perspectivas: perspectivas,
						enableEstrategias:
							total === 100 && (this.company.isPremium || this.company.isDemo),
					});
				}
			})
			.catch((err) => {
				console.error("Não foi possível encontrar os gráficos:", err);
			});
	};

	handleButtonEnter = (e, perspectiva, categoria) => {
		e.preventDefault();
		let url = `/hub/${this.state.companyId}/gestao/categoria/metas/${perspectiva}`;

		if (categoria) {
			url += `/${categoria}`;
		}

		this.props.history.push(url);
	};

	toggleModal = async (e, modalName, status = "success") => {
		if (status === "success") {
			e.preventDefault();
			await this.setState({
				[modalName]: !this.state[modalName],
			});
		} else {
			toast.error(status);
			await this.setState({
				[modalName]: !this.state[modalName],
			});
		}
	};

	renderCardPerspectiva = (resource, premium = false) => {
		let card = null;
		let dadosPerspectivas = this.state.perspectivas;
		let dados = dadosPerspectivas.find(
			(element) => element.recurso === resource
		);

		let btn = null;
		let body = null;
		if (this.company.isPremium || this.company.isDemo || !premium) {
			btn = (
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
			);
			body = (
				<div className="chart-wrapper">
					<Gauge
						id={`gauge-chart-${dados.recurso}`}
						resource={dados.recurso}
						label={dados.title}
						percentual={dados.percentual}
					/>
				</div>
			);
		} else {
			body = <MessageUpgrade modalAtivarTrial={this.props.modalAtivarTrial} />;
		}

		if (dados) {
			card = (
				<Col xs="12" sm={"6"} md={"6"} lg={"4"} xl={"3"} className={"p-2"}>
					<Card className={"h-100"}>
						<CardHeader>
							<Row className={"align-items-center"}>
								<Col>{dados.title}</Col>
								<Col>{btn}</Col>
							</Row>
						</CardHeader>
						<CardBody>
							<Row className={"align-items-center h-100"}>
								<Col>{body}</Col>
							</Row>
						</CardBody>
					</Card>
				</Col>
			);
		}

		return card;
	};

	renderModalMetas = () => {
		if (!this.state.modalMetas) return null;

		return (
			<MapaObjetivoMetas
				toggle={this.toggleModal}
				isOpen={this.state.modalMetas}
				companyId={this.state.companyId}
				tabMetas={this.state.enableEstrategias}
				redirect={this.handleButtonEnter}
			/>
		);
	};

	loaded = () => {
		const hasPermissionMapa =
			this.company.isPremium || this.company.isTrial || this.company.isDemo;

		return (
			<div className="animated fadeIn">
				<Row>
					{this.renderCardPerspectiva("financeiro")}
					{this.renderCardPerspectiva("comercial", true)}
					{this.renderCardPerspectiva("processos", true)}
					{this.renderCardPerspectiva("pessoas", true)}
				</Row>
				<Row className={"justify-content-center mt-3"}>
					<Col xs="4">
						{hasPermissionMapa && (
							<Button
								size="lg"
								className={"btn-pill"}
								block={true}
								onClick={(e) => this.toggleModal(e, "modalMetas")}
							>
								Mapa Estratégico
							</Button>
						)}
						{this.state.enableEstrategias && (
							<Button
								size="lg"
								className={"btn-pill"}
								block={true}
								onClick={(e) => {
									e.preventDefault();
									let url = `/hub/${this.state.companyId}/gestao/categoria/metas/estrategias`;
									this.props.history.push(url);
								}}
							>
								Priorização de Estratégias
							</Button>
						)}
					</Col>
				</Row>
				{this.renderModalMetas()}
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

export default Categoria;
