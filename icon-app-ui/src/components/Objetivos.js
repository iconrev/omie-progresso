import React, { Component } from 'react';
import {
    Input,
} from 'reactstrap';

class Objetivos extends Component {

    constructor(props) {
        super(props);
        this.state = {
            readOnly: false
        }
    }

    componentDidMount() {
        if (this.props.readOnly) {
            this.setState({
                readOnly: this.props.readOnly
            });
        }
    }

    render() {
        return (
            <Input type="select" className="form-control" onChange={this.props.onChange} value={this.props.value} id={this.props.id} readOnly={this.state.readOnly} >
                <option value="UN">Selecione o tipo de objetivo</option>
                <option value="CS">Crescimento Sustentável da Receita</option>
                <option value="MR">Manutenção da Receita</option>
                <option value="OU">Outros...</option>
            </Input >
        )
    }
}

export default Objetivos