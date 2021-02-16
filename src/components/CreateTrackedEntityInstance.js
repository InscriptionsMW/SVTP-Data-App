import React, {Component} from 'react';
import 'react-notifications/lib/notifications.css';
import {NotificationManager} from 'react-notifications';
import Api from '../dhis/api'
import CommonFunctions from '../functions/CommonFunctions'
import loading from '../img/loading.gif'
import Content from "./Layout/Content";
import {FaArrowCircleRight, FaArrowLeft, FaBookmark, FaPlus, FaSave} from "react-icons/fa";
import Spinner from "./Utilities/Spinner";
import {Link} from "react-router-dom";


// let orgUnit ='D4Cp0gQh0tc'
class CreateTrackedEntityInstance extends Component {
    constructor(props, context) {
        super(props, context);
        this.state = {
            ProgramStages: [],
            trackedEntityType: '',
            formFields: [],
            newId: '',
            loading: true,
            programId: this.props.match.params.programId,
            orgUnit: this.props.match.params.orgUnitId,
            previouslyLoadedPrograms: [],
            selectedProgram: {id: null, name: 'Loading..'}
        }
    }

    componentWillMount() {
        this.setSelectedProgram();
    }

    async componentDidMount() {
        let attributes = await Api.getTrackedEntityAttributtes(this.state.programId)
        this.setState({ProgramStages: attributes.programStages, trackedEntityType: attributes.trackedEntityType.id})
        let newId = await Api.getId()
        let formFeilds = []

        attributes.programTrackedEntityAttributes.forEach(element => {
            let temp = {}
            temp.id = element.trackedEntityAttribute.id
            temp.name = element.trackedEntityAttribute.formName
            temp.pos = element.sortOrder
            temp.valueType = element.trackedEntityAttribute.valueType == 'BOOLEAN' ? 'checkbox' : element.trackedEntityAttribute.valueType
            temp.optionSetValue = element.trackedEntityAttribute.optionSetValue
            temp.mandatory = element.mandatory ? 'required' : ''

            if (temp.optionSetValue) {
                temp.options = []

                element.trackedEntityAttribute.optionSet.options.forEach(option => {
                    let opTemp = {}
                    opTemp.code = option.code
                    opTemp.name = option.displayName
                    temp.options.push(opTemp)

                });
            }
            formFeilds.push(temp)

        });
        this.setState({formFields: formFeilds, newId: newId, loading: false})

    }

    handleSubmit = async (event) => {
        this.setState({loading: true})
        event.preventDefault()
        let trackedEntityType = this.state.trackedEntityType
        let programStages = this.state.ProgramStages
        let attributes = []

        Array.prototype.forEach.call(event.target.elements, (element) => {
            let temp = {}
            temp.attribute = element.id
            temp.value = element.value == "select option" ? '' : element.value
            if (temp.value == "" || temp.value == "on") {

            } else {
                attributes.push(temp)
                console.log(element.id, element.value);
            }
        })
        let createPayload = {
            "trackedEntityType": trackedEntityType,
            "orgUnit": this.state.orgUnit,
            "attributes": attributes
        }
        let createInstance = await Api.createTrackedEntity(createPayload)
        // get id
        let newCreatedInstanceId = createInstance.response.importSummaries[0].reference

        if (createInstance.httpStatus == "OK") {
            NotificationManager.success('saved');
            //enrollment
            let enrollmentLoad = {
                "trackedEntityInstance": newCreatedInstanceId,
                "program": this.state.programId,
                "status": "ACTIVE",
                "orgUnit": this.state.orgUnit,
                "enrollmentDate": CommonFunctions.getTodayData(),
                "incidentDate": CommonFunctions.getTodayData()
            }
            let enrollment = await Api.enrollment(enrollmentLoad)

            if (enrollment.httpStatus == "OK") {

                NotificationManager.success(' enrolled');
                let event = {"events": []}

                programStages.forEach(stage => {

                    let eventTemp = {
                        "trackedEntityInstance": newCreatedInstanceId,
                        "program": this.state.programId,
                        "programStage": stage.id,
                        "orgUnit": this.state.orgUnit,
                        "enrollment": enrollment.response.importSummaries[0].reference,
                        "dueDate": CommonFunctions.getTodayData(),
                        "status": "SCHEDULE"
                    }
                    event.events.push(eventTemp)
                })


                let eventResponse = await Api.scheduleEvents(event)

                if (eventResponse.httpStatus == "OK") {
                    // alert('saved')
                    this.props.history.replace('/program/' + this.state.programId + '/orgUnit/' + this.state.orgUnit + '/tei/' + newCreatedInstanceId + '/view', null);

                    NotificationManager.success(' savedd');

                } else {
                    NotificationManager.error(' not assign Assigned');
                    this.setState({loading: false})
                }

            } else if (enrollment.httpStatus == "Conflict") {
                NotificationManager.warning(' already Assigned');
                this.setState({loading: false})
            } else {
                NotificationManager.error(+' not  enrolled');
                this.setState({loading: false})
            }

        } else {
            NotificationManager.error(' not updated');
            this.setState({loading: false})
        }
    }

    setSelectedProgram() {
        let programs = JSON.parse(sessionStorage.getItem('programs'))
        this.setState({previouslyLoadedPrograms: [...programs]})
        let selectedProgram = programs.filter((item) => (item.id === this.state.programId))[0]
        if (selectedProgram)
            this.setState({selectedProgram})
        console.log(this.state.selectedProgram)
    }

    render() {
        if (this.state.loading) {
            return (
                <Content pageTitle={this.state.selectedProgram.name} pageIcon={<FaBookmark/>}>
                    <Spinner loading={true}/>
                </Content>

            )
        } else {
            return (
                <Content pageTitle={this.state.selectedProgram.name} pageIcon={<FaBookmark/>} toolbar={
                    <div>
                        <Link class="btn btn-outline-white m-2"
                              to={'/program/'+this.state.programId+'/orgUnit/'+this.state.orgUnit}><FaArrowLeft/> Back to All {this.state.selectedProgram.trackedEntityType.name.plural} View</Link>
                    </div>
                }>
                    <div className='container-fluid'>
                        <div className='p-3'>
                            <h5><FaArrowCircleRight/> CREATE {this.state.selectedProgram.trackedEntityType.name.singular.toUpperCase()}</h5>
                            <p>Enter the required information below.</p>
                            <form onSubmit={this.handleSubmit}>
                                {this.state.formFields.map((field, id) => (
                                    <div key={id} className="form-group d-flex flex-column">
                                        <label for={field.id} className="col-sm-4 col-form-label">{field.name}</label>
                                        <div className="col-sm-8">
                                            {field.optionSetValue ?
                                                <select
                                                    id={field.id}
                                                    className="form-control">
                                                <option>select option</option>
                                                {field.options.map((option, id) => (<option key={option.code}
                                                                                            value={option.code}>{option.name}</option>))}
                                            </select> : <input required={field.mandatory}
                                                               type={field.valueType}
                                                               className="form-control"
                                                               id={field.id} />}</div>
                                    </div>
                                ))}
                                <div className="form-group p-2 mt-4">
                                    <button className="btn btn-success mx-4" type="submit"><FaSave/> Save</button>
                                    <Link class="btn btn-white" to ={'/program/'+this.state.programId+'/orgUnit/'+this.state.orgUnit} >Cancel</Link>
                                </div>
                            </form>
                        </div>
                    </div>
                </Content>
            )
        }
    }
}

export default CreateTrackedEntityInstance;