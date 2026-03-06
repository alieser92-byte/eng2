import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import './VocabularyBuilder.css';

function VocabularyBuilder() {
  const [mode, setMode] = useState('flashcards'); // flashcards, quiz, list
  const [currentCardIndex, setCurrentCardIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [knownWords, setKnownWords] = useState([]);
  const [learningWords, setLearningWords] = useState([]);

  const vocabularyData = [
    {
      word: 'Ubiquitous',
      pronunciation: '/juːˈbɪk.wɪ.təs/',
      definition: 'Present, appearing, or found everywhere',
      example: 'Smartphones have become ubiquitous in modern society.',
      synonyms: ['omnipresent', 'pervasive', 'universal'],
      level: 'Advanced',
      category: 'Academic'
    },
    {
      word: 'Meticulous',
      pronunciation: '/məˈtɪk.jə.ləs/',
      definition: 'Showing great attention to detail; very careful and precise',
      example: 'The researcher was meticulous in documenting every observation.',
      synonyms: ['careful', 'thorough', 'precise'],
      level: 'Intermediate',
      category: 'General'
    },
    {
      word: 'Ephemeral',
      pronunciation: '/ɪˈfem.ər.əl/',
      definition: 'Lasting for a very short time',
      example: 'The beauty of cherry blossoms is ephemeral, lasting only a few days.',
      synonyms: ['transient', 'fleeting', 'temporary'],
      level: 'Advanced',
      category: 'Academic'
    },
    {
      word: 'Resilient',
      pronunciation: '/rɪˈzɪl.i.ənt/',
      definition: 'Able to withstand or recover quickly from difficult conditions',
      example: 'The community proved resilient after the natural disaster.',
      synonyms: ['hardy', 'strong', 'adaptable'],
      level: 'Intermediate',
      category: 'General'
    },
    {
      word: 'Pragmatic',
      pronunciation: '/præɡˈmæt.ɪk/',
      definition: 'Dealing with things sensibly and realistically; practical',
      example: 'We need a pragmatic approach to solve this problem.',
      synonyms: ['practical', 'realistic', 'sensible'],
      level: 'Intermediate',
      category: 'Academic'
    },
    {
      word: 'Eloquent',
      pronunciation: '/ˈel.ə.kwənt/',
      definition: 'Fluent or persuasive in speaking or writing',
      example: 'The speaker gave an eloquent presentation on climate change.',
      synonyms: ['articulate', 'fluent', 'persuasive'],
      level: 'Intermediate',
      category: 'General'
    }
  ];

  const currentCard = vocabularyData[currentCardIndex];

  const handleNext = () => {
    setIsFlipped(false);
    setCurrentCardIndex((prev) => (prev + 1) % vocabularyData.length);
  };

  const handlePrevious = () => {
    setIsFlipped(false);
    setCurrentCardIndex((prev) => (prev - 1 + vocabularyData.length) % vocabularyData.length);
  };

  const markAsKnown = () => {
    if (!knownWords.includes(currentCard.word)) {
      setKnownWords([...knownWords, currentCard.word]);
    }
    handleNext();
  };

  const markAsLearning = () => {
    if (!learningWords.includes(currentCard.word)) {
      setLearningWords([...learningWords, currentCard.word]);
    }
    handleNext();
  };

  return (
    <div className="vocabulary-builder">
      <motion.div 
        className="vocab-header"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <h1>📚 Vocabulary Builder</h1>
        <p>TOEFL için gerekli akademik ve genel kelime dağarcığınızı geliştirin</p>
      </motion.div>

      <div className="vocab-stats">
        <div className="stat-card">
          <span className="stat-icon">✅</span>
          <span className="stat-value">{knownWords.length}</span>
          <span className="stat-label">Bilinen Kelimeler</span>
        </div>
        <div className="stat-card">
          <span className="stat-icon">📖</span>
          <span className="stat-value">{learningWords.length}</span>
          <span className="stat-label">Öğreniliyor</span>
        </div>
        <div className="stat-card">
          <span className="stat-icon">📝</span>
          <span className="stat-value">{vocabularyData.length}</span>
          <span className="stat-label">Toplam Kelime</span>
        </div>
        <div className="stat-card">
          <span className="stat-icon">🎯</span>
          <span className="stat-value">
            {Math.round((knownWords.length / vocabularyData.length) * 100)}%
          </span>
          <span className="stat-label">İlerleme</span>
        </div>
      </div>

      <div className="mode-selector">
        <button 
          className={`mode-btn ${mode === 'flashcards' ? 'active' : ''}`}
          onClick={() => setMode('flashcards')}
        >
          🎴 Flashcards
        </button>
        <button 
          className={`mode-btn ${mode === 'list' ? 'active' : ''}`}
          onClick={() => setMode('list')}
        >
          📋 Word List
        </button>
        <button 
          className={`mode-btn ${mode === 'quiz' ? 'active' : ''}`}
          onClick={() => setMode('quiz')}
        >
          ✏️ Quiz
        </button>
      </div>

      {mode === 'flashcards' && (
        <motion.div 
          className="flashcard-container"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          <div className="card-wrapper">
            <div 
              className={`flashcard ${isFlipped ? 'flipped' : ''}`}
              onClick={() => setIsFlipped(!isFlipped)}
            >
              <div className="card-front">
                <div className="card-header">
                  <span className="card-level">{currentCard.level}</span>
                  <span className="card-category">{currentCard.category}</span>
                </div>
                <div className="card-content">
                  <h2 className="word">{currentCard.word}</h2>
                  <p className="pronunciation">{currentCard.pronunciation}</p>
                  <p className="click-hint">👆 Click to see definition</p>
                </div>
                <div className="card-footer">
                  <span>{currentCardIndex + 1} / {vocabularyData.length}</span>
                </div>
              </div>

              <div className="card-back">
                <div className="card-header">
                  <span className="card-level">{currentCard.level}</span>
                  <span className="card-category">{currentCard.category}</span>
                </div>
                <div className="card-content">
                  <h3>Definition</h3>
                  <p className="definition">{currentCard.definition}</p>
                  
                  <h3>Example</h3>
                  <p className="example">{currentCard.example}</p>
                  
                  <h3>Synonyms</h3>
                  <div className="synonyms">
                    {currentCard.synonyms.map((syn, i) => (
                      <span key={i} className="synonym-tag">{syn}</span>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="card-controls">
            <button className="control-btn" onClick={handlePrevious}>
              ← Önceki
            </button>
            <div className="action-buttons">
              <button className="action-btn learning" onClick={markAsLearning}>
                📖 Öğreniyorum
              </button>
              <button className="action-btn known" onClick={markAsKnown}>
                ✅ Biliyorum
              </button>
            </div>
            <button className="control-btn" onClick={handleNext}>
              Sonraki →
            </button>
          </div>
        </motion.div>
      )}

      {mode === 'list' && (
        <motion.div 
          className="word-list"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          <div className="list-header">
            <h2>📋 Complete Word List</h2>
            <div className="list-filters">
              <select className="filter-select">
                <option>All Levels</option>
                <option>Beginner</option>
                <option>Intermediate</option>
                <option>Advanced</option>
              </select>
              <select className="filter-select">
                <option>All Categories</option>
                <option>Academic</option>
                <option>General</option>
              </select>
            </div>
          </div>

          <div className="words-grid">
            {vocabularyData.map((word, index) => (
              <motion.div 
                key={index}
                className="word-card"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
              >
                <div className="word-card-header">
                  <h3>{word.word}</h3>
                  {knownWords.includes(word.word) && (
                    <span className="status-badge known">✅</span>
                  )}
                  {learningWords.includes(word.word) && (
                    <span className="status-badge learning">📖</span>
                  )}
                </div>
                <p className="word-pronunciation">{word.pronunciation}</p>
                <p className="word-definition">{word.definition}</p>
                <div className="word-tags">
                  <span className="tag">{word.level}</span>
                  <span className="tag">{word.category}</span>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      )}

      {mode === 'quiz' && (
        <motion.div 
          className="quiz-mode"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          <div className="quiz-content">
            <h2>✏️ Vocabulary Quiz</h2>
            <p className="quiz-description">Test your knowledge of TOEFL vocabulary</p>
            
            <div className="quiz-placeholder">
              <div className="placeholder-icon">🎯</div>
              <h3>Quiz Mode</h3>
              <p>Quiz functionality will be available soon!</p>
              <ul className="quiz-features">
                <li>Multiple choice questions</li>
                <li>Fill in the blanks</li>
                <li>Sentence completion</li>
                <li>Immediate feedback</li>
              </ul>
              <button className="coming-soon-btn">Coming Soon</button>
            </div>
          </div>
        </motion.div>
      )}
    </div>
  );
}

export default VocabularyBuilder;
