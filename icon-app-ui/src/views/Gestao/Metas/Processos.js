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

class Produtividade extends Component {
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

			receita_bruta_anterior: 0,
			receita_bruta_custo_folha: 0,
			quantidade_entregue_funcionarios: 0,
			volume_produzido_no_ano: 0,
			funcionarios: 0,
			custo_folha: 0,

			receita_bruta_prevista: 0,
			receita_bruta_prevista_perc: 0,
			custo_folha_previsto: 0,

			sugestao_quantidade_entregue_funcionarios: 0,
			sugestao_receita_bruta_custo_folha: 0,

			quantidade_entregue_funcionarios_meta: 0,
			quantidade_entregue_funcionarios_label: 0,
			quantidade_entregue_funcionarios_txt: "Meta não definida",
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

				// const {status} = analise;
				let states = {};

				states["perspectiva_id"] = analise.processos.id;
				states["receita_bruta_anterior"] = analise.receita_bruta;
				states["receita_bruta_custo_folha"] = analise.receita_bruta_custo_folha;
				states["quantidade_entregue_funcionarios"] =
					analise.quantidade_entregue_funcionarios;
				states["volume_produzido_no_ano"] =
					analise.processos.volume_produzido_no_ano;
				states["funcionarios"] = analise.processos.funcionarios;
				states["custo_folha"] = analise.custo_folha;

				await Metas.getDefinicao("processos", "produtividade").then(
					async (result) => {
						let { metas } = result;
						metas = metas[this.state.exercicio_definido];

						const { status, meta_receitas, outros_objetivos, objetivo } = metas;
						if (status === "success") {
							states = {
								...states,
								tipo_avaliacao: objetivo.tipo,
								descricao: objetivo.descricao,

								quantidade_entregue_funcionarios_meta:
									objetivo.quantidade_entregue_funcionarios_meta,
								estrategiasEscolhida: metas.estrategias_definidas,
							};
						}
						states = {
							...states,
							estrategias: result.estrategias_disponiveis,
							limiteEstrategias: result.limite_estrategias,

							receita_bruta_prevista: meta_receitas.meta,
							receita_bruta_prevista_perc: meta_receitas.percentage,
							despesas_com_pessoal: meta_receitas.despesas_com_pessoal,

							sugestao_quantidade_entregue_funcionarios:
								outros_objetivos.sugestao_quantidade_entregue_funcionarios,
							sugestao_receita_bruta_custo_folha:
								outros_objetivos.sugestao_receita_bruta_custo_folha,
						};
					}
				);

				await this.setState({
					...states,
				});
				await this.updateFields();
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
		let quantidade_entregue_funcionarios_meta =
			this.state.quantidade_entregue_funcionarios_meta / 100;
		let quantidade_entregue_funcionarios_label =
			this.state.quantidade_entregue_funcionarios *
			quantidade_entregue_funcionarios_meta;
		let quantidade_entregue_funcionarios_txt = "Meta não definida";
		if (quantidade_entregue_funcionarios_label !== 0) {
			quantidade_entregue_funcionarios_txt =
				quantidade_entregue_funcionarios_label > 0 ? "Aumento" : "Redução";
			quantidade_entregue_funcionarios_txt +=
				" de " +
				Generic.formatNumber(this.state.quantidade_entregue_funcionarios_meta) +
				"% em relação ao exercício anterior";
			quantidade_entregue_funcionarios_label +=
				this.state.quantidade_entregue_funcionarios;
		}

		await this.setState({
			quantidade_entregue_funcionarios_txt:
				quantidade_entregue_funcionarios_txt,
			quantidade_entregue_funcionarios_label:
				quantidade_entregue_funcionarios_label,
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
				quantidade_entregue_funcionarios_meta:
					this.state.quantidade_entregue_funcionarios_meta,
				quantidade_entregue_funcionarios_previsto:
					this.state.quantidade_entregue_funcionarios_label,
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

		const response = await Metas.postDefinicao(
			"processos",
			"produtividade",
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

	handlePageButton = async (e, resource) => {
		e.preventDefault();
		let id = this.state.companyId;
		if (resource.includes("<<")) {
			this.props.history.push(`/hub/${id}/gestao/categoria/metas`);
		} else if (resource.includes(">>")) {
			this.props.history.push(
				`/hub/${id}/gestao/categoria/metas/processos/qualidade`
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

	renderChartReceitaCusto = () => {
		let graph = null;
		if (this.state.sugestao_receita_bruta_custo_folha > 0) {
			graph = (
				<ComparativeChart
					data={[
						this.state.receita_bruta_custo_folha,
						this.state.sugestao_receita_bruta_custo_folha,
					]}
					years={[
						(this.state.exercicio_definido - 1).toString(),
						this.state.exercicio_definido.toString(),
					]}
				/>
			);
		}
		return graph;
	};

	renderChartEntregaFuncionario = () => {
		let graph = null;
		if (this.state.quantidade_entregue_funcionarios_meta > 0) {
			graph = (
				<ComparativeChart
					data={[
						this.state.quantidade_entregue_funcionarios,
						this.state.quantidade_entregue_funcionarios_label,
					]}
					years={[
						(this.state.exercicio_definido - 1).toString(),
						this.state.exercicio_definido.toString(),
					]}
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
								"R$ " + Generic.formatNumber(this.state.receita_bruta_anterior)
							}
							color={"success"}
							title={"Receita Bruta"}
							subtitle={"Exercício anterior"}
						/>
					</Col>
					<Col xs={12} sm={6} md={4} lg={3}>
						<CustomCard
							value={Generic.formatNumber(this.state.receita_bruta_custo_folha)}
							color={"success"}
							title={"Receita Bruta / Custo de Pessoal"}
							subtitle={
								"Considerando R$ " +
								Generic.formatNumber(this.state.custo_folha) +
								" com despesas de pessoal"
							}
						/>
					</Col>
					<Col xs={12} sm={6} md={4} lg={3}>
						<CustomCard
							value={Generic.formatNumber(
								this.state.quantidade_entregue_funcionarios
							)}
							color={"success"}
							title={"Entregas por Funcionário"}
							subtitle={
								"Considerando " +
								this.state.volume_produzido_no_ano +
								" entregas do exercício anterior"
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
					<Col xs={12} sm={6} md={4} lg={3}>
						<CustomCard
							value={
								"R$ " + Generic.formatNumber(this.state.despesas_com_pessoal, 2)
							}
							color={"info"}
							title={"Previsão de Despesas com Pessoal"}
							subtitle={"Definido em Financeiro"}
						/>
					</Col>
				</Row>
				<br />
				<div>
					<CardMetaSugestao
						label={
							"Sugestão para aumento no número de Entregas por Funcionário"
						}
						label_value={
							Generic.formatNumber(
								this.state.sugestao_quantidade_entregue_funcionarios,
								2
							) + "%"
						}
						fieldSugestao={"sugestao_quantidade_entregue_funcionarios"}
						fieldMeta={"quantidade_entregue_funcionarios_meta"}
						states={this.state}
						handleChange={this.handleChange}
					/>
				</div>
				<br />
				<Row>
					<Col xs={12} sm={6} md={4} lg={4}>
						<CustomCard
							value={Generic.formatNumber(
								this.state.sugestao_receita_bruta_custo_folha,
								2
							)}
							color={"info"}
							title={"Meta de Receita Bruta / Custo de Pessoal"}
							subtitle={
								"Valor calculado automaticamente considerando a meta financeira"
							}
							chart={this.renderChartReceitaCusto()}
						/>
					</Col>
					<Col xs={12} sm={6} md={4} lg={4}>
						<CustomCard
							value={Generic.formatNumber(
								this.state.quantidade_entregue_funcionarios_label,
								2
							)}
							color={"info"}
							title={"Meta de Entrega por Funcionário"}
							subtitle={this.state.quantidade_entregue_funcionarios_txt}
							chart={this.renderChartEntregaFuncionario()}
							dropdown={[
								{
									title: "Alterar",
									onClick: (e) =>
										this.toggleModal(
											e,
											"Defina a meta de aumento de entrega por funcionário (em %)",
											this.state.quantidade_entregue_funcionarios_meta,
											"quantidade_entregue_funcionarios_meta"
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
				category={"Produtividade"}
				objectiveOptions={[
					{
						value: "APP",
						text: "Aumentar produtividade",
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
						content: "Qualidade",
						onClick: (e) => this.handlePageButton(e, ">>"),
					},
					{
						placement: "top",
						text: "Voltar",
						action: "<<",
						icon: "fa fa-align-justify",
						content: "Metas",
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

export default Produtividade;
