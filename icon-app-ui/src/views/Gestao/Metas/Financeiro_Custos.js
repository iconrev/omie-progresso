import { Component } from "react";
import {
	Alert,
	Badge,
	Button,
	Card,
	CardBody,
	CardHeader,
	Col,
	Container,
	Form,
	FormGroup,
	Input,
	Label,
	Modal,
	ModalBody,
	ModalFooter,
	ModalHeader,
	Row,
} from "reactstrap";
import Generic from "../../Utils/Generic";
import LoadingSpinner from "../../../components/LoadingSpinner";
import { toast } from "react-toastify";
import CardBaseMeta from "./Components/CardBaseMeta";
import Number from "../../../components/Number";
import createNumberMask from "text-mask-addons/dist/createNumberMask";
import { InputAdapter, TextMask } from "react-text-mask-hoc";
import CustomCard from "../../../components/CustomCard";
import CardMetaSugestao from "./Components/CardMetaSugestao";
import CompanyService from "../../../service/CompanyService";
import AmbienteInternoService from "../../../service/Diagnostico/AmbienteInterno";
import Metas from "../../../service/Metas";
import TooltipDefault from "../../../components/TooltipDefault";

const mask = createNumberMask({
	prefix: "R$ ",
	thousandsSeparatorSymbol: ".",
	integerLimit: 10,
	allowDecimal: true,
	decimalSymbol: ",",
	decimalLimit: 2,
});

class Financeiro_Custos extends Component {
	constructor(props) {
		super(props);

		this.handleChange = this.handleChange.bind(this);
		this.calcularValor = this.calcularValor.bind(this);
		this.toggleModal = this.toggleModal.bind(this);

		this.company = CompanyService.getDataCompany();

		this.state = {
			isLoading: true,
			companyId: this.company.id,
			exercicio_definido: this.company.exercicioDefinido,

			hasChange: false,

			modalEdit: false,
			showMessageEdit: false,
			messageEdit: "",
			fieldEdit: "",
			valueEdit: 0.0,
			percEdit: 0.0,
			fieldsBlock: [],
			estrategiasEscolhida: [],

			tipo_avaliacao: "UN",
			totalPercentual: 0.0,
			impostoAnoAnterior: 0.0,
			receitaBrutaProximoAno: 0.0,
			impostoProximoAno: 0.0,
			imposto_sobre_lucro: 0.0,
			imposto_sobre_lucro_perc: 0.0,
			orcamentoDespesaProximoAno: 0.0,
			percentualPreenchido: 0.0,
			descricao: "",
			valorSugerido: 0.0,
			percentualSugerido: 0.0,
			valorContingencia: 0.0,
			impostoDefinido: 0.0,
			impostoEdit: 0.0,
			impostoDefinidoManualmente: false,
			modalImposto: false,
			depreciacao_amortizacao_definido: 0.0,
			imposto_sobre_lucro_definido: 0.0,

			modalDepreciacao: false,
			depreciacaoEdit: 0.0,

			modalImpostosLucro: false,
			impostosLucroEdit: 0.0,
			despesaNome: "",
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
			despesas_anteriores: analise.despesas,
			custoTotalAnterior: analise.despesas_totais,
			impostoAnoAnterior: analise.imposto_sobre_receitas,
			receitaBruta: analise.receita_bruta,
			lucroBruto: analise.lucro_bruto,
			depreciacao_amortizacao: analise.depreciacao_amortizacao,
			imposto_sobre_lucro: analise.imposto_sobre_lucro,
			imposto_sobre_lucro_perc_anterior: analise.imposto_sobre_lucro_perc,

			dreId: analise.dre,
		});

		await Metas.getDefinicao("financeiro", "custos")
			.then(async (result) => {
				let { metas } = result;
				metas = metas[this.state.exercicio_definido];

				const { status, objetivos, receita, rentabilidade } = metas;
				if (status === "success") {
					const despesas = {};
					objetivos.despesas.forEach((despesa) => {
						despesas["objetivo_" + despesa.description] = despesa.value;
					});

					await this.setState({
						tipo_avaliacao: objetivos.tipo,
						impostoDefinido: objetivos.imposto_definido,
						descricao: objetivos.descricao,
						depreciacao_amortizacao_definido:
							objetivos.depreciacao_amortizacao_definido,
						imposto_sobre_lucro_perc: objetivos.imposto_sobre_lucro_definido,
						despesasDefinidas: objetivos.despesas,
						...despesas,
					});
				} else {
					const despesas = {};
					analise.despesas.forEach((despesa) => {
						despesas["objetivo_" + despesa.field] = 0;
					});

					await this.setState({
						despesasDefinidas: [],
						...despesas,
					});
				}

				if (receita) {
					const impostoProximoAno = parseFloat(
						((receita.meta * this.state.impostoAnoAnterior) / 100).toFixed(2)
					);
					await this.setState({
						impostoProximoAno: impostoProximoAno,
						receitaBrutaProximoAno: receita.meta,
						lucroLiquidoRentabilidade: rentabilidade.meta_rentabilidade || 0,
						percentualPreenchido: this.calcularTotalDespesasPreenchidas(),
						impostoDefinidoManualmente:
							!(this.state.impostoAnoAnterior === this.state.impostoDefinido) &&
							this.state.impostoDefinido !== 0,
					});
				}

				this.setState({
					estrategias: result.estrategias_disponiveis,
					limiteEstrategias: result.limite_estrategias,
					estrategiasEscolhida: metas.estrategias_definidas,
				});

				await this.calculaOrcamentoDisponivel();
			})
			.catch((err) => {
				console.error(err);
				toast.error("Não foi possível carregar alguns dados :(");
			});
	};

	calculaOrcamentoDisponivel = async () => {
		const receitaBruta = this.state.receitaBrutaProximoAno;
		const lucroLiquidoPrevisto = this.state.lucroLiquidoRentabilidade;
		let impostoDefinido;
		if (this.state.impostoDefinido) {
			impostoDefinido = (receitaBruta * this.state.impostoDefinido) / 100;
		} else {
			impostoDefinido = 0.0;
		}
		const depreciacaoAmortizacao = this.state.depreciacao_amortizacao_definido;
		const impostoSobreLucroPerc = this.state.imposto_sobre_lucro_perc;
		const impostoSobreLucroDefinido =
			(receitaBruta * impostoSobreLucroPerc) / 100;
		let orcamentoDespesaProximoAno =
			receitaBruta -
			impostoDefinido -
			depreciacaoAmortizacao -
			impostoSobreLucroDefinido -
			lucroLiquidoPrevisto;

		await this.setState({
			orcamentoDespesaProximoAno: orcamentoDespesaProximoAno,
			impostoProximoAno: impostoDefinido,
			imposto_sobre_lucro_definido: impostoSobreLucroDefinido,
		});

		await this.calcularContingencia();
	};

	toggleModal(e, field, key, despesaNome) {
		e.preventDefault();

		if (field !== undefined) {
			let fieldSugerido = this.state.despesas_anteriores[key];
			let perc = parseFloat(
				Generic.formatNumber(fieldSugerido["percentual"]).replace(",", ".")
			);
			let valorSugerido = (this.state.orcamentoDespesaProximoAno * perc) / 100;
			valorSugerido = this.calc(valorSugerido, "R$");

			let percSugerido = this.calc(fieldSugerido["percentual"], "%");

			this.setState({
				modalEdit: !this.state.modalEdit,
				fieldEdit: field,
				valueEdit: Generic.formatNumber(this.state[field]),
				percEdit: this.calcularValor(field),
				showMessageEdit: false,
				valorSugerido: valorSugerido,
				percentualSugerido: percSugerido,
				despesaNome: despesaNome,
			});
		} else {
			this.setState({
				modalEdit: !this.state.modalEdit,
				despesaNome: "",
			});
		}
	}

	handlePageButton = (e, resource) => {
		e.preventDefault();
		let id = this.state.companyId;
		if (resource.includes("<<")) {
			this.props.history.push(
				`/hub/${id}/gestao/categoria/metas/financeiro/rentabilidade`
			);
		} else if (resource.includes(">>")) {
			this.props.history.push(
				`/hub/${id}/gestao/categoria/metas/financeiro/orcamento`
			);
		}
	};

	percentage(num, per) {
		return (100 * per) / num;
	}

	convertStringToFloat = (string, decimals = 2) => {
		let valueEdit = string
			.replaceAll("R$ ", "")
			.replaceAll(".", "")
			.replaceAll(",", ".");
		let spliter = valueEdit.split(".");
		let inteiro = spliter[0];
		let decimal = spliter[1];
		if (decimal === undefined) {
			decimal = "00";
		} else {
			decimal = decimal.substring(0, decimals);
		}
		valueEdit = inteiro + "." + decimal;

		return parseFloat(valueEdit);
	};

	handleChange = async (event) => {
		let field = event.target.id;
		let value = event.target.value;

		if (field === "percEdit") {
			let valueEdit = this.convertStringToFloat(value);
			valueEdit = (
				this.state.orcamentoDespesaProximoAno *
				(valueEdit / 100)
			).toFixed(2);
			valueEdit = `R$ ${Generic.formatNumber(valueEdit)}`;
			await this.setState({
				[field]: value,
				valueEdit: valueEdit,
			});
		} else if (field === "valueEdit") {
			let valueEdit = this.convertStringToFloat(value);
			valueEdit = (
				(valueEdit * 100) /
				this.state.orcamentoDespesaProximoAno
			).toFixed(2);
			valueEdit = `${Generic.formatNumber(valueEdit)}`;
			await this.setState({
				[field]: value,
				percEdit: valueEdit,
			});
		} else {
			await this.setState({
				[field]: value,
			});
		}

		await this.calculaOrcamentoDisponivel();
		this.setState({
			hasChange: true,
		});
	};

	calcularValor(valor, tipo = "%") {
		let val = this.percentage(
			this.state.orcamentoDespesaProximoAno,
			this.state[valor]
		);
		if (tipo === "%") {
			return `${Generic.formatNumber(val)}%`;
		} else {
			return val;
		}
	}

	calcularTotalDespesasPreenchidas = () => {
		let perc = 0;

		for (let i = 0; i < this.state.despesas_anteriores.length; i++) {
			const despesa = this.state.despesas_anteriores[i]["field"];
			const objetivo_field = `objetivo_${despesa}`;
			const perc_objetivo = this.state[objetivo_field] || 0;
			perc += parseFloat(perc_objetivo);
		}

		return parseFloat(perc.toFixed(2));
	};

	calcularContingencia = async () => {
		const total = parseFloat(this.state.orcamentoDespesaProximoAno.toFixed(2));
		const gasto = this.calcularTotalDespesasPreenchidas();
		const contingencia = total - gasto;
		await this.setState({
			valorContingencia: contingencia,
		});
	};

	calcularPerncentualTotalDespesas = () => {
		let perc = 0;

		for (let i = 0; i < this.state.despesas_anteriores.length; i++) {
			let perc_objetivo = this.state.despesas_anteriores[i];
			perc_objetivo = `objetivo_${perc_objetivo["field"]}`;
			perc_objetivo = this.calcularValor(perc_objetivo, "n");
			perc += perc_objetivo;
		}

		return this.calc(perc, "%");
	};

	handleSaveButton = async (e, callback, showConfirmation = true) => {
		e.preventDefault();
		if (!this.state.hasChange) {
			if (showConfirmation) toast.success("Dados atualizados com sucesso");
			return;
		}

		const total = this.convertStringToFloat(
			this.calcularPerncentualTotalDespesas()
		);

		if (total > 100) {
			toast.error("A soma dos valores ultrapassa o orçamento disponível :(");
			return;
		}

		const data = {
			objetivo: {
				imposto_ano_anterior: this.state.impostoAnoAnterior,
				imposto_definido: this.state.impostoDefinido,
				depreciacao_amortizacao_definido:
					this.state.depreciacao_amortizacao_definido,
				imposto_sobre_lucro_definido: this.state.imposto_sobre_lucro_perc,
				tipo: this.state.tipo_avaliacao,
				descricao: this.state.descricao,
				dreId: this.state.dreId,
				despesas: {},
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

		for (let i = 0; i < this.state.despesas_anteriores.length; i++) {
			let despesa = this.state.despesas_anteriores[i]["field"];
			let objetivo_field = `objetivo_${despesa}`;
			data["objetivo"]["despesas"][despesa] = this.state[objetivo_field] || 0;
		}

		await Metas.postDefinicao("financeiro", "custos", data)
			.then((result) => {
				const { message } = result;
				if (showConfirmation) toast.success(message);
			})
			.catch((err) => {
				console.error(err.response.data);
				if (showConfirmation) toast.error(err.response.data.message);
			});
	};

	calc = (valor, tipo) => {
		let value;
		if (tipo === "%") {
			value = `${Generic.formatNumber(valor)}%`;
		} else {
			value = `R$ ${Generic.formatNumber(valor)}`;
		}

		return value;
	};

	handleUpdateValue = () => {
		let percAtual = parseFloat(
			this.convertStringToFloat(this.state.percEdit)
		).toFixed(2);
		let valueAtual = parseFloat(
			this.convertStringToFloat(this.state.valueEdit)
		).toFixed(2);

		if (percAtual > 100 || valueAtual > this.state.orcamentoDespesaProximoAno) {
			this.setState({
				showMessageEdit: true,
				messageEdit: "O valor está acima do orçamento disponível",
			});
		} else {
			this.setState({
				showMessageEdit: false,
				messageEdit: "",
			});
		}
	};

	validationValues = () => {
		return true;
	};

	confirmUpdate = async () => {
		if (this.validationValues()) {
			let value = parseFloat(this.convertStringToFloat(this.state.valueEdit));
			await this.setState({
				[this.state.fieldEdit]: value,
				showMessageEdit: false,
				messageEdit: "",
				modalEdit: false,
				hasChange: true,
			});
			await this.calcularContingencia();
		}
	};

	confirmModalUpdate = async (e, modalName) => {
		let field, value;
		if (modalName === "modalDepreciacao") {
			value = parseFloat(this.convertStringToFloat(this.state.depreciacaoEdit));
			field = "depreciacao_amortizacao_definido";
		} else if (modalName === "modalImpostosLucro") {
			value = parseFloat(
				this.convertStringToFloat(this.state.impostosLucroEdit)
			);
			field = "imposto_sobre_lucro_perc";
		}

		await this.setState({
			[field]: value,
			[modalName]: false,
			hasChange: true,
		});

		await this.calculaOrcamentoDisponivel();
	};

	toggleModalImposto = (e, valueDefinido) => {
		e.preventDefault();
		this.setState({
			modalImposto: !this.state.modalImposto,
			impostoEdit: Generic.formatNumber(valueDefinido),
		});
	};

	confirmModalImposto = async (e) => {
		e.preventDefault();
		let value = parseFloat(this.convertStringToFloat(this.state.impostoEdit));
		await this.setState({
			impostoDefinido: value,
			modalImposto: false,
			impostoDefinidoManualmente: true,
		});

		await this.calculaOrcamentoDisponivel();
	};

	modalImposto = (key) => {
		return (
			<Modal
				isOpen={this.state.modalImposto}
				toggle={this.toggleModalImposto}
				key={key}
			>
				<ModalHeader toggle={this.toggleModalImposto}>
					Definir imposto manualmente
				</ModalHeader>
				<ModalBody>
					<Row>
						<Col sm={6}>
							<FormGroup>
								<Label for="impostoEdit">Alíquota em %</Label>
								<Number
									id="impostoEdit"
									value={this.state.impostoEdit}
									onChange={this.handleChange}
								/>
							</FormGroup>
						</Col>
					</Row>
				</ModalBody>
				<ModalFooter>
					<Button color="danger" onClick={this.toggleModalImposto}>
						Cancelar
					</Button>
					<Button color="success" onClick={this.confirmModalImposto}>
						Definir
					</Button>
				</ModalFooter>
			</Modal>
		);
	};

	toggleModais = async (e, modalName, field, valueDefinido) => {
		e.preventDefault();
		await this.setState({
			[modalName]: !this.state[modalName],
			[field]: Generic.formatNumber(valueDefinido),
		});
	};

	modalDepreciacao = (key) => {
		let modalName = "modalDepreciacao";

		let depre = this.state.depreciacao_amortizacao_definido;
		if (depre) {
			depre = depre.toString().replace(".", ",");
		}

		return (
			<Modal
				isOpen={this.state.modalDepreciacao}
				toggle={(e) => this.toggleModais(e, modalName)}
				key={key}
			>
				<ModalHeader toggle={(e) => this.toggleModais(e, modalName)}>
					Definir Depreciação manualmente
				</ModalHeader>
				<ModalBody>
					<Row>
						<Col sm={6}>
							<FormGroup>
								<Label for="depreciacaoEdit">Valor em R$</Label>
								<TextMask
									Component={InputAdapter}
									value={depre || 0.0}
									mask={mask}
									guide
									onChange={this.handleChange}
									className="form-control"
									id={"depreciacaoEdit"}
								/>
							</FormGroup>
						</Col>
					</Row>
				</ModalBody>
				<ModalFooter>
					<Button
						color="danger"
						onClick={(e) => this.toggleModais(e, modalName)}
					>
						Cancelar
					</Button>
					<Button
						color="success"
						onClick={(e) => this.confirmModalUpdate(e, modalName)}
					>
						Definir
					</Button>
				</ModalFooter>
			</Modal>
		);
	};

	modalImpostoLucro = (key) => {
		let modalName = "modalImpostosLucro";

		return (
			<Modal
				isOpen={this.state.modalImpostosLucro}
				toggle={(e) => this.toggleModais(e, modalName)}
				key={key}
			>
				<ModalHeader toggle={(e) => this.toggleModais(e, modalName)}>
					Definir Impostos sobre Lucro manualmente
				</ModalHeader>
				<ModalBody>
					<Row>
						<Col sm={6}>
							<FormGroup>
								<Label for="impostosLucroEdit">
									Percentual de Imposto sobre Lucro
								</Label>
								{/*/>*/}
								<Number
									id="impostosLucroEdit"
									value={Generic.formatNumber(
										this.state.imposto_sobre_lucro_perc
									)}
									onChange={this.handleChange}
								/>
							</FormGroup>
						</Col>
					</Row>
				</ModalBody>
				<ModalFooter>
					<Button
						color="danger"
						onClick={(e) => this.toggleModais(e, modalName)}
					>
						Cancelar
					</Button>
					<Button
						color="success"
						onClick={(e) => this.confirmModalUpdate(e, modalName)}
					>
						Definir
					</Button>
				</ModalFooter>
			</Modal>
		);
	};

	modalEdit = (key) => {
		if (!this.state.modalEdit) return null;

		let message = null;

		if (this.state.showMessageEdit) {
			message = (
				<Row>
					<Col sm={12}>
						<Alert color="danger">{this.state.messageEdit}</Alert>
					</Col>
				</Row>
			);
		}

		let btnConfirmar;
		if (!this.state.showMessageEdit) {
			btnConfirmar = (
				<Button color="success" onClick={this.confirmUpdate}>
					Alterar
				</Button>
			);
		} else {
			btnConfirmar = (
				<Button color="success" onClick={this.confirmUpdate} disabled>
					Alterar
				</Button>
			);
		}

		return (
			<Modal isOpen={this.state.modalEdit} toggle={this.toggleModal} key={key}>
				<ModalHeader toggle={this.toggleModal}>
					<Container>
						<Row>Editar Despesa</Row>
						<Row>
							<Badge color="success">{this.state.despesaNome}</Badge>
						</Row>
					</Container>
				</ModalHeader>
				<ModalBody>
					<Row>
						<Col sm={6}>
							<FormGroup>
								<Label for="percentualSugerido">Percentual sugerido</Label>
								<Number
									id="percentualSugerido"
									value={this.state.percentualSugerido}
									onChange={this.handleChange}
									onKeyUp={this.handleUpdateValue}
									readOnly={true}
								/>
							</FormGroup>
						</Col>
						<Col sm={6}>
							<FormGroup>
								<Label for="valueEdit">Valor sugerido</Label>
								<TextMask
									Component={InputAdapter}
									value={this.state.valorSugerido}
									mask={mask}
									guide
									onChange={this.handleChange}
									onKeyUp={this.handleUpdateValue}
									className="form-control"
									id="valorSugerido"
									disabled
								/>
							</FormGroup>
						</Col>
					</Row>
					<Row>
						<Col sm={6}>
							<FormGroup>
								<Label for="valueEdit">Percentual definido</Label>
								<Number
									id="percEdit"
									value={this.state.percEdit}
									onChange={this.handleChange}
									onKeyUp={this.handleUpdateValue}
									readOnly={true}
								/>
							</FormGroup>
						</Col>
						<Col sm={6}>
							<FormGroup>
								<Label for="valueEdit">Valor definido em R$</Label>
								<TextMask
									Component={InputAdapter}
									value={this.state.valueEdit}
									mask={mask}
									guide
									onChange={this.handleChange}
									onKeyUp={this.handleUpdateValue}
									className="form-control"
									id="valueEdit"
									// disabled
								/>
							</FormGroup>
						</Col>
					</Row>
					{message}
				</ModalBody>
				<ModalFooter>
					<Button color="danger" onClick={this.toggleModal}>
						Cancelar
					</Button>
					{btnConfirmar}
				</ModalFooter>
			</Modal>
		);
	};

	tableMeta = () => {
		return (
			<div>
				<Row>
					<Col xs={12} sm={6} md={4} lg={3}>
						<CustomCard
							value={
								"R$ " + Generic.formatNumber(this.state.receitaBrutaProximoAno)
							}
							color={"info"}
							subtitle={
								"Meta de Receita Bruta para " +
								this.state.exercicio_definido +
								" definida em Faturamento"
							}
						/>
					</Col>
				</Row>
				<br />
				<div>
					<CardMetaSugestao
						label={"O % médio de impostos do exercício anterior foi de:"}
						label_value={
							Generic.formatNumber(this.state.impostoAnoAnterior, 2) + "%"
						}
						fieldSugestao={"impostoAnoAnterior"}
						fieldMeta={"impostoDefinido"}
						states={this.state}
						handleChange={this.handleChange}
					/>
					<CardMetaSugestao
						label={"O valor da Depreciação e Amortização foi de:"}
						label_value={
							"R$ " +
							Generic.formatNumber(this.state.depreciacao_amortizacao, 2)
						}
						fieldSugestao={"depreciacao_amortizacao"}
						fieldMeta={"depreciacao_amortizacao_definido"}
						states={this.state}
						handleChange={this.handleChange}
					/>
					<CardMetaSugestao
						label={"O valor de Impostos sobre Lucro (IR + CS) foi de:"}
						label_value={
							Generic.formatNumber(
								this.state.imposto_sobre_lucro_perc_anterior,
								2
							) + "%"
						}
						fieldSugestao={"imposto_sobre_lucro_perc_anterior"}
						fieldMeta={"imposto_sobre_lucro_perc"}
						states={this.state}
						handleChange={this.handleChange}
					/>
				</div>
				<br />
				<Row>
					<Col xs={12} sm={6} md={6} lg={3}>
						<CustomCard
							value={
								"R$ " +
								Generic.formatNumber(this.state.lucroLiquidoRentabilidade)
							}
							color={"info"}
							title={"Lucro Líquido Previsto"}
							subtitle={"Definido na Rentabilidade"}
						/>
					</Col>
					<Col xs={12} sm={6} md={6} lg={3}>
						<CustomCard
							value={"R$ " + Generic.formatNumber(this.state.impostoProximoAno)}
							color={"info"}
							title={"Impostos Previstos"}
							subtitle={
								Generic.formatNumber(this.state.impostoDefinido) +
								"% da Receita Bruta Prevista"
							}
							dropdown={[
								{
									title: "Alterar",
									onClick: (e) =>
										this.toggleModalImposto(e, this.state.impostoDefinido),
								},
							]}
						/>
					</Col>
					<Col xs={12} sm={6} md={6} lg={3}>
						<CustomCard
							value={
								"R$ " +
								Generic.formatNumber(
									this.state.depreciacao_amortizacao_definido
								)
							}
							color={"info"}
							title={"Depreciação e Amortização Previsto"}
							subtitle={
								Generic.formatNumber(
									(100 / this.state.receitaBrutaProximoAno) *
										this.state.depreciacao_amortizacao_definido
								) + "% da Receita Bruta Prevista"
							}
							dropdown={[
								{
									title: "Alterar",
									onClick: (e) =>
										this.toggleModais(
											e,
											"modalDepreciacao",
											"depreciacaoEdit",
											this.state.depreciacao_amortizacao_definido
										),
								},
							]}
						/>
					</Col>
					<Col xs={12} sm={6} md={6} lg={3}>
						<CustomCard
							value={
								"R$ " +
								Generic.formatNumber(this.state.imposto_sobre_lucro_definido)
							}
							color={"info"}
							title={"Previsão de Impostos sobre Lucro (IR + CS)"}
							// subtitle={this.state.imposto_sobre_lucro_perc+'% da Receita Bruta Prevista'}
							subtitle={
								Generic.formatNumber(this.state.imposto_sobre_lucro_perc) +
								"% da Receita Bruta Prevista"
							}
							dropdown={[
								{
									title: "Alterar",
									onClick: (e) =>
										this.toggleModais(
											e,
											"modalImpostosLucro",
											"impostosLucroEdit",
											this.state.imposto_sobre_lucro_perc
										),
								},
							]}
						/>
					</Col>
				</Row>
				<br />
				<Row>
					<Col xs="12" sm="4" lg="4" className={"align-self-center"}>
						<Label>
							O orçamento disponível para custos e despesas do próximo exercicio
							é de:
						</Label>
					</Col>
					<Col xs="12" sm="2" lg="2">
						<h3>
							<Badge color="success">
								R$ {Generic.formatNumber(this.state.orcamentoDespesaProximoAno)}
							</Badge>
						</h3>
					</Col>
				</Row>
			</div>
		);
	};

	aceitarSugestaoOrcamento = async (e) => {
		e.preventDefault();

		const valorDisponivel = this.state.orcamentoDespesaProximoAno;
		const data = {};

		for (let i = 0; i < this.state.despesas_anteriores.length; i++) {
			const field = this.state.despesas_anteriores[i];
			const name = `objetivo_${field.field}`;
			const perc = field.percentage;
			data[name] = (valorDisponivel * perc) / 100;
		}

		await this.setState({
			...data,
		});
		await this.calcularContingencia();
	};

	tableSugestao = () => {
		let rowsDespesa = null;
		if (this.state.despesas_anteriores) {
			rowsDespesa = this.state.despesas_anteriores.map((e, key) => {
				const field = this.state.despesas_anteriores[key];
				const perc = parseFloat(
					Generic.formatNumber(field["percentage"]).replace(",", ".")
				);
				const valorSugerido =
					(this.state.orcamentoDespesaProximoAno * perc) / 100;
				const objetivo_field = `objetivo_${field["field"]}`.replace("/", "_");

				return (
					<Row key={key} className={"justify-content-center"}>
						<Col lg={5} xl={4}>
							<Row>
								<Col xs={4} sm={4} md={4} lg={4} xl={5}>
									{field["description"]}
								</Col>
								<Col xs={4} sm={4} md={4} lg={5} xl={4}>
									R$ {Generic.formatNumber(field["value"])}
								</Col>
								<Col xs={4} sm={4} md={4} lg={3} xl={3}>
									{Generic.formatNumber(field["percentage"])}%
								</Col>
							</Row>
						</Col>
						<Col lg={3} xl={2}>
							<Row>
								<Col md={12} lg={7} className={""}>
									{this.calc(valorSugerido, "R$")}
								</Col>
								<Col lg="5" className="d-none d-lg-block">
									{this.calc(field["percentage"], "%")}
								</Col>
							</Row>
						</Col>
						<Col lg={4} xl={6}>
							<Row>
								<Col xs={5} sm={2} md={2} lg={4} xl={3}>
									<Label>{this.calc(this.state[objetivo_field], "R$")}</Label>
								</Col>
								<Col xs={5} sm={2} md={2} lg={4} xl={3}>
									<Label>{this.calcularValor(objetivo_field)}</Label>
								</Col>
								<Col xl={4} className="d-none d-xl-block">
									<Input
										id={objetivo_field}
										type={"range"}
										min={0}
										max={100}
										value={this.calcularValor(objetivo_field, "n") || 0.0}
										onChange={this.handleChange}
										step={0.01}
										disabled
									/>
								</Col>
								<Col xs={2} sm={2} md={2} lg={4} xl={2}>
									<Button
										id={`button_${objetivo_field}`}
										color="info"
										size="sm"
										onClick={(e) =>
											this.toggleModal(
												e,
												objetivo_field,
												key,
												field["description"]
											)
										}
									>
										Editar Valor
									</Button>
									<TooltipDefault
										target={`button_${objetivo_field}`}
										hintText={`Editar ${field["description"]}`}
									/>
								</Col>
							</Row>
						</Col>
					</Row>
				);
			});
		}

		let btnSugestao = null;
		if (this.state.orcamentoDespesaProximoAno > 0) {
			btnSugestao = (
				<Button
					color="warning"
					size="sm"
					onClick={this.aceitarSugestaoOrcamento}
					block
				>
					Aceitar sugestão
				</Button>
			);
		}

		const valorContingencia = Generic.formatNumber(
			this.state.valorContingencia
		);

		return (
			<Row>
				<Col xs="12">
					<Card className="card-accent-warning">
						<CardHeader>
							<strong>Sugestão de Orçamento para o próximo Exercício</strong>
						</CardHeader>
						<CardBody>
							<Form>
								<Row className={"justify-content-center"}>
									<Col lg={5} xl={4}>
										<Badge color={"success"} className={"w-100"}>
											DESPESAS E CUSTOS DO EXERCÍCIO ANTERIOR
										</Badge>
									</Col>
									<Col lg={3} xl={2}>
										<Badge color={"warning"} className={"w-100"}>
											ORÇAMENTO SUGERIDO
										</Badge>
									</Col>
									<Col lg={4} xl={6}>
										<Badge color={"info"} className={"w-100"}>
											MODIFIQUE OS VALORES DE ACORDO COM A NECESSIDADE
										</Badge>
									</Col>
								</Row>
								<br />
								{rowsDespesa}
								<Row className={"justify-content-center"}>
									<Col lg={5} xl={4}>
										<Row>
											<Col xs={4} sm={4} md={4} lg={4} xl={5} />
											<Col xs={4} sm={4} md={4} lg={5} xl={4}>
												<Badge color="success">
													R${" "}
													{Generic.formatNumber(this.state.custoTotalAnterior)}
												</Badge>
											</Col>
											<Col xs={4} sm={4} md={4} lg={3} xl={3}>
												<Badge color="success">100,00%</Badge>
											</Col>
										</Row>
									</Col>
									<Col lg={3} xl={2}>
										<Row className={"justify-content-center"}>
											<Col>{btnSugestao}</Col>
										</Row>
									</Col>
									<Col lg={4} xl={6}>
										<Row>
											<Col xs={5} sm={2} md={2} lg={4} xl={3}>
												<Badge color="info">
													{this.calc(
														this.calcularTotalDespesasPreenchidas(),
														"R$"
													)}
												</Badge>
											</Col>
											<Col xs={5} sm={2} md={2} lg={4} xl={3}>
												<Badge color="info">
													{this.calcularPerncentualTotalDespesas()}%
												</Badge>
											</Col>
										</Row>
									</Col>
								</Row>
								<br />
								<Row>
									<Col lg={5} xl={4} className={"align-self-center"} />
									<Col lg={3} xl={2} className={"align-self-center"}>
										<Label>Valor para Contingência:</Label>
									</Col>
									<Col lg={4} xl={6}>
										<h3>
											<Badge color="info">R$ {valorContingencia}</Badge>
										</h3>
									</Col>
								</Row>
							</Form>
						</CardBody>
					</Card>
				</Col>
			</Row>
		);
	};

	loaded = () => {
		return (
			<CardBaseMeta
				newModel={true}
				companyId={this.state.companyId}
				category={"Custos e Despesas"}
				objectiveOptions={[
					{
						value: "RRC",
						text: "Racionalizar e Reduzir Custos",
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
				cardMetaTitulo={"Base de Orçamento"}
				cardAvaliacao={this.tableSugestao()}
				buttons={[
					{
						placement: "top",
						text: "Próximo",
						action: ">>",
						icon: "fa fa-arrow-right",
						content: "Orçamento anual",
						onClick: (e) => this.handlePageButton(e, ">>"),
					},
					{
						placement: "top",
						text: "Anterior",
						action: "<<",
						icon: "fa fa-arrow-left",
						content: "Rentabilidade",
						onClick: (e) => this.handlePageButton(e, "<<"),
					},
				]}
				buttonsave={true}
				save={this.handleSaveButton}
				modal={[
					this.modalEdit,
					this.modalImposto,
					this.modalDepreciacao,
					this.modalImpostoLucro,
				]}
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

export default Financeiro_Custos;
