import { Component } from "react";
import {
	Button,
	Col,
	FormGroup,
	Label,
	Modal,
	ModalBody,
	ModalFooter,
	ModalHeader,
	Row,
} from "reactstrap";
import CardBaseMeta from "./Components/CardBaseMeta";
import LoadingSpinner from "../../../components/LoadingSpinner";
import CardMetaQuiz from "./Components/CardMetaQuiz";
import { toast } from "react-toastify";
import ComparativeChart from "./Components/ComparativeChart";
import CustomCard from "../../../components/CustomCard";
import Generic from "../../Utils/Generic";
import CardMetaSugestao from "./Components/CardMetaSugestao";
import Number from "../../../components/Number";
import CompanyService from "../../../service/CompanyService";
import AmbienteInternoService from "../../../service/Diagnostico/AmbienteInterno";
import Metas from "../../../service/Metas";

class Retencao extends Component {
	constructor(props) {
		super(props);

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

			meta_rotatividade: 0,
			meta_rotatividade_label: 0,
			meta_rotatividade_txt: "Meta não definida",

			meta_funcionarios_antigos: 0,
			meta_funcionarios_antigos_label: 0,
			meta_funcionarios_antigos_txt: "Meta não definida",
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
		await AmbienteInternoService.getResourceInternoAvaliacao("pessoas")
			.then(async (result) => {
				let { analise } = result;
				analise = analise[this.state.exercicio_definido];

				const { status } = analise;
				let states = {
					perspectiva_id: analise.pessoas.id,
					avaliacao_quiz: analise,
					nivel_retencao: analise.nivel_retencao,
					rotatividade_anterior: analise.pessoas.rotatividade,
					funcionarios_antigos_anterior: analise.pessoas.funcionarios_antigos,
				};

				if (status === "success") {
					await Metas.getDefinicao("pessoas", "retencao").then(
						async (result) => {
							let { metas } = result;
							metas = metas[this.state.exercicio_definido];

							states = {
								...states,
								estrategias: result.estrategias_disponiveis,
								limiteEstrategias: result.limite_estrategias,
								quiz: metas.quiz,
								sugestao_rotatividade:
									metas.outros_objetivos.sugestao_rotatividade,
							};

							let { objetivo } = metas;

							if (objetivo) {
								states = {
									...states,
									tipo_avaliacao: objetivo.tipo,
									descricao: objetivo.descricao,

									meta_rotatividade: objetivo.rotatividade_meta,
									meta_funcionarios_antigos: objetivo.funcionarios_antigos_meta,
								};
							}
						}
					);

					await this.setState(states);
				} else {
					await this.setState({
						showModalDialog: true,
					});
				}
			})
			.catch(async (error) => {
				console.error("[ERROR]", error);
				await this.setState({
					showModalDialog: true,
				});
			});
	};

	redirect = (e) => {
		e.preventDefault();
		this.props.history.push(
			`/hub/${this.state.companyId}/gestao/categoria/diagnostico/interno/pessoas`
		);
	};

	modalDialog = () => {
		let modal = null;

		if (this.state.showModalDialog) {
			modal = (
				<div>
					<Modal isOpen={this.state.showModalDialog} className={""}>
						<ModalHeader>Como assim?</ModalHeader>
						<ModalBody>
							<p>
								Ainda não foi preenchido os dados referente ao diagnóstico de{" "}
								<strong>Pessoas</strong> desta empresa. Vamos começar por lá?
							</p>
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
		let meta_rotatividade_txt;
		let meta_funcionarios_antigos_txt;

		let rotatividade_anterior = this.state.rotatividade_anterior;
		let funcionarios_antigos_anterior =
			this.state.funcionarios_antigos_anterior;

		let meta_rotatividade = this.state.meta_rotatividade;
		let meta_funcionarios_antigos = this.state.meta_funcionarios_antigos;
		let meta_rotatividade_label = meta_rotatividade - rotatividade_anterior;
		let meta_funcionarios_antigos_label =
			meta_funcionarios_antigos - funcionarios_antigos_anterior;
		if (meta_rotatividade_label === 0) {
			meta_rotatividade_txt = "Meta não definida";
		} else {
			meta_rotatividade_txt =
				meta_rotatividade_label > 0 ? "Aumento" : "Redução";
			meta_rotatividade_txt =
				meta_rotatividade_txt +
				" de " +
				Generic.formatNumber(meta_rotatividade_label) +
				"% em relação ao exercício anterior";
		}
		if (meta_funcionarios_antigos_label === 0) {
			meta_funcionarios_antigos_txt = "Meta não definida";
		} else {
			meta_funcionarios_antigos_txt =
				meta_funcionarios_antigos_label > 0 ? "Aumento" : "Redução";
			meta_funcionarios_antigos_txt =
				meta_funcionarios_antigos_txt +
				" de " +
				Generic.formatNumber(meta_funcionarios_antigos_label) +
				"% em relação ao exercício anterior";
		}

		await this.setState({
			meta_rotatividade_label: meta_rotatividade_label,
			meta_rotatividade_txt: meta_rotatividade_txt,
			meta_funcionarios_antigos_label: meta_funcionarios_antigos_label,
			meta_funcionarios_antigos_txt: meta_funcionarios_antigos_txt,
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

		const data = {
			objetivo: {
				tipo: this.state.tipo_avaliacao,
				descricao: this.state.descricao,
				pessoasId: this.state.perspectiva_id,
				rotatividade_meta: this.state.meta_rotatividade,
				funcionarios_antigos_meta: this.state.meta_funcionarios_antigos,
				quiz: quiz,
			},
		};

		const response = await Metas.postDefinicao("pessoas", "retencao", data);
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
			this.props.history.push(
				`/hub/${id}/gestao/categoria/metas/pessoas/engajamento`
			);
		} else if (resource.includes(">>")) {
			this.props.history.push(
				`/hub/${id}/gestao/categoria/metas/pessoas/inovacao`
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
						<Col>
							<Label for="inputModalEdit">{this.state.labelModalEdit}</Label>
						</Col>
					</Row>
					<Row>
						<Col sm={6}>
							<FormGroup>
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

	renderChartRetencao = (data) => {
		let graph = null;

		if (this.state.nivel_retencao > 0) {
			graph = (
				<ComparativeChart
					data={[this.state.nivel_retencao, data]}
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

	renderChartRotatividade = () => {
		let graph = null;

		if (this.state.rotatividade !== 0) {
			graph = (
				<ComparativeChart
					data={[
						this.state.rotatividade_anterior,
						this.state.meta_rotatividade,
					]}
					years={[
						(this.state.exercicio_definido - 1).toString(),
						this.state.exercicio_definido.toString(),
					]}
					typeChart={"%"}
				/>
			);
		}
		return graph;
	};

	renderChartFuncionariosAntigos = () => {
		let graph = null;

		if (this.state.meta_funcionarios_antigos !== 0) {
			graph = (
				<ComparativeChart
					data={[
						this.state.funcionarios_antigos_anterior,
						this.state.meta_funcionarios_antigos,
					]}
					years={[
						(this.state.exercicio_definido - 1).toString(),
						this.state.exercicio_definido.toString(),
					]}
					typeChart={"%"}
				/>
			);
		}
		return graph;
	};

	tableMeta = (data, dataAtual) => {
		return (
			<div>
				<Row>
					<Col xs={12} sm={6} md={4} lg={3}>
						<CustomCard
							value={
								Generic.formatNumber(this.state.rotatividade_anterior, 2) + "%"
							}
							color={"success"}
							title={"Taxa de Rotatividade"}
							subtitle={"Exercício anterior"}
						/>
					</Col>
					<Col xs={12} sm={6} md={4} lg={3}>
						<CustomCard
							value={
								Generic.formatNumber(
									this.state.funcionarios_antigos_anterior,
									2
								) + "%"
							}
							color={"success"}
							title={"Funcionários com mais de 12 meses"}
							subtitle={"Exercício anterior"}
						/>
					</Col>
				</Row>
				<br />
				<div>
					<CardMetaSugestao
						label={"Sugestão de meta para rotatividade"}
						label_value={
							Generic.formatNumber(this.state.sugestao_rotatividade, 2) + "%"
						}
						fieldSugestao={"sugestao_rotatividade"}
						fieldMeta={"meta_rotatividade"}
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
							categoria={"Métodos de Retenção"}
							estrategias={this.state.estrategias}
							limiteEstrategias={this.state.limiteEstrategias}
							handler={this.handleMeta}
							consolidado={{
								anterior: Generic.formatNumber(this.state.nivel_retencao),
								meta: Generic.formatNumber(dataAtual),
							}}
						/>
					</Col>
				</Row>
				<Row>
					<Col xs={12} sm={6} md={6} lg={4}>
						<CustomCard
							value={
								Generic.formatNumber(this.state.meta_rotatividade, 2) + "%"
							}
							color={"info"}
							title={"Meta de Rotatividade"}
							subtitle={this.state.meta_rotatividade_txt}
							chart={this.renderChartRotatividade()}
							dropdown={[
								{
									title: "Alterar",
									onClick: (e) =>
										this.toggleModal(
											e,
											"Defina a meta de rotatividade (em %)",
											this.state.meta_rotatividade,
											"meta_rotatividade"
										),
								},
							]}
						/>
					</Col>
					<Col xs={12} sm={6} md={6} lg={4}>
						<CustomCard
							value={
								Generic.formatNumber(this.state.meta_funcionarios_antigos, 2) +
								"%"
							}
							color={"info"}
							title={"Meta de Funcionários com mais de 12 meses"}
							subtitle={this.state.meta_funcionarios_antigos_txt}
							chart={this.renderChartFuncionariosAntigos()}
							dropdown={[
								{
									title: "Alterar",
									onClick: (e) =>
										this.toggleModal(
											e,
											"Defina a meta de funcionários com mais de 12 meses (em %)",
											this.state.meta_funcionarios_antigos,
											"meta_funcionarios_antigos"
										),
								},
							]}
						/>
					</Col>
					<Col xs={12} sm={6} md={4}>
						<CustomCard
							value={Generic.formatNumber(dataAtual, 2) + "%"}
							color={"info"}
							title={"Nível de Retenção"}
							chart={this.renderChartRetencao(dataAtual)}
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
				perspective={"pessoas"}
				category={"Retenção"}
				objectiveOptions={[
					{
						value: "RF",
						text: "Reter funcionários",
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
						content: "Inovação",
						onClick: (e) => this.handlePageButton(e, ">>"),
					},
					{
						placement: "top",
						text: "Anterior",
						action: "<<",
						icon: "fa fa-arrow-left",
						content: "Engajamento",
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

export default Retencao;
