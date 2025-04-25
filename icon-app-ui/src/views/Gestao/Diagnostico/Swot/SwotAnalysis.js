import { Component } from "react";
import {
	Button,
	Col,
	Modal,
	ModalBody,
	ModalFooter,
	ModalHeader,
	Row,
	Spinner,
	Tooltip,
} from "reactstrap";
import CompanyService from "../../../../service/CompanyService";
import "../../../../assets/swotstyle.css";
import Diagnostico from "../../../../service/Diagnostico/index";

class SwotAnalysis extends Component {
	constructor(props) {
		super(props);

		this.company = CompanyService.getDataCompany();

		this.state = {
			id: this.company.id,
			exercicio_definido: this.company.exercicioDefinido,
			modalData: null,
			quantidadeItens: this.props.quantidadeItens || 10,
		};
	}

	async componentDidMount() {
		await this.loadData();
	}

	loadData = async () => {
		const response = await Diagnostico.getSwot(this.state.quantidadeItens);
		const { swot } = response;

		const datas = swot[this.state.exercicio_definido];

		let scenes = [];
		for (let key in datas) {
			scenes.push({
				name: key,
				data: datas[key],
			});
		}

		this.setState({
			modalData: scenes,
		});
	};

	getData = (scene, object) => {
		let data = {};
		switch (scene) {
			case "forca":
				data["title"] = "Forças";
				data["icon"] = "cui-thumb-up icons font-5xl";
				data["info"] =
					"Vantagens internas da empresa em relação às empresas concorrentes.";
				break;
			case "fraquezas":
				data["title"] = "Fraquezas";
				data["icon"] = "cui-thumb-down icons font-5xl";
				data["info"] =
					"Desvantagens internas da empresa em relação às empresas concorrentes.";
				break;
			case "oportunidades":
				data["title"] = "Oportunidades";
				data["icon"] = "cui-lightbulb icons font-5xl";
				data["info"] =
					"Aspectos positivos com potencial de aumentar a vantagem competitiva da empresa";
				break;
			case "ameacas":
				data["title"] = "Ameaças";
				data["icon"] = "fa fa-bolt icons font-5xl";
				data["info"] =
					"Aspectos negativos com potencial de comprometer a vantagem competitiva da empresa.";
				break;
			default:
				data[object] = "ERROR";
				break;
		}
		return data[object];
	};

	item = (item, index, scene) => {
		return (
			<Row key={index}>
				<Col md={"12"} className={"center-swot"}>
					<div className={"cenario-swot-item-text border-" + scene}>{item}</div>
				</Col>
			</Row>
		);
	};

	isToolTipOpen = (targetName) => {
		return this.state[targetName] ? this.state[targetName].tooltipOpen : false;
	};

	toggle = (targetName) => {
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

	renderItem = (item, index) => {
		return <li key={index}>{item}</li>;
	};

	new_scene = (scene, index) => {
		let data = scene.data;
		let name = scene.name;
		let colorScene = "color-" + name;
		let icon = this.getData(name, "icon");
		let name_id = "tooltip_img_" + index;
		let tip = this.getData(name, "info");

		let showData = null;
		if (data.length > 0) {
			showData = data.map((item, index) => this.renderItem(item, index, scene));
		} else {
			showData = (
				<div>
					<li>Não há dados suficientes para serem exibidos.</li>
					<Spinner
						size="sm"
						style={{
							zIndex: "9999",
							display: "block",
							margin: "auto",
						}}
					/>
					<br />
				</div>
			);
		}

		return (
			<li className="scene" key={index}>
				<ul className="sceneContainer">
					<li className="sceneLogo">
						<div className={"center-swot"}>
							<i className={icon + " sceneIcon " + colorScene} id={name_id} />
							<Tooltip
								placement="top"
								isOpen={this.isToolTipOpen(name_id)}
								target={name_id}
								toggle={() => this.toggle(name_id)}
							>
								{tip}
							</Tooltip>
						</div>
					</li>
					<li className="sceneTitle">
						<p className={colorScene}>{this.getData(name, "title")}</p>
					</li>
					<li>
						<ul className="sceneItens">{showData}</ul>
					</li>
				</ul>
			</li>
		);
	};

	newRender = (datas) => {
		return (
			<div id="swot-analysis">
				<ul id="scenes">{datas.map(this.new_scene)}</ul>
			</div>
		);
	};

	render() {
		let datas = this.state.modalData;
		if (datas) {
			return (
				<div className={"modal-swot-background"}>
					<Modal
						isOpen={this.props.isOpen}
						toggle={this.props.toggle}
						className={"modal-lg modal-swot color-gray"}
					>
						<ModalHeader className={"modal-swot-header"}>
							<div className={"title-modal-swot"}>ANÁLISE SWOT</div>
						</ModalHeader>
						<ModalBody className={"color-body"}>
							{this.newRender(datas)}
						</ModalBody>
						<ModalFooter className={"color-footer"}>
							<Button color="secondary" onClick={this.props.toggle}>
								FECHAR
							</Button>
						</ModalFooter>
					</Modal>
				</div>
			);
		} else {
			return <div />;
		}
	}
}

export default SwotAnalysis;
