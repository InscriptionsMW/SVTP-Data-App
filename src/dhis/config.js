export const baseUrl = 'https://mis.svtp.gov.mw/svtpmis-dev/api/'
// export const baseUrl = 'https://svtp.inscriptionsmw.com/svtpmis-dev/api/'
// export const user ={name:admin}
export const basicAuth = 'Basic ' + btoa( 'admin:#@Dzungu20_!' );

//Household registration form program ID
export const program = 'Fa4Qu2iKB7G'

//app name
export const appName = 'Shire Valley Transformation Program'

export const moduleConfigs = {
    resultFramework : {
        orgUnit : 'D4Cp0gQh0tc',
        show : true
    },
    annualWorkPlanBudget : {
        program : 'WWgxaSHL3uV',
        orgUnit : 'D4Cp0gQh0tc',
        show : true
    }
}
