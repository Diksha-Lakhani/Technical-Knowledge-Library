import './viewProb.css';
import Navbar from '../components/navbar';
import { useNavigate, useParams } from 'react-router-dom';
import { useEffect, useRef, useState } from 'react';
import SolnCard from '../components/soln_card';

function ViewProb() {
    const { probId } = useParams();
    const navigate = useNavigate();
    const [isOpen, setIsOpen] = useState(false)
    const [role, setRole] = useState('');

    const [prob, setProb] = useState(null);
    const [soln, setSoln] = useState([]);
    const [error, setError] = useState(false);
    const [errorMessage, setErrorMessage] = useState('');
    const [success, setSuccess] = useState(false);
    const [update, setUpdate] = useState({ probId: '', title: '', descrip: '', cat: '', loc: '' })
    const hasLoggedId = useRef(null);

    async function handleView() {
        const response = await fetch("/api/getProb", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ probId: String(probId) })
        })

        const data = await response.json()

        if (data.prob && Array.isArray(data.soln)) {
            setProb(data.prob);
            setSoln(data.soln);
            setError(false);
            setUpdate({ probId: data.prob.id, title: data.prob.title, descrip: data.prob.description, cat: data.prob.category, loc: data.prob.location });
        } else {
            setError(true);
        }
    }

    async function handleDelete() {
        setIsOpen(false);
        const response = await fetch('/api/deleteProb', {
            method: 'POST',
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ probId: String(prob.id) })
        });

        const data = await response.json()

        if (data.success == true) {
            setError(false);
            setErrorMessage('');
            setSuccess(true);
            setTimeout(() => {
                navigate("/home");
            }, 1500);
        } else {
            setError(true);
            setErrorMessage(data.message);
            setSuccess(false);
        }
    }

    useEffect(() => {
        const savedRole = sessionStorage.getItem("role");
        if (savedRole) {
            setRole(savedRole);
        }
        if (hasLoggedId.current === probId) return;
        hasLoggedId.current = probId;
        handleView();
    }, [probId])

    function handleAddSoln() {
        navigate("/addProb", { state: { isCreateSol: true, createSolData: update } });
    }

    function handleBack() {
        navigate("/home");
    }

    return (
        <div className="container">
            <Navbar />
            {error && <div className='errorMessage'>
                {!errorMessage && <p>Error in fetching data. Try again in some time.</p>}
                {errorMessage && <div>Erorr: {errorMessage}</div>}
            </div>}
            {!error && prob &&
                <div className="prob_container">
                    <div className="backBox">
                        <button type="button" className='backBtn' onClick={handleBack}>Back</button>
                    </div>
                    <div className="problem_box">
                        <button type="button" className='addBtnView' onClick={handleAddSoln}>Add Solution</button>
                        <div className="problem">Problem: {prob.title}</div>
                        <div className="created_at">Created on: {prob.created_at}</div>
                        <div className="description">Description: {prob.description}</div>
                        <div className="cat_loc">
                            <div className="cat"><p>Category: {prob.category} </p></div>
                            <div className="loc"><p>Location: {prob.location} </p></div>
                        </div>
                        <div className="catLoc_sol">
                            <div className="sol_count">Solution Count: {prob.solution_count}</div>
                        </div>
                        {prob.solution_count == 0 && role=='admin' &&
                            <div className="delete" style={{ marginTop: '10px', display: 'flex', justifyContent: 'center' }}>
                                <button type="button" className='deleteBtn' style={{ padding: '10px 25px' }} onClick={() => setIsOpen(true)}>Delete</button>
                            </div>}
                        {isOpen && <div className="deleteConfirm">
                            <div className="backdrop" onClick={() => setIsOpen(false)}></div>
                            <div className="dialog">
                                <h2> Are you sure you want to delete this problem? </h2>
                                <div className="confirm">
                                    <button type="button" onClick={handleDelete} className="btn"> Yes </button>
                                    <button type="button" onClick={() => { setIsOpen(false) }} className="btn"> No </button>
                                </div>
                            </div>
                        </div>}
                    </div>

                    <div className="solution_box">
                        {soln.map((solution) => (
                            <SolnCard key={solution.id} problem={prob} sol={solution} />
                        ))}
                    </div>
                </div>}
                {success && <div className="successMessage">
                    <div className="backdrop" onClick={() => setSuccess(false)}></div>
                    <div className="dialog" style={{ backgroundColor: 'rgba(34, 197, 94, 0.35)', border: '1px solid rgba(34, 197, 94, 0.3)' }}>
                        <p style={{ color: '#4ade80' }}>success: {success}</p>
                    </div>
                </div>}
        </div>
    );
};

export default ViewProb;