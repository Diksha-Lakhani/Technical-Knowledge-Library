{/* Implement session request during development */ }

import './App.css';
import { BrowserRouter, Routes, Route } from "react-router-dom";
import SignUp from './pages/signup';
import Login from './pages/login';
import Forgot from './pages/forgot';
import Home from './pages/home';
import AddProb from './pages/addProb';
import ViewProb from './pages/viewProb';
import Profile from './pages/profile';
import Trends from './pages_admin/trends';
import Request from './pages_admin/request';

function App() {

  return (
    <>
      <BrowserRouter>
        <Routes>
          {/* Public Login Path */}
          <Route path="/" element={<Login />} />
          <Route path="/signup" element={<SignUp />} />
          <Route path="/forgot" element={<Forgot />} />

          {/* Private paths */}
          <Route path="/home" element={<Home />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/addProb" element={<AddProb />} />
          <Route path="/viewProb/:probId" element={<ViewProb />} />
          <Route path='/trends' element={<Trends/>}></Route>
          <Route path='/request' element={<Request/>}></Route>

        </Routes>
      </BrowserRouter>
    </>
  )
}

export default App
