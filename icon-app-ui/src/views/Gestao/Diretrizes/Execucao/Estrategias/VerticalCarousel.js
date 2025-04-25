import { Component } from "react";
import cn from "classnames";
import "../../../../../assets/Gestao/Diretrizes/Execucao/Estrategias/verticalcarouselstyle.scss";

class VerticalCarousel extends Component {
	constructor(props) {
		super(props);

		const halfwayIndex = Math.ceil(this.props.data.length / 2);
		const itemHeight = 70;
		const shuffleThreshold = halfwayIndex * itemHeight;

		this.state = {
			activeIndex: 0,
			halfwayIndex: halfwayIndex,
			itemHeight: itemHeight,
			shuffleThreshold: shuffleThreshold,
			visibleStyleThreshold: shuffleThreshold / 2,
			intervalId: 0,
		};
	}

	componentDidMount() {
		let intervalId = setInterval(this.timer, 3000);
		this.setState({ intervalId: intervalId });
	}

	componentWillUnmount = () => {
		clearInterval(this.state.intervalId);
	};

	timer = () => {
		const data = this.props.data;

		let activeIndex = this.state.activeIndex;

		if (activeIndex < data.length - 1) {
			activeIndex += 1;
		} else {
			activeIndex = 0;
		}

		this.setState({ activeIndex: activeIndex });
	};

	determinePlacement = (itemIndex) => {
		const activeIndex = this.state.activeIndex;
		const halfwayIndex = this.state.halfwayIndex;
		const itemHeight = this.state.itemHeight;
		const shuffleThreshold = this.state.shuffleThreshold;

		const data = this.props.data;

		if (activeIndex === itemIndex) return 0;

		let translateY = 0;

		if (!this.isReady) {
			this.minTranslateY =
				-(data.length - 1 + activeIndex - itemIndex) * itemHeight;
			this.isReady = true;
		}

		if (itemIndex >= halfwayIndex) {
			if (activeIndex > itemIndex - halfwayIndex) {
				translateY = (itemIndex - activeIndex) * itemHeight;
			} else {
				if (data.length === 4 && itemIndex === data.length - 2) {
					translateY = (data.length + activeIndex - itemIndex) * itemHeight;
				} else {
					translateY = -(data.length + activeIndex - itemIndex) * itemHeight;
				}
			}

			return translateY;
		}

		if (itemIndex > activeIndex) {
			translateY = (itemIndex - activeIndex) * itemHeight;
		}

		if (itemIndex < activeIndex) {
			if ((activeIndex - itemIndex) * itemHeight >= shuffleThreshold) {
				translateY = (data.length - (activeIndex - itemIndex)) * itemHeight;
			} else {
				translateY = -(activeIndex - itemIndex) * itemHeight;
			}
		}

		return translateY;
	};

	render() {
		return (
			<section className="outer-container">
				<div className="carousel-wrapper">
					<div className="carousel">
						<div className="slides">
							<div className="carousel-inner">
								{this.props.data.map((item, i) => {
									return (
										<button
											type="button"
											// onClick={() => { this.setState({ activeIndex: i }) }}
											onTransitionEnd={(e) => {
												e.persist();

												if (e.propertyName === "transform") {
													const element = e.target;
													const style = window.getComputedStyle(element);
													const matrix = new DOMMatrixReadOnly(style.transform);
													const translateY = matrix.m42;

													if (translateY === -140) {
														element.style.transform = "translateY(140px)";
													}
												}
											}}
											className={cn("item", {
												active: this.state.activeIndex === i,
												visible:
													Math.abs(this.determinePlacement(i)) <=
													this.state.visibleStyleThreshold,
											})}
											key={i.toString()}
											style={{
												transform: `translateY(${this.determinePlacement(
													i
												)}px)`,
											}}
											onClick={(e) => this.props.goTo(e, item)}
										>
											{item.descricao}
										</button>
									);
								})}
							</div>
						</div>
					</div>
				</div>
			</section>
		);
	}
}

export default VerticalCarousel;
