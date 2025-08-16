// import './App.css';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import MainLayout from './Layout/MainLayout';
import AccountBalance from "./Components/AccountBalance";
import Home from "./Components/Home";

function App() {
  return (
    <Router>
      <MainLayout>
        <Routes>
          <Route path="/home" element={<Home/>} />
          <Route path="/accountbalance" element={<AccountBalance />} />
          
        </Routes>
      </MainLayout>
    </Router>
 );
}
export default App;
