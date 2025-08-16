// import './App.css';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import MainLayout from './Layout/MainLayout';
import AccountBalance from "./Components/AccountBalance";
import Home from "./Components/Home";
import BatchTransactionPage from './Components/BatchTransactionPage';
import { TransactionsProvider } from './contexts/TransactionContext';

function App() {
  return (
    <TransactionsProvider>
      <Router>
        <MainLayout>
          <Routes>
            <Route path="/home" element={<Home/>} />
            <Route path="/batchtxndetails" element={<BatchTransactionPage/>} />
            <Route path="/accountbalance" element={<AccountBalance />} />
          </Routes>
        </MainLayout>
      </Router>
    </TransactionsProvider>
 );
}
export default App;
