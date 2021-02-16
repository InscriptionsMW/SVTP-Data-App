import React, {Component} from 'react';
import 'react-notifications/lib/notifications.css';
import {NotificationManager} from 'react-notifications';
import Api from '../dhis/api'
import CommonFunctions from '../functions/CommonFunctions'
import loading from '../img/loading.gif'
import Content from "./Layout/Content";
import {FaArrowCircleRight, FaArrowLeft, FaBookmark, FaSave} from "react-icons/fa";
import Spinner from "./Utilities/Spinner";
import {Link} from "react-router-dom";

class UpdateTrackedEntityInstance extends Component {
    constructor(props, context) {
        super(props, context);
        this.state = {
            ProgramStages: [],
            trackedEntityInstanceHead: {},
            trackedEntityType: '',
            formFields: [],
            newId: '',
            loading: true,
            programId: this.props.match.params.programId,
            orgUnit: this.props.match.params.orgUnitId,
            teiId: this.props.match.params.teiId,
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
        let trackedEntityInstanceDetails = await Api.getTrackedEntityProgramData(this.state.teiId, this.state.programId)
        let trackedEntityInstanceHead = Object.assign({}, trackedEntityInstanceDetails);
        delete trackedEntityInstanceHead.created
        delete trackedEntityInstanceHead.createdAtClient
        delete trackedEntityInstanceHead.lastUpdated
        delete trackedEntityInstanceHead.lastUpdatedAtClient

        delete trackedEntityInstanceHead.enrollments
        delete trackedEntityInstanceHead.attributes
        delete trackedEntityInstanceHead.relationships

        for (let index = 0; index < formFeilds.length; index++) {
            for (let x = 0; x < trackedEntityInstanceDetails.attributes.length; x++) {

                if (formFeilds[index].id == trackedEntityInstanceDetails.attributes[x].attribute && !formFeilds[index].optionSetValue) {
                    formFeilds[index].value = trackedEntityInstanceDetails.attributes[x].value
                }

                if (formFeilds[index].id == trackedEntityInstanceDetails.attributes[x].attribute && formFeilds[index].optionSetValue) {

                    formFeilds[index].value = trackedEntityInstanceDetails.attributes[x].value
                } else if (formFeilds[index].id !== trackedEntityInstanceDetails.attributes[x].attribute && x == trackedEntityInstanceDetails.attributes.length - 1) {

                }

            }

        }
        this.setState({
            formFields: formFeilds,
            newId: newId,
            trackedEntityInstanceHead: trackedEntityInstanceHead,
            loading: false
        })

    }

    handleSubmit = async (event) => {
        this.setState({loading: true})
        event.preventDefault()
        let attributes = []
        let trackedEntityInstancePayLoad = this.state.trackedEntityInstanceHead

        Array.prototype.forEach.call(event.target.elements, (element) => {
            let temp = {}
            temp.attribute = element.id
            temp.value = element.value == "select option" ? '' : element.value

            if (temp.value == "" || temp.value == "on") {

            } else {
                attributes.push(temp)
            }

        })
        trackedEntityInstancePayLoad.attributes = attributes
        let updateTrackedEntityInstance = await Api.updateTrackedEntityInstance(this.state.programId, trackedEntityInstancePayLoad)
        if (updateTrackedEntityInstance.httpStatus == 'OK') {
            this.props.history.replace('/program/' + this.state.programId + '/orgUnit/' + this.state.orgUnit + '/tei/' + this.state.teiId + '/view', null);

            // alert("Updated")

        } else {
            alert("something went wrong")
            this.setState({loading: false})
        }
    }

    onTodoChange(value) {
        let tempFields = [...this.state.formFields]
        tempFields.forEach((fieldElement, index) => {
            if (value.id == fieldElement.id) {
                this.state.formFields[index].value = value.value

            }
        })
        this.setState({formFields: tempFields})
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
                              to={'/program/' + this.state.programId + '/orgUnit/' + this.state.orgUnit + '/tei/' + this.state.teiId + '/view'}><FaArrowLeft/> Back to {this.state.selectedProgram.trackedEntityType.name.singular} View</Link>
                    </div>
                }>
                    <div className='container-fluid'>
                        <div className='p-3'>
                            <h5><FaArrowCircleRight/> UPDATE {this.state.selectedProgram.trackedEntityType.name.singular.toUpperCase()}</h5>
                            <p>Edit the {this.state.selectedProgram.trackedEntityType.name.singular} details recorded.</p>
                            <form onSubmit={this.handleSubmit}>
                                {this.state.formFields.map((field, id) => (
                                    <div key={id} className="form-group d-flex flex-column">
                                        <label for={field.id} className="col-sm-6 col-form-label">{field.name}</label>
                                        <div className="col-sm-6">
                                            {field.optionSetValue ? <select value={field.value} id={field.id}
                                                                            onChange={e => this.onTodoChange(e.target)}
                                                                            className="form-control">
                                                <option>select option</option>
                                                {field.options.map((option, id) => (<option key={option.code}
                                                                                            value={option.code}>{option.name}</option>))}
                                            </select> : <input required={field.mandatory} value={field.value}
                                                               type={field.valueType}
                                                               onChange={e => this.onTodoChange(e.target)}
                                                               className="form-control" id={field.id} />}</div>
                                    </div>
                                ))}
                                <div className="form-group p-2 mt-4">
                                    <button className="btn btn-success mx-4" type="submit"><FaSave/> Save</button>
                                    <Link class="btn btn-white" to ={'/program/'+this.state.programId+'/orgUnit/'+this.state.orgUnit+'/tei/'+this.state.teiId+'/view'} >Cancel</Link>
                                </div>
                            </form>
                        </div>
                    </div>
                </Content>
            )
        }
    }
}

export default UpdateTrackedEntityInstance;