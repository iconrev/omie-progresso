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
import Number from "../../../components/Number";
import CardBaseMeta from "./Components/CardBaseMeta";
import CardMetaSugestao from "./Components/CardMetaSugestao";
import LoadingSpinner from "../../../components/LoadingSpinner";
import { toast } from "react-toastify";
import Generic from "../../Utils/Generic";
import CustomCard from "../../../components/CustomCard";
import ComparativeChart from "./Components/ComparativeChart";
import CompanyService from "../../../service/CompanyService";
import AmbienteInternoService from "../../../service/Diagnostico/AmbienteInterno";
import Metas from "../../../service/Metas";

class Vendas_Satisfacao_ClientesForm extends Component {
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
			showTableAvaliacao: false,
			showModalDialog: false,
			ano_exercicio: 2019,
			estrategiasEscolhida: [],
			limiteEstrategias: 3,
			estrategias: [],
			modalEdit: false,

			vendas_id: 0,

			base_clientes: 0.0,
			clientes_perdidos_anterior: 0.0,
			clientes_perdidos_anterior_perc: 0.0,
			notas_fiscais_emitidas_anterior: 0.0,
			taxa_reclamacao_nf_anterior: 0.0,
			numero_reclamacoes: 0.0,

			base_clientes_previsto: 0.0,
			meta_novos_clientes: 0.0,

			previsao_emissao_nf: 0.0,
			previsao_emissao_nf_perc: 0.0,

			sugestao_clientes_perdidos: 0.0,
			sugestao_reclamacao_nf: 0.0,

			meta_clientes_perdidos: 0.0,
			meta_clientes_perdidos_txt: "",
			meta_clientes_perdidos_label: 0.0,

			meta_reclamacao_nf: 0.0,
			meta_reclamacao_nf_txt: "",
			meta_reclamacao_nf_label: 0.0,

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
					const { vendas } = analise;

					await this.setState({
						vendas_id: vendas.id,
						ano_exercicio: vendas.ano_exercicio,
						clientes_perdidos_anterior: vendas.clientes_perdidos,
						base_clientes_anterior: vendas.base_clientes,
						notas_fiscais_emitidas_anterior: vendas.notas_fiscais_emitidas,
						taxa_reclamacao_nf_anterior: analise.taxa_reclamacao_nf,
						numero_reclamacoes: vendas.reclamacoes_clientes,
					});

					await Metas.getDefinicao("comercial", "satisfacao").then(
						async (result) => {
							let { metas } = result;
							metas = metas[this.state.exercicio_definido];

							const { status, objetivo, outros_objetivos } = metas;

							if (status === "objectives_not_found") {
								await this.setState({
									isLoading: false,
									showModalDialog: true,
									messageDialog:
										"Ainda não foi preenchido os dados referente as Metas Financeiras desta empresa. Vamos começar por lá?",
									linkDialog: `/hub/${this.state.companyId}/gestao/categoria/metas/financeiro`,
								});
							} else {
								if (status === "success") {
									await this.setState({
										meta_clientes_perdidos: objetivo.meta_clientes_perdidos,
										meta_reclamacao_nf: objetivo.meta_reclamacao_nf,

										tipo_avaliacao: objetivo.tipo,
										descricao: objetivo.descricao,
									});
								}

								await this.setState({
									estrategias: result.estrategias_disponiveis,
									limiteEstrategias: result.limite_estrategias,
									estrategiasEscolhida: metas.estrategias_definidas,

									base_clientes_previsto:
										outros_objetivos.base_clientes_previsto,
									meta_novos_clientes: outros_objetivos.meta_novos_clientes,
									previsao_emissao_nf: outros_objetivos.previsao_emissao_nf,
									sugestao_clientes_perdidos:
										outros_objetivos.sugestao_clientes_perdidos,
									sugestao_reclamacao_nf:
										outros_objetivos.sugestao_reclamacao_nf,
								});

								await this.updateFields();
							}
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
		let meta_reclamacao_nf_txt;

		const reclamacao_anterior = this.state.taxa_reclamacao_nf_anterior;
		const meta_reclamacao_nf = this.state.meta_reclamacao_nf;
		let meta_reclamacao_nf_label =
			reclamacao_anterior -
			(1 - meta_reclamacao_nf / 100) * reclamacao_anterior;
		if (meta_reclamacao_nf_label === 0) {
			meta_reclamacao_nf_txt = "Meta não definida";
		} else {
			meta_reclamacao_nf_label = reclamacao_anterior - meta_reclamacao_nf_label;
			meta_reclamacao_nf_txt =
				meta_reclamacao_nf_label > 0 ? "Redução" : "Aumento";
			meta_reclamacao_nf_txt =
				meta_reclamacao_nf_txt +
				" de " +
				Generic.formatNumber(this.state.meta_reclamacao_nf) +
				"% em relação ao exercício anterior";
		}

		this.setState({
			meta_reclamacao_nf_txt: meta_reclamacao_nf_txt,
			meta_reclamacao_nf_label: meta_reclamacao_nf_label,
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
				vendasId: this.state.vendas_id,
				meta_reclamacao_nf: this.state.meta_reclamacao_nf,
				meta_reclamacao_nf_previsto: this.state.meta_reclamacao_nf_label,
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

		const response = await Metas.postDefinicao("comercial", "satisfacao", data);
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
				`/hub/${id}/gestao/categoria/metas/comercial/relacionamento`
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
		if (this.state.meta_reclamacao_nf_label > 0) {
			graph = (
				<ComparativeChart
					data={[
						this.state.taxa_reclamacao_nf_anterior,
						this.state.meta_reclamacao_nf_label,
					]}
					years={["2019", "2020"]}
					typeChart={"%"}
					// scaleMax={this.state.taxa_reclamacao_nf_anterior}
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
								Generic.formatNumber(this.state.taxa_reclamacao_nf_anterior) +
								"%"
							}
							color={"info"}
							title={"Taxa de Reclamação por NF no Exercício Anterior"}
							subtitle={
								"Corresponde a " +
								Generic.formatNumber(this.state.numero_reclamacoes, 0) +
								" reclamações recebidas"
							}
						/>
					</Col>
				</Row>
				<br />
				<CardMetaSugestao
					label={"Sugestão de redução de Reclamação por NF"}
					label_value={
						Generic.formatNumber(this.state.sugestao_reclamacao_nf, 2) + "%"
					}
					fieldSugestao={"sugestao_reclamacao_nf"}
					fieldMeta={"meta_reclamacao_nf"}
					states={this.state}
					handleChange={this.handleChange}
				/>
				<br />
				<Row>
					<Col xs={12} sm={6} md={6} lg={4}>
						<CustomCard
							value={
								Generic.formatNumber(this.state.meta_reclamacao_nf_label, 2) +
								"%"
							}
							color={"success"}
							title={"Meta de Reclamações Recebidas"}
							subtitle={this.state.meta_reclamacao_nf_txt}
							chart={this.renderChart()}
							dropdown={[
								{
									title: "Alterar",
									onClick: (e) =>
										this.toggleModal(
											e,
											"Defina a meta de redução de reclamações recebidas (em %)",
											this.state.meta_reclamacao_nf,
											"meta_reclamacao_nf"
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
				category={"Satisfação"}
				objectiveOptions={[
					{
						value: "PVC",
						text: "Aumentar percepção de valor do cliente",
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
						content: "Relacionamento",
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

export default Vendas_Satisfacao_ClientesForm;
