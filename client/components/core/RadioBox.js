import React, { Component } from "react";

class RadioBox extends Component {
    constructor(props) {
        super(props);
        this.state = {
            value: 0
        };
    }

    componentDidMount() {
        const { childRef } = this.props;
        childRef(this);
    }

    componentWillUnmount() {
        const { childRef } = this.props;
        childRef(undefined);
    }

    clearState() {
        this.setState({
            value: 0
        })
    }

    handleChange = event => {
        this.props.handleFilters(event.target.value);
        this.setState({ value: event.target.value });
    };
    
    render() {
        return this.props.prices.map((p, i) => {
            return(
                <div key={i}>
                    <input
                        checked={this.state.value == p._id} 
                        onChange={this.handleChange}
                        value={`${p._id}`}
                        name={p}
                        type="radio"
                        className="mr-2 ml-4"
                    />
                    <label className="form-check-label">{p.name}</label>
                </div>
            )
        });
    }
};

export default RadioBox;
