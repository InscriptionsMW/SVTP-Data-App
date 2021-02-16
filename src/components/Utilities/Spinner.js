import {BounceLoader} from "react-spinners";
const Spinner = (props) => (
    <div className="p-3 d-flex justify-content-center align-self-center">
        <BounceLoader
            size={80}
            color={"rgb(44, 102, 147)"}
            loading={props.loading}
        />
    </div>
)

export default Spinner;
