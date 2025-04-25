import { Component, useState } from "react";
import { toast } from "react-toastify";
import {
	Button,
	Card,
	CardBody,
	CardHeader,
	Row,
	Col,
	Modal,
	ModalHeader,
	ModalFooter,
	ModalBody,
	Form,
	FormGroup,
	Label,
	Input,
} from "reactstrap";
import BootstrapTable from "react-bootstrap-table-next";
import cellEditFactory, { Type } from "react-bootstrap-table2-editor";
import LoadingSpinner from "../../../../components/LoadingSpinner";
import CompanyService from "../../../../service/CompanyService";
import AmbienteExternoService from "../../../../service/Diagnostico/AmbienteExterno";
import ButtonLoading from "../../../../components/ButtonLoading";

const heigthRow = "70px";

const ModalSwotCategory = (props) => {
	const { handleToggle, category, resource, type } = props;

	const [waiting, setWaiting] = useState(false);
	const [value, seValue] = useState("");

	const onChange = (event) => {
		seValue(event.target.value);
	};

	const submit = async (event) => {
		event.preventDefault();

		setWaiting(true);

		const response = await AmbienteExternoService.putNewItemSwot(
			resource,
			type,
			value
		);
		const { status, message } = response;

		setWaiting(false);

		if (status === "success") {
			toast.success(message);
			setTimeout(() => window.location.reload(), 1000);
		} else {
			toast.error(message);
		}
	};

	return (
		<Modal isOpen={true} toggle={handleToggle}>
			<ModalHeader>Nova {category}</ModalHeader>
			<ModalBody>
				<Form>
					<FormGroup>
						<Label for={"categoryName"}>Descrição</Label>
						<Input
							type={"text"}
							name={"categoryName"}
							value={value}
							onChange={onChange}
						/>
					</FormGroup>
				</Form>
			</ModalBody>
			<ModalFooter>
				<ButtonLoading color="primary" onClick={submit} isLoading={waiting}>
					Alterar
				</ButtonLoading>
				<Button color="secondary" onClick={handleToggle}>
					Cancelar
				</Button>
			</ModalFooter>
		</Modal>
	);
};

class SwotForm extends Component {
	constructor(props) {
		super(props);

		this.company = CompanyService.getDataCompany();

		this.state = {
			swot: this.props.swot,
			id: this.company.id,
			exercicio_definido: this.company.exercicioDefinido,
			options: {
				oportunidades: [],
				ameacas: [],
				fatores: [],
			},
			swotData: [],
			isLoading: true,
			isLoadingSave: false,
			modalEditOportunidadeIsOpen: false,
			modalEditAmeacaIsOpen: false,
		};
	}

	async componentDidMount() {
		await this.loadStates();
		this.setState({
			isLoading: false,
		});
	}

	loadStates = async () => {
		const promiseOptions = this.loadOptions();
		const promiseData = this.loadData();

		await Promise.all([promiseOptions, promiseData]);
	};

	loadOptions = async () => {
		await AmbienteExternoService.getSwotOptions(this.state.swot)
			.then((response) => {
				const responseOptions = response;

				if (responseOptions.ameacas) {
					responseOptions.ameacas.unshift({
						id: -1,
						description: "Definir ameaça",
					});
				}
				if (responseOptions.oportunidades) {
					responseOptions.oportunidades.unshift({
						id: -1,
						description: "Definir oportunidade",
					});
				}

				this.setState({
					options: response,
				});
			})
			.catch((err) => console.error(err));
	};

	loadData = async () => {
		await AmbienteExternoService.getSwot(this.state.swot)
			.then(async (response) => {
				const { status } = response;

				if (status !== "success") {
					toast.error("Erro ao buscar SWOT");
					return;
				}

				let { swot } = response;

				if (!swot && this.state.swot === "macro") {
					swot = response.macros;
				}

				let data = swot[this.state.exercicio_definido];
				let dataSwot = [];

				data.map((item, index) => {
					return dataSwot.push({
						oportunidades: {
							id: item.id,
							col1: item.oportunidadeId,
							col2: item.atratividade_da_oportunidade,
							col3: item.probabilidade_de_sucesso_da_oportunidade,
							new: false,
							index: index,
						},
						ameacas: {
							id: item.id,
							col1: item.ameacaId,
							col2: item.relevancia_da_ameaca,
							col3: item.probabilidade_de_ocorrer_a_ameaca,
							new: false,
							index: index,
						},
						fatores: {
							id: item.id,
							col1: item.fator,
							col2: item.tendencia,
						},
					});
				});

				if (dataSwot.length < 5) {
					dataSwot = this.loadStateDefault(dataSwot);
				}

				this.setState({
					swotData: dataSwot,
				});
			})
			.catch((err) => {
				toast.warn(err.message);
			});
	};

	loadStateDefault = (data) => {
		let start = data.length === 0 ? 0 : data.length;
		for (let i = start; i < 5; i++) {
			data.push({
				oportunidades: {
					id: 0,
					col1: "-",
					col2: "-",
					col3: "-",
					new: true,
					index: i,
				},
				ameacas: {
					id: 0,
					col1: "-",
					col2: "-",
					col3: "-",
					new: true,
					index: i,
				},
				fatores: {
					id: 0,
					col1: "-",
					col2: "-",
				},
			});
		}

		return data;
	};

	getData = (resource, cenario = null) => {
		let data = {};

		switch (this.props.swot) {
			case "concorrentes":
				data = {
					title: "Concorrentes",
				};
				break;
			case "clientes":
				data = {
					title: "Clientes",
				};
				break;
			case "fornecedores":
				data = {
					title: "Fornecedores",
				};
				break;
			case "macro":
				data = {
					title: "Macro Ambiente",
				};
				break;
			default:
				data = {
					title: this.props.swot,
				};
				break;
		}

		data["colunas"] = {
			oportunidades: [
				"Oportunidades",
				"Atratividade da Oportunidade",
				"Prob. de Sucesso da Oportunidade",
			],
			ameacas: ["Ameaças", "Relevância da Ameaça", "Prob. de Ocorrer a Ameaça"],
			fatores: ["Fatores", "Tendência"],
		};

		if (cenario) {
			let dataTableValues = this.state.swotData;
			if (dataTableValues.length === 0) {
				dataTableValues = this.getDataDefault(cenario);
			} else {
				let data = [];
				dataTableValues.map((item) => {
					return data.push(item[cenario]);
				});
				dataTableValues = data;
			}
			data["data"] = dataTableValues;
			data["colunas"] = data["colunas"][cenario];
		}

		return data[resource];
	};

	getDataDefault = (cenario) => {
		let response = [];
		for (let i = 0; i < 5; i++) {
			let add = {
				id: cenario + i,
				col1: "-",
				col2: "-",
			};
			if (cenario !== "macro") {
				add["col3"] = "-";
			}
			response.push(add);
		}
		return response;
	};

	getDropOptions = (cenario, resource) => {
		let options = [
			{
				value: "-",
				label: "-",
			},
		];
		if (resource === "opcao") {
			let stateOptions = this.state.options[cenario];
			stateOptions.map((item, index) => {
				return options.push({
					value: `${item.id}`,
					label: item.description,
				});
			});
		} else {
			const optionsAvaliacao = ["Alta", "Média", "Baixa"];
			optionsAvaliacao.map((item, index) => {
				return options.push({
					value: `${index}`,
					label: item,
				});
			});
		}

		return {
			type: Type.SELECT,
			options: options,
		};
	};

	getFormatter = (cell, row, drop) => {
		let find = drop["options"].find((x) => `${x.value}` === `${cell}`);
		find
			? (find = find.label)
			: (find = drop["options"].find((x) => `${x.value}` === `-`).label);
		return find;
	};

	getHeaderStyle = (cell, row, resource, cenario) => {
		let style = {};
		if (resource === "avaliacao") {
			style = {
				width: "20%",
			};
			if (cenario === "fatores") {
				style["width"] = "50%";
			}
		}
		style["height"] = heigthRow;
		style["verticalAlign"] = "middle";
		return style;
	};

	getColunas = (cenario) => {
		const dataTableColunas = this.getData("colunas", cenario);
		const dropItem = this.getDropOptions(cenario, "opcao");
		const dropAvaliacao = this.getDropOptions(cenario, "avaliacao");

		const validator = (newValue, row, column) => {
			if (newValue == -1) {
				if (column.text === "Oportunidades") {
					this.setState({ modalEditOportunidadeIsOpen: true });
				} else {
					this.setState({ modalEditAmeacaIsOpen: true });
				}
			}
		};

		let colunas = [
			{
				dataField: "id",
				text: "Id",
				hidden: true,
			},
			{
				dataField: "col1",
				text: dataTableColunas[0],
				editor: dropItem,
				formatter: (cell, row) => this.getFormatter(cell, row, dropItem),
				headerStyle: (cell, row) =>
					this.getHeaderStyle(cell, row, "opcao", cenario),
				validator: validator,
			},
			{
				dataField: "col2",
				text: dataTableColunas[1],
				editor: dropAvaliacao,
				formatter: (cell, row) => this.getFormatter(cell, row, dropAvaliacao),
				headerStyle: (cell, row) =>
					this.getHeaderStyle(cell, row, "avaliacao", cenario),
				headerAlign: "center",
				align: "center",
			},
		];
		if (cenario !== "fatores") {
			colunas.push({
				dataField: "col3",
				text: dataTableColunas[2],
				editor: dropAvaliacao,
				formatter: (cell, row) => this.getFormatter(cell, row, dropAvaliacao),
				headerStyle: (cell, row) =>
					this.getHeaderStyle(cell, row, "avaliacao", cenario),
				headerAlign: "center",
				align: "center",
			});
		}

		return colunas;
	};

	loadTable = (cenario, xs, sm, md, lg, xl) => {
		let options = this.state.options;

		if (options === {}) return null;
		if (options === undefined) return null;

		const dataTableSelect = options[cenario];

		if (dataTableSelect.length === 0) return null;

		const dataTableValues = this.getData("data", cenario);
		const colunas = this.getColunas(cenario);
		const rowStyle = {
			height: heigthRow,
			verticalAlign: "middle",
		};

		// this.props.swot !== 'macro' ? wLg = '6' : cenario === 'fatores' ? wLg = '3' : wLg = '';
		// this.props.swot !== 'macro' ? wXl = '6' : cenario === 'fatores' ? wXl = '3' : wXl = '';

		return (
			<Col xs={xs} sm={sm} md={md} lg={lg} xl={xl}>
				<BootstrapTable
					key={cenario}
					keyField="id"
					data={dataTableValues}
					columns={colunas}
					rowStyle={rowStyle}
					cellEdit={cellEditFactory({
						mode: "click",
						blurToSave: true,
					})}
					striped
					hover
				/>
			</Col>
		);
	};

	handleSubmit = async (e) => {
		e.preventDefault();
		this.setState({
			isLoadingSave: true,
		});

		const data = this.state.swotData;

		let payload = [];
		data.map((item) => {
			let payloadData = {
				id: item["oportunidades"].id,
				oportunidadeId: item["oportunidades"]["col1"],
				atratividade_da_oportunidade: item["oportunidades"]["col2"],
				probabilidade_de_sucesso_da_oportunidade: item["oportunidades"]["col3"],
				ameacaId: item["ameacas"]["col1"],
				relevancia_da_ameaca: item["ameacas"]["col2"],
				probabilidade_de_ocorrer_a_ameaca: item["ameacas"]["col3"],
			};
			if (this.state.swot === "macro") {
				payloadData["fator"] = item["fatores"]["col1"];
				payloadData["tendencia"] = item["fatores"]["col2"];
			}

			return payload.push(payloadData);
		});

		payload = {
			ano: this.state.exercicio_definido,
			swot: payload,
		};
		const response = await AmbienteExternoService.updateSwot(
			this.state.swot,
			payload
		);
		const { status, message } = response;

		status === "success" ? toast.success(message) : toast.error(message);

		this.setState({
			isLoadingSave: false,
		});
	};

	handleMenu = (event) => {
		event.preventDefault();
		this.props.history.push(
			`/hub/${this.state.id}/gestao/categoria/diagnostico/externo`
		);
	};

	loaded = () => {
		let row = null;
		if (this.state.swot === "macro") {
			row = (
				<Row>
					{this.loadTable("fatores", "12", "8", "4", "3", "3")}
					{this.loadTable("oportunidades", "12", "12", "8", "9", "")}
					{this.loadTable("ameacas", "12", "12", "8", "9", "")}
				</Row>
			);
		} else {
			row = (
				<Row>
					{this.loadTable("oportunidades", "12", "12", "12", "6", "6")}
					{this.loadTable("ameacas", "12", "12", "12", "6", "6")}
				</Row>
			);
		}

		return row;
	};

	render() {
		let btnVoltar = null;
		if (this.state.swot === "macro") {
			btnVoltar = (
				<Button
					onClick={this.handleMenu}
					data-placement="top"
					title="Voltar ao Ambiente Interno"
					className="btn btn-sm btn-primary mr-1 float-right"
				>
					<i className="fa fa-arrow-left mr-2" />
					Menu
				</Button>
			);
		}

		return (
			<div className="animated fadeIn">
				<Card className="card-accent-danger">
					<CardHeader>
						<strong>SWOT</strong> - {this.getData("title")}
						<ButtonLoading
							onClick={this.handleSubmit}
							className="btn btn-sm btn-success mr-1 float-right"
							visible={CompanyService.showSaveButtonToDemo()}
						>
							<i className="fa fa-save mr-2" />
							Salvar SWOT
						</ButtonLoading>
						{btnVoltar}
					</CardHeader>
					<CardBody>
						{this.state.isLoading ? (
							<LoadingSpinner
								isLoading={this.state.isLoading}
								width={"1.5rem"}
							/>
						) : (
							this.loaded()
						)}
					</CardBody>
				</Card>

				{this.state.modalEditOportunidadeIsOpen && (
					<ModalSwotCategory
						handleToggle={() =>
							this.setState({ modalEditOportunidadeIsOpen: false })
						}
						category="Oportunidades"
						type="oportunidade"
						resource={this.state.swot}
					/>
				)}
				{this.state.modalEditAmeacaIsOpen && (
					<ModalSwotCategory
						handleToggle={() => this.setState({ modalEditAmeacaIsOpen: false })}
						category="Ameaças"
						type="ameaca"
						resource={this.state.swot}
					/>
				)}
			</div>
		);
	}
}

export default SwotForm;
