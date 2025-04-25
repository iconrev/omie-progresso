import { Spinner } from "reactstrap";

const LoadingFullScreen = () => {
	return (
		<div
			className="modal fade show modal-backdrop-full"
			role="dialog"
			tabIndex="-1"
		>
			<div className="modal-dialog" role="document">
				<Spinner
					color="light"
					style={{
						width: "3rem",
						height: "3rem",
						top: "45%",
						left: "50%",
						position: "fixed",
						zIndex: "9999",
						display: "block",
					}}
				/>
			</div>
		</div>
	);
};

export default LoadingFullScreen;
