import { useState } from "react";
import { Tooltip } from "reactstrap";

const TooltipDefault = (props) => {
	const [tooltipOpen, setTooltipOpen] = useState(false);

	const toggle = () => setTooltipOpen(!tooltipOpen);

	return (
		<div>
			<Tooltip
				placement="top"
				isOpen={tooltipOpen}
				target={props.target}
				toggle={toggle}
			>
				{props.hintText}
			</Tooltip>
		</div>
	);
};

export default TooltipDefault;
