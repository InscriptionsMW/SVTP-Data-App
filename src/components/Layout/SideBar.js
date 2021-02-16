import React, { Component } from 'react';
import 'jquery/dist/jquery.js'
import 'bootstrap/dist/css/bootstrap-grid.css'
import 'bootstrap/dist/js/bootstrap.js'
import 'popper.js'
import '../../css/header.css';
import logo from '../../img/favicon.png'
import { Link } from 'react-router-dom';

class SideBar extends Component{
    render(){
        return (
            <div id="sidebarMenu" className="bg-light p-5">
                {this.props.children}
            </div>
        )
    }
}
export default SideBar;