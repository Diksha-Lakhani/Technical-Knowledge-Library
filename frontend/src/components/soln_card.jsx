import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import './soln_card.css'

function SolnCard({ problem, sol }) {
    const navigate = useNavigate();
    const [isOpen, setIsOpen] = useState(false)
    const [success, setSuccess] = useState(false);
    const [error, setError] = useState(false);
    const [empid, setEmpid] = useState('');
    const [allowChange, setAllowChange] = useState(false);

    const update = { probId: problem.id, title: problem.title, descrip: problem.description, cat: problem.category, loc: problem.location, solnId: sol.id, soln: sol.description };

    useEffect(() => {
        const savedEmpid = sessionStorage.getItem("empid");
        if (savedEmpid) {
            setEmpid(savedEmpid);
        }
        if (savedEmpid == sol.solved_by) {
            setAllowChange(true);
        }
    }, []);

    async function handleUpdate() {
        navigate("/addProb", { state: { updateData: update, isUpdate: true } });
    }

    async function handleDelete() {
        setIsOpen(false);
        const response = await fetch('/api/deleteSolnReq', {
            method: 'POST',
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ solnId: String(sol.id), empid: empid, probId: String(problem.id) })
        });

        const data = await response.json()

        if (data.success == true) {
            setError(false);
            setSuccess(true);
        } else {
            setError(true);
            setSuccess(false);
        }
    }

    function attachmentNames(att) {
        if (!att) return '';
        const list = Array.isArray(att) ? att : [att]
        if (list.length === 0) return '';

        return list.map((a, i) => {
            if (!a || !a.file_path) return null;

            const normalized = a.file_path.replace(/\\/g, '/');     //converts backslash to forawrd slash
            const filename = normalized.substring(normalized.lastIndexOf('/') + 1);     //gets the filename from last slash
            const url = `/api/attachments/${filename}`;

            return (
                <span key={i}>
                    <a href={url} target="_blank" rel="noopener noreferrer">
                        {a.original_name || filename}
                    </a> 
                    {i < list.length - 1 ? ', ' : ''}       {/*adds comma between files*/}
                </span>
            );
        });
    }

    return (
        <div className="SolnCardContainer">
            <div className="solution_body">
                <div className="loc"><p>Location: {sol.location} </p></div>
                <div className="solved_by" style={{textTransform:'capitalize'}}>Solved By: {sol.name}</div>
                <div className="solution">Solution: {sol.description} </div>
                {sol.file_path && <div className="attachment">Attachment: </div>}
                <div className="solved_at">Solved on: {sol.solved_at} </div>
                {sol.attachments && sol.attachments.length > 0 && (<div className="attachment">
                    Attachment: {attachmentNames(sol.attachments)}
                </div>)}
                {allowChange && <div className="update_del">
                    <button type="button" className='updateBtn' onClick={handleUpdate}>Update</button>
                    <button type="button" className='deleteBtn' onClick={() => setIsOpen(true)}>Delete</button>
                </div>}
            </div>
            {isOpen && <div className="deleteConfirm">
                <div className="backdrop" onClick={() => setIsOpen(false)}></div>
                <div className="dialog">
                    <h2> Are you sure you want to delete this solution? </h2>
                    <div className="confirm">
                        <button type="button" onClick={handleDelete} className="btn"> Yes </button>
                        <button type="button" onClick={() => { setIsOpen(false) }} className="btn"> No </button>
                    </div>
                </div>
            </div>}

            {success && <div className="successMessageSoln">Request sent to admin successfully.</div>}
            {error && <div className="errorMessage">There was issue sending the request. Please try in some time</div>}
        </div>
    )
}

export default SolnCard;