import { Component, Fragment } from "react";
import { toast } from "react-toastify";
import {
	Button,
	Card,
	CardFooter,
	CardHeader,
	CardBody,
	Col,
	Row,
	Badge,
} from "reactstrap";
import { FormGroup, Input } from "reactstrap";
import Generic from "../../../../Utils/Generic";
import { InputAdapter, TextMask } from "react-text-mask-hoc";
import createNumberMask from "text-mask-addons/dist/createNumberMask";
import ButtonLoading from "../../../../../components/ButtonLoading";
import AmbienteInternoService from "../../../../../service/Diagnostico/AmbienteInterno";
import CategoryTitle from "./CategoryTitle";
import CompanyService from "../../../../../service/CompanyService";

const color = ["success", "info", "warning"];

class TableResultados extends Component {
	constructor(props) {
		super(props);

		this.ids = [];
		this.state = {
			data: props.data,
			years_order: props.years,
			isLoadingButton: false,
			isLoading: true,
			invalidInputs: [],
		};
	}

	async componentDidMount() {
		await this.loadStates();
		this.setState({ isLoading: false });
	}

	loadStates = async () => {
		// if (!this.state.isLoading) {
		//   this.setState({ isLoading: true })
		// }

		const ids = {};
		const years = this.state.years_order;
		years.map((year) => (ids[year] = {}));

		for (let i = 0; i < this.state.data.length; i++) {
			const category = this.state.data[i];
			if (category.itens) {
				for (let j = 0; j < category.itens.length; j++) {
					const row = category.itens[j];
					for (let k = 0; k < row.values.length; k++) {
						const value = row.values[k];
						const idField = this.createId(row, k, years[k]);
						ids[years[k]][idField] = value;
					}
				}
			}
		}

		this.ids = ids;
	};

	page_edit = (event) => {
		event.preventDefault();
		let url = this.props.return;
		this.props.history.push(url);
	};

	importOmie = async (event, year) => {
		const years = this.state.years_order;
		const response = await AmbienteInternoService.importOmie(year);
		console.log("Resnpose", response);
		const { status, message } = response;

		if (status === "success") {
			const data = this.state.data;
			data.map((itemData) => {
				if (itemData.itens) {
					for (let index = 0; index < itemData.itens.length; index++) {
						if (message?.[itemData.itens[index]?.id] !== undefined)
							itemData.itens[index].values[years.indexOf(year)] =
								message[itemData.itens[index].id];
					}
				}
			});

			this.setState(data);
			toast.success(`Dados do ano de ${message.year} importados com sucesso!`);
		} else if (status === "not_found") {
			toast.error(`Dados do ano de ${message.year} não encontrados`);
		} else {
			toast.error(status);
		}
	};

	loadYears = (item, key) => {
		return (
			<>
				<Col key={key}>
					<div className={`callout callout-${color[key]}`}>
						<strong className="h3">{item}</strong>
					</div>
					{/* <Button
						onClick={(e) => this.importOmie(e, this.props.years[key])}
						color={color[key]}
						outline
					>
						<i className="fa fa-refresh" /> Importar da Omie
					</Button> */}
				</Col>
			</>
		);
	};

	createId = (row, key, year) => {
		const title_id = row.custom_ids ? "_" + row.custom_ids[key] || 0 : "";
		const idText = year + "_" + row.id + title_id;
		return idText;
	};

	editField = async (event, category, field, posValue) => {
		event.preventDefault();

		let obj = this.state.data;
		let objCategory = obj[category];
		let objField = objCategory.itens[field];
		objField.values[posValue] = event.target.value;

		this.setState({
			data: obj,
		});
	};

	getMask = (itemTipo) => {
		switch (itemTipo) {
			case "R$":
				return createNumberMask({
					prefix: "R$ ",
					suffix: "",
					thousandsSeparatorSymbol: ".",
					integerLimit: 10,
					allowDecimal: true,
					decimalSymbol: ",",
					decimalLimit: 2,
				});
			case "%":
				return createNumberMask({
					prefix: "",
					suffix: " %",
					thousandsSeparatorSymbol: ".",
					integerLimit: 10,
					allowDecimal: true,
					decimalSymbol: ",",
					decimalLimit: 2,
				});
			case "int":
				return createNumberMask({
					prefix: "",
					suffix: "",
					thousandsSeparatorSymbol: ".",
					integerLimit: 10,
					allowDecimal: false,
				});
			default:
				return createNumberMask({
					prefix: "",
					suffix: "",
					thousandsSeparatorSymbol: ".",
					integerLimit: 10,
					allowDecimal: false,
				});
		}
	};

	loadItem = (item, key, category) => {
		return (
			<Row key={"row" + key} aria-label={item.title}>
				<Col xs="12" sm="3" lg="3">
					<CategoryTitle
						row={item}
						keyValue={key}
						handleTitle={this.props.updateCategoryTitle}
					/>
				</Col>
				{item.values.map((itemChild, keyChild) => {
					let value = itemChild || 0;
					if (typeof value !== "string") {
						const decimals = item.tipo === "int" ? 0 : 2;
						value = Generic.formatNumber(itemChild, decimals);
					}

					return (
						<Col sm="3" key={item.id + "_c_" + keyChild}>
							{item.tipo === "select" ? (
								<FormGroup>
									<Input
										type="select"
										id={this.createId(
											item,
											keyChild,
											this.state.years_order[keyChild]
										)}
										defaultValue={itemChild}
										onChange={async (event) => {
											await this.editField(event, category, key, keyChild);
										}}
									>
										<option value={"-"}>-</option>
										{item.options.map((itemOption, keyOption) => {
											return (
												<option key={keyOption} value={itemOption.value}>
													{itemOption.label}
												</option>
											);
										})}
									</Input>
								</FormGroup>
							) : (
								<TextMask
									Component={InputAdapter}
									value={value}
									mask={this.getMask(item.tipo)}
									guide
									onChange={async (event) => {
										await this.editField(event, category, key, keyChild);
									}}
									className="form-control"
									id={this.createId(
										item,
										keyChild,
										this.state.years_order[keyChild]
									)}
								/>
							)}
						</Col>
					);
				})}
			</Row>
		);
	};

	loadCategory = (item, key) => {
		let prefix = null;
		let suffix = null;
		if (item.tipo === "R$") {
			prefix = "R$";
		}

		return (
			<Fragment key={key}>
				{item.categoria && (
					<Row key={key} aria-label={item.categoria} className={"mb-4"}>
						<Col xs="12" sm="3" lg="3">
							{item.color ? (
								<Badge color={item.color} style={{ fontSize: 15 }}>
									<strong>{item.categoria.toString().toUpperCase()}</strong>
								</Badge>
							) : (
								<span style={{ fontSize: 15 }}>
									<strong>{item.categoria.toString().toUpperCase()}</strong>
								</span>
							)}
						</Col>
						{item.categoria &&
							item.data &&
							item.data.map((itemData, keyData) => {
								return (
									<Col xs="12" sm="3" lg="3" key={"category" + keyData}>
										<Badge className={`badge-${color[keyData]}`}>
											<strong style={{ fontSize: 15 }}>
												{prefix} {Generic.formatNumber(itemData)} {suffix}
											</strong>
										</Badge>
									</Col>
								);
							})}
					</Row>
				)}
				{item.itens &&
					item.itens.map((item, keyItem) => {
						return this.loadItem(item, keyItem, key);
					})}
			</Fragment>
		);
	};

	submit = async (event, ano) => {
		event.preventDefault();

		this.setState({
			isLoadingButton: ano,
		});

		const errors = [];

		const data = {};
		for (const item of Object.keys(this.ids[ano])) {
			const element = document.getElementById(item);
			if (element != null) {
				try {
					if (element.type === "text") {
						let str = element.value;
						str = str.replace("R$ ", "");
						str = str.replace("R$", "");
						str = str.split(".").join("");
						str = str.replace(",", ".");
						str = str.replace(" ", "");
						const valueParsed = parseFloat(str);

						if (isNaN(valueParsed)) {
							errors.push(item);
						} else {
							data[item.replace(ano + "_", "")] = valueParsed;
						}
					} else {
						if (element.value === "-") {
							errors.push(item);
						} else {
							data[item.replace(ano + "_", "")] = element.value;
						}
					}
				} catch (e) {
					errors.push(item);
				}
			}
		}

		if (errors.length > 0) {
			this.setState({
				invalidInputs: errors,
			});
			toast.error("Alguns campos não foram preenchidos");
		} else {
			const payload = {
				year: ano,
				data: data,
			};

			const result = await AmbienteInternoService.updateTableResultados(
				this.props.resource,
				payload
			);
			const { status, message } = result;
			if (status === "success") {
				toast.success(message || "Dados atualizados com sucesso");
				if (this.props.refresh) {
					await this.props.refresh();
				}
				this.setState({
					invalidInputs: [],
				});
			} else {
				toast.error(message || "Não foi possível atualizar os dados");
			}
		}

		this.setState({
			isLoadingButton: false,
		});
	};

	render() {
		if (this.state.isLoading) return null;

		return (
			<div className="animated fadeIn">
				<Card className="card-accent-warning">
					<CardHeader>
						<strong>{this.props.title}</strong> - {this.props.subtitle}
						<Button
							onClick={this.page_edit}
							className="btn btn-sm btn-success mr-1 float-right"
						>
							<i className="fa fa-archive" /> Análise dos Resultados
						</Button>
					</CardHeader>
					<CardBody>
						<Row aria-label={"anos"} className={"mb-4"}>
							<Col sm="3" />
							{this.props.years ? this.props.years.map(this.loadYears) : null}
						</Row>
						{this.state.data ? this.state.data.map(this.loadCategory) : null}
					</CardBody>
					<CardFooter>
						<Row>
							<Col xs="12" sm="3" lg="3" />
							{this.props.years
								? this.props.years.map((item, key) => {
										return (
											<Col sm="3" key={key}>
												<ButtonLoading
													onClick={(e) => this.submit(e, this.props.years[key])}
													className={`btn btn-sm btn-${color[key]} mr-1`}
													isLoading={this.state.isLoadingButton === item}
													visible={CompanyService.showSaveButtonToDemo()}
												>
													<i className="fa fa-save" /> Salvar{" "}
													{this.props.years[key]}
												</ButtonLoading>
											</Col>
										);
								  })
								: null}
						</Row>
					</CardFooter>
				</Card>
			</div>
		);
	}
}

export default TableResultados;
