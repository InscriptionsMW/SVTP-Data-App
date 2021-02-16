import React, { Component } from 'react';
import 'jquery/dist/jquery.js'
import 'bootstrap/dist/css/bootstrap-grid.css'
import 'bootstrap/dist/js/bootstrap.js'
import 'popper.js'
import '../css/main.css';
class Body extends Component{
    constructor(props,context){
        super(props,context);
        this.state = {
            // data: this.props.data, 
        }
    }
    async componentDidUpdate(prevProps){
        if(this.props !== prevProps){
            this.setState({data: this.props.data})
        }
    }
    render(){
        return( 
            <div className = 'body-content'>
                <p>Content</p>
            </div>
        )
    }
}
export default Body;