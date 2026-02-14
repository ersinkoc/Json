import { lazy, Suspense } from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import { Navbar } from './components/Navbar'
import { Footer } from './components/Footer'
import './index.css'

const Home = lazy(() => import('./pages/Home'))
const Docs = lazy(() => import('./pages/Docs'))
const Playground = lazy(() => import('./pages/Playground'))

function Loading() {
  return (
    <div className="flex-1 flex items-center justify-center py-32">
      <div className="w-6 h-6 border-2 border-cyan-400 border-t-transparent rounded-full animate-spin" />
    </div>
  )
}

function App() {
  return (
    <div className="min-h-screen flex flex-col bg-[#09090b]">
      <Navbar />
      <main className="flex-1">
        <Suspense fallback={<Loading />}>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/docs" element={<Docs />} />
            <Route path="/playground" element={<Playground />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </Suspense>
      </main>
      <Footer />
    </div>
  )
}

export default App
