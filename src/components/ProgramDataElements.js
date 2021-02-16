import React, { Component } from 'react';
import Api from '../dhis/api'
import loading from '../img/loading.gif'
import CommonFunctions from '../functions/CommonFunctions'
import AddEdit from './AddEdit'

class ProgramDataElements extends Component{ 
    constructor(props,context){  
        super(props,context);
        this.state = {
            programId:this.props.match.params.programId,
            orgUnit: this.props.match.params.orgUnit,
            teiId:this.props.match.params.teiId,
            programName:'',
            formFields: [],
            events: [],
            loading : false,
            repeatable : false,
            eventsList : [],
            addEdit: false,
            blankEvent :'',
            hiddenField: ''
        }
        this.handleSubmit = this.handleSubmit.bind(this)
        this.onTodoChange = this.onTodoChange.bind(this)
        this.addViewEvent = this.addViewEvent.bind(this)
        this.changeViewStatus = this.changeViewStatus.bind(this)
        
    }
    async componentDidMount(){
        let completedEvents = []
        let progDataElements = await Api.getProgramDataElements(this.state.programId);
        let events = await Api.getTeiEvents(this.state.teiId);
        if (events.events.length > 1) {
            events.events.forEach(event => {
                if (event.dataValues.length == 0) {
                    this.setState({blankEvent:event.event});
                } else {
                    completedEvents.push(CommonFunctions.prepareEvent(event))                    
                }
            });
        } else {
            events.events.forEach(event => {
                if (event.dataValues.length == 0) {
                    this.setState({blankEvent:event.event});
                } else {
                    completedEvents.push(CommonFunctions.prepareEvent(event))              
                }
            });
        }

        this.setState({eventsList:completedEvents});
        this.setState({programId: progDataElements.id, programName:progDataElements.name, progDataElements: progDataElements, events: events, loading:false}) 
    }
    addViewEvent(eventId){
        let formFields = CommonFunctions.createFormField(this.state.progDataElements,eventId)
        //add data values if exist
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
        let hiddenField = eventId
        this.setState({formFields: formFields, hiddenField:hiddenField, loading:false})
    }      
    async handleSubmit(event){
        this.setState({loading:true})
        event.preventDefault()
        let dataToSave = [
            {
                orgUnit: this.state.events.events[0].orgUnit,
                program: this.state.events.events[0].program,
                programStage: this.state.events.events[0].programStage,
                status: "SCHEDULE",
                trackedEntityInstance:this.state.events.events[0].trackedEntityInstance,
                dataValues: []
            }
        ];
        let payload
        Array.prototype.forEach.call(event.target.elements, (element) => {
            if (element.id) {
                if(event.target.elements[0].id !== element.id){
                    payload = {
                        event: event.target.elements[0].value,
                        orgUnit: this.state.orgUnit,
                        program: this.state.programId,
                        programStage: this.state.events.events[0].programStage,
                        status: "COMPLETED",
                        trackedEntityInstance:this.state.teiId,
                        dataValues: []
                    }
                    payload.dataValues.push({
                        dataElement: element.id,
                        value: element.value,
                        providedEleseWhere: false
                    })
                    dataToSave.push(payload)
                }
            // } 
            }
        })
        console.log(dataToSave);

        if (dataToSave.length === 0) {
            
        } else {
            let saveValue
            for (let event of dataToSave) {
                if (event.dataValues.length == 0) {
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
        this.setState({loading:false})
    }
    onTodoChange(value){
        let tempFields = [...this.state.formFields]
            tempFields.forEach( (field,i) => { 
                        field.dataElements.forEach( (element, e) => {
                            if(value.id === element.id){
                                this.state.formFields[i].dataElements[e].value=value.value
                            }
                        });
                    });
        this.setState({formFields : tempFields})        
    }  
    changeViewStatus(event){
        this.addViewEvent(event)
        this.setState({addEdit: true})
    } 
    render(){   
        if (this.state.loading) { 
            return (
                <div className = 'body-content'> 
                    <div>
                        <img src = {loading} className = "loading" alt ="loading" />  
                    </div>
                </div>
            )
        } else {     
            return( 
                <div className = 'body-content'>
                    <h2>{this.state.programName}</h2>
                    <br></br>
                    <h4>Existing Plans</h4>
                    <table class="table table-striped">
                    <thead>                    
                      <tr>
                        <th scope="col">Created</th>
                        {/* <th scope="col">Event Date</th>   */}
                        <th scope="col">Completed By</th> 
                        <th scope="col"></th>                
                      </tr>
                    </thead>
                    <tbody>
                        {this.state.eventsList.map(event => (
                        <tr>                      
                            <td>{event.created}</td>
                            {/* <td>{event.eventDate}</td> */}
                            <td>{event.completedBy}</td>
                            <td><button class="btn btn-primary" onClick = {()=> this.changeViewStatus(event.event)}>View</button></td>
                        </tr>
                        ))}                              
                    </tbody>
                  </table>
                    <button class="btn btn-success" onClick = {()=> this.changeViewStatus(this.state.blankEvent)}>Add New Plan</button>
                    {this.state.addEdit? <AddEdit submit = {this.handleSubmit} onTodoChange = {this.onTodoChange}  eventId = {this.state.hiddenField} data = {this.state.formFields}/> :''}
                </div>
            )
        }
    }
}
export default ProgramDataElements;