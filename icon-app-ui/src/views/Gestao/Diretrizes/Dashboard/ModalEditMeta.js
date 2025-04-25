import { Component } from "react";
import cn from "classnames";
import { InputAdapter, TextMask } from "react-text-mask-hoc";
import {
	Button,
	Modal,
	ModalBody,
	ModalFooter,
	ModalHeader,
	Table,
	Row,
	Col,
} from "reactstrap";
import Generic from "../../../Utils/Generic";
import createNumberMask from "text-mask-addons/dist/createNumberMask";
import "../../../../assets/Gestao/Diretrizes/Eficacia/Dashboard/modaleditmetastyle.scss";
import { toast } from "react-toastify";
import ValidaMeta from "./ValidaMeta";
import CompanyService from "../../../../service/CompanyService";
import Diretrizes from "../../../../service/Diretrizes";
import ButtonLoading from "../../../../components/ButtonLoading";

class ModalEditMeta extends Component {
	constructor(props) {
		super(props);

		this.company = CompanyService.getDataCompany();

		this.state = {
			title: this.props.data[1].label,
			efetivo: this.props.data[1].data,
			companyId: this.company.id,
			exercicio_definido: this.company.exercicioDefinido,
			originalMeta: [...this.props.data[0].data],
			meta: this.props.data[0].data,
			type: this.props.data[2].type,
			validation: this.props.data[2].validation,
			meses: this.props.meses,
			loading: false,
			mesAvalia: this.props.mesesAvaliacao[
				12 / [...this.props.data[0].data].length
			].map((item) => this.props.meses[item].id),

			awaitReset: false,
			awaitUpdate: false,
		};
	}

	getMask = (itemTipo) => {
		let mask;

		switch (itemTipo) {
			case "currency":
				mask = createNumberMask({
					prefix: "R$ ",
					thousandsSeparatorSymbol: ".",
					integerLimit: 10,
					allowDecimal: true,
					decimalSymbol: ",",
					decimalLimit: 2,
				});
				break;
			case "percentage":
				mask = createNumberMask({
					prefix: "",
					suffix: " %",
					thousandsSeparatorSymbol: ".",
					integerLimit: 10,
					allowDecimal: true,
					decimalSymbol: ",",
					decimalLimit: 2,
				});
				break;
			case "float":
				mask = createNumberMask({
					prefix: "",
					thousandsSeparatorSymbol: ".",
					integerLimit: 10,
					allowDecimal: true,
					decimalSymbol: ",",
					decimalLimit: 2,
				});
				break;
			case "integer":
				mask = createNumberMask({
					prefix: "",
					thousandsSeparatorSymbol: ".",
					integerLimit: 10,
					allowDecimal: false,
					decimalSymbol: ",",
					decimalLimit: 0,
				});
				break;
			default:
				mask = createNumberMask({
					prefix: "",
					thousandsSeparatorSymbol: ".",
					integerLimit: 10,
					allowDecimal: false,
				});
		}

		return mask;
	};

	getTotalMeta = (metas) => {
		let sum = 0;

		for (let index = 0; index < metas.length; index++) {
			const value = Generic.ConvertStringToFloat(
				Generic.formatNumber(Generic.ConvertStringToFloat(metas[index]))
			);
			sum += value;
		}

		return sum;
	};

	editField = async (event, posValue) => {
		event.preventDefault();

		let meta = [...this.state.meta];
		let value = event.target.value;

		if (value !== meta[posValue]) {
			meta[posValue] = value;

			await this.setState({
				meta: meta,
			});
		}
	};

	proporcionalizar = async (event) => {
		event.preventDefault();

		await this.setState({
			loading: true,
		});

		let newValues = [];

		let totalMetaRevisada = Generic.ConvertStringToFloat(
			Generic.formatNumber(this.getTotalMeta(this.state.meta))
		);
		let totalMetaOriginal = Generic.ConvertStringToFloat(
			Generic.formatNumber(this.getTotalMeta(this.state.originalMeta))
		);

		let diffMes = totalMetaOriginal - totalMetaRevisada;
		diffMes = Generic.ConvertStringToFloat(Generic.formatNumber(diffMes));
		diffMes = Generic.ConvertStringToFloat(
			Generic.formatNumber(diffMes / this.state.originalMeta.length)
		);

		for (const [index] of this.state.mesAvalia.entries()) {
			const valueMesBefore = Generic.ConvertStringToFloat(
				this.state.meta[index]
			);
			const valueMesWithDiff = valueMesBefore + diffMes;
			const valueMesEditedDecimal = Generic.formatNumber(valueMesWithDiff);
			const valueMesFloat = Generic.ConvertStringToFloat(valueMesEditedDecimal);
			newValues.push(valueMesFloat);
		}

		let totalRecalibragem = Generic.ConvertStringToFloat(
			Generic.formatNumber(this.getTotalMeta(newValues))
		);

		const newDiffMes = Generic.ConvertStringToFloat(
			Generic.formatNumber(totalMetaOriginal - totalRecalibragem)
		);

		newValues[newValues.length - 1] =
			newValues[newValues.length - 1] + newDiffMes;

		await this.setState({
			loading: false,
			meta: newValues,
		});
	};

	submitData = async (event) => {
		event.preventDefault();

		const instanceValid = new ValidaMeta(
			this.state.originalMeta,
			this.state.meta,
			this.props.resource,
			this.state.validation
		);

		if (!instanceValid.isValid) {
			toast.error(instanceValid.message);
			return;
		}

		this.setState({
			awaitUpdate: true,
		});

		let convertedMeta = {
			data: [],
			label: "Meta",
		};
		for (const item of this.state.meta) {
			convertedMeta["data"].push(Generic.ConvertStringToFloat(item));
		}
		const response = [convertedMeta, this.props.data[1], this.props.data[2]];

		const dataApi = {
			ano: this.company.exercicioDefinido,
			meta_resource: this.props.resource,
			meta_data: convertedMeta.data,
		};

		const responseApi = await Diretrizes.getDadosDashboardMeta(dataApi);
		const { status, message } = responseApi;

		if (status === "success") {
			toast.success(message);
			await this.props.saveModal(
				response,
				this.props.resource,
				this.props.perspectiva
			);
		} else {
			toast.error(message);
		}

		this.setState({
			awaitUpdate: false,
		});
	};

	reset = async (e) => {
		e.preventDefault();
		this.setState({
			awaitReset: true,
		});

		const { dashboard, status, message } =
			await Diretrizes.getDadosDashboardReset();

		if (status === "success") {
			const perspectiva = this.props.perspectiva;
			const resource = this.props.resource;
			const dashboardYear =
				dashboard[this.state.exercicio_definido][perspectiva].data[resource];

			await this.setState({
				meta: dashboardYear[0].data,
			});
		} else {
			toast.error(message);
		}

		this.setState({
			awaitReset: false,
		});
	};

	renderHeader = () => {
		return <ModalHeader>{this.state.title}</ModalHeader>;
	};

	renderBody = () => {
		let prefix;
		let suffix;
		let type = this.state.type;
		let validation = this.state.validation;
		let tfoot = null;
		let textoFinal = null;

		let totalMetaRevisada = 0;
		let totalMetaOriginal = 0;

		const quantidadeMeses = this.state.originalMeta.length;

		if (type === "currency" && validation === "average") {
			prefix = "R$";
			totalMetaRevisada = Generic.formatNumber(
				this.getTotalMeta(this.state.meta) / quantidadeMeses
			);
			totalMetaOriginal = Generic.formatNumber(
				this.getTotalMeta(this.state.originalMeta) / quantidadeMeses
			);
		} else if (type === "currency") {
			prefix = "R$";
			totalMetaRevisada = Generic.formatNumber(
				this.getTotalMeta(this.state.meta)
			);
			totalMetaOriginal = Generic.formatNumber(
				this.getTotalMeta(this.state.originalMeta)
			);
		} else if (type === "percentage") {
			suffix = " %";
			totalMetaRevisada = Generic.formatNumber(
				this.getTotalMeta(this.state.meta) / quantidadeMeses
			);
			totalMetaOriginal = Generic.formatNumber(
				this.getTotalMeta(this.state.originalMeta) / quantidadeMeses
			);
		} else if (type === "integer") {
			totalMetaRevisada = Generic.formatNumber(
				this.getTotalMeta(this.state.meta),
				0
			);
			totalMetaOriginal = Generic.formatNumber(
				this.getTotalMeta(this.state.originalMeta),
				0
			);
		} else if (type === "float" && validation === "average") {
			totalMetaRevisada = Generic.formatNumber(
				this.getTotalMeta(this.state.meta) / quantidadeMeses,
				2
			);
			totalMetaOriginal = Generic.formatNumber(
				this.getTotalMeta(this.state.originalMeta) / quantidadeMeses,
				2
			);
		}

		if (validation === "total") {
			textoFinal = "Total";
		} else if (validation === "average") {
			textoFinal = "Média";
		}

		if (validation !== "min_value" && validation !== "max_value") {
			tfoot = (
				<tfoot>
					<tr className="text-right">
						<th className="border-left-0">{textoFinal}</th>
						<th>
							{prefix} {totalMetaOriginal} {suffix}
						</th>
						<th
							className={cn("border-right-0", {
								"color-red": totalMetaRevisada !== totalMetaOriginal,
							})}
						>
							{prefix} {totalMetaRevisada} {suffix}
						</th>
					</tr>
				</tfoot>
			);
		}

		let message = null;
		if (validation === "min_value" || validation === "max_value") {
			message = (
				<tr>
					<td colSpan="3">
						Para esta meta o valor de Dezembro é o mesmo do definido no módulo
						de Estratégias e Metas.
					</td>
				</tr>
			);
		}

		return (
			<ModalBody className="p-0">
				<Row>
					<Col>
						<Table bordered className="m-0 border-left-0 border-right-0">
							<thead>
								<tr className="text-center">
									<th className="border-left-0" />
									<th>Meta Atual</th>
									<th className="border-right-0">Meta Editada</th>
								</tr>
							</thead>
							<tbody>
								{this.state.mesAvalia.map((item, key) => {
									let originalMeta = this.state.originalMeta[key];
									let meta = this.state.meta[key];

									if (typeof meta !== "string") {
										meta = Generic.formatNumber(
											this.state.meta[key],
											this.state.type === "integer" ? 0 : 2
										);
									}

									const mesTitle = this.state.meses.filter(
										(mes) => mes.id === item
									);

									return (
										<tr key={key} className="text-right">
											<th className="border-left-0 text-left">
												{mesTitle[0].title}
											</th>
											<td>
												{prefix}{" "}
												{Generic.formatNumber(
													originalMeta,
													this.state.type === "integer" ? 0 : 2
												)}{" "}
												{suffix}
											</td>
											<td className="border-right-0">
												<TextMask
													Component={InputAdapter}
													value={meta}
													mask={this.getMask(type)}
													guide
													onChange={async (e) => await this.editField(e, key)}
													className="form-control text-right"
													id={item.id}
													disabled={
														key === 11 &&
														(validation === "min_value" ||
															validation === "max_value")
													}
												/>
											</td>
										</tr>
									);
								})}
								{message}
							</tbody>
							{tfoot}
						</Table>
					</Col>
				</Row>
			</ModalBody>
		);
	};

	renderFooter = () => {
		let totalMetaRevisada = Generic.ConvertStringToFloat(
			Generic.formatNumber(this.getTotalMeta(this.state.meta))
		);
		let totalMetaOriginal = Generic.ConvertStringToFloat(
			Generic.formatNumber(this.getTotalMeta(this.state.originalMeta))
		);
		let validation = this.state.validation;

		let btnProporcionalizar = null;
		if (validation === "average" || validation === "total") {
			btnProporcionalizar = (
				<Button
					color="info"
					onClick={this.proporcionalizar}
					disabled={totalMetaRevisada === totalMetaOriginal}
				>
					Proporcionalizar Diferença
				</Button>
			);
		}

		return (
			<ModalFooter>
				{btnProporcionalizar}
				<ButtonLoading
					color="warning"
					onClick={this.reset}
					isLoading={this.state.awaitReset}
				>
					Nivelar Metas
				</ButtonLoading>
				<ButtonLoading
					color="success"
					onClick={this.submitData}
					isLoading={this.state.awaitUpdate}
				>
					Salvar
				</ButtonLoading>
				<ButtonLoading
					color="secondary"
					onClick={(e) => this.props.toggle(e, null)}
					isLoading={false}
				>
					Fechar
				</ButtonLoading>
			</ModalFooter>
		);
	};

	render() {
		return (
			<Modal
				isOpen={this.props.open}
				toggle={(e) => this.props.toggle(e)}
				backdrop={"static"}
				keyboard={false}
				size={"md"}
			>
				{this.renderHeader()}
				{this.renderBody()}
				{this.renderFooter()}
			</Modal>
		);
	}
}

export default ModalEditMeta;
