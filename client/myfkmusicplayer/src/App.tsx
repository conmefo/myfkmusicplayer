import './App.css'
import Login from './pages/Login'
import { BrowserRouter, Routes, Route } from 'react-router-dom'

function App() {

  return (
    <BrowserRouter>
      <main className='main-content'>
        <Routes>
          <Route path="/" element={<Login />} />
        </Routes>
      </main>
    </BrowserRouter>
  )
}

export default App
