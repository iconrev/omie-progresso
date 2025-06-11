import { Component } from "react";
import {
	Button,
	Col,
	Input,
	Modal,
	ModalBody,
	ModalFooter,
	ModalHeader,
	Row,
	Badge,
} from "reactstrap";
import BootstrapTable from "react-bootstrap-table-next";
import cellEditFactory, { Type } from "react-bootstrap-table2-editor";
import { toast } from "react-toastify";

const LIMITE_ESTRATEGIAS = 2;
const cellEdit = cellEditFactory({
	mode: "click",
	blurToSave: true,
});

class CardMetaQuiz extends Component {
	constructor(props) {
		super(props);

		this.state = {
			showModalEstrategia: false,
			idAvaliacaoEdit: "",
			inputEstrategiaPersonalizada: "",
			inputEstrategiaPersonalizadaTemp: "",
			inputEstrategiaPersonalizadaId: "",
			btnDefinirEstrategia: true,
			limiteEstrategias: this.props.limiteEstrategias || LIMITE_ESTRATEGIAS,
		};
	}

	toggleModalEstrategia = async () => {
		await this.setState({
			showModalEstrategia: !this.state.showModalEstrategia,
		});
	};

	cancelModalEstrategiasUpdate = async (e) => {
		e.preventDefault();
		let idQuiz = this.state.idAvaliacaoEdit;
		let estrategiaId = this.state.inputEstrategiaPersonalizadaId;
		let estrategiaText = this.state.inputEstrategiaPersonalizadaTemp;

		await this.setState({
			idAvaliacaoEdit: "",
			inputEstrategiaPersonalizada: "",
			inputEstrategiaPersonalizadaTemp: "",
			inputEstrategiaPersonalizadaId: "",
			showModalEstrategia: !this.state.showModalEstrategia,
		});
		await this.props.handler(idQuiz, "Y", estrategiaText, estrategiaId);
	};

	confirmModalEstrategiasUpdate = async (e) => {
		e.preventDefault();
		let idQuiz = this.state.idAvaliacaoEdit;
		let estrategiaText = this.state.inputEstrategiaPersonalizada;
		let estrategiaId = this.state.inputEstrategiaPersonalizadaId;
		await this.toggleModalEstrategia();
		await this.props.handler(idQuiz, "Y", estrategiaText, estrategiaId);
	};

	validaLimiteEstrategia = () => {
		let contCheck = 0;
		let data = this.props.data;

		for (let i = 0; i < data.length; i++) {
			let check = data[i].check;
			if (check === "Y") {
				contCheck += 1;
			}
		}

		return contCheck >= this.state.limiteEstrategias;
	};

	validatorModal = async (newValue, row, column, done) => {
		try {
			let option = this.props.estrategias.filter(
				(element) => element.value === parseInt(newValue)
			)[0];
			if (option !== undefined && option.label === "Defina sua estratégia") {
				await this.setState({
					idAvaliacaoEdit: row.id,
					inputEstrategiaPersonalizadaId: option.value,
					inputEstrategiaPersonalizada:
						row.estrategia_label === "Defina sua estratégia"
							? ""
							: row.estrategia_label,
					inputEstrategiaPersonalizadaTemp: row.estrategia_label,
					showModalEstrategia: !this.state.showModalEstrategia,
				});
			} else {
				let option = this.props.estrategias.filter(
					(element) => element.value === parseInt(newValue)
				)[0];
				let estrategiaText = option.label;
				let estrategiaId = newValue;
				let metaClassificacao = row.meta_avaliacao;
				await this.props.handler(
					row.id,
					"Y",
					estrategiaText,
					estrategiaId,
					metaClassificacao
				);
			}
		} catch (e) {
			return done({
				valid: false,
			});
		}

		return done({
			valid: true,
		});
	};

	validatorCheckBox = async (newValue, row, column, done) => {
		if (newValue !== row.check) {
			if (newValue === "Y" && this.validaLimiteEstrategia()) {
				toast.error(
					"Não é possível incluir acima do limite de " +
						this.state.limiteEstrategias +
						" estratégias."
				);
				return done({
					valid: false,
				});
			}

			let option = null;
			let estrategiaId = null;
			let metaClassificacao = row.avaliacao_anterior;
			if (newValue === "Y") {
				option = "Defina sua estratégia";
				estrategiaId = this.props.estrategias.filter(
					(element) => element.label === option
				)[0];
				estrategiaId = estrategiaId.value;
			}
			await this.props.handler(
				row.id,
				newValue,
				option,
				estrategiaId,
				metaClassificacao
			);
		}
		return done({
			valid: true,
		});
	};

	validatorNovaClassificacao = async (newValue, row, column, done) => {
		if (newValue !== row.meta_avaliacao) {
			await this.props.handler(
				row.id,
				row.check,
				row.estrategia_label,
				row.estrategia,
				newValue
			);
		}
		return done({
			valid: true,
		});
	};

	renderBadgeValue = (value, color) => {
		return (
			<h4>
				<Badge color={color}>{value} %</Badge>
			</h4>
		);
	};

	formatterClassificacaoAnterior = (cell, row) => {
		if (row.id === 0) {
			return this.renderBadgeValue(row.avaliacao_anterior, "success");
		}

		if (!cell) {
			return row.opcao_avaliacao[row.opcao_avaliacao.length - 1].label;
		}

		return row.opcao_avaliacao.filter((element) => element.value === cell)[0]
			.label;
	};

	formatterSelect = (cell, row) => {
		if (row.id === 0) {
			return this.renderBadgeValue(row.meta_avaliacao, "info");
		}

		if (!cell) {
			return row.opcao_avaliacao[row.opcao_avaliacao.length - 1].label;
		}

		return row.opcao_avaliacao.filter((element) => element.value === cell)[0]
			.label;
	};

	formatterCheckBox = (cell, row) => {
		if (row.id === 0) {
			return "";
		}

		let icon = cell === "Y" ? "fa-check" : "fa-square-o";
		return (
			<span>
				<i className={"fa " + icon + " float-center"} />
			</span>
		);
	};

	formatterEstrategia = (cell, row) => {
		let option = this.props.estrategias.filter(
			(element) => element.value === parseInt(cell)
		)[0];
		if (option) {
			option = option["label"];
			if (option === "Defina sua estratégia") {
				return row.estrategia_label;
			} else {
				return option;
			}
		}
		return row.estrategia_label;
	};

	getColumns = () => {
		return [
			{
				dataField: "id",
				text: "ID",
				hidden: true,
				editable: false,
			},
			{
				dataField: "descricao",
				text: this.props.categoria,
				editable: false,
			},
			{
				dataField: "avaliacao_anterior",
				text: "Classificação Anterior",
				formatter: this.formatterClassificacaoAnterior,
				editable: false,
				headerAlign: "center",
				align: "center",
			},
			{
				dataField: "check",
				text: "Definição de Meta",
				formatter: this.formatterCheckBox,
				validator: this.validatorCheckBox,
				headerAlign: "center",
				align: "center",
				editCellClasses: "align-center-all",
				editable: (content, row) => row.id !== 0,
				editor: {
					type: Type.CHECKBOX,
					value: "Y:N",
				},
			},
			{
				dataField: "estrategia",
				text: "Estratégia",
				editable: (content, row) => row.check === "Y",
				formatter: this.formatterEstrategia,
				validator: this.validatorModal,
				editor: {
					type: Type.SELECT,
					getOptions: (setOptions, { row }) => {
						return row.opcao_estrategias;
					},
				},
				headerAlign: "center",
				align: "center",
			},
			{
				dataField: "meta_avaliacao",
				text: "Meta de Classificação",
				formatter: this.formatterSelect,
				editable: (content, row) => row.check === "Y",
				validator: this.validatorNovaClassificacao,
				editor: {
					type: Type.SELECT,
					getOptions: (setOptions, { row }) => {
						return row.opcao_avaliacao;
					},
				},
				headerAlign: "center",
				align: "center",
			},
		];
	};

	modalEstrategia = () => {
		let value = this.state.inputEstrategiaPersonalizada;
		if (!value) {
			value = "";
		}

		return (
			<Modal
				isOpen={this.state.showModalEstrategia}
				toggle={(e) => this.cancelModalEstrategiasUpdate(e)}
				backdrop={"static"}
				keyboard={false}
			>
				<ModalHeader toggle={(e) => this.cancelModalEstrategiasUpdate(e)}>
					Definição de Estratégia
				</ModalHeader>
				<ModalBody>
					<Row>
						<Col>Defina sua estratégia personalizada:</Col>
					</Row>
					<Row>
						<Col>
							<Input
								id={"inputEstrategiaPersonalizada"}
								value={value}
								onChange={async (e) => {
									e.preventDefault();
									await this.setState({
										inputEstrategiaPersonalizada: e.target.value,
										btnDefinirEstrategia: e.target.value.length <= 5,
									});
								}}
							/>
						</Col>
					</Row>
				</ModalBody>
				<ModalFooter>
					<Button
						color="danger"
						onClick={(e) => this.cancelModalEstrategiasUpdate(e)}
					>
						Cancelar
					</Button>
					<Button
						color="success"
						onClick={(e) => this.confirmModalEstrategiasUpdate(e)}
						disabled={this.state.btnDefinirEstrategia}
					>
						Definir
					</Button>
				</ModalFooter>
			</Modal>
		);
	};

	replaceData = () => {
		const tempData = [];

		for (let i = 0; i < this.props.data.length; i++) {
			const item = this.props.data[i];
			item.opcao_estrategias = item.opcao_estrategias.filter(
				(element) => element.quiz === item.field
			);
			tempData.push(item);
		}

		tempData.push({
			id: 0,
			descricao: "",
			avaliacao_anterior: this.props.consolidado.anterior,
			check: "N",
			estrategia_label: "",
			meta_avaliacao: this.props.consolidado.meta,
		});

		return tempData;
	};

	render() {
		return (
			<div>
				<BootstrapTable
					keyField="id"
					data={this.replaceData()}
					columns={this.getColumns()}
					cellEdit={cellEdit}
					striped
					hover
					condensed
					bordered={false}
				/>
				{this.modalEstrategia()}
			</div>
		);
	}
}

export default CardMetaQuiz;
