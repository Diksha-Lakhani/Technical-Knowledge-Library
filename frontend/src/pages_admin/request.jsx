import './request.css'
import Navbar from '../components/navbar';
import React, { useEffect, useState } from 'react';

function Request() {
    const [empid, setEmpid] = useState('')
    const [probSol, setProbSol] = useState([]);
    const [createSol, setCreateSol] = useState([]);
    const [updateSol, setUpdateSol] = useState([]);
    const [deleteSol, setDeleteSol] = useState([]);
    const [remarks, setRemarks] = useState({});

    const [reqsidebar, setReqsidebar] = useState({ "probsol": true, "createsol": true, "updatesol": true, "delsol": true })

    const [error, setError] = useState('');
    const [success, setSuccess] = useState(false);

    async function handleRequest() {
        setError('');
        try {
            const response = await fetch("/api/getReq", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({})
            });
            if (!response.ok) throw new Error();
            const data = await response.json();

            setProbSol(data.create_prob_sol || []);
            setCreateSol(data.create_sol || []);
            setUpdateSol(data.update_sol || []);
            setDeleteSol(data.delete_sol || []);
        } catch {
            setError('There was an error in retrieving contributions.');
        }
    }

    function attachmentNames(att) {
        if (!att) return '--';
        const list = Array.isArray(att) ? att : [att]
        if (list.length === 0) return '---';

        return list.map((a, i) => {
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

    useEffect(() => {
        const savedEmpid = sessionStorage.getItem("empid");
        if (savedEmpid) {
            setEmpid(savedEmpid);
        }
        handleRequest();
    }, [])

    async function handleReview(s, c) {
        const status = s;
        const contribution = c;
        try {
            const response = await fetch("/api/reviewReq", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ empid: empid, status: status, reqId: String(contribution.id), remarks: remarks[contribution.id] || '' })

            });
            if (!response.ok) throw new Error();
            const data = await response.json();

            if (data.success) {
                setSuccess(`Request ${status}`);
                handleRequest();
            } else {
                setError(data.message || 'Could not save the decision. Please try again in some time');
            }

        } catch {
            setError('There was an error in giving permission. Please try again in some time.');
        }
    }

    function handleSideBar(filter) {
        if (filter === 'all') {
            setReqsidebar({ "probsol": true, "createsol": true, "updatesol": true, "delsol": true });
        } else {
            setReqsidebar((prev) => {
                const nextState = Object.keys(prev).reduce((acc, key) => {
                    acc[key] = key === filter;
                    return acc;
                }, {});
                return nextState;
            });
        }
    };

    return (
        <div className="container contri">
            <Navbar />
            <div className="sidebar">
                <h2>Search by:</h2>

                <div className="sidebaritem" onClick={() => { handleSideBar('all') }}>All Request</div>
                <div className="sidebaritem" onClick={() => { handleSideBar('probsol') }}>Problem Solution Request</div>
                <div className="sidebaritem" onClick={() => { handleSideBar('createsol') }}>Create Solution Request</div>
                <div className="sidebaritem" onClick={() => { handleSideBar('updatesol') }}>Update Solution Request</div>
                <div className="sidebaritem" onClick={() => { handleSideBar('delsol') }}>Delete Solution Request</div>

            </div>

            <div className="main req">
                <h2>Requests</h2>
                {reqsidebar.probsol && probSol.length > 0 && <div className="probSol">
                    <h3>Problem Solution Request</h3>
                    <table>
                        <thead>
                            <tr>
                                <th>Problem</th>
                                <th>Description</th>
                                <th>Category</th>
                                <th>Location</th>
                                <th>Solution </th>
                                <th>Attachment</th>
                                <th>Requested By</th>
                                <th>Request At</th>
                            </tr>
                        </thead>
                        <tbody>
                            {/*  making the 2 trs as one with react.fragment because .map() can only contain one element */}
                            {probSol.map((contrib, index) => (

                                <React.Fragment key={contrib.id}>
                                    <tr>
                                        <td>{contrib.payload.title}</td>
                                        <td>{contrib.payload.descrip}</td>
                                        <td style={{ textTransform: 'capitalize' }}>{contrib.payload.cat}</td>
                                        <td style={{ textTransform: 'capitalize' }}>{contrib.payload.loc}</td>
                                        <td>{contrib.payload.soln}</td>
                                        <td>{attachmentNames(contrib.payload.attachment)}</td>
                                        <td style={{ textTransform: 'capitalize' }}>{contrib.name}</td>
                                        <td>{contrib.requested_at}</td>
                                    </tr>
                                    <tr>
                                        <td>Remarks</td>
                                        <td colSpan={5}><textarea className='remarksInput' name="remarks" id="remarks" value={remarks[contrib.id] || ''} onChange={(e) => setRemarks({ ...remarks, [contrib.id]: e.target.value })}></textarea></td>
                                        <td><button className='approveBtn' type="button" onClick={() => { handleReview('approved', contrib) }}>Approve</button></td>
                                        <td><button className='rejectBtn' type="button" onClick={() => { handleReview('rejected', contrib) }}>Reject</button></td>
                                    </tr>
                                </React.Fragment>
                            ))}
                        </tbody>
                    </table>
                </div>}


                {reqsidebar.createsol && createSol.length > 0 && <div className="probSol">
                    <h3>Create Solution Request</h3>
                    <table>
                        <thead>
                            <tr>
                                <th>Problem</th>
                                <th>Description</th>
                                <th>Category</th>
                                <th>Location</th>
                                <th>Solution </th>
                                <th>Attachment</th>
                                <th>Requested By</th>
                                <th>Request At</th>
                            </tr>
                        </thead>
                        <tbody>
                            {createSol.map((contrib, index) => (
                                <React.Fragment key={contrib.id}>
                                    <tr>
                                        <td>{contrib.title}</td>
                                        <td>{contrib.description}</td>
                                        <td style={{ textTransform: 'capitalize' }}>{contrib.category}</td>
                                        <td style={{ textTransform: 'capitalize' }}>{contrib.payload.loc}</td>
                                        <td>{contrib.payload.soln}</td>
                                        <td>{attachmentNames(contrib.payload.attachment)}</td>
                                        <td style={{ textTransform: 'capitalize' }}>{contrib.name}</td>
                                        <td>{contrib.requested_at}</td>
                                    </tr>
                                    <tr>
                                        <td>Remarks</td>
                                        <td colSpan={5}><textarea className='remarksInput' name="remarks" id="remarks" value={remarks[contrib.id] || ''} onChange={(e) => setRemarks({ ...remarks, [contrib.id]: e.target.value })}></textarea></td>
                                        <td><button className='approveBtn' type="button" onClick={() => { handleReview('approved', contrib) }}>Approve</button></td>
                                        <td><button className='rejectBtn' type="button" onClick={() => { handleReview('rejected', contrib) }}>Reject</button></td>
                                    </tr>
                                </React.Fragment>

                            ))}
                        </tbody>
                    </table>
                </div>}
                {reqsidebar.updatesol && updateSol.length > 0 && <div className="probSol">
                    <h3>Update Solution Request</h3>
                    <table>
                        <thead>
                            <tr>
                                <th>Problem</th>
                                <th>Description</th>
                                <th>Category</th>
                                <th>Location</th>
                                <th>Solution </th>
                                <th>Attachment</th>
                                <th>Requested By</th>
                                <th>Request At</th>
                            </tr>
                        </thead>
                        <tbody>
                            {updateSol.map((contrib, index) => (
                                <React.Fragment key={contrib.id}>
                                    <tr>
                                        <td>{contrib.title}</td>
                                        <td>{contrib.description}</td>
                                        <td style={{ textTransform: 'capitalize' }}>{contrib.category}</td>
                                        <td style={{ textTransform: 'capitalize' }}>{contrib.payload.loc}</td>
                                        <td>{contrib.payload.soln}</td>
                                        <td>{attachmentNames(contrib.payload.attachment)}</td>
                                        <td style={{ textTransform: 'capitalize' }}>{contrib.name}</td>

                                        <td>{contrib.requested_at}</td>
                                    </tr>
                                    <tr>
                                        <td>Remarks</td>
                                        <td colSpan={5}><textarea className='remarksInput' name="remarks" id="remarks" value={remarks[contrib.id] || ''} onChange={(e) => setRemarks({ ...remarks, [contrib.id]: e.target.value })}></textarea></td>
                                        <td><button className='approveBtn' type="button" onClick={() => { handleReview('approved', contrib) }}>Approve</button></td>
                                        <td><button className='rejectBtn' type="button" onClick={() => { handleReview('rejected', contrib) }}>Reject</button></td>
                                    </tr>
                                </React.Fragment>

                            ))}
                        </tbody>
                    </table>
                </div>}

                {reqsidebar.delsol && deleteSol.length > 0 && <div className="probSol">
                    <h3>Delete Solution Request</h3>
                    <table>
                        <thead>
                            <tr>
                                <th>Problem</th>
                                <th>Description</th>
                                <th>Category</th>
                                <th>Location</th>
                                <th>Solution </th>
                                <th>Attachment</th>
                                <th>Requested By</th>
                                <th>Request At</th>
                            </tr>
                        </thead>
                        <tbody>
                            {deleteSol.map((contrib, index) => (
                                <React.Fragment key={contrib.id}>
                                    <tr>
                                        <td>{contrib.title}</td>
                                        <td>{contrib.description}</td>
                                        <td style={{ textTransform: 'capitalize' }}>{contrib.category}</td>
                                        <td style={{ textTransform: 'capitalize' }}>{contrib.location}</td>
                                        <td>{contrib.solution}</td>
                                        <td>{attachmentNames(contrib.attachment)}</td>
                                        <td style={{ textTransform: 'capitalize' }}>{contrib.name}</td>
                                        <td>{contrib.requested_at}</td>
                                    </tr>
                                    <tr>
                                        <td>Remarks</td>
                                        <td colSpan={5}><textarea className='remarksInput' name="remarks" id="remarks" value={remarks[contrib.id] || ''} onChange={(e) => setRemarks({ ...remarks, [contrib.id]: e.target.value })}></textarea></td>
                                        <td><button className='approveBtn' type="button" onClick={() => { handleReview('approved', contrib) }}>Approve</button></td>
                                        <td><button className='rejectBtn' type="button" onClick={() => { handleReview('rejected', contrib) }}>Reject</button></td>
                                    </tr>
                                </React.Fragment>
                            ))}
                        </tbody>
                    </table>
                </div>}
                {error && <div className="errorMessage">error: {error}</div>}
                {success && <div className="successMessage">
                    <div className="backdrop" onClick={() => setSuccess(false)}></div>
                    <div className="dialog" style={{ backgroundColor: 'rgba(34, 197, 94, 0.35)', border: '1px solid rgba(34, 197, 94, 0.3)' }}>
                        <p style={{ color: '#4ade80' }}>success: {success}</p>
                    </div>
                </div>}
            </div>
        </div>
    );
}

export default Request;