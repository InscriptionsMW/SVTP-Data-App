import React, { Component } from 'react';
import Content from "./Layout/Content";
import {FaBookmark} from "react-icons/fa";
import Spinner from "./Utilities/Spinner";
import Api from "../dhis/api";
import {moduleConfigs} from "../dhis/config";
import _ from "lodash"

class AnnualWorkPlanBudget extends Component{
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
            tableRenderArray : []
        }
    }

    async componentDidMount(){
        this.setState({loading:true})

        let years = []
        let data = []
        let tableRenderArray = [];

        let trackedEntityMetadata = await Api.getTrackedEntityAttributtes(this.state.programId)
        let trackedEntityInstances = await Api.getTrackedEntityProgramDataPerOu(this.state.orgUnit,this.state.programId)
        console.log(trackedEntityInstances)
        let components = _.chain(trackedEntityInstances.trackedEntityInstances)
                            .groupBy((item)=> {
                                return _.find(item.attributes,['attribute', "XRgRDpeGdvj"]).value
                            })
                            .toPairs()
                            .map(pair => _.zipObject(['name', 'data'], pair))
                            .map(item => {return {name : item.name, id: "XRgRDpeGdvj", count: item.data.length}})
                            .value();
        let subComponents = _.chain(trackedEntityInstances.trackedEntityInstances)
                            .groupBy((item)=> {
                                return _.find(item.attributes,['attribute', "B3nn1X42fMS"]).value
                            })
                            .toPairs()
                            .map(pair => _.zipObject(['name', 'data'], pair))
                            .map(item => {return {name : item.name, component : "XRgRDpeGdvj", id : "B3nn1X42fMS", count: item.data.length}})
                            .value();
        let activities = _.chain(trackedEntityInstances.trackedEntityInstances)
                            .groupBy((item)=> {
                                return _.find(item.attributes,['attribute', "uHTPyDNqXRg"]).value
                            })
                            .toPairs()
                            .map(pair => _.zipObject(['name', 'data'], pair))
                            .map(item => {return {name : item.name, subComponent : "B3nn1X42fMS" , data : item.data}})
                            .value();

        components.forEach((component,i) => {
            let tempSubComp = subComponents.filter(item => item.component === component.id)
            tempSubComp.forEach((subComponent,j) => {
                let tempActivities = activities.filter(item => item.subComponent === subComponent.id)
                tempActivities.forEach((activity,k) => {
                    let sortedData = activity.data
                    sortedData.forEach((data,l) => {

                    tableRenderArray.push({
                        component : (j+k+l) === 0? component.count+"_"+component.name:false,
                        subComponent : (k+l) === 0 && subComponent.component === component.id? subComponent.count+"_"+subComponent.name : false,
                        activity : (l) === 0 && activity.subComponent === subComponent.id? activity.data.length+"_"+activity.name : false,
                        name :  _.find(data.attributes,['attribute',"srz1mRYjeHC"]).value,
                        description : _.find(data.attributes,['attribute',"Am0HpanQdqk"]).value,
                        code : ''
                    })
                    })

                })
            })
        })

        console.log(tableRenderArray)
        this.setState({trackedEntityMetadata:trackedEntityMetadata, tableRenderArray})

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
                        <ul className="nav nav-pills nav-stacked list-group list-group-flush card">
                            <div className="form-group">
                                <label htmlFor='year' className="form-label">Choose Year</label>
                                <select className="form-control" id="year" onChange={this.changeYear}>
                                    {this.state.tenYears.map((year, id)=> (
                                        <option value = {year.name}>{year.name}</option>
                                    ))}
                                </select>
                            </div>
                        </ul>

                        <br/>

                        {this.state.loadingYearData? <Spinner loading={true}/>
                            :
                            (<table  className="table table-sm table-bordered">
                                <thead>
                                <tr>
                                    <th className = 'groupSet' style={{width:"10"}}>
                                        Component
                                    </th>
                                    <th className = 'group' style={{width:"10%"}}>
                                        Sub Component
                                    </th>
                                    <th className = 'indicator' style={{width:"10%"}}>
                                        Activity
                                    </th>
                                    <th className = 'value' style={{width:"5%"}}>
                                        Code
                                    </th>
                                    <th className = 'value'>
                                        Name
                                    </th>
                                    <th className = 'value'>
                                        Description
                                    </th>
                                </tr>
                                </thead>
                                <tbody>
                                {this.state.tableRenderArray.map(item => (
                                    <tr>
                                        {item.component === false?'':(
                                            <td className = 'groupSet' rowSpan={item.component.split('_')[0]}> {item.component.split('_')[1]}</td>
                                        )}
                                        {item.subComponent === false?'':(
                                            <td className = 'groupSet' rowSpan={item.subComponent.split('_')[0]}> {item.subComponent.split('_')[1]}</td>
                                        )}

                                        {item.activity === false?'':(
                                            <td className = 'group' rowSpan={item.activity.split('_')[0]}> {item.activity.split('_')[1]}</td>
                                        )}
                                        <td className = 'indicator'> {item.code}</td>
                                        <td className = 'value'> {item.name}</td>
                                        <td className = 'value'> {item.description}</td>
                                    </tr>
                                ))}
                                </tbody>
                            </table>)
                        }
                    </div>
                </Content>
            )
        }
    }
}
export default AnnualWorkPlanBudget;