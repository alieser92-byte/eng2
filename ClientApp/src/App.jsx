import React from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import Home from './pages/Home';
import TestGenerator from './pages/TestGenerator';
import TestContent from './pages/TestContent';
import ListeningPractice from './pages/ListeningPractice';
import SpeakingPractice from './pages/SpeakingPractice';
import WritingPractice from './pages/WritingPractice';
import StudyDashboard from './pages/StudyDashboard';
import VocabularyBuilder from './pages/VocabularyBuilder';
import './App.css';

function App() {
  return (
    <Router>
      <div className="app">
        <nav className="navbar">
          <div className="nav-container">
            <Link to="/" className="nav-logo">
              📚 TOEFL Prep
            </Link>
            <ul className="nav-menu">
              <li><Link to="/" className="nav-link">Ana Sayfa</Link></li>
              <li><Link to="/test-generator" className="nav-link">Test Üretici</Link></li>
              <li><Link to="/test-content" className="nav-link">Reading</Link></li>
              <li><Link to="/listening-practice" className="nav-link">Listening</Link></li>
              <li><Link to="/speaking" className="nav-link">Konuşma</Link></li>
              <li><Link to="/writing" className="nav-link">Yazma</Link></li>
              <li><Link to="/vocabulary" className="nav-link">Kelime</Link></li>
              <li><Link to="/dashboard" className="nav-link">İlerleme</Link></li>
            </ul>
          </div>
        </nav>

        <main className="main-content">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/test-generator" element={<TestGenerator />} />
            <Route path="/test-content" element={<TestContent />} />
            <Route path="/listening" element={<ListeningPractice />} />
            <Route path="/listening-practice" element={<ListeningPractice />} />
            <Route path="/speaking" element={<SpeakingPractice />} />
            <Route path="/speaking-practice" element={<SpeakingPractice />} />
            <Route path="/writing" element={<WritingPractice />} />
            <Route path="/writing-practice" element={<WritingPractice />} />
            <Route path="/vocabulary" element={<VocabularyBuilder />} />
            <Route path="/dashboard" element={<StudyDashboard />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;
