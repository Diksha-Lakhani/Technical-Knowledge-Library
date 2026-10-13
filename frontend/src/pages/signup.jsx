import './signup.css';
import { useNavigate } from "react-router-dom";
import { useState } from 'react';

function SignUp() {
    const navigate = useNavigate();
    const [empid, setEmpId] = useState('');
    const [names, setNames] = useState('');
    const [password, setPassword] = useState('');
    const [role, setRole] = useState('');
    const [loc, setLoc] = useState('');

    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');


    async function handleSubmit(e) {
        e.preventDefault();
        const response = await fetch("/api/signin", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ empid, names, password, role, loc })
        })

        const data = await response.json()

        if (data.success) {
            setError('');
            setSuccess(data.message);
            const timer = setTimeout(() => {
                navigate("/");
            }, 600);
        } else {
            setError(data.message);
            setSuccess('');
            setEmpId('');
            setPassword('');
            setNames('');
            setRole('');
            setLoc('');
        }
    }

    function handleLogIn() {
        navigate("/");
    }
    return (
        <div className="container">
            <div className="loginbox">
                <form onSubmit={handleSubmit}>
                    <div className="logo">
                        <img src="/logo.png" alt="logo" width={230} height={66} style={{ backgroundColor: '#e9e6e6', borderRadius: '8px' }} />
                    </div>
                    <h2>Technical Knowledge Library </h2>
                    <h2>Sign Up</h2>
                    <label htmlFor="empid">User ID: </label>
                    <input type="text" name="empid" id="empid" value={empid} onChange={(e) => { setEmpId(e.target.value) }} required />
                    <br />

                    <label htmlFor="names">Name: </label>
                    <input type="text" name="names" id="names" value={names} onChange={(e) => { setNames(e.target.value) }} required />
                    <br />

                    <label htmlFor="pass">Password: </label>
                    <input type="password" name="pass" id="pass" value={password} onChange={(e) => { setPassword(e.target.value) }} required />
                    <br />

                    <label htmlFor="role">Role: </label>
                    <select name="role" id="role" value={role} onChange={(e) => setRole(e.target.value)}>
                        <option value="" disabled>--Select role--</option>
                        <option value="tech">Technical</option>
                        <option value="admin">Admin</option>
                    </select>
                    <br />

                    <label htmlFor="loc">Location: </label>
                    <select name="loc" id="loc" value={loc} onChange={(e) => setLoc(e.target.value)}>
                        <option value="" disabled>--Select location--</option>
                        <option value="noida">Noida</option>
                        <option value="sirohi">Sirohi</option>
                        <option value="durg">Durg</option>
                    </select>
                    <br />

                    <span className="button"><input type="submit" value="Sign Up" /></span>
                    <br />
                    <div className="signinQues">
                        <div className="line"></div>
                        <label htmlFor="sigin"> Have an account? </label>
                        <div className="line"></div>
                    </div>
                </form>
                <span className="button"><button type="button" className='login' onClick={handleLogIn}>Log In</button></span>

                {error && <div className='loginPopUp'>
                    <p>{error}</p>
                </div>}

                {success && <div className='successLoginPopUp'>
                    <p>{success}.Redirecting to login page</p>
                </div>}

            </div>
        </div>
    );
}

export default SignUp;