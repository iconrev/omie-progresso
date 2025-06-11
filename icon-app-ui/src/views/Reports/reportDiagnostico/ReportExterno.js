import React from "react";
import {
	Card,
	CardBody,
	CardHeader,
	Col,
	Row,
	CardFooter,
	Badge,
} from "reactstrap";
import Graph from "../../Graficos/Externo/Avaliacao3";
import SwotForm from "../swot/SwotTable";
import Generic from "../../Utils/Generic";
import { BootstrapTable, TableHeaderColumn } from "react-bootstrap-table";
import style from './Page.module.css'

export default function ReportExterno(props) {
	const { params } = props;

	const questionario = params.externo ? params.externo : [];

	const options = {
		sortIndicator: false,
		hideSizePerPage: true,
		withoutNoDataText: true,
	};

	const renderChart = (title, resource, labels = []) => {
		return (
			<Col xs="12">
				<Card style={{ margin: '20px auto', width: '615px' }}>
					<CardHeader>
						<Row className={"align-items-center"}>
							<Col>{title}</Col>
						</Row>
					</CardHeader>
					<CardBody>
						<div className="chart-wrapper">
							<Graph
								data={resource}
								labels={labels}
							/>
						</div>
					</CardBody>
				</Card>
			</Col>
		);
	};

	const avaliacaoConcorrentes = () => {
		return (
			<Card className="card-accent-warning">
				<CardHeader>
					<Row className={"align-items-center"}>
						<Col>
							<strong>Diagnóstico de Ambiente Externo</strong> - Concorrentes
						</Col>
					</Row>
				</CardHeader>
				<CardBody>{tableDiagnosticoConcorrentes()}</CardBody>
				<CardFooter>
					<Row className={"align-items-center"}>
						<Col>
							<h5 className={"p-0 m-0"}>
								Seu nível de competitividade final:{" "}
								<Badge
									className={Generic.getBadgelColor(questionario.concorrentes.media_competitividade.competitividade)}
								>
									{Generic.formatNumber(questionario.concorrentes.media_competitividade.competitividade)} %
								</Badge>
							</h5>
						</Col>
					</Row>
				</CardFooter>
			</Card>
		);
	};

	const tableDiagnosticoConcorrentes = () => {

		const renderTableHeaderColumnCustom = (
			field,
			title,
			value,
			width = "150px",
			badge = true
		) => {
			return (
				<TableHeaderColumn
					dataField={field}
					width={width}
				>
					<Row className={"align-items-center"}>
						<Col>{title}</Col>
						<Col>
							{!badge ? null : (
								<Badge
									className={
										Generic.getBadgelColor(value) + " float-right"
									}
								>
									{Generic.formatNumber(value)} %
								</Badge>
							)}
						</Col>
					</Row>
				</TableHeaderColumn>
			);
		};

		return (
			<BootstrapTable
				data={questionario.concorrentes.list}
				version="4"
				striped
				hover
				options={options}
			>
				<TableHeaderColumn isKey dataField="id" hidden>
					Id
				</TableHeaderColumn>
				{renderTableHeaderColumnCustom("concorrente", "Concorrente", "", "", false)}
				{renderTableHeaderColumnCustom("preco", "Preço", questionario.concorrentes.media_competitividade.media_preco, "", true)}
				{renderTableHeaderColumnCustom("qualidade", "Qualidade", questionario.concorrentes.media_competitividade.media_qualidade, "", true)}
				{renderTableHeaderColumnCustom("entrega", "Entrega", questionario.concorrentes.media_competitividade.media_entrega, "", true)}
				{renderTableHeaderColumnCustom("inovacao", "Inovação", questionario.concorrentes.media_competitividade.media_inovacao, "", true)}
				{renderTableHeaderColumnCustom("portifolio", "Portifólio", questionario.concorrentes.media_competitividade.media_portifolio, "", true)}
			</BootstrapTable>
		);
	};


	const avaliacaoClientes = () => {
		return (
			<Card className="card-accent-warning">
				<CardHeader>
					<Row className={"align-items-center"}>
						<Col>
							<strong>Diagnóstico de Ambiente Externo</strong> - Clientes
						</Col>
					</Row>
				</CardHeader>
				<CardBody>{tableDiagnosticoClientes()}</CardBody>
				<CardFooter>
					<Row className={"align-items-center"}>
						<Col>
							<h5 className={"p-0 m-0"}>
								Seu nível de competitividade final:{" "}
								<Badge
									className={Generic.getBadgelColor(questionario.clientes.media_competitividade.competitividade)}
								>
									{Generic.formatNumber(questionario.clientes.media_competitividade.competitividade)} %
								</Badge>
							</h5>
						</Col>
					</Row>
				</CardFooter>
			</Card>
		);
	};

	const tableDiagnosticoClientes = () => {

		const renderTableHeaderColumnCustom = (
			field,
			title,
			value,
			width = "150px",
			badge = true
		) => {
			return (
				<TableHeaderColumn
					dataField={field}
					width={width}
				>
					<Row className={"align-items-center"}>
						<Col>{title}</Col>
						<Col>
							{!badge ? null : (
								<Badge
									className={
										Generic.getBadgelColor(value) + " float-right"
									}
								>
									{Generic.formatNumber(value)} %
								</Badge>
							)}
						</Col>
					</Row>
				</TableHeaderColumn>
			);
		};

		return (
			<BootstrapTable
				data={questionario.clientes.list}
				version="4"
				striped
				hover
				options={options}
			>
				<TableHeaderColumn isKey dataField="id" hidden>
					Id
				</TableHeaderColumn>
				{renderTableHeaderColumnCustom("cliente", "Cliente", "", "", false)}
				{renderTableHeaderColumnCustom("preco", "Preço", questionario.clientes.media_competitividade.media_preco, "", true)}
				{renderTableHeaderColumnCustom("qualidade", "Qualidade", questionario.clientes.media_competitividade.media_qualidade, "", true)}
				{renderTableHeaderColumnCustom("entrega", "Entrega", questionario.clientes.media_competitividade.media_entrega, "", true)}
				{renderTableHeaderColumnCustom("inovacao", "Inovação", questionario.clientes.media_competitividade.media_inovacao, "", true)}
				{renderTableHeaderColumnCustom("portifolio", "Portifólio", questionario.clientes.media_competitividade.media_portifolio, "", true)}
			</BootstrapTable>
		);
	};


	const avaliacaoFornecedores = () => {
		return (
			<Card className="card-accent-warning">
				<CardHeader>
					<Row className={"align-items-center"}>
						<Col>
							<strong>Diagnóstico de Ambiente Externo</strong> - Fornecedores
						</Col>
					</Row>
				</CardHeader>
				<CardBody>{tableDiagnosticoFornecedores()}</CardBody>
				<CardFooter>
					<Row className={"align-items-center"}>
						<Col>
							<h5 className={"p-0 m-0"}>
								Seu nível de competitividade final:{" "}
								<Badge
									className={Generic.getBadgelColor(questionario.fornecedores.media_competitividade.competitividade)}
								>
									{Generic.formatNumber(questionario.fornecedores.media_competitividade.competitividade)} %
								</Badge>
							</h5>
						</Col>
					</Row>
				</CardFooter>
			</Card>
		);
	};

	const tableDiagnosticoFornecedores = () => {

		const renderTableHeaderColumnCustom = (
			field,
			title,
			value,
			width = "150px",
			badge = true
		) => {
			return (
				<TableHeaderColumn
					dataField={field}
					width={width}
				>
					<Row className={"align-items-center"}>
						<Col>{title}</Col>
						<Col>
							{!badge ? null : (
								<Badge
									className={
										Generic.getBadgelColor(value) + " float-right"
									}
								>
									{Generic.formatNumber(value)} %
								</Badge>
							)}
						</Col>
					</Row>
				</TableHeaderColumn>
			);
		};

		return (
			<BootstrapTable
				data={questionario.fornecedores.list}
				version="4"
				striped
				hover
				options={options}
			>
				<TableHeaderColumn isKey dataField="id" hidden>
					Id
				</TableHeaderColumn>
				{renderTableHeaderColumnCustom("fornecedor", "Fornecedor", "", "", false)}
				{renderTableHeaderColumnCustom("preco", "Preço", questionario.fornecedores.media_competitividade.media_preco, "", true)}
				{renderTableHeaderColumnCustom("qualidade", "Qualidade", questionario.fornecedores.media_competitividade.media_qualidade, "", true)}
				{renderTableHeaderColumnCustom("entrega", "Entrega", questionario.fornecedores.media_competitividade.media_entrega, "", true)}
				{renderTableHeaderColumnCustom("inovacao", "Inovação", questionario.fornecedores.media_competitividade.media_inovacao, "", true)}
				{renderTableHeaderColumnCustom("portifolio", "Portifólio", questionario.fornecedores.media_competitividade.media_portifolio, "", true)}
			</BootstrapTable>
		);
	};

	return (
		<>
			<div className={style.page}>
				<div>Concorrentes</div>

				{avaliacaoConcorrentes()}

				<div>
					<SwotForm swot={questionario.concorrentes.swot} title={"Concorrentes"} />
				</div>

				{renderChart("Concorrentes", questionario.concorrentes, [
					"Preço",
					"Qualidade",
					"Entrega",
					"Inovação",
					"Portifolio",
				])}

			</div>

			<div className={style.page}>
				<div>Clientes</div>

				{avaliacaoClientes()}

				<div>
					<SwotForm swot={questionario.clientes.swot} title={"Clientes"} macro={false} />
				</div>

				{renderChart("Clientes", questionario.clientes, [
					"Preço",
					"Qualidade",
					"Entrega",
					"Inovação",
					"Portifolio",
				])}
			</div>


			<div className={style.page}>
				<div>Fornecedor</div>

				{avaliacaoFornecedores()}

				<div>
					<SwotForm swot={questionario.fornecedores.swot} title={"Fornecedores"} macro={false} />
				</div>

				{renderChart("Fornecedores", questionario.fornecedores, [
					"Preço",
					"Qualidade",
					"Entrega",
					"Inovação",
					"Portifolio",
				])}

			</div>

			<div className={style.page}>
				<div>Macro Ambiente</div>

				<div>
					<SwotForm swot={questionario.macros.list} title={"Macro Ambiente"} macro={true} />
				</div>

				{renderChart("Macro Ambiente", questionario.macros, [])}
			</div>


		</>
	);
}
