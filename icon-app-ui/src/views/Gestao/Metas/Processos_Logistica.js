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

class Produtividade_Eficiencia extends Component {
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

			entregas_prazo_meta: 0.0,
			entregas_prazo_label: 0.0,
			entregas_prazo_txt: "Meta não definida",

			valor_estoque_meta: 0.0,
			valor_estoque_label: 0.0,
			valor_estoque_txt: "Meta não definida",

			giro_estoque_meta: 0.0,
			giro_estoque_label: 0.0,
			giro_estoque_txt: "Meta não definida",
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
					states["custos_garantia"] = analise.processos.custos_garantia;
					states["capacidade_produtiva"] = analise.capacidade_produtiva;
					states["eficiencia_operacional"] = analise.eficiencia_operacional;
					states["entregas_no_prazo"] = analise.processos.entregas_no_prazo;
					states["quantidade_giro_estoque"] = analise.quantidade_giro_estoque;
					states["valor_do_estoque"] = analise.processos.valor_do_estoque;

					await Metas.getDefinicao("processos", "logistica").then(
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

									entregas_prazo_meta: objetivo.entrega_prazo_previsao,
									valor_estoque_meta: objetivo.valor_estoque_previsao,
								};
							}
							states = {
								...states,
								estrategias: result.estrategias_disponiveis,
								limiteEstrategias: result.limite_estrategias,
								estrategiasEscolhida: metas.estrategias_definidas,

								receita_bruta_prevista: meta_receitas.meta,

								sugestao_entregas_prazo:
									outros_objetivos.sugestao_entregas_prazo,
								sugestao_valor_estoque: outros_objetivos.sugestao_valor_estoque,
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
		let entregas_prazo_txt,
			valor_estoque_txt,
			giro_estoque_txt = "Meta não definida";

		let entregas_prazo_meta = this.state.entregas_prazo_meta;
		let entregas_anterior = this.state.entregas_no_prazo;
		let entregas_prazo_label = 0.0;
		if (entregas_prazo_meta === 0) {
			entregas_prazo_txt = "Meta não definida";
		} else {
			entregas_prazo_label =
				(entregas_prazo_meta / entregas_anterior - 1) * 100;
			entregas_prazo_txt = entregas_prazo_label > 0 ? "Melhoria" : "Piora";
			entregas_prazo_txt +=
				" de " +
				Generic.formatNumber(entregas_prazo_label) +
				"% em relação ao exerício anterior";
		}

		let receitaBrutaPrevista = this.state.receita_bruta_prevista;
		let giro_estoque_label = 0.0;
		let giro_estoque_meta = 0.0;

		let valor_estoque_meta = this.state.valor_estoque_meta;
		let estoque_anterior = this.state.valor_do_estoque;
		let valor_estoque_label = 0.0;
		if (valor_estoque_meta === 0) {
			valor_estoque_txt = "Meta não definida";
		} else {
			valor_estoque_label = (valor_estoque_meta / estoque_anterior - 1) * 100;

			if (valor_estoque_meta === estoque_anterior) {
				valor_estoque_txt = "Manutenção da rotatividade do exercício anterior";
			} else {
				valor_estoque_txt = valor_estoque_label > 0 ? "Aumento" : "Redução";
				valor_estoque_txt +=
					" de " +
					Generic.formatNumber(valor_estoque_label) +
					"% em relação ao exerício anterior";
			}

			let giro_estoque_anterior = this.state.quantidade_giro_estoque;
			giro_estoque_label = receitaBrutaPrevista / valor_estoque_meta;
			let giro_anterior_arr = Generic.formatNumber(giro_estoque_anterior);
			let giro_novo_arr = Generic.formatNumber(giro_estoque_label);

			if (giro_anterior_arr === giro_novo_arr) {
				giro_estoque_txt = "Manutenção da rotatividade do exercício anterior";
			} else {
				giro_estoque_meta =
					(giro_estoque_label / giro_estoque_anterior - 1) * 100;

				giro_estoque_txt =
					giro_novo_arr > giro_anterior_arr ? "Aumento" : "Redução";
				giro_estoque_txt +=
					" de " +
					Generic.formatNumber(giro_estoque_meta) +
					"% em relação ao exerício anterior";
			}
		}

		await this.setState({
			entregas_prazo_txt: entregas_prazo_txt,
			entregas_prazo_label: entregas_prazo_label,
			valor_estoque_txt: valor_estoque_txt,
			valor_estoque_label: valor_estoque_label,
			giro_estoque_label: giro_estoque_label,
			giro_estoque_txt: giro_estoque_txt,
			giro_estoque_meta: giro_estoque_meta,
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

				entrega_prazo_meta: this.state.entregas_prazo_label,
				entrega_prazo_previsao: this.state.entregas_prazo_meta,
				valor_estoque_meta: this.state.valor_estoque_label,
				valor_estoque_previsao: this.state.valor_estoque_meta,
				giro_estoque_meta: this.state.giro_estoque_meta,
				giro_estoque_previsao: this.state.giro_estoque_label,
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

		const response = await Metas.postDefinicao("processos", "logistica", data);
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
				`/hub/${id}/gestao/categoria/metas/processos/eficiencia`
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

	renderChartEntrega = () => {
		let graph = null;
		if (this.state.entregas_prazo_meta > 0) {
			graph = (
				<ComparativeChart
					data={[this.state.entregas_no_prazo, this.state.entregas_prazo_meta]}
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

	renderChartValorEstoque = () => {
		let graph = null;
		if (this.state.valor_estoque_meta > 0) {
			graph = (
				<ComparativeChart
					data={[this.state.valor_do_estoque, this.state.valor_estoque_meta]}
					years={[
						(this.state.exercicio_definido - 1).toString(),
						this.state.exercicio_definido.toString(),
					]}
					typeChart={"R$"}
					decimals={2}
					beginAtZero={false}
				/>
			);
		}
		return graph;
	};

	renderChartGiro = () => {
		let graph = null;
		if (this.state.giro_estoque_label > 0) {
			graph = (
				<ComparativeChart
					data={[
						this.state.quantidade_giro_estoque,
						this.state.giro_estoque_label,
					]}
					years={[
						(this.state.exercicio_definido - 1).toString(),
						this.state.exercicio_definido.toString(),
					]}
					decimals={2}
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
							value={Generic.formatNumber(this.state.entregas_no_prazo) + "%"}
							color={"success"}
							title={"Entregas no Prazo"}
							subtitle={"Exercício anterior"}
						/>
					</Col>
					<Col xs={12} sm={6} md={4} lg={3}>
						<CustomCard
							value={"R$ " + Generic.formatNumber(this.state.valor_do_estoque)}
							color={"success"}
							title={"Valor do Estoque"}
							subtitle={"Exercício anterior"}
						/>
					</Col>
					<Col xs={12} sm={6} md={4} lg={3}>
						<CustomCard
							value={Generic.formatNumber(this.state.quantidade_giro_estoque)}
							color={"success"}
							title={"Quantidade de Giro de Estoque"}
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
						label={"Sugestão de meta para Entregas no Prazo"}
						label_value={
							Generic.formatNumber(this.state.sugestao_entregas_prazo, 2) + "%"
						}
						fieldSugestao={"sugestao_entregas_prazo"}
						fieldMeta={"entregas_prazo_meta"}
						states={this.state}
						handleChange={this.handleChange}
					/>
					<CardMetaSugestao
						label={"Sugestão de meta para Valor do Estoque"}
						label_value={
							"R$ " + Generic.formatNumber(this.state.sugestao_valor_estoque, 2)
						}
						fieldSugestao={"sugestao_valor_estoque"}
						fieldMeta={"valor_estoque_meta"}
						states={this.state}
						handleChange={this.handleChange}
					/>
				</div>
				<br />
				<Row>
					<Col xs={12} sm={6} md={4} lg={4}>
						<CustomCard
							value={
								Generic.formatNumber(this.state.entregas_prazo_meta, 2) + "%"
							}
							color={"info"}
							title={"Meta de Entregas no Prazo"}
							subtitle={this.state.entregas_prazo_txt}
							chart={this.renderChartEntrega()}
							dropdown={[
								{
									title: "Alterar",
									onClick: (e) =>
										this.toggleModal(
											e,
											"Defina a meta de Entregas no Prazo (em %)",
											this.state.entregas_prazo_meta,
											"entregas_prazo_meta"
										),
								},
							]}
						/>
					</Col>
					<Col xs={12} sm={6} md={4} lg={4}>
						<CustomCard
							value={
								"R$ " + Generic.formatNumber(this.state.valor_estoque_meta, 2)
							}
							color={"info"}
							title={"Valor de Estoque"}
							subtitle={this.state.valor_estoque_txt}
							chart={this.renderChartValorEstoque()}
							dropdown={[
								{
									title: "Alterar",
									onClick: (e) =>
										this.toggleModal(
											e,
											"Defina a meta de Valor de Estoque (em R$)",
											this.state.valor_estoque_meta,
											"valor_estoque_meta"
										),
								},
							]}
						/>
					</Col>
					<Col xs={12} sm={6} md={4} lg={4}>
						<CustomCard
							value={Generic.formatNumber(this.state.giro_estoque_label, 2)}
							color={"info"}
							chart={this.renderChartGiro()}
							title={"Previsão de Giro de Estoque"}
							subtitle={this.state.giro_estoque_txt}
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
				category={"Logística"}
				objectiveOptions={[
					{
						value: "OL",
						text: "Otimizar logística e estoques",
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
						content: "Menu",
						onClick: (e) => this.handlePageButton(e, ">>"),
					},
					{
						placement: "top",
						text: "Voltar",
						action: "<<",
						icon: "fa fa-arrow-left",
						content: "Logística",
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

export default Produtividade_Eficiencia;
