import { Component } from "react";
import {
	Button,
	Row,
	Col,
	Modal,
	ModalHeader,
	ModalBody,
	ModalFooter,
	FormGroup,
	Label,
} from "reactstrap";
import Generic from "../../Utils/Generic";
import CardBaseMeta from "./Components/CardBaseMeta";
import LoadingSpinner from "../../../components/LoadingSpinner";
import CustomCard from "../../../components/CustomCard";
import CardMetaSugestao from "./Components/CardMetaSugestao";
import Number from "../../../components/Number";
import { toast } from "react-toastify";
import ComparativeChart from "./Components/ComparativeChart";
import CompanyService from "../../../service/CompanyService";
import AmbienteInternoService from "../../../service/Diagnostico/AmbienteInterno";
import Metas from "../../../service/Metas";

class Inovacao extends Component {
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

			sugestao_inovacao: 0,
			sugestao_faturamento: 0,
			receita_bruta_prevista: 0,

			inovacao_anterior: 0,
			faturamento_anterior: 0,

			meta_inovacao: 0,
			meta_inovacao_label: 0,
			meta_inovacao_txt: "",

			meta_faturamento: 0,
			meta_faturamento_label: 0,
			meta_faturamento_txt: "",
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
				let states = {};

				if (status === "success") {
					states["perspectiva_id"] = analise.pessoas.id;
					states["inovacao_anterior"] =
						analise.pessoas.total_inovacao_implementada_empresa;
					states["faturamento_anterior"] =
						analise.pessoas.faturamento_oriundo_inovacao;

					await Metas.getDefinicao("pessoas", "inovacao").then(
						async (result) => {
							let { metas } = result;
							metas = metas[this.state.exercicio_definido];

							const { status, meta_receitas, outros_objetivos, objetivo } =
								metas;
							if (status === "success") {
								states = {
									...states,
									tipo_avaliacao: objetivo.tipo,
									descricao: objetivo.descricao,

									meta_inovacao: objetivo.inovacao_previsao,
									meta_faturamento: objetivo.faturamento_gasto_inovacao_meta,
								};
							}
							states = {
								...states,
								estrategias: result.estrategias_disponiveis,
								limiteEstrategias: result.limite_estrategias,
								estrategiasEscolhida: metas.estrategias_definidas,

								receita_bruta_prevista: meta_receitas.meta,
								sugestao_inovacao: outros_objetivos.sugestao_inovacao,
								sugestao_faturamento: outros_objetivos.sugestao_faturamento,
							};
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
			`/hub/${this.state.companyId}/gestao/categoria/diagnostico/interno/processos`
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
		let meta_inovacao_txt, meta_faturamento_txt;

		let inovacao_anterior = this.state.inovacao_anterior;
		let receita_bruta_prevista = this.state.receita_bruta_prevista;

		let meta_inovacao = this.state.meta_inovacao;
		let meta_inovacao_label = (meta_inovacao / inovacao_anterior - 1) * 100;
		if (meta_inovacao === 0) {
			meta_inovacao_txt = "Meta não definida";
		} else {
			meta_inovacao_txt = meta_inovacao_label > 0 ? "Aumento" : "Redução";
			meta_inovacao_txt =
				meta_inovacao_txt +
				" de " +
				Generic.formatNumber(meta_inovacao_label) +
				"% em relação ao exercício anterior";
		}

		let meta_faturamento = this.state.meta_faturamento;
		let meta_faturamento_label =
			(receita_bruta_prevista / 100) * meta_faturamento;
		if (meta_faturamento === 0) {
			meta_faturamento_txt = "Meta não definida";
		} else {
			meta_faturamento_txt =
				"Equivalente a R$ " +
				Generic.formatNumber(meta_faturamento_label, 2) +
				" da Receita Bruta Prevista";
		}

		await this.setState({
			meta_inovacao_label: meta_inovacao_label,
			meta_inovacao_txt: meta_inovacao_txt,
			meta_faturamento_label: meta_faturamento_label,
			meta_faturamento_txt: meta_faturamento_txt,
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

		const data = {
			objetivo: {
				tipo: this.state.tipo_avaliacao,
				descricao: this.state.descricao,
				pessoasId: this.state.perspectiva_id,
				inovacao_meta: this.state.meta_inovacao_label,
				inovacao_previsao: this.state.meta_inovacao,
				faturamento_gasto_inovacao_meta: this.state.meta_faturamento,
				faturamento_gasto_inovacao_previsao: this.state.meta_faturamento_label,
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

		const response = await Metas.postDefinicao("pessoas", "inovacao", data);
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
				`/hub/${id}/gestao/categoria/metas/pessoas/retencao`
			);
		} else if (resource.includes(">>")) {
			this.props.history.push(`/hub/${id}/gestao/categoria/metas`);
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

	renderChartInovacao = () => {
		let chart = null;

		if (this.state.meta_inovacao > 0) {
			chart = (
				<ComparativeChart
					data={[this.state.inovacao_anterior, this.state.meta_inovacao]}
					years={[
						(this.state.exercicio_definido - 1).toString(),
						this.state.exercicio_definido.toString(),
					]}
				/>
			);
		}

		return chart;
	};

	renderChartFaturamento = () => {
		let chart = null;

		if (this.state.meta_faturamento > 0) {
			chart = (
				<ComparativeChart
					data={[this.state.faturamento_anterior, this.state.meta_faturamento]}
					years={[
						(this.state.exercicio_definido - 1).toString(),
						this.state.exercicio_definido.toString(),
					]}
					typeChart={"%"}
					scaleMax={100}
				/>
			);
		}

		return chart;
	};

	tableMeta = () => {
		return (
			<div>
				<Row>
					<Col xs={12} sm={6} md={4} lg={3}>
						<CustomCard
							value={Generic.formatNumber(this.state.inovacao_anterior, 0)}
							color={"success"}
							title={"Total de Inovações Implementadas"}
							subtitle={"Exercício anterior"}
						/>
					</Col>
					<Col xs={12} sm={6} md={4} lg={3}>
						<CustomCard
							value={
								Generic.formatNumber(this.state.faturamento_anterior, 2) + "%"
							}
							color={"success"}
							title={"Faturamento oriundo de inovação"}
							subtitle={"Exercício anterior"}
						/>
					</Col>
				</Row>
				<Row>
					<Col xs={12} sm={6} md={4} lg={3}>
						<CustomCard
							value={
								"R$ " +
								Generic.formatNumber(this.state.receita_bruta_prevista, 2)
							}
							color={"info"}
							title={"Receita Bruta Prevista"}
							subtitle={"Definido em Financeiro"}
						/>
					</Col>
				</Row>
				<br />
				<div>
					<CardMetaSugestao
						label={"Sugestão de meta para quantidade de inovações"}
						label_value={Generic.formatNumber(this.state.sugestao_inovacao, 0)}
						fieldSugestao={"sugestao_inovacao"}
						fieldMeta={"meta_inovacao"}
						states={this.state}
						handleChange={this.handleChange}
					/>
					<CardMetaSugestao
						label={"Sugestão de meta de faturamento oirundo de inovação"}
						label_value={
							Generic.formatNumber(this.state.sugestao_faturamento, 2) + "%"
						}
						fieldSugestao={"sugestao_faturamento"}
						fieldMeta={"meta_faturamento"}
						states={this.state}
						handleChange={this.handleChange}
					/>
				</div>
				<br />
				<Row>
					<Col xs={12} sm={6} md={6} lg={4}>
						<CustomCard
							value={Generic.formatNumber(this.state.meta_inovacao, 0)}
							color={"info"}
							title={"Meta de Inovações"}
							subtitle={this.state.meta_inovacao_txt}
							chart={this.renderChartInovacao()}
							dropdown={[
								{
									title: "Alterar",
									onClick: (e) =>
										this.toggleModal(
											e,
											"Defina a meta de inovações",
											this.state.meta_inovacao,
											"meta_inovacao"
										),
								},
							]}
						/>
					</Col>
					<Col xs={12} sm={6} md={6} lg={4}>
						<CustomCard
							value={Generic.formatNumber(this.state.meta_faturamento, 2) + "%"}
							color={"info"}
							title={"Meta de Faturamento"}
							subtitle={this.state.meta_faturamento_txt}
							chart={this.renderChartFaturamento()}
							dropdown={[
								{
									title: "Alterar",
									onClick: (e) =>
										this.toggleModal(
											e,
											"Defina a meta de faturamento oriundo de inovações (em %)",
											this.state.meta_faturamento,
											"meta_faturamento"
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
				category={"Inovação"}
				objectiveOptions={[
					{
						value: "PI",
						text: "Promover inovação",
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
				buttons={[
					{
						placement: "top",
						text: "Menu",
						action: ">>",
						icon: "fa fa-align-justify",
						content: "Metas",
						onClick: (e) => this.handlePageButton(e, ">>"),
					},
					{
						placement: "top",
						text: "Voltar",
						action: "<<",
						icon: "fa fa-arrow-left",
						content: "Retenção",
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

export default Inovacao;
