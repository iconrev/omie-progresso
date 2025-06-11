import { Card, CardBody, CardHeader, Col, Row, Container } from "reactstrap";
import { formatNumber } from "../../Utils/Generic";

const CardMensalidade = (props) => {
	const value = `R$ ${formatNumber(props.data.valor, 2)}`;

	return (
		<Card>
			<CardHeader>Cobrança da Mensalidade</CardHeader>
			<CardBody>
				<Row className={"align-items-center"}>
					<Col xs={12} md={8} className={"p-2"}>
						<Container>
							<Row className={"align-items-center"}>
								<Col xs={12} sm={3} md={4} className={"text-center p-2"}>
									<i className="fa fa-barcode fa-4x" aria-hidden="true" />
								</Col>
								<Col
									xs={12}
									sm={9}
									md={8}
									className={"p-2 text-center text-md-left"}
								>
									<h4 className={"m-0 font-weight-bolder"}>Boleto Bancário</h4>
									<p className={"m-0 text-muted font-italic"}>
										O boleto tem prazo de compensação de 1 a 2 dias úteis.
									</p>
								</Col>
							</Row>
						</Container>
					</Col>
					<Col xs={12} md={4} className={"p-2 text-center text-md-left"}>
						<p className={"m-0"}>Investimento</p>
						<blockquote className="blockquote m-0">
							<h2 className={"m-0 font-weight-bolder"}>{value}</h2>
							<footer className="blockquote-footer">Mensalidade</footer>
						</blockquote>
					</Col>
				</Row>
			</CardBody>
		</Card>
	);
};

export default CardMensalidade;
