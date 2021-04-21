import React, { Component } from 'react';
import { Link } from 'react-router-dom';
import api from '../dhis/api';
import OrganisationUnitTree from './OrganisationUnitTree'
import Api from '../dhis/api'
import { program, moduleConfigs } from '../dhis/config';
import loading from '../img/loading.gif'
import Content from "./Layout/Content";
import SideBar from "./Layout/SideBar";
import { ClipLoader } from 'react-spinners'
import {FaMapMarkerAlt ,FaTable ,FaBookmark ,FaHome} from 'react-icons/fa'
import {MdApps} from 'react-icons/md'
import Spinner from "./Utilities/Spinner";


class MainBody extends Component{ 
    constructor(props,context){  
        super(props,context);
        this.onclickhandler = this.onclickhandler.bind(this);
        this.state = {
            data : {},
            loading : false,
            ouSelected:false,
            orgUnit:{},
            programs:[],
            loadingPrograms : false
        }
    }
    componentDidMount(){
        // CreateTrackedEntityInstance
    }
    async onclickhandler(e){
        this.setState({loadingPrograms:true} )
        let orgUnit = await Api.getOrganisationUnit(e[0])
        let custom = await Api.getCustomPrograms()
        console.log(custom)
        let ouSelected =false
        if(orgUnit){
            ouSelected =true
        }

        let displayProgram =[]
        custom.forEach(e=>{
            orgUnit.programs.forEach(x=>{
                if(e.id===x.id){
                    let temp ={}
                    temp.id =x.id
                    temp.name =x.name
                    temp.trackedEntityType =e.trackedEntityType

                    displayProgram.push(temp)
                }

            })

        })

        sessionStorage.setItem('programs',JSON.stringify(displayProgram))

        this.setState({orgUnit:{id:orgUnit.id,name:orgUnit.name},programs:displayProgram,ouSelected:ouSelected, loadingPrograms : false})
    }
    render(){   
        if (this.state.loading) { 
            return (
                <Content pageTitle="Home">
                    <ClipLoader
                        size={150}
                        color={"rgb(44, 102, 147)"}
                        loading={this.state.loading}
                    />
                </Content>
              )
        } else {       
            return(
                <Content pageTitle={'Home'} pageIcon={<FaHome/>}>
                    <div className = 'container-fluid'>
                        <div className = 'row'>
                            <div className = 'col-sm-3'>
                                <div className = 'p-3 h4'>
                                    <div className="h5 font-weight-light"> <FaMapMarkerAlt/> Organisation Unit: </div>
                                    {this.state.orgUnit.name}
                                </div>
                                <SideBar>
                                    <h6>Select an Organisation Unit Below:</h6>
                                    <div className="p-2">
                                        <OrganisationUnitTree handler ={this.onclickhandler}/>
                                    </div>
                                </SideBar>
                            </div>
                            <div className="col-sm-9">
                                <div className = 'p-3'>
                                    <div className="h5 font-weight-light"> <MdApps size={25}/> Modules</div>
                                    <p className="font-weight-light">Select a Module from the list of Modules available for the Organisation Unit selected</p>
                                </div>

                                {this.state.loadingPrograms?<Spinner loading={true}/>:
                                    (
                                        <div className="row">
                                            {this.state.programs.map(program => (
                                                <div className='col-sm-4'>
                                                    <Link to ={'/program/'+program.id +'/orgUnit/'+this.state.orgUnit.id} className="card-link text-blue">
                                                        <div className = 'card mb-3 shadow-hover' style={ {minHeight:'300px'}}>
                                                            <div className = "card-body d-flex flex-column justify-content-around align-items-center">
                                                                <div className = "card-text">
                                                                    <FaBookmark size={100}/>
                                                                </div>
                                                                <div className = "card-title h5 text-dark">{program.name}</div>
                                                            </div>
                                                        </div>
                                                    </Link>
                                                </div>
                                            ))}
                                            {moduleConfigs.resultFramework.show?(
                                                <div className='col-sm-4'>
                                                    <Link to ={'/result-framework/'+moduleConfigs.resultFramework.orgUnit} className="card-link text-blue">
                                                        <div className = 'card mb-3 shadow-hover' style={ {minHeight:'300px'}}>
                                                            <div className = "card-body d-flex flex-column justify-content-around align-items-center">
                                                                <div className = "card-text">
                                                                    <FaTable size={100}/>
                                                                </div>
                                                                <div className = "card-title h5 text-dark">Result Framework</div>
                                                            </div>
                                                        </div>
                                                    </Link>
                                                </div>
                                            ):''}
                                        </div>
                                    )
                                }
                            </div>
                        </div>
                    </div>
                </Content>
            )
        }
    }
}
export default MainBody;