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
import LoadingSpinner from "../../../components/LoadingSpinner";
import CardBaseMeta from "./Components/CardBaseMeta";
import CustomCard from "../../../components/CustomCard";
import ComparativeChart from "./Components/ComparativeChart";
import CardMetaSugestao from "./Components/CardMetaSugestao";
import CompanyService from "../../../service/CompanyService";
import AmbienteInternoService from "../../../service/Diagnostico/AmbienteInterno";
import Metas from "../../../service/Metas";

class MetasFinanceiroForm extends Component {
	constructor(props) {
		super(props);

		this.company = CompanyService.getDataCompany();
		if (!this.company) return this.props.history.push("/");

		this.state = {
			isLoading: true,
			companyId: this.company.id,
			exercicio_definido: this.company.exercicioDefinido,

			hasChange: false,

			showModalDialog: false,
			showTableAvaliacao: false,
			estrategiasEscolhida: [],

			// VALORES
			dreId: 0,
			sugestao_crescimento: 0.0,

			meta_crescimento: 0.0,
			meta_crescimento_label: 0.0,
			meta_crescimento_txt: "",

			// SMILE
			smile_receita_bruta: "",
			smile_crescimento_quatro: "",
			smile_crescimento: "",
			tipo_avaliacao: "UN",
			descricao: "",
			smiled_loaded: false,
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

		let states = {
			receita_bruta: analise.receita_bruta,
			crescimento: analise.crescimento,
			smile_receita_bruta: analise.smiles.smile_receita_bruta,
			smile_crescimento: analise.smiles.smile_crescimento,
			dreId: analise.dre,
			smiled_loaded: true,
			showTableAvaliacao: true,
		};

		await Metas.getDefinicao("financeiro", "faturamento").then(
			async (result) => {
				let { metas } = result;
				metas = metas[this.state.exercicio_definido];

				const { status, objetivo, outros_objetivos } = metas;
				if (status === "success") {
					states = {
						...states,
						dreId: objetivo.dreId,
						tipo_avaliacao: objetivo.tipo,
						descricao: objetivo.descricao,
						meta_crescimento: objetivo.percentagem,
					};
				}
				states = {
					...states,
					estrategias: result.estrategias_disponiveis,
					limiteEstrategias: result.limite_estrategias,
					estrategiasEscolhida: metas.estrategias_definidas,
					sugestao_crescimento: outros_objetivos.sugestao_crescimento,
				};
			}
		);

		await this.setState({
			...states,
		});

		await this.updateFields();
	};

	redirect = () => {
		this.props.history.push(
			`/hub/${this.state.companyId}/gestao/categoria/diagnostico/interno/financeiro`
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
								Ainda não foi preenchido os dados referente ao Financeiro desta
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
		let meta_crescimento = this.state.meta_crescimento;
		let meta_crescimento_label =
			this.state.receita_bruta * (meta_crescimento / 100 + 1);
		let meta_crescimento_txt = "Meta não definida";
		if (meta_crescimento !== 0) {
			let meta_text = Generic.formatNumber(this.state.meta_crescimento, 2);
			meta_crescimento_txt = `Um crescimento de ${meta_text}% em relação ao exercício anterior`;
		}

		await this.setState({
			meta_crescimento: meta_crescimento,
			meta_crescimento_label: meta_crescimento_label,
			meta_crescimento_txt: meta_crescimento_txt,
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
				dreId: this.state.dreId,
				tipo: this.state.tipo_avaliacao,
				descricao: this.state.descricao,
				percentage: this.state.meta_crescimento,
				meta: this.state.meta_crescimento_label,
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

		await Metas.postDefinicao("financeiro", "faturamento", data)
			.then((result) => {
				const { message } = result;
				if (showConfirmation) toast.success(message);
			})
			.catch((err) => {
				console.error(err.response.data);
				if (showConfirmation) toast.error(err.response.data.message);
			});
	};

	handlePageButton = (e, resource) => {
		e.preventDefault();
		let id = this.state.companyId;
		if (resource.includes("<<")) {
			this.props.history.push(`/hub/${id}/gestao/categoria/metas`);
		} else if (resource.includes(">>")) {
			this.props.history.push(
				`/hub/${id}/gestao/categoria/metas/financeiro/rentabilidade`
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

	renderChartCrescimento = () => {
		let graph = null;
		if (this.state.meta_crescimento > 0) {
			graph = (
				<ComparativeChart
					data={[this.state.receita_bruta, this.state.meta_crescimento_label]}
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
							value={"R$ " + Generic.formatNumber(this.state.receita_bruta, 2)}
							color={"success"}
							title={"Receita Bruta"}
							subtitle={"Exercício anterior"}
						/>
					</Col>
					<Col xs={12} sm={6} md={4} lg={3}>
						<CustomCard
							value={Generic.formatNumber(this.state.crescimento, 2) + "%"}
							color={"success"}
							title={"% Crescimento da Receita"}
							subtitle={"Exercício anterior"}
						/>
					</Col>
				</Row>
				<br />
				<div>
					<CardMetaSugestao
						label={"Sugestão de meta para crescimento na Receita Bruta"}
						label_value={
							Generic.formatNumber(this.state.sugestao_crescimento, 2) + "%"
						}
						fieldSugestao={"sugestao_crescimento"}
						fieldMeta={"meta_crescimento"}
						states={this.state}
						handleChange={this.handleChange}
					/>
				</div>
				<br />
				<Row>
					<Col xs={12} sm={6} md={4} lg={4}>
						<CustomCard
							value={
								"R$ " +
								Generic.formatNumber(this.state.meta_crescimento_label, 2)
							}
							color={"info"}
							title={"Meta Receita Bruta"}
							subtitle={this.state.meta_crescimento_txt}
							chart={this.renderChartCrescimento()}
							dropdown={[
								{
									title: "Alterar",
									onClick: (e) =>
										this.toggleModal(
											e,
											"Defina a meta de crescimento da Receita Bruta (em %)",
											this.state.meta_crescimento,
											"meta_crescimento"
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
				category={"Faturamento"}
				objectiveOptions={[
					{
						value: "CS",
						text: "Crescimento Sustentável da Receita",
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
				// cardAvaliacao={this.tableAvaliacao()}
				buttons={[
					{
						placement: "top",
						text: "Próximo",
						action: ">>",
						icon: "fa fa-arrow-right",
						content: "Rentabilidade",
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

export default MetasFinanceiroForm;
