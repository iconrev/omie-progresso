import {
	Card,
	CardBody,
	CardHeader,
	Form,
	Col,
	FormGroup,
	Label,
	Input,
} from "reactstrap";

const CardContatoFinanceiro = (props) => {
	const handleChange = (event) => {
		props.handle({
			...props.data,
			[event.target.id]: event.target.value,
		});
	};

	const validateField = (field) => {
		return props.error.indexOf(field) >= 0;
	};

	return (
		<Card>
			<CardHeader>Contato Financeiro</CardHeader>
			<CardBody>
				<Form>
					<FormGroup row>
						<Label for={"contatoFinanceiro"} xs={12} sm={3} md={2}>
							Contato
						</Label>
						<Col xs={12} sm={9} md={10}>
							<Input
								type="text"
								id="contatoFinanceiro"
								onChange={handleChange}
								value={props.data.contatoFinanceiro}
								invalid={validateField("contatoFinanceiro")}
							/>
						</Col>
					</FormGroup>
					<FormGroup row>
						<Label
							for={"celularContatoFinanceiro"}
							xs={12}
							sm={3}
							md={2}
							lg={2}
						>
							Telefone/Celular
						</Label>
						<Col xs={12} sm={9} md={10} lg={3}>
							<Input
								type="text"
								id="celularContatoFinanceiro"
								onChange={handleChange}
								value={props.data.celularContatoFinanceiro}
								invalid={validateField("celularContatoFinanceiro")}
							/>
						</Col>
						<Label
							for={"emailContatoFinanceiro"}
							xs={12}
							sm={3}
							md={2}
							lg={"auto"}
						>
							E-mail
						</Label>
						<Col>
							<Input
								type="email"
								id="emailContatoFinanceiro"
								onChange={handleChange}
								value={props.data.emailContatoFinanceiro}
								invalid={validateField("emailContatoFinanceiro")}
							/>
						</Col>
					</FormGroup>
				</Form>
			</CardBody>
		</Card>
	);
};

export default CardContatoFinanceiro;
