import {
	Card,
	CardBody,
	CardHeader,
	Form,
	FormGroup,
	Label,
	Input,
} from "reactstrap";

const CardCompany = (props) => {
	const { nome } = props.company;

	return (
		<Card>
			<CardHeader>Empresa</CardHeader>
			<CardBody>
				<Form>
					<FormGroup>
						<Label>Nome da Empresa</Label>
						<Input type={"text"} value={nome} disabled />
					</FormGroup>
				</Form>
			</CardBody>
		</Card>
	);
};

export default CardCompany;
