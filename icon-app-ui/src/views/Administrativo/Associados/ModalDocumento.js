import { useState } from "react";
import {
	Button,
	Modal,
	ModalHeader,
	ModalBody,
	ModalFooter,
	Form,
	FormGroup,
	Label,
	Input,
} from "reactstrap";
import { uploadNewFile } from "../../../service/services";
import Generic from "../../Utils/Generic";
import { toast } from "react-toastify";
import ButtonLoading from "../../../components/ButtonLoading";

const initialState = {
	title: "",
	description: "",
	filename: "",
	file: null,
};

const ModalDocumento = (props) => {
	const [state, setState] = useState(initialState);
	const [isLoading, setIsLoading] = useState(false);

	const handleChange = (event) => {
		setState({
			...state,
			[event.target.id]: event.target.value,
		});
	};

	const validateUpload = () => {
		const errors = [];

		if (state.title.length < 3) {
			errors.push("Título do arquivo inválido");
		}

		if (state.description.length < 3) {
			errors.push("Descrição do arquivo inválido");
		}

		if (state.filename.length < 3 || !state.file) {
			errors.push("Deve-se selecionar um arquivo");
		}

		errors.map((item) => toast.error(item));

		return errors.length === 0;
	};

	const onImageChange = async (event) => {
		if (event.target.files && event.target.files[0]) {
			const file = event.target.files[0];
			const base64 = await Generic.convertBase64(file);
			setState({
				...state,
				filename: file.name,
				file: base64,
			});
		} else {
			toast.error("Não foi possível fazer o upload do arquivo.");
		}
	};

	const submit = async (event) => {
		event.preventDefault();

		if (validateUpload()) {
			setIsLoading(true);
			await uploadNewFile(state)
				.then((response) => {
					const { status, message } = response;
					setIsLoading(false);
					if (status === "success") {
						setState(initialState);
						props.toggle();
						toast.success(message);
					} else {
						toast.error(message);
					}
				})
				.catch((error) => {
					setIsLoading(false);
					const { message } = error.data;
					toast.error(message);
				});
		}
	};

	return (
		<Modal
			isOpen={props.isOpen}
			toggle={props.toggle}
			className={props.className}
		>
			<ModalHeader toggle={props.toggle}>{props.title}</ModalHeader>
			<ModalBody>
				<Form>
					<FormGroup>
						<Label>Título do Documento</Label>
						<Input
							type="text"
							id="title"
							value={state.title}
							onChange={handleChange}
						/>
					</FormGroup>
					<FormGroup>
						<Label>Descrição</Label>
						<Input
							type="text"
							id="description"
							value={state.description}
							onChange={handleChange}
						/>
					</FormGroup>
					<FormGroup>
						<Input
							type="file"
							id="filename"
							accept=".doc, .docx, .pdf, .ppt, .pptx"
							onChange={onImageChange}
						/>
					</FormGroup>
				</Form>
			</ModalBody>
			<ModalFooter>
				<ButtonLoading color="primary" onClick={submit} isLoading={isLoading}>
					Carregar arquivo
				</ButtonLoading>{" "}
				<Button color="secondary" onClick={props.toggle}>
					Cancelar
				</Button>
			</ModalFooter>
		</Modal>
	);
};

export default ModalDocumento;
