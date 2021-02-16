import React, { Component } from 'react';
import 'jquery/dist/jquery.js'
import 'bootstrap/dist/css/bootstrap-grid.css'
import 'bootstrap/dist/js/bootstrap.js'
import 'popper.js'
import '../../css/footer.css';
class Footer extends Component{
    render(){
        return (
            <footer className="footer font-small blue">
                <div className="container">
                    <div className=" text-center py-3">© { new Date().getFullYear() } Copyright:
                        <a href="http://svtp.gov.mw" > Malawi Government</a>
                    </div>
                </div>
            </footer>
        )
    }
}
export default Footer;
 