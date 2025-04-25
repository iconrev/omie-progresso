import { useState } from "react";
import { Carousel, CarouselItem, Row, Col } from "reactstrap";

const CarouselChart = (props) => {
	const items = props.chartsItem;
	const [activeIndex, setActiveIndex] = useState(props.indexChart);
	const [animating, setAnimating] = useState(false);

	const next = () => {
		if (animating) return;
		const nextIndex = activeIndex === items.length - 1 ? 0 : activeIndex + 1;
		setActiveIndex(nextIndex);
	};

	const previous = () => {
		if (animating) return;
		const nextIndex = activeIndex === 0 ? items.length - 1 : activeIndex - 1;
		setActiveIndex(nextIndex);
	};

	const slides = Object.entries(items).map((item, index) => {
		return (
			<CarouselItem
				onExiting={() => setAnimating(true)}
				onExited={() => setAnimating(false)}
				key={index}
			>
				{props.chart(item, index, props.perspectivaKey)}
			</CarouselItem>
		);
	});

	return (
		<Row className={"justify-content-center"}>
			<Col sm={8}>
				<Carousel
					activeIndex={props.indexChart}
					next={next}
					previous={previous}
					interval={false}
				>
					{slides}
				</Carousel>
			</Col>
		</Row>
	);
};

export default CarouselChart;
