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
import LoadingSpinner from "../../../components/LoadingSpinner";
import CardBaseMeta from "./Components/CardBaseMeta";
import { toast } from "react-toastify";
import CustomCard from "../../../components/CustomCard";
import ComparativeChart from "./Components/ComparativeChart";
import CompanyService from "../../../service/CompanyService";
import AmbienteInternoService from "../../../service/Diagnostico/AmbienteInterno";
import Metas from "../../../service/Metas";

class Financeiro_Rentabilidade extends Component {
	constructor(props) {
		super(props);

		this.company = CompanyService.getDataCompany();

		this.state = {
			isLoading: true,
			companyId: this.company.id,
			exercicio_definido: this.company.exercicioDefinido,

			hasChange: false,

			showTableAvaliacao: false,
			estrategiasEscolhida: [],

			// VALORES
			ano_exercicio: this.company.exercicioDefinido,

			receitaBrutaPrevista: 0,

			rentabilidadeAnterior: 0,
			rentabilidadeAnteriorValor: 0,
			ebitdaAnterior: 0,
			ebitdaAnterioValor: 0,

			meta_rentabilidade: 0,
			meta_rentabilidade_label: 0,
			meta_rentabilidade_txt: "",

			meta_ebitda: 0,
			meta_ebitda_label: 0,
			meta_ebitda_txt: 0,

			descricao: "",
			tipo_avaliacao: "UN",
			rentabilidade_info: "",
			ebitda_info: "",
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

		await this.setState({
			rentabilidadeAnterior: analise.rentabilidade,
			rentabilidadeAnteriorValor:
				(analise.rentabilidade / 100) * analise.receita_bruta,
			ebitdaAnterior: analise.ebitda_percentage,
			ebitdaAnteriorValor: analise.ebitda,

			dreId: analise.dre,
		});

		await Metas.getDefinicao("financeiro", "faturamento")
			.then((result) => {
				let { metas } = result;
				metas = metas[this.state.exercicio_definido];

				const { objetivo } = metas;
				this.setState({
					receitaBrutaPrevista: objetivo.meta,
				});
			})
			.catch((err) => {
				console.error(err);
				toast.error("Não foi possível carregar alguns dados :(");
			});

		await Metas.getDefinicao("financeiro", "rentabilidade")
			.then((result) => {
				let { metas } = result;
				metas = metas[this.state.exercicio_definido];

				const { status, objetivo } = metas;
				if (status === "success") {
					this.setState({
						tipo_avaliacao: objetivo.tipo,
						descricao: objetivo.descricao,

						meta_rentabilidade: objetivo.rentabilidade_percentage,
						meta_ebitda: objetivo.ebitda_percentage,
					});
				}
				this.setState({
					estrategias: result.estrategias_disponiveis,
					limiteEstrategias: result.limite_estrategias,
					estrategiasEscolhida: metas.estrategias_definidas,
				});
			})
			.catch((err) => {
				console.error(err);
				toast.error("Não foi possível carregar alguns dados :(");
			});

		await this.updateFields();
	};

	updateFields = async () => {
		let receitaBrutaPrevista = this.state.receitaBrutaPrevista;

		let meta_rentabilidade = this.state.meta_rentabilidade;
		let meta_rentabilidade_label =
			receitaBrutaPrevista * (meta_rentabilidade / 100);
		let meta_rentabilidade_txt = "Meta não definida";
		if (meta_rentabilidade_label !== 0) {
			let meta_text = Generic.formatNumber(meta_rentabilidade, 2);
			meta_rentabilidade_txt = `${meta_text}% em relação a Receita Bruta Prevista`;
		}

		let meta_ebitda = this.state.meta_ebitda;
		let meta_ebitda_label = receitaBrutaPrevista * (meta_ebitda / 100);
		let meta_ebitda_txt = "Meta não definida";
		if (meta_ebitda_label !== 0) {
			let meta_text = Generic.formatNumber(meta_ebitda, 2);
			meta_ebitda_txt = `${meta_text}% em relação a Receita Bruta Prevista`;
		}

		this.setState({
			meta_rentabilidade_label: meta_rentabilidade_label,
			meta_rentabilidade_txt: meta_rentabilidade_txt,
			meta_ebitda_label: meta_ebitda_label,
			meta_ebitda_txt: meta_ebitda_txt,
		});
	};

	handleChange = async (event, update = true) => {
		await this.setState({
			[event.target.id]: event.target.value,
			hasChange: true,
		});
		if (update) await this.updateFields();
	};

	handleSaveButton = async (e, callback, showConfirmation = true) => {
		e.preventDefault();
		if (!this.state.hasChange) {
			if (showConfirmation) toast.success("Dados atualizados com sucesso");
			return;
		}

		const data = {
			objetivo: {
				tipo: this.state.tipo_avaliacao,
				descricao: this.state.descricao,
				dreId: this.state.dreId,
				rentabilidade_percentage: this.state.meta_rentabilidade,
				ebitda_percentage: this.state.meta_ebitda,
				meta_rentabilidade: this.state.meta_rentabilidade_label,
				meta_lucro: this.state.meta_ebitda_label,
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

		await Metas.postDefinicao("financeiro", "rentabilidade", data)
			.then((result) => {
				const { message } = result;
				if (showConfirmation) toast.success(message);
				return true;
			})
			.catch((err) => {
				console.error(err);
				if (showConfirmation) toast.error(err.response.data.message);
				return false;
			});
	};

	handlePageButton = async (e, resource) => {
		e.preventDefault();
		let id = this.state.companyId;
		if (resource.includes("<<")) {
			this.props.history.push(`/hub/${id}/gestao/categoria/metas/financeiro`);
		} else if (resource.includes(">>")) {
			this.props.history.push(
				`/hub/${id}/gestao/categoria/metas/financeiro/custos`
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

	renderChartRentabilidade = () => {
		let graph = null;
		if (this.state.meta_rentabilidade > 0) {
			graph = (
				<ComparativeChart
					data={[
						this.state.rentabilidadeAnteriorValor,
						this.state.meta_rentabilidade_label,
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

	renderChartEbitda = () => {
		let graph = null;
		if (this.state.meta_ebitda > 0) {
			graph = (
				<ComparativeChart
					data={[this.state.ebitdaAnteriorValor, this.state.meta_ebitda_label]}
					years={[
						(this.state.exercicio_definido - 1).toString(),
						this.state.exercicio_definido.toString(),
					]}
					// typeChart={'%'}
					// scaleMax={scaleMax}
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
								Generic.formatNumber(this.state.rentabilidadeAnterior, 2) + "%"
							}
							color={"success"}
							title={"% Rentabilidade"}
							subtitle={
								"Correspondente a R$ " +
								Generic.formatNumber(this.state.rentabilidadeAnteriorValor, 2) +
								" no Exercício Anterior"
							}
						/>
					</Col>
					<Col xs={12} sm={6} md={4} lg={3}>
						<CustomCard
							value={Generic.formatNumber(this.state.ebitdaAnterior, 2) + "%"}
							color={"success"}
							title={"% EBITDA"}
							subtitle={
								"Correspondente a R$ " +
								Generic.formatNumber(this.state.ebitdaAnteriorValor, 2) +
								" no Exercício Anterior"
							}
						/>
					</Col>
				</Row>
				<Row>
					<Col xs={12} sm={6} md={4} lg={3}>
						<CustomCard
							value={
								"R$ " + Generic.formatNumber(this.state.receitaBrutaPrevista, 2)
							}
							color={"info"}
							title={"Receita Bruta Prevista"}
							subtitle={
								"Meta de Receita Bruta para " +
								this.state.ano_exercicio +
								" definida em Faturamento"
							}
						/>
					</Col>
				</Row>
				<Row>
					<Col xs={12} sm={6} md={4} lg={4}>
						<CustomCard
							value={
								"R$ " +
								Generic.formatNumber(this.state.meta_rentabilidade_label, 2)
							}
							color={"info"}
							title={"Meta de Rentabilidade"}
							subtitle={this.state.meta_rentabilidade_txt}
							chart={this.renderChartRentabilidade()}
							dropdown={[
								{
									title: "Alterar",
									onClick: (e) =>
										this.toggleModal(
											e,
											"Defina a meta de rentabilidade (em %) sobre a Receita Bruta",
											this.state.meta_rentabilidade,
											"meta_rentabilidade"
										),
								},
							]}
						/>
					</Col>
					<Col xs={12} sm={6} md={4} lg={4}>
						<CustomCard
							value={
								"R$ " + Generic.formatNumber(this.state.meta_ebitda_label, 2)
							}
							color={"info"}
							title={"Meta EBITDA"}
							subtitle={this.state.meta_ebitda_txt}
							chart={this.renderChartEbitda()}
							dropdown={[
								{
									title: "Alterar",
									onClick: (e) =>
										this.toggleModal(
											e,
											"Defina a meta EBITDA (em %)",
											this.state.meta_ebitda,
											"meta_ebitda"
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
				category={"Rentabilidade"}
				objectiveOptions={[
					{
						value: "RA",
						text: "Obter Rentabilidade Adequada",
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
						content: "Custos e Despesas",
						onClick: (e) => this.handlePageButton(e, ">>"),
					},
					{
						placement: "top",
						text: "Anterior",
						action: "<<",
						icon: "fa fa-arrow-left",
						content: "Faturamento",
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

export default Financeiro_Rentabilidade;
