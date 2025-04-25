import { Component } from "react";
import {
	Badge,
	Button,
	Card,
	CardBody,
	CardFooter,
	CardHeader,
	Col,
	Collapse,
	Input,
	Row,
	Tooltip,
} from "reactstrap";
import LoadingSpinner from "../../../../../components/LoadingSpinner";
import { toast } from "react-toastify";
import { AppSwitch } from "@coreui/react";
import Generic from "../../../../Utils/Generic";
import { InputAdapter, TextMask } from "react-text-mask-hoc";
import createNumberMask from "text-mask-addons/dist/createNumberMask";
import "../../../../../assets/objectivesstyle.css";
import "../../../../../assets/Gestao/Diretrizes/Eficacia/Levantamento/levantamentostyle.scss";
import CompanyService from "../../../../../service/CompanyService";
import Diretrizes from "../../../../../service/Diretrizes";
import ButtonLoading from "../../../../../components/ButtonLoading";

const mesesAvaliacao = {
	2: [1, 3, 5, 7, 9, 11],
	3: [2, 5, 8, 11],
	4: [3, 7, 11],
	6: [6, 11],
	12: [11],
};

class Levantamento extends Component {
	constructor(props) {
		super(props);

		this.company = CompanyService.getDataCompany();
		if (!this.company) return this.props.history.push("/");

		this.state = {
			isLoading: true,
			companyId: this.company.id,
			exercicio_definido: this.company.exercicioDefinido,
			meses: [],
			levantamento: [],
			collapse: {
				comercial: true,
				processos: true,
				pessoas: true,
			},
			saveLoading: null,
		};
	}

	async componentDidMount() {
		await this.loadData();
		await this.setState({
			isLoading: false,
		});

		let primeiroMesAtivo = "jan";
		this.state.meses.forEach((mes, key) => {
			if (mes.checked && primeiroMesAtivo === "jan") {
				primeiroMesAtivo = mes.id.toString().toLowerCase();

				let meses = document.getElementById("col-months");
				let mesAtivo = document.getElementById(primeiroMesAtivo);
				let left = mesAtivo.offsetLeft;
				let diff = 0;

				if (key > 2 && key < 6) {
					diff = 150 * (key - 2); // 150 = width of column
				}

				meses.scrollTo(left - diff, 0);
			}
		});
	}

	async loadData() {
		const result = await Diretrizes.getDadosLevantamento();
		const { levantamento, status, meses, message } = result;
		if (status === "success") {
			await this.setState({
				levantamento: levantamento[this.state.exercicio_definido],
				meses: meses,
			});
		} else {
			toast.error(message);
		}
	}

	redirect = (url) => {
		url = `/hub/${this.state.companyId}/gestao/categoria/${url}`;
		this.props.history.push(url);
	};

	editField = async (event, perspectiva, category, field, posValue) => {
		event.preventDefault();

		let obj = [...this.state.levantamento];
		let objPerspectiva = obj[perspectiva];
		let objCategory = objPerspectiva.itens[category];
		let objField = objCategory.itens[field];
		let objFieldValue = objField.values[posValue];

		objFieldValue["value"] = event.target.value;

		await this.setState({
			levantamento: obj,
		});
	};

	changeSwitch = async (e, mes, pos) => {
		mes.checked = !mes.checked;

		let mesesCopy = [...this.state.meses];
		mesesCopy[pos] = mes;

		await this.setState({
			meses: mesesCopy,
		});
	};

	submit = async (e, month) => {
		e.preventDefault();

		this.setState({
			saveLoading: month.id,
		});

		let levantamento = {};
		let erros = [];

		for (const perspectiva of this.state.levantamento) {
			if (perspectiva.itens) {
				for (const categoria of perspectiva.itens) {
					if (categoria.itens) {
						for (const item of categoria.itens) {
							const idFind = item.id + "_" + month.id;
							let valueItem = item.values.filter(
								(field) => field.id === idFind
							)[0].value;

							if (item.tipo === "quiz") {
								const mesesAvaliam = mesesAvaliacao[item.mes_avaliacao];
								const mesAvalia = mesesAvaliam.find(
									(element) => element === month.pos
								);

								if (valueItem === "NaoAvaliado" && mesAvalia) {
									erros.push(item.title);
								} else {
									if (mesAvalia) {
										levantamento[idFind] = valueItem;
									}
								}
							} else {
								valueItem = Generic.ConvertStringToFloat(valueItem);
								if (isNaN(valueItem)) {
									erros.push(item.title);
								} else {
									levantamento[idFind] = valueItem;
								}
							}
						}
					}
				}
			}
		}

		if (erros.length > 0) {
			toast.error(
				"Os campos " + JSON.stringify(erros) + " estão com dados inválidos."
			);
			return;
		}

		const data = {
			levantamento: levantamento,
			year: this.state.exercicio_definido,
			month: month,
		};

		const { message, status } = await Diretrizes.updateDadosLevantamento(data);
		if (status === "success") {
			toast.success(message);
		} else {
			toast.error(message);
		}

		this.setState({
			saveLoading: false,
		});
	};

	getMask = (itemTipo) => {
		let mask;

		switch (itemTipo) {
			case "R$":
				mask = createNumberMask({
					prefix: "R$ ",
					thousandsSeparatorSymbol: ".",
					integerLimit: 10,
					allowDecimal: true,
					decimalSymbol: ",",
					decimalLimit: 2,
				});
				break;
			case "%":
				mask = createNumberMask({
					prefix: "",
					suffix: " %",
					thousandsSeparatorSymbol: ".",
					integerLimit: 10,
					allowDecimal: true,
					decimalSymbol: ",",
					decimalLimit: 2,
				});
				break;
			default:
				mask = createNumberMask({
					prefix: "",
					thousandsSeparatorSymbol: ".",
					integerLimit: 10,
					allowDecimal: false,
				});
		}

		return mask;
	};

	renderButtonsSave = () => {
		if (this.company.isDemo) return null;

		return (
			<Row>
				{this.state.meses.map((item, key) => {
					return (
						<Col key={key} className="month center">
							<ButtonLoading
								onClick={(e) => this.submit(e, item)}
								className={`btn btn-sm btn-block`}
								disabled={!item.checked}
								isLoading={this.state.saveLoading === item.id}
							>
								<i className="fa fa-save" />
								<br />
								Salvar
								<br />
								{item.title}
							</ButtonLoading>
						</Col>
					);
				})}
			</Row>
		);
	};

	toggleCollapse = async (event, perspectiva) => {
		event.preventDefault();

		const collapse = { ...this.state.collapse };
		collapse[perspectiva] = !this.state.collapse[perspectiva];

		await this.setState({
			collapse: collapse,
		});
	};

	renderFieldsName = () => {
		return this.state.levantamento.map((perspectiva, key) => {
			return (
				<div key={key}>
					<Row className={`category category-${perspectiva.perspectiva}`}>
						<Col
							className="border border-top-0 category"
							onClick={async (e) =>
								await this.toggleCollapse(e, perspectiva.perspectiva)
							}
						>
							{perspectiva.perspectiva_nome.toUpperCase()}
							<div className="float-right">
								<i
									className={
										this.state.collapse[perspectiva.perspectiva]
											? "fa fa-minus"
											: "fa fa-plus"
									}
								/>
							</div>
						</Col>
					</Row>
					<Collapse isOpen={this.state.collapse[perspectiva.perspectiva]}>
						{perspectiva.itens
							? perspectiva.itens.map((categoria, subKey) => {
									if (categoria.itens.length === 0) return null;

									return (
										<div
											key={
												"div_" +
												perspectiva.perspectiva +
												"_" +
												subKey +
												"_" +
												key
											}
										>
											{categoria.itens.map((itemCategoria, categoriaKey) => {
												let name_id = "tooltip_" + itemCategoria.id;
												let tip = null;

												if (itemCategoria.tip) {
													tip = (
														<span>
															<i className="icon-info" id={name_id} />
															<Tooltip
																placement="top"
																isOpen={this.isToolTipOpen(name_id)}
																target={name_id}
																toggle={() => this.toggle(name_id)}
															>
																{categoria.tip}
															</Tooltip>
														</span>
													);
												}

												return (
													<Row
														key={"sub_category" + categoriaKey + "_" + key}
														className={`sub-category category-${perspectiva.perspectiva}`}
													>
														<Col className="border border-top-0 sub-category">
															<span className="mr-2">
																{itemCategoria.title.toString()} {tip}
															</span>
															<Badge
																className={`category-${perspectiva.perspectiva}`}
															>
																{categoria.categoria_nome.toUpperCase()}
															</Badge>
														</Col>
													</Row>
												);
											})}
										</div>
									);
							  })
							: null}
					</Collapse>
				</div>
			);
		});
	};

	renderTitleMonths = () => {
		if (!this.state.meses) return null;

		return (
			<Row className="text-center header-months">
				{this.state.meses.map((item, key) => {
					let mes = item.id.toString().toLowerCase();

					return (
						<Col
							key={"month" + key}
							className="border border-left-0 pl-0 pr-0 month title"
							id={mes}
						>
							<Row className="m-0">
								<Col className="pr-0 text-left">{item.title}</Col>
								<Col className="pl-0 pr-0">
									<AppSwitch
										id={"checkbox_" + item.id}
										color={"primary"}
										size="sm"
										variant="pill"
										checked={item.checked}
										onChange={async (e) =>
											await this.changeSwitch(e, item, key)
										}
										label
										dataOn={"\u2713"}
										dataOff={"\u2715"}
									/>
								</Col>
							</Row>
						</Col>
					);
				})}
			</Row>
		);
	};

	renderFieldsInputs = () => {
		return this.state.levantamento.map((perspectiva, keyPerspectiva) => {
			let subCategoryValue;

			if (perspectiva.itens) {
				subCategoryValue = perspectiva.itens.map((categoria, subCategory) => {
					if (categoria.itens.length === 0) return null;
					return (
						<div key={"div_sub_category" + subCategory}>
							{/*<Row>*/}
							{/*  <Col className="border border-top-0 border-left-0 empty">&nbsp;</Col>*/}
							{/*</Row>*/}
							<Collapse isOpen={this.state.collapse[perspectiva.perspectiva]}>
								{categoria.itens.map((itemCategoria, categoriaKey) => {
									return (
										<Row key={"sub_category" + categoriaKey}>
											{itemCategoria.values
												? itemCategoria.values.map((subItem, keyChild) => {
														let component;

														if (itemCategoria.tipo === "quiz") {
															const mesesAvaliam =
																mesesAvaliacao[itemCategoria.mes_avaliacao];
															const mesAvalia = mesesAvaliam.find(
																(element) => element === keyChild
															);

															if (mesAvalia) {
																let options = itemCategoria.options_label.map(
																	(option, index) => (
																		<option
																			value={itemCategoria.options_value[index]}
																			key={index}
																		>
																			{option}
																		</option>
																	)
																);

																component = (
																	<Input
																		type="select"
																		className="form-control combo-quiz"
																		id={subItem.id}
																		defaultValue={subItem.value}
																		onChange={async (e) =>
																			await this.editField(
																				e,
																				keyPerspectiva,
																				subCategory,
																				categoriaKey,
																				keyChild
																			)
																		}
																		disabled={
																			!this.state.meses[keyChild].checked
																		}
																	>
																		{options}
																	</Input>
																);
															}
														} else {
															let value = subItem.value;

															if (typeof value !== "string") {
																value = Generic.formatNumber(
																	subItem.value,
																	itemCategoria.tipo ? 2 : 0
																);
															}

															component = (
																<TextMask
																	Component={InputAdapter}
																	value={value}
																	mask={this.getMask(itemCategoria.tipo)}
																	guide
																	onChange={async (e) =>
																		await this.editField(
																			e,
																			keyPerspectiva,
																			subCategory,
																			categoriaKey,
																			keyChild
																		)
																	}
																	className="form-control text-right"
																	id={subItem.id}
																	disabled={!this.state.meses[keyChild].checked}
																/>
															);
														}

														return (
															<Col
																key={"value" + keyChild}
																className="border border-top-0 border-left-0 month"
															>
																{component}
															</Col>
														);
												  })
												: null}
										</Row>
									);
								})}
							</Collapse>
						</div>
					);
				});
			}

			return (
				<div key={keyPerspectiva}>
					<Row>
						<Col className="border border-top-0 border-left-0 empty">
							&nbsp;
						</Col>
					</Row>
					<Collapse isOpen={this.state.collapse[perspectiva.perspectiva]}>
						{subCategoryValue}
					</Collapse>
				</div>
			);
		});
	};

	renderLevantamento = () => {
		return (
			<Row className="row-levantamento-mensal">
				<Col className="col-description">
					<Row className="empty border">&nbsp;</Row>
					{this.renderFieldsName()}
				</Col>
				<Col className="col-months text-right" id="col-months">
					{this.renderTitleMonths()}
					{this.renderFieldsInputs()}
					{this.renderButtonsSave()}
				</Col>
			</Row>
		);
	};

	loaded = () => {
		return (
			<div className="animated fadeIn">
				<Row>
					<Col>
						<Card className="card-accent-secondary">
							<CardHeader>
								<strong>Análise da Eficácia</strong> - Dados Operacionais -{" "}
								{this.state.exercicio_definido}
								<Button
									className="btn btn-sm btn-info mr-1 float-right"
									onClick={() => this.redirect("diretrizes/eficacia")}
								>
									<i className="fa fa-arrow-left" /> Voltar
								</Button>
							</CardHeader>
							<CardBody>{this.renderLevantamento()}</CardBody>
							<CardFooter>
								<Button
									className="btn btn-sm btn-info mr-1 float-right"
									onClick={() => this.redirect("diretrizes/eficacia")}
								>
									<i className="fa fa-arrow-left" /> Voltar
								</Button>
							</CardFooter>
						</Card>
					</Col>
				</Row>
			</div>
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

export default Levantamento;
