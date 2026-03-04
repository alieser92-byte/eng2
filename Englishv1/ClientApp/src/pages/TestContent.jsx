import React, { useState, useEffect, useMemo } from 'react';
import { motion } from 'framer-motion';
import './TestContent.css';

// Parse AI content into structured questions
function parseAIContent(content, sectionName) {
  if (!content) return [];
  
  const questions = [];
  const lines = content.split('\n');
  
  let currentPassage = '';
  let currentQuestion = null;
  let currentOptions = [];
  let inAnswerKey = false;
  let answerKeyAnswers = [];
  let questionType = 'multiple-choice';
  
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    
    // Skip empty lines
    if (!line) continue;
    
    // Detect section headers (skip them)
    if (line.startsWith('## ') || line.startsWith('### ')) {
      // Check if it's a question type header
      if (line.includes('Fill in the missing letters')) {
        questionType = 'fill-in-letters';
        currentPassage = '';
      } else if (line.includes('Read a notice') || line.includes('Read a social media') || line.includes('Read an Academic')) {
        questionType = 'multiple-choice';
        currentPassage = '';
      } else if (line.includes('Choose the best response')) {
        questionType = 'best-response';
      } else if (line.includes('Listen to a conversation') || line.includes('Listen to an announcement') || line.includes('Listen to a talk')) {
        questionType = 'conversation';
        currentPassage = '';
      } else if (line.includes('Build a Sentence')) {
        questionType = 'build-sentence';
      } else if (line.includes('Write an Email')) {
        questionType = 'email';
      } else if (line.includes('Write for an Academic')) {
        questionType = 'academic-discussion';
      } else if (line.includes('Listen and Repeat')) {
        questionType = 'listen-repeat';
      } else if (line.includes('Take an Interview')) {
        questionType = 'interview';
      }
      continue;
    }
    
    // Skip #### headers but note question range
    if (line.startsWith('#### ')) {
      continue;
    }
    
    // Detect Answer Key section
    if (line === 'Answer Key:' || line.startsWith('Answer Key')) {
      inAnswerKey = true;
      continue;
    }
    
    // If in answer key, collect answers
    if (inAnswerKey) {
      const answerMatch = line.match(/^(\d+)\.\s*(.+)$/);
      if (answerMatch) {
        answerKeyAnswers.push({ num: parseInt(answerMatch[1]), answer: answerMatch[2].trim() });
      } else {
        // End of answer key
        inAnswerKey = false;
        
        // Create fill-in-letters questions from collected answers
        if (questionType === 'fill-in-letters' && answerKeyAnswers.length > 0) {
          answerKeyAnswers.forEach((ans, idx) => {
            questions.push({
              type: 'fill-in-letters',
              number: ans.num,
              passage: currentPassage,
              questionText: `Eksik harfleri tamamlayın (Boşluk ${ans.num})`,
              correctAnswer: ans.answer,
              options: []
            });
          });
          answerKeyAnswers = [];
        }
      }
      continue;
    }
    
    // Collect passage text (for fill-in-letters, it's in quotes)
    if (questionType === 'fill-in-letters' && (line.startsWith('"') || currentPassage)) {
      if (line.startsWith('"')) {
        currentPassage = line;
      } else if (!line.match(/^\d+\./) && !line.startsWith('(')) {
        currentPassage += ' ' + line;
      }
      if (line.endsWith('"')) {
        // Passage complete
      }
      continue;
    }
    
    // Detect question number (e.g., "11. What type...")
    const questionMatch = line.match(/^(\d+)\.\s+(.+)$/);
    if (questionMatch && !inAnswerKey) {
      // Save previous question if exists
      if (currentQuestion && currentOptions.length > 0) {
        questions.push({
          ...currentQuestion,
          options: currentOptions
        });
      }
      
      currentQuestion = {
        type: questionType,
        number: parseInt(questionMatch[1]),
        questionText: questionMatch[2],
        passage: currentPassage
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
    
    // Also handle "A)" or "A." format
    const altOptionMatch = line.match(/^\s*([A-D])[)\.]\s*(.+)$/);
    if (altOptionMatch && currentQuestion) {
      currentOptions.push({
        letter: altOptionMatch[1],
        text: altOptionMatch[2].trim()
      });
      continue;
    }
    
    // Build a Sentence format
    if (questionType === 'build-sentence') {
      // Context line (e.g., "What was the highlight of your trip?")
      if (!line.match(/^(\d+)\./) && !line.startsWith('The _') && !line.startsWith('_') && !line.includes(' / ') && !line.startsWith('Answer:') && currentQuestion === null) {
        // This might be start of a new build-sentence question
        const contextMatch = lines[i].match(/^(\d+)\.\s*(.+)$/);
        if (contextMatch) {
          currentQuestion = {
            type: 'build-sentence',
            number: parseInt(contextMatch[1]),
            context: contextMatch[2],
            partialSentence: '',
            scrambledWords: '',
            correctAnswer: ''
          };
        }
      } else if (currentQuestion && (line.includes('___') || line.startsWith('The _') || line.startsWith('_'))) {
        currentQuestion.partialSentence = line;
      } else if (currentQuestion && line.includes(' / ')) {
        currentQuestion.scrambledWords = line;
      } else if (currentQuestion && line.startsWith('Answer:')) {
        currentQuestion.correctAnswer = line.replace('Answer:', '').trim();
        questions.push(currentQuestion);
        currentQuestion = null;
      }
      continue;
    }
    
    // Collect passage for reading comprehension
    if ((questionType === 'multiple-choice' || questionType === 'conversation') && !line.match(/^\d+\./) && !line.match(/^\(/) && currentQuestion === null) {
      currentPassage += (currentPassage ? '\n' : '') + line;
    }
  }
  
  // Don't forget the last question
  if (currentQuestion && currentOptions.length > 0) {
    questions.push({
      ...currentQuestion,
      options: currentOptions
    });
  }
  
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
    setIsFinished(true);
    // Calculate score
    // Save results
  };

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
          <h1>🎉 {section} Bölümü Tamamlandı!</h1>
          <div className="results-summary">
            <p><strong>Bölüm:</strong> {section}</p>
            <p><strong>Cevaplanan Öğeler:</strong> {Object.keys(answers).length} / {testData?.sections?.find(s => s.name === section)?.questions || 0}</p>
            <p><strong>Tamamlanma Oranı:</strong> {Math.round((Object.keys(answers).length / (testData?.sections?.find(s => s.name === section)?.questions || 1)) * 100)}%</p>
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
            Öğe {currentQuestion + 1} / {testData.sections?.find(s => s.name === section)?.questions || 0}
          </span>
        </div>
        <div className="timer">
          <span className={timeLeft < 300 ? 'timer-warning' : ''}>
            ⏱️ {formatTime(timeLeft)}
          </span>
        </div>
      </div>

      <div className="test-body">
        <div className="content-panel">
          <div className="passage-content">
            {parsedQuestions.length > 0 && parsedQuestions[currentQuestion] ? (
              <>
                {parsedQuestions[currentQuestion].passage && (
                  <div className="content-text">
                    {parsedQuestions[currentQuestion].passage}
                  </div>
                )}
                {parsedQuestions[currentQuestion].type === 'build-sentence' && (
                  <div className="build-sentence-content">
                    <p className="context-line"><strong>Bağlam:</strong> {parsedQuestions[currentQuestion].context}</p>
                    <p className="partial-sentence"><strong>Tamamlanacak cümle:</strong> {parsedQuestions[currentQuestion].partialSentence}</p>
                    <div className="scrambled-words">
                      <strong>Karışık kelimeler:</strong>
                      <div className="word-box">{parsedQuestions[currentQuestion].scrambledWords}</div>
                    </div>
                  </div>
                )}
              </>
            ) : (
              <div 
                className="content-text"
                dangerouslySetInnerHTML={{ 
                  __html: testData.aiGeneratedContent 
                    ? testData.aiGeneratedContent.replace(/\n/g, '<br/>') 
                    : 'İçerik yüklenemedi'
                }}
              />
            )}
          </div>
        </div>

        <div className="question-panel">
          <div className="question-card">
            <h4>Öğe {currentQuestion + 1}</h4>
            
            {parsedQuestions.length > 0 && parsedQuestions[currentQuestion] ? (
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
                ) : parsedQuestions[currentQuestion].type === 'fill-in-letters' ? (
                  <div className="fill-in-answer">
                    <input
                      type="text"
                      placeholder="Eksik harfleri yazın..."
                      value={answers[currentQuestion] || ''}
                      onChange={(e) => handleAnswer(currentQuestion, e.target.value)}
                      className="text-input"
                    />
                    <p className="hint">Doğru cevap: {parsedQuestions[currentQuestion].correctAnswer}</p>
                  </div>
                ) : parsedQuestions[currentQuestion].type === 'build-sentence' ? (
                  <div className="build-sentence-answer">
                    <textarea
                      placeholder="Cümleyi oluşturun..."
                      value={answers[currentQuestion] || ''}
                      onChange={(e) => handleAnswer(currentQuestion, e.target.value)}
                      className="sentence-input"
                      rows={3}
                    />
                    <p className="hint">Doğru cevap: {parsedQuestions[currentQuestion].correctAnswer}</p>
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
                        <span className="option-text">Seçenek {option}</span>
                      </label>
                    ))}
                  </div>
                )}
              </>
            ) : (
              <>
                <p className="question-text">
                  {section === 'Reading' 
                    ? `Aşağıdaki cümleyi tamamlayın veya soruyu cevaplayın.` 
                    : section === 'Listening'
                    ? `Dinlediğiniz konuşmaya göre en uygun seçeneği işaretleyin.`
                    : section === 'Writing'
                    ? `Verilen konuya göre yazınızı oluşturun.`
                    : `Dinleyin ve tekrarlayın.`}
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
                      <span className="option-text">Seçenek {option}</span>
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
              className="nav-btn"
            >
              ← Önceki
            </button>
            
            {currentQuestion < (testData.sections?.find(s => s.name === section)?.questions - 1 || 29) ? (
              <button onClick={handleNext} className="nav-btn primary">
                Sonraki →
              </button>
            ) : (
              <button onClick={handleFinish} className="nav-btn finish">
                Bölümü Bitir
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default TestContent;
