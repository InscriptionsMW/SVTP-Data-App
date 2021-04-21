import './App.css';
import 'jquery/dist/jquery.js'
import 'bootstrap/dist/css/bootstrap-grid.css'
import 'bootstrap/dist/js/bootstrap.js'
import 'bootstrap/dist/css/bootstrap.min.css';
import './css/dashboard.css';
import 'popper.js'
import Header from './components/Layout/Header'
import Footer from './components/Layout/Footer'
import NotificationContainer from 'react-notifications';
import { HashRouter } from "react-router-dom";
import {Switch, Route } from 'react-router-dom';
import ResultsFramework from './components/ResultsFramework'
import MainBody from './components/MainBody';
import ViewTrackedEntityInstance from './components/ViewTrackedEntityInstance'
import ListTrackedEntityInstance from './components/ListTrackedEntityInstance'
import CreateTrackedEntityInstance from './components/CreateTrackedEntityInstance'
import UpdateTrackedEntityInstance from './components/UpdateTrackedEntityInstance'
import ProgramDataElements from './components/ProgramDataElements'
import Master from "./components/Layout/Master";
import ProgramStages from "./components/ProgramStages";
import AnnualWorkPlanBudget from "./components/AnnualWorkPlanBudget/Index";

const MyApp = () => (
    <Master>
        <HashRouter>
            <Header />
            <Switch>
                <Route exact path="/" component ={MainBody}/>
                <Route exact path="/annual-work-plan-budget" component={AnnualWorkPlanBudget} />
                <Route exact path="/result-framework/:orgUnitId" component ={ResultsFramework}/>
                <Route exact path="/program/:programId/orgUnit/:orgUnitId" component={ListTrackedEntityInstance} />
                <Route exact path="/program/:programId/orgUnit/:orgUnitId/add" component={CreateTrackedEntityInstance} />
                <Route exact path="/program/:programId/orgUnit/:orgUnitId/tei/:teiId/view" component={ViewTrackedEntityInstance} />
                <Route exact path="/program/:programId/orgUnit/:orgUnitId/tei/:teiId/update" component={UpdateTrackedEntityInstance} />
                <Route exact path="/addTei" component ={CreateTrackedEntityInstance}/>
                <Route exact path="/program/:programId/orgUnit/:orgUnit/tei/:teiId/stages" component={ProgramStages} />
                <Route exact path="/program/:programId/orgUnit/:orgUnit/tei/:teiId/addEditStage" component={ProgramDataElements} />
            </Switch>
            <Footer />
        </HashRouter>
        <NotificationContainer />
    </Master>
)

export default MyApp
