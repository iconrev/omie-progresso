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

			capacidade_produtiva_meta: 0.0,
			capacidade_produtiva_label: 0.0,
			capacidade_produtiva_txt: "Meta não definida",

			eficiencia_operacional_meta: 0.0,
			eficiencia_operacional_label: 0.0,
			eficiencia_operacional_txt: "Meta não definida",
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

					await Metas.getDefinicao("processos", "eficiencia").then(
						async (result) => {
							let { metas } = result;
							metas = metas[this.state.exercicio_definido];

							const { status, outros_objetivos, objetivo } = metas;
							if (status === "success") {
								states = {
									...states,
									tipo_avaliacao: objetivo.tipo,
									descricao: objetivo.descricao,

									capacidade_produtiva_meta:
										objetivo.capacidade_produtiva_previsao,
									eficiencia_operacional_meta: objetivo.eficiencia_previsao,
								};
							}
							states = {
								...states,
								estrategias: result.estrategias_disponiveis,
								limiteEstrategias: result.limite_estrategias,
								estrategiasEscolhida: metas.estrategias_definidas,

								sugestao_capacidade_produtiva:
									outros_objetivos.sugestao_capacidade_produtiva,
								sugestao_eficiencia_operacional:
									outros_objetivos.sugestao_eficiencia_operacional,
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

	modalDialog = (key) => {
		let modal = null;

		if (this.state.showModalDialog) {
			modal = (
				<div key={key}>
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
		let capacidade_produtiva_txt, eficiencia_operacional_txt;
		let capacidade_produtiva_meta = this.state.capacidade_produtiva_meta;
		let capacidade_produtiva_label = 0.0;
		let capacidade_anterior = this.state.capacidade_produtiva;
		if (capacidade_produtiva_meta === 0) {
			capacidade_produtiva_txt = "Meta não definida";
		} else {
			capacidade_produtiva_label =
				(capacidade_produtiva_meta / capacidade_anterior - 1) * 100;
			capacidade_produtiva_txt =
				capacidade_produtiva_label > 0 ? "Melhoria" : "Piora";
			capacidade_produtiva_txt +=
				" de " +
				Generic.formatNumber(capacidade_produtiva_label) +
				"% em relação ao exerício anterior";
		}

		let eficiencia_operacional_meta = this.state.eficiencia_operacional_meta;
		let eficiencia_anterior = this.state.eficiencia_operacional;
		let eficiencia_operacional_label = 0.0;
		if (eficiencia_operacional_meta === 0) {
			eficiencia_operacional_txt = "Meta não definida";
		} else {
			eficiencia_operacional_label =
				(eficiencia_operacional_meta / eficiencia_anterior - 1) * 100;
			eficiencia_operacional_txt =
				eficiencia_operacional_meta > 0 ? "Melhoria" : "Piora";
			eficiencia_operacional_txt +=
				" de " +
				Generic.formatNumber(eficiencia_operacional_label) +
				"% em relação ao exerício anterior";
		}

		await this.setState({
			capacidade_produtiva_label: capacidade_produtiva_label,
			capacidade_produtiva_txt: capacidade_produtiva_txt,
			eficiencia_operacional_label: eficiencia_operacional_label,
			eficiencia_operacional_txt: eficiencia_operacional_txt,
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

				capacidade_produtiva_meta: this.state.capacidade_produtiva_label,
				capacidade_produtiva_previsao: this.state.capacidade_produtiva_meta,
				eficiencia_meta: this.state.eficiencia_operacional_label,
				eficiencia_previsao: this.state.eficiencia_operacional_meta,
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

		const response = await Metas.postDefinicao("processos", "eficiencia", data);
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
				`/hub/${id}/gestao/categoria/metas/processos/qualidade`
			);
		} else if (resource.includes(">>")) {
			this.props.history.push(
				`/hub/${id}/gestao/categoria/metas/processos/logistica`
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

	renderChartCapacidade = () => {
		let graph = null;
		if (this.state.capacidade_produtiva_meta > 0) {
			graph = (
				<ComparativeChart
					data={[
						this.state.capacidade_produtiva,
						this.state.capacidade_produtiva_meta,
					]}
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

	renderChartEficiencia = () => {
		let graph = null;
		if (this.state.eficiencia_operacional_meta > 0) {
			graph = (
				<ComparativeChart
					data={[
						this.state.eficiencia_operacional,
						this.state.eficiencia_operacional_meta,
					]}
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

	tableMeta = () => {
		return (
			<div>
				<Row>
					<Col xs={12} sm={6} md={4} lg={3}>
						<CustomCard
							value={
								Generic.formatNumber(this.state.capacidade_produtiva) + "%"
							}
							color={"success"}
							title={"Capacidade Produtiva"}
							subtitle={"Exercício anterior"}
						/>
					</Col>
					<Col xs={12} sm={6} md={4} lg={3}>
						<CustomCard
							value={
								Generic.formatNumber(this.state.eficiencia_operacional) + "%"
							}
							color={"success"}
							title={"Eficiência Operacional"}
							subtitle={"Exercício anterior"}
						/>
					</Col>
				</Row>
				<br />
				<div>
					<CardMetaSugestao
						label={"Sugestão de meta para Capacidade Produtiva"}
						label_value={
							Generic.formatNumber(
								this.state.sugestao_capacidade_produtiva,
								2
							) + "%"
						}
						fieldSugestao={"sugestao_capacidade_produtiva"}
						fieldMeta={"capacidade_produtiva_meta"}
						states={this.state}
						handleChange={this.handleChange}
					/>
					<CardMetaSugestao
						label={"Sugestão de meta para Eficiência Operacional"}
						label_value={
							Generic.formatNumber(
								this.state.sugestao_eficiencia_operacional,
								2
							) + "%"
						}
						fieldSugestao={"sugestao_eficiencia_operacional"}
						fieldMeta={"eficiencia_operacional_meta"}
						states={this.state}
						handleChange={this.handleChange}
					/>
				</div>
				<br />
				<Row>
					<Col xs={12} sm={6} md={4} lg={4}>
						<CustomCard
							value={
								Generic.formatNumber(this.state.capacidade_produtiva_meta, 2) +
								"%"
							}
							color={"info"}
							title={"Meta de Capacidade Produtiva"}
							subtitle={this.state.capacidade_produtiva_txt}
							chart={this.renderChartCapacidade()}
							dropdown={[
								{
									title: "Alterar",
									onClick: (e) =>
										this.toggleModal(
											e,
											"Defina a meta de Capacidade Produtiva (em %)",
											this.state.capacidade_produtiva_meta,
											"capacidade_produtiva_meta"
										),
								},
							]}
						/>
					</Col>
					<Col xs={12} sm={6} md={4} lg={4}>
						<CustomCard
							value={
								Generic.formatNumber(
									this.state.eficiencia_operacional_meta,
									2
								) + "%"
							}
							color={"info"}
							title={"Meta de Eficiência Operacional"}
							subtitle={this.state.eficiencia_operacional_txt}
							chart={this.renderChartEficiencia()}
							dropdown={[
								{
									title: "Alterar",
									onClick: (e) =>
										this.toggleModal(
											e,
											"Defina a meta de refugo / retrabalho (em %)",
											this.state.eficiencia_operacional_meta,
											"eficiencia_operacional_meta"
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
				category={"Eficiência"}
				objectiveOptions={[
					{
						value: "AEO",
						text: "Aumentar eficiência operacional",
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
						content: "Logística",
						onClick: (e) => this.handlePageButton(e, ">>"),
					},
					{
						placement: "top",
						text: "Voltar",
						action: "<<",
						icon: "fa fa-arrow-left",
						content: "QUalidade",
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
