import { Component } from "react";
import LoadingSpinner from "../../../../components/LoadingSpinner";
import { toast } from "react-toastify";
import {
	Badge,
	Button,
	Card,
	CardBody,
	CardFooter,
	CardHeader,
	Col,
	Row,
} from "reactstrap";
import DragAndDropEstrategias from "../Components/DragAndDropEstrategias";
import CompanyService from "../../../../service/CompanyService";
import Metas from "../../../../service/Metas";

class MapaEstrategiasDefinicao extends Component {
	constructor(props) {
		super(props);

		this.company = CompanyService.getDataCompany();
		if (!this.company) return this.props.history.push("/");

		this.state = {
			isLoading: true,
			companyId: this.company.id,
			exercicio_definido: this.company.exercicioDefinido,
		};
	}

	async componentDidMount() {
		if (this.company.isPremium || this.company.isDemo) {
			await this.loadData();
			this.setState({
				isLoading: false,
			});
		} else {
			console.warn("Acesso negado");
			return this.props.history.push(
				`/hub/${this.company.id}/gestao/categoria/metas`
			);
		}
	}

	loadData = async () => {
		await Metas.getMapa("estrategias")
			.then(async (result) => {
				let { analise } = result;
				analise = analise[this.state.exercicio_definido];

				if (!analise) {
					this.props.history.push(
						`/hub/${this.state.companyId}/gestao/categoria/metas`
					);
				} else {
					await this.setState({
						mapa: analise,
					});
				}
			})
			.catch((err) => {
				console.error(err);
			});
	};

	getStrategies = (map) => {
		let strategies = [];

		for (let perspectiva in map) {
			// eslint-disable-next-line no-prototype-builtins
			if (map.hasOwnProperty(perspectiva)) {
				for (let categoria in map[perspectiva]) {
					// eslint-disable-next-line no-prototype-builtins
					if (map[perspectiva].hasOwnProperty(categoria)) {
						strategies = strategies.concat(
							map[perspectiva][categoria]["estrategias"]
						);
					}
				}
			}
		}

		return strategies;
	};

	goBack = (e) => {
		e.preventDefault();
		let id = this.state.companyId;
		this.props.history.push(`/hub/${id}/gestao/categoria/metas`);
	};

	handleSaveButton = async (e) => {
		e.preventDefault();

		const data = {
			mapa: this.state.mapa,
		};

		const response = await Metas.postMapa("estrategias", data);
		if (response.status === "success") {
			toast.success(response.message);
		} else {
			toast.error(response.message);
		}
	};

	updateMapa = async (data) => {
		await this.setState({
			mapa: data,
		});
	};

	renderCardBody = () => {
		let listStrategies = this.state.mapa;
		return (
			<CardBody>
				<DragAndDropEstrategias
					listStrategies={listStrategies}
					handleUpdate={this.updateMapa}
				/>
			</CardBody>
		);
	};

	renderCardFooter = () => {
		return (
			<CardFooter>
				<Button
					className="btn btn-sm btn-info mr-1 float-right"
					onClick={this.goBack}
				>
					<i className="fa fa-arrow-left" /> Voltar
				</Button>
				{this.company.isPremium && (
					<Button
						className="btn btn-sm btn-success mr-1 float-right"
						onClick={this.handleSaveButton}
					>
						<i className="fa fa-edit" /> Salvar
					</Button>
				)}
			</CardFooter>
		);
	};

	renderCardHeader = () => {
		return (
			<CardHeader className={"bg-secondary"}>
				<Row className={"align-items-center"}>
					<Col xs="12" md="6" lg="6" className={"text-left text-uppercase"}>
						<Badge className={"badge-secundary"}>
							<strong style={{ fontSize: 24 }}>Definição de Estratégias</strong>
						</Badge>
					</Col>
					<Col xs="12" md="6" lg="6" className={"text-right text-uppercase"}>
						<div className="card-header-actions">
							<i className="fa fa-list float-right" />
						</div>
					</Col>
				</Row>
			</CardHeader>
		);
	};

	loaded = () => {
		return (
			<div className="animated fadeIn">
				<Card className="card-accent-dark">
					{this.renderCardHeader()}
					{this.renderCardBody()}
					{this.renderCardFooter()}
				</Card>
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

export default MapaEstrategiasDefinicao;
