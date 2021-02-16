import React, { Component } from 'react';
import 'jquery/dist/jquery.js'
import 'bootstrap/dist/css/bootstrap-grid.css'
import 'bootstrap/dist/js/bootstrap.js'
import 'popper.js'
import '../../css/header.css';
import logo from '../../img/favicon.png'
import { Link } from 'react-router-dom';

class Content extends Component{
    render(){
        return (
            <main role="main" className="col-md-12 ml-sm-auto col-lg-12 p-3 border" style={{minHeight:'85vh'}}>
                <div
                    className="d-flex justify-content-between flex-wrap flex-md-nowrap align-items-center pt-3 pb-2 mb-3 border-bottom">
                    <div className="h5">
                        <span>{this.props.pageIcon}</span> <span className="align-self-end">{ this.props.pageTitle }</span>
                    </div>


                    <div className="btn-toolbar mb-2 mb-md-0">
                        { this.props.toolbar }
                    </div>
                </div>

                { this.props.children }
            </main>
        )
    }
}
export default Content;