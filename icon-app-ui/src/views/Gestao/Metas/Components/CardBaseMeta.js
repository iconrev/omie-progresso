import React, { Component } from "react";
import { toast } from "react-toastify";
import {
	Badge,
	Button,
	Card,
	CardBody,
	CardFooter,
	CardHeader,
	Col,
	Input,
	Modal,
	ModalBody,
	ModalFooter,
	ModalHeader,
	Row,
} from "reactstrap";
import TooltipItem from "../../../../components/TooltipItem";
import Select from "react-select";
import SwotAnalysis from "../../Diagnostico/Swot/SwotAnalysis";
import SwotButton from "../../Diagnostico/Swot/SwotButton";
import ApiMetas from "../../../../service/api_metas";
import ButtonLoading from "../../../../components/ButtonLoading";
import CompanyService from "../../../../service/CompanyService";

const Api_Metas = new ApiMetas();
const LIMITE_ESTRATEGIAS = 3;

class CardBaseMeta extends Component {
	constructor(props) {
		super(props);

		this.company = CompanyService.getDataCompany();

		this.textInput = React.createRef();

		this.state = {
			isLoading: false,
			readOnlygetDataQuiz: this.props.readOnly || false,
			companyId: this.props.companyId,
			objectiveOptions: this.props.objectiveOptions || [],
			buttons: this.props.buttons || [],
			cardMetaShowPanel: this.props.cardMetaShowPanel,
			cardEstrategiaShowPanel: this.props.cardEstrategiaShowPanel,
			showModalEstrategia: false,
			inputEstrategiaPersonalizada: "",
			btnDefinirEstrategia: true,
			modalSwot: false,
		};
	}

	renderSelectObjetivo = () => {
		let options = [];
		options.push(
			<option value="UN" key={0}>
				Selecione o tipo de objetivo
			</option>
		);
		this.state.objectiveOptions.map((item, index) => {
			return options.push(
				<option value={item.value} key={index + 1}>
					{item.text}
				</option>
			);
		});
		options.push(
			<option value="OU" key={9999}>
				Defina
			</option>
		);

		let inputDescricao;
		if (this.props.objectiveSelected === "OU") {
			inputDescricao = (
				<Col xs="12" md="4" lg="4">
					<Input
						type={"text"}
						className="form-control"
						onChange={async (e) => await this.props.objectiveHandle(e, false)}
						value={this.props.objectiveDescription}
						id={"descricao"}
						readOnly={this.state.readOnly}
						placeholder={"Defina seu Objetivo Estratégico personalizado"}
					/>
				</Col>
			);
		}

		return (
			<div>
				<Row>
					<Col xs="12" md="4" lg="4">
						<Input
							type="select"
							className="form-control"
							onChange={async (e) => await this.props.objectiveHandle(e, false)}
							value={this.props.objectiveSelected}
							id={"tipo_avaliacao"}
							readOnly={this.state.readOnly}
							ref={(inputEl) => (this.textInput = inputEl)}
						>
							{options.map((value) => value)}
						</Input>
					</Col>
					{inputDescricao}
				</Row>
			</div>
		);
	};

	validateQuiz = () => {
		let quiz = this.props.dataQuiz;

		let errors = 0;
		for (let i = 0; i < quiz.length; i++) {
			let avaliacao = quiz[i];
			let title = avaliacao.descricao;
			if (avaliacao.definicao_meta === true) {
				if (
					avaliacao.estrategia_escolhida_id === null ||
					avaliacao.estrategia_escolhida_label === null
				) {
					toast.error("Antes de continuar, defina a estratégia para " + title);
					errors += 1;
				}
				if (avaliacao.estrategia_escolhida_label === "Defina sua estratégia") {
					toast.error("Antes de continuar, defina a estratégia para " + title);
					errors += 1;
				}
				if (
					avaliacao.meta_avaliacao === null ||
					avaliacao.meta_avaliacao === ""
				) {
					toast.error(
						"Antes de continuar, defina a Meta de Classificação para " + title
					);
					errors += 1;
				}
			}
		}

		return errors === 0;
	};

	savePost = async (e, url, data, showConfirmation) => {
		await Api_Metas.post(url)
			.then((result) => {
				const { data } = result;
				if (showConfirmation) toast.success(data.message);
				return true;
			})
			.catch((err) => {
				console.error(err);
				if (showConfirmation) toast.error(err.response.data.message);
				return false;
			});
	};

	validaLimiteEstrategia = () => {
		if (this.props.cardEstrategiaShowPanel === false) {
			return true;
		}

		let estrategiasEscolhida = 0;
		let limite = this.props.estrategias.limite;

		if (this.props.quizVersion === true) {
			for (let i = 0; i < this.props.dataQuiz.length; i++) {
				let check = this.props.dataQuiz[i].check;
				if (check === "Y") {
					estrategiasEscolhida += 1;
				}
			}
		} else {
			let estrategias = this.props.estrategias.estrategiasEscolhida || 0;
			estrategiasEscolhida = estrategias === 0 ? 0 : estrategias.length;
		}

		let status = estrategiasEscolhida > limite;
		if (status) {
			toast.error(
				"Não é possível definir estratégias acima do limite de " +
					limite +
					" por categoria."
			);
		}

		return !status;
	};

	validateSave = async (e, showConfirmation = true) => {
		e.preventDefault();
		if (this.props.objectiveSelected === "UN") {
			toast.warn("Antes de continuar, defina o Objetivo Estratégico");
			this.textInput.focus();
			return false;
		}

		if (!this.validaLimiteEstrategia()) {
			return false;
		}

		if (this.props.quizVersion === true) {
			if (!this.validateQuiz()) {
				return false;
			}
		}

		if (!this.company.isDemo && !this.company.isHelp) {
			this.setState({
				isLoading: true,
			});
			await this.props.save(e, this.savePost, showConfirmation);
			this.setState({
				isLoading: false,
			});
		}

		return true;
	};

	validateNextPage = async (e, functionHandle) => {
		e.preventDefault();

		if (await this.validateSave(e, false)) {
			functionHandle(e);
		}
	};

	renderButtons = () => {
		return (
			<div>
				{this.state.buttons.map((button, i) => {
					return (
						<TooltipItem
							key={i}
							item={button}
							id={i}
							onClick={(e) => this.validateNextPage(e, button.onClick)}
						/>
					);
				})}
				{this.company.isPremium &&
					!this.company.isDemo &&
					!this.company.isHelp && (
						<ButtonLoading
							onClick={this.validateSave}
							className="btn btn-sm btn-success mr-1 float-right"
							isLoading={this.state.isLoading}
						>
							<i className="fa fa-edit mr-1" />
							Salvar
						</ButtonLoading>
					)}
			</div>
		);
	};

	renderCardAvaliacao = () => {
		return this.props.cardAvaliacao ? this.props.cardAvaliacao : null;
	};

	getDataQuiz = () => {
		const dataQuiz = [];

		const estrategiaOptions = [...this.props.estrategias.options];
		const perspectiva = this.props.perspective;

		for (let i = 0; i < this.props.dataQuiz.length; i++) {
			const quiz = this.props.dataQuiz[i];

			const pontuacao = [];
			for (let item in quiz.pontuacao.split(";")) {
				let pont = parseFloat(quiz.pontuacao.split(";")[parseInt(item)]);
				pontuacao.push(pont);
			}

			const opcao_avaliacao = [];
			for (let item in quiz.avaliacao_opcao_value.split(";")) {
				let value = quiz.avaliacao_opcao_value
					.split(";")
					[parseInt(item)].trim();
				let label = quiz.avaliacao_opcao_label
					.split(";")
					[parseInt(item)].trim();
				opcao_avaliacao.push({
					value: value,
					label: label,
				});
			}

			const avaliacao_anterior =
				this.props.avaliacaoQuiz[perspectiva][quiz.field];

			const nova_avaliacao = quiz.meta_avaliacao
				? quiz.meta_avaliacao
				: avaliacao_anterior;

			const option = opcao_avaliacao.filter(
				(element) => element.value === nova_avaliacao
			)[0];
			const pontuacao_nova_avaliacao =
				pontuacao[opcao_avaliacao.indexOf(option)];

			const row = {
				id: quiz.id,
				opcao_avaliacao: opcao_avaliacao,
				avaliacao_anterior: avaliacao_anterior,
				meta_avaliacao: nova_avaliacao,
				pontuacao_nova_avaliacao:
					pontuacao_nova_avaliacao !== undefined ? pontuacao_nova_avaliacao : 0,
				descricao: quiz.descricao,
				pontuacao: quiz.pontuacao,
				questionario_avaliacao_id: quiz.questionario_avaliacao_id,
				check: quiz.definicao_meta ? "Y" : "N",
				estrategia: quiz.estrategia_escolhida_id,
				estrategia_label: quiz.estrategia_escolhida_label,
				field: quiz.field,
				opcao_estrategias: estrategiaOptions,
			};

			dataQuiz.push(row);
		}

		return dataQuiz;
	};

	getValueCompetencia = (data) => {
		let maxValue = 0;
		let point = 0;

		for (let i = 0; i < data.length; i++) {
			let maxTemp = 0;
			let field = data[i];
			for (let item in field.pontuacao.split(";")) {
				let pont = parseFloat(field.pontuacao.split(";")[parseInt(item)]);
				maxTemp = pont > maxTemp ? pont : maxTemp;
			}
			maxValue += maxTemp;
			point += field["pontuacao_nova_avaliacao"];
		}
		return (point / maxValue) * 100;
	};

	renderCardMeta = () => {
		let cardMeta = null;
		if (this.props.cardMeta) {
			if (this.props.quizVersion === true) {
				let data = this.getDataQuiz();
				cardMeta = this.props.cardMeta(data, this.getValueCompetencia(data));
			} else {
				if (typeof this.props.cardMeta === "function") {
					cardMeta = this.props.cardMeta();
				} else {
					cardMeta = this.props.cardMeta;
				}
			}
		}

		return (
			<Row>
				<Col xs="12" sm="12" lg="12">
					<Card className="border-secondary">
						<CardHeader>
							{this.props.cardMetaTitulo
								? this.props.cardMetaTitulo
								: "Defina suas Metas"}
							<div className="card-header-actions">
								<i className="fa fa-calculator float-right" />
							</div>
						</CardHeader>
						<CardBody>{cardMeta}</CardBody>
					</Card>
				</Col>
			</Row>
		);
	};

	updateEstrategiaParent = async (estrategias) => {
		let event = {
			target: {
				id: "estrategiasEscolhida",
				value: estrategias,
			},
		};
		await this.props.objectiveHandle(event, false);
	};

	toggleModalEstrategia = async () => {
		await this.setState({
			showModalEstrategia: !this.state.showModalEstrategia,
		});
	};

	toggleModalSwot = async () => {
		await this.setState({
			modalSwot: !this.state.modalSwot,
		});
	};

	updateStatusSwot = async () => {
		await this.setState({
			statusSwot: !this.state.statusSwot,
		});

		if (!this.state.statusSwot) {
			toast.error("Ocorreu um problema ao carregar o SWOT :(");
			await this.updateStatusSwot();
		}
	};

	confirmModalEstrategiasUpdate = async (e) => {
		e.preventDefault();

		let estrategias = this.props.estrategias.estrategiasEscolhida;
		for (let i = 0; i < estrategias.length; i++) {
			let label = estrategias[i].label;
			if (label.includes("Defina sua estratégia")) {
				estrategias[i].label = this.state.inputEstrategiaPersonalizada;
				estrategias[i].descricao = this.state.inputEstrategiaPersonalizada;
			}
		}
		await this.updateEstrategiaParent(estrategias);
		await this.toggleModalEstrategia();
	};

	cancelModalEstrategiasUpdate = async () => {
		await this.toggleModalEstrategia();

		let estrategiasTemp = [];
		for (
			let i = 0;
			i < this.props.estrategias.estrategiasEscolhida.length;
			i++
		) {
			let label = this.props.estrategias.estrategiasEscolhida[i].label;
			let value = this.props.estrategias.estrategiasEscolhida[i].value;
			let innerValue =
				this.props.estrategias.estrategiasEscolhida[i].innerValue;

			if (label !== "Defina sua estratégia") {
				estrategiasTemp.push({
					label: label,
					innerValue: innerValue,
					value: value,
					descricao: label,
				});
			}
		}
		await this.updateEstrategiaParent(estrategiasTemp);
	};

	modalEstrategia = () => {
		return (
			<Modal
				isOpen={this.state.showModalEstrategia}
				toggle={this.cancelModalEstrategiasUpdate}
			>
				<ModalHeader toggle={this.cancelModalEstrategiasUpdate}>
					Definição de Estratégia
				</ModalHeader>
				<ModalBody>
					<Row>
						<Col>Defina sua estratégia personalizada:</Col>
					</Row>
					<Row>
						<Col>
							<Input
								id={"inputEstrategiaPersonalizada"}
								onChange={async (e) => {
									e.preventDefault();
									await this.setState({
										inputEstrategiaPersonalizada: e.target.value,
										btnDefinirEstrategia: e.target.value.length <= 5,
									});
								}}
							/>
						</Col>
					</Row>
				</ModalBody>
				<ModalFooter>
					<Button color="danger" onClick={this.cancelModalEstrategiasUpdate}>
						Cancelar
					</Button>
					<Button
						color="success"
						onClick={(e) => this.confirmModalEstrategiasUpdate(e)}
						disabled={this.state.btnDefinirEstrategia}
					>
						Definir
					</Button>
				</ModalFooter>
			</Modal>
		);
	};

	modalSwot = () => {
		if (!this.state.modalSwot) return null;

		return (
			<SwotAnalysis
				toggle={this.toggleModalSwot}
				isOpen={this.state.modalSwot}
				idCompany={this.state.companyId}
				updateStatus={this.updateStatusSwot}
				quantidadeItens={10}
			/>
		);
	};

	handleEstrategias = async (e) => {
		let estrategiasTemp = [];
		let defina = false;
		if (e !== null && e.length > 0) {
			for (let i = 0; i < e.length; i++) {
				let label = e[i].label;
				let value = e[i].value;
				let innerValue = e[i].innerValue;
				if (label.includes("Defina sua estratégia") && value === innerValue) {
					estrategiasTemp.push({
						label: label,
						innerValue: value,
						value: Math.random(),
						descricao: label,
					});
					defina = true;
				} else {
					estrategiasTemp.push({
						label: label,
						innerValue: innerValue,
						value: value,
						descricao: label,
					});
				}
			}
		}
		await this.setState({
			showModalEstrategia: defina,
		});
		await this.updateEstrategiaParent(estrategiasTemp);
	};

	renderCardEstrategia = () => {
		if (this.props.quizVersion === true) {
			return null;
		}

		if (this.props.cardEstrategiaShowPanel === false) {
			return null;
		}

		if (this.props.cardEstrategia) {
			return (
				<Row>
					<Col xs="12" sm="12" lg="12">
						<Card className="border-secondary">
							<CardHeader>
								{this.props.cardEstrategiaTitulo
									? this.props.cardEstrategiaTitulo
									: "Defina suas Estratégias"}
								<div className="card-header-actions">
									<i className="fa fa-calendar-check-o float-right" />
								</div>
							</CardHeader>
							<CardBody>
								{this.props.cardEstrategia ? this.props.cardEstrategia : null}
							</CardBody>
						</Card>
					</Col>
				</Row>
			);
		} else {
			let options = this.props.estrategias.options || [];
			let limite = this.props.estrategias.limite || LIMITE_ESTRATEGIAS;
			let estrategiasEscolhidas =
				this.props.estrategias.estrategiasEscolhida || [];

			if (options.length > 0) {
				options = options.map((opt) => ({
					label: opt.label,
					descricao: opt.label,
					innerValue: opt.value,
					value: opt.value,
				}));
			}
			if (estrategiasEscolhidas.length > 0) {
				let estrategiasTemp = [];
				for (let i = 0; i < estrategiasEscolhidas.length; i++) {
					let label = estrategiasEscolhidas[i].label;
					let value = estrategiasEscolhidas[i].value;
					let innerValue = estrategiasEscolhidas[i].innerValue;

					if (label.includes("Defina sua estratégia") && value === innerValue) {
						estrategiasTemp.push({
							label: label,
							innerValue: value,
							value: Math.random(),
							descricao: label,
						});
					} else {
						estrategiasTemp.push({
							label: label,
							innerValue: innerValue,
							value: value,
							descricao: label,
						});
					}
				}
				estrategiasEscolhidas = estrategiasTemp;
			}

			let message;

			if (
				estrategiasEscolhidas != null &&
				estrategiasEscolhidas.length === limite
			) {
				options = [];
				message = "O limite de estratégias foi alcançado.";
			} else if (options.length === 0) {
				message = "Não foi localizada nenhuma estratégia.";
			}

			return (
				<Row>
					<Col xs="12" sm="12" lg="12">
						<Card className="border-secondary">
							<CardHeader>
								Defina suas Estratégias
								<div className="card-header-actions">
									<i className="fa fa-calendar-check-o float-right" />
								</div>
							</CardHeader>
							<CardBody>
								<div>
									<Select
										value={estrategiasEscolhidas}
										isMulti
										name="strategys"
										options={options}
										className="basic-multi-select"
										classNamePrefix="select"
										placeholder="Selecione as estratégias que serão usadas para atingir o objetivo"
										noOptionsMessage={() => message}
										onChange={this.handleEstrategias}
									/>
								</div>
							</CardBody>
						</Card>
					</Col>
				</Row>
			);
		}
	};

	renderModals = () => {
		return (
			<div>
				{this.props.modal.map((modal, index) => {
					if (modal === null) {
						return null;
					} else {
						return modal(index);
					}
				})}
			</div>
		);
	};

	renderCategory = () => {
		let category = null;
		let sizeName = 16;
		let position = "text-right";

		if (this.props.newModel) {
			sizeName = 24;
			position = "text-left";
		}

		if (this.props.category) {
			category = (
				<Col xs="12" md="6" lg="6" className={position + " text-uppercase"}>
					<Badge className={"badge-secundary"}>
						<strong style={{ fontSize: sizeName }}>
							{this.props.category}
						</strong>
					</Badge>
					<span />
				</Col>
			);
		}

		return category;
	};

	btnSwotClick = async (e) => {
		e.preventDefault();
		await this.toggleModalSwot();
	};

	renderBtnSwot = () => {
		return (
			<Col xs="12" md="6" lg="6" className={"float-right"}>
				<div className="float-right">
					<SwotButton onClick={this.btnSwotClick} />
				</div>
			</Col>
		);
	};

	renderObjetivoEstrategico = () => {
		if (this.props.cardObjetivoShowPanel === false) {
			return null;
		}

		if (this.props.newModel === true) {
			return (
				<Row>
					<Col xs="12" sm="12" lg="12">
						<Card className="border-secondary">
							<CardHeader>
								Defina seu Objetivo Estratégico
								<div className="card-header-actions">
									<i className="fa fa-flag float-right" />
								</div>
							</CardHeader>
							<CardBody>
								{this.props.objectiveSelected
									? this.renderSelectObjetivo()
									: null}
							</CardBody>
						</Card>
					</Col>
				</Row>
			);
		} else {
			return null;
		}
	};

	renderCabecalho = () => {
		if (this.props.newModel === true) {
			return (
				<CardHeader className={"bg-secondary"}>
					<Row className={"align-items-center"}>
						{this.renderCategory()}
						{this.renderBtnSwot()}
					</Row>
				</CardHeader>
			);
		} else {
			return (
				<CardHeader>
					<Row>
						<Col xs="12" md="6" lg="6">
							<strong>
								{this.props.title || "Defina seu Objetivo Estratégico"}
							</strong>
							{/*<span/>*/}
						</Col>
						{this.renderCategory()}
					</Row>
					{this.props.objectiveSelected ? this.renderSelectObjetivo() : null}
				</CardHeader>
			);
		}
	};

	render() {
		return (
			<div className="animated fadeIn">
				<Card className="card-accent-dark">
					{this.renderCabecalho()}
					<CardBody>
						{this.renderObjetivoEstrategico()}
						{this.renderCardMeta()}
						{this.renderCardAvaliacao()}
						{this.renderCardEstrategia()}
					</CardBody>
					<CardFooter>{this.renderButtons()}</CardFooter>
				</Card>
				{this.props.modal ? this.renderModals() : null}
				{this.modalEstrategia()}
				{this.modalSwot()}
			</div>
		);
	}
}

export default CardBaseMeta;
