import React, { Component } from 'react';
import 'jquery/dist/jquery.js'
import 'bootstrap/dist/css/bootstrap-grid.css'
import 'bootstrap/dist/js/bootstrap.js'
import 'popper.js'
import '../../css/header.css';
import logo from '../../img/favicon.png'
import logo2 from '../../img/malawi-logo.jpeg'
import { Link } from 'react-router-dom';
import {FaCogs} from "react-icons/fa";
import { program, moduleConfigs } from '../../dhis/config';

class Header extends Component{
    render(){
        return (
            <nav className="navbar navbar-expand-md  navbar-light">
                {/* <div className="font-weight-bold h4 btn btn-white btn-lg" style={{background:"gaisboro"}}><Link to="/"><FaCogs/> ACT</Link></div>*/}
                <Link to="/">
                    <img src={logo2} className="img-fluid" style={{width:"50px"}}/>
                </Link>


                <button className="navbar-toggler" type="button" data-toggle="collapse"
                        data-target="#navbarCollapse" aria-controls="navbarCollapse" aria-expanded="false"
                        aria-label="Toggle navigation">
                    <i className="navbar-toggler-icon"/>
                </button>
                <div className="collapse navbar-collapse" id="navbarCollapse">
                    <ul className="navbar-nav mr-auto align-self-center ">
                        <li className="nav-item active">
                            <Link to="/" className="nav-link">Home <span className="sr-only">(current)</span></Link>
                        </li>

                        {moduleConfigs.annualWorkPlanBudget.show?
                            <li className="nav-item">
                                <Link to="/annual-work-plan-budget" className="nav-link">Annual Work Plan & Budget  <span className="sr-only">(current)</span></Link>
                            </li>:''
                        }

                        {moduleConfigs.resultFramework.show?
                            <li className="nav-item">
                                <Link to={"/result-framework/"+moduleConfigs.resultFramework.orgUnit} className="nav-link">Result Framework  <span className="sr-only">(current)</span></Link>
                            </li>:''
                        }

                    </ul>
                </div>
            </nav>
        )
    }
}
export default Header;