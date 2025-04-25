/* eslint-disable max-len */
import { Component } from "react";
import {
	Button,
	Row,
	Col,
	Label,
	CardBody,
	FormGroup,
	Modal,
	ModalHeader,
	ModalBody,
	ModalFooter,
	Badge,
	Card,
	CardHeader,
} from "reactstrap";
import Generic from "../../Utils/Generic";
import Number from "../../../components/Number";
import LoadingSpinner from "../../../components/LoadingSpinner";
import CardBaseMeta from "./Components/CardBaseMeta";
import { toast } from "react-toastify";
import CustomCard from "../../../components/CustomCard";
import { Doughnut } from "react-chartjs-2";
import CompanyService from "../../../service/CompanyService";
import AmbienteInternoService from "../../../service/Diagnostico/AmbienteInterno";
import Metas from "../../../service/Metas";

class Vendas_Marketing extends Component {
	constructor(props) {
		super(props);

		this.handleChange = this.handleChange.bind(this);

		this.company = CompanyService.getDataCompany();
		if (!this.company) return this.props.history.push("/");

		this.state = {
			isLoading: true,
			companyId: this.company.id,
			exercicio_definido: this.company.exercicioDefinido,

			tipo_avaliacao: "UN",
			descricao: "",
			showModalDialog: false,

			estrategiasEscolhida: [],
			limiteEstrategias: 3,
			estrategias: [],

			vendas_id: 0,
			meta_clientes_ativos: 0.0,

			base_clientes_previsto: 0,
			clientes_ativos_previsto: 0,
			carteira_de_clientes_ativa: 0,

			txtAumentoClientes: undefined,
			txtClientesAtivos: "Meta não definida",

			meta_crescimento_receita_percentual: 0.0,
			meta_crescimento_receita_valor: 0.0,
			percentual_clientes_ativos: 0.0,
			novos_clientes_no_ano: 0.0,

			sugestao_clientes_ativos: 0.0,
			sugestao_novos_clientes: 0.0,
			meta_label_novos_clientes: 0.0,
			meta_label_clientes_ativos: 0.0,

			modalEdicao: false,
			labelModalEdit: "",
			inputModalEdit: "",
			valueModalEdit: "",
			fieldModalEdit: "",

			receita_bruta_anterior: 0.0,
			ticket_medio_clientes: 0.0,
			clientes_perdidos: 0.0,

			sugestao_ticket_medio_clientes_valor: 0.0,
			sugestao_ticket_medio_clientes_percentual: 0.0,
			sugestao_clientes_ativos_valor: 0.0,
			sugestao_clientes_ativos_percentual: 0.0,
			sugestao_clientes_correntes_valor: 0.0,
			sugestao_novos_clientes_valor: 0.0,
			sugestao_clientes_perdidos_valor: 0.0,
			sugestao_clientes_perdidos_percentual: 0.0,

			meta_ticket_medio: 0.0,
			meta_ticket_medio_label: 0.0,
			meta_ticket_medio_txt: "Meta não definida",

			meta_novos_clientes: 0.0,
			meta_novos_clientes_label: 0.0,
			meta_novos_clientes_txt: "Meta não definida",

			meta_clientes_perdidos: 0,
			meta_clientes_perdidos_label: 0.0,
			meta_clientes_perdidos_txt: "Meta não definida",

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
					const { vendas, percentual_clientes_ativos } = analise;
					await this.setState({
						vendas_id: vendas.id,
						percentual_clientes_ativos: percentual_clientes_ativos,
						novos_clientes_no_ano: vendas.novos_clientes_no_ano,
						ano_exercicio: vendas.ano_exercicio,
						base_clientes: vendas.base_clientes,
						carteira_de_clientes_ativa: vendas.carteira_de_clientes_ativa,
						clientes_perdidos: vendas.clientes_perdidos,
					});

					await Metas.getDefinicao("comercial", "marketing").then(
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
										meta_ticket_medio_label: objetivo.ticket_medio_previsto,
										meta_ticket_medio: objetivo.meta_ticket_medio,
										meta_label_clientes_ativos:
											objetivo.clientes_ativos_previsto,
										meta_clientes_ativos: objetivo.meta_clientes_ativos,

										meta_clientes_perdidos_label:
											objetivo.clientes_perdidos_previsto,
										meta_clientes_perdidos: objetivo.meta_clientes_perdidos,
										meta_novos_clientes_label: objetivo.clientes_novos_previsto,

										tipo_avaliacao: objetivo.tipo,
										descricao: objetivo.descricao,
									});
								}
								await this.setState({
									estrategiasEscolhida: metas.estrategias_definidas,
									estrategias: result.estrategias_disponiveis,
									limiteEstrategias: result.limite_estrategias,

									receita_bruta_anterior:
										outros_objetivos.receita_bruta_anterior,
									meta_crescimento_receita_percentual:
										outros_objetivos.meta_crescimento_receita_percentual,
									meta_crescimento_receita_valor:
										outros_objetivos.meta_crescimento_receita_valor,
									ticket_medio_clientes: outros_objetivos.ticket_medio_clientes,
									sugestao_clientes_ativos:
										outros_objetivos.meta_crescimento_receita_percentual / 2,
									sugestao_novos_clientes:
										(outros_objetivos.meta_crescimento_receita_percentual / 2) *
										1.5,

									sugestao_ticket_medio_clientes_valor:
										outros_objetivos.sugestao_ticket_medio_clientes_valor,
									sugestao_ticket_medio_clientes_percentual:
										outros_objetivos.sugestao_ticket_medio_clientes_percentual,
									sugestao_clientes_ativos_valor:
										outros_objetivos.sugestao_clientes_ativos_valor,
									sugestao_clientes_ativos_percentual:
										outros_objetivos.sugestao_clientes_ativos_percentual,
									sugestao_clientes_correntes_valor:
										outros_objetivos.sugestao_clientes_correntes_valor,
									sugestao_novos_clientes_valor:
										outros_objetivos.sugestao_novos_clientes_valor,
									sugestao_clientes_perdidos_valor:
										outros_objetivos.sugestao_clientes_perdidos_valor,
									sugestao_clientes_perdidos_percentual:
										outros_objetivos.sugestao_clientes_perdidos_percentual,
								});
							}
						}
					);

					await this.updateFields();
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

	updateFields = async (field = "") => {
		let u_receita_bruta,
			u_meta_ticket_medio,
			u_meta_clientes_ativos,
			u_clientes_correntes,
			u_novos_clientes,
			u_clientes_perdidos;

		let label_meta_ticket_medio,
			meta_label_clientes_ativos,
			meta_clientes_perdidos_label;
		let meta_ticket_medio_txt,
			txtClientesAtivos,
			meta_novos_clientes_txt,
			meta_clientes_perdidos_txt = "Meta não definida";

		let ticket_medio_anterior = this.state.ticket_medio_clientes;
		let clientes_ativos_anterior = this.state.carteira_de_clientes_ativa;

		u_receita_bruta = this.state.meta_crescimento_receita_valor;
		u_meta_ticket_medio =
			this.arredondamento(this.state.meta_ticket_medio) || 0;
		u_meta_clientes_ativos = this.arredondamento(
			this.state.meta_clientes_ativos
		);
		u_clientes_correntes = this.arredondamento(
			this.state.sugestao_clientes_correntes_valor
		);
		u_novos_clientes = this.arredondamento(this.state.meta_novos_clientes, 0);
		u_clientes_perdidos = this.arredondamento(
			this.state.meta_clientes_perdidos
		);

		if (field !== "") {
			meta_clientes_perdidos_label =
				(u_clientes_correntes * u_clientes_perdidos) / 100;

			if (field === "meta_ticket_medio") {
				label_meta_ticket_medio =
					(ticket_medio_anterior / 100) * u_meta_ticket_medio +
					ticket_medio_anterior;

				meta_label_clientes_ativos = u_receita_bruta / label_meta_ticket_medio;
				u_meta_clientes_ativos =
					(100 / clientes_ativos_anterior) * meta_label_clientes_ativos - 100;
			}
			if (field === "meta_clientes_ativos") {
				meta_label_clientes_ativos =
					(clientes_ativos_anterior / 100) * u_meta_clientes_ativos +
					clientes_ativos_anterior;
				meta_label_clientes_ativos = this.arredondamento(
					meta_label_clientes_ativos,
					0
				);

				label_meta_ticket_medio = this.arredondamento(
					u_receita_bruta / meta_label_clientes_ativos
				);
				u_meta_ticket_medio =
					(100 / ticket_medio_anterior) * label_meta_ticket_medio - 100;
			}
			if (field === "meta_novos_clientes") {
				meta_label_clientes_ativos =
					clientes_ativos_anterior + u_novos_clientes;
				label_meta_ticket_medio = this.arredondamento(
					u_receita_bruta / meta_label_clientes_ativos
				);

				u_meta_ticket_medio =
					(100 / ticket_medio_anterior) * label_meta_ticket_medio - 100;
				u_meta_clientes_ativos =
					(100 / clientes_ativos_anterior) * meta_label_clientes_ativos - 100;
			}
			if (field === "meta_clientes_perdidos") {
				meta_label_clientes_ativos =
					clientes_ativos_anterior + u_novos_clientes;
				label_meta_ticket_medio = this.arredondamento(
					u_receita_bruta / meta_label_clientes_ativos
				);

				u_meta_ticket_medio =
					(100 / ticket_medio_anterior) * label_meta_ticket_medio - 100;
				u_meta_clientes_ativos =
					(100 / clientes_ativos_anterior) * meta_label_clientes_ativos - 100;
			}

			if (meta_label_clientes_ativos === 0) {
				txtClientesAtivos = "Meta não definida";
			} else {
				txtClientesAtivos =
					meta_label_clientes_ativos > clientes_ativos_anterior
						? "Aumento"
						: "Redução";
				if (meta_label_clientes_ativos === clientes_ativos_anterior) {
					txtClientesAtivos =
						"Manutenção dos Clientes Ativos em relação ao exercício anterior";
				} else {
					txtClientesAtivos =
						txtClientesAtivos +
						" de " +
						Generic.formatNumber(u_meta_clientes_ativos) +
						"% dos Clientes Ativos";
				}
			}

			if (label_meta_ticket_medio === 0) {
				meta_ticket_medio_txt = "Meta não definida";
			} else {
				meta_ticket_medio_txt =
					label_meta_ticket_medio > ticket_medio_anterior
						? "Aumento"
						: "Redução";
				if (label_meta_ticket_medio === ticket_medio_anterior) {
					meta_ticket_medio_txt =
						"Manutenção do Ticket Médio por Clientes em relação ao exercício anterior";
				} else {
					meta_ticket_medio_txt =
						meta_ticket_medio_txt +
						" de " +
						Generic.formatNumber(u_meta_ticket_medio) +
						"% do Ticket Médio por Clientes";
				}
			}

			u_novos_clientes =
				meta_label_clientes_ativos -
				clientes_ativos_anterior +
				meta_clientes_perdidos_label;
			if (u_novos_clientes === 0) {
				meta_novos_clientes_txt = "Sem previsão de novos clientes";
			} else {
				if (u_novos_clientes < 0) {
					meta_clientes_perdidos_label =
						meta_clientes_perdidos_label - u_novos_clientes;
					if (meta_clientes_perdidos_label < 0)
						meta_clientes_perdidos_label = meta_clientes_perdidos_label * -1;
					u_novos_clientes = 0;
				} else {
					let perc = (100 / meta_label_clientes_ativos) * u_novos_clientes;
					meta_novos_clientes_txt =
						"Correspondente a " +
						Generic.formatNumber(perc) +
						"% dos Clientes Ativos";
				}
			}

			label_meta_ticket_medio = this.arredondamento(label_meta_ticket_medio);
			meta_label_clientes_ativos = this.arredondamento(
				meta_label_clientes_ativos
			);
			meta_clientes_perdidos_label = this.arredondamento(
				meta_clientes_perdidos_label
			);

			let perc_perdidos =
				(100 / u_clientes_correntes) * meta_clientes_perdidos_label;
			if (perc_perdidos === 0) {
				meta_clientes_perdidos_txt = "Sem previsão de saída de clientes";
			} else {
				meta_clientes_perdidos_txt =
					"Correspondente a " +
					Generic.formatNumber(perc_perdidos) +
					"% dos Clientes Correntes";
			}

			await this.setState({
				meta_ticket_medio_label: label_meta_ticket_medio,
				meta_ticket_medio_txt: meta_ticket_medio_txt,
				meta_label_clientes_ativos: meta_label_clientes_ativos,
				txtClientesAtivos: txtClientesAtivos,
				meta_novos_clientes_label: u_novos_clientes,
				meta_novos_clientes_txt: meta_novos_clientes_txt,
				meta_clientes_perdidos_label: meta_clientes_perdidos_label,
				meta_clientes_perdidos_txt: meta_clientes_perdidos_txt,
			});
		} else {
			if (this.state.meta_label_clientes_ativos === 0) {
				txtClientesAtivos = "Meta não definida";
			} else {
				txtClientesAtivos =
					this.state.meta_label_clientes_ativos > clientes_ativos_anterior
						? "Aumento"
						: "Redução";
				if (
					this.state.meta_label_clientes_ativos === clientes_ativos_anterior
				) {
					txtClientesAtivos =
						"Manutenção dos Clientes Ativos em relação ao exercício anterior";
				} else {
					txtClientesAtivos =
						txtClientesAtivos +
						" de " +
						Generic.formatNumber(u_meta_clientes_ativos) +
						"% dos Clientes Ativos";
				}
			}

			if (this.state.meta_ticket_medio_label === 0) {
				meta_ticket_medio_txt = "Meta não definida";
			} else {
				meta_ticket_medio_txt =
					this.state.meta_ticket_medio_label > ticket_medio_anterior
						? "Aumento"
						: "Redução";
				if (this.state.meta_ticket_medio_label === ticket_medio_anterior) {
					meta_ticket_medio_txt =
						"Manutenção do Ticket Médio por Clientes em relação ao exercício anterior";
				} else {
					meta_ticket_medio_txt =
						meta_ticket_medio_txt +
						" de " +
						Generic.formatNumber(u_meta_ticket_medio) +
						"% do Ticket Médio por Clientes";
				}
			}

			u_novos_clientes = this.state.meta_label_clientes_ativos;
			if (u_novos_clientes === 0) {
				meta_novos_clientes_txt = "Sem previsão de novos clientes";
			} else {
				if (u_novos_clientes < 0) {
					meta_clientes_perdidos_label =
						meta_clientes_perdidos_label - u_novos_clientes;
					if (meta_clientes_perdidos_label < 0)
						this.state.meta_clientes_perdidos_label =
							meta_clientes_perdidos_label * -1;
					u_novos_clientes = 0;
				} else {
					let perc =
						(100 / this.state.meta_label_clientes_ativos) *
						this.state.meta_novos_clientes_label;
					meta_novos_clientes_txt =
						"Correspondente a " +
						Generic.formatNumber(perc) +
						"% dos Clientes Ativos";
				}
			}

			let perc_perdidos =
				(100 / u_clientes_correntes) * this.state.meta_clientes_perdidos_label;
			if (perc_perdidos === 0) {
				meta_clientes_perdidos_txt = "Sem previsão de saída de clientes";
			} else {
				meta_clientes_perdidos_txt =
					"Correspondente a " +
					Generic.formatNumber(perc_perdidos) +
					"% dos Clientes Correntes";
			}

			await this.setState({
				meta_ticket_medio_txt: meta_ticket_medio_txt,
				txtClientesAtivos: txtClientesAtivos,
				meta_novos_clientes_txt: meta_novos_clientes_txt,
				meta_clientes_perdidos_txt: meta_clientes_perdidos_txt,
			});
		}
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
				ticket_medio_previsto: this.state.meta_ticket_medio_label,
				meta_ticket_medio: this.state.meta_ticket_medio,
				clientes_ativos_previsto: this.state.meta_label_clientes_ativos,
				meta_clientes_ativos: this.state.meta_clientes_ativos,
				clientes_perdidos_previsto: this.state.meta_clientes_perdidos_label,
				meta_clientes_perdidos: this.state.meta_clientes_perdidos,
				clientes_ativos_corrente: this.state.sugestao_clientes_correntes_valor,
				clientes_novos_previsto: this.state.meta_novos_clientes_label,
				base_clientes_previsto:
					this.state.base_clientes +
					this.state.meta_novos_clientes_label -
					this.state.meta_clientes_perdidos,
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

		const response = await Metas.postDefinicao("comercial", "marketing", data);
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
				`/hub/${id}/gestao/categoria/metas/comercial/vendas`
			);
		}
	};

	copiarValor = async (e, campo, valor) => {
		e.preventDefault();
		await this.setState({
			[campo]: valor,
		});
		await this.updateFields(campo);
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
			[campo]: valor,
			modalEdicao: false,
		});
		await this.updateFields(campo);
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

	renderDadosAnteriores = (label, valor, tipo = undefined) => {
		if (tipo) {
			if (tipo === "R$") {
				valor = "R$ " + Generic.formatNumber(valor, 2);
			} else if (tipo === "%") {
				valor = Generic.formatNumber(valor, 2) + "%";
			}
		}
		return (
			<Row>
				<Col md={6} className={"text-right align-self-center"}>
					{label}
				</Col>
				<Col md={6} className={"text-left align-self-center"}>
					<h3>
						<Badge color={"success"}>{valor}</Badge>
					</h3>
				</Col>
			</Row>
		);
	};

	editValueRender = (valor, tipo) => {
		if (tipo) {
			if (tipo === "R$") {
				valor = "R$ " + Generic.formatNumber(valor, 2);
			} else if (tipo === "%") {
				valor = Generic.formatNumber(valor, 2) + "%";
			}
		} else {
			if (valor) {
				valor = Generic.formatNumber(valor, 0);
			}
		}

		return valor;
	};

	renderDadosSugestao = (
		key,
		label,
		fieldMeta,
		valor1,
		tipo1 = undefined,
		valor2 = undefined,
		tipo2 = undefined
	) => {
		return (
			<Row key={key}>
				<Col md={4} className={"text-center align-self-center"}>
					{label}
				</Col>
				<Col md={4} className={"text-center align-self-center"}>
					<h3>
						<Badge color={"info"}>{this.editValueRender(valor1, tipo1)}</Badge>
					</h3>
				</Col>
				<Col md={4} className={"text-center align-self-center"}>
					<h3>
						<Badge color={"info"}>{this.editValueRender(valor2, tipo2)}</Badge>
					</h3>
				</Col>
				{/*<Col md={3} className={'text-center align-self-center'}>*/}
				{/*  <Button outline color="success" onClick={(e) => this.copiarValor(e, fieldMeta, copy)}>*/}
				{/*    Aceitar*/}
				{/*  </Button>*/}
				{/*</Col>*/}
			</Row>
		);
	};

	arredondamento = (value, decimals = 2) => {
		value = Generic.ConvertStringToFloat(value);
		return parseFloat(value.toFixed(decimals));
	};

	renderChart = () => {
		let ticketMedioAnterior = this.state.ticket_medio_clientes;
		let clientesCorrentes = this.state.sugestao_clientes_correntes_valor;
		let metaNovosClientes = this.state.meta_novos_clientes_label;
		let metaClientesPerdidos = this.state.meta_clientes_perdidos_label;
		let metaClientesAtivos = this.state.meta_label_clientes_ativos;
		let metaTicketMedio = this.state.meta_ticket_medio_label;

		let clientesAtuais = clientesCorrentes * ticketMedioAnterior;
		clientesAtuais =
			clientesAtuais > 0 ? this.arredondamento(clientesAtuais) : 0;

		let novosClientes =
			(metaNovosClientes - metaClientesPerdidos) * ticketMedioAnterior;
		novosClientes = novosClientes > 0 ? this.arredondamento(novosClientes) : 0;

		let aumentoTicket =
			metaClientesAtivos * (metaTicketMedio - ticketMedioAnterior);
		aumentoTicket = aumentoTicket > 0 ? this.arredondamento(aumentoTicket) : 0;

		const data = {
			labels: ["Clientes Atuais", "Novos Clientes", "Aumento do Ticket Médio"],
			datasets: [
				{
					data: [clientesAtuais, novosClientes, aumentoTicket],
					backgroundColor: ["#FF6384", "#36A2EB", "#FFCE56"],
					hoverBackgroundColor: ["#FF6384", "#36A2EB", "#FFCE56"],
				},
			],
		};
		const options = {
			legend: {
				position: "right",
			},
			title: {
				display: true,
				text: "Composição do Aumento da Receita Bruta",
				position: "top",
				fontSize: 14,
				padding: 15,
			},
			tooltips: {
				callbacks: {
					label: function (tooltipItem, data) {
						let label = data.labels[tooltipItem.index] || "";
						let value =
							data.datasets[tooltipItem.datasetIndex].data[tooltipItem.index] ||
							0.0;
						value = Generic.formatNumber(value);

						if (label) label += ": ";
						label += "R$ " + value;

						return label;
					},
				},
			},
		};

		return <Doughnut data={data} options={options} />;
	};

	copySugestao = async (e) => {
		e.preventDefault();

		await this.setState({
			meta_ticket_medio_label: this.state.sugestao_ticket_medio_clientes_valor,
			meta_label_clientes_ativos: this.state.sugestao_clientes_ativos_valor,
			meta_novos_clientes_label: this.state.sugestao_novos_clientes_valor,
			meta_clientes_perdidos_label: this.state.sugestao_clientes_perdidos_valor,
			meta_clientes_perdidos: this.state.sugestao_clientes_perdidos_percentual,
			meta_ticket_medio: this.state.sugestao_ticket_medio_clientes_percentual,
			meta_clientes_ativos: this.state.sugestao_clientes_ativos_percentual,
		});
		await this.updateFields();
	};

	tableMeta = () => {
		let ticketMedioClientes = this.state.ticket_medio_clientes;
		let clientesAtivos = this.state.carteira_de_clientes_ativa;
		let novosClientes = this.state.novos_clientes_no_ano;
		let clientesPerdidos = this.state.clientes_perdidos;
		let clientesCorrentes = clientesAtivos - novosClientes + clientesPerdidos;

		let sugestao_ticket_medio_clientes_valor =
			this.state.sugestao_ticket_medio_clientes_valor;
		let sugestao_ticket_medio_clientes_percentual =
			this.state.sugestao_ticket_medio_clientes_percentual;
		let sugestao_clientes_ativos_valor =
			this.state.sugestao_clientes_ativos_valor;
		let sugestao_clientes_ativos_percentual =
			this.state.sugestao_clientes_ativos_percentual;
		let sugestao_clientes_correntes_valor =
			this.state.sugestao_clientes_correntes_valor;
		let sugestao_novos_clientes_valor =
			this.state.sugestao_novos_clientes_valor;
		let sugestao_clientes_perdidos_valor =
			this.state.sugestao_clientes_perdidos_valor;
		let sugestao_clientes_perdidos_percentual =
			this.state.sugestao_clientes_perdidos_percentual;

		return (
			<div>
				<Row>
					<Col xs={12} sm={6} md={4} lg={3}>
						<CustomCard
							value={
								"R$ " + Generic.formatNumber(this.state.receita_bruta_anterior)
							}
							color={"success"}
							title={"Receita Bruta Anterior"}
						/>
					</Col>
					<Col xs={12} sm={6} md={4} lg={3} />
					<Col xs={12} sm={6} md={4} lg={3}>
						<CustomCard
							value={
								"R$ " +
								Generic.formatNumber(this.state.meta_crescimento_receita_valor)
							}
							color={"info"}
							title={"Receita Bruta Prevista"}
							subtitle={
								"Uma meta de crescimento de " +
								Generic.formatNumber(
									this.state.meta_crescimento_receita_percentual
								) +
								"%"
							}
						/>
					</Col>
				</Row>
				<Row>
					<Col md={6}>
						<Card outline color="success">
							<CardHeader
								className={"text-white"}
								style={{ backgroundColor: "#7bbf95", borderColor: "#4dbd74" }}
							>
								No exercício anterior tivemos...
							</CardHeader>
							<CardBody>
								{/*{this.renderDadosAnteriores('Receita Bruta', this.state.receita_bruta_anterior, 'R$')}*/}
								{this.renderDadosAnteriores(
									"Ticket Médio por Cliente",
									ticketMedioClientes,
									"R$"
								)}
								{this.renderDadosAnteriores(
									"Total Clientes Ativos",
									clientesAtivos
								)}
								{this.renderDadosAnteriores(
									"Clientes Correntes",
									clientesCorrentes
								)}
								{this.renderDadosAnteriores("Novos Clientes", novosClientes)}
								{this.renderDadosAnteriores(
									"Clientes Perdidos",
									clientesPerdidos
								)}
							</CardBody>
						</Card>
					</Col>
					<Col md={6}>
						<Card outline color="info">
							<CardHeader
								style={{ backgroundColor: "#9ed1e2", borderColor: "#63c2de" }}
							>
								Sugestão para Atingir a Meta de Receita
								<div className="card-header-actions">
									<Button
										outline
										color="info"
										className={"bg-light"}
										size="sm"
										onClick={this.copySugestao}
									>
										Aceitar
									</Button>
								</div>
							</CardHeader>
							<CardBody>
								{/*{this.renderDadosSugestao(0, 'Receita Bruta', this.state.meta_crescimento_receita_valor, 'R$')}*/}
								{this.renderDadosSugestao(
									1,
									"Ticket Médio por Cliente",
									"meta_ticket_medio",
									sugestao_ticket_medio_clientes_valor,
									"R$",
									sugestao_ticket_medio_clientes_percentual,
									"%"
								)}
								{this.renderDadosSugestao(
									2,
									"Total Clientes Ativos",
									"meta_clientes_ativos",
									sugestao_clientes_ativos_valor,
									undefined,
									sugestao_clientes_ativos_percentual,
									"%"
								)}
								{this.renderDadosSugestao(
									3,
									"Clientes Correntes",
									"",
									sugestao_clientes_correntes_valor
								)}
								{this.renderDadosSugestao(
									4,
									"Novos Clientes",
									"meta_novos_clientes",
									sugestao_novos_clientes_valor
								)}
								{this.renderDadosSugestao(
									5,
									"Clientes Perdidos",
									"meta_clientes_perdidos",
									sugestao_clientes_perdidos_valor,
									undefined,
									sugestao_clientes_perdidos_percentual,
									"%"
								)}
							</CardBody>
						</Card>
					</Col>
				</Row>
				<Row>
					<Col md={6}>
						<Row>
							<Col xs={12} sm={6}>
								<CustomCard
									value={
										"R$ " +
										Generic.formatNumber(this.state.meta_ticket_medio_label, 2)
									}
									color={"info"}
									title={"Meta de Ticket Médio por Clientes"}
									subtitle={this.state.meta_ticket_medio_txt}
									dropdown={[
										{
											title: "Alterar",
											onClick: (e) =>
												this.toggleModal(
													e,
													"Defina a meta de aumento do Ticket Médio (em %)",
													this.state.meta_ticket_medio,
													"meta_ticket_medio"
												),
										},
									]}
								/>
							</Col>
							<Col xs={12} sm={6}>
								<CustomCard
									value={Generic.formatNumber(
										this.state.meta_label_clientes_ativos,
										0
									)}
									color={"info"}
									title={"Meta de Clientes Ativos"}
									subtitle={this.state.txtClientesAtivos}
									dropdown={[
										{
											title: "Alterar",
											onClick: (e) =>
												this.toggleModal(
													e,
													"Defina a meta de aumento de clientes ativos (em %)",
													this.state.meta_clientes_ativos,
													"meta_clientes_ativos"
												),
										},
									]}
								/>
							</Col>
						</Row>
						<Row>
							<Col xs={12} sm={6} />
							<Col xs={12} sm={6}>
								<CustomCard
									value={Generic.formatNumber(
										this.state.meta_clientes_perdidos_label,
										0
									)}
									color={"info"}
									title={"Previsão de Clientes Perdidos"}
									subtitle={this.state.meta_clientes_perdidos_txt}
									dropdown={[
										{
											title: "Alterar",
											onClick: (e) =>
												this.toggleModal(
													e,
													"Defina a meta de redução dos clientes perdidos (em %)",
													this.state.meta_clientes_perdidos,
													"meta_clientes_perdidos"
												),
										},
									]}
								/>
							</Col>
						</Row>
						<Row>
							<Col xs={12} sm={6}>
								<CustomCard
									value={Generic.formatNumber(
										this.state.sugestao_clientes_correntes_valor,
										0
									)}
									color={"info"}
									title={"Clientes Correntes"}
									subtitle={"Clientes Ativos ao final do exercício anterior"}
								/>
							</Col>
							<Col xs={12} sm={6}>
								<CustomCard
									value={Generic.formatNumber(
										this.state.meta_novos_clientes_label,
										0
									)}
									color={"info"}
									title={"Meta de Novos Clientes"}
									subtitle={this.state.meta_novos_clientes_txt}
								/>
							</Col>
						</Row>
					</Col>
					<Col md={6}>{this.renderChart()}</Col>
				</Row>
			</div>
		);
	};

	loaded = () => {
		return (
			<CardBaseMeta
				newModel={true}
				companyId={this.state.companyId}
				category={"Marketing"}
				objectiveOptions={[
					{
						value: "AFM",
						text: "Aumentar fatia de mercado",
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
						content: "Vendas",
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

export default Vendas_Marketing;
