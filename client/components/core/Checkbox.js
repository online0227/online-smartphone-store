import React, { Component } from "react";

class Checkbox extends Component {
    constructor(props) {
        super(props);
        this.state = {
            checked: []
        };
    }

    componentDidMount() {
        const { childRef } = this.props;        childRef(this);
    }

    componentWillUnmount() {
        const { childRef } = this.props;
        childRef(undefined);
    }

    clearState() {
        this.setState({
            checked: []
        })
    }

    handleToggle = c => () => {
        const currentCategoryId = this.state.checked.indexOf(c);
        const newCheckedCategoryId = [...this.state.checked];

        if (currentCategoryId === -1) {
            newCheckedCategoryId.push(c);
        } else {
            newCheckedCategoryId.splice(currentCategoryId, 1);
        }

        this.setState({ checked: newCheckedCategoryId })
        this.props.handleFilters(newCheckedCategoryId);
    };

    render() {
        return this.props.categories.map((c, i) => (
            <li key={i} className="list-unstyled">
                <input
                    onChange={this.handleToggle(c.cid)}                    value={this.state.checked.indexOf(c.cid === -1)}
                    type="checkbox"
                    className="form-check-input"
                />
                <label className="form-check-label">{c.name}</label>
            </li>
        ));
    }
};

export default Checkbox;
