import React, {Component} from 'react';
import Api from '../dhis/api'
import {BrowserRouter as Router, Switch, Route, Link, useParams} from 'react-router-dom';
import loading from '../img/loading.gif'
import Content from "./Layout/Content";
import {FaArrowCircleRight, FaArrowLeft, FaBookmark, FaCog, FaEdit, FaPlus} from "react-icons/fa";
import Spinner from "./Utilities/Spinner";

class ViewTrackedEntityInstance extends Component {
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
        this.setState({formFields: formFeilds, loading: false,})
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
                              to={'/program/' + this.state.programId + '/orgUnit/' + this.state.orgUnit}><FaArrowLeft/> Back to All {this.state.selectedProgram.trackedEntityType.name.plural} View</Link>
                        <Link class="btn btn-warning m-2"
                              to={'/program/' + this.state.programId + '/orgUnit/' + this.state.orgUnit + '/tei/' + this.state.teiId + '/update'}><FaEdit/> Update</Link>
                        <Link class="btn btn-info m-2"
                              to={'/program/' + this.state.programId + '/orgUnit/' + this.state.orgUnit + '/tei/' + this.state.teiId + '/stages'}><FaCog/> Stages</Link>
                    </div>
                }>
                    <div className='body-content'>
                        <div className='p-3'>
                            <h5><FaArrowCircleRight/> VIEW {this.state.selectedProgram.trackedEntityType.name.singular.toUpperCase()}</h5>
                            <p>Below are the some important details for the  {this.state.selectedProgram.trackedEntityType.name.singular}</p>
                            <table className="table table-striped">
                                <thead>
                                </thead>
                                <tbody>
                                {this.state.formFields.map((field, id) => (
                                    <tr>
                                        <th>{field.name}</th>
                                        <td>{field.value}</td>
                                    </tr>))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </Content>
            )
        }
    }
}

export default ViewTrackedEntityInstance;