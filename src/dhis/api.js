
import {baseUrl, basicAuth, program} from './config';
class Api {
  getCustomPrograms(){
    let payload = "dataStore/activityTracker/programs.json"
    return getJSON(payload)
  }

  /*getCustomPrograms(){
    let payload = "dataStore/svtp_custom/svtp_custom.json"
    return getJSON(payload)
  }
  */
    getTrackedEntityAttributtes(id){
      let payload = "programs/"+id+".json?fields=id,name,trackedEntityType[id],programTrackedEntityAttributes[displayInList,mandatory,id,name,valueType,sortOrder,trackedEntityAttribute[id,name,valueType,formName,optionSetValue,optionSet[id,displayName,valueType,options[code,displayName,sortOrder]]]],programStages[id,name]"
      return getJSON(payload)
    }
    getId(){
      let payload = "system/id?limit=1"
      return getJSON(payload)
    }
    createTrackedEntity(trackedEntityInstances){
      let urlEndPoint ='trackedEntityInstances'
      return postJSON(urlEndPoint,trackedEntityInstances)
    }   
    getTrackedEntity(id){
      let payload = "trackedEntityInstances/"+id+".json"
      return getJSON(payload)
    }
    updateTrackedEntity(id,updatePayload){
      let url = "trackedEntityInstances/"+id
      return putJSON(url, updatePayload)
    }
    enrollment(enrollmentPayload){
      let url = "enrollments"
      return postJSON(url,enrollmentPayload)

    }
    scheduleEvents(eventPayload){
      let url = "events.json"
     return postJSON(url,eventPayload)

    }
    getOrganisationUnits(){
      let payload = 'organisationUnits.json?filter=level:eq:1&paging=false&fields=id~rename(value),name~rename(label),children[id~rename(value),name~rename(label),children[id~rename(value),name~rename(label),children[id~rename(value),name~rename(label),children[id~rename(value),name~rename(label),children[id~rename(value),name~rename(label)]]]]]'
        
      return getJSON(payload)
      // return nodes
    }
    getOrganisationUnit(id){
      let payload = 'organisationUnits/'+id+'.json?fields=id,name,programs[id,name]'
      return getJSON(payload)
      // return nodes
    }
    getTrackedEntityProgramData(tei,programId){
      let payload = "trackedEntityInstances/"+tei+".json?program="+programId+"&fields=*"
      return getJSON(payload)
    }
    getTrackedEntityProgramDataPerOu(orgUnitId,programId){
      let payload = "trackedEntityInstances.json?ou="+orgUnitId+"&program="+programId
      return getJSON(payload)
    }
    updateTrackedEntityInstance(programId,updatePayload){
      let url = "trackedEntityInstances/"+updatePayload.trackedEntityInstance+".json?program="+programId
      return putJSON(url, updatePayload)
    }

    //program stage
    getProgramDataElements(id){
      let payload = "30/programs/"+id+".json?fields=id,name,programStages[id,name,repeatable,programStageDataElements[id,compulsory,sortOrder,dataElement[id,formName,valueType,optionSetValue,optionSet[id,displayName,valueType,options[code,displayName,sortOrder]]]]]"
      return getJSON(payload)
    }
    //get program events
    getTeiEvents(tei){
      let payload = "30/events.json?trackedEntityInstance="+tei+"&fields=*"
      return getJSON(payload)
    }
    //add data element
    updateEventDataValue(payload,eventId,dataElement){
      let url = "30/events/"+eventId+"/"+dataElement
      return putJSON(url, payload)
    }
    //get indicator groupset and indicator group
    getIndicatorGroupSetGroups(){
      let payload = "30/indicatorGroupSets.json?fields=id,name,indicatorGroups[id,name]"
      return getJSON(payload)
    }
    //get indicator groupset and indicator group
    getIndicators(){
      let payload = "30/indicatorGroups.json?fields=id,name,indicators[id,name]&paging=false"
      return getJSON(payload)
    }
    //get data from analytics
    getAnalyticsData(dx,ou,pe){
      let payload = "31/analytics.json?dimension=dx:"+dx+"&dimension=ou:"+ou+"&filter=pe:"+pe+"&skipMeta=false&skipData=false"
      return getJSON(payload)
    }
  }

// Send GET request
async function getJSON(path) {
    return await fetch( `${baseUrl}/${path}`, {
      method: 'GET',
      credentials: 'include',
      mode: 'cors',
      headers: {
        'Authorization': basicAuth,
        'Accept': 'application/json',
      }
    } )
      .catch( error => error )
      .then( response => response.json() );
  };
  //post requst
  function postJSON(path,payload) {
    return fetch( `${baseUrl}/${path}`, {
      method: 'POST',
      credentials: 'include',
      mode: 'cors',
      
      body: JSON.stringify(payload),
      headers: {
        'Authorization': basicAuth,
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      }
    } )
      .catch( error => error )
      .then( response => response.json() );
  };
  //put request
  function putJSON(path,payload) {
    return fetch( `${baseUrl}/${path}`, {
      method: 'PUT',
      credentials: 'include',
      mode: 'cors',
      
      body: JSON.stringify(payload),
      headers: {
        'Authorization': basicAuth,
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      }
    } )
      .catch( error => error )
      .then( response => response.json() );
  };

  export default new Api();