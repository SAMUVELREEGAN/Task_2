import './App.css';
import { BrowserRouter, Routes, Route } from "react-router-dom"
import Login from './pages/Login';
import Otp from './pages/Otp';
import Dashboard from './pages/Dashboard';
import ProtectedRoute from './pages/ProtectedRoute';
import AuthRedirect from './pages/AuthRedirect';

function App() {
  return (
    <div className="App">
       <BrowserRouter>
      <Routes>
        <Route
          path="/"
          element={
            <AuthRedirect>
              <Login />
            </AuthRedirect>
          }
        />
        <Route path="/otp" element={<Otp />} />
        <Route path="/dashboard"element={ 
          <ProtectedRoute>
              <Dashboard />
          </ProtectedRoute>}/>
      </Routes>
    </BrowserRouter>
    </div>
  );
}

export default App;
