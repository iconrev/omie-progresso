import { Component } from "react";
import cn from "classnames";
import {
	Button,
	Card,
	CardBody,
	CardFooter,
	CardHeader,
	Col,
	Row,
	Tooltip,
} from "reactstrap";
import LoadingSpinner from "../../../../../components/LoadingSpinner";
import { toast } from "react-toastify";
import Generic from "../../../../Utils/Generic";
import { InputAdapter, TextMask } from "react-text-mask-hoc";
import createNumberMask from "text-mask-addons/dist/createNumberMask";
import { AppSwitch } from "@coreui/react";
import "../../../../../assets/Gestao/Diretrizes/Eficacia/DREMensal/drestyle.scss";
import CompanyService from "../../../../../service/CompanyService";
import Diretrizes from "../../../../../service/Diretrizes";
import ButtonLoading from "../../../../../components/ButtonLoading";

class Diretrizes_Eficacia extends Component {
	constructor(props) {
		super(props);

		this.company = CompanyService.getDataCompany();
		if (!this.company) return this.props.history.push("/");

		this.state = {
			isLoading: true,
			companyId: this.company.id,
			exercicio_definido: this.company.exercicioDefinido,
			meses: [],
			dre: [],
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
				primeiroMesAtivo = mes.id;

				const meses = document.getElementById("col-months");
				const mesAtivo = document.getElementById(primeiroMesAtivo);
				const left = mesAtivo.offsetLeft;
				let diff = 0;

				if (key > 2 && key < 6) {
					diff = 150 * (key - 2); // 150 = width of column
				}

				meses.scrollTo(left - diff, 0);
			}
		});
	}

	async loadData() {
		const { dre, status, meses, message } = await Diretrizes.getDadosDre();
		if (status === "success") {
			const dreYear = dre[this.state.exercicio_definido];

			if (!dreYear) {
				toast.error(
					`As estratégias e metas para a perspectiva financeira ainda não foram preenchidas para ${this.state.exercicio_definido}`
				);
				return this.props.history.push(
					`/hub/${this.company.id}/gestao/categoria/diretrizes/eficacia`
				);
			}

			this.setState({
				dre: dreYear,
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

	changeSwitch = async (e, mes, pos) => {
		mes.checked = !mes.checked;

		let mesesCopy = [...this.state.meses];
		mesesCopy[pos] = mes;

		await this.setState({
			meses: mesesCopy,
		});
	};

	editField = async (event, category, field, posValue) => {
		event.preventDefault();

		let obj = [...this.state.dre];
		let objCategory = obj[category];
		let objField = objCategory.itens[field];
		let objFieldValue = objField.values[posValue];

		objFieldValue["value"] = event.target.value;

		await this.setState({
			dre: obj,
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

	isToolTipOpen = (targetName) => {
		return this.state[targetName] ? this.state[targetName].tooltipOpen : false;
	};

	toggle = (targetName) => {
		if (!this.state[targetName]) {
			this.setState({
				...this.state,
				[targetName]: {
					tooltipOpen: true,
				},
			});
		} else {
			this.setState({
				...this.state,
				[targetName]: {
					tooltipOpen: !this.state[targetName].tooltipOpen,
				},
			});
		}
	};

	getValueItemDre = (categoria, id, mes) => {
		const dadosCategoria = this.state.dre.filter(
			(item) => item.id === categoria
		)[0];
		const dadosItem = dadosCategoria.itens.filter((item) => item.id === id)[0];
		return Generic.ConvertStringToFloat(dadosItem.values[mes].value);
	};

	sumFields = (items, position) => {
		let value = 0;

		for (const item of items) {
			let valueItem = item.values[position].value;

			valueItem = Generic.ConvertStringToFloat(valueItem)
				? Generic.ConvertStringToFloat(valueItem)
				: 0;
			value += valueItem;
		}

		return value;
	};

	calculateField = (fieldName, mes) => {
		let valueResponse = 0.0;

		const receitaServicoValue = this.getValueItemDre(
			"receita_bruta",
			"receita_servico",
			mes
		);
		const receitaProdutoValue = this.getValueItemDre(
			"receita_bruta",
			"receita_produto",
			mes
		);
		const receitaOutrasValue = this.getValueItemDre(
			"receita_bruta",
			"outras_receitas",
			mes
		);
		const receitas =
			receitaServicoValue + receitaProdutoValue + receitaOutrasValue;

		const impostoReceitas = this.getValueItemDre(
			"deducao",
			"imposto_sobre_receitas",
			mes
		);
		const devolucoes = this.getValueItemDre(
			"deducao",
			"devolucao_abatimentos",
			mes
		);

		const deducoes = impostoReceitas + devolucoes;

		const receitaLiquida = receitas - deducoes;

		const custos = this.getValueItemDre(
			"custos",
			"custo_dos_produtos_industrializados",
			mes
		);

		const lucroBruto = receitaLiquida - custos;

		const despesasDre = this.state.dre.find(
			(categoria) => categoria.id === "despesas"
		).itens;

		let despesas = 0;
		for (let i = 0; i < despesasDre.length; i++) {
			const despesaItem = despesasDre[i];
			const valueItem = this.getValueItemDre("despesas", despesaItem.id, mes);
			despesas += valueItem;
		}

		const ebitda = lucroBruto - despesas;

		const depreciacao = this.getValueItemDre(
			"ebitda",
			"depreciacao_amortizacao",
			mes
		);

		const receitasFinanceiras = this.getValueItemDre(
			"resultado_financeiro",
			"receitas_financeiras",
			mes
		);
		const despesasFinanceiras = this.getValueItemDre(
			"resultado_financeiro",
			"despesas_financeiras",
			mes
		);

		const resultadoFinanceiro = receitasFinanceiras - despesasFinanceiras;

		const lucroOperacional = ebitda - depreciacao + resultadoFinanceiro;

		const impostoRenda = this.getValueItemDre(
			"lucro_operacional",
			"imposto_de_renda",
			mes
		);
		const contribuicaoSocial = this.getValueItemDre(
			"lucro_operacional",
			"constribuicao_social",
			mes
		);

		const lucro_liquido = lucroOperacional - impostoRenda - contribuicaoSocial;

		if (fieldName === "receita_liquida") {
			valueResponse = receitaLiquida;
		}

		if (fieldName === "lucro_bruto") {
			valueResponse = lucroBruto;
		}

		if (fieldName === "ebitda") {
			valueResponse = ebitda;
		}

		if (fieldName === "resultado_financeiro") {
			valueResponse = resultadoFinanceiro;
		}

		if (fieldName === "lucro_operacional") {
			valueResponse = lucroOperacional;
		}

		if (fieldName === "lucro_liquido") {
			valueResponse = lucro_liquido;
		}

		return valueResponse;
	};

	submit = async (e, month) => {
		e.preventDefault();

		this.setState({
			saveLoading: month.id,
		});

		let dre = {};
		let erros = [];

		for (const group of this.state.dre) {
			if (group.itens) {
				for (const item of group.itens) {
					const idFind = item.id + "_" + month.id;
					let valueItem = item.values.filter((field) => field.id === idFind)[0]
						.value;

					valueItem = Generic.ConvertStringToFloat(valueItem);

					if (isNaN(valueItem)) {
						erros.push(item.title);
					} else {
						dre[idFind] = valueItem;
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
			dre: dre,
			year: this.state.exercicio_definido,
			month: month,
		};

		const { message, status } = await Diretrizes.updateDadosDre(data);
		if (status === "success") {
			toast.success(message);
		} else {
			toast.error(message);
		}

		this.setState({
			saveLoading: null,
		});
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

	renderDre = () => {
		return (
			<Row className="row-dre-mensal">
				<Col className="col-description">
					<Row className="empty border">&nbsp;</Row>
					{this.state.dre.map((item, key) => {
						let positive = item.id === "receita_bruta";
						let negative =
							item.id === "deducao" ||
							item.id === "custos" ||
							item.id === "despesas" ||
							item.id === "ebitda" ||
							item.id === "lucro_operacional";

						return (
							<div key={key}>
								<Row className="category">
									<Col className="border border-top-0 category">
										{item.categoria.toString().toUpperCase()}
									</Col>
								</Row>
								{item.itens
									? item.itens.map((subItem, subKey) => {
											let name_id = "tooltip_" + subItem.id;
											let tip = null;

											if (subItem.tip) {
												tip = (
													<span>
														<i className="icon-info" id={name_id} />
														<Tooltip
															placement="top"
															isOpen={this.isToolTipOpen(name_id)}
															target={name_id}
															toggle={() => this.toggle(name_id)}
														>
															{subItem.tip}
														</Tooltip>
													</span>
												);
											}

											if (item.id === "resultado_financeiro") {
												if (subItem.id === "receitas_financeiras") {
													positive = true;
												} else if (subItem.id === "despesas_financeiras") {
													negative = true;
												}
											}

											return (
												<Row
													key={"sub_category" + subKey}
													className={cn("sub-category", {
														positive: positive,
														negative: negative,
													})}
												>
													<Col className="border border-top-0 sub-category">
														{subItem.title.toString()} {tip}
													</Col>
												</Row>
											);
									  })
									: null}
							</div>
						);
					})}
				</Col>
				<Col className="col-months text-right" id="col-months">
					<Row className="text-center header-months">
						{this.state.meses
							? this.state.meses.map((item, key) => {
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
							  })
							: null}
					</Row>
					{this.state.dre.map((itemDre, keyItemDre) => {
						// const isLastItemDre = keyItemDre === this.state.dre.length - 1;

						let prefix = null;
						let suffix = null;

						if (itemDre.tipo === "R$") {
							prefix = "R$";
						}

						let categoryValue;
						let subCategoryValue;

						if (itemDre.categoria && itemDre.data) {
							categoryValue = itemDre.data.map((itemData, keyData) => {
								let value = 0;

								if (!itemDre.itens) {
									value = this.calculateField(itemDre.id, keyData);
								} else {
									if (itemDre.id === "ebitda") {
										value = this.calculateField(itemDre.id, keyData);
									} else if (itemDre.id === "resultado_financeiro") {
										value = this.calculateField(itemDre.id, keyData);
									} else if (itemDre.id === "lucro_operacional") {
										value = this.calculateField(itemDre.id, keyData);
									} else {
										value = this.sumFields(itemDre.itens, keyData);
									}
								}

								let lucroLiquido = false;
								let positive = false;
								let negative = false;

								if (itemDre.id.indexOf("lucro_liquido") > -1) {
									lucroLiquido = true;

									if (value > 0) {
										positive = true;
									} else if (value < 0) {
										negative = true;
									}
								}

								return (
									<Col
										key={"category" + keyData}
										className={cn(
											"border border-top-0 border-left-0 month value",
											{
												"lucro-liquido": lucroLiquido,
												positive: positive,
												negative: negative,
											}
										)}
									>
										{prefix} {Generic.formatNumber(value)} {suffix}
									</Col>
								);
							});
						} else {
							categoryValue = (
								<Col className="border border-top-0 border-left-0 empty">
									&nbsp;
								</Col>
							);
						}

						if (itemDre.itens) {
							subCategoryValue = itemDre.itens.map(
								(itemCategory, keyItemCategory) => {
									// const isLastItemCategory = keyItemCategory === itemDre.itens.length - 1;
									return (
										<Row key={"sub_category" + keyItemCategory}>
											{itemCategory.values
												? itemCategory.values.map((subItem, keyChild) => {
														let value = subItem.value;

														if (typeof value !== "string") {
															value = Generic.formatNumber(subItem.value);
														}

														// console.info(isLastItemDre, itemDre, keyItemDre);
														// console.info(
														// 	isLastItemCategory,
														// 	itemCategory,
														// 	keyItemCategory
														// );

														// let itemNextFocusItemDre;
														// let itemNextFocusCategory;

														// if (isLastItemDre) {
														// 	if (isLastItemCategory) {
														// 		itemNextFocusItemDre = 0;
														// 		itemNextFocusCategory = 0;
														// 	} else {
														// 		itemNextFocusItemDre = keyItemDre;
														// 		itemNextFocusCategory = keyItemCategory + 1;
														// 	}
														// } else {
														// 	if (isLastItemCategory) {
														// 		itemNextFocusItemDre = keyItemDre + 1;
														// 		itemNextFocusCategory = 0;
														// 	} else {
														// 		itemNextFocusItemDre = keyItemDre;
														// 		itemNextFocusCategory = keyItemCategory + 1;
														// 	}
														// }

														// console.info(
														// 	"next focus",
														// 	this.state.dre[itemNextFocusItemDre].id || null,
														// 	this.state.dre[itemNextFocusItemDre].itens[
														// 		itemNextFocusCategory
														// 	].id || null,
														// );

														return (
															<Col
																key={"value" + keyChild}
																className="border border-top-0 border-left-0 month"
															>
																<TextMask
																	Component={InputAdapter}
																	value={value}
																	mask={this.getMask(prefix)}
																	guide
																	onChange={async (e) =>
																		await this.editField(
																			e,
																			keyItemDre,
																			keyItemCategory,
																			keyChild
																		)
																	}
																	// onKeyDown={(e) =>
																	// 	this.handleKeyDown(
																	// 		e,
																	// 		keyItemDre,
																	// 		keyItemCategory,
																	// 		keyChild
																	// 	)
																	// }
																	className="form-control text-right"
																	id={subItem.id}
																	disabled={!this.state.meses[keyChild].checked}
																/>
															</Col>
														);
												  })
												: null}
										</Row>
									);
								}
							);
						}

						return (
							<div key={keyItemDre}>
								<Row>{categoryValue}</Row>
								{subCategoryValue}
							</div>
						);
					})}
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
								<strong>Análise da Eficácia</strong> - Dados Financeiros - DRE
								Mensal - {this.state.exercicio_definido}
								<Button
									className="btn btn-sm btn-info mr-1 float-right"
									onClick={() => this.redirect("diretrizes/eficacia")}
								>
									<i className="fa fa-arrow-left" /> Voltar
								</Button>
							</CardHeader>
							<CardBody>{this.renderDre()}</CardBody>
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

export default Diretrizes_Eficacia;
