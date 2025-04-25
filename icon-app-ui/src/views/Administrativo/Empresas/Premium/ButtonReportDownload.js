import { useState } from "react";
import { toast } from "react-toastify";
import ButtonLoading from "../../../../components/ButtonLoading";
import * as services from "../../../../service/services";

const ButtonDownloadReport = () => {
	const [isWaiting, setWaiting] = useState(false);

	const handleSheet = async (event) => {
		event.preventDefault();
		setWaiting(true);
		const { data } = await services.getPremiumCompanyReport();
		const { status } = data;
		if (status === "success") {
			let { url } = data;
			url = url.replace(".sa-east-1", "");
			window.open(url, "_blank").focus();
		} else {
			toast.error("Não foi possível carregar os dados :(");
			console.error(data);
		}
		setWaiting(false);
	};

	return (
		<ButtonLoading
			color={"dark"}
			className={"float-left"}
			onClick={handleSheet}
			isLoading={isWaiting}
			title={"Gerar relatório com dados de faturamento das empresas"}
		>
			<i className="fa fa-file-excel-o mr-2" />
			Planilha Faturamento
		</ButtonLoading>
	);
};

export default ButtonDownloadReport;
