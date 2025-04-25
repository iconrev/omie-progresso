import { Button } from "reactstrap";
import PropTypes from "prop-types";

const ButtonLoading = (props) => {
	const { isLoading, textLoading, visible = true, ...rest } = props;

	if (!visible) return null;

	const children = isLoading ? (
		<>
			<span
				className="spinner-grow spinner-grow-sm mr-2"
				role="status"
				aria-hidden="true"
			/>
			{textLoading ? textLoading : "Aguarde..."}
		</>
	) : (
		props.children
	);

	return (
		<Button {...rest} onClick={!isLoading ? props.onClick : null}>
			{children}
		</Button>
	);
};

ButtonLoading.propTypes = {
	isLoading: PropTypes.bool.isRequired,
	textLoading: PropTypes.string,
};

export default ButtonLoading;
