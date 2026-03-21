import Login from './pages/Login'
import MainPage from './pages/MainPage'
import { BrowserRouter, Routes, Route } from 'react-router-dom'

function App() {

  return (
    <BrowserRouter>
      <main>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/" element={<MainPage />} />
        </Routes>
      </main>
    </BrowserRouter>
  )
}

export default App
