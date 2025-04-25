import { Component } from "react";
import { Card, CardBody, CardHeader, Row, Col } from "reactstrap";
import BootstrapTable from "react-bootstrap-table-next";
import { Type } from "react-bootstrap-table2-editor";
import CompanyService from "../../../service/CompanyService";

const heigthRow = "70px";

class SwotForm extends Component {
	constructor(props) {
		super(props);

		this.company = CompanyService.getDataCompany();

		this.state = {
			swot: this.props.swot,
			swotData: [],
			isLoading: true,
			isLoadingSave: false,
			macro: false
		};
	}

	async componentDidMount() {
		await this.loadData();
		this.setState({
			isLoading: false,
		});
	}


	loadData = async () => {

		console.log('swot')

		const { swot, macro } = this.props;

		console.log('swot',swot)

		let data = swot;
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
			macro: macro
		});
			
	};

	loadStateDefault = (data) => {
		let start = data.length === 0 ? 0 : data.length;
		for (let i = start; i < 5; i++) {
			data.push({
				key: i,
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

			console.log('this.state.swotData', this.state.swotData)

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

			console.log('dataTableValues', dataTableValues);
			console.log('cenario', cenario)

			data["data"] = dataTableValues;
			data["colunas"] = data["colunas"][cenario];
		}

		console.log('resource', resource)

		return data[resource];
	};

	getDataDefault = (cenario) => {
		let response = [];
		for (let i = 0; i < 5; i++) {
			let add = {
				key: i,
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
					key: index,
					value: `${index}`,
					label: item,
				});
			});
		} else {
			const optionsAvaliacao = ["Alta", "Média", "Baixa"];
			optionsAvaliacao.map((item, index) => {
				return options.push({
					key: index,
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

		console.log('dataTableColunas', dataTableColunas)

		let colunas = [
			{
				dataField: "id",
				text: "Id",
				hidden: true,
			},
			{
				dataField: "col1",
				text: dataTableColunas[0],
				headerStyle: (cell, row) =>
					this.getHeaderStyle(cell, row, "opcao", cenario),
			},
			{
				dataField: "col2",
				text: dataTableColunas[1],
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

		console.log('options', options)

		//if (options == {}) return null;
		//if (options === undefined) return null;

		//const dataTableSelect = options[cenario];

		//if (dataTableSelect.length === 0) return null;

		const dataTableValues = this.getData("data", cenario);
		const colunas = this.getColunas(cenario);
		const rowStyle = {
			height: heigthRow,
			verticalAlign: "middle",
		};

		// this.props.swot !== 'macro' ? wLg = '6' : cenario === 'fatores' ? wLg = '3' : wLg = '';
		// this.props.swot !== 'macro' ? wXl = '6' : cenario === 'fatores' ? wXl = '3' : wXl = '';


		console.log('-> dataTableValues', dataTableValues)
		console.log('-> colunas', colunas)

		return (
			<Col xs={xs} sm={sm} md={md} lg={lg} xl={xl}>
				<BootstrapTable
					key={cenario}
					keyField="id"
					data={dataTableValues}
					columns={colunas}
					rowStyle={rowStyle}
					striped
					hover
				/>
			</Col>
		);
	};

	loaded = () => {
		let row = null;
		if (this.state.macro) {
			row = (
				<Row>
					{this.loadTable("fatores", "12")}
					{this.loadTable("oportunidades", "6")}
					{this.loadTable("ameacas", "6")}
				</Row>
			);
		} else {
			row = (
				<Row>
					{this.loadTable("oportunidades", "6")}
					{this.loadTable("ameacas", "6")}
				</Row>
			);
		}

		return row;
	};

	render() {
		return (
			<div className="animated fadeIn">
				<Card className="card-accent-danger">
					<CardHeader>
						<strong>SWOT</strong> - {this.props.title}
						{/* {this.getData("title")} */}
					</CardHeader>
					<CardBody>
						{this.loaded()}
					</CardBody>
				</Card>
			</div>
		);
	}
}

export default SwotForm;
