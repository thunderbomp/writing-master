import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Layout from './components/layout/Layout'
import Home from './pages/Home'
import Diagnosis from './pages/Diagnosis'
import Templates from './pages/Templates'
import Methodology from './pages/Methodology'
import AIWriter from './pages/AIWriter'
import Cases from './pages/Cases'
import Profile from './pages/Profile'
import Subscribe from './pages/Subscribe'
import Admin from './pages/Admin'

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<Home />} />
          <Route path="diagnosis" element={<Diagnosis />} />
          <Route path="templates" element={<Templates />} />
          <Route path="methodology" element={<Methodology />} />
          <Route path="ai-writer" element={<AIWriter />} />
          <Route path="cases" element={<Cases />} />
          <Route path="profile" element={<Profile />} />
          <Route path="subscribe" element={<Subscribe />} />
        </Route>
        {/* 管理后台 - 独立布局，不含导航栏 */}
        <Route path="/admin" element={<Admin />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App
