import './navbar.css';
import { useNavigate } from "react-router-dom";
import { useEffect, useRef, useState } from 'react';

function Navbar() {
    const navigate = useNavigate();
    const [adminRole, setAdminRole] = useState(null);
    const [searchKey, setSearchKey] = useState('');
    const [isDropOpen, setIsDropOpen] = useState(false);
    const [searchResults, setSearchResults] = useState([]);
    const searchBoxRef = useRef(null);

    useEffect(() => {
        const admin = sessionStorage.getItem("role");
        if (admin == 'admin') {
            setAdminRole(true);
        } else {
            setAdminRole(false);
        }
    }, [])

    useEffect(() => {
        if (!searchKey.trim()) {
            setIsDropOpen(false);
            setSearchResults([]);
            return;
        }
        const timer = setTimeout(() => {
            handleSearch();                 //searching from database every 300ms so that not many fetches are done at every keystroke
        }, 300)
    }, [searchKey]);

    async function handleSearch() {
        const response = await fetch("/api/search", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ keyword: searchKey }),
        });

        const data = await response.json();

        if (data) {
            setSearchResults(data);
            setIsDropOpen(true);
        } else {
            setSearchResults([])
        }
    }

    function handleResultClick(probId) {
        setSearchKey('');;
        setIsDropOpen(false);
        setSearchResults([]);
        navigate(`/viewProb/${probId}`);
    }

    useEffect(() => {
        function handleClickOutsideSearch(e) {
            if (searchBoxRef.current && !searchBoxRef.current.contains(e.target)) {
                setIsDropOpen(false);
            }
        }
        document.addEventListener("mousedown", handleClickOutsideSearch);
        return() => document.removeEventListener("mousedown", handleClickOutsideSearch);
    },[]);

    function handleHome() {
        navigate("/Home");
    }

    function handleReq() {
        navigate("/request");
    }

    function handleAdd() {
        navigate("/addProb");
    }

    function handleProfile() {
        navigate("/profile");
    }

    function handleDash() {
        navigate("/trends");
    }

    return (
        <div className="container_navbar">
            <div className="navBtn">
                <img src="/logo.png" alt="logo" width={100} height={33} style={{ backgroundColor: '#e9e6e6', borderRadius: '8px' }} />
                <button type="button" onClick={handleHome}>Home</button>
                {adminRole && <button type="button" onClick={handleReq}>Requests</button>}
                {adminRole && <button type="button" onClick={handleDash}>Trends</button>}
            </div>
            <div className="searchBox" ref={searchBoxRef}>
                <input type="text" name="search" id="search" className="search" placeholder="Search keywords.." value={searchKey} onChange={(e) => { setSearchKey(e.target.value) }} />
                {isDropOpen && searchResults.length > 0 &&
                    <div className='searchDropDown'>
                        {searchResults.map((items) => (
                            <div key={items.id} className="searchResultItem" onClick={()=>handleResultClick(items.id)}>
                                <p className="searchTitle">{items.title}</p>
                                <p className="searchDescrip">{items.description}</p>
                            </div>
                        ))}
                    </div>}
            </div>
            <div className="add_profile">
                <button type="button" className="add_btn" onClick={handleAdd} >Add Problem</button>
                <button type="button" className="profile_btn" onClick={handleProfile}>Profile</button>
            </div>
        </div>
    );
};

export default Navbar;