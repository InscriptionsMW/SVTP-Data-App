import Api from '../dhis/api'
class CommonFunctions {
    //get today date 
    getTodayData(){
        var today = new Date();
        var day = today.getDate().toLocaleString('en-US', {minimumIntegerDigits: 2, useGrouping:false});
        var month = (today.getMonth()+1).toLocaleString('en-US', {minimumIntegerDigits: 2, useGrouping:false});
        var year = today.getFullYear();
        return year+'-'+month+'-'+day
    }
    //split name
    splitName(name){
        let nameToSplit = name.split(" - ");
        return nameToSplit[nameToSplit.length -1];
    }
    
    camelCase (str){
        let  c =str.toLowerCase().split('_') 
        if(c.length == 1){
            return c[0]
        }
        else if(c.length == 2){
            return c[0]+(c[1].charAt(0).toUpperCase() + c[1].slice(1))
        }
        else{
            return c[0]+(c[1].charAt(0).toUpperCase() + c[1].slice(1))+(c[2].charAt(0).toUpperCase() + c[2].slice(1))
        }
    }
    prepareTei(teiInstances){
        let trackedEntityInstances = [];
        let name
         for (let i = 0; i < teiInstances.rows.length; i++) {
            if (teiInstances.rows[i][7] == "") {
                name = 'No Name'
            } else {
                name = teiInstances.rows[i][7]
            }
            trackedEntityInstances.push({'serial': i+1, 'id':teiInstances.rows[i][0],'name':name})
        }
        return trackedEntityInstances
    }
    convertDate(uTCDate){
        var d = new Date(uTCDate);
        return d.getUTCDate() +"-" +d.getUTCMonth()+"-" +d.getUTCFullYear()
    }

    createFormField(progDataElements){

        let formFields = []
        for (let i = 0; i < progDataElements.programStages.length; i++) {
            formFields.push({stageName: progDataElements.programStages[i].name ,stageId: progDataElements.programStages[i].id , dataElements: []})
            for (let y = 0; y < progDataElements.programStages[i].programStageDataElements.length; y++) {
                let valueType = progDataElements.programStages[i].programStageDataElements[y].dataElement.valueType;
                if (valueType === 'BOOLEAN' || valueType === 'TRUE_ONLY')
                    valueType = 'CHECKBOX'

                let temp = {
                    id:progDataElements.programStages[i].programStageDataElements[y].dataElement.id,
                    name: progDataElements.programStages[i].programStageDataElements[y].dataElement.formName,
                    valueType: valueType,
                    value : '',
                    optionSetValue : progDataElements.programStages[i].programStageDataElements[y].dataElement.optionSetValue,
                    mandatory : progDataElements.programStages[i].programStageDataElements[y].dataElement.compulsory?'required' : '',
                }

                if (temp.optionSetValue) {
                    temp.options = []
                    progDataElements.programStages[i].programStageDataElements[y].dataElement.optionSet.options.forEach(option => {
                        let opTemp = {}
                        opTemp.code = option.code
                        opTemp.name = option.displayName
                        temp.options.push(opTemp)
                    });
                }

                formFields[i].dataElements.push(temp)
            }
        }
        console.log(formFields)
        return formFields
    }
    prepareEvent(event, addMoreDetails = false){
        let eventDesc = {
            event:event.event,
            created:this.convertDate(event.created),
            eventDate:this.convertDate(event.eventDate),
            completedDate:this.convertDate(event.completedDate),
            completedBy: event.completedBy,
        }
        if (addMoreDetails){
            eventDesc.programStage = event.programStage
            eventDesc.dataValues = event.dataValues
        }
        return eventDesc
    }
};
export default new CommonFunctions();