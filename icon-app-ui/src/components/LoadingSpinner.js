import { Spinner } from "reactstrap";
import PropTypes from "prop-types";

const LoadingSpinner = (props) => {
	const size = props.size || 60;
	const metric = "px";
	const width = size + metric;
	const height = size + metric;
	const center = `calc(50% - ${size / 2}${metric})`;
	const position = props.position || "absolute";
	const display =
		props.isLoading === true
			? "block"
			: props.isLoading === undefined
			? "block"
			: "none";

	return (
		<Spinner
			type="grow"
			style={{
				width: width,
				height: height,
				top: center,
				left: center,
				position: position,
				zIndex: "9999",
				display: display,
			}}
		/>
	);
};

LoadingSpinner.propTypes = {
	size: PropTypes.number,
	position: PropTypes.oneOf(["absolute", "relative"]),
	isLoading: PropTypes.bool,
};

export default LoadingSpinner;
