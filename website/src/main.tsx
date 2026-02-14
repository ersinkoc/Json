import React from 'react';
import ReactDOM from 'react-dom/client';
import { HashRouter, Routes, Route } from 'react-router-dom';
import './styles/globals.css';
import { ThemeProvider } from './hooks/useTheme';
import { Header } from './components/layout/header';
import { Footer } from './components/layout/footer';
import HomePage from './pages/home';
import PlaygroundPage from './pages/playground';
import ExamplesPage from './pages/examples';
import DocsPage from './pages/docs';

function App() {
  return (
    <div className="min-h-screen flex flex-col bg-white dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100">
      <Header />
      <main className="flex-1">
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/playground" element={<PlaygroundPage />} />
          <Route path="/examples" element={<ExamplesPage />} />
          <Route path="/docs/*" element={<DocsPage />} />
        </Routes>
      </main>
      <Footer />
    </div>
  );
}

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <ThemeProvider>
      <HashRouter>
        <App />
      </HashRouter>
    </ThemeProvider>
  </React.StrictMode>
);
