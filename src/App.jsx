import { Routes, Route } from 'react-router-dom'
import HomePage from './pages/HomePage'
import BirthdayPage from './pages/BirthdayPage'

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="/wish/:id" element={<BirthdayPage />} />
    </Routes>
  )
}
