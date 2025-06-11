import { useState } from "react";
import { toast } from "react-toastify";
import { Button, Row, Col } from "reactstrap";
import styles from "../../../assets/stepsforms.module.css";

const ProgressStep = ({ step, label, currentStep, onClick }) => {
	const isActive = step === currentStep;
	const classNameState = isActive ? "success" : "secondary";
	const onClickHandler = isActive ? null : onClick;

	return (
		<Col className={"text-center"}>
			<Button
				color={classNameState}
				onClick={onClickHandler}
				className={`${styles["btn-circle"]}`}
			>
				{step + 1}
			</Button>
			<p
				className={`${styles["step-label"]} ${
					isActive ? styles["step-label-active"] : null
				}`}
			>
				{label}
			</p>
		</Col>
	);
};

const StepsForm = ({
	steps = [],
	startStep = 0,
	jumpStep = true,
	handleError = null,
}) => {
	const [currentStep, setCurrentStep] = useState(startStep);

	const validateFieldsStep = (fieldsValidation, whiteList = []) => {
		const errors = [];
		for (let i = 0; i < fieldsValidation.length; i++) {
			const field = fieldsValidation[i];
			const value = steps[currentStep].screen.props.data[field];
			if (whiteList.indexOf(field) >= 0) continue;
			if (value === undefined || value === null || value === "") {
				errors.push(field);
			}
		}

		return errors;
	};

	const handleCurrentStep = async (step, validation = false) => {
		if (validation && handleError !== null) {
			const fieldsValidation = Object.keys(
				steps[currentStep].screen.props.data
			);
			const whiteList = steps[currentStep].screen.props.notRequired;
			const errors = validateFieldsStep(fieldsValidation, whiteList);
			const errorThisStep = errors.some((r) => fieldsValidation.includes(r));
			if (errorThisStep) {
				handleError(errors);
				toast.error("Preencha todos os campos obrigatórios");
				return;
			}
			handleError([]);
		}
		setCurrentStep(step);
	};

	return (
		<>
			<Row>
				<Col>
					<div className={styles["steps-form"]}>
						<div className={`${styles["steps-row"]} ${styles["steps-panel"]}`}>
							<Row className={"justify-content-between"}>
								{steps.map((step, index) => {
									return (
										<ProgressStep
											key={index}
											step={index}
											label={step.label}
											currentStep={currentStep}
											onClick={jumpStep ? () => handleCurrentStep(index) : null}
										/>
									);
								})}
							</Row>
						</div>
					</div>
				</Col>
			</Row>
			<Row>
				<Col>{steps[currentStep].screen}</Col>
			</Row>
			<Row className={"justify-content-end"}>
				<Col sm={"auto"}>
					<Button
						outline
						color="secondary"
						className={`mr-2 ${currentStep === 0 ? "d-none" : null}`}
						onClick={() =>
							handleCurrentStep(currentStep > 0 ? currentStep - 1 : 0)
						}
					>
						Voltar
					</Button>
					<Button
						color="primary"
						onClick={() =>
							handleCurrentStep(
								currentStep < steps.length - 1 ? currentStep + 1 : currentStep,
								true
							)
						}
						className={`${currentStep === steps.length - 1 ? "d-none" : null}`}
					>
						Avançar
					</Button>
					{steps[currentStep].button ? steps[currentStep].button : null}
				</Col>
			</Row>
		</>
	);
};

export default StepsForm;
