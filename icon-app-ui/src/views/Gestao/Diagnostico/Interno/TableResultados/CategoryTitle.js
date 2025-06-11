import { useState } from "react";
import { toast } from "react-toastify";
import { Tooltip, FormGroup, Label, Form, Input } from "reactstrap";
import { Button, Modal, ModalHeader, ModalBody, ModalFooter } from "reactstrap";
import ButtonLoading from "../../../../../components/ButtonLoading";
import AmbienteInternoService from "../../../../../service/Diagnostico/AmbienteInterno";

const ModalEditCategory = (props) => {
	const [title, setTitle] = useState(props.title);
	const [waiting, setWaiting] = useState(false);

	const { toggle, handleTitle } = props;

	const onChange = (event) => {
		setTitle(event.target.value);
	};

	const onKeyDown = (event) => {
		if (event.key === "Enter") {
			submit(event);
		}
		if (event.key === "Escape") {
			toggle();
		}
	};

	const submit = async (event) => {
		event.preventDefault();

		if (props.title === title) {
			return toggle();
		}

		setWaiting(true);

		const response = await AmbienteInternoService.updateDespesa(
			title,
			props.title
		);
		const { status, message } = response;

		if (status === "success") {
			handleTitle(title, props.title);
			toast.info(message);
			toggle();
		} else {
			toast.error(message);
			setWaiting(false);
		}
	};

	const handleToggle = () => {
		if (waiting) return;
		toggle();
	};

	return (
		<Modal isOpen={true} toggle={handleToggle}>
			<ModalHeader toggle={handleToggle}>Editar Categoria</ModalHeader>
			<ModalBody>
				<Form>
					<FormGroup>
						<Label for={"inputName"}>Nome da Despesa</Label>
						<Input
							type={"text"}
							name={"inputName"}
							placeholder={"Defina um nome para a despesa"}
							value={title}
							onChange={onChange}
							onKeyDown={onKeyDown}
						/>
					</FormGroup>
				</Form>
			</ModalBody>
			<ModalFooter>
				<ButtonLoading color="primary" onClick={submit} isLoading={waiting}>
					Alterar
				</ButtonLoading>
				<Button color="secondary" onClick={handleToggle}>
					Cancelar
				</Button>
			</ModalFooter>
		</Modal>
	);
};

const CategoryTitle = ({ row, keyValue, handleTitle }) => {
	const [tooltipShow, setTooltipShow] = useState(false);
	const [tooltipEditShow, setTooltipEditShow] = useState(false);
	const [modalEditIsOpen, setModalEdit] = useState(false);

	const name_id_tooltip = "tooltip_" + keyValue + "_" + row.id;
	const name_id_tooltip_edit = "tooltip_edit_" + keyValue + "_" + row.id;

	const handleModalEdit = () => {
		setModalEdit(!modalEditIsOpen);
	};

	return (
		<FormGroup>
			{row.tip && (
				<span style={{ marginRight: "5px" }}>
					<i className="icon-info" id={name_id_tooltip} />
					<Tooltip
						placement="top"
						isOpen={tooltipShow}
						target={name_id_tooltip}
						toggle={() => setTooltipShow(!tooltipShow)}
					>
						{row.tip}
					</Tooltip>
				</span>
			)}
			{row.title_editable === true && (
				<span
					style={{ marginRight: "5px", cursor: "pointer" }}
					onClick={handleModalEdit}
				>
					<i className="fa fa-edit" id={name_id_tooltip_edit} />
					<Tooltip
						placement="top"
						isOpen={tooltipEditShow}
						target={name_id_tooltip_edit}
						toggle={() => setTooltipEditShow(!tooltipEditShow)}
					>
						Editar título para categoria
					</Tooltip>
				</span>
			)}
			<Label>{row.title}</Label>
			{modalEditIsOpen && (
				<ModalEditCategory
					title={row.title}
					titleId={row.title_id}
					toggle={handleModalEdit}
					handleTitle={handleTitle}
				/>
			)}
		</FormGroup>
	);
};

export default CategoryTitle;
