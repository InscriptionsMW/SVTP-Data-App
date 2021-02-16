import React, { Component } from 'react';
import Api from '../dhis/api'
import loading from '../img/loading.gif'
import CommonFunctions from '../functions/CommonFunctions'
import {FaSave} from "react-icons/all";

class AddEdit extends Component{ 
    constructor(props,context){  
        super(props,context);
        this.state = {}

    }
    render(){
        return( 
            <form onSubmit={this.props.submit}>
                <hr/>
                {this.props.data.map((stage,sid) => (
                    <div>
                        <input type = "hidden" id={this.props.eventId} name="eventId" />
                        {stage.dataElements.map((dataElement, dataElementId) => (
                            /*<div key = {dataElementId} className="form-group">
                                <label for={dataElement.id}>{dataElement.name}</label>
                                <div>
                                    <input required={dataElement.mandatory} type={dataElement.valueType} className="form-control" id={dataElement.id} value = {dataElement.value ===''?'':dataElement.value} onChange={e => this.props.onTodoChange(e.target)} />
                                </div>
                            </div>*/

                            <div key={dataElementId} className="form-group d-flex flex-column">
                                <label htmlFor={dataElement.id} className="col-sm-4 col-form-label">{dataElement.name}</label>
                                <div className="col-sm-8">
                                {dataElement.optionSetValue ?
                                    <select
                                        id={dataElement.id}
                                        className="form-control"
                                        defaultValue={dataElement.value}
                                        onChange={e => this.props.onTodoChange(e.target,)}>
                                        <option>select option</option>
                                        {dataElement.options.map((option, id) => (
                                            <option key={option.code} value={option.code}>{option.name}</option>
                                        ))}
                                    </select> : [
                                                dataElement.valueType === 'CHECKBOX'?
                                                <input required={dataElement.mandatory}
                                                       type={dataElement.valueType}
                                                       className="form-control"
                                                       id={dataElement.id}
                                                       value={true}
                                                       onChange={e => this.props.onTodoChange(e.target, true)}
                                                       defaultChecked={Boolean(dataElement.valueType === 'CHECKBOX' && dataElement.value)}
                                                />:
                                                <input required={dataElement.mandatory}
                                                       type={dataElement.valueType}
                                                       className="form-control"
                                                       id={dataElement.id}
                                                       value={dataElement.value}
                                                       onChange={e => this.props.onTodoChange(e.target)}
                                                />]
                                }</div>
                            </div>
                        ))}
                    </div>
                ))}
                <div className="form-group d-flex justify-content-end">
                    <button className="btn btn-success" type="submit"><FaSave/> Save</button>
                    {this.props.showCancel?<button className="btn btn-light" onClick={this.props.cancel} type="button">Cancel</button>:''}
                </div>
            </form>
        )
    }
}

export default AddEdit;