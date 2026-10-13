import './home.css';
import { useEffect, useState } from 'react';
import Navbar from '../components/navbar';
import Prob_card from '../components/prob_card';

function Home() {
    const [cat, setCat] = useState('');
    const [loc, setLoc] = useState('');

    const [isCatOpen, setIsCatOpen] = useState(false);
    const [isLocOpen, setIsLocOpen] = useState(false);

    const categories = ['network', 'hardware', 'software', 'database', 'security', 'cloud', 'others'];
    const locations = ['noida', 'sirohi', 'durg'];

    const [recent, setRecent] = useState([]);
    const [error, setError] = useState(false);
    const [loading, setLoading] = useState(true);

    async function handleGetProb() {
        try {
            const response = await fetch("/api/recent", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    category: cat || null,
                    location: loc || null,
                }),
            });
            if (!response.ok) {
                throw new Error(`Server error: ${response.status}`);
            }

            const data = await response.json();

            if (Array.isArray(data)) {
                setRecent(data); // Sets data whether it has items or is []
            } else {
                setRecent([]);
            }
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false); // Runs on both success and error
        }
    }

    useEffect(() => {
        handleGetProb();
    }, [cat, loc]);

    return (
        <div className="container">
            <Navbar />

            <div className="sidebar">
                <h2>Search by:</h2>

                <button type="button" className="catHeader" onClick={() => { setIsCatOpen(!isCatOpen) }}>Category</button>
                {isCatOpen &&
                    <div className='dropdown_cat'>
                        {categories.map((item) => (
                            <div key={item} className={`dropdown_item ${cat === item ? 'selected' : ''}`} onClick={() => { setCat(cat === item ? '' : item) }}> {item} </div>))}
                    </div>}

                <button type="button" className="catLoc" onClick={() => { setIsLocOpen(!isLocOpen) }}>Location</button>
                {isLocOpen && <div className='dropdown_loc'>
                    {locations.map((item) => (
                        <div key={item} className={`dropdown_item ${loc === item ? 'selected' : ''}`} onClick={() => { setLoc(loc === item ? '' : item) }}> {item} </div>))}
                </div>}
            </div>

            <div className="prob_card_container">
                {loading && <div className='loading'>
                    <p className='loadingMessage'>Loading recent problems..</p>
                </div>}
                {error && <div className='error'>
                    <p className='errorMessage'>Error: {error}</p>
                </div>}
                <br/>
                <h2>Recent problems</h2>
                <div className="prob_card">
                    {!loading && !error && recent.length === 0 && (
                        <p className='errorMessage'>No problems found for the selected filters.</p>
                    )}
                    {recent.map((problem) => (
                        <Prob_card key={problem.id} probId={problem.id} title={problem.title} descrip={problem.description} cat={problem.category} loc={problem.location} sol_count={problem.solution_count} />
                    ))}
                </div>
            </div>
        </div>
    );
};

export default Home;