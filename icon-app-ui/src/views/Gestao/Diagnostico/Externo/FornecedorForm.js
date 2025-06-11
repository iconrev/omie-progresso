import { Component } from "react";
import {
	Card,
	CardBody,
	CardFooter,
	CardHeader,
	Badge,
	Button,
	Row,
	Col,
} from "reactstrap";
import { BootstrapTable, TableHeaderColumn } from "react-bootstrap-table";
import Generic from "../../../Utils/Generic";
import LoadingSpinner from "../../../../components/LoadingSpinner";
import SwotForm from "../Swot/SwotTable";
import { toast } from "react-toastify";
import CompanyService from "../../../../service/CompanyService";
import AmbienteExternoService from "../../../../service/Diagnostico/AmbienteExterno";
import ButtonLoading from "../../../../components/ButtonLoading";

class FornecedorForm extends Component {
	constructor(props) {
		super(props);

		this.company = CompanyService.getDataCompany();
		if (!this.company) return this.props.history.push("/");

		this.getSelectedValue = this.getSelectedValue.bind(this);

		this.options = {
			sortIndicator: false,
			hideSizePerPage: false,
			noDataText: "Os dados não foram carregados.",
			withoutNoDataText: true,
		};

		this.state = {
			isLoading: true,
			isLoadingSave: false,
			companyId: this.company.id,
			exercicio_definido: this.company.exercicioDefinido,
			fornecedores: [],
			preco: 0.0,
			qualidade: 0.0,
			entrega: 0.0,
			inovacao: 0.0,
			portifolio: 0.0,
			competitividade: 0.0,
		};

		this.fornecedorSelectData = [
			"Me Encanta",
			"Me Atende",
			"Me Decepciona",
			"Não Avaliado",
		];

		this.media = {
			preco: 0.0,
			qualidade: 0.0,
			entrega: 0.0,
			inovacao: 0.0,
			portifolio: 0.0,
		};
	}

	async componentDidMount() {
		await this.loadData();
		this.setState({
			isLoading: false,
		});
	}

	loadData = async () => {
		const response = await AmbienteExternoService.getListaResource(
			"fornecedores"
		);
		const { status, data, message } = response;

		if (status !== "success") {
			toast.error(message || "Erro ao carregar os dados");
			return;
		}

		const dataYear = data[this.state.exercicio_definido];

		const list = [];
		for (const data of dataYear)
			list.push({
				id: data.id,
				fornecedor: data.fornecedor,
				preco: this.getSelectedValue(data.preco),
				qualidade: this.getSelectedValue(data.qualidade),
				entrega: this.getSelectedValue(data.entrega),
				inovacao: this.getSelectedValue(data.inovacao),
				portifolio: this.getSelectedValue(data.portifolio),
			});

		this.setState({
			fornecedores: list,
		});

		await this.atualizarPontos();
	};

	getSelectedValue = (value, reverse = false) => {
		if (reverse) {
			// do nothing...
			let pos = this.fornecedorSelectData.indexOf(value);
			if (pos === -1) {
				return 0;
			}
			return pos;
		} else {
			// obtem o índice do registro.
			let index = parseInt(value, 10);
			// obtem o elemento referente ao índice
			return this.fornecedorSelectData[index];
		}
	};

	handleSubmit = async (event) => {
		event.preventDefault();

		this.setState({
			isLoadingSave: true,
		});

		const list = [];

		for (const cliente of this.state.fornecedores) {
			list.push({
				id: cliente.id,
				fornecedor: cliente.fornecedor,
				preco: this.getSelectedValue(cliente.preco, true),
				qualidade: this.getSelectedValue(cliente.qualidade, true),
				entrega: this.getSelectedValue(cliente.entrega, true),
				inovacao: this.getSelectedValue(cliente.inovacao, true),
				portifolio: this.getSelectedValue(cliente.portifolio, true),
			});
		}

		const data = {
			ano: this.state.exercicio_definido,
			data: list,
		};

		const response = await AmbienteExternoService.updateResource(
			"fornecedores",
			data
		);
		const { status, message } = response;

		if (status === "success") {
			toast.success(message);
			await this.atualizarPontos();
		} else {
			toast.error(message);
		}

		this.setState({
			isLoadingSave: false,
		});
	};

	atualizarPontos = async () => {
		await Promise.all([
			this.calcularPontos("preco"),
			this.calcularPontos("entrega"),
			this.calcularPontos("qualidade"),
			this.calcularPontos("inovacao"),
			this.calcularPontos("portifolio"),
		]);
		await this.calcularCompetitividade();
	};

	calcularPontos = async (resource) => {
		const POINT_MAX_ITEM = 20;

		let pontos = [];

		for (const item of this.state.fornecedores) {
			if (item[resource] === "Me Atende") {
				pontos.push(10);
			} else if (item[resource] === "Me Encanta") {
				pontos.push(POINT_MAX_ITEM);
			} else if (item[resource] === "Me Decepciona") {
				pontos.push(0);
			}
		}

		const sumItem = pontos.reduce((a, b) => a + b, 0);
		const media = (100 / POINT_MAX_ITEM) * (sumItem / pontos.length);

		this.setState({
			[resource]: media,
		});

		this.media[resource] = media;
	};

	calcularCompetitividade = async () => {
		let pontos = 0;
		// calcula os pontos
		pontos += this.media["preco"];
		pontos += this.media["qualidade"];
		pontos += this.media["entrega"];
		pontos += this.media["inovacao"];
		pontos += this.media["portifolio"];
		// calcula o fator de competitividade
		pontos = pontos / 5;

		this.setState({
			competitividade: pontos,
		});
	};

	handleMenu = (event) => {
		event.preventDefault();
		this.props.history.push(
			`/hub/${this.state.companyId}/gestao/categoria/diagnostico/externo`
		);
	};

	tableDiagnostico = () => {
		const editable = (type) => {
			return {
				type: type,
				options: {
					values: this.fornecedorSelectData,
				},
			};
		};

		const cellEditProp = {
			mode: "click",
			blurToSave: true,
			afterSaveCell: () => {
				this.atualizarPontos();
				return true;
			},
		};

		const renderTableHeaderColumnCustom = (
			field,
			title,
			editableType = "select",
			width = "150px",
			badge = true
		) => {
			return (
				<TableHeaderColumn
					dataField={field}
					width={width}
					editable={editable(editableType)}
				>
					<Row className={"align-items-center"}>
						<Col>{title}</Col>
						<Col>
							{!badge ? null : (
								<Badge
									className={
										Generic.getBadgelColor(this.state[field]) + " float-right"
									}
								>
									{Generic.formatNumber(this.state[field])} %
								</Badge>
							)}
						</Col>
					</Row>
				</TableHeaderColumn>
			);
		};

		return (
			<BootstrapTable
				data={this.state.fornecedores}
				version="4"
				cellEdit={cellEditProp}
				striped
				hover
				options={this.options}
			>
				<TableHeaderColumn isKey dataField="id" hidden>
					Id
				</TableHeaderColumn>
				{renderTableHeaderColumnCustom(
					"fornecedor",
					"Fornecedor",
					"text",
					"30%",
					false
				)}
				{renderTableHeaderColumnCustom("preco", "Preço", "select", "14%")}
				{renderTableHeaderColumnCustom(
					"qualidade",
					"Qualidade",
					"select",
					"14%"
				)}
				{renderTableHeaderColumnCustom("entrega", "Entrega", "select", "14%")}
				{renderTableHeaderColumnCustom("inovacao", "Inovação", "select", "14%")}
				{renderTableHeaderColumnCustom(
					"portifolio",
					"Portifólio",
					"select",
					"14%"
				)}
			</BootstrapTable>
		);
	};

	avaliacaoFornecedor = () => {
		return (
			<Card className="card-accent-warning">
				<CardHeader>
					<Row className={"align-items-center"}>
						<Col>
							<strong>Diagnóstico de Ambiente Externo</strong> - Fornecedores
						</Col>
						<Col>
							<div className="card-header-actions">
								<ButtonLoading
									onClick={this.handleSubmit}
									className="btn btn-sm btn-success mr-1 float-right"
									isLoading={this.state.isLoadingSave}
									visible={CompanyService.showSaveButtonToDemo()}
								>
									<i className="fa fa-save mr-2" />
									Salvar
								</ButtonLoading>
								<Button
									onClick={this.handleMenu}
									data-placement="top"
									title="Voltar ao Ambiente Interno"
									className="btn btn-sm btn-primary mr-1 float-right"
								>
									<i className="fa fa-arrow-left mr-2" />
									Menu
								</Button>
							</div>
						</Col>
					</Row>
				</CardHeader>
				<CardBody>{this.tableDiagnostico()}</CardBody>
				<CardFooter>
					<Row className={"align-items-center"}>
						<Col>
							<h5 className={"p-0 m-0"}>
								Seu nível de competitividade final:{" "}
								<Badge
									className={Generic.getBadgelColor(this.state.competitividade)}
								>
									{Generic.formatNumber(this.state.competitividade)} %
								</Badge>
							</h5>
						</Col>
					</Row>
				</CardFooter>
			</Card>
		);
	};

	loaded = () => {
		return (
			<div className="animated fadeIn">
				{this.avaliacaoFornecedor()}
				<div>
					<SwotForm swot={"fornecedores"} />
				</div>
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

export default FornecedorForm;
