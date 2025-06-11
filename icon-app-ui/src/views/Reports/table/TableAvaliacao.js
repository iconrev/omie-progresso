import { Component } from "react";
import {
	Badge,
	Button,
	Card,
	CardBody,
	CardFooter,
	CardHeader,
	Col,
	FormGroup,
	Row,
	Tooltip,
} from "reactstrap";
import Generic from "../../Utils/Generic";
import Avaliacao from "../../../components/Avaliacao";
import { toast } from "react-toastify";

class TableAvaliacao extends Component {
	constructor(props) {
		super(props);

		this.state = {
			data: [],
			ids: [],
			isLoading: false,
		};
	}

	async componentDidMount() {
		await this.loadStates();
	}

	loadStates = async () => {
		this.setState({
			data: this.props.data,
		});
	};

	handleChange = async (event, category, item) => {
		try {
			event.preventDefault();
			// eslint-disable-next-line no-empty
		} catch (e) {}

		let obj = this.state.data;
		let objCategory = obj[category];
		let objItemsCategory = objCategory.itens;
		objItemsCategory[item].avaliacao = event.target.value;

		await this.setState({
			data: obj,
		});
	};

	toggleTip = (targetName) => {
		if (!this.state[targetName]) {
			this.setState({
				...this.state,
				[targetName]: {
					tooltipOpen: true,
				},
			});
		} else {
			this.setState({
				...this.state,
				[targetName]: {
					tooltipOpen: !this.state[targetName].tooltipOpen,
				},
			});
		}
	};

	isToolTipOpen = (targetName) => {
		return this.state[targetName] ? this.state[targetName].tooltipOpen : false;
	};

	loadItem = (item, key, category) => {
		let resultado;
		switch (item.tipo) {
			case "%":
				resultado = Generic.formatNumber(item.resultado) + "%";
				break;
			case "int":
				resultado = Generic.formatNumber(item.resultado, 0);
				break;
			case "R$":
				resultado = "R$ " + Generic.formatNumber(item.resultado);
				break;
			case "text":
				resultado = item.resultado;
				break;
			default:
				resultado = Generic.formatNumber(item.resultado);
		}

		let ids = this.state.ids;
		ids.push(item.id);

		let avaliacao = null;
		if (item["avaliacao"] && item["id"]) {
			avaliacao = (
				<FormGroup className={"p-0 m-0"}>
					<Avaliacao
						id={item.id}
						value={item.avaliacao}
						readOnly={this.props.readOnly}
						onChange={(e) => {
							return this.handleChange(e, category, key);
						}}
					/>
				</FormGroup>
			);
		} else {
			avaliacao = (
				<div>
					<br />
					<br />
				</div>
			);
		}

		let tooltip = null;
		if (item["tooltip"]) {
			let idToolTip = "tipItem" + key + item["id"];
			tooltip = (
				<span className={"mr-2"}>
					<i className="icon-info" id={idToolTip} />
					<Tooltip
						placement="top"
						isOpen={this.isToolTipOpen(idToolTip)}
						target={idToolTip}
						toggle={() => this.toggleTip(idToolTip)}
					>
						{item["tooltip"]}
					</Tooltip>
				</span>
			);
		}

		return (
			<Row key={`item|-${key}`} className={"pb-2 pt-2"}>
				<Col
					xs={"12"}
					sm={"12"}
					md="6"
					lg="6"
					xl={"4"}
					className={"align-self-center pb-2"}
				>
					{tooltip}
					<span>{item.analise}</span>
				</Col>
				<Col
					xs={"5"}
					sm={"6"}
					md="3"
					lg="3"
					xl={"4"}
					className={"align-self-center"}
				>
					<span className="h6">{resultado}</span>
				</Col>
				<Col
					xs={"7"}
					sm={"6"}
					md="3"
					lg="3"
					xl={"4"}
					className={"align-self-center"}
				>
					{avaliacao}
				</Col>
			</Row>
		);
	};

	loadObservacao = (texto) => {
		return (
			<div>
				<small>{texto}</small>
			</div>
		);
	};

	loadCategory = (item, key) => {
		return (
			<div key={`category-${key}`} className={"pb-2 pb-2"}>
				<Row className={"pb-2 pt-2"}>
					<Col xs="12" sm="6" md="4">
						<Badge color={item.color}>
							<strong style={{ fontSize: 14 }}>{item.categoria}</strong>
						</Badge>
					</Col>
				</Row>
				{item.observacao ? this.loadObservacao(item.observacao) : null}
				{/* <br /> */}
				{item.itens.map((item, keyItem) => {
					return this.loadItem(item, keyItem, key);
				})}
			</div>
		);
	};

	title = (label, xs = 4, sm = 4, md = 4, lg = 4, xl = 4) => {
		return (
			<Col xs={xs} sm={sm} md={md} lg={lg} xl={xl}>
				<div className={`callout callout-success`}>
					<span className="h5">{label}</span>
				</div>
			</Col>
		);
	};

	render() {
		const btnEdit = this.props.edit ? (
			<Button
				onClick={this.page_edit}
				className="btn btn-sm btn-success float-right text-nowrap"
			>
				<i className="fa fa-edit" /> Editar Dados
			</Button>
		) : null;

		return (
			<div className="animated fadeIn">
				<Card className="card-accent-warning">
					<CardHeader>
						<Row>
							<Col sm={"auto"}>
								<strong>{this.props.title}</strong> - {this.props.subtitle} -{" "}
								<span className="text-muted text-uppercase font-weight-bold font-xs">
									{this.props.ano}
								</span>
							</Col>
							<Col sm={""}>{btnEdit}</Col>
						</Row>
					</CardHeader>
					<CardBody>
						<div className={"d-none d-sm-none d-md-block"}>
							<Row>
								{this.title("Análise", 12, 12, 6, 6, 4)}
								{this.title("Resultado", 12, 6, 3, 3, 4)}
								{this.title("Classificação", 12, 6, 3, 3, 4)}
							</Row>
						</div>
						{this.state.data ? this.state.data.map(this.loadCategory) : null}
					</CardBody>
				</Card>
			</div>
		);
	}
}

export default TableAvaliacao;
