import './prob_card.css';
import { useNavigate } from "react-router-dom";

function Prob_card({ probId, title, descrip, sol_count, cat, loc }) {
    const navigate = useNavigate()
    function handleClick(){
        navigate(`/viewProb/${probId}` );
    }

    return (
        <div className="probCardContainer" onClick={handleClick}>
            <div className="prob">
                <h2> Problem: {title}</h2>
                <p> Description: {descrip}</p>
                <div className="cat_loc">
                    <p>Category: {cat}</p>
                    <p>Location: {loc}</p>
                </div>
            </div>
            <div className="soln_count_div">
                <div className="solution_count">Solutions: {sol_count}</div>
            </div>
        </div>
    );
};

export default Prob_card;