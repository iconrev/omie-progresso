/* eslint-disable max-len */
import { Component } from "react";
import {
	Row,
	Col,
	Label,
	FormGroup,
	Modal,
	ModalHeader,
	ModalBody,
	ModalFooter,
	Button,
} from "reactstrap";
import Generic from "../../Utils/Generic";
import LoadingSpinner from "../../../components/LoadingSpinner";
import CardBaseMeta from "./Components/CardBaseMeta";
import CustomCard from "../../../components/CustomCard";
import Number from "../../../components/Number";
import { toast } from "react-toastify";
import CardMetaSugestao from "./Components/CardMetaSugestao";
import ComparativeChart from "./Components/ComparativeChart";
import CompanyService from "../../../service/CompanyService";
import AmbienteInternoService from "../../../service/Diagnostico/AmbienteInterno";
import Metas from "../../../service/Metas";

class VendasForm extends Component {
	constructor(props) {
		super(props);

		this.company = CompanyService.getDataCompany();
		if (!this.company) return this.props.history.push("/");

		this.state = {
			isLoading: true,
			companyId: this.company.id,
			exercicio_definido: this.company.exercicioDefinido,

			tipo_avaliacao: "UN",
			descricao: "",
			showModalDialog: false,
			estrategiasEscolhida: [],
			limiteEstrategias: 3,
			estrategias: [],

			vendas_id: 0,
			meta_proposta_enviadas_mensalmente: 0.0,
			meta_taxa_conversao: 0.0,
			meta_taxa_conversao_perc: 0.0,
			meta_ticket_medio: 0.0,
			meta_ticket_medio_clientes: 0.0,

			propostas_aprovadas_previsto: 0,
			ticket_medio_previsto: 0,

			txtPropostas: undefined,
			txtTicketMedio: undefined,

			receita_bruta_anterior: 0.0,
			ticket_medio_clientes: 0.0,
			ticket_medio_notas: 0.0,
			receitaBrutaPrevistaPercentagem: 0.0,
			taxa_conversao: 0.0,

			sugestao_ticket_medio_clientes: 0.0,
			sugestao_ticket_medio_nota: 0.0,
			sugestao_taxa_conversao: 0.0,

			modalEdicao: false,

			meta_taxa_conversao_label: 0.0,
			meta_taxa_conversao_txt: "",
			meta_ticket_medio_clientes_txt: "",
			meta_ticket_medio_nota_txt: "",

			messageDialog: "",
			linkDialog: "",
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
		await AmbienteInternoService.getResourceInternoAvaliacao("comercial")
			.then(async (result) => {
				let { analise } = result;
				analise = analise[this.state.exercicio_definido];

				const { status } = analise;

				if (status === "success") {
					const { vendas, taxa_conversao, ticket_medio } = analise;
					await this.setState({
						vendas_id: vendas.id,
						ano_exercicio: vendas.ano_exercicio,

						taxa_conversao: taxa_conversao,
						ticket_medio: ticket_medio,
					});

					await Metas.getDefinicao("comercial", "vendas").then(
						async (result) => {
							let { metas } = result;
							metas = metas[this.state.exercicio_definido];

							const { status, objetivo, meta_receitas } = metas;

							if (status === "objectives_not_found") {
								await this.setState({
									isLoading: false,
									showModalDialog: true,
									messageDialog:
										"Ainda não foi preenchido os dados referente as Metas Financeiras desta empresa. Vamos começar por lá?",
									linkDialog: `/hub/${this.state.companyId}/gestao/categoria/metas/financeiro`,
								});
							} else {
								await this.setState({
									estrategias: result.estrategias_disponiveis,
									limiteEstrategias: result.limite_estrategias,
									estrategiasEscolhida: metas.estrategias_definidas,

									receitaBrutaPrevista: meta_receitas.meta,
									receitaBrutaPrevistaPercentagem: meta_receitas.percentagem,
									ano_exercicio: metas.outros_objetivos.ano_exercicio,
									receita_bruta_anterior:
										metas.outros_objetivos.receita_bruta_anterior,
									ticket_medio_clientes:
										metas.outros_objetivos.ticket_medio_clientes,
									ticket_medio_notas: metas.outros_objetivos.ticket_medio_notas,
									taxa_conversao: metas.outros_objetivos.taxa_conversao,

									sugestao_taxa_conversao:
										metas.outros_objetivos.sugestao_taxa_conversao,
								});

								if (status === "success") {
									await this.setState({
										meta_taxa_conversao: objetivo.meta_taxa_conversao_prevista,
										tipo_avaliacao: objetivo.tipo,
										descricao: objetivo.descricao,
									});
								}
							}
						}
					);

					await this.updateFields();
				} else {
					await this.setState({
						isLoading: false,
						showModalDialog: true,
						messageDialog:
							"Ainda não foi preenchido os dados referente ao Comercial desta empresa. Vamos começar por lá?",
						linkDialog: `/hub/${this.state.companyId}/gestao/categoria/diagnostico/interno/vendas`,
					});
				}
			})
			.catch(async (error) => {
				console.error(error);
				await this.setState({
					isLoading: false,
					showModalDialog: true,
					messageDialog:
						"Ocorreu algum problema ao entrar no módulo. Vamos voltar para a página anterior?",
					linkDialog: `/hub/${this.state.companyId}/gestao/categoria/metas`,
				});
			});
	};

	redirect = (e) => {
		e.preventDefault();
		this.props.history.push(this.state.linkDialog);
	};

	modalDialog = () => {
		let modal = null;
		if (this.state.showModalDialog) {
			modal = (
				<div>
					<Modal isOpen={this.state.showModalDialog} className={""}>
						<ModalHeader>Como assim?</ModalHeader>
						<ModalBody>
							<p>{this.state.messageDialog}</p>
						</ModalBody>
						<ModalFooter>
							<Button color="primary" onClick={this.redirect}>
								Vamos!
							</Button>{" "}
						</ModalFooter>
					</Modal>
				</div>
			);
		}

		return modal;
	};

	updateFields = async () => {
		let taxa_conversao = parseFloat(this.state.taxa_conversao);
		let meta_taxa_conversao = this.state.meta_taxa_conversao;
		let percentual = 0.0;

		let meta_taxa_conversao_label = meta_taxa_conversao;

		let meta_taxa_conversao_txt;
		if (meta_taxa_conversao_label === 0) {
			meta_taxa_conversao_txt = "Meta não definida";
		} else {
			percentual =
				100 -
				((100 - meta_taxa_conversao_label) * 100) / (100 - taxa_conversao);
			meta_taxa_conversao_txt =
				meta_taxa_conversao_label > taxa_conversao ? "Aumento" : "Redução";
			meta_taxa_conversao_txt =
				meta_taxa_conversao_txt +
				" de " +
				Generic.formatNumber(percentual) +
				"% em relação ao exercício anterior";
		}

		await this.setState({
			meta_taxa_conversao_label: meta_taxa_conversao_label,
			meta_taxa_conversao_txt: meta_taxa_conversao_txt,
			meta_taxa_conversao_perc: percentual,
		});
	};

	handleChange = async (event, update = true) => {
		await this.setState({
			[event.target.id]: event.target.value,
		});
		if (update) await this.updateFields();
	};

	handleSaveButton = async (e, callback, showConfirmation = true) => {
		e.preventDefault();

		let data = {
			objetivo: {
				tipo: this.state.tipo_avaliacao,
				descricao: this.state.descricao,
				vendasId: this.state.vendas_id,
				meta_taxa_conversao: this.state.meta_taxa_conversao_perc,
				meta_taxa_conversao_prevista: this.state.meta_taxa_conversao_label,
			},
		};
		if (this.state.estrategiasEscolhida === undefined) {
			data["estrategias"] = [];
		} else {
			if (this.state.estrategiasEscolhida.length > 0) {
				data["estrategias"] = this.state.estrategiasEscolhida.map((opt) => ({
					label: opt.label,
					value: opt.innerValue,
					descricao: opt.descricao,
				}));
			} else {
				data["estrategias"] = [];
			}
		}

		const response = await Metas.postDefinicao("comercial", "vendas", data);
		if (response.status === "success") {
			if (showConfirmation) {
				toast.success(response.message);
			}
		} else {
			toast.error(response.message);
		}
	};

	handlePageButton = async (e, resource) => {
		e.preventDefault();
		let id = this.state.companyId;
		if (resource.includes("<<")) {
			this.props.history.push(`/hub/${id}}/gestao/categoria/metas/comercial`);
		} else if (resource.includes(">>")) {
			this.props.history.push(
				`/hub/${id}/gestao/categoria/metas/comercial/relacionamento`
			);
		}
	};

	toggleModal = async (e, label = "", value = "", field = "") => {
		e.preventDefault();
		await this.setState({
			modalEdicao: !this.state.modalEdicao,
			labelModalEdit: label,
			valueModalEdit: value,
			fieldModalEdit: field,
		});
	};

	confirmModalUpdate = async (campo, valor) => {
		await this.setState({
			[campo]: Generic.ConvertStringToFloat(valor),
			modalEdicao: false,
		});
		await this.updateFields();
	};

	modalEdit = (key) => {
		return (
			<Modal
				isOpen={this.state.modalEdicao}
				toggle={(e) => this.toggleModal(e)}
				key={key}
			>
				<ModalHeader toggle={this.toggleModal}>Definição Manual</ModalHeader>
				<ModalBody>
					<Row>
						<Col sm={8}>
							<FormGroup>
								<Label for="inputModalEdit">{this.state.labelModalEdit}</Label>
								<Number
									id="inputModalEdit"
									value={Generic.formatNumber(this.state.valueModalEdit)}
									onChange={this.handleChange}
								/>
							</FormGroup>
						</Col>
					</Row>
				</ModalBody>
				<ModalFooter>
					<Button color="danger" onClick={(e) => this.toggleModal(e)}>
						Cancelar
					</Button>
					<Button
						color="success"
						onClick={() =>
							this.confirmModalUpdate(
								this.state.fieldModalEdit,
								this.state.inputModalEdit
							)
						}
					>
						Definir
					</Button>
				</ModalFooter>
			</Modal>
		);
	};

	renderChart = () => {
		let graph = null;
		if (this.state.meta_taxa_conversao > 0) {
			graph = (
				<ComparativeChart
					data={[
						this.state.taxa_conversao,
						this.state.meta_taxa_conversao_label,
					]}
					years={[this.state.ano_exercicio, this.state.ano_exercicio - 1]}
					typeChart={"%"}
					scaleMax={100}
				/>
			);
		}
		return graph;
	};

	tableMeta = () => {
		return (
			<div>
				<Row>
					<Col xs={12} sm={6} md={4} lg={3}>
						<CustomCard
							value={Generic.formatNumber(this.state.taxa_conversao) + "%"}
							color={"info"}
							title={
								"Taxa de Conversão de Propostas em " + this.state.ano_exercicio
							}
							subtitle={"Exercício Anterior"}
						/>
					</Col>
				</Row>
				<br />
				<div>
					<CardMetaSugestao
						label={"Sugestão de meta para taxa de conversão"}
						label_value={
							Generic.formatNumber(this.state.sugestao_taxa_conversao, 2) + "%"
						}
						fieldSugestao={"sugestao_taxa_conversao"}
						fieldMeta={"meta_taxa_conversao"}
						states={this.state}
						handleChange={this.handleChange}
					/>
				</div>
				<br />
				<Row>
					<Col xs={12} sm={6} md={4} lg={4}>
						<CustomCard
							value={
								Generic.formatNumber(this.state.meta_taxa_conversao_label) + "%"
							}
							color={"success"}
							title={"Meta de Taxa de Conversão de Propostas"}
							subtitle={this.state.meta_taxa_conversao_txt}
							chart={this.renderChart()}
							dropdown={[
								{
									title: "Alterar",
									onClick: (e) =>
										this.toggleModal(
											e,
											"Defina a meta da taxa de conversão de propostas (em %)",
											this.state.meta_taxa_conversao,
											"meta_taxa_conversao"
										),
								},
							]}
						/>
					</Col>
				</Row>
			</div>
		);
	};

	loaded = () => {
		return (
			<CardBaseMeta
				newModel={true}
				companyId={this.state.companyId}
				category={"Vendas"}
				objectiveOptions={[
					{
						value: "ATX",
						text: "Aumentar taxa de conversão das propostas",
					},
				]}
				objectiveSelected={this.state.tipo_avaliacao}
				objectiveDescription={this.state.descricao}
				objectiveHandle={this.handleChange}
				estrategias={{
					options: this.state.estrategias,
					estrategiasEscolhida: this.state.estrategiasEscolhida,
					limite: this.state.limiteEstrategias,
				}}
				cardMeta={this.tableMeta()}
				// cardAvaliacao={this.tableAvaliacao()}
				buttons={[
					{
						placement: "top",
						text: "Próximo",
						action: ">>",
						icon: "fa fa-arrow-right",
						content: "Relacionamento",
						onClick: (e) => this.handlePageButton(e, ">>"),
					},
					{
						placement: "top",
						text: "Voltar",
						action: "<<",
						icon: "fa fa-arrow-left",
						content: "Marketing",
						onClick: (e) => this.handlePageButton(e, "<<"),
					},
				]}
				buttonsave={true}
				save={this.handleSaveButton}
				modal={[this.modalDialog, this.modalEdit]}
			/>
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

export default VendasForm;
