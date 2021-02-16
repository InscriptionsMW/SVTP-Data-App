import React, { Component } from 'react';
import 'jquery/dist/jquery.js'
import 'bootstrap/dist/css/bootstrap-grid.css'
import 'bootstrap/dist/js/bootstrap.js'
import 'popper.js'
import '../../css/header.css';
import logo from '../../img/favicon.png'
import { Link } from 'react-router-dom';
import SideBar from "./SideBar";
import Content from "./Content";
import Footer from "./Footer";
import Header from "./Header";

class Master extends Component{
    render(){
        return (
            <div className="container-fluid">
                {this.props.children}
            </div>
        )
    }
}
export default Master;