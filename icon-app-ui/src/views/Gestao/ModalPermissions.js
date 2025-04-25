import { useState } from "react";
import { Modal, ModalBody, Button, Row } from "reactstrap";

const ModalPermissions = (props) => {
	const [modal, setModal] = useState(props.isOpen);

	const toggle = () => setModal(!modal);

	const redirect = () => {
		props.history.push(`${props.location.pathname}/usuarios`);
	};

	const remindMe = () => {
		toggle();
	};

	return (
		<Modal
			isOpen={modal}
			toggle={toggle}
			backdrop={"static"}
			keyboard={false}
			className={"w-100 p-0 m-0 min-vw-100 rounded-0"}
		>
			<ModalBody className={"rounded-0"}>
				<Row className={"justify-content-center align-items-center"}>
					<p className="pt-3 pr-2">
						<strong>Já viu a novidade?</strong> A partir de agora é possível
						gerenciar o acesso dos usuários desta empresa.
					</p>
					<Button color={"success"} onClick={redirect}>
						Vamos <i className="fa fa-share ml-1" />
					</Button>
					<Button
						color={"danger"}
						outline
						className={"ml-1"}
						onClick={remindMe}
					>
						Mais tarde
					</Button>
				</Row>
			</ModalBody>
		</Modal>
	);
};

export default ModalPermissions;
