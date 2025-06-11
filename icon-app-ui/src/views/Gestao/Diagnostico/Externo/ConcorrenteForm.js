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
import "font-awesome/css/font-awesome.min.css";
import Generic from "../../../Utils/Generic";
import { toast } from "react-toastify";
import LoadingSpinner from "../../../../components/LoadingSpinner";
import SwotForm from "../Swot/SwotTable";
import CompanyService from "../../../../service/CompanyService";
import AmbienteExternoService from "../../../../service/Diagnostico/AmbienteExterno";
import ButtonLoading from "../../../../components/ButtonLoading";

class ConcorrenteForm extends Component {
	constructor(props) {
		super(props);

		this.company = CompanyService.getDataCompany();
		if (!this.company) return this.props.history.push("/");

		this.getSelectedValue = this.getSelectedValue.bind(this);

		this.options = {
			sortIndicator: false,
			hideSizePerPage: true,
			withoutNoDataText: true,
		};

		this.state = {
			isLoading: true,
			isLoadingSave: false,
			companyId: this.company.id,
			exercicio_definido: this.company.exercicioDefinido,
			concorrentes: [],
			preco: 0.0,
			qualidade: 0.0,
			entrega: 0.0,
			inovacao: 0.0,
			portifolio: 0.0,
			competitividade: 0.0,
		};

		this.selectData = [
			"Sou Melhor",
			"Sou Igual",
			"Sou Inferior",
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
			"concorrentes"
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
				concorrente: data.concorrente,
				preco: this.getSelectedValue(data.preco),
				qualidade: this.getSelectedValue(data.qualidade),
				entrega: this.getSelectedValue(data.entrega),
				inovacao: this.getSelectedValue(data.inovacao),
				portifolio: this.getSelectedValue(data.portifolio),
			});

		this.setState({
			concorrentes: list,
		});

		await this.atualizarPontos();
	};

	getSelectedValue = (value, reverse = false) => {
		if (reverse) {
			// do nothing...
			let pos = this.selectData.indexOf(value);
			if (pos === -1) {
				return 0;
			}
			return pos;
		} else {
			// obtem o índice do registro.
			let index = parseInt(value, 10);
			// obtem o elemento referente ao índice
			return this.selectData[index];
		}
	};

	handleSubmit = async (event) => {
		event.preventDefault();

		this.setState({
			isLoadingSave: true,
		});

		const list = [];

		for (const concorrente of this.state.concorrentes) {
			list.push({
				id: concorrente.id,
				concorrente: concorrente.concorrente,
				preco: this.getSelectedValue(concorrente.preco, true),
				qualidade: this.getSelectedValue(concorrente.qualidade, true),
				entrega: this.getSelectedValue(concorrente.entrega, true),
				inovacao: this.getSelectedValue(concorrente.inovacao, true),
				portifolio: this.getSelectedValue(concorrente.portifolio, true),
			});
		}

		const data = {
			ano: this.state.exercicio_definido,
			data: list,
		};

		const response = await AmbienteExternoService.updateResource(
			"concorrentes",
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

		const pontos = [];

		for (const key of this.state.concorrentes) {
			if (key[resource] === "Sou Igual") {
				pontos.push(10);
			} else if (key[resource] === "Sou Melhor") {
				pontos.push(POINT_MAX_ITEM);
			} else if (key[resource] === "Sou Inferior") {
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
					values: this.selectData,
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
				data={this.state.concorrentes}
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
					"concorrente",
					"Concorrente",
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

	avaliacaoConcorrentes = () => {
		return (
			<Card className="card-accent-warning">
				<CardHeader>
					<Row className={"align-items-center"}>
						<Col>
							<strong>Diagnóstico de Ambiente Externo</strong> - Concorrentes
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
				{this.avaliacaoConcorrentes()}
				<div>
					<SwotForm swot={"concorrentes"} />
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

export default ConcorrenteForm;
