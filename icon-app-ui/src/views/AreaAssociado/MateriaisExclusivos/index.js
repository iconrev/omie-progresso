import {
	Alert,
	Card,
	CardBody,
	CardHeader,
	Col,
	Container,
	Row,
} from "reactstrap";
import CardDocumentosExclusivos from "./CardDocumentoExclusivo";

const MateriaisExclusivos = ({ files }) => {
	return (
		<Card>
			<CardHeader>Materiais Exclusivos</CardHeader>
			<CardBody>
				<Container fluid>
					<Row>
						{files.length === 0 ? (
							<Col>
								<Alert color={"warning"}>Nenhum arquivo a ser exibido</Alert>
							</Col>
						) : (
							files.map((item, index) => {
								return (
									<Col
										key={index}
										xs={"12"}
										sm={"6"}
										md={"4"}
										lg={"3"}
										xl={"3"}
									>
										<CardDocumentosExclusivos file={item} key={index} />
									</Col>
								);
							})
						)}
					</Row>
				</Container>
			</CardBody>
		</Card>
	);
};

export default MateriaisExclusivos;
