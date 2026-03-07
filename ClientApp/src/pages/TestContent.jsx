import React, { useState, useEffect, useMemo } from 'react';
import { motion } from 'framer-motion';
import './TestContent.css';

// Parse AI content into structured questions
function parseAIContent(content, sectionName) {
  if (!content) return [];
  
  const lines = content.split('\n');
  const correctAnswers = {}; // Store correct answers by "module-number"
  
  // Determine which section we're parsing
  const sectionKeyword = sectionName.toLowerCase().includes('reading') ? 'Reading' :
                         sectionName.toLowerCase().includes('listening') ? 'Listening' :
                         sectionName.toLowerCase().includes('writing') ? 'Writing' : '';
  
  // FIRST PASS: Extract all answers from Answer Key sections - ONLY for current section
  let answerKeyModule = null;
  let inFinalAnswerKey = false;
  
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    const cleanLine = line.replace(/\*\*/g, ''); // Remove markdown bold formatting (**)
    if (!line) continue;
    
    // Detect final answer key section - ONLY for current section (e.g., "### Reading Section Answer Key")
    if (cleanLine.includes('Answer Key') && cleanLine.includes(sectionKeyword)) {
      inFinalAnswerKey = true;
      // Check if module is mentioned in the same line (e.g., "Module 1" or "Module 2")
      if (line.includes('Module 1') && !line.includes('Module 2')) {
        answerKeyModule = 1;
      } else if (line.includes('Module 2')) {
        answerKeyModule = 2;
      } else {
        answerKeyModule = null; // Will be set in next line
      }
      continue;
    }
    
    // Exit answer key if we hit another section's answer key
    if (inFinalAnswerKey && cleanLine.includes('Answer Key') && !cleanLine.includes(sectionKeyword)) {
      inFinalAnswerKey = false;
      answerKeyModule = null;
      continue;
    }
    
    // Exit if we hit a new major section (##)
    if (inFinalAnswerKey && line.startsWith('## ') && !cleanLine.includes('Answer Key')) {
      inFinalAnswerKey = false;
      answerKeyModule = null;
      continue;
    }
    
    // Inside final answer key, detect module
    if (inFinalAnswerKey) {
      if (line === 'Module 1:' || (line.includes('Module 1') && !line.includes('Module 2'))) {
        answerKeyModule = 1;
        continue;
      } else if (line === 'Module 2:' || line.includes('Module 2')) {
        answerKeyModule = 2;
        continue;
      }
      
      // Extract answer - supports both "14. A" and "1-14. A" formats
      const answerMatch = line.match(/^(?:\d+-)?(\d+)\.\s*(.+)$/);
      if (answerMatch && answerKeyModule) {
        const num = parseInt(answerMatch[1]);
        const answer = answerMatch[2].trim();
        const key = `${answerKeyModule}-${num}`;
        correctAnswers[key] = answer;
      }
    }
    
    // Also capture inline answer keys (after fill-in sections) - only for Reading section
    if (sectionKeyword === 'Reading' && (cleanLine === 'Answer Key:' || cleanLine.startsWith('Answer Key')) && !inFinalAnswerKey) {
      // Look ahead for module context
      let moduleForInline = null;
      for (let j = i - 1; j >= 0 && j > i - 50; j--) {
        const prevLine = lines[j].trim();
        if (prevLine.includes('Module 1') && !prevLine.includes('Module 2')) { moduleForInline = 1; break; }
        if (prevLine.includes('Module 2')) { moduleForInline = 2; break; }
      }
      
      // Read inline answers
      if (moduleForInline) {
        for (let k = i + 1; k < lines.length && k < i + 15; k++) {
          const ansLine = lines[k].trim();
          if (!ansLine) continue;
          // Support both "1. vers" and "1-1. vers" formats
          const ansMatch = ansLine.match(/^(?:\d+-)?(\d+)\.\s*(.+)$/);
          if (ansMatch) {
            const num = parseInt(ansMatch[1]);
            const ans = ansMatch[2].trim();
            correctAnswers[`${moduleForInline}-${num}`] = ans;
          } else if (ansLine.match(/^[#\-]/) || ansLine.includes('Read a')) {
            break; // End of inline answer key
          }
        }
      }
    }
  }
  
  // SECOND PASS: Parse questions
  const questions = [];
  let currentModule = null;
  let currentSection = null;
  let currentPassage = '';
  let currentQuestion = null;
  let currentOptions = [];
  let fillInPassage = '';
  let lastPassage = '';
  let fillInAnswersCollected = {};
  let skipAnswerKeyLines = false;
  
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    const cleanLine = line.replace(/\*\*/g, ''); // Remove markdown bold formatting
    
    if (!line) continue;
    
    // Skip final answer key section completely
    if (cleanLine.includes('Answer Key') && (cleanLine.includes('Reading') || cleanLine.includes('Listening') || cleanLine.includes('Writing'))) {
      break; // Stop parsing at final answer key
    }
    
    // Detect Module
    if (line.includes('Module 1') && !line.includes('Module 2')) {
      currentModule = 1;
      currentSection = null;
      currentPassage = '';
      continue;
    } else if (line.includes('Module 2')) {
      currentModule = 2;
      currentSection = null;
      currentPassage = '';
      continue;
    }
    
    // Detect section types
    if (line.includes('Fill in the missing letters')) {
      currentSection = 'fill-in-letters';
      currentPassage = '';
      fillInPassage = '';
      lastPassage = ''; // Reset lastPassage
      continue;
    } else if (line.includes('Read a notice')) {
      currentSection = 'notice';
      currentPassage = '';
      lastPassage = ''; // Reset lastPassage
      continue;
    } else if (line.includes('Read a social media')) {
      currentSection = 'social-media';
      currentPassage = '';
      lastPassage = ''; // Reset lastPassage
      continue;
    } else if (line.includes('Read an Academic')) {
      currentSection = 'academic';
      currentPassage = '';
      lastPassage = ''; // Reset lastPassage
      continue;
    }
    
    // Skip markdown headers
    if (line.startsWith('##') || line.startsWith('###') || line.startsWith('#') || line.startsWith('---')) {
      continue;
    }
    
    // Handle inline Answer Key (for fill-in questions)
    if (cleanLine === 'Answer Key:' || cleanLine.startsWith('Answer Key')) {
      skipAnswerKeyLines = true;
      
      // Create fill-in questions if we have a passage
      if (currentSection === 'fill-in-letters' && fillInPassage && currentModule) {
        for (let j = 1; j <= 10; j++) {
          const ansKey = `${currentModule}-${j}`;
          questions.push({
            type: 'fill-in-letters',
            module: currentModule,
            number: j,
            passage: fillInPassage,
            questionText: `Fill in blank ${j} with the missing letters`,
            correctAnswer: correctAnswers[ansKey] || '',
            options: []
          });
        }
        fillInPassage = '';
      }
      continue;
    }
    
    // Skip inline answer key entries
    if (skipAnswerKeyLines) {
      const answerMatch = line.match(/^(\d+)\.\s*(.+)$/);
      if (answerMatch) {
        const num = parseInt(answerMatch[1]);
        if (num <= 10) continue; // Still in fill-in answers
      }
      // Check if we've moved past inline answer key
      if (line.includes('Read a') || line.includes('NOTICE') || line.match(/^[A-Z][a-z]/)) {
        skipAnswerKeyLines = false;
      } else {
        continue;
      }
    }
    
    // Collect passage text for fill-in-letters (paragraph with blanks)
    if (currentSection === 'fill-in-letters' && !line.match(/^\d+\./) && !line.match(/^\(/) && (line.includes('___') || line.includes('_'))) {
      const cleanLine = line.replace(/^[""]|[""]$/g, '').trim();
      fillInPassage += (fillInPassage ? ' ' : '') + cleanLine;
      continue;
    }
    
    // Collect passage text for other sections
    if ((currentSection === 'notice' || currentSection === 'social-media' || currentSection === 'academic') && 
        !line.match(/^\d+\./) && // Not a question number
        !line.match(/^\s*\([A-D]\)/) && // Not an option
        !line.startsWith('####') && !line.startsWith('###') && !line.startsWith('##')) { // Not a markdown header
      // Clean markdown formatting but include the line
      const cleanLine = line.replace(/\*\*/g, '').replace(/^[""]|[""]$/g, '').trim();
      if (cleanLine) { // Only add non-empty lines
        currentPassage += (currentPassage ? '\n' : '') + cleanLine;
        lastPassage = currentPassage;
      }
      continue;
    }
    
    // Detect question number
    const questionMatch = line.match(/^(\d+)\.\s+(.+)$/);
    if (questionMatch) {
      // Save previous question if exists
      if (currentQuestion && currentOptions.length > 0) {
        questions.push({
          ...currentQuestion,
          options: currentOptions
        });
      }
      
      const qNum = parseInt(questionMatch[1]);
      const ansKey = `${currentModule}-${qNum}`;
      
      currentQuestion = {
        type: currentSection || 'multiple-choice',
        number: qNum,
        questionText: questionMatch[2],
        passage: currentPassage || lastPassage,
        module: currentModule,
        correctAnswer: correctAnswers[ansKey] || ''
      };
      currentOptions = [];
      continue;
    }
    
    // Detect options (A), (B), (C), (D) format
    const optionMatch = line.match(/^\s*\(([A-D])\)\s*(.+)$/);
    if (optionMatch && currentQuestion) {
      currentOptions.push({
        letter: optionMatch[1],
        text: optionMatch[2].trim()
      });
      continue;
    }
  }
  
  // Don't forget the last question
  if (currentQuestion && currentOptions.length > 0) {
    questions.push({
      ...currentQuestion,
      options: currentOptions
    });
  }
  
  // Calculate global question numbers across modules
  // Module 1 questions get their original numbers (1-20 for Reading, 1-18 for Listening)
  // Module 2 questions get offset by Module 1's count
  const module1Questions = questions.filter(q => q.module === 1);
  const module1Count = module1Questions.length;
  
  questions.forEach(q => {
    if (q.module === 1) {
      q.globalNumber = q.number;
    } else if (q.module === 2) {
      q.globalNumber = module1Count + q.number;
    } else {
      q.globalNumber = q.number; // For sections without modules (Speaking, Writing)
    }
  });
  
  // Debug: Log correct answers and questions
  console.log('DEBUG - correctAnswers:', JSON.stringify(correctAnswers, null, 2));
  console.log('DEBUG - questions count:', questions.length);
  console.log('DEBUG - first 3 questions:', questions.slice(0, 3).map(q => ({ num: q.number, module: q.module, globalNum: q.globalNumber, correctAnswer: q.correctAnswer })));
  
  return questions;
}

function TestContent() {
  const [testData, setTestData] = useState(null);
  const [section, setSection] = useState('');
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState({});
  const [timeLeft, setTimeLeft] = useState(null);
  const [isFinished, setIsFinished] = useState(false);
  const [isStarted, setIsStarted] = useState(false);
  const [showHints, setShowHints] = useState({}); // Track which hints are shown
  const [score, setScore] = useState({ correct: 0, wrong: 0, total: 0 });

  // Parse questions from AI content
  const parsedQuestions = useMemo(() => {
    if (!testData?.aiGeneratedContent || !section) return [];
    return parseAIContent(testData.aiGeneratedContent, section);
  }, [testData, section]);

  useEffect(() => {
    // Get test data from sessionStorage
    const storedTest = sessionStorage.getItem('currentTest');
    const storedSection = sessionStorage.getItem('currentSection');
    
    if (storedTest && storedSection) {
      const test = JSON.parse(storedTest);
      setTestData(test);
      setSection(storedSection);
      
      // Set timer based on section
      const sectionData = test.sections.find(s => s.name === storedSection);
      if (sectionData) {
        setTimeLeft(sectionData.timeLimit * 60); // Convert to seconds
      }
    }
  }, []);

  useEffect(() => {
    if (isStarted && timeLeft !== null && timeLeft > 0 && !isFinished) {
      const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
      return () => clearTimeout(timer);
    } else if (isStarted && timeLeft === 0 && !isFinished) {
      handleFinish();
    }
  }, [timeLeft, isFinished, isStarted]);

  const formatTime = (seconds) => {
    if (seconds === null || seconds === undefined) return '0:00';
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const handleAnswer = (questionIndex, answer) => {
    setAnswers({ ...answers, [questionIndex]: answer });
  };

  const handleNext = () => {
    setCurrentQuestion(currentQuestion + 1);
  };

  const handlePrevious = () => {
    setCurrentQuestion(currentQuestion - 1);
  };

  const handleFinish = () => {
    // Calculate score
    let correct = 0;
    let wrong = 0;
    
    parsedQuestions.forEach((q, idx) => {
      const userAnswer = answers[idx];
      if (userAnswer) {
        const correctAnswer = q.correctAnswer;
        if (q.type === 'fill-in-letters') {
          // Case-insensitive comparison for fill-in
          if (userAnswer.toLowerCase().trim() === correctAnswer.toLowerCase().trim()) {
            correct++;
          } else {
            wrong++;
          }
        } else {
          // Exact match for multiple choice
          if (userAnswer === correctAnswer) {
            correct++;
          } else {
            wrong++;
          }
        }
      }
    });
    
    setScore({ correct, wrong, total: parsedQuestions.length });
    setIsFinished(true);
  };

  // Auto-advance to next section after showing results
  useEffect(() => {
    if (isFinished && score.total > 0) {
      const sectionsOrder = JSON.parse(sessionStorage.getItem('sectionsOrder') || '[]');
      const currentSectionIndex = sectionsOrder.indexOf(section);
      
      if (currentSectionIndex !== -1 && currentSectionIndex < sectionsOrder.length - 1) {
        const nextSection = sectionsOrder[currentSectionIndex + 1];
        const routes = {
          'Reading': '/test-content',
          'Listening': '/listening-practice', 
          'Speaking': '/speaking-practice',
          'Writing': '/writing-practice'
        };
        
        if (routes[nextSection]) {
          // Wait 3 seconds to show results, then navigate
          const timer = setTimeout(() => {
            sessionStorage.setItem('currentSection', nextSection);
            window.location.href = routes[nextSection];
          }, 3000);
          
          return () => clearTimeout(timer);
        }
      }
    }
  }, [isFinished, score, section]);

  if (!testData || timeLeft === null) {
    return (
      <div className="test-content">
        <div className="loading-state">
          <div className="loading-spinner"></div>
          <p>Test yükleniyor...</p>
        </div>
      </div>
    );
  }

  if (!isStarted) {
    return (
      <div className="test-content">
        <motion.div 
          className="start-screen"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
        >
          <h1>📝 {section} Section</h1>
          <div className="start-info">
            <div className="info-item">
              <span className="info-icon">📊</span>
              <div>
                <h3>Öğe Sayısı</h3>
                <p>{testData.sections?.find(s => s.name === section)?.questions || 0} Öğe</p>
              </div>
            </div>
            <div className="info-item">
              <span className="info-icon">⏱️</span>
              <div>
                <h3>Yaklaşık Süre</h3>
                <p>{Math.floor(timeLeft / 60)} dakika</p>
              </div>
            </div>
            <div className="info-item">
              <span className="info-icon">🎯</span>
              <div>
                <h3>Test Bölümü</h3>
                <p>{section}</p>
              </div>
            </div>
          </div>
          
          {testData.sections?.find(s => s.name === section)?.tasks && (
            <div className="task-list">
              <h3>Görev Türü:</h3>
              <ul>
                {testData.sections.find(s => s.name === section).tasks.map((task, idx) => (
                  <li key={idx}>• {task}</li>
                ))}
              </ul>
            </div>
          )}
          <button 
            onClick={() => setIsStarted(true)} 
            className="start-btn"
          >
            🚀 Teste Başla
          </button>
        </motion.div>
      </div>
    );
  }

  if (isFinished) {
    return (
      <div className="test-content">
        <motion.div 
          className="results-panel"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
        >
          <h1>🎉 {section} Section Completed!</h1>
          <div className="results-summary">
            <div className="score-card">
              <h2 style={{ color: '#667eea', marginBottom: '1rem' }}>Your Score</h2>
              <div className="score-display">
                <div className="score-value" style={{ fontSize: '4rem', fontWeight: 'bold', color: '#667eea' }}>
                  {Math.round((score.correct / score.total) * 100)}%
                </div>
                <div className="score-label" style={{ fontSize: '1.2rem', color: '#666' }}>
                  {score.correct} out of {score.total}
                </div>
              </div>
            </div>
            
            <div className="stats-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem', marginTop: '2rem' }}>
              <div className="stat-box" style={{ padding: '1.5rem', background: '#e8f5e9', borderRadius: '12px', textAlign: 'center' }}>
                <div style={{ fontSize: '2.5rem', marginBottom: '0.5rem' }}>✓</div>
                <div style={{ fontSize: '1.8rem', fontWeight: 'bold', color: '#4CAF50' }}>{score.correct}</div>
                <div style={{ fontSize: '0.9rem', color: '#666' }}>Correct</div>
              </div>
              <div className="stat-box" style={{ padding: '1.5rem', background: '#ffebee', borderRadius: '12px', textAlign: 'center' }}>
                <div style={{ fontSize: '2.5rem', marginBottom: '0.5rem' }}>✗</div>
                <div style={{ fontSize: '1.8rem', fontWeight: 'bold', color: '#f44336' }}>{score.wrong}</div>
                <div style={{ fontSize: '0.9rem', color: '#666' }}>Wrong</div>
              </div>
              <div className="stat-box" style={{ padding: '1.5rem', background: '#e3f2fd', borderRadius: '12px', textAlign: 'center' }}>
                <div style={{ fontSize: '2.5rem', marginBottom: '0.5rem' }}>⊘</div>
                <div style={{ fontSize: '1.8rem', fontWeight: 'bold', color: '#2196F3' }}>{score.total - score.correct - score.wrong}</div>
                <div style={{ fontSize: '0.9rem', color: '#666' }}>Unanswered</div>
              </div>
            </div>
            
            <div style={{ marginTop: '2rem', padding: '1rem', background: 'rgba(102, 126, 234, 0.1)', borderRadius: '8px' }}>
              <p style={{ margin: 0, fontSize: '0.95rem', color: '#555' }}>
                <strong>Section:</strong> {section} | 
                <strong> Completion Rate:</strong> {Math.round((Object.keys(answers).length / score.total) * 100)}%
              </p>
            </div>
          </div>
          <button 
            onClick={() => window.location.href = '/'} 
            className="home-btn"
          >
            Ana Sayfaya Dön
          </button>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="test-content">
      <div className="test-header">
        <div className="test-info">
          <h2>{section} Section</h2>
          <span className="question-counter">
            Question {parsedQuestions[currentQuestion]?.globalNumber || currentQuestion + 1} / {parsedQuestions.length}
          </span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
          <div className="answer-status">
            <span style={{ fontSize: '14px', color: '#666' }}>
              Answered: {Object.keys(answers).length} / {parsedQuestions.length}
            </span>
            {Object.keys(answers).length > 0 && (
              <span style={{ fontSize: '12px', color: '#888', marginTop: '4px', display: 'block' }}>
                ✓ {(() => {
                  let correct = 0;
                  parsedQuestions.forEach((q, idx) => {
                    const userAnswer = answers[idx];
                    if (userAnswer && q.correctAnswer) {
                      if (q.type === 'fill-in-letters') {
                        if (userAnswer.toLowerCase().trim() === q.correctAnswer.toLowerCase().trim()) correct++;
                      } else {
                        if (userAnswer === q.correctAnswer) correct++;
                      }
                    }
                  });
                  return correct;
                })()}{' '}
                Correct | ✗ {(() => {
                  let wrong = 0;
                  parsedQuestions.forEach((q, idx) => {
                    const userAnswer = answers[idx];
                    if (userAnswer && q.correctAnswer) {
                      if (q.type === 'fill-in-letters') {
                        if (userAnswer.toLowerCase().trim() !== q.correctAnswer.toLowerCase().trim()) wrong++;
                      } else {
                        if (userAnswer !== q.correctAnswer) wrong++;
                      }
                    }
                  });
                  return wrong;
                })()}{' '}
                Wrong
              </span>
            )}
          </div>
          <div className="timer">
            <span className={timeLeft < 300 ? 'timer-warning' : ''}>
              ⏱️ {formatTime(timeLeft)}
            </span>
          </div>
        </div>
      </div>

      <div className="test-body">
        <div className="content-panel">
          <div className="passage-content">
            {parsedQuestions.length > 0 && parsedQuestions[currentQuestion] ? (
              <>
                {parsedQuestions[currentQuestion].type === 'fill-in-letters' ? (
                  <div className="fill-in-content">
                    <h3>Fill in the missing letters in the paragraph (Questions 1-10)</h3>
                    <div className="fill-in-paragraph" style={{ lineHeight: '2', fontSize: '16px', padding: '20px', backgroundColor: '#f8f9fa', borderRadius: '8px' }}>
                      {parsedQuestions[currentQuestion].passage}
                    </div>
                    <div className="instructions" style={{ marginTop: '20px', padding: '15px', backgroundColor: '#e3f2fd', borderRadius: '6px' }}>
                      <p><strong>Instructions:</strong> Complete each blank (____) with the missing letters. Navigate through questions 1-10 using the Next/Previous buttons.</p>
                    </div>
                  </div>
                ) : parsedQuestions[currentQuestion].passage ? (
                  <div className="content-text">
                    <p style={{ whiteSpace: 'pre-line', lineHeight: '1.8', fontSize: '15px' }}>{parsedQuestions[currentQuestion].passage}</p>
                  </div>
                ) : null}
              </>
            ) : (
              <div 
                className="content-text"
                dangerouslySetInnerHTML={{ 
                  __html: testData.aiGeneratedContent 
                    ? testData.aiGeneratedContent.replace(/\n/g, '<br/>') 
                    : 'Content could not be loaded'
                }}
              />
            )}
          </div>
        </div>

        <div className="question-panel">
          <div className="question-card">
            <h4>Question {parsedQuestions[currentQuestion]?.globalNumber || currentQuestion + 1}</h4>
            
            {parsedQuestions.length > 0 && parsedQuestions[currentQuestion] ? (
              <>
                {parsedQuestions[currentQuestion].type === 'fill-in-letters' ? (
                  <div className="fill-in-blanks-section">
                    <p className="question-text">
                      {parsedQuestions[currentQuestion].questionText}
                    </p>
                    <div className="fill-in-answer">
                      <label style={{ fontWeight: 'bold', marginBottom: '10px', display: 'block' }}>
                        Blank {parsedQuestions[currentQuestion].number}:
                      </label>
                      <input
                        type="text"
                        placeholder="Enter missing letters..."
                        value={answers[currentQuestion] || ''}
                        onChange={(e) => handleAnswer(currentQuestion, e.target.value)}
                        className="text-input"
                        style={{ 
                          width: '100%', 
                          padding: '12px', 
                          fontSize: '16px', 
                          border: '2px solid #ddd', 
                          borderRadius: '6px',
                          marginTop: '10px'
                        }}
                      />
                      <button
                        onClick={() => setShowHints({...showHints, [currentQuestion]: !showHints[currentQuestion]})}
                        style={{
                          marginTop: '10px',
                          padding: '8px 16px',
                          backgroundColor: showHints[currentQuestion] ? '#f44336' : '#4CAF50',
                          color: 'white',
                          border: 'none',
                          borderRadius: '4px',
                          cursor: 'pointer',
                          fontSize: '14px'
                        }}
                      >
                        {showHints[currentQuestion] ? 'Hide Answer' : 'Show Answer'}
                      </button>
                      {showHints[currentQuestion] && parsedQuestions[currentQuestion].correctAnswer && (
                        <div style={{
                          marginTop: '10px',
                          padding: '12px',
                          backgroundColor: '#e8f5e9',
                          borderLeft: '4px solid #4CAF50',
                          borderRadius: '4px'
                        }}>
                          <strong>Correct Answer:</strong> {parsedQuestions[currentQuestion].correctAnswer}
                        </div>
                      )}
                    </div>
                  </div>
                ) : (
                  <>
                    <p className="question-text">
                      {parsedQuestions[currentQuestion].questionText}
                    </p>
                    
                    {parsedQuestions[currentQuestion].options && parsedQuestions[currentQuestion].options.length > 0 ? (
                      <div className="answer-options">
                        {parsedQuestions[currentQuestion].options.map((option, idx) => (
                          <label 
                            key={idx}
                            className={`option ${answers[currentQuestion] === option.letter ? 'selected' : ''}`}
                          >
                            <input
                              type="radio"
                              name={`question-${currentQuestion}`}
                              value={option.letter}
                              checked={answers[currentQuestion] === option.letter}
                              onChange={() => handleAnswer(currentQuestion, option.letter)}
                            />
                            <span className="option-letter">{option.letter}</span>
                            <span className="option-text">{option.text}</span>
                          </label>
                        ))}
                      </div>
                    ) : (
                      <div className="answer-options">
                        {['A', 'B', 'C', 'D'].map((option, idx) => (
                          <label 
                            key={idx}
                            className={`option ${answers[currentQuestion] === option ? 'selected' : ''}`}
                          >
                            <input
                              type="radio"
                              name={`question-${currentQuestion}`}
                              value={option}
                              checked={answers[currentQuestion] === option}
                              onChange={() => handleAnswer(currentQuestion, option)}
                            />
                            <span className="option-letter">{option}</span>
                            <span className="option-text">Option {option}</span>
                          </label>
                        ))}
                      </div>
                    )}
                  </>
                )}
              </>
            ) : (
              <>
                <p className="question-text">
                  {section === 'Reading' 
                    ? `Complete the sentence or answer the question.` 
                    : section === 'Listening'
                    ? `Listen to the conversation and select the best answer.`
                    : section === 'Writing'
                    ? `Write your response based on the prompt.`
                    : `Listen and repeat.`}
                </p>
                
                <div className="answer-options">
                  {['A', 'B', 'C', 'D'].map((option, idx) => (
                    <label 
                      key={idx}
                      className={`option ${answers[currentQuestion] === option ? 'selected' : ''}`}
                    >
                      <input
                        type="radio"
                        name={`question-${currentQuestion}`}
                        value={option}
                        checked={answers[currentQuestion] === option}
                        onChange={() => handleAnswer(currentQuestion, option)}
                      />
                      <span className="option-letter">{option}</span>
                      <span className="option-text">Option {option}</span>
                    </label>
                  ))}
                </div>
              </>
            )}
          </div>

          <div className="navigation-buttons">
            <button 
              onClick={handlePrevious} 
              disabled={currentQuestion === 0}
              className={`nav-btn ${currentQuestion === 0 ? 'disabled' : ''}`}
            >
              ← Previous
            </button>
            
            {currentQuestion < (parsedQuestions.length - 1) ? (
              <button onClick={handleNext} className="nav-btn primary">
                Next →
              </button>
            ) : (
              <button onClick={handleFinish} className="nav-btn finish">
                Finish Section
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default TestContent;
