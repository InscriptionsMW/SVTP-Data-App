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
                return _.find(item.attributes,['attribute', "qsbfO1A8Dvk"]).value.split('.')[0]
            })
            .toPairs()
            .map(pair => _.zipObject(['name', 'data'], pair))
            .map(item => {
                let displayName = _.find(item.data[0].attributes,['attribute', "qsbfO1A8Dvk"]).value
                return {name : item.name, id: item.name.split('.')[0], count: item.data.length, displayName}
            })
            .value();

        let subComponents = _.chain(trackedEntityInstances.trackedEntityInstances)
            .groupBy((item)=> {
                return _.find(item.attributes,['attribute', "muxUIYNH02G"]).value.split(' ')[0]
            })
            .toPairs()
            .map(pair => _.zipObject(['name', 'data'], pair))
            .map(item => {
                let displayName = _.find(item.data[0].attributes,['attribute', "muxUIYNH02G"]).value
                return {name : item.name, component : item.name.split('.')[0], id : item.name, count: item.data.length, displayName}
            })
            .value();

        let activities = _.chain(trackedEntityInstances.trackedEntityInstances)
            .groupBy((item)=> {
                return _.find(item.attributes,['attribute', "JPE7YnmzsL2"]).value.split(' ')[0]
            })
            .toPairs()
            .map(pair => _.zipObject(['name', 'data'], pair))
            .map(item => {
                let displayName = _.find(item.data[0].attributes,['attribute', "JPE7YnmzsL2"]).value
                return {name : item.name, subComponent : item.name.split('.')[0]+"."+item.name.split('.')[1], id : item.name, data : item.data, displayName}
            })
            .value();

        let groupedComponents = components.map((component,i) => {
            let tempSubComp = subComponents.filter(itemI => itemI.component === component.id)
            component.subComponents = tempSubComp.map((subComponent,j) => {
                let tempActivities = activities.filter(itemJ => itemJ.subComponent === subComponent.id)
                subComponent.activities = tempActivities.map((activity,k) => {
                    activity.data =  _.sortBy(activity.data,obj => {
                        return _.find(obj.attributes,['attribute',"KrBo3cCP87C"]).value
                    })
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
            code: _.find(trackedEntityInstance.attributes,['attribute',"KrBo3cCP87C"]).value,
            name: _.find(trackedEntityInstance.attributes,['attribute',"cwCu0GzPD9Y"]).value,
            responsibility: this.getValueWhereProgramStageDataElement(events,"YPLRfFjwleq","cMHLsWbNte2") +', '+this.getValueWhereProgramStageDataElement(events,"YPLRfFjwleq","EtlxDGsnlnE"),
            july: this.getValueWhereProgramStageDataElement(events,"HKCpLpp7GTW","CrKAwUoKhCa"),
            august: this.getValueWhereProgramStageDataElement(events,"HKCpLpp7GTW","SOpYa4nIjuJ"),
            september: this.getValueWhereProgramStageDataElement(events,"HKCpLpp7GTW","tFjYta6n8Yc"),
            october: this.getValueWhereProgramStageDataElement(events,"HKCpLpp7GTW","G1QOusK9o08"),
            november: this.getValueWhereProgramStageDataElement(events,"HKCpLpp7GTW","pAdw0tlzjBV"),
            december: this.getValueWhereProgramStageDataElement(events,"HKCpLpp7GTW","FkiBRijrG2e"),
            january: this.getValueWhereProgramStageDataElement(events,"HKCpLpp7GTW","sDaCQ6f6YOD"),
            february: this.getValueWhereProgramStageDataElement(events,"HKCpLpp7GTW","y09y18XbB8k"),
            march: this.getValueWhereProgramStageDataElement(events,"HKCpLpp7GTW","Ad3q3FDYW1b"),
            april: this.getValueWhereProgramStageDataElement(events,"HKCpLpp7GTW","sBQRTCsCNUk"),
            may: this.getValueWhereProgramStageDataElement(events,"HKCpLpp7GTW","SMCMViP3vM8"),
            june: this.getValueWhereProgramStageDataElement(events,"HKCpLpp7GTW","U0raPYTyV8i"),
            monitoringIndicator: this.getValueWhereProgramStageDataElement(events,"UmXlNVaVKYU","K3sc76FtKOH"),
            target: this.getValueWhereProgramStageDataElement(events,"UmXlNVaVKYU","lvQaqAsCWgP"),
            ta: this.getValueWhereProgramStageDataElement(events,"OEVcANyMWhF","TsZAyGFSYSC"),
            goods: this.getValueWhereProgramStageDataElement(events,"OEVcANyMWhF","a3I9XB0O6rF"),
            works: this.getValueWhereProgramStageDataElement(events,"OEVcANyMWhF","ueygYIluJ47"),
            operational: this.getValueWhereProgramStageDataElement(events,"OEVcANyMWhF","fzi4xRTFfqB"),
            total_mwk: '',
            total_usd: '',
            balance_from_previous_work: this.getValueWhereProgramStageDataElement(events,"OEVcANyMWhF","BliyDpUQOfA"),
            total_budget_allocation: ''
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
                                                                        <th rowSpan="2">Code</th>
                                                                        <th rowSpan="2" style={{width:"20%"}}>Name</th>
                                                                        <th rowSpan="2" style={{width:"5%"}}>Responsibility</th>
                                                                        <th colSpan="12">Time Frame</th>
                                                                        <th colSpan="2" style={{width:"10%"}}>Output</th>
                                                                        <th colSpan="6">Budget Estimate</th>
                                                                        <th rowSpan="2">Balance from Previous Work</th>
                                                                        <th rowSpan="2">Total Budget Allocation</th>
                                                                    </tr>
                                                                    <tr>
                                                                        <th style={{width:"1%"}}>Jul</th>
                                                                        <th style={{width:"1%"}}>Aug</th>
                                                                        <th style={{width:"1%"}}>Sept</th>
                                                                        <th style={{width:"1%"}}>Oct</th>
                                                                        <th style={{width:"1%"}}>Nov</th>
                                                                        <th style={{width:"1%"}}>Dec</th>
                                                                        <th style={{width:"1%"}}>Jan</th>
                                                                        <th style={{width:"1%"}}>Feb</th>
                                                                        <th style={{width:"1%"}}>Mar</th>
                                                                        <th style={{width:"1%"}}>Apr</th>
                                                                        <th style={{width:"1%"}}>May</th>
                                                                        <th style={{width:"1%"}}>Jun</th>
                                                                        <th>Monitoring Indicator</th>
                                                                        <th>Target</th>
                                                                        <th>TA</th>
                                                                        <th>Goods</th>
                                                                        <th>Works</th>
                                                                        <th>Operational</th>
                                                                        <th>Total(MWK)</th>
                                                                        <th>Total(USD)</th>
                                                                    </tr>
                                                                    </thead>
                                                                    <tbody>
                                                                    {activity.data.map(item => (
                                                                        <tr>
                                                                            <td>{item.code}</td>
                                                                            <td>{item.name}</td>
                                                                            <td>{item.responsibility}</td>
                                                                            <td>{item.july}</td>
                                                                            <td>{item.august}</td>
                                                                            <td>{item.september}</td>
                                                                            <td>{item.october}</td>
                                                                            <td>{item.november}</td>
                                                                            <td>{item.december}</td>
                                                                            <td>{item.january}</td>
                                                                            <td>{item.february}</td>
                                                                            <td>{item.march}</td>
                                                                            <td>{item.april}</td>
                                                                            <td>{item.may}</td>
                                                                            <td>{item.june}</td>
                                                                            <td>{item.monitoringIndicator}</td>
                                                                            <td>{item.target}</td>
                                                                            <td>{item.ta}</td>
                                                                            <td>{item.goods}</td>
                                                                            <td>{item.works}</td>
                                                                            <td>{item.operational}</td>
                                                                            <td>{parseFloat(item.ta)+parseFloat(item.works)+parseFloat(item.goods)+parseFloat(item.operational)}</td>
                                                                            <td>{Math.round((parseFloat(item.ta)+parseFloat(item.works)+parseFloat(item.goods)+parseFloat(item.operational))/740)}</td>
                                                                            <td>{parseFloat(item.balance_from_previous_work)}</td>
                                                                            <td>{Math.round((parseFloat(item.ta)+parseFloat(item.works)+parseFloat(item.goods)+parseFloat(item.operational))/740)+parseFloat(item.balance_from_previous_work)}</td>
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