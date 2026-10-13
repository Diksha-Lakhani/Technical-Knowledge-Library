import { useEffect, useState } from 'react';
import './trends.css'
import Navbar from '../components/navbar';
import { PieChart, Pie, Tooltip, Cell, Legend } from 'recharts';

function Trends() {
    const [catTrends, setCatTrends] = useState([]);
    const [locTrends, setLocTrends] = useState([]);
    const [probTrends, setProbTrends] = useState([]);
    const [userTrends, setUserTrends] = useState([]);
    const [error, setError] = useState(false);
    const [side, setSide] = useState('');

    async function viewTrends() {
        const response = await fetch("/api/viewTrends");
        const data = await response.json();

        if (data) {
            setCatTrends(data.cat);
            setLocTrends(data.loc);
            setProbTrends(data.prob);
            setUserTrends(data.users);
            setError(false);
        } else {
            setError(true);
        }
    }

    const colours = ['#77a375', '#32997e', '#948e89', '#eee9c1', '#a07c56', '#995b25', '#c59237'];

    useEffect(() => {
        viewTrends();
    }, [])

    function handleSideBar(filter) {
        setSide(side == filter ? '' : filter)
    }

    return (
        <div className="container">
            <Navbar />

            {error && <div className='errorMessage'>
                <p>Error in fetching data. Try again in some time.</p>
            </div>}

            <div className="sidebar">
                <h2>Expand</h2>
                <button type="button" className='profileSideBar' onClick={() => handleSideBar('cat')}>Category</button>
                <button type="button" className='profileSideBar' onClick={() => handleSideBar('loc')}>Location</button>
                <button type="button" className='profileSideBar' onClick={() => handleSideBar('prob')}>Problem</button>
                <button type="button" className='profileSideBar' onClick={() => handleSideBar('users')}>Techicians Contribution</button>
            </div>
            <div className="main">
                <h2>Trends</h2>
                {!side && <div className="mainDash">
                    <div className="divContainer">
                        <div className="trend_container">
                            <div className="Count">Maximum problems in category:
                                <p style={{ textTransform: 'capitalize' }}>{catTrends.length > 0 ? catTrends.reduce((max, item) => item.category_views > max.category_views ? item : max).category : 'None'}</p>
                            </div>
                            <div className="Count">Maximum problems in location:
                                <p style={{ textTransform: 'capitalize' }}>{locTrends.length > 0 ? locTrends.reduce((max, item) => item.location_views > max.location_views ? item : max).location : 'None'}</p>
                            </div>
                            <div className="Count">Maximum problems:
                                <p style={{ textTransform: 'capitalize' }}>{probTrends.length > 0 ? probTrends.reduce((max, item) => item.problem_views > max.problem_views ? item : max).problem : 'None'}</p>
                            </div>
                        </div>
                        <div className="total">Total Views:
                            <p>{catTrends.length > 0 ? catTrends.reduce((sum, item) => item.category_views + sum, 0) : 0}</p>
                        </div>
                    </div>
                    <div className="pieCharts">
                        <div className="pie"><p>Category: </p>
                            <PieChart width={300} height={300}>
                                <Pie data={catTrends} dataKey="category_views" nameKey="category" cx="50%" cy="50%" outerRadius={80} innerRadius={40} >
                                    {catTrends.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={colours[index % colours.length]} />
                                    ))}
                                </Pie>
                                <Tooltip />
                                <Legend layout="vertical" align="right" verticalAlign="bottom" />
                            </PieChart>

                        </div>
                        <div className="pie"><p>Location: </p>
                            <PieChart width={300} height={300}>
                                <Pie data={locTrends} dataKey="location_views" nameKey="location" cx="50%" cy="50%" outerRadius={80} innerRadius={40}>
                                    {locTrends.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={colours[index % colours.length]} />
                                    ))}
                                </Pie>
                                <Tooltip />
                                <Legend layout="vertical" align="right" verticalAlign="bottom" />
                            </PieChart></div>

                        <div className="pie"><p>Problem: </p>
                            <PieChart width={320} height={300}>
                                <Pie data={probTrends} dataKey="problem_views" nameKey="problem" cx="50%" cy="50%" outerRadius={80} innerRadius={40} >
                                    {probTrends.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={colours[index % colours.length]} />
                                    ))}
                                </Pie>
                                <Tooltip />
                                <Legend layout="vertical" align="right" verticalAlign="bottom" />
                            </PieChart></div>

                        <div className="pie"><p>Technicians: </p>
                            <PieChart width={320} height={300}>
                                <Pie data={userTrends} dataKey="solution_contri" nameKey="name" cx="50%" cy="50%" outerRadius={80} innerRadius={40} >
                                    {userTrends.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={colours[index % colours.length]} />
                                    ))}
                                </Pie>
                                <Tooltip />
                                <Legend layout="vertical" align="right" verticalAlign="bottom" />
                            </PieChart></div>
                    </div>
                </div>}

                {side == 'cat' &&
                    <div className="category">
                        <div className="catMax Count">Maximum problems in category:
                            <p style={{ textTransform: 'capitalize' }}>{catTrends.length > 0 ? catTrends.reduce((max, item) => item.category_views > max.category_views ? item : max).category : 'None'}</p>
                        </div>
                        <div className="catPieTable">
                            <p>Category: </p>
                            <PieChart width={400} height={400}>
                                <Pie data={catTrends} dataKey="category_views" nameKey="category" cx="50%" cy="50%" outerRadius={150} innerRadius={75} >
                                    {catTrends.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={colours[index % colours.length]} />
                                    ))}
                                </Pie>
                                <Tooltip />
                                <Legend layout="vertical" align="right" verticalAlign="bottom" />
                            </PieChart>

                            <table className='dashCat'>
                                <thead>
                                    <tr>
                                        <th>Category</th>
                                        <th>Count</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {catTrends.map((files, index) => (
                                        <tr key={index}>
                                            <td style={{ textTransform: 'capitalize' }}>{files.category}</td>
                                            <td>{files.category_views}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>

                    </div>}

                {side == 'loc' &&
                    <div className="category">
                        <div className="catMax Count">Maximum problems in location:
                            <p style={{ textTransform: 'capitalize' }}>{locTrends.length > 0 ? locTrends.reduce((max, item) => item.location_views > max.location_views ? item : max).location : 'None'}</p>
                        </div>
                        <div className="catPieTable">
                            <p>Location: </p>
                            <PieChart width={400} height={400}>
                                <Pie data={locTrends} dataKey="location_views" nameKey="location" cx="50%" cy="50%" outerRadius={150} innerRadius={75}>
                                    {locTrends.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={colours[index % colours.length]} />
                                    ))}
                                </Pie>
                                <Tooltip />
                                <Legend layout="vertical" align="right" verticalAlign="bottom" />
                            </PieChart>

                            <table className='dashCat'>
                                <thead>
                                    <tr>
                                        <th>Location</th>
                                        <th>Count</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {locTrends.map((files, index) => (
                                        <tr key={index}>
                                            <td style={{ textTransform: 'capitalize' }}>{files.location}</td>
                                            <td>{files.location_views}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>}

                {side == 'prob' &&
                    <div className="category">
                        <div className="catMax Count">Maximum problems:
                            <p style={{ textTransform: 'capitalize' }}>{probTrends.length > 0 ? probTrends.reduce((max, item) => item.problem_views > max.problem_views ? item : max).problem : 'None'}</p>
                        </div>
                        <div className="catPieTable">
                            <p>Problem: </p>
                            <PieChart width={500} height={400}>
                                <Pie data={probTrends} dataKey="problem_views" nameKey="problem" cx="50%" cy="50%" outerRadius={150} innerRadius={75} >
                                    {probTrends.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={colours[index % colours.length]} />
                                    ))}
                                </Pie>
                                <Tooltip />
                                <Legend layout="vertical" align="right" verticalAlign="bottom" />
                            </PieChart>

                            <table className='dashCat'>
                                <thead>
                                    <tr>
                                        <th>Problem</th>
                                        <th>Count</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {probTrends.map((files, index) => (
                                        <tr key={index}>
                                            <td style={{ textTransform: 'capitalize' }}>{files.problem}</td>
                                            <td>{files.problem_views}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>

                    </div>}

                {side == 'users' && 
                    <div className="category">
                        <div className="catMax Count">Techician with maximum contribution:
                            <p style={{ textTransform: 'capitalize' }}>{userTrends.length > 0 ? userTrends.reduce((max, item) => item.solution_contri > max.solution_contri ? item : max).name : 'None'}</p>
                        </div>
                        <div className="catPieTable">
                            <p>Technician: </p>
                            <PieChart width={400} height={400}>
                                <Pie data={userTrends} dataKey="solution_contri" nameKey="name" cx="50%" cy="50%" outerRadius={150} innerRadius={75} >
                                    {userTrends.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={colours[index % colours.length]} />
                                    ))}
                                </Pie>
                                <Tooltip />
                                <Legend layout="vertical" align="right" verticalAlign="bottom" />
                            </PieChart>

                            <table className='dashCat'>
                                <thead>
                                    <tr>
                                        <th>Technician</th>
                                        <th>Solution contribution</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {userTrends.map((files, index) => (
                                        <tr key={index}>
                                            <td style={{ textTransform: 'capitalize' }}>{files.name}</td>
                                            <td>{files.solution_contri}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>}
            </div>
        </div>
    );
}

export default Trends;