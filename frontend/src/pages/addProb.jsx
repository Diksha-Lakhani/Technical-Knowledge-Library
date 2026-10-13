import './addProb.css';
import { useEffect, useRef, useState } from 'react';
import Navbar from '../components/navbar';
import { useLocation, useNavigate } from 'react-router-dom';

function AddProb() {
    const navigate = useNavigate();
    const location = useLocation();
    const fileInputRef = useRef(null);

    const isCreateSol = location.state?.isCreateSol || false;
    const createSolData = location.state?.createSolData || null;
    const isUpdate = location.state?.isUpdate || false;
    const updateData = location.state?.updateData || null;

    const [empid, setEmpid] = useState('');
    const [solnChange, setSolnChange] = useState({ title: '', descrip: '', cat: '', loc: '', soln: '' });
    const [file, setFile] = useState([]);

    const [error, setError] = useState(false);
    const [successMessage, setSuccessMessage] = useState('');

    useEffect(() => {
        const savedEmpid = sessionStorage.getItem("empid");
        const location = sessionStorage.getItem("location");
        if (savedEmpid) {
            setEmpid(savedEmpid);
        }

        if (isUpdate) {
            setSolnChange({ title: updateData.title, descrip: updateData.descrip, cat: updateData.cat, loc: updateData.loc, soln: updateData.soln });
        } else if (isCreateSol) {
            setSolnChange({ title: createSolData.title, descrip: createSolData.descrip, cat: createSolData.cat, loc: createSolData.loc, soln: createSolData.soln });
        }else{
            setSolnChange(prev =>({...prev, loc: location}))
        }
    }, []);

    function handleFile(e) {
        const filesArray = Array.from(e.target.files);
        setFile(filesArray);
    }

    function handleRemove(i) {
        setFile((prevFiles) => {
            const updatedFiles = prevFiles.filter((_, index) => index !== i);
            if (fileInputRef.current) {
                const dataTransfer = new DataTransfer();
                updatedFiles.forEach((f) => dataTransfer.items.add(f));
                fileInputRef.current.files = dataTransfer.files;
            }
            return updatedFiles;
        });
    }

    function handleBack() {
        const targetId = updateData?.probId || createSolData?.probId
        if (isUpdate || isCreateSol) {
            navigate(`/viewProb/${targetId}`)
        } else {
            navigate("/home");
        }
    }

    function handleAction(e) {
        if (isUpdate) {
            handleUpdate(e);
        } else if (isCreateSol) {
            handleCreate(e);
        } else {
            handleSubmit(e);
        }
    }

    async function handleSubmit(e) {
        e.preventDefault();

        const formData = new FormData();
        formData.append("empid", empid);
        formData.append("solnChange", JSON.stringify(solnChange));
        if (file) {
            file.forEach((files) => {
                formData.append("attachment", files);
            });
        }

        const response = await fetch("/api/createProbSolnReq", {
            method: "POST",
            body: formData
        });

        const data = await response.json();

        if (data.success) {
            setError(false);
            setSuccessMessage(true);
            setSolnChange({ title: '', descrip: '', cat: '', loc: '', soln: '' });
            setFile([]);

        } else {
            setError(true);
            setSuccessMessage(false);
        }

    }

    async function handleUpdate(e) {
        e.preventDefault();

        const formData = new FormData();
        formData.append("empid", empid);
        formData.append("solnId", updateData.solnId);
        formData.append("solnChange", JSON.stringify({ soln: solnChange.soln, loc: solnChange.loc }));
        if (file) {
            file.forEach((files) => {
                formData.append("attachment", files);
            });
        }
        formData.append("probId", updateData?.probId);

        const response = await fetch("/api/updateSolnReq", {
            method: "POST",
            body: formData
        });

        const data = await response.json();

        if (data.success) {
            setError(false);
            setSuccessMessage(true);
            setSolnChange({ title: '', descrip: '', cat: '', loc: '', soln: '' });
            setFile([]);
            setTimeout(() => {
                handleBack();
            }, 1500);
        } else {
            setError(true);
            setSuccessMessage(false);
        }
    }

    async function handleCreate(e) {
        e.preventDefault();

        const formData = new FormData();
        formData.append("empid", empid);
        formData.append("solnChange", JSON.stringify({ soln: solnChange.soln, loc: solnChange.loc }));
        if (file) {
            file.forEach((files) => {
                formData.append("attachment", files);
            });
        }
        formData.append("probId", createSolData?.probId);

        const response = await fetch("/api/addSolnReq", {
            method: "POST",
            body: formData
        });

        const data = await response.json();

        if (data.success) {
            setError(false);
            setSuccessMessage(true);
            setSolnChange({ title: '', descrip: '', cat: '', loc: '', soln: '' });
            setFile([]);
            setTimeout(() => {
                handleBack();
            }, 1500);
        } else {
            setError(true);
            setSuccessMessage(false);
        }
    }


    return (
        <div className="container">
            <div className="addProb_form">

                <Navbar />

                <button type="button" className='backBtn' onClick={handleBack}>Back</button>

                <form className='formData' onSubmit={handleAction}>
                    <div className="textbox_prob">
                        <label htmlFor="prob">Problem Title: </label>
                        <input type="text" name="prob" id="prob" value={solnChange.title} onChange={(e) => setSolnChange({ ...solnChange, title: e.target.value })} required disabled={isUpdate || isCreateSol} />
                    </div>
                    <div className="textbox_prob">
                        <label htmlFor="descrip">Description</label>
                        <textarea name="descrip" id="descrip" value={solnChange.descrip} onChange={(e) => setSolnChange({ ...solnChange, descrip: e.target.value })} required disabled={isUpdate || isCreateSol}></textarea>
                    </div>
                    <div className="textbox_prob">
                        <label htmlFor="cat">Category: </label>
                        <select name="cat" id="cat" value={solnChange.cat} onChange={(e) => setSolnChange({ ...solnChange, cat: e.target.value })} required disabled={isUpdate || isCreateSol}>
                            <option value="" disabled>--Select a category--</option>
                            <option value="network">Network</option>
                            <option value="hardware">Hardware</option>
                            <option value="software">Software</option>
                            <option value="database">Database</option>
                            <option value="security">Securtiy</option>
                            <option value="cloud">Cloud</option>
                            <option value="others">Others</option>
                        </select>
                    </div>
                    <div className="textbox_prob">
                        <label htmlFor="location">Location: </label>
                        <select name="location" id="loacation" value={solnChange.loc} required disabled>
                            <option value="" disabled>--Select a category--</option>
                            <option value="noida">Noida</option>
                            <option value="sirohi">Sirohi</option>
                            <option value="durg">Durg</option>
                        </select>
                    </div>
                    <div className="textbox_prob">
                        <label htmlFor="solution">Solution</label>
                        <textarea name="solution" id="solution" value={solnChange.soln} onChange={(e) => setSolnChange({ ...solnChange, soln: e.target.value })} required>Solution: </textarea>
                    </div>
                    <div className="textbox_prob">
                        <label htmlFor="attachement">Attachment(if required): </label>
                        <input type="file" name="attachment" id="attachment" onChange={handleFile} multiple ref={fileInputRef} />
                        {file.length > 0 && <div className='fileList'>
                            <p>Selected Files:</p>
                            <table>
                                <thead>
                                    <tr>
                                        <th>File Name</th>
                                        <th>File Size</th>
                                        <th> Remove</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {file.map((files, index) => (
                                        <tr key={index}>
                                            <td>{files.name}</td>
                                            <td>{(files.size / 1024).toFixed(1)}KB</td>
                                            <td><button type="button" className='removeBtn' onClick={() => handleRemove(index)}>Remove</button></td>
                                        </tr>
                                    ))}
                                </tbody>

                            </table>
                        </div>}
                    </div>

                    <div className="addBtn">
                        <input type="submit" value={isUpdate ? "Update" : "Add"} />
                    </div>
                </form>
            </div>
            {error && <div className='errorMessage'>Error in saving. Try again in some time.</div>}
            {successMessage && <div className='successMessage'>
                <div className="backdrop" onClick={() => setSuccessMessage(false)}></div>
                <div className="dialog" style={{backgroundColor: 'rgba(34, 197, 94, 0.15)', border: '1px solid rgba(34, 197, 94, 0.3)'}}>
                    <h2 style={{color:'#4ade80'}}> Saved successfully! </h2>
                </div>
            </div>}
        </div>
    );
};

export default AddProb;