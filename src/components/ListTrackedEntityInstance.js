import React, { Component } from 'react';
import logo from '../img/favicon.png'
import { BrowserRouter as Router, Switch, Route, Link,useParams } from 'react-router-dom';
import Api from '../dhis/api'
import loading from '../img/loading.gif'
import Spinner from "./Utilities/Spinner";
import Content from "./Layout/Content";
import {FaArrowCircleRight, FaArrowLeft, FaBookmark, FaCog, FaInfoCircle, FaMapMarkerAlt, FaPlus} from "react-icons/fa";
class ListTrackedEntityInstance extends Component{ 
    constructor(props,context){  
        super(props,context);
        this.state = {          
            trackedEntityType:'',
            formFields : [],
            newId :'',
            loading : true,
            listTitle :[],
            trackedEntityData:[],
            programId:this.props.match.params.programId,
            orgUnit: this.props.match.params.orgUnitId,
            previouslyLoadedPrograms : [],
            selectedProgram : { id : null, name : 'Loading..'}
        }
    }

    componentWillMount() {
        this.setSelectedProgram()
    }

    async componentDidMount(){

        let attributes = await Api.getTrackedEntityAttributtes(this.state.programId)
        let listTitle =[]
        attributes.programTrackedEntityAttributes.forEach(attribute =>{
          let listTemp ={}
          if (attribute.displayInList) {
            listTemp.id =attribute.trackedEntityAttribute.id
            listTemp.name =attribute.trackedEntityAttribute.formName
            listTitle.push(listTemp)          
          }
        })
        this.setState({listTitle:listTitle})
        // get tracked Entities with attribute
        let trackedEntities = await Api.getTrackedEntityProgramDataPerOu(this.state.orgUnit,this.state.programId)
        let trackedEntityData =[]
        trackedEntities.trackedEntityInstances.forEach(trackedEntiy =>{
          let entitytemp ={}
          entitytemp.id = trackedEntiy.trackedEntityInstance          

          listTitle.forEach(title => {
            entitytemp[title.id] =''
            trackedEntiy.attributes.forEach((entity,index)=>{
              if (entity.attribute == title.id) {
                entitytemp[title.id] = entity.value=='true'?'Yes':(entity.value =='false'?'No':entity.value)
                               
              }
            });
          })
          trackedEntityData.push(entitytemp)
        })

        this.setState({trackedEntityData:trackedEntityData, loading:false})
    }

    setSelectedProgram() {
        let programs = JSON.parse(sessionStorage.getItem('programs'))
        this.setState({previouslyLoadedPrograms : [...programs]})
        let selectedProgram = programs.filter((item)=>(item.id === this.state.programId))[0]
        console.log(selectedProgram)
        if (selectedProgram)
            this.setState({selectedProgram})
    }

    truncateString(str, num) {
        if (str.length <= num) {
            return str
        }
        return str.slice(0, num) + '...'
    }

    render(){   
      if (this.state.loading) { 
        return (
            <Content pageTitle={this.state.selectedProgram.name} pageIcon={<FaBookmark/>}>
                <Spinner loading={true}/>
            </Content>

          )
      } else {        
        return(
            <Content pageTitle={this.state.selectedProgram.name} pageIcon={<FaBookmark/>} toolbar={
                <div>
                    <Link class="btn btn-outline-white m-2"
                          to={'/'}><FaArrowLeft/> Back to Home</Link>
                    <Link class="btn btn-success" to ={'/program/'+this.state.programId+'/orgUnit/'+this.state.orgUnit+'/add'} ><FaPlus/> Add New {this.state.selectedProgram.trackedEntityType.name.singular} </Link>
                </div>
            }>
                <div className = 'container-fluid'>
                    <div className = 'p-3'>
                        <h5><FaArrowCircleRight/> All {this.state.selectedProgram.trackedEntityType.name.plural} ({this.state.trackedEntityData.length})</h5>
                        <p>Below is a list of all the {this.state.selectedProgram.trackedEntityType.name.plural} recorded.</p>
                        <table className="table table-hover">
                            <thead className="thead-light">
                                <tr>
                                    <th>#</th>
                                    {this.state.listTitle.map(title => (
                                        <th scope="col" style={{maxWidth:'100px'}}>{title.name}</th>
                                    ))}
                                    <th colSpan={2} style={{minWidth : '200px'}}>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                            {this.state.trackedEntityData.map((trackedEntity, index) => (
                                <tr>
                                    <td>{index+1}</td>
                                    {this.state.listTitle.map(title => (
                                        <td>  { this.truncateString(trackedEntity[title.id], 200)}</td>
                                    ))}
                                    <td><Link class="btn btn-primary btn-sm" to ={'/program/'+this.state.programId+'/orgUnit/'+this.state.orgUnit+'/tei/'+trackedEntity.id+'/view'} ><FaInfoCircle/> View</Link></td>
                                    <td><Link class="btn btn-info btn-sm" to={'/program/'+this.state.programId+'/orgUnit/'+this.state.orgUnit+'/tei/'+trackedEntity.id+'/stages'}><FaCog/> Stages</Link></td>
                                </tr>
                            ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </Content>
          )
        } 
    }
}
export default ListTrackedEntityInstance;