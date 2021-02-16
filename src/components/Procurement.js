import React, { Component } from 'react';
import CreateTrackedEntityInstance from './CreateTrackedEntityInstance'
import ListTrackedEntityInstance from './ListTrackedEntityInstance'
import { Link } from 'react-router-dom';
class Procurement extends Component{ 
    constructor(props,context){  
        super(props,context);
        this.state = {
            data : {},
            loading : true
        }
    }
      
    render(){        
        return( 
            <div className = 'container'>
                <div className = 'row'>   
                    <p>Procurement </p>
                    <br></br>
                    <Link to ='/addTei'> <button class="btn btn-success" type="submit">Add </button>  </Link>
                    <ListTrackedEntityInstance/>               
                    
                </div>
                <br></br>
            </div>
        )
    }
}
export default Procurement;