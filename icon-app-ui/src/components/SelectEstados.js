import { Input } from "reactstrap";

const SelectEstados = (props) => {
	return (
		<Input type="select" {...props}>
			<option value="" />
			<option value="AC">Acre</option>
			<option value="AL">Alagoas</option>
			<option value="AM">Amazonas</option>
			<option value="AP">Amapá</option>
			<option value="BA">Bahia</option>
			<option value="CE">Ceará</option>
			<option value="DF">Distrito Federal</option>
			<option value="ES">Espírito Santo</option>
			<option value="GO">Goiás</option>
			<option value="MA">Maranhão</option>
			<option value="MG">Minas Gerais</option>
			<option value="MS">Mato Grosso do Sul</option>
			<option value="MT">Mato Grosso</option>
			<option value="PA">Pará</option>
			<option value="PB">Paraiba</option>
			<option value="PE">Pernambuco</option>
			<option value="PI">Piauí</option>
			<option value="PR">Paraná</option>
			<option value="RJ">Rio de Janeiro</option>
			<option value="RN">Rio Grande do Norte</option>
			<option value="RO">Rondônia</option>
			<option value="RR">Rorâima</option>
			<option value="RS">Rio Grande do Sul</option>
			<option value="SC">Santa Catarina</option>
			<option value="SE">Sergipe</option>
			<option value="SP">São Paulo</option>
			<option value="TO">Tocantins</option>
		</Input>
	);
};

export default SelectEstados;
