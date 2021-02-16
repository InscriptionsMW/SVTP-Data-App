import React, { Component } from 'react';
import Api from '../dhis/api'
import loading from '../img/loading.gif'
import CommonFunctions from '../functions/CommonFunctions'
import AddEdit from './AddEdit'
import Content from "./Layout/Content";
import {FaArrowCircleRight, FaArrowLeft, FaBookmark, FaCog, FaEdit, FaInfoCircle, FaPlus} from "react-icons/fa";
import Spinner from "./Utilities/Spinner";
import {Collapse} from 'react-collapse';
import {Link} from "react-router-dom";
import {act} from "@testing-library/react";

class ProgramStages extends Component{
    constructor(props,context){  
        super(props,context);

        this.toggleClass = this.toggleClass.bind(this);

        this.state = {
            programId:this.props.match.params.programId,
            orgUnit: this.props.match.params.orgUnit,
            teiId:this.props.match.params.teiId,
            programName:'',
            program : {},
            programStages : [],
            formFields: [],
            events: [],
            loading : false,
            loadingTableData: false,
            loadingPostingData: false,
            repeatable : false,
            eventsList : [],
            addEdit: false,
            blankEvent :{},
            hiddenField: '',
            activeIndex: null,
            previouslyLoadedPrograms: [],
            selectedProgram: {id: null, name: 'Loading..'}
        }
        this.handleSubmit = this.handleSubmit.bind(this)
        this.handleCancel = this.handleCancel.bind(this)
        this.onTodoChange = this.onTodoChange.bind(this)
        this.addViewEvent = this.addViewEvent.bind(this)
        this.changeViewStatus = this.changeViewStatus.bind(this)
    }

    componentWillMount() {
        this.setSelectedProgram();
    }

    toggleClass(index, programStage,e) {
        if (!programStage.repeatable)
            this.changeViewStatus(this.getBlankEvent(programStage.id), programStage.id)

        this.setState({
            activeIndex: this.state.activeIndex === index ? null : index,
            addEdit: false
        });
    }

 /*   moreLess(index) {
        if (this.state.activeIndex === index) {
            return (
                <span>
          <i className="fas fa-angle-up" /> Less
        </span>
            );
        } else {
            return (
                <span>
          <i className="fas fa-angle-down" /> More
        </span>
            );
        }
    }*/

    async componentDidMount(){
        let completedEvents = []

        this.setState({ loadingTableData : true})

        let program = await Api.getProgramDataElements(this.state.programId);
        let events = await Api.getTeiEvents(this.state.teiId);
        if (events.events.length > 1) {
            events.events.forEach(event => {
                if (event.dataValues.length == 0) {
                    //this.setState({blankEvent:event.event});
                } else {
                    completedEvents.push(CommonFunctions.prepareEvent(event, true))
                }
            });
        } else {
            events.events.forEach(event => {
                if (event.dataValues.length == 0) {
                    //this.setState({blankEvent:event.event});
                } else {
                    completedEvents.push(CommonFunctions.prepareEvent(event, true))
                }
            });
        }

        this.setState({eventsList:completedEvents});
        this.setState({programId: program.id, programName:program.name, programStages: program.programStages, program : program, events: events, loading:false, loadingTableData : false})
    }
    getProgramStageEvents(programStageID){
        return this.state.eventsList.filter((event => event.programStage === programStageID));
    }
    getBlankEvent(programStageID, repeatable = false){
        let events = this.state.events.events.filter((event => event.programStage === programStageID))

        if (events.length > 0 && !repeatable)
            return  events[0]
        else{
            let emptyEvent = {
                program : this.state.programId,
                programStage : programStageID,
                orgUnit : this.state.orgUnit,
                trackedEntityInstance: this.state.teiId,
                event : null
            }

            this.setState({ blankEvent : emptyEvent})
            return emptyEvent
        }
    }
    addViewEvent(eventId, programStageID, emptyEvent = false){
        let formFields = CommonFunctions.createFormField(this.state.program).filter(field => field.stageId === programStageID);
        //add data values if exist

        if (!emptyEvent){
            this.state.events.events.forEach(event => {
                if (event.event === eventId) {
                    formFields.forEach( field => {
                        if(event.programStage === field.stageId){
                            event.dataValues.forEach(value => {
                                field.dataElements.forEach(element => {
                                    if(value.dataElement === element.id){
                                        element.value = value.value
                                    }
                                });
                            });
                        }
                    });
                }
            });
        }

        eventId = emptyEvent? this.state.blankEvent.event : eventId;

        this.setState({formFields: formFields, hiddenField:eventId, loading:false})
    }      
    async handleSubmit(event){
        this.setState({loadingPostingData:true})
        event.preventDefault()

        let activeEvent = this.state.events.events.filter(item => item.event === event.target.elements[0].id)[0]
        if(activeEvent === undefined)
            activeEvent = this.state.blankEvent

        let dataToSave = []

        if (!activeEvent) {
            dataToSave.push(
                {
                    orgUnit: activeEvent.orgUnit,
                    program: activeEvent.program,
                    programStage: activeEvent.programStage,
                    status: "SCHEDULE",
                    trackedEntityInstance: activeEvent.trackedEntityInstance,
                    dataValues: []
                }
            )
        }

        let payload
        let tempDataToSave = []

        Array.prototype.forEach.call(event.target.elements, (element) => {

            if (element.id) {
                if(activeEvent.event !== element.id){
                    payload = {
                        orgUnit: activeEvent.orgUnit,
                        program: activeEvent.program,
                        programStage: activeEvent.programStage,
                        status: "COMPLETED",
                        trackedEntityInstance:activeEvent.trackedEntityInstance,
                        dataValues: []
                    }

                    let value = element.value
                    if (element.type === "checkbox" && !element.checked)
                        value = ""

                    payload.dataValues.push({
                        dataElement: element.id,
                        value: value,
                        providedElseWhere: false
                    })
                    if (activeEvent.event) {
                        payload.event = activeEvent.event
                        dataToSave.push(payload)
                    }else
                    {
                        tempDataToSave.push(payload)
                    }
                }
            }
        })

        if (tempDataToSave.length > 0) {
            let aggregatedPayload = tempDataToSave[0]
            Array.prototype.forEach.call(tempDataToSave.slice(1,tempDataToSave.length), (payload) => {
                aggregatedPayload.dataValues.push(...payload.dataValues)
            })

            dataToSave.push(aggregatedPayload)
        }

        if (dataToSave.length === 0) {
            
        } else {
            let saveValue
            for (let event of dataToSave) {
                if (event.event === undefined) {
                    if (event.dataValues.length > 0)
                        event.status = "COMPLETED"
                    saveValue = await Api.scheduleEvents(event)
                } else {
                    saveValue = await Api.updateEventDataValue(event,event.event,event.dataValues[0].dataElement)
                } 
                let status = saveValue.response
                if (status.status === "SUCCESS") {
                    // this.props.history.replace('/program/'+this.props.match.params.programId+'/orgUnit/'+this.state.orgUnit+'/tei/'+this.state.teiId+'/addEditStage', null);
                } else {
                    alert("Something Went Wrong")
                    this.setState({loading:false})
                }
            }
        }
        this.componentDidMount()
        this.setState({loadingPostingData:false, addEdit : false})
    }

    handleCancel(){
        this.setState({addEdit:false})
    }

    onTodoChange(value, checkBox = false){
        let tempFields = [...this.state.formFields]
            tempFields.forEach( (field,i) => { 
                        field.dataElements.forEach( (element, e) => {
                            if(value.id === element.id){
                                if (value.type === "checkbox" && !value.checked)
                                    value.value = ""
                                this.state.formFields[i].dataElements[e].value=value.value
                            }
                        });
                    });
        console.log(tempFields)
        this.setState({formFields : tempFields})        
    }  
    changeViewStatus(event, programStageID, createFromEmptyEvent = false){
        this.addViewEvent(event.event, programStageID, createFromEmptyEvent)
        this.setState({addEdit: true})
    }
    setSelectedProgram() {
        let programs = JSON.parse(sessionStorage.getItem('programs'))
        this.setState({previouslyLoadedPrograms: [...programs]})
        let selectedProgram = programs.filter((item) => (item.id === this.state.programId))[0]
        if (selectedProgram)
            this.setState({selectedProgram})
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
                              to={'/program/' + this.state.programId + '/orgUnit/' + this.state.orgUnit + '/tei/' + this.state.teiId + '/view'}><FaArrowLeft/> Back to {this.state.selectedProgram.trackedEntityType.name.singular} View</Link>
                    </div>
                }>
                    <div className = 'body-content'>
                        <div className='p-3'>
                            <h5><FaArrowCircleRight/> All Program Stages & Data</h5>
                            <p>Below is a list of all the available {this.state.selectedProgram.name} stages and data collected. <br/>Click a stage to view its data.</p>

                            {this.state.loadingTableData?<Spinner loading={true}/>:
                                (
                                    <div className="list-group text-dark">
                                    {this.state.programStages.map((programStage, index) => (
                                        <div  className={'list-group-item'} key={index}>
                                            <a
                                                className={'d-flex w-100 justify-content-between '+(this.state.activeIndex === index?'text-primary text-decoration-none':'text-dark')}
                                                onClick={this.toggleClass.bind(this, index, programStage)}
                                                role="button"
                                            >
                                                <h6 className="mb-1">{programStage.name}</h6>
                                                <small></small>
                                            </a>
                                            <Collapse isOpened={this.state.activeIndex === index}>
                                                <div className="m-2">
                                                    <div className="d-flex justify-content-end">
                                                        {!this.state.addEdit && programStage.repeatable? <button className="btn btn-success btn-sm"
                                                                onClick={() => this.changeViewStatus(this.getBlankEvent(programStage.id, true), programStage.id, true)}
                                                        >
                                                            <FaPlus/> Add New Event
                                                        </button>:''}
                                                    </div>

                                                    <Collapse isOpened={this.state.addEdit  || !programStage.repeatable}>
                                                        <AddEdit
                                                            submit= {this.handleSubmit}
                                                            cancel={this.handleCancel }
                                                            onTodoChange = {this.onTodoChange}
                                                            eventId = {this.state.hiddenField}
                                                            data = {this.state.formFields}
                                                            showCancel = {programStage.repeatable}
                                                        />
                                                        {this.state.loadingPostingData?<Spinner loading={true}/>:''}
                                                    </Collapse>
                                                </div>
                                                {!this.state.addEdit && programStage.repeatable?<table className="table table-hover">
                                                    <thead className="bg-light">
                                                    <tr>
                                                        <th scope="col">#</th>

                                                        {programStage.programStageDataElements.slice(0,1).map(programStageDataElement=> (
                                                            <th>{programStageDataElement.dataElement.formName}</th>
                                                        ))}

                                                        <th scope="col">Created</th>
                                                        <th scope="col">Completed By</th>
                                                        <th scope="col">Actions</th>
                                                    </tr>
                                                    </thead>
                                                    <tbody>
                                                    {this.getProgramStageEvents(programStage.id).map((event,index) => (
                                                        <tr>
                                                            <td>{index+1}</td>

                                                            {event.dataValues.slice(0,1).map(dataValue => (
                                                                <td>{dataValue.value}</td>
                                                            ))}

                                                            <td>{event.created}</td>
                                                            {/* <td>{event.eventDate}</td> */}
                                                            <td>{event.completedBy}</td>
                                                            <td>
                                                                <button className="btn btn-primary btn-sm"
                                                                        onClick={() => this.changeViewStatus(event, programStage.id)}>
                                                                    <FaInfoCircle/> View
                                                                </button>
                                                            </td>
                                                        </tr>
                                                    ))}
                                                    </tbody>
                                                </table>:''}
                                            </Collapse>
                                        </div>
                                    ))}
                                </div>
                                )}
                        </div>
                    </div>
                </Content>
            )
        }
    }
}
export default ProgramStages;