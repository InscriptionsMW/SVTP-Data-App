import React, { Component } from "react";
import CheckboxTree from "react-checkbox-tree";
import "react-checkbox-tree/lib/react-checkbox-tree.css";
import loading from '../img/loading.gif'
import {
  MdCheckBox,
  MdCheckBoxOutlineBlank,
  MdChevronRight,
  MdKeyboardArrowDown,
  MdAddBox,
  MdIndeterminateCheckBox,
  MdFolder,
  MdFolderOpen,
  MdInsertDriveFile
} from "react-icons/md";
import Api from '../dhis/api'
import Spinner from "./Utilities/Spinner";
class organisationUnitsTree extends Component {
  constructor(props){
    super(props);
    this.state = {
      checked: this.props.selectedOu,
      expanded: [],
      ouLoading: true,
    };
}
async componentDidMount() {
  const data = await Api.getOrganisationUnits(); 
  this.setState({ data: data.organisationUnits , ouLoading:false})                     
}
updateOu(checked){
    this.setState({checked:checked})
    debugger
    // this.props.changeOu(checked)
}
  render() {
    const icons = {
      check: <MdCheckBox className="rct-icon rct-icon-check" />,
      uncheck: <MdCheckBoxOutlineBlank className="rct-icon rct-icon-uncheck" />,
      halfCheck: (
        <MdIndeterminateCheckBox className="rct-icon rct-icon-half-check" />
      ),
      expandClose: (
        <MdChevronRight className="rct-icon rct-icon-expand-close" />
      ),
      expandOpen: (
        <MdKeyboardArrowDown className="rct-icon rct-icon-expand-open" />
      ),
      expandAll: <MdAddBox className="rct-icon rct-icon-expand-all" />,
      collapseAll: (
        <MdIndeterminateCheckBox className="rct-icon rct-icon-collapse-all" />
      ),
      parentClose: <MdFolder className="rct-icon rct-icon-parent-close" />,
      parentOpen: <MdFolderOpen className="rct-icon rct-icon-parent-open" />,
      leaf: <MdInsertDriveFile className="rct-icon rct-icon-leaf-close" />
    };
if (this.state.ouLoading) {
  return (
      <Spinner loading={true}/>
    )
} else {
      return (
        <CheckboxTree
          nodes={this.state.data}
          // checked={this.state.checked}
          expanded={this.state.expanded}
          onCheck={checked =>this.props.handler(checked)}
          onExpand={expanded => this.setState({ expanded })}
          icons={icons}
          noCascade ={true}
        />
      );
    }
  }
}
export default organisationUnitsTree;
