import React, { Component } from 'react';
import Content from "./../Layout/Content";
import {FaBookmark} from "react-icons/fa";
import Spinner from "./../Utilities/Spinner";
import Api from "../../dhis/api";
import {moduleConfigs} from "../../dhis/config";
import _ from "lodash"

class Index extends Component{
    constructor(props,context){
        super(props,context);
        this.changeYear = this.changeYear.bind(this);
        this.state = {
            data : {},
            loading : false,
            loadingYearData: false,
            tenYears : [],
            year : {},
            programId : moduleConfigs.annualWorkPlanBudget.program,
            orgUnit : moduleConfigs.annualWorkPlanBudget.orgUnit,
            trackedEntityMetadata : {},
            tableRenderArray : [],
            events : [],
            components : [
                {
                    name : '1',
                    subComponents : [
                        {
                            name : '1',
                            activities : [
                                {
                                    name : '1',
                                    data : [

                                    ]
                                }
                            ]
                        }
                    ]
                }
            ]
        }
    }

    async componentDidMount(){
        this.setState({loading:true})

        let years = []
        let tableRenderArray = [];
        let events = []
        let trackedEntityMetadata = await Api.getTrackedEntityAttributtes(this.state.programId)
        let trackedEntityInstances = await Api.getTrackedEntityProgramDataPerOu(this.state.orgUnit,this.state.programId)
        for (let i = 0; i < trackedEntityInstances.trackedEntityInstances.length; i++)
        {
            let trackedEntityInstanceEvents  = await Api.getTeiEvents(trackedEntityInstances.trackedEntityInstances[i].trackedEntityInstance)
            events.push({
                events : trackedEntityInstanceEvents.events,
                trackedEntityInstance : trackedEntityInstances.trackedEntityInstances[i].trackedEntityInstance
            })
        }
        this.setState({events : events})

        let components = _.chain(trackedEntityInstances.trackedEntityInstances)
            .groupBy((item)=> {
                return _.find(item.attributes,['attribute', "XRgRDpeGdvj"]).value.split('.')[0]
            })
            .toPairs()
            .map(pair => _.zipObject(['name', 'data'], pair))
            .map(item => {
                let displayName = _.find(item.data[0].attributes,['attribute', "XRgRDpeGdvj"]).value
                return {name : item.name, id: item.name.split('.')[0], count: item.data.length, displayName}
            })
            .value();

        let subComponents = _.chain(trackedEntityInstances.trackedEntityInstances)
            .groupBy((item)=> {
                return _.find(item.attributes,['attribute', "B3nn1X42fMS"]).value.split(' ')[0]
            })
            .toPairs()
            .map(pair => _.zipObject(['name', 'data'], pair))
            .map(item => {
                let displayName = _.find(item.data[0].attributes,['attribute', "B3nn1X42fMS"]).value
                return {name : item.name, component : item.name.split('.')[0], id : item.name, count: item.data.length, displayName}
            })
            .value();

        let activities = _.chain(trackedEntityInstances.trackedEntityInstances)
            .groupBy((item)=> {
                return _.find(item.attributes,['attribute', "uHTPyDNqXRg"]).value.split(' ')[0]
            })
            .toPairs()
            .map(pair => _.zipObject(['name', 'data'], pair))
            .map(item => {
                let displayName = _.find(item.data[0].attributes,['attribute', "uHTPyDNqXRg"]).value
                return {name : item.name, subComponent : item.name.split('.')[0]+"."+item.name.split('.')[1], id : item.name, data : item.data, displayName}
            })
            .value();

        let groupedComponents = components.map((component,i) => {
            let tempSubComp = subComponents.filter(itemI => itemI.component === component.id)
            component.subComponents = tempSubComp.map((subComponent,j) => {
                let tempActivities = activities.filter(itemJ => itemJ.subComponent === subComponent.id)
                subComponent.activities = tempActivities.map((activity,k) => {
                    /*activity.data =  _.sortBy(activity.data,obj => {
                        return _.find(obj.attributes,['attribute',"KrBo3cCP87C"]).value
                    })*/
                    activity.data = activity.data.map((obj) => {
                        return this.getTableRowValues(obj)
                    })
                    return activity
                })
                return subComponent
            })
            return component
        })

        this.setState({trackedEntityMetadata:trackedEntityMetadata, tableRenderArray, components : groupedComponents})

        const currentYear = (new Date()).getFullYear()
        for (let i = 0; i < 10; i++) {
            years.push({
                "id": currentYear-i,
                "name": currentYear-i
            });
        }
        this.setState({year:currentYear, tenYears:years})
        /*await this.runAnalytics(data, indicators, currentYear)*/

        this.setState({loading:false})
    }

    changeYear(e){
        let selectedYr = e.target.value
        this.setState({year:selectedYr})

        //this.runAnalytics(this.state.data, this.state.indicators, selectedYr)
    }

    getValueWhereProgramStageDataElement(events, programStage, dataElement)
    {
        let value = ''
        let requiredProgramStage = _.find(events, ['programStage',programStage]);
        if (requiredProgramStage)
        {
            let dataValue = _.find(requiredProgramStage.dataValues, ['dataElement',dataElement])
            value = dataValue? dataValue.value:''
        }
        return value
    }

    getTableRowValues(trackedEntityInstance){
        let events  = _.find(this.state.events, ['trackedEntityInstance', trackedEntityInstance.trackedEntityInstance]).events

        return  {
            name: _.find(trackedEntityInstance.attributes,['attribute',"srz1mRYjeHC"]).value,
            q1: this.getValueWhereProgramStageDataElement(events,"BNETYGygsy5","WqOWqihu2t2"),
            q2: this.getValueWhereProgramStageDataElement(events,"BNETYGygsy5","rrYQpI9jpzr"),
            q3: this.getValueWhereProgramStageDataElement(events,"BNETYGygsy5","xHetvMjEBZM"),
            q4: this.getValueWhereProgramStageDataElement(events,"BNETYGygsy5","QF46wE47q9w"),
            funding: this.getValueWhereProgramStageDataElement(events,"UkOEgATmsPk","hp0TAepDljJ"),
            monitoringIndicator: this.getValueWhereProgramStageDataElement(events,"JLeQ1IbD4Dw","UIvULEw4rV3"),
            baseline: this.getValueWhereProgramStageDataElement(events,"JLeQ1IbD4Dw","RblCl2tkr3E"),
            target: this.getValueWhereProgramStageDataElement(events,"JLeQ1IbD4Dw","ySSIHpWLb87"),
            achievement: this.getValueWhereProgramStageDataElement(events,"JLeQ1IbD4Dw","P8NOmBNCzah"),
            responsibility: this.getValueWhereProgramStageDataElement(events,"qkzFmZ2mz8z","C8smLLGQ3gy") +', '+this.getValueWhereProgramStageDataElement(events,"qkzFmZ2mz8z","nUwm9VX1fHz"),
            donor: this.getValueWhereProgramStageDataElement(events,"Mair6JZp2Ro","DcoPY8fhQ7s") +', '+this.getValueWhereProgramStageDataElement(events,"Mair6JZp2Ro","xk39Lfky3T9"),
        }
    }

    render(){
        if (this.state.loading) {
            return (
                <Content pageTitle={'Annual Work Plan & Budget'} pageIcon={<FaBookmark/>}>
                    <Spinner loading={true}/>
                </Content>
            )
        } else {
            return(
                <Content pageTitle={'Annual Work Plan & Budget'} pageIcon={<FaBookmark/>} >
                    <div className = 'content'>
                        {/*<ul className="nav nav-pills nav-stacked list-group list-group-flush card">
                            <div className="form-group">
                                <label htmlFor='year' className="form-label">Choose Year</label>
                                <select className="form-control" id="year" onChange={this.changeYear}>
                                    {this.state.tenYears.map((year, id)=> (
                                        <option value = {year.name}>{year.name}</option>
                                    ))}
                                </select>
                            </div>
                        </ul>*/}

                        <br/>

                        {this.state.loadingYearData? <Spinner loading={true}/>
                            :
                            (
                                <div className="container-fluid">
                                    {this.state.components.map(component => (
                                        <div>
                                            <h5>{component.displayName}</h5>
                                            {component.subComponents.map(subComponent => (
                                                <div className="pl-3">
                                                    <h6>{subComponent.displayName}</h6>
                                                    {subComponent.activities.map(activity => (
                                                        <div className="pl-3">
                                                            <p>{activity.displayName}</p>
                                                            <div>
                                                                <table className="table table-sm table-bordered">
                                                                    <thead className="font-weight-bold">
                                                                    <tr>
                                                                        <th rowSpan="2" style={{width:"30%"}}>Name</th>
                                                                        <th colSpan="4" style={{width:"30%"}}>Monitoring Indicator</th>
                                                                        <th colSpan="4" style={{width:"12%"}}>Time Frame</th>
                                                                        <th rowSpan="2" style={{width:"7%"}}>Funding</th>
                                                                        <th rowSpan="2" style={{width:"7%"}}>Donor</th>
                                                                        <th rowSpan="2" style={{width:"7%"}}>Responsibility</th>
                                                                    </tr>
                                                                    <tr>
                                                                        <th>Name</th>
                                                                        <th>Baseline</th>
                                                                        <th>Target</th>
                                                                        <th>Achievement</th>
                                                                        <th style={{width:"3%"}}>Q1</th>
                                                                        <th style={{width:"3%"}}>Q2</th>
                                                                        <th style={{width:"3%"}}>Q3</th>
                                                                        <th style={{width:"3%"}}>Q4</th>
                                                                    </tr>
                                                                    </thead>
                                                                    <tbody>
                                                                    {activity.data.map(item => (
                                                                        <tr>
                                                                            <td>{item.name}</td>
                                                                            <td>{item.monitoringIndicator}</td>
                                                                            <td>{item.baseline}</td>
                                                                            <td>{item.target}</td>
                                                                            <td>{item.achievement}</td>
                                                                            <td>{item.q1}</td>
                                                                            <td>{item.q2}</td>
                                                                            <td>{item.q3}</td>
                                                                            <td>{item.q4}</td>
                                                                            <td>{Math.round((parseFloat(item.funding)))}</td>
                                                                            <td>{item.donor}</td>
                                                                            <td>{item.responsibility}</td>
                                                                        </tr>
                                                                    ))}
                                                                    </tbody>
                                                                </table>
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                            ))}
                                        </div>
                                    ))}

                                </div>
                            )
                        }
                    </div>
                </Content>
            )
        }
    }
}
export default Index;