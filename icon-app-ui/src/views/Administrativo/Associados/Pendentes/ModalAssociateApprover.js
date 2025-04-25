import { useState } from "react";
import {
	Button,
	Modal,
	ModalHeader,
	ModalBody,
	ModalFooter,
	InputGroup,
	Input,
	InputGroupAddon,
	InputGroupText,
	FormGroup,
	Label,
} from "reactstrap";
import { toast } from "react-toastify";
import ApiBase from "../../../../service/api_base";
import ButtonLoading from "../../../../components/ButtonLoading";

const Api_Base = new ApiBase();

const ModalAssociateApprover = (props) => {
	const [isLoadingAccept, setIsloadingAccept] = useState(false);
	const [isLoadingReject, setIsloadingReject] = useState(false);
	const [comment, setComment] = useState("");

	const handleSubmit = async (status) => {
		const payload = {
			user_id: props.user.user_id,
			company_id: props.user.company_id,
			status: status,
			comment: comment,
		};
		await Api_Base.post(
			"/cadastros/usuarios/associados/solicitacao/avaliar",
			payload
		)
			.then(async (result) => {
				const { status, message } = result.data;

				if (status !== "success") {
					toast.error(message);
				} else {
					toast.success(message);
					setInterval(() => window.location.reload(), 2000);
				}
			})
			.catch((err) => {
				console.error(err);
				toast.error("Não foi possível enviar sua avaliação :(");
				setIsloadingAccept(false);
				setIsloadingReject(false);
			});
	};

	const accept = async (e) => {
		e.preventDefault();
		setIsloadingAccept(true);
		return handleSubmit("1");
	};

	const reject = (e) => {
		e.preventDefault();
		if (comment.length < 3) {
			toast.error(
				"Para rejeitar uma solicitação é necessário informar os motivos no comentário."
			);
			return;
		}
		setIsloadingReject(true);
		return handleSubmit("2");
	};

	const toggle = (e) => {
		props.toggleBase(e, null);
	};

	const renderField = (value, icon, disabled = true) => {
		return (
			<FormGroup>
				<InputGroup>
					<InputGroupAddon addonType="prepend">
						<InputGroupText>
							<i className={`fa fa-${icon}`} />
						</InputGroupText>
					</InputGroupAddon>
					<Input value={value} disabled={disabled} />
				</InputGroup>
			</FormGroup>
		);
	};

	if (!props.user) return null;

	return (
		<Modal isOpen={props.isOpen} toggle={toggle}>
			<ModalHeader>Avaliação de Upgrade</ModalHeader>
			<ModalBody>
				{renderField(props.user.name, "user")}
				{renderField(props.user.crc, "id-card-o")}
				{renderField(props.user.email, "envelope-o")}
				{renderField(props.user.phone, "phone")}
				{renderField(
					`${props.user.companyName} (${props.user.companyCnpj})`,
					"building-o"
				)}
				<FormGroup>
					<Label for="comments">Comentários</Label>
					<Input
						type="textarea"
						value={comment}
						onChange={(e) => setComment(e.target.value)}
						maxLength="250"
					/>
				</FormGroup>
			</ModalBody>
			<ModalFooter>
				<ButtonLoading
					color="success"
					onClick={accept}
					isLoading={isLoadingAccept}
					disabled={isLoadingReject}
				>
					Aceitar Upgrade
				</ButtonLoading>
				<ButtonLoading
					color="danger"
					onClick={reject}
					isLoading={isLoadingReject}
					disabled={isLoadingAccept}
				>
					Recusar Upgrade
				</ButtonLoading>
				<Button
					color="secondary"
					onClick={toggle}
					disabled={isLoadingAccept || isLoadingReject}
				>
					Fechar
				</Button>
			</ModalFooter>
		</Modal>
	);
};

export default ModalAssociateApprover;
