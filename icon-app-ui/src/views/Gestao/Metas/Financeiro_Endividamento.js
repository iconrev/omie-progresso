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
import Number from "../../../components/Number";
import { toast } from "react-toastify";
import LoadingSpinner from "../../../components/LoadingSpinner";
import CardBaseMeta from "./Components/CardBaseMeta";
import CustomCard from "../../../components/CustomCard";
import ComparativeChart from "./Components/ComparativeChart";
import CompanyService from "../../../service/CompanyService";
import AmbienteInternoService from "../../../service/Diagnostico/AmbienteInterno";
import Metas from "../../../service/Metas";

class Financeiro_Endividamento extends Component {
	constructor(props) {
		super(props);

		this.company = CompanyService.getDataCompany();

		this.state = {
			isLoading: true,
			companyId: this.company.id,
			exercicio_definido: this.company.exercicioDefinido,

			hasChange: false,

			tipo_avaliacao: "UN",
			estrategiasEscolhida: [],

			receitaBruta: 0.0,
			lucroLiquido: 0.0,
			divida_prevista: 0.0,
			meta_reducao_divida: 0.0,
			meta_reducao_inadimplencia: 0.0,
			anos_divida: 0.0,
			inadimplencia_mensal_prevista: 0.0,
			inadimplencia_valor: 0.0,
			descricao: "",
		};
	}

	async componentDidMount() {
		await this.loadData();
		this.setState({
			isLoading: false,
		});
	}

	loadData = async () => {
		const id = this.state.companyId;
		const response = await AmbienteInternoService.getResourceInternoAvaliacao(
			"financeiro"
		);
		const { status, message } = response;

		if (status === "unauthorized") {
			console.warn("Usuário não possui acesso ao recurso financeiro");
			return this.props.history.push(
				`/hub/${id}/gestao/categoria/diagnostico/metas/financeiro`
			);
		}

		if (status !== "success") {
			toast.error(message);
			return this.props.history.push(
				`/hub/${id}/gestao/categoria/diagnostico/metas/financeiro`
			);
		}

		let { analise } = response;
		analise = analise[this.state.exercicio_definido];

		if (analise.status !== "success") {
			toast.error(analise.message);
			return this.props.history.push(
				`/hub/${id}/gestao/categoria/diagnostico/metas/financeiro`
			);
		}

		const inadimplencia = `R$ ${Generic.formatNumber(
			analise.inadimplencia_valor
		)} || ${Generic.formatNumber(analise.inadimplencia)}%`;

		await this.setState({
			dreId: analise.dre,
			taxa: analise.taxa,
			inadimplencia: analise.inadimplencia,
			inadimplencia_valor: analise.inadimplencia_valor,
			inadimplencia_info: inadimplencia,

			divida: analise.divida,
			showTableAvaliacao: true,
		});

		await Metas.getDefinicao("financeiro", "orcamento")
			.then(async (result) => {
				let { metas } = result;
				metas = metas[this.state.exercicio_definido];

				const { receita } = metas;
				await this.setState({
					receitaBruta: receita.meta || 0,
				});
			})
			.catch((err) => {
				console.error(err);
				toast.error("Não foi possível carregar alguns dados :(");
			});

		await Metas.getDefinicao("financeiro", "rentabilidade")
			.then(async (result) => {
				let { metas } = result;
				metas = metas[this.state.exercicio_definido];

				const { objetivo } = metas;
				await this.setState({
					lucroLiquido:
						(objetivo.rentabilidade_percentage * this.state.receitaBruta) / 100,
				});
			})
			.catch((err) => {
				console.error(err);
				toast.error("Não foi possível carregar alguns dados :(");
			});

		await Metas.getDefinicao("financeiro", "endividamento")
			.then(async (result) => {
				let { metas } = result;
				metas = metas[this.state.exercicio_definido];

				const { status, objetivos } = metas;

				if (status === "success") {
					await this.setState({
						tipo_avaliacao: objetivos.tipo,
						descricao: objetivos.descricao,
						meta_reducao_divida: objetivos.meta_reducao_divida,
						meta_reducao_inadimplencia: objetivos.meta_reducao_inadimplencia,
					});

					await this.atualizarCamposCalculaveis(objetivos.meta_reducao_divida);
					await this.atualizarInadimplencia(
						objetivos.meta_reducao_inadimplencia
					);
				}
				await this.setState({
					estrategias: result.estrategias_disponiveis,
					limiteEstrategias: result.limite_estrategias,
					estrategiasEscolhida: metas.estrategias_definidas,
				});
			})
			.catch((err) => {
				console.error(err);
				toast.error("Não foi possível carregar alguns dados :(");
			});
	};

	atualizarCamposCalculaveis = async (percentualDivida) => {
		let divida = percentualDivida;
		if (typeof divida === "string") {
			divida = Generic.convertStringToFloat(percentualDivida);
		}
		divida = this.state.divida - (this.state.divida / 100) * divida;
		let anos = divida / this.state.lucroLiquido;
		await this.setState({
			divida_prevista: divida,
			anos_divida: anos,
		});
	};

	atualizarInadimplencia = async (percentualInadimplencia) => {
		let perc = percentualInadimplencia;
		if (typeof percentualInadimplencia === "string") {
			perc = Generic.convertStringToFloat(percentualInadimplencia);
		}
		let inadimplencia = ((this.state.receitaBruta / 12) * perc) / 100;
		await this.setState({
			inadimplencia_mensal_prevista: inadimplencia,
		});
	};

	handleChange = async (event) => {
		let field = event.target.id;
		let value = event.target.value;

		if (field.includes("meta_reducao_divida")) {
			await this.atualizarCamposCalculaveis(value);
		}

		if (field.includes("meta_reducao_inadimplencia")) {
			await this.atualizarInadimplencia(value);
		}

		await this.setState({
			[field]: value,
			hasChange: true,
		});
	};

	handleSaveButton = async (e, callback, showConfirmation = true) => {
		e.preventDefault();
		if (!this.state.hasChange) {
			if (showConfirmation) toast.success("Dados atualizados com sucesso");
			return;
		}

		let data = {
			objetivo: {
				dreId: this.state.dreId,
				tipo: this.state.tipo_avaliacao,
				descricao: this.state.descricao,
				meta_reducao_divida: this.state.meta_reducao_divida,
				meta_reducao_inadimplencia: this.state.meta_reducao_inadimplencia,
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

		await Metas.postDefinicao("financeiro", "endividamento", data)
			.then((result) => {
				if (showConfirmation) {
					toast.success(result.message);
				}
				return true;
			})
			.catch((err) => {
				console.error(err.response.data);
				if (showConfirmation) toast.error(err.response.data.message);
				return false;
			});
	};

	handlePageButton = async (e, resource) => {
		e.preventDefault();
		let id = this.state.companyId;
		if (resource.includes("<<")) {
			this.props.history.push(
				`/hub/${id}/gestao/categoria/metas/financeiro/orcamento`
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
		await this.handleChange({
			target: {
				id: campo,
				value: valor,
			},
		});
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

	renderChartReducaoDivida = () => {
		let graph = null;
		if (this.state.meta_reducao_divida > 0) {
			graph = (
				<ComparativeChart
					data={[this.state.divida, this.state.divida_prevista]}
					years={[
						(this.state.exercicio_definido - 1).toString(),
						this.state.exercicio_definido.toString(),
					]}
					typeChart={"R$"}
					// scaleMax={100}
				/>
			);
		}
		return graph;
	};

	renderChartReducaoInadimplencia = () => {
		let graph = null;
		if (this.state.meta_reducao_inadimplencia > 0) {
			graph = (
				<ComparativeChart
					data={[
						this.state.inadimplencia_valor,
						this.state.inadimplencia_mensal_prevista,
					]}
					years={[
						(this.state.exercicio_definido - 1).toString(),
						this.state.exercicio_definido.toString(),
					]}
					typeChart={"R$"}
					// scaleMax={100}
				/>
			);
		}
		return graph;
	};

	tableMeta = () => {
		let txtDividaPrevista =
			"Dívida prevista em R$ " +
			Generic.formatNumber(this.state.divida_prevista, 2);
		let txtInadimplenciaPrevista =
			"Inadimplência mensal prevista em R$ " +
			Generic.formatNumber(this.state.inadimplencia_mensal_prevista, 2);

		return (
			<div>
				<Row>
					<Col xs={12} sm={6} md={4} lg={3}>
						<CustomCard
							value={"R$ " + Generic.formatNumber(this.state.divida)}
							color={"success"}
							title={"Dívida Total"}
							subtitle={"Exercício anterior"}
						/>
					</Col>
					<Col xs={12} sm={6} md={4} lg={3}>
						<CustomCard
							value={
								"R$ " + Generic.formatNumber(this.state.inadimplencia_valor)
							}
							color={"success"}
							title={"Inadimplência Mensal"}
							subtitle={"Exercício anterior"}
						/>
					</Col>
				</Row>
				<Row>
					<Col xs={12} sm={6} md={4} lg={3}>
						<CustomCard
							value={"R$ " + Generic.formatNumber(this.state.receitaBruta)}
							color={"info"}
							title={"Receita Bruta Prevista"}
							subtitle={"Defindo em Receitas"}
						/>
					</Col>
					<Col xs={12} sm={6} md={4} lg={3}>
						<CustomCard
							value={"R$ " + Generic.formatNumber(this.state.lucroLiquido)}
							color={"info"}
							title={"Meta de Lucro Líquido"}
							subtitle={"Defindo em Rentabilidade"}
						/>
					</Col>
				</Row>
				<br />
				<div>{/* AQUI VAI AS SUGESTÕES */}</div>
				<br />
				<Row>
					<Col xs={12} sm={6} md={4} lg={4}>
						<CustomCard
							value={
								Generic.formatNumber(this.state.meta_reducao_divida, 2) + "%"
							}
							color={"info"}
							title={"Meta de Redução da dívida"}
							subtitle={txtDividaPrevista}
							chart={this.renderChartReducaoDivida()}
							dropdown={[
								{
									title: "Alterar",
									onClick: (e) =>
										this.toggleModal(
											e,
											"Defina a meta para redução da dívida (em %)",
											this.state.meta_reducao_divida,
											"meta_reducao_divida"
										),
								},
							]}
						/>
					</Col>
					<Col xs={12} sm={6} md={4} lg={4}>
						<CustomCard
							value={
								Generic.formatNumber(this.state.meta_reducao_inadimplencia, 2) +
								"%"
							}
							color={"info"}
							title={"Meta de Inadimplência Mensal"}
							subtitle={txtInadimplenciaPrevista}
							chart={this.renderChartReducaoInadimplencia()}
							dropdown={[
								{
									title: "Alterar",
									onClick: (e) =>
										this.toggleModal(
											e,
											"Defina a meta para inadimplência (em %)",
											this.state.meta_reducao_inadimplencia,
											"meta_reducao_inadimplencia"
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
				category={"Endividamento"}
				objectiveOptions={[
					{
						value: "NS",
						text: "Manter endividamento em nível sustentável",
					},
				]}
				objectiveSelected={this.state.tipo_avaliacao}
				objectiveHandle={this.handleChange}
				objectiveDescription={this.state.descricao}
				estrategias={{
					options: this.state.estrategias,
					estrategiasEscolhida: this.state.estrategiasEscolhida,
					limite: this.state.limiteEstrategias,
				}}
				cardMeta={this.tableMeta()}
				buttons={[
					{
						placement: "top",
						text: "Início",
						action: ">>",
						icon: "fa fa-align-justify",
						content: "Metas",
						onClick: (e) => this.handlePageButton(e, ">>"),
					},
					{
						placement: "top",
						text: "Anterior",
						action: "<<",
						icon: "fa fa-arrow-left",
						content: "Orçamento",
						onClick: (e) => this.handlePageButton(e, "<<"),
					},
				]}
				buttonsave={true}
				save={this.handleSaveButton}
				modal={[this.modalEdit]}
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

export default Financeiro_Endividamento;
