import { Component } from "react";
import {
	Button,
	Modal,
	ModalBody,
	ModalFooter,
	ModalHeader,
	Card,
	CardTitle,
	CardText,
	Row,
	Col,
	TabContent,
	TabPane,
	Nav,
	NavItem,
	NavLink,
	Container,
} from "reactstrap";
import "../../../../assets/swotstyle.css";
import "../../../../assets/objectivesstyle.css";
import "../../../../assets/mapstyle.css";
import LoadingSpinner from "../../../../components/LoadingSpinner";
import classnames from "classnames";
import CompanyService from "../../../../service/CompanyService";
import Metas from "../../../../service/Metas";

class MapaObjetivoMetas extends Component {
	constructor(props) {
		super(props);

		this.company = CompanyService.getDataCompany();

		this.state = {
			isLoading: true,
			companyId: this.company.id,
			exercicio_definido: this.company.exercicioDefinido,
			activeTab: "objetivos",
			mapaObjetivos: {},
			mapaEstrategias: {},
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
		const states = {};
		const promises = [];
		promises.push(
			Metas.getMapa("objetivos")
				.then(async (result) => {
					const { analise } = result;
					states.mapaObjetivos = analise[this.state.exercicio_definido];
				})
				.catch((err) => {
					console.error(err);
				})
		);

		if (this.props.tabMetas === true) {
			promises.push(
				Metas.getMapa("estrategias").then(async (result) => {
					const analiseEstrategias = result.analise;
					states.mapaEstrategias =
						analiseEstrategias[this.state.exercicio_definido];
				})
			);
		}

		await Promise.all(promises);

		this.setState(states);
	};

	toggleModal = (e) => {
		this.props.toggle(e, "modalMetas");
	};

	toggleTab = async (e, page) => {
		e.preventDefault();

		if (this.state.activeTab !== page) {
			await this.setState({
				activeTab: page,
			});
		}
	};

	getInfoCard = (perspectiva, categoria) => {
		const infos = {
			Financeiro: {
				receitas: {
					perspectiva: "Financeiro",
					categoria: "Faturamento",
					field: "receitas",
					color: "blue",
					icon: "fa fa-usd",
				},
				rentabilidade: {
					perspectiva: "Financeiro",
					categoria: "Rentabilidade",
					field: "rentabilidade",
					color: "green",
					icon: "fa fa-line-chart",
				},
				custos: {
					perspectiva: "Financeiro",
					categoria: "Custos",
					field: "custos",
					color: "purple",
					icon: "fa fa-exclamation",
				},
				endividamento: {
					perspectiva: "Financeiro",
					categoria: "Endividamento",
					field: "endividamento",
					color: "red",
					icon: "fa fa-ambulance",
				},
			},
			Comercial: {
				marketing: {
					perspectiva: "Comercial",
					categoria: "Marketing",
					field: "marketing",
					color: "blue",
					icon: "fa fa-rss",
				},
				vendas: {
					perspectiva: "Comercial",
					categoria: "Vendas",
					field: "vendas",
					color: "green",
					icon: "fa fa-credit-card",
				},
				relacionamento: {
					perspectiva: "Comercial",
					categoria: "Relacionamento",
					field: "relacionamento",
					color: "purple",
					icon: "fa fa-handshake-o",
				},
				satisfacao: {
					perspectiva: "Comercial",
					categoria: "Satisfação",
					field: "satisfacao",
					color: "red",
					icon: "fa fa-smile-o",
				},
			},
			Processos: {
				produtividade: {
					perspectiva: "Processos",
					categoria: "Produtividade",
					field: "produtividade",
					color: "blue",
					icon: "fa fa-rocket",
				},
				qualidade: {
					perspectiva: "Processos",
					categoria: "Qualidade",
					field: "qualidade",
					color: "green",
					icon: "fa fa-check-square-o",
				},
				eficiencia: {
					perspectiva: "Processos",
					categoria: "Eficiência",
					field: "eficiencia",
					color: "purple",
					icon: "fa fa-pie-chart",
				},
				logistica: {
					perspectiva: "Processos",
					categoria: "Logística",
					field: "logistica",
					color: "red",
					icon: "fa fa-truck",
				},
			},
			Pessoas: {
				competencias: {
					perspectiva: "Pessoas",
					categoria: "Competências",
					field: "competencias",
					color: "blue",
					icon: "fa fa-list-ol",
				},
				engajamento: {
					perspectiva: "Pessoas",
					categoria: "Engajamento",
					field: "engajamento",
					color: "green",
					icon: "fa fa-cloud-upload",
				},
				retencao: {
					perspectiva: "Pessoas",
					categoria: "Retenção",
					field: "retencao",
					color: "purple",
					icon: "fa fa-diamond",
				},
				inovacao: {
					perspectiva: "Pessoas",
					categoria: "Inovação",
					field: "inovacao",
					color: "red",
					icon: "fa fa-creative-commons",
				},
			},
		};

		// const objetivo = this.state.mapaObjetivos[perspectiva][categoria]['objetivo']

		let response = infos[perspectiva][categoria];
		response["data"] =
			this.state.mapaObjetivos[perspectiva][categoria]["metas"];
		response["objetivo"] =
			this.state.mapaObjetivos[perspectiva][categoria]["objetivo"];

		return response;
	};

	renderMeta = (perspectiva, categoria, meta, index) => {
		const color = "color-" + perspectiva.toLowerCase();
		return (
			<div key={index} className={"map-card-container-meta"}>
				<div className={"map-card-meta-value " + color}>{meta.value}</div>
				<div className={"map-card-meta-text"}>{meta.text}</div>
			</div>
		);
	};

	redirect = (e, perspectiva, categoria) => {
		perspectiva = perspectiva.toLowerCase();
		this.props.redirect(e, perspectiva, categoria);
	};

	renderCard = (perspectiva, categoria, index) => {
		const info = this.getInfoCard(perspectiva, categoria);
		if (info === undefined) return null;

		let cliqueAqui;
		if (info.data.length === 0) {
			cliqueAqui = (
				<div>
					<br />
					Clique aqui e preencha agora :)
					<br />
					<br />
				</div>
			);
		}

		const color = "color-" + perspectiva.toLowerCase();
		const background = "background-" + perspectiva.toLowerCase();

		return (
			<Col
				xs={12}
				sm={12}
				md={6}
				lg={4}
				xl={3}
				key={index}
				onClick={(e) => this.redirect(e, perspectiva, categoria)}
			>
				<Card body className={"zoom-card map-card"}>
					<CardTitle className={""}>
						<div className={"center-swot "}>
							<i className={`${info.icon} map-card-icon ${color}`} />
						</div>
					</CardTitle>
					<CardTitle className={"map-card-title " + background}>
						{info.categoria}
					</CardTitle>
					<CardText className={"map-card-objetivo"}>{info.objetivo}</CardText>
					{cliqueAqui}
					<div>
						{info.data.map((infoData, index) =>
							this.renderMeta(perspectiva, categoria, infoData, index)
						)}
					</div>
					{/*<Button>Detalhes</Button>*/}
				</Card>
			</Col>
		);
	};

	renderCardEstrategia = (item, index) => {
		const perspectiva = item["Estrategia.perspectiva"];
		let text = item.descricao;
		if (text === "" || text === undefined || text === null)
			text = item["Estrategia.descricao"];

		// eslint-disable-next-line max-len
		const classDefine = `map-postit map-postit-${perspectiva} map-postit-estrategia-defined map-postit map-postit-container`;

		return (
			<div className={classDefine} key={index}>
				{/*<div className={'map-postit map-postit-container'}>*/}
				<p className={"map-postit-estrategia-text"}>{text}</p>
				{/*</div>*/}
			</div>
		);
	};

	renderPerspectivaEstrategia = (item) => {
		const [columnId, column] = item;
		const perspectiva = column.name.toLowerCase();
		let classColumn = `map-column-background map-postit-row-${perspectiva} centralize-col`;

		const getListStyle = {
			display: "flex",
			overflow: "auto",
		};

		return (
			<Col key={columnId} className={"align-self-center"}>
				<div style={getListStyle} className={classColumn}>
					{column.items.map((item, index) =>
						this.renderCardEstrategia(item, index)
					)}
				</div>
			</Col>
		);
	};

	renderLegendas = (perspectiva, index) => {
		let color =
			"color-" + perspectiva.toLowerCase() + " align-middle legenda-icon";

		return (
			<Col key={index}>
				<div className={"center-swot"}>
					<i className={"fa fa-square " + color} aria-hidden="true" />
					<p className={"align-middle legenda-text"}>{perspectiva}</p>
				</div>
			</Col>
		);
	};

	renderContainerObjetivos = () => {
		const perspectivas = Object.keys(this.state.mapaObjetivos);
		return (
			<div>
				<Row className={"legenda-row justify-content-center"}>
					<Col sm={8} className={"align-self-center"}>
						<Row>{perspectivas.map(this.renderLegendas)}</Row>
					</Col>
				</Row>
				<Row>
					{perspectivas.map((perspectiva) => {
						const categorias = Object.keys(
							this.state.mapaObjetivos[perspectiva]
						);
						return categorias.map((categoria, index) => {
							return this.renderCard(perspectiva, categoria, index);
						});
					})}
				</Row>
			</div>
		);
	};

	renderContainerEstrategias = () => {
		return (
			<Container fluid={true} className={"container-defined"}>
				<Row className={"align-center justify-content-md-center"}>
					<Col>
						<Row className={"row-perspectiva"}>
							<Col>
								{Object.entries(this.state.mapaEstrategias).map(
									(item, index) => {
										let perspectiva = item[0];
										if (perspectiva !== "estrategias") {
											const [, column] = item;
											const perspectiva = column.name.toLowerCase();

											return (
												<Container
													fluid={true}
													className={"container-available map-perspectiva"}
													key={index}
												>
													<Row>
														<Col
															xs={12}
															sm={4}
															md={4}
															lg={2}
															// eslint-disable-next-line max-len
															className={`align-self-center titles map-perspectiva-title map-postit-${perspectiva}`}
														>
															<h2 className={"map-perspectiva-title-text"}>
																{column.name}
															</h2>
														</Col>
														{this.renderPerspectivaEstrategia(item)}
													</Row>
												</Container>
											);
										}
										return null;
									}
								)}
							</Col>
						</Row>
					</Col>
				</Row>
			</Container>
		);
	};

	renderTab = (id, text) => {
		return (
			<NavItem>
				<NavLink
					className={classnames({ active: this.state.activeTab === id })}
					onClick={async (e) => {
						await this.toggleTab(e, id);
					}}
				>
					{text}
				</NavLink>
			</NavItem>
		);
	};

	renderTabs = () => {
		let tabEstrategias = null;
		if (this.props.tabMetas === true) {
			tabEstrategias = this.renderTab("estrategias", "Estratégias");
		}

		return (
			<div className={"container-tabs-render"}>
				<Nav tabs>
					{this.renderTab("objetivos", "Objetivos e Metas")}
					{tabEstrategias}
				</Nav>
				<TabContent activeTab={this.state.activeTab}>
					<TabPane tabId="objetivos" className={"tab-pane-margin"}>
						{this.renderContainerObjetivos()}
					</TabPane>
					<TabPane tabId="estrategias">
						{this.renderContainerEstrategias()}
					</TabPane>
				</TabContent>
			</div>
		);
	};

	loaded = () => {
		return (
			<div className={"modal-swot-background"}>
				<Modal
					isOpen={this.props.isOpen}
					toggle={this.toggleModal}
					className={"modal-lg modal-swot color-gray"}
				>
					<ModalHeader className={"modal-swot-header"}>
						<div className={"title-modal-swot"}>Mapa Estratégico</div>
					</ModalHeader>
					<ModalBody className={"color-body"}>{this.renderTabs()}</ModalBody>
					<ModalFooter className={"color-footer"}>
						<Button color="secondary" onClick={this.toggleModal}>
							FECHAR
						</Button>
					</ModalFooter>
				</Modal>
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

export default MapaObjetivoMetas;
