import { useState } from "react";
import {
	Alert,
	Badge,
	Card,
	CardBody,
	CardSubtitle,
	CardTitle,
	Col,
	Container,
	FormGroup,
	Input,
	ListGroup,
	ListGroupItem,
	Nav,
	NavItem,
	NavLink,
	Row,
	TabContent,
	TabPane,
} from "reactstrap";
import { toast } from "react-toastify";
import ButtonLoading from "../../../components/ButtonLoading";
import CompanyService from "../../../service/CompanyService";
import Geral from "../../../service/Geral";
import Generic from "../../Utils/Generic";
import LoadingFullScreen from "../../../components/LoadingFullScreen";

function CaptionDownload(props) {
	const company = CompanyService.getDataCompany();

	const [isLoading, setLoading] = useState(false);

	const handleDownload = async (sheetName) => {
		setLoading(true);
		const response =
			sheetName === "dre"
				? await Geral.getSheeTemplateDre(company.id, company.exercicioDefinido)
				: await Geral.getSheeTemplateDiagnostic(
						company.id,
						company.exercicioDefinido
				  );

		if (response.status === "success") {
			const { url } = response;
			window.open(url, "_blank").focus();
		}
		setLoading(false);
	};

	return (
		<>
			Faça o download da planilha mais atualizada{" "}
			<u
				style={{ cursor: "pointer" }}
				onClick={() => handleDownload(props.sheetName)}
			>
				clicando aqui
			</u>
			.{isLoading && <LoadingFullScreen />}
		</>
	);
}

function CaptionUpload(props) {
	const company = CompanyService.getDataCompany();
	const [isLoading, setLoading] = useState(false);
	const [stateFile, setStateFile] = useState(null);

	const handleChange = async (event) => {
		if (event.target.files && event.target.files[0]) {
			const file = event.target.files[0];
			const base64 = await Generic.convertBase64(file);
			setStateFile({
				filename: file.name,
				file: base64,
				sheet: props.sheetName,
			});
		} else {
			toast.error("Não foi possível fazer o upload do arquivo.");
			setStateFile(null);
		}
	};

	const handleUpload = async () => {
		if (stateFile === null) {
			toast.info("Selecione o arquivo antes de continuar");
			return;
		}

		setLoading(true);

		const response = await Geral.uploadSheet(company.id, stateFile);
		const { status, message } = response;
		if (status === "success") {
			toast.success(message);
		} else {
			toast.error(message);
		}

		setLoading(false);
	};

	return (
		<Row>
			<Col>
				<FormGroup>
					<Input type={"file"} accept=".xlsx" onChange={handleChange} />
				</FormGroup>
			</Col>
			<Col xs={"auto"}>
				<ButtonLoading
					color={"warning"}
					onClick={handleUpload}
					className="float-right"
					isLoading={isLoading}
					disabled={stateFile === null}
				>
					Enviar
				</ButtonLoading>
			</Col>
		</Row>
	);
}

function CardUpload(props) {
	return (
		<Card
			style={{
				width: "100%",
			}}
		>
			<CardBody>
				<CardTitle tag="h4">{props.title}</CardTitle>
				<CardSubtitle className="mb-2 text-muted" tag="h6">
					{props.subtitle}
				</CardSubtitle>
				<ListGroup>
					{props.items &&
						props.items.map((item, index) => {
							return (
								<ListGroupItem
									className="justify-content-between"
									key={"item_" + index}
								>
									<Row className="align-items-center">
										<Col xs={"auto"}>
											<Badge pill>{index + 1}</Badge>
										</Col>
										<Col>
											<Row>
												<Col xs={"12"} className={"lead"}>
													<strong>{item.title}</strong>
												</Col>
												<Col xs={"12"}>
													<em>{item.caption}</em>
												</Col>
											</Row>
										</Col>
									</Row>
								</ListGroupItem>
							);
						})}
				</ListGroup>
			</CardBody>
		</Card>
	);
}

function TabHeader(props) {
	const { children, tabId, onClick, tabActiveNow } = props;

	const handleClick = () => {
		onClick(tabId);
	};

	return (
		<NavItem active={tabActiveNow === tabId}>
			<NavLink onClick={handleClick}>{children}</NavLink>
		</NavItem>
	);
}

// function TabContentCompany(props) {
// 	return (
// 		<TabPane tabId={props.tabId}>
// 			<Row>
// 				<Col sm={"12"}>
// 					<Alert color={"info"}>Em desenvolvimento</Alert>
// 				</Col>
// 			</Row>
// 		</TabPane>
// 	);
// }

function TabContentImport(props) {
	return (
		<TabPane tabId={props.tabId}>
			<Row>
				<Col xs={"12"} lg={"6"}>
					<CardUpload
						title={"DRE"}
						subtitle={"Importar Planilha DRE"}
						items={[
							{
								title: "Download",
								caption: <CaptionDownload sheetName={"dre"} />,
							},
							{
								title: "Preencha as informações",
								caption:
									"Fique atento aos dados que serão informados. Qualquer dúvida só nos chamar =)",
							},
							{
								title: "Importe a planilha",
								caption: <CaptionUpload sheetName={"dre"} />,
							},
						]}
					/>
				</Col>
				<Col xs={"12"} lg={"6"}>
					<CardUpload
						title={"Dados do Ambiente Interno"}
						subtitle={"Importar Planilha com dados do Ambiente Interno"}
						items={[
							{
								title: "Download",
								caption: <CaptionDownload sheetName={"diagnostico"} />,
							},
							{
								title: "Preencha as informações",
								caption:
									"Fique atento aos dados que serão informados. Qualquer dúvida só nos chamar =)",
							},
							{
								title: "Importe a planilha",
								caption: <CaptionUpload sheetName={"diagnostico"} />,
							},
						]}
					/>
				</Col>
			</Row>
			<Row>
				<Col xs={"12"}>
					<Alert color={"warning"}>
						Atenção! Os dados salvos anteriormente serão sobrescritos com as
						informações preenchidas na planilha :)
					</Alert>
				</Col>
			</Row>
		</TabPane>
	);
}

export default function CompanyConfig() {
	const [activeTab, setActiveTab] = useState(0);

	const tabsName = [
		// {
		// 	title: "Dados da Empresa",
		// 	badge: <Badge color={"secondary"}>Em desenvolvimento</Badge>,
		// 	view: TabContentCompany,
		// },
		{
			title: "Planilhas de Integração",
			badge: <Badge color={"success"}>NOVO</Badge>,
			view: TabContentImport,
		},
	];

	return (
		<Container>
			<Row>
				<Col xs={"12"}>
					<Nav tabs>
						{tabsName.map((tabItem, index) => {
							return (
								<TabHeader
									tabId={index}
									onClick={setActiveTab}
									tabActiveNow={activeTab}
									key={index}
								>
									<Row className={"text-center"}>
										<Col xs={"12"}>{tabItem.title}</Col>
										{tabItem.badge && <Col xs>{tabItem.badge}</Col>}
									</Row>
								</TabHeader>
							);
						})}
					</Nav>
					<TabContent activeTab={activeTab}>
						{tabsName.map((tabItem, index) => {
							const View = tabItem.view;
							return <View tabId={index} key={index} />;
						})}
					</TabContent>
				</Col>
			</Row>
		</Container>
	);
}
