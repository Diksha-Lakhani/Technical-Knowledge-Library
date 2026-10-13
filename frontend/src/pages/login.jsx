import './login.css';
import { useNavigate } from "react-router-dom";
import { useState } from 'react';

function Login() {
    const navigate = useNavigate();
    const [empid, setEmpId] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState(false);

    async function handleSubmit(e) {
        e.preventDefault();
        const response = await fetch("/api/login", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ empid, password })
        })

        const data = await response.json()
        if (data.success) {
            setError(false);
            sessionStorage.setItem("empid", empid);
            sessionStorage.setItem("role", data.info.role);
            sessionStorage.setItem("location",data.info.location);
            navigate("/Home");
        } else {
            setError(true);
            setEmpId('');
            setPassword('');
        }
    }

    function handleForgot() {
        navigate("/forgot");
    }

    function handleSignIn(){
        navigate("/signup");
    }

    return (
        <div className="container">
            <div className="loginbox">
                <form onSubmit={handleSubmit}>
                    <div className="logo">
                        <img src="/logo.png" alt="logo" width={230} height={66} style={{ backgroundColor: '#e9e6e6', borderRadius: '8px' }} />
                    </div>
                    <h2>Technical Knowledge Library </h2>
                    <h2>Login</h2>
                    <label htmlFor="empid">User ID: </label>
                    <input type="text" name="empid" id="empid" value={empid} onChange={(e) => { setEmpId(e.target.value) }} required />
                    <br />
                    <label htmlFor="pass">Password: </label>
                    <input type="password" name="pass" id="pass" value={password} onChange={(e) => { setPassword(e.target.value) }} required />
                    <br />
                    <div className="forgot">
                        <button type="button" className='forgotBtn' onClick={handleForgot}>
                            Forgot Password?
                        </button>
                    </div>
                    <span className="button"><input type="submit" value="Log In" /></span>
                    <br />
                    <div className="signinQues">
                        <div className="line"></div>
                        <label htmlFor="sigin"> Do not have an account? </label>
                        <div className="line"></div>
                    </div>
                </form>
                <span className="button"><button type="button" className='signin' onClick={handleSignIn}>Sign Up</button></span>

                {error && <div className='loginPopUp'>
                    <p>Could not login. Wrong Employee ID or password.</p>
                </div>}
            </div>
        </div>
    );
}

export default Login;