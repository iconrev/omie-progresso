import { Component } from "react";
import { Row, Col } from "reactstrap";
import Generic from "../../Utils/Generic";
import LoadingSpinner from "../../../components/LoadingSpinner";
import CardBaseMeta from "./Components/CardBaseMeta";
import { toast } from "react-toastify";
import BootstrapTable from "react-bootstrap-table-next";
import cellEditFactory from "react-bootstrap-table2-editor";
import InputMaskTable from "./Components/InputMaskTable";
import CustomCard from "../../../components/CustomCard";
import CompanyService from "../../../service/CompanyService";
import Metas from "../../../service/Metas";

class Financeiro_Orcamento extends Component {
	constructor(props) {
		super(props);

		this.handlePageButton = this.handlePageButton.bind(this);

		this.company = CompanyService.getDataCompany();

		this.state = {
			isLoading: true,
			companyId: this.company.id,
			exercicio_definido: this.company.exercicioDefinido,

			percentualAumento: null,
		};
	}

	async componentDidMount() {
		await this.loadData();
		this.setState({
			isLoading: false,
		});
	}

	loadData = async () => {
		await Metas.getDefinicao("financeiro", "orcamento")
			.then((result) => {
				let { metas } = result;
				metas = metas[this.state.exercicio_definido];

				const {
					orcamento,
					custo_total,
					receita_bruta,
					superavit,
					receita,
					lucro_liquido_previsto,
				} = metas;
				this.setState({
					custo_total: custo_total.toString(),
					receita_bruta: receita_bruta,
					superavit: superavit,
					orcamento: orcamento,
					isLoading: false,
					percentualAumento: receita.percentage,
					lucro_liquido_previsto: lucro_liquido_previsto,
				});
			})
			.catch((err) => console.error(err));
	};

	handleSaveButton = async (e, callback, showConfirmation = true) => {
		e.preventDefault();

		const data = [];
		for (let i = 0; i < this.state.orcamento.length; i++) {
			const despesa = this.state.orcamento[i];
			data.push({
				...despesa,
				year: this.state.exercicio_definido,
			});
		}

		await Metas.postDefinicao("financeiro", "orcamento", data)
			.then((response) => {
				if (showConfirmation) toast.success(response.message);
			})
			.catch((err) => {
				console.error(err);
				toast.error(err.response.data.message);
			});
	};

	handlePageButton = async (e, resource) => {
		e.preventDefault();
		let id = this.state.companyId;
		if (resource.includes("<<")) {
			this.props.history.push(
				`/hub/${id}/gestao/categoria/metas/financeiro/custos`
			);
		} else if (resource.includes(">>")) {
			this.props.history.push(
				`/hub/${id}/gestao/categoria/metas/financeiro/endividamento`
			);
		}
	};

	tableOrcamento = () => {
		const columns = [
			{ dataField: "despesa", text: "Despesas", editable: false },
			{ dataField: "total", text: "Disponível Ano", editable: false },
			{ dataField: "jan", text: "Janeiro" },
			{ dataField: "fev", text: "Fevereiro" },
			{ dataField: "mar", text: "Março" },
			{ dataField: "abr", text: "Abril" },
			{ dataField: "mai", text: "Maio" },
			{ dataField: "jun", text: "Junho" },
			{ dataField: "jul", text: "Julho" },
			{ dataField: "ago", text: "Agosto" },
			{ dataField: "set", text: "Setembro" },
			{ dataField: "out", text: "Outubro" },
			{ dataField: "nov", text: "Novembro" },
			{ dataField: "dez", text: "Dezembro" },
		];

		for (let column in columns) {
			if (column !== "0") {
				columns[column]["formatter"] = (cell) => {
					return "R$ " + Generic.formatNumber(cell);
				};
			}
			columns[column]["editorRenderer"] = (editorProps, value, row, column) => {
				const keyId = row["campo_"] + "_" + column["dataField"];
				if (typeof value !== "string") {
					value = value.toString();
				}
				value = value.replace(".", ",");
				return <InputMaskTable {...editorProps} value={value} keyId={keyId} />;
			};
		}

		const rowStyle = {
			verticalAlign: "middle",
		};

		return (
			<div className="table-responsive">
				<BootstrapTable
					keyField={"campo_"}
					data={this.state.orcamento}
					columns={columns}
					rowStyle={rowStyle}
					cellEdit={cellEditFactory({
						mode: "click",
						blurToSave: true,
					})}
					striped
					hover
				/>
			</div>
		);
	};

	informativos = () => {
		let subReceita,
			subCustos,
			subSuperavit = "";
		let percCustos,
			percSuperavit = 100.0;
		if (this.state.percentualAumento) {
			let value = Generic.formatNumber(this.state.percentualAumento);
			subReceita =
				"Previsão de " +
				value +
				"% de crescimento em relação ao exercício passado";
		}
		if (this.state.receita_bruta) {
			let receitaBruta = this.state.receita_bruta;
			let custos = this.state.custo_total;
			let lucro_liquido_previsto = this.state.lucro_liquido_previsto;

			percCustos = (100 / receitaBruta) * custos;
			subCustos =
				Generic.formatNumber(percCustos) +
				"% em relação a Receita Bruta Prevista";

			if (lucro_liquido_previsto > 0) {
				percSuperavit = (100 / receitaBruta) * lucro_liquido_previsto;
				subSuperavit =
					Generic.formatNumber(percSuperavit) +
					"% em relação a Receita Bruta Prevista";
			}
		}

		return (
			<div>
				<Row>
					<Col sm={4}>
						<CustomCard
							value={"R$ " + Generic.formatNumber(this.state.receita_bruta)}
							color={"success"}
							title={"Receita Bruta Prevista"}
							subtitle={subReceita}
						/>
					</Col>
					<Col sm={4}>
						<CustomCard
							value={"R$ " + Generic.formatNumber(this.state.custo_total)}
							color={"danger"}
							title={"Valor disponível para despesas"}
							subtitle={subCustos}
							perc={percCustos}
						/>
					</Col>
					<Col sm={4}>
						<CustomCard
							value={
								"R$ " + Generic.formatNumber(this.state.lucro_liquido_previsto)
							}
							color={"info"}
							title={"Lucro Líquido Previsto"}
							subtitle={subSuperavit}
							perc={percSuperavit}
						/>
					</Col>
				</Row>
			</div>
		);
	};

	loaded() {
		return (
			<CardBaseMeta
				newModel={true}
				companyId={this.state.companyId}
				category={"Estruturação do Orçamento Mensal"}
				cardMeta={this.tableOrcamento()}
				cardObjetivoShowPanel={false}
				cardMetaShowPanel={false}
				cardEstrategiaShowPanel={false}
				cardAvaliacao={this.informativos()}
				buttons={[
					{
						placement: "top",
						text: "Próximo",
						action: ">>",
						icon: "fa fa-arrow-right",
						content: "Endividamento",
						onClick: (e) => this.handlePageButton(e, ">>"),
					},
					{
						placement: "top",
						text: "Anterior",
						action: "<<",
						icon: "fa fa-arrow-left",
						content: "Custos e Despesas",
						onClick: (e) => this.handlePageButton(e, "<<"),
					},
				]}
				buttonsave={true}
				save={this.handleSaveButton}
			/>
		);
	}

	render() {
		return this.state.isLoading ? (
			<LoadingSpinner isLoading={this.state.isLoading} />
		) : (
			this.loaded()
		);
	}
}

export default Financeiro_Orcamento;
