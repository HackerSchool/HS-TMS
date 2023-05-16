import { Routes, Route } from "react-router-dom"
import LoginPage from "./pages/LoginPage"
import './App.css'

function App() {

  return (
    <div className="App">
        <Routes>
            <Route path="/login" element={<LoginPage />} />
        </Routes>
    </div>
  )
}

export default App
