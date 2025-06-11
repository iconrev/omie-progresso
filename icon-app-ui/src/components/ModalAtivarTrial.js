import { Component } from "react";
import {
	Button,
	Card,
	CardBody,
	Col,
	Modal,
	ModalBody,
	Badge,
	CardTitle,
	CardText,
	Row,
	Container,
} from "reactstrap";
import { toast } from "react-toastify";
import TooltipDefault from "./TooltipDefault";
import ApiBase from "../service/api_base";
import CompanyService from "../service/CompanyService";

const Api_Base = new ApiBase();

class modalAtivarTrial extends Component {
	constructor(props) {
		super(props);

		this.company = CompanyService.getDataCompany();

		this.state = {
			isLoadingActive: false,
			companyId: this.company.id,
			companyName: this.company.name,
			companyCnpj: this.company.cnpj,
		};
	}

	handleAtivar = async (e) => {
		e.preventDefault();

		await this.setState({
			isLoadingActive: true,
		});

		await Api_Base.post(`/cadastros/empresas/${this.state.companyId}/trial`)
			.then(async (response) => {
				const { message, status } = response.data;
				if (status === "success") {
					CompanyService.setPremium(true);
					CompanyService.setTrial(response.data.empresa_homologada === 2);
					CompanyService.setAssociada(response.data.empresa_homologada === 1);
					CompanyService.setPremiumFinal(response.data.data_final_premium);
					CompanyService.setTrialAvailable(false);
					this.company = CompanyService.getDataCompany();
					toast.success(message);
					this.props.handle(e, false);
				} else {
					toast.error(message);
				}
			})
			.catch(async (err) => {
				const { message } = err.response.data;
				console.error(err);
				toast.error(message);
			});

		await this.setState({
			isLoadingActive: false,
		});
	};

	renderRight = () => {
		const btnLoading = (
			<Button
				type="submit"
				color="dark"
				size={"md"}
				className="px-4 btn-pill bg-dark"
			>
				<span
					className="spinner-grow spinner-grow-sm mr-3"
					role="status"
					aria-hidden="true"
				/>
				Aguarde...
			</Button>
		);

		const btnSalvar = (
			<Button
				type="submit"
				color="dark"
				size={"md"}
				className="px-4 btn-pill"
				style={{ background: "#150A28" }}
				onClick={this.handleAtivar}
			>
				Comece seu mês gratuito
			</Button>
		);

		return (
			<Container className={"h-100 text-black"}>
				<Row className={"pt-2 pb-2 mb-2"}>
					<Col>
						<h1>Aproveite 30 dias grátis de Premium :)</h1>
					</Col>
				</Row>
				<Row className={"pt-1 pb-2"}>
					<Col>{this.state.isLoadingActive ? btnLoading : btnSalvar}</Col>
				</Row>
				<Row className={"pt-2 pb-2 mt-2 text-black"}>
					<Col>
						<small>Sujeito a Termos e Condições. </small>
						<br />
						<small>
							<em>
								TRIAL não está disponível para empresas que já experimentaram o
								Premium.
							</em>
						</small>
					</Col>
				</Row>
			</Container>
		);
	};

	renderVantagem = (beneficio, key) => {
		const target = `hint-${key}-${beneficio.icon}`;

		let badgeDev = beneficio.dev ? (
			<Badge color="success" style={{ background: "#09AC83" }}>
				EM BREVE
			</Badge>
		) : null;

		return (
			<Col xs="6" md="6" lg="6" xl="6" className={""} key={key}>
				<Card
					body
					className="text-center h-100 p-0 hover-zoom bg-light border-0"
					id={target}
					style={{ borderRadius: "50%" }}
				>
					<CardBody className={"p-0"}>
						<Row className={"h-100 align-items-center"}>
							<Col>
								<CardTitle tag="h5">
									<i className={`fa fa-${beneficio.icon} fa-2x`} />
								</CardTitle>
								<CardText className={"text-uppercase"}>
									<strong>{beneficio.title}</strong>
								</CardText>
								<CardText>{badgeDev}</CardText>
							</Col>
						</Row>
					</CardBody>
				</Card>
				<TooltipDefault target={target} hintText={beneficio.comment} />
			</Col>
		);
	};

	renderLeft = () => {
		const beneficios = [
			{
				title: "Acesso Completo",
				comment: "Tenha acesso a todos os módulos do sistema",
				icon: "globe",
			},
			{
				title: "Dados Customizados",
				comment: "Personalize os levantamentos para melhor atender sua empresa",
				icon: "sliders",
				dev: true,
			},
			{
				title: "Relatórios Exclusivos",
				comment: "Relatórios que vão ajudar sua empresa a crescer",
				icon: "line-chart",
				dev: true,
			},
			{
				title: "Acesso antecipado",
				comment: "Tenha sempre acesso antecipado as novidades do sistema",
				icon: "rocket",
				dev: true,
			},
		];

		return (
			<Row className={"justify-content-center"}>
				<Col sm={"12"}>{/* <h3>Por que ser Premium?</h3> */}</Col>
				{beneficios.map((beneficio, index) =>
					this.renderVantagem(beneficio, index)
				)}
			</Row>
		);
	};

	render() {
		return (
			<div>
				<Modal
					isOpen={true}
					toggle={this.props.handle}
					// backdrop={'static'}
					// keyboard={false}
					size={"lg"}
					className={"modal-dialog-centered"}
				>
					<ModalBody style={{ background: "#EDC32D" }} className={"p-0"}>
						<Row className={"p-0 m-0"}>
							<Col
								sm={"5"}
								className={"align-self-center bg-light p-4 hidden-xs"}
							>
								{this.renderLeft()}
							</Col>
							<Col className={"align-self-center"}>{this.renderRight()}</Col>
						</Row>
					</ModalBody>
				</Modal>
			</div>
		);
	}
}

export default modalAtivarTrial;
