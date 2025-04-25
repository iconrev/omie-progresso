import { Component } from "react";
import {
	Button,
	Row,
	Col,
	Modal,
	ModalHeader,
	ModalBody,
	ModalFooter,
} from "reactstrap";
import Generic from "../../Utils/Generic";
import CardBaseMeta from "./Components/CardBaseMeta";
import LoadingSpinner from "../../../components/LoadingSpinner";
import CustomCard from "../../../components/CustomCard";
import CardMetaQuiz from "./Components/CardMetaQuiz";
import ComparativeChart from "./Components/ComparativeChart";
import { toast } from "react-toastify";
import CompanyService from "../../../service/CompanyService";
import AmbienteInternoService from "../../../service/Diagnostico/AmbienteInterno";
import Metas from "../../../service/Metas";

class MetasPessoasForm extends Component {
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

			nivel_competencia_atual: 0,
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
					nivel_competencia_atual: analise.nivel_competencia,
				};

				if (status === "success") {
					await Metas.getDefinicao("pessoas", "competencias").then(
						async (result) => {
							let { metas } = result;
							metas = metas[this.state.exercicio_definido];

							states = {
								...states,
								estrategias: result.estrategias_disponiveis,
								limiteEstrategias: result.limite_estrategias,
								quiz: metas.quiz,
							};

							let { objetivo } = metas;

							if (objetivo) {
								states = {
									...states,
									tipo_avaliacao: objetivo.tipo,
									descricao: objetivo.descricao,
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
				quiz: quiz,
			},
		};

		const response = await Metas.postDefinicao("pessoas", "competencias", data);
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
			this.props.history.push(`/hub/${id}/gestao/categoria/metas`);
		} else if (resource.includes(">>")) {
			this.props.history.push(
				`/hub/${id}/gestao/categoria/metas/pessoas/engajamento`
			);
		}
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

	renderChartCompetencias = (data) => {
		let graph = null;

		if (this.state.nivel_competencia_atual > 0) {
			graph = (
				<ComparativeChart
					data={[this.state.nivel_competencia_atual, data]}
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
		return (
			<div>
				<Row>
					<Col>
						<CardMetaQuiz
							avaliacaoQuiz={this.state.avaliacao_quiz}
							data={data}
							categoria={"Competências"}
							handler={this.handleMeta}
							estrategias={this.state.estrategias}
							limiteEstrategias={this.state.limiteEstrategias}
							consolidado={{
								anterior: Generic.formatNumber(
									this.state.nivel_competencia_atual
								),
								meta: Generic.formatNumber(dataAtual),
							}}
						/>
					</Col>
				</Row>
				<Row>
					<Col xs={12} sm={6} md={4}>
						<CustomCard
							value={Generic.formatNumber(dataAtual, 2) + "%"}
							color={"info"}
							title={"% Competências Atuais/Requeridas"}
							chart={this.renderChartCompetencias(dataAtual)}
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
				category={"Competências"}
				objectiveOptions={[
					{
						value: "ACO",
						text: "Aumentar competências organizacionais",
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
						content: "Engajamento",
						onClick: (e) => this.handlePageButton(e, ">>"),
					},
					{
						placement: "top",
						text: "Menu",
						action: "<<",
						icon: "fa fa-align-justify",
						content: "Metas",
						onClick: (e) => this.handlePageButton(e, "<<"),
					},
				]}
				buttonsave={true}
				save={this.handleSaveButton}
				modal={[
					this.modalDialog,
					// this.modalEdit,
				]}
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

export default MetasPessoasForm;
