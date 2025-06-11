import { useState } from "react";
import { toast } from "react-toastify";
import {
	Badge,
	Button,
	Card,
	CardBody,
	CardFooter,
	CardText,
	CardTitle,
	Col,
	Row,
} from "reactstrap";
import * as services from "../../../service/services";
import Generic from "../../Utils/Generic";
import moment from "moment-timezone";
import TooltipDefault from "../../../components/TooltipDefault";

const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;

const CardDocumentosExclusivos = (props) => {
	const [file, setFile] = useState(props.file);

	let tagNew = null;
	const createdAt = moment(moment(file.createdAt).tz(timezone).format());
	const time_ago = moment.duration(createdAt.diff(moment()));
	if (time_ago < 10) {
		const target = `new_id_${file.id}`;
		tagNew = (
			<>
				<div className="shadow-sm tag-new-file" id={target}>
					NOVO
				</div>
				<TooltipDefault
					target={target}
					hintText={`Postado em: ${createdAt.format("DD/MM/YYYY")}`}
				/>
			</>
		);
	}

	const handleDownload = async (event) => {
		event.preventDefault();

		const { data } = await services.getFileAssociadoById(file.id);
		const { status } = data;

		if (status === "success") {
			let { url } = data;
			url = url.replace(".sa-east-1", "");

			window.open(url, "_blank").focus();

			setFile({
				...file,
				downloads: file.downloads + 1,
			});
		} else {
			toast.error("Não foi possível efetuar o download :(");
		}
	};

	const classIcon = Generic.iconClasses[file.contentType] || "fa-file-o";

	return (
		<>
			<Card className={"shadow-sm hover-zoom h-100"}>
				<CardBody className={"pb-0 pl-3 pr-3 pt-3"}>
					{tagNew}
					<Row className={"text-center"}>
						<Col>
							<span style={{ color: classIcon.color }}>
								<i
									className={`fa fa-${classIcon.icon} fa-3x`}
									aria-hidden="true"
								/>
							</span>
						</Col>
					</Row>
					<Row className={"mt-2 mb-2 align-items-center"}>
						<Col>
							<Badge color={"success"} pill>
								{file.downloads}
							</Badge>
							<span className="ml-1">
								<small className={"text-muted"}>Downloads</small>
							</span>
						</Col>
					</Row>
					<CardTitle tag="h5">{file.title}</CardTitle>
					<CardText className={"text-justify"}>{file.description}</CardText>
				</CardBody>
				<CardFooter className={"text-center"}>
					<Button color={"warning"} onClick={handleDownload}>
						Download
					</Button>
				</CardFooter>
			</Card>
		</>
	);
};

export default CardDocumentosExclusivos;
