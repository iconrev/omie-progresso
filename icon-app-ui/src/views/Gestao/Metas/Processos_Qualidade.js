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
import { toast } from "react-toastify";
import CardBaseMeta from "./Components/CardBaseMeta";
import LoadingSpinner from "../../../components/LoadingSpinner";
import CustomCard from "../../../components/CustomCard";
import CardMetaSugestao from "./Components/CardMetaSugestao";
import ComparativeChart from "./Components/ComparativeChart";
import CompanyService from "../../../service/CompanyService";
import AmbienteInternoService from "../../../service/Diagnostico/AmbienteInterno";
import Metas from "../../../service/Metas";

class Produtividade_Qualidade extends Component {
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

			refugo_retrabalho_meta: 0,
			refugo_retrabalho_label: 0,
			refugo_retrabalho_txt: "",

			custos_garantia_meta: 0,
			custos_garantia_label: 0,
			custos_garantia_txt: "",
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
		await AmbienteInternoService.getResourceInternoAvaliacao("processos")
			.then(async (result) => {
				let { analise } = result;
				analise = analise[this.state.exercicio_definido];

				const { status } = analise;
				let states = {};

				if (status === "success") {
					states["perspectiva_id"] = analise.processos.id;
					states["receita_bruta_anterior"] = analise.receita_bruta;
					states["receita_bruta_custo_folha"] =
						analise.receita_bruta_custo_folha;
					states["quantidade_entregue_funcionarios"] =
						analise.quantidade_entregue_funcionarios;
					states["volume_produzido_no_ano"] =
						analise.processos.volume_produzido_no_ano;
					states["funcionarios"] = analise.processos.funcionarios;
					states["custo_folha"] = analise.custo_folha;
					states["refugo_retrabalho"] = analise.processos.refugo_retrabalho;
					states["custos_garantia"] = analise.custos_garantia;

					await Metas.getDefinicao("processos", "qualidade").then(
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

									refugo_retrabalho_meta: objetivo.refugo_retrabalho_previsao,
									custos_garantia_meta: objetivo.custos_garantia_previsao,
								};
							}
							states = {
								...states,
								estrategias: result.estrategias_disponiveis,
								limiteEstrategias: result.limite_estrategias,
								estrategiasEscolhida: metas.estrategias_definidas,

								receita_bruta_prevista: meta_receitas.meta,

								sugestao_refugo_retrabalho:
									outros_objetivos.sugestao_refugo_retrabalho,
								sugestao_custos_garantia:
									outros_objetivos.sugestao_custos_garantia,
							};
						}
					);

					await this.setState({
						...states,
					});
					await this.updateFields();
				} else {
					await this.setState({
						isLoading: false,
						showModalDialog: true,
					});
				}
			})
			.catch(async () => {
				await this.setState({
					isLoading: false,
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
								Ainda não foi preenchido os dados referente aos Processos desta
								empresa. Vamos começar por lá?
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
		let refugo_retrabalho_txt = "Meta não definida";
		let custos_garantia_txt = "Meta não definida";
		let refugo_retrabalho_label, custos_garantia_label;

		let refugo_retrabalho_meta = this.state.refugo_retrabalho_meta;
		if (refugo_retrabalho_meta > 0) {
			let refugo_anterior = this.state.refugo_retrabalho;
			refugo_retrabalho_label =
				100 - (100 / refugo_anterior) * refugo_retrabalho_meta;
			refugo_retrabalho_txt =
				refugo_retrabalho_label > 0 ? "Melhoria" : "Piora";
			refugo_retrabalho_txt +=
				" de " +
				Generic.formatNumber(refugo_retrabalho_label) +
				"% em relação ao exerício anterior";
		}

		let custos_garantia_meta = this.state.custos_garantia_meta;
		if (custos_garantia_meta > 0) {
			let custos_anterior = this.state.custos_garantia;
			custos_garantia_label =
				100 - (100 / custos_anterior) * custos_garantia_meta;
			let custos_valor =
				this.state.receita_bruta_prevista *
				(this.state.custos_garantia_meta / 100);
			custos_garantia_txt = custos_garantia_label > 0 ? "Melhoria" : "Piora";
			custos_garantia_txt +=
				" de " +
				Generic.formatNumber(custos_garantia_label) +
				"% em relação ao exerício anterior com a previsão " +
				"de R$ " +
				Generic.formatNumber(custos_valor) +
				" em Custos de garantia";
		}

		await this.setState({
			refugo_retrabalho_txt: refugo_retrabalho_txt,
			custos_garantia_txt: custos_garantia_txt,
			refugo_retrabalho_label: refugo_retrabalho_label,
			custos_garantia_label: custos_garantia_label,
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
				processoId: this.state.perspectiva_id,

				refugo_retrabalho_previsao: this.state.refugo_retrabalho_meta,
				refugo_retrabalho_meta: this.state.refugo_retrabalho_label,
				custos_garantia_previsao: this.state.custos_garantia_meta,
				custos_garantia_meta: this.state.custos_garantia_label,
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

		const response = await Metas.postDefinicao("processos", "qualidade", data);
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
				`/hub/${id}/gestao/categoria/metas/processos/produtividade`
			);
		} else if (resource.includes(">>")) {
			this.props.history.push(
				`/hub/${id}/gestao/categoria/metas/processos/eficiencia`
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

	renderChartRefugo = () => {
		let graph = null;
		if (this.state.refugo_retrabalho_meta > 0) {
			graph = (
				<ComparativeChart
					data={[
						this.state.refugo_retrabalho,
						this.state.refugo_retrabalho_meta,
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

	renderChartGarantia = () => {
		let graph = null;
		if (this.state.refugo_retrabalho_meta > 0) {
			graph = (
				<ComparativeChart
					data={[this.state.custos_garantia, this.state.custos_garantia_meta]}
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

	tableMeta = () => {
		return (
			<div>
				<Row>
					<Col xs={12} sm={6} md={4} lg={3}>
						<CustomCard
							value={Generic.formatNumber(this.state.refugo_retrabalho) + "%"}
							color={"success"}
							title={"% Refugo / Produzido"}
							subtitle={"Exercício anterior"}
						/>
					</Col>
					<Col xs={12} sm={6} md={4} lg={3}>
						<CustomCard
							value={Generic.formatNumber(this.state.custos_garantia) + "%"}
							color={"success"}
							title={"% Custo Garantia / Faturamento"}
							subtitle={
								"Sobre a Receita Bruta de R$ " +
								Generic.formatNumber(this.state.receita_bruta_anterior) +
								" do exercício anterior"
							}
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
						label={"Sugestão de meta para refugo / retrabalho"}
						label_value={
							Generic.formatNumber(this.state.sugestao_refugo_retrabalho, 2) +
							"%"
						}
						fieldSugestao={"sugestao_refugo_retrabalho"}
						fieldMeta={"refugo_retrabalho_meta"}
						states={this.state}
						handleChange={this.handleChange}
					/>
					<CardMetaSugestao
						label={"Sugestão de meta para Custo Garantia / Faturamento"}
						label_value={
							Generic.formatNumber(this.state.sugestao_custos_garantia, 2) + "%"
						}
						fieldSugestao={"sugestao_custos_garantia"}
						fieldMeta={"custos_garantia_meta"}
						states={this.state}
						handleChange={this.handleChange}
					/>
				</div>
				<br />
				<Row>
					<Col xs={12} sm={6} md={4} lg={4}>
						<CustomCard
							value={
								Generic.formatNumber(this.state.refugo_retrabalho_meta, 2) + "%"
							}
							color={"info"}
							title={"Meta de Refugo / Retrabalho"}
							subtitle={this.state.refugo_retrabalho_txt}
							chart={this.renderChartRefugo()}
							dropdown={[
								{
									title: "Alterar",
									onClick: (e) =>
										this.toggleModal(
											e,
											"Defina a meta de refugo / retrabalho (em %)",
											this.state.refugo_retrabalho_meta,
											"refugo_retrabalho_meta"
										),
								},
							]}
						/>
					</Col>
					<Col xs={12} sm={6} md={4} lg={4}>
						<CustomCard
							value={
								Generic.formatNumber(this.state.custos_garantia_meta, 2) + "%"
							}
							color={"info"}
							title={"Meta de Custos Garantia / Faturamento"}
							subtitle={this.state.custos_garantia_txt}
							chart={this.renderChartGarantia()}
							dropdown={[
								{
									title: "Alterar",
									onClick: (e) =>
										this.toggleModal(
											e,
											"Defina a meta de refugo / retrabalho (em %)",
											this.state.custos_garantia_meta,
											"custos_garantia_meta"
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
				companyId={this.company.id}
				category={"Qualidade"}
				objectiveOptions={[
					{
						value: "GAQ",
						text: "Garantir altos níves de qualidade ",
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
						text: "Próximo",
						action: ">>",
						icon: "fa fa-arrow-right",
						content: "Eficiência",
						onClick: (e) => this.handlePageButton(e, ">>"),
					},
					{
						placement: "top",
						text: "Voltar",
						action: "<<",
						icon: "fa fa-arrow-left",
						content: "Produtividade",
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

export default Produtividade_Qualidade;
