import { useState } from "react";
import BootstrapTable from "react-bootstrap-table-next";
import {
	Row,
	Col,
	Input,
	InputGroup,
	InputGroupAddon,
	InputGroupText,
} from "reactstrap";
import "../index.css";

const pagesAround = 3;

const PageSelect = (props) => {
	return (
		<li className={`page-item ${props.active}`} key={`btn_page_${props.index}`}>
			<button className="page-link text-dark" onClick={props.onClick}>
				{props.index}
			</button>
		</li>
	);
};

const PaginationTable = (props) => {
	const [textSearch, setTextSearch] = useState("");

	const pagination = () => {
		if (props.currentPage && props.totalPages && props.handlePagination) {
			if (props.totalPages > 1) {
				const pages = [];

				pages.push(
					<li
						className={`page-item ${props.currentPage > 1 ? "" : "disabled"}`}
						key={"anterior_btn"}
					>
						<button
							className="page-link text-dark"
							onClick={() =>
								props.handlePagination(props.currentPage - 1, textSearch)
							}
							aria-label="Anterior"
						>
							<span aria-hidden="true">&laquo;</span>
							<span className="sr-only">Anterior</span>
						</button>
					</li>
				);
				pages.push(
					<PageSelect
						key={"first_page"}
						index={1}
						active={props.currentPage === 1 ? "active-dark" : ""}
						onClick={() => props.handlePagination(1, textSearch)}
					/>
				);
				if (
					props.totalPages > pagesAround &&
					props.currentPage - 1 > pagesAround + 1
				) {
					pages.push(
						<li className={`page-item disabled`}>
							<button className="page-link text-dark" aria-label="...">
								<span aria-hidden="true">...</span>
								<span className="sr-only">...</span>
							</button>
						</li>
					);
				}

				for (let index = 2; index < props.totalPages; index++) {
					if (
						index >= props.currentPage - pagesAround &&
						index <= props.currentPage + pagesAround
					) {
						pages.push(
							<PageSelect
								key={index}
								index={index}
								active={props.currentPage === index ? "active-dark" : ""}
								onClick={() => props.handlePagination(index, textSearch)}
							/>
						);
					}
				}

				if (
					props.currentPage < props.totalPages - pagesAround - 1 &&
					props.totalPages > pagesAround
				) {
					pages.push(
						<li className={`page-item disabled`} key={"btn_etc_next"}>
							<button className="page-link text-dark" aria-label="...">
								<span aria-hidden="true">...</span>
								<span className="sr-only">...</span>
							</button>
						</li>
					);
				}
				pages.push(
					<PageSelect
						key={"last_page"}
						index={props.totalPages}
						active={props.currentPage === props.totalPages ? "active-dark" : ""}
						onClick={() => props.handlePagination(props.totalPages, textSearch)}
					/>
				);
				pages.push(
					<li
						className={`page-item ${
							props.currentPage !== props.totalPages ? "" : "disabled"
						}`}
						key={"proximo_btn"}
					>
						<button
							className="page-link text-dark"
							onClick={() =>
								props.handlePagination(props.currentPage + 1, textSearch)
							}
							aria-label="Próximo"
						>
							<span aria-hidden="true">&raquo;</span>
							<span className="sr-only">Próximo</span>
						</button>
					</li>
				);

				return (
					<Row>
						<Col>
							<div className="table-responsive-lg">
								<nav aria-label="Page navigation">
									<ul className="pagination justify-content-center">{pages}</ul>
								</nav>
							</div>
						</Col>
					</Row>
				);
			}
		} else {
			return null;
		}
	};

	const handleSearch = async (event) => {
		event.preventDefault();
		setTextSearch(event.target.value);
	};

	const submitSearch = () => {
		props.handlePagination(props.currentPage, textSearch);
	};

	const noDataResponse = (
		<Row>
			<Col>
				<p className={"p-0 m-0 text-center"}>Nenhum dado a ser exibido.</p>
			</Col>
		</Row>
	);

	return (
		<>
			<Row className={"align-items-center mb-3"}>
				<Col>
					<InputGroup>
						<Input
							type="text"
							className="form-control"
							placeholder={props.placeholder}
							value={textSearch}
							onChange={handleSearch}
							onKeyDown={(event) =>
								event.key === "Enter" ? submitSearch() : null
							}
						/>
						<InputGroupAddon
							addonType={"append"}
							onClick={() => submitSearch()}
						>
							<InputGroupText>
								<i className="fa fa-search" />
							</InputGroupText>
						</InputGroupAddon>
					</InputGroup>
				</Col>
				<Col>
					{props.totalText && props.data.length > 0 && (
						<small className={"text-muted no-padding float-right mb-2"}>
							{props.totalText}
						</small>
					)}
				</Col>
			</Row>
			<Row>
				<Col>
					<div className="table-responsive-lg mb-3">
						<BootstrapTable
							keyField={props.keyField}
							data={props.data}
							columns={props.columns}
							striped
							hover
							headerClasses={"thead-dark"}
							noDataIndication={noDataResponse}
						/>
					</div>
				</Col>
			</Row>
			{pagination()}
		</>
	);
};

export default PaginationTable;
