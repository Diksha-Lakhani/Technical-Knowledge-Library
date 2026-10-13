import './forgot.css'
import { useNavigate } from "react-router-dom";
import { useState } from 'react';

function Forgot() {
    const navigate = useNavigate();
    const [email, setEmail] = useState('');
    const [sendCode, setSendCode] = useState(false);
    const [verifCode, setVerifCode] = useState('');
    const [error, setError] = useState(false);

    async function handleSubmit(e) {
        e.preventDefault();
        if(sendCode){
            navigate("/")
        }
        setSendCode(true);
    }

    function handleBack() {
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
                    <h2>Forgot Password</h2>
                    <label htmlFor="email">Email ID: </label>
                    <input type="email" name="email" id="email" value={email} onChange={(e) => { setEmail(e.target.value) }} required />
                    <br />
                    {sendCode && <div className="sendCodeBox">
                        <label htmlFor="verif">Verification Code: </label>
                        <input type="password" name="verif" id="verif" value={verifCode} onChange={(e) => { setVerifCode(e.target.value) }} required />
                    </div>}
                    <br />
                    <div className="forgot">
                        <button type="button" className='forgotBtn' onClick={handleBack}>
                            Go Back
                        </button>
                    </div>
                    <span className="button"><input type="submit" value={sendCode? "Submit": "Send Verification Code"}/></span>
                    <br />
                </form>

                {error && <div className='loginPopUp'>
                    <p>Verification Code does not match. </p>
                </div>}
            </div>
        </div>
    );
}

export default Forgot;