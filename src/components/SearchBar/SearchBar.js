import React, { Component } from 'react'

export class SearchBar extends Component {
    render() {
        return (
            <div>
                <form className="searchBar">
                    <input type="text" onChange={this.props.handleChange} value={this.props.query} />
                    <button onClick={this.props.handleSubmit}>Submit</button>
                </form>
            </div>
        )
    }
}

export default SearchBar
