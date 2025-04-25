/* eslint-disable max-len */
import { Component } from "react";
import {
	Button,
	Row,
	Col,
	Label,
	FormGroup,
	Modal,
	ModalHeader,
	ModalBody,
	ModalFooter,
} from "reactstrap";
import Generic from "../../Utils/Generic";
import Number from "../../../components/Number";
import CardBaseMeta from "./Components/CardBaseMeta";
import LoadingSpinner from "../../../components/LoadingSpinner";
import CustomCard from "../../../components/CustomCard";
import CardMetaSugestao from "./Components/CardMetaSugestao";
import ComparativeChart from "./Components/ComparativeChart";
import CardMetaQuiz from "./Components/CardMetaQuiz";
import { toast } from "react-toastify";
import CompanyService from "../../../service/CompanyService";
import AmbienteInternoService from "../../../service/Diagnostico/AmbienteInterno";
import Metas from "../../../service/Metas";

class Vendas_Relacionamento extends Component {
	constructor(props) {
		super(props);

		this.perspectiva = "comercial";
		this.categoria = "relacionamento";

		this.company = CompanyService.getDataCompany();
		if (!this.company) return this.props.history.push("/");

		this.state = {
			isLoading: true,
			companyId: this.company.id,
			exercicio_definido: this.company.exercicioDefinido,

			estrategiasEscolhida: [],
			limiteEstrategias: 3,
			estrategias: [],
			showModalDialog: false,
			processos_id: 0,
			tipo_avaliacao: "UN",
			descricao: "",
			quiz: [],
			avaliacao_quiz: null,

			nivel_relacionamento_clientes: 0.0,

			meta_clientes_fidelizados: 0.0,
			meta_clientes_fidelizados_label: 0.0,
			meta_clientes_fidelizados_txt: "Meta não definida",

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

				const { status, vendas } = analise;
				let states = {
					vendas_id: vendas.id,
					avaliacao_quiz: analise,
					carteira_de_clientes_ativa: vendas.carteira_de_clientes_ativa,
					percentual_clientes_ativos: analise.percentual_clientes_ativos,
					clientes_fidelizados: vendas.clientes_fidelizados,
					percentual_clientes_fidelizados:
						analise.percentual_clientes_fidelizados,
					nivel_relacionamento_clientes: vendas.nivel_relacionamento_clientes,
				};

				if (status === "success") {
					await Metas.getDefinicao("comercial", "relacionamento").then(
						async (result) => {
							let { metas } = result;
							metas = metas[this.state.exercicio_definido];

							const { status, objetivo } = metas;

							if (status === "objectives_not_found") {
								await this.setState({
									isLoading: false,
									showModalDialog: true,
									messageDialog:
										"Ainda não foi preenchido os dados referente as Metas Financeiras desta empresa. Vamos começar por lá?",
									linkDialog: `/hub/${this.state.companyId}/gestao/categoria/metas/financeiro`,
								});
							} else {
								states = {
									...states,
									estrategias: result.estrategias_disponiveis,
									limiteEstrategias: result.limite_estrategias,
									quiz: metas.quiz,
									sugestao_clientes_fidelizados:
										metas.outros_objetivos.sugestao_clientes_fidelizados,
									clientes_ativos_previsto:
										metas.outros_objetivos.clientes_ativos_previsto,
									base_clientes_previsto:
										metas.outros_objetivos.base_clientes_previsto,
								};
								if (objetivo) {
									states = {
										...states,
										tipo_avaliacao: objetivo.tipo,
										descricao: objetivo.descricao,

										meta_clientes_fidelizados:
											objetivo.meta_clientes_fidelizados,
									};
								}
							}

							await this.setState(states);
							await this.updateFields();
						}
					);
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
		let meta_clientes_fidelizados_txt, meta_nivel_relacionamento_txt;

		let clientes_fidelizados_anterior = this.state.clientes_fidelizados;
		let nivel_relacionamento_anterior =
			this.state.nivel_relacionamento_clientes;

		let meta_clientes_fidelizados = this.state.meta_clientes_fidelizados;
		let meta_clientes_fidelizados_label =
			(clientes_fidelizados_anterior / 100) * meta_clientes_fidelizados;
		if (meta_clientes_fidelizados_label === 0) {
			meta_clientes_fidelizados_txt = "Meta não definida";
		} else {
			meta_clientes_fidelizados_label += clientes_fidelizados_anterior;
			meta_clientes_fidelizados_txt =
				meta_clientes_fidelizados_label > 0 ? "Aumento" : "Redução";
			meta_clientes_fidelizados_txt =
				meta_clientes_fidelizados_txt +
				" de " +
				Generic.formatNumber(meta_clientes_fidelizados) +
				"% em relação ao exercício anterior";
		}

		let meta_nivel_relacionamento_label = this.state.meta_nivel_relacionamento;
		if (meta_nivel_relacionamento_label === 0) {
			meta_nivel_relacionamento_txt = "Meta não definida";
		} else {
			meta_nivel_relacionamento_label += nivel_relacionamento_anterior;
			meta_nivel_relacionamento_label =
				meta_nivel_relacionamento_label > 100
					? 100
					: meta_nivel_relacionamento_label;
			let dif = meta_nivel_relacionamento_label - nivel_relacionamento_anterior;
			meta_nivel_relacionamento_txt =
				meta_clientes_fidelizados_label > 0 ? "Aumento" : "Redução";
			meta_nivel_relacionamento_txt =
				meta_nivel_relacionamento_txt +
				" de " +
				Generic.formatNumber(dif) +
				"% em relação ao exercício anterior";
		}

		this.setState({
			meta_clientes_fidelizados_label: meta_clientes_fidelizados_label,
			meta_nivel_relacionamento_label: meta_nivel_relacionamento_label,
			meta_clientes_fidelizados_txt: meta_clientes_fidelizados_txt,
			meta_nivel_relacionamento_txt: meta_nivel_relacionamento_txt,
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

		const quiz = [];
		for (let i = 0; i < this.state.quiz.length; i++) {
			let quizState = this.state.quiz[i];
			if (!quizState["meta_avaliacao"]) {
				quizState["meta_avaliacao"] =
					this.state.avaliacao_quiz[quizState["field"]];
			}
			quiz.push(quizState);
		}

		let data = {
			objetivo: {
				tipo: this.state.tipo_avaliacao,
				descricao: this.state.descricao,
				vendasId: this.state.vendas_id,
				meta_clientes_fidelizados: this.state.meta_clientes_fidelizados,
				meta_clientes_fidelizados_previsto:
					this.state.meta_clientes_fidelizados_label,
				quiz: quiz,
			},
		};

		const response = await Metas.postDefinicao(
			"comercial",
			"relacionamento",
			data
		);
		if (response.status === "success") {
			if (showConfirmation) {
				toast.success(response.message);
			}
		} else {
			toast.error(response.message);
		}
	};

	handlePageButton = (e, resource) => {
		e.preventDefault();
		let id = this.state.companyId;
		if (resource.includes("<<")) {
			this.props.history.push(
				`/hub/${id}/gestao/categoria/metas/comercial/vendas`
			);
		} else if (resource.includes(">>")) {
			this.props.history.push(
				`/hub/${id}/gestao/categoria/metas/comercial/satisfacao`
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

	handleMeta = async (
		idQuiz,
		check,
		estrategiaText,
		estrategiaId,
		metaClassificacao = null
	) => {
		let avaliacaoFilter = this.state.quiz.filter(
			(element) => element.id === parseInt(idQuiz)
		)[0];
		let avaliacaoIndex = this.state.quiz.indexOf(avaliacaoFilter);
		let checkBoolean = check === "Y";

		let quiz = this.state.quiz;
		let avaliacaoDefine = quiz[avaliacaoIndex];

		avaliacaoDefine.estrategia_escolhida_id = estrategiaId;
		avaliacaoDefine.estrategia_escolhida_label = estrategiaText;
		avaliacaoDefine.definicao_meta = checkBoolean;

		if (metaClassificacao) {
			let opcao_avaliacao = [];
			for (let item in avaliacaoDefine.avaliacao_opcao_value.split(";")) {
				let value = avaliacaoDefine.avaliacao_opcao_value
					.split(";")
					[parseInt(item)].trim();
				let label = avaliacaoDefine.avaliacao_opcao_label
					.split(";")
					[parseInt(item)].trim();
				opcao_avaliacao.push({
					value: value,
					label: label,
				});
			}
			avaliacaoDefine.meta_avaliacao = opcao_avaliacao.filter(
				(element) => element.value === metaClassificacao
			)[0].value;
		}

		await this.setState({
			quiz: quiz,
		});
	};

	renderChartClientes = () => {
		let graph = null;
		if (this.state.meta_clientes_fidelizados_label > 0) {
			graph = (
				<ComparativeChart
					data={[
						this.state.clientes_fidelizados,
						this.state.meta_clientes_fidelizados_label,
					]}
					years={[
						(this.state.exercicio_definido - 1).toString(),
						this.state.exercicio_definido.toString(),
					]}
					decimals={false}
				/>
			);
		}
		return graph;
	};

	renderChartRelacionamento = (data) => {
		let graph = null;

		if (data > 0) {
			graph = (
				<ComparativeChart
					data={[this.state.nivel_relacionamento_clientes, data]}
					years={[
						(this.state.exercicio_definido - 1).toString(),
						this.state.exercicio_definido.toString(),
					]}
					typeChart={"%"}
					scaleMax={100}
				/>
			);
		}
		return graph;
	};

	tableMeta = (data, dataAtual) => {
		const perc_clientes_ativos_previsto =
			(100 / this.state.base_clientes_previsto) *
			this.state.clientes_ativos_previsto;

		return (
			<div>
				<Row>
					<Col xs={12} sm={6} md={4} lg={3}>
						<CustomCard
							value={Generic.formatNumber(
								this.state.carteira_de_clientes_ativa,
								0
							)}
							color={"success"}
							title={"Clientes Ativos no Exercício Anterior"}
							subtitle={
								"Correspondente a " +
								Generic.formatNumber(this.state.percentual_clientes_ativos) +
								"% da Carteira total"
							}
						/>
					</Col>
					<Col xs={12} sm={6} md={4} lg={3}>
						<CustomCard
							value={Generic.formatNumber(this.state.clientes_fidelizados, 0)}
							color={"success"}
							title={"Clientes Fidelizados no Exercício Anterior"}
							subtitle={
								"Correspondente a " +
								Generic.formatNumber(
									this.state.percentual_clientes_fidelizados
								) +
								"% da Carteira Ativa de clientes"
							}
						/>
					</Col>
					<Col xs={12} sm={6} md={4} lg={3}>
						<CustomCard
							value={
								Generic.formatNumber(this.state.nivel_relacionamento_clientes) +
								"%"
							}
							color={"success"}
							title={"Nível de Relacionamento no Exercício Anterior"}
						/>
					</Col>
				</Row>
				<Row>
					<Col xs={12} sm={6} md={4} lg={3}>
						<CustomCard
							value={Generic.formatNumber(
								this.state.clientes_ativos_previsto,
								0
							)}
							color={"info"}
							title={"Clientes Ativos Previsto"}
							subtitle={
								"Correspondente a " +
								Generic.formatNumber(perc_clientes_ativos_previsto) +
								"% da Carteira total"
							}
						/>
					</Col>
				</Row>
				<br />
				<div>
					<CardMetaSugestao
						label={"Sugestão de aumento de Clientes Fidelizados"}
						label_value={
							Generic.formatNumber(
								this.state.sugestao_clientes_fidelizados,
								2
							) + "%"
						}
						fieldSugestao={"sugestao_clientes_fidelizados"}
						fieldMeta={"meta_clientes_fidelizados"}
						states={this.state}
						handleChange={this.handleChange}
					/>
				</div>
				<br />
				<Row>
					<Col>
						<CardMetaQuiz
							avaliacaoQuiz={this.state.avaliacao_quiz}
							data={data}
							categoria={"Engajamento"}
							handler={this.handleMeta}
							estrategias={this.state.estrategias}
							limiteEstrategias={this.state.limiteEstrategias}
							consolidado={{
								anterior: Generic.formatNumber(
									this.state.nivel_relacionamento_clientes
								),
								meta: Generic.formatNumber(dataAtual),
							}}
						/>
					</Col>
				</Row>
				<Row>
					<Col xs={12} sm={6} md={6} lg={4}>
						<CustomCard
							value={Generic.formatNumber(
								this.state.meta_clientes_fidelizados_label,
								0
							)}
							color={"info"}
							title={"Meta de Clientes Fidelizados"}
							subtitle={this.state.meta_clientes_fidelizados_txt}
							chart={this.renderChartClientes()}
							dropdown={[
								{
									title: "Alterar",
									onClick: (e) =>
										this.toggleModal(
											e,
											"Defina a meta de aumento de Clientes Fidelizados (em %)",
											this.state.meta_clientes_fidelizados,
											"meta_clientes_fidelizados"
										),
								},
							]}
						/>
					</Col>
					<Col xs={12} sm={6} md={6} lg={4}>
						<CustomCard
							value={Generic.formatNumber(dataAtual, 2) + "%"}
							color={"info"}
							title={"Meta de Nível de Relacionamento"}
							chart={this.renderChartRelacionamento(dataAtual)}
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
				quizVersion={true}
				dataQuiz={this.state.quiz}
				avaliacaoQuiz={this.state.avaliacao_quiz}
				companyId={this.state.companyId}
				perspective={"vendas"}
				category={"Relacionamento"}
				objectiveOptions={[
					{
						value: "FC",
						text: "Fidelizar Clientes",
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
				cardMeta={this.tableMeta}
				buttons={[
					{
						placement: "top",
						text: "Próximo",
						action: ">>",
						icon: "fa fa-arrow-right",
						content: "Satisfação",
						onClick: (e) => this.handlePageButton(e, ">>"),
					},
					{
						placement: "top",
						text: "Voltar",
						action: "<<",
						icon: "fa fa-arrow-left",
						content: "Vendas",
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

export default Vendas_Relacionamento;
