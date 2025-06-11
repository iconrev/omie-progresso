/* eslint-disable jsx-a11y/anchor-is-valid */
import React, { Component } from "react";
import { BootstrapTable, TableHeaderColumn } from "react-bootstrap-table";
import {
	Button,
	Card,
	CardBody,
	CardHeader,
	Col,
	Row,
	Badge,
} from "reactstrap";
import { toast } from "react-toastify";
import ApiBase from "../../service/api_base";
import InputMask from "react-input-mask";
import LoadingSpinner from "../../components/LoadingSpinner";
import ModalEmpresa from "../../components/ModalEmpresa";
import CompanyService from "../../service/CompanyService";

const Api_Base = new ApiBase();

class Empresas extends Component {
	constructor(props) {
		super(props);

		this.toggleModal = this.toggleModal.bind(this);
		this.loadTable = this.loadTable.bind(this);

		CompanyService.removeCompanyLocalStorage();

		this.state = {
			modalEmpresaEdit: false,
			empresas: [],
			empresa: "",
			cnpj: "",
			usuario: "",
			active: false,
			selectedRow: [],
			editing: false,
			isLoading: true,
			isLoadingEdit: false,
			owner: true,
		};
	}

	async componentDidMount() {
		await this.loadTable();
		await this.setState({
			isLoading: false,
		});
	}

	async loadTable() {
		await Api_Base.get(`/cadastros/usuarios/empresas`)
			.then(async (response) => {
				const { status, companies } = response.data;

				if (status === "success") {
					await this.setState({
						empresas: companies,
					});
				} else {
					toast.error(`Não foi possível carregar suas empresas`);
				}
			})
			.catch((err) => console.error(err));
	}

	toggleModal() {
		this.setState({
			modalEmpresaEdit: !this.state.modalEmpresaEdit,
		});
	}

	handleEditarEmpresa = async (e, company) => {
		e.preventDefault();

		await this.setState({
			modalEmpresaEdit: true,
			editing: true,
			companyId: company.id,
			empresa: company.nome,
			cnpj: company.cnpj,
			active: company.active,
		});
	};

	modalEmpresa = () => {
		if (!this.state.modalEmpresaEdit) return null;

		return (
			<ModalEmpresa
				toggle={this.toggleModal}
				companyId={this.state.companyId}
				empresa={this.state.empresa}
				cnpj={this.state.cnpj}
				active={this.state.active === 1 ? true : false}
				editing={this.state.editing}
				refresh={this.loadTable}
			/>
		);
	};

	columnStatus(cell, row) {
		const status = row.active;

		let text;
		let color;
		if (status) {
			text = "ATIVO";
			color = "success";
		} else {
			text = "INATIVO";
			color = "danger";
		}
		return (
			<div className="text-center">
				<Badge color={color} pill>
					{text}
				</Badge>
			</div>
		);
	}

	columnTipo(cell, row) {
		const status = row.owner;

		let text;
		let color;
		if (status) {
			text = "PROPRIETÁRIO";
			color = "primary";
		} else {
			text = "CONVIDADO";
			color = "warning";
		}
		return (
			<div className="text-center">
				<Badge color={color} pill>
					{text}
				</Badge>
			</div>
		);
	}

	getCompanyDetails = async (companyId, showError = true) => {
		let response = false;

		await Api_Base.get(`/cadastros/empresas/${companyId}/detalhes`)
			.then((result) => {
				const { status, exercicios } = result.data;

				if (status === "success") {
					if (exercicios.length === 0) {
						toast.error("A empresa não possui exercícios cadastrados...");
					} else {
						CompanyService.setCompanyLocalStorage(result.data);
						response = true;
					}
				} else {
					const { message } = result.data;

					if (showError) {
						toast.error(message);
					}
				}
			})
			.catch((err) => {
				console.error(err);
			});

		return response;
	};

	handleUserInvite = async (e, row) => {
		e.preventDefault();

		let status = await this.getCompanyDetails(row.id);

		if (status) {
			return this.props.history.push(`/hub/${row.id}/gestao/usuarios`);
		}
	};

	columnBtns = (cell, row) => {
		let btnEditar = (
			<Button
				color="secondary"
				className="btn-sm"
				onClick={(e) => this.handleEditarEmpresa(e, row)}
			>
				Editar
			</Button>
		);
		let btnConvidados = (
			<Button
				color="info"
				className="btn-sm"
				onClick={(e) => this.handleUserInvite(e, row)}
			>
				Usuários
			</Button>
		);
		let btnFunctions = (
			<Row>
				<Col>
					{btnEditar} {row.active ? btnConvidados : null}
				</Col>
			</Row>
		);

		return (
			<Row className="text-center">
				<Col md={"12"} className="align-content-center">
					{row.owner ? btnFunctions : null}
				</Col>
			</Row>
		);
	};

	renderTableEmpresa = () => {
		const selectRowProp = {
			mode: "checkbox",
			hideSelectColumn: true, // enable hide selection column.
			clickToSelect: true, // you should enable clickToSelect, otherwise, you can't select column.
		};
		const options = {
			sortName: "nome",
			sortOrder: "asc",
		};

		return (
			<BootstrapTable
				id="tableCompany"
				version="4"
				data={this.state.empresas}
				striped
				hover
				selectRow={selectRowProp}
				options={options}
			>
				<TableHeaderColumn id="id_column" dataField="id" isKey={true} hidden>
					ID
				</TableHeaderColumn>
				<TableHeaderColumn dataField="nome" editable={false} width="30%">
					Empresa
				</TableHeaderColumn>
				<TableHeaderColumn
					dataField="cnpj"
					dataFormat={cnpjFormatter}
					editable={false}
					width="25%"
				>
					CNPJ
				</TableHeaderColumn>
				<TableHeaderColumn
					dataField="active"
					dataFormat={this.columnStatus}
					width="15%"
				>
					Status
				</TableHeaderColumn>
				<TableHeaderColumn
					dataField="active"
					dataFormat={this.columnTipo}
					width="15%"
				>
					Tipo
				</TableHeaderColumn>
				<TableHeaderColumn
					dataField="active"
					dataFormat={this.columnBtns}
					width="15%"
				/>
			</BootstrapTable>
		);
	};

	renderTableSemEmpresas = () => {
		return <div>Não há nenhuma empresa cadastrada.</div>;
	};

	loaded = () => {
		return (
			<div className="animated fadeIn">
				<Card className="card-accent-warning">
					<CardHeader>
						<strong>Minhas Empresas </strong>
					</CardHeader>
					<CardBody>
						{this.state.empresas.length > 0
							? this.renderTableEmpresa()
							: this.renderTableSemEmpresas()}
					</CardBody>
				</Card>
				{this.modalEmpresa()}
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

class CnpjFormatter extends React.Component {
	render() {
		return (
			<InputMask
				className="form-control"
				mask="99.999.999/9999-99"
				readOnly
				defaultValue={this.props.active}
			/>
		);
	}
}

function cnpjFormatter(cell) {
	return <CnpjFormatter active={cell} />;
}

export default Empresas;
