import './profile.css';
import { useEffect, useState } from 'react';
import Navbar from '../components/navbar';
import { useNavigate } from 'react-router-dom';

function Profile() {
    const navigate = useNavigate();

    const [theme, setTheme] = useState(() => localStorage.getItem('theme') === 'dark' ? 'dark' : 'light')
    const [activeTab, setActiveTab] = useState('info');
    const [error, setError] = useState('');
    const [success, setSuccess] = useState(false);

    const [empid, setEmpid] = useState('');
    const [info, setInfo] = useState(null);

    const [pass, setPass] = useState('');
    const [newPass, setNewPass] = useState('');

    const [probSol, setProbSol] = useState([]);
    const [createSol, setCreateSol] = useState([]);
    const [updateSol, setUpdateSol] = useState([]);
    const [deleteSol, setDeleteSol] = useState([]);

    const [probSolPending, setProbSolPending] = useState([]);
    const [createSolPending, setCreateSolPending] = useState([]);
    const [updateSolPending, setUpdateSolPending] = useState([]);
    const [deleteSolPending, setDeleteSolPending] = useState([]);


    useEffect(() => {
        const savedEmpid = sessionStorage.getItem("empid");
        if (savedEmpid) {
            setEmpid(savedEmpid);
            handleProfile(savedEmpid);
        }
    }, [])

    function toggleTheme() {
        const next = theme === 'light' ? 'dark' : 'light';
        document.documentElement.setAttribute('data-theme', next);
        localStorage.setItem('theme', next);
        setTheme(next);
    }

    async function handleProfile(id) {
        const response = await fetch("/api/viewProfile", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ empid: id })
        })
        const data = await response.json();

        if (data) {
            setError('');
            setInfo(data);
        } else {
            setError('Profile data not found. Please try in some time.');
        }
    }

    async function handleChangePass() {
        if (pass == info.password) {
            setError('');
            const response = await fetch("/api/changePass", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ empid: empid, password: newPass })
            });

            const data = await response.json();

            if (data.success) {
                setSuccess('Password Updated.');
                setError('');
                setPass('');
                setNewPass('');
            } else {
                setSuccess('');
                setError('Error occured during database connection. Try again in some time.');
                setPass('');
                setNewPass('');
            }
        } else {
            setSuccess('');
            setError('Current password is not correct. Please check again.');
            setPass('');
            setNewPass('');
        }
    }

    async function handleContri() {
        setActiveTab('contri');
        setError('');
        try {
            const response = await fetch("/api/viewContri", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ empid: empid })
            });
            if (!response.ok) throw new Error();
            const data = await response.json();

            if (data.length > 0) {
                setProbSol(data.filter((d) => { return d.request_type === 'create_prob_sol' }));
                setCreateSol(data.filter((d) => { return d.request_type === 'create_sol' }));
                setUpdateSol(data.filter((d) => { return d.request_type === 'update_sol' }));
                setDeleteSol(data.filter((d) => { return d.request_type === 'delete_sol' }));
            } else {
                setError('No contributions found');
            }
        } catch {
            setError('There was an error in retrieving contributions.');
        }

        try {
            const response = await fetch("/api/getReq", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ empid: empid })
            });
            if (!response.ok) throw new Error();
            const data = await response.json();

            if (data) {
                setProbSolPending(data.create_prob_sol || []);
                setCreateSolPending(data.create_sol || []);
                setUpdateSolPending(data.update_sol || []);
                setDeleteSolPending(data.delete_sol || []);
            } else {
                setError('No contributions found');
            }
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

    const handleTabSwitch = (tab) => {
        setActiveTab(tab);
        setError('');
        setSuccess('');
    };

    function handleLogout() {
        sessionStorage.removeItem("empid");
        navigate("/");
    }

    return (
        <div className="container">
            <Navbar />

            <div className="sidebar">
                <h2>Profile</h2>
                <button type="button" className='profileSideBar' onClick={() => handleTabSwitch('info')}>Information</button>
                <button type="button" className='profileSideBar' onClick={() => handleTabSwitch('pass')}>Change Password</button>
                <button type="button" className='profileSideBar' onClick={handleContri}>Contributions</button>
                <button type="button" className='profileSideBar logout' onClick={handleLogout}>Logout</button>
            </div>
            <div className="main">
                <br/>
                {activeTab == 'info' && <div className="info">
                    <h2>Your information</h2>
                    <div className="name">Name: {info?.name || ''}</div>
                    <div className="empid">Employee Id: {empid}</div>
                    <div className="role">Role: {info?.role || ''}</div>
                    <div className="location">Location: {info?.location || ''}</div>
                    <div className="mode">
                        Mode: {theme === 'dark' ? 'Dark' : 'Light'}
                        <button type="button" className="themeToggle" onClick={toggleTheme} aria-label="Toggle light and dark mode">
                            <span className={`themeToggleThumb ${theme === 'light' ? 'themeToggleThumbLight' : ''}`}></span>
                        </button>
                    </div>
                </div>}

                {activeTab == 'pass' && <div className="password">
                    <h2>Change password</h2>
                    <div className="currentPass">
                        <label htmlFor="currentPass">Enter current password: </label>
                        <input type="password" name="currentPass" id="currentPass" value={pass} onChange={(e) => { setPass(e.target.value) }} required />
                    </div>
                    <div className="newPass">
                        <label htmlFor="newPass">Enter new password: </label>
                        <input type="password" name="newPass" id="newPass" value={newPass} onChange={(e) => { setNewPass(e.target.value) }} required />
                    </div>
                    <button type="button" onClick={handleChangePass}>Change</button>

                </div>}

                {activeTab == 'contri' && <div className="contri">
                    <h2>Your contributions:</h2>

                    {(probSol.length > 0 || probSolPending.length > 0) && <div className="probSol">
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
                                    <th>Request At</th>
                                    <th>Reviewed By</th>
                                    <th>Reviewed At</th>
                                    <th>Status</th>
                                    <th>Remarks</th>
                                </tr>
                            </thead>
                            <tbody>
                                {probSol.map((contrib, index) => (
                                    <tr key={index}>
                                        <td>{contrib.prob_title}</td>
                                        <td>{contrib.prob_descrip}</td>
                                        <td style={{ textTransform: 'capitalize' }}>{contrib.category}</td>
                                        <td style={{ textTransform: 'capitalize' }}>{contrib.location}</td>
                                        <td>{contrib.solution}</td>
                                        <td>{attachmentNames(contrib.attachment)}</td>
                                        <td>{contrib.requested_at}</td>
                                        <td style={{ textTransform: 'capitalize' }}>{contrib.reviewedBy}</td>
                                        <td>{contrib.reviewed_at}</td>
                                        <td style={{ textTransform: 'capitalize' }}>{contrib.status}</td>
                                        <td>{contrib.remarks || '--'} </td>
                                    </tr>
                                ))}
                                {probSolPending.map((contrib, index) => (
                                    <tr key={index}>
                                        <td>{contrib.payload.title}</td>
                                        <td>{contrib.payload.descrip}</td>
                                        <td style={{ textTransform: 'capitalize' }}>{contrib.payload.cat}</td>
                                        <td style={{ textTransform: 'capitalize' }}>{contrib.payload.loc}</td>
                                        <td>{contrib.payload.soln}</td>
                                        <td>{attachmentNames(contrib.payload.attachment)}</td>
                                        <td>{contrib.requested_at}</td>
                                        <td>--</td>
                                        <td>--</td>
                                        <td>Pending</td>
                                        <td>-- </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>}


                    {(createSol.length > 0 || createSol.length > 0) && <div className="probSol">
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
                                    <th>Request At</th>
                                    <th>Reviewed By</th>
                                    <th>Reviewed At</th>
                                    <th>Status</th>
                                    <th>Remarks</th>
                                </tr>
                            </thead>
                            <tbody>
                                {createSol.map((contrib, index) => (
                                    <tr key={index}>
                                        <td>{contrib.prob_title}</td>
                                        <td>{contrib.prob_descrip}</td>
                                        <td style={{ textTransform: 'capitalize' }}>{contrib.category}</td>
                                        <td style={{ textTransform: 'capitalize' }}>{contrib.location}</td>
                                        <td>{contrib.solution}</td>
                                        <td>{attachmentNames(contrib.attachment)}</td>
                                        <td>{contrib.requested_at}</td>
                                        <td style={{ textTransform: 'capitalize' }}>{contrib.reviewedBy}</td>
                                        <td>{contrib.reviewed_at}</td>
                                        <td style={{ textTransform: 'capitalize' }}>{contrib.status}</td>
                                        <td>{contrib.remarks || '--'} </td>
                                    </tr>
                                ))}
                                {createSolPending.map((contrib, index) => (
                                    <tr key={index}>
                                        <td>{contrib.title}</td>
                                        <td>{contrib.description}</td>
                                        <td style={{ textTransform: 'capitalize' }}>{contrib.category}</td>
                                        <td style={{ textTransform: 'capitalize' }}>{contrib.payload.loc}</td>
                                        <td>{contrib.payload.soln}</td>
                                        <td>{attachmentNames(contrib.payload.attachment)}</td>
                                        <td>{contrib.requested_at}</td>
                                        <td>--</td>
                                        <td>--</td>
                                        <td>Pending</td>
                                        <td>-- </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>}
                    {updateSol.length > 0 && <div className="probSol">
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
                                    <th>Request At</th>
                                    <th>Reviewed By</th>
                                    <th>Reviewed At</th>
                                    <th>Status</th>
                                    <th>Remarks</th>
                                </tr>
                            </thead>
                            <tbody>
                                {updateSol.map((contrib, index) => (
                                    <tr key={index}>
                                        <td>{contrib.prob_title}</td>
                                        <td>{contrib.prob_descrip}</td>
                                        <td style={{ textTransform: 'capitalize' }}>{contrib.category}</td>
                                        <td style={{ textTransform: 'capitalize' }}>{contrib.location}</td>
                                        <td>{contrib.solution}</td>
                                        <td>{attachmentNames(contrib.attachment)}</td>
                                        <td>{contrib.requested_at}</td>
                                        <td style={{ textTransform: 'capitalize' }}>{contrib.reviewedBy}</td>
                                        <td>{contrib.reviewed_at}</td>
                                        <td style={{ textTransform: 'capitalize' }}>{contrib.status}</td>
                                        <td>{contrib.remarks || '--'} </td>
                                    </tr>
                                ))}
                                {updateSolPending.map((contrib, index) => (
                                    <tr key={index}>
                                        <td>{contrib.title}</td>
                                        <td>{contrib.description}</td>
                                        <td style={{ textTransform: 'capitalize' }}>{contrib.category}</td>
                                        <td style={{ textTransform: 'capitalize' }}>{contrib.payload.loc}</td>
                                        <td>{contrib.payload.soln}</td>
                                        <td>{attachmentNames(contrib.payload.attachment)}</td>
                                        <td>{contrib.requested_at}</td>
                                        <td>--</td>
                                        <td>--</td>
                                        <td>Pending</td>
                                        <td>-- </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>}

                    {deleteSol.length > 0 && <div className="probSol">
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
                                    <th>Request At</th>
                                    <th>Reviewed By</th>
                                    <th>Reviewed At</th>
                                    <th>Status</th>
                                    <th>Remarks</th>
                                </tr>
                            </thead>
                            <tbody>
                                {deleteSol.map((contrib, index) => (
                                    <tr key={index}>
                                        <td>{contrib.prob_title}</td>
                                        <td>{contrib.prob_descrip}</td>
                                        <td style={{ textTransform: 'capitalize' }}>{contrib.category}</td>
                                        <td style={{ textTransform: 'capitalize' }}>{contrib.location}</td>
                                        <td>{contrib.solution}</td>
                                        <td>{attachmentNames(contrib.attachment)}</td>
                                        <td>{contrib.requested_at}</td>
                                        <td style={{ textTransform: 'capitalize' }}>{contrib.reviewedBy}</td>
                                        <td>{contrib.reviewed_at}</td>
                                        <td style={{ textTransform: 'capitalize' }}>{contrib.status}</td>
                                        <td>{contrib.remarks || '--'} </td>
                                    </tr>
                                ))}
                                {deleteSolPending.map((contrib, index) => (
                                    <tr key={index}>
                                        <td>{contrib.title}</td>
                                        <td>{contrib.description}</td>
                                        <td style={{ textTransform: 'capitalize' }}>{contrib.category}</td>
                                        <td style={{ textTransform: 'capitalize' }}>{contrib.location}</td>
                                        <td>{contrib.solution}</td>
                                        <td>{attachmentNames(contrib.attachment)}</td>
                                        <td>{contrib.requested_at}</td>
                                        <td>--</td>
                                        <td>--</td>
                                        <td>Pending</td>
                                        <td>--</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>}

                    {error && <div className="errorMessage">{error}</div>}
                    {success && <div className="successMessage">
                        <div className="backdrop" onClick={() => setSuccess(false)}></div>
                        <div className="dialog" style={{ backgroundColor: 'rgba(34, 197, 94, 0.35)', border: '1px solid rgba(34, 197, 94, 0.3)' }}>
                            <p style={{ color: '#4ade80' }}>success: {success}</p>
                        </div>
                    </div>}
                </div>}
            </div>
        </div>
    );
};

export default Profile;