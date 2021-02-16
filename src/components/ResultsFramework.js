import React, { Component } from 'react';
import Api from '../dhis/api'
import '../css/resultsFramework.css';
import Content from "./Layout/Content";
import {FaBookmark, FaPlus} from "react-icons/fa";
import Spinner from "./Utilities/Spinner";

class ResultsFramework extends Component{ 
    constructor(props,context){  
        super(props,context);
        this.runAnalytics = this.runAnalytics.bind(this);
        this.changeYear = this.changeYear.bind(this);
        this.state = {          
            orgUnit:this.props.match.params.orgUnitId,
            indicators:[],
            period:'',
            data: [],
            loading: false,
            loadingYearData: false,
            tenYears : [],
            year : {},
            tableRenderArray : []
        }
    }
    async componentDidMount(){
        this.setState({loading:true})

        let years = []
        let data = []
        let indicators =[]
        let indicatorGroupSets = await Api.getIndicatorGroupSetGroups();
        let indicatorsGroups = await Api.getIndicators();

        for (let i = 0; i < indicatorGroupSets.indicatorGroupSets.length; i++) {
            data.push({
                id: indicatorGroupSets.indicatorGroupSets[i].id ,
                name: indicatorGroupSets.indicatorGroupSets[i].name.split('_').pop() ,
                Groups: [],
                totalIndicators : 0
            })
            for (let y = 0; y < indicatorGroupSets.indicatorGroupSets[i].indicatorGroups.length; y++) {
                data[i].Groups.push({
                     id:indicatorGroupSets.indicatorGroupSets[i].indicatorGroups[y].id,
                     name: indicatorGroupSets.indicatorGroupSets[i].indicatorGroups[y].name.split('_').pop(),
                     indicators : [],
                })
                for (let z = 0; z < indicatorsGroups.indicatorGroups.length; z++) {
                    if (indicatorGroupSets.indicatorGroupSets[i].indicatorGroups[y].id === indicatorsGroups.indicatorGroups[z].id) {
                        for (let t = 0; t < indicatorsGroups.indicatorGroups[z].indicators.length; t++) {
                            indicators.push(indicatorsGroups.indicatorGroups[z].indicators[t].id)
                            data[i].Groups[y].indicators.push({
                                id:indicatorsGroups.indicatorGroups[z].indicators[t].id,
                                name: indicatorsGroups.indicatorGroups[z].indicators[t].name.split('_').pop(),
                                value : ''
                            })

                        }
                    }
                }
                data[i].totalIndicators += data[i].Groups[y].indicators.length
            }
        }
        console.log(data)
        const currentYear = (new Date()).getFullYear()
        for (let i = 0; i < 10; i++) {
            years.push({
                "id": currentYear-i,
                "name": currentYear-i
            });
        }
        this.setState({year:currentYear, tenYears:years})
        await this.runAnalytics(data, indicators, currentYear)

        this.setState({loading:false})
    }
    async runAnalytics(data,indicators,year){
        this.setState({loadingYearData:true})
        let tableRenderArray = [];

        let analyticsData = await Api.getAnalyticsData(indicators.join(';'), this.state.orgUnit, year)
        console.log(analyticsData)
        for (let index = 0; index < data.length; index++) {
            for (let x = 0; x < data[index].Groups.length; x++) {
                for (let u = 0; u < data[index].Groups[x].indicators.length; u++) {
                    let matchedRow = analyticsData.rows.filter(element => {
                        return element[0] === data[index].Groups[x].indicators[u].id
                    })
                    if (matchedRow.length > 0)
                        data[index].Groups[x].indicators[u].value = matchedRow[0][2]
                    else
                        data[index].Groups[x].indicators[u].value = ''

                    tableRenderArray.push({
                        'groupSet' : (x+u) === 0? data[index].totalIndicators+"_"+data[index].name : false,
                        'group' : (u) === 0? data[index].Groups[x].indicators.length+"_"+data[index].Groups[x].name : false,
                        'indicator' : data[index].Groups[x].indicators[u].name,
                        'value' : data[index].Groups[x].indicators[u].value,
                    })
                }
            }
        }

        this.setState({data:data, indicators:indicators, tableRenderArray : tableRenderArray, loadingYearData:false});
    }
    changeYear(e){
        let selectedYr = e.target.value
        this.setState({year:selectedYr})

        this.runAnalytics(this.state.data, this.state.indicators, selectedYr)
    }
    render(){
        if (this.state.loading) {
            return (
                <Content pageTitle={'Results Framework'} pageIcon={<FaBookmark/>}>
                    <Spinner loading={true}/>
                </Content>

            )
        } else {
            return(
                <Content pageTitle={'Results Framework'} pageIcon={<FaBookmark/>} >
                    <div className = 'content'>
                        <ul className="nav nav-pills nav-stacked list-group list-group-flush card">
                            <div className="form-group">
                            <label for='year' className="form-label">Choose Year</label>
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
                            (<table  className="table table-hover table-bordered">
                                <thead>
                                    <tr>
                                        <th className = 'groupSet' >
                                            Result
                                        </th>
                                        <th className = 'group'>
                                            Key Performance Area
                                        </th>
                                         <th className = 'indicator'>
                                            Monitoring Indicator
                                        </th>
                                        <th className = 'value'>
                                            Actual Achievement for 1 Year
                                        </th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {this.state.tableRenderArray.map(item => (
                                        <tr>
                                            {item.groupSet === false?'':(
                                                <td className = 'groupSet' rowSpan={item.groupSet.split('_')[0]}> {item.groupSet.split('_')[1]}</td>
                                            )}
                                            {item.group === false?'':(
                                                <td className = 'group' rowSpan={item.group.split('_')[0]}> {item.group.split('_')[1]}</td>
                                            )}
                                            <td className = 'indicator'> {item.indicator}</td>
                                            <td className = 'value'> {item.value}</td>
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

export default ResultsFramework;