import { Component } from "react";
import {
	Alert,
	Button,
	Card,
	CardBody,
	CardFooter,
	CardHeader,
} from "reactstrap";
import { BootstrapTable, TableHeaderColumn } from "react-bootstrap-table";
import { toast } from "react-toastify";
import LoadingSpinner from "../../../../components/LoadingSpinner";
import ButtonLoading from "../../../../components/ButtonLoading";
import CompanyService from "../../../../service/CompanyService";
import SobrevivenciaService from "../../../../service/Diagnostico/Sobrevivencia/index";

const cellEditProp = {
	mode: "click",
	blurToSave: true,
};

class QuestionarioForm extends Component {
	constructor(props) {
		super(props);

		this.company = CompanyService.getDataCompany();
		if (!this.company) return this.props.history.push("/");

		this.state = {
			isLoading: true,
			companyId: this.company.id,
			exercicio_definido: this.company.exercicioDefinido,
			questionarios: [],
			loadingSave: false,
		};

		this.selectData = ["Sim", "+/-", "Não"];
	}

	async componentDidMount() {
		await this.loadData();
		this.setState({
			isLoading: false,
		});
	}

	loadData = async () => {
		await SobrevivenciaService.getLista()
			.then(async (response) => {
				const list = [];
				const { questionarios } = response;

				if (Object.keys(questionarios).length > 0) {
					let questionarioYear = questionarios[this.state.exercicio_definido];

					for (const item of questionarioYear) {
						list.push({
							id: item.id,
							descricao: item.descricao,
							resposta: item.resposta,
						});
					}
				}

				this.setState({
					questionarios: list,
				});
			})
			.catch((err) => {
				const message = "Não foi possível carregar os dados";
				console.error(message, err);
				if (err.response.status !== 401) {
					toast.error(err.response.data.message || message);
				} else {
					toast.error(message);
					return this.redirect("/diagnostico");
				}
			});
	};

	redirect = (url) => {
		url = `/hub/${this.state.companyId}/gestao/${url}`;
		this.props.history.push(url);
	};

	handleSubmit = async (event) => {
		event.preventDefault();

		let respostas = this.state.questionarios;
		let respostasCompletas = 0;
		for (let i = 0; i < respostas.length; i++) {
			let resposta = respostas[i].resposta;
			if (resposta !== null && resposta !== undefined) {
				respostasCompletas += 1;
			}
		}

		if (respostasCompletas < respostas.length) {
			let diff = respostas.length - respostasCompletas;
			if (diff === 1) {
				toast.error("Há ainda " + diff + " questão a ser respondida :(");
			} else {
				toast.error("Há " + diff + " questões a serem respondidas :(");
			}
			return;
		}

		let data = {
			avaliacao: respostas,
			ano: this.state.exercicio_definido,
		};

		this.setState({
			loadingSave: true,
		});

		await SobrevivenciaService.update(data)
			.then((result) => {
				const { status, message } = result;
				if (status !== "success") {
					toast.error(message);
				} else {
					toast.success(message);
				}
			})
			.catch((err) => {
				console.error(err);
				toast.error("Ocorreu um problema ao salvar os dados :(");
			});

		this.setState({
			loadingSave: false,
		});
	};

	renderTableNull = () => {
		return (
			<Alert color={"danger"}>
				Não foi possível localizar os dados. Tente novamente.
				<br />
				OBS: Se o problema persistir, nos chame no chat :)
			</Alert>
		);
	};

	renderTable = () => {
		if (this.state.questionarios.length === 0) return this.renderTableNull();

		return (
			<BootstrapTable
				data={this.state.questionarios}
				version="4"
				striped
				hover
				options={this.options}
				cellEdit={cellEditProp}
			>
				<TableHeaderColumn isKey dataField="id" hidden>
					Id
				</TableHeaderColumn>
				<TableHeaderColumn dataField="descricao" width="550px" editable={false}>
					Perguntas
				</TableHeaderColumn>
				<TableHeaderColumn
					dataField="resposta"
					width="100px"
					editable={{
						type: "select",
						options: { values: this.selectData },
					}}
				>
					Respostas
				</TableHeaderColumn>
			</BootstrapTable>
		);
	};

	loaded = () => {
		return (
			<div className="animated fadeIn">
				<Card className="card-accent-warning">
					<CardHeader>
						<strong>Diagnóstico - Sobrevivência -</strong> Questionário
						<Button
							onClick={() => this.redirect("categoria/diagnostico")}
							data-placement="top"
							title="Voltar ao Diagnóstico"
							className="btn btn-sm btn-primary mr-1 float-right"
						>
							<i className="fa fa-arrow-left" /> Menu
						</Button>
					</CardHeader>
					<CardBody>{this.renderTable()}</CardBody>
					<CardFooter>
						<ButtonLoading
							onClick={this.handleSubmit}
							color={"success"}
							data-placement="top"
							title="Salvar Avaliação"
							className="mr-1 float-right"
							isLoading={this.state.loadingSave}
							visible={CompanyService.showSaveButtonToDemo()}
						>
							<i className="fa fa-save mr-2" />
							Salvar
						</ButtonLoading>
					</CardFooter>
				</Card>
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

export default QuestionarioForm;
