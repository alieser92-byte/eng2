import React, { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { parseListeningContent } from '../utils/contentParser';
import './ListeningPractice.css';

const ListeningPractice = () => {
  const [testData, setTestData] = useState(null);
  const [parsedQuestions, setParsedQuestions] = useState([]);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState({});
  const [timeLeft, setTimeLeft] = useState(0);
  const [isFinished, setIsFinished] = useState(false);
  const [isStarted, setIsStarted] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [isAudioPlaying, setIsAudioPlaying] = useState(false);
  const [audioCompleted, setAudioCompleted] = useState(false);
  const [showTranscript, setShowTranscript] = useState(false);
  
  const [showResumePrompt, setShowResumePrompt] = useState(false);
  const [savedStateData, setSavedStateData] = useState(null);

  const audioRef = useRef(null);

  useEffect(() => {
    const storedTest = sessionStorage.getItem('currentTest');
    if (storedTest) {
      const test = JSON.parse(storedTest);
      const listeningSection = test.sections.find(s => s.name === 'Listening');

      if (listeningSection) {
        const questions = parseListeningContent(test.aiGeneratedContent);
        console.log('📝 Parsed Listening Questions:', questions);
        console.log('📝 First 3 questions detail:', questions.slice(0, 3).map(q => ({
          num: q.number,
          module: q.module,
          hasCorrect: !!q.correctAnswer,
          correctAnswer: q.correctAnswer
        })));
        if (questions.length > 0) {
          setParsedQuestions(questions);
        } else {
          setParsedQuestions([]);
        }

        const processedSection = {
          ...listeningSection,
          duration: listeningSection.timeLimit,
          taskTypes: listeningSection.tasks || []
        };

        setTestData(processedSection);
        
        const savedStateStr = sessionStorage.getItem('testState_Listening');
        if (savedStateStr) {
          const savedState = JSON.parse(savedStateStr);
          setSavedStateData(savedState);
          setShowResumePrompt(true);
        } else {
          setTimeLeft((listeningSection.timeLimit || 10) * 60);
        }
      }
    }
  }, []);

  // Save state continuously when active
  useEffect(() => {
    if (isStarted && !isFinished) {
      const stateToSave = {
        currentQuestion,
        answers,
        timeLeft,
        audioCompleted,
        showTranscript
      };
      sessionStorage.setItem('testState_Listening', JSON.stringify(stateToSave));
    }
  }, [currentQuestion, answers, timeLeft, isStarted, isFinished, audioCompleted, showTranscript]);

  const handleResumeSession = () => {
    if (savedStateData) {
      setCurrentQuestion(savedStateData.currentQuestion || 0);
      setAnswers(savedStateData.answers || {});
      setTimeLeft(savedStateData.timeLeft || 0);
      setAudioCompleted(savedStateData.audioCompleted || false);
      setShowTranscript(savedStateData.showTranscript || false);
      setIsStarted(true);
      setShowResumePrompt(false);
    }
  };

  const handleRestartSession = () => {
    sessionStorage.removeItem('testState_Listening');
    if (testData) {
      setTimeLeft((testData.duration || 10) * 60);
    }
    setCurrentQuestion(0);
    setAnswers({});
    setAudioCompleted(false);
    setShowTranscript(false);
    setShowResumePrompt(false);
    setIsStarted(false);
  };

  useEffect(() => {
    if (isStarted && !isPaused && timeLeft > 0 && !isFinished) {
      const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
      return () => clearTimeout(timer);
    } else if (timeLeft === 0 && isStarted) {
      setIsFinished(true);
    }
  }, [timeLeft, isStarted, isFinished, isPaused]);

  const handlePause = () => {
    setIsPaused(true);
    if ('speechSynthesis' in window) {
      window.speechSynthesis.pause();
    }
  };

  const handleResume = () => {
    setIsPaused(false);
    if ('speechSynthesis' in window) {
      window.speechSynthesis.resume();
    }
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const handleStart = () => setIsStarted(true);

  const handleAnswerSelect = (questionIndex, answer) => {
    setAnswers({ ...answers, [questionIndex]: answer });
  };

  const handleNext = () => {
    if (currentQuestion < parsedQuestions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
      setAudioCompleted(false);
      setShowTranscript(false);
    }
  };

  const handlePrevious = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(currentQuestion - 1);
      setAudioCompleted(true);
      setShowTranscript(false);
    }
  };

  const handleFinish = () => {
    setIsFinished(true);
  };

  // Auto-advance to next section after showing results
  useEffect(() => {
    if (isFinished && parsedQuestions.length > 0) {
      const sectionsOrder = JSON.parse(sessionStorage.getItem('sectionsOrder') || '[]');
      const currentSectionIndex = sectionsOrder.indexOf('Listening');
      
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
  }, [isFinished, parsedQuestions.length]);

  const handlePlayAudio = () => {
    const question = parsedQuestions[currentQuestion];
    if (!question) return;
    setIsAudioPlaying(true);

    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      let textToSpeak = '';
      if (question.conversation) textToSpeak = question.conversation;
      else if (question.questionText) textToSpeak = question.questionText;

      if (textToSpeak) {
        const utterance = new SpeechSynthesisUtterance(textToSpeak);
        utterance.lang = 'en-US';
        utterance.rate = 0.9;
        utterance.pitch = 1;
        utterance.onend = () => { setIsAudioPlaying(false); setAudioCompleted(true); };
        utterance.onerror = () => { setIsAudioPlaying(false); setAudioCompleted(true); };
        window.speechSynthesis.speak(utterance);
      } else {
        setTimeout(() => { setIsAudioPlaying(false); setAudioCompleted(true); }, 1000);
      }
    } else {
      setTimeout(() => { setIsAudioPlaying(false); setAudioCompleted(true); }, 2000);
    }
  };

  const toggleTranscript = () => setShowTranscript(!showTranscript);

  // Compute result counts (correct/incorrect/unknown/unanswered)
  const computeResults = () => {
    let correct = 0, incorrect = 0, unknown = 0, unanswered = 0;
    parsedQuestions.forEach((q, idx) => {
      const userAns = answers[idx];
      if (!userAns) {
        unanswered += 1;
        return;
      }
      // If question has a correctAnswer field, compare
      if (q.correctAnswer) {
        const correctVal = String(q.correctAnswer).trim().toUpperCase();
        const userVal = String(userAns).trim().toUpperCase();
        console.log(`Q${idx+1}: user=${userVal}, correct=${correctVal}, match=${userVal === correctVal}`);
        if (userVal === correctVal) correct += 1;
        else incorrect += 1;
      } else {
        console.log(`Q${idx+1}: NO correctAnswer (module=${q.module}, number=${q.number})`);
        unknown += 1; // cannot grade
      }
    });
    const answered = correct + incorrect + unknown;
    return { correct, incorrect, unknown, unanswered, answered };
  };

  // Finished screen
  if (isFinished) {
    const answeredCount = Object.keys(answers).length;
    const percentage = parsedQuestions.length ? ((answeredCount / parsedQuestions.length) * 100).toFixed(1) : 0;
    const results = computeResults();
    const totalScore = results.correct + results.incorrect;
    const scorePercentage = totalScore > 0 ? Math.round((results.correct / totalScore) * 100) : 0;
    
    return (
      <div className="listening-practice">
        <motion.div 
          className="results-panel"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          style={{ maxWidth: '800px', margin: '2rem auto', padding: '2rem', background: 'white', borderRadius: '16px', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
        >
          <h1 style={{ textAlign: 'center', marginBottom: '2rem', color: '#333' }}>🎉 Listening Section Completed!</h1>
          
          <div className="results-summary">
            <div className="score-card" style={{ textAlign: 'center', marginBottom: '2rem' }}>
              <h2 style={{ color: '#667eea', marginBottom: '1rem' }}>Your Score</h2>
              <div className="score-display">
                <div className="score-value" style={{ fontSize: '4rem', fontWeight: 'bold', color: '#667eea' }}>
                  {scorePercentage}%
                </div>
                <div className="score-label" style={{ fontSize: '1.2rem', color: '#666' }}>
                  {results.correct} out of {totalScore} answered questions
                </div>
              </div>
            </div>
            
            <div className="stats-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem', marginBottom: '2rem' }}>
              <div className="stat-box" style={{ padding: '1.5rem', background: '#e8f5e9', borderRadius: '12px', textAlign: 'center' }}>
                <div style={{ fontSize: '2.5rem', marginBottom: '0.5rem' }}>✓</div>
                <div style={{ fontSize: '1.8rem', fontWeight: 'bold', color: '#4CAF50' }}>{results.correct}</div>
                <div style={{ fontSize: '0.9rem', color: '#666' }}>Correct</div>
              </div>
              <div className="stat-box" style={{ padding: '1.5rem', background: '#ffebee', borderRadius: '12px', textAlign: 'center' }}>
                <div style={{ fontSize: '2.5rem', marginBottom: '0.5rem' }}>✗</div>
                <div style={{ fontSize: '1.8rem', fontWeight: 'bold', color: '#f44336' }}>{results.incorrect}</div>
                <div style={{ fontSize: '0.9rem', color: '#666' }}>Wrong</div>
              </div>
              <div className="stat-box" style={{ padding: '1.5rem', background: '#e3f2fd', borderRadius: '12px', textAlign: 'center' }}>
                <div style={{ fontSize: '2.5rem', marginBottom: '0.5rem' }}>⊘</div>
                <div style={{ fontSize: '1.8rem', fontWeight: 'bold', color: '#2196F3' }}>{results.unanswered}</div>
                <div style={{ fontSize: '0.9rem', color: '#666' }}>Unanswered</div>
              </div>
            </div>
            
            <div style={{ padding: '1rem', background: 'rgba(102, 126, 234, 0.1)', borderRadius: '8px', marginBottom: '1.5rem' }}>
              <p style={{ margin: 0, fontSize: '0.95rem', color: '#555', textAlign: 'center' }}>
                <strong>Total Questions:</strong> {parsedQuestions.length} | 
                <strong> Answered:</strong> {answeredCount} | 
                <strong> Completion Rate:</strong> {percentage}%
              </p>
            </div>
          </div>
          
          <button 
            onClick={() => window.location.href = '/test-generator'} 
            className="btn-primary"
            style={{ width: '100%', padding: '12px', fontSize: '1rem', marginTop: '1rem' }}
          >
            Yeni Test Oluştur
          </button>
        </motion.div>
      </div>
    );
  }

  // Loading / no test data
  if (!testData || (timeLeft === 0 && !isFinished && !showResumePrompt)) {
    return (
      <div className="listening-practice">
        <div className="loading">
          <div className="spinner"></div>
          <p>Listening testi yükleniyor...</p>
        </div>
      </div>
    );
  }

  // Resume screen
  if (showResumePrompt) {
    return (
      <div className="listening-practice">
        <motion.div 
          className="start-screen"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
        >
          <h1>🔄 Devam Et veya Baştan Başla</h1>
          <p>Bu bölümde yarım kalmış bir testiniz var.</p>
          <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', marginTop: '2rem' }}>
            <button onClick={handleResumeSession} className="start-btn" style={{ margin: 0, fontSize: '1rem' }}>
              ▶️ Kaldığım Yerden Devam Et
            </button>
            <button onClick={handleRestartSession} className="start-btn" style={{ margin: 0, background: '#f44336', fontSize: '1rem' }}>
              🔄 Baştan Başla
            </button>
          </div>
        </motion.div>
      </div>
    );
  }

  // Start screen
  if (!isStarted) {
    return (
      <motion.div className="listening-practice" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
        <div className="start-screen">
          <h1>Listening Bölümü</h1>
          <div className="test-info">
            <div className="info-card"><h3>Soru Sayısı</h3><p>{parsedQuestions.length} öğe</p></div>
            <div className="info-card"><h3>Süre</h3><p>{testData.duration} dakika</p></div>
            <div className="info-card">
              <h3>Görev Türü</h3>
              <ul className="task-list">{testData.taskTypes.map((task, index) => <li key={index}>{task}</li>)}</ul>
            </div>
          </div>
          <div className="instructions">
            <h3>📢 Talimatlar</h3>
            <ul>
              <li>Her ses kaydını dikkatlice dinleyin</li>
              <li>Ses kaydı bittikten sonra sorular görünecektir</li>
              <li>İsterseniz transkripti görüntüleyebilirsiniz</li>
              <li>Her soruya sadece bir cevap seçin</li>
              <li>Süre bittiğinde test otomatik olarak sonlandırılacak</li>
            </ul>
          </div>
          <button onClick={handleStart} className="btn-start">Teste Başla</button>
        </div>
      </motion.div>
    );
  }

  if (isPaused) {
    return (
      <motion.div className="listening-practice" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
        <div className="start-screen">
          <h1>⏱️ Pause</h1>
          <p>Test duraklatıldı. Süre işlemiyor.</p>
          <button onClick={handleResume} className="btn-start">
            ▶️ Devam Et
          </button>
        </div>
      </motion.div>
    );
  }

  const question = parsedQuestions[currentQuestion];

  const getQuestionTypeLabel = (type) => {
    switch(type) {
      case 'best-response': return 'En iyi yanıtı seçin';
      case 'conversation': return 'Konuşmayı dinleyin';
      case 'announcement': return 'Duyuruyu dinleyin';
      case 'talk': return 'Konuşmayı dinleyin';
      default: return 'Soruyu yanıtlayın';
    }
  };

  const { correct, incorrect, unknown, unanswered, answered } = computeResults();

  return (
    <motion.div className="listening-practice" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
      <div className="test-header">
        <div className="test-progress">
          <span>Soru {parsedQuestions[currentQuestion]?.globalNumber || currentQuestion + 1} / {parsedQuestions.length}</span>
          <div className="progress-bar"><div className="progress-fill" style={{ width: `${((currentQuestion + 1) / parsedQuestions.length) * 100}%` }}></div></div>
        </div>
        <div className={`timer ${timeLeft < 300 ? 'warning' : ''}`} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          ⏱️ {formatTime(timeLeft)}
          {isStarted && !isFinished && (
            <button 
              onClick={handlePause} 
              style={{
                background: 'none', border: '1px solid #ddd', borderRadius: '4px', padding: '4px 8px',
                cursor: 'pointer', fontSize: '12px', color: '#666',
                display: 'flex', alignItems: 'center', justifyContent: 'center'
              }}
            >
              ⏸️ Duraklat
            </button>
          )}
        </div>
        <div className="live-results" style={{ marginLeft: '1rem' }}>
          <span style={{ marginRight: '0.75rem' }}>Cevaplanan: {answered}</span>
          <span style={{ marginRight: '0.75rem' }}>✔️ {correct}</span>
          <span style={{ marginRight: '0.75rem' }}>❌ {incorrect}</span>
          <span style={{ marginRight: '0.75rem' }}>❓ {unknown}</span>
          <span>— {unanswered} boş</span>
        </div>
      </div>

      <div className="listening-content">
        <div className="info-card" style={{ marginBottom: '1rem', marginTop: '0.5rem' }}>
          <span>En iyi yanıtı seçin. Devam edebilirsiniz.</span>
        </div>

        <div className="question-toggle-section" style={{ marginBottom: '1rem' }}>
          <button onClick={() => setShowTranscript(v => !v)} className="btn-transcript-toggle">{showTranscript ? '🗣️ Soruyu Gizle' : '🗣️ Soruyu Göster'}</button>
        </div>

        {showTranscript && question?.conversation && (
          <div className="conversation-box" style={{ fontWeight: 'bold', fontSize: '1.1rem', color: '#222', border: '1px solid #ddd', borderRadius: '8px', padding: '0.75rem', marginBottom: '1rem' }}>
            <p className="conversation-text">{question.conversation}</p>
          </div>
        )}

        <div className="audio-section">
          <div className="audio-player">
            <div className="audio-icon">{isAudioPlaying ? '🔊' : '🎧'}</div>
            <h3>{getQuestionTypeLabel(question?.type)}</h3>

            {!audioCompleted ? (
              <button onClick={handlePlayAudio} className="btn-play-audio" disabled={isAudioPlaying}>{isAudioPlaying ? '▶️ Oynatılıyor...' : '▶️ Ses Kaydını Oynat'}</button>
            ) : (
              <div className="audio-status">
                <span className="status-icon">✅</span>
                <span>Devam edebilirsiniz</span>
                <button onClick={handlePlayAudio} className="btn-replay-audio" style={{ marginLeft: '1rem' }}>🔁 Tekrar Oynat</button>
              </div>
            )}

            {audioCompleted && question?.conversation && (
              <div className="transcript-section">
                <button onClick={toggleTranscript} className="btn-transcript">{showTranscript ? '📝 Diyaloğu Gizle' : '📝 Diyaloğu Göster'}</button>
                {showTranscript && (
                  <div className="transcript-content"><p>{question.conversation}</p></div>
                )}
              </div>
            )}
          </div>

          {audioCompleted && question && (
            <motion.div className="question-panel" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
              {showTranscript && <h3 className="question-text">{question.questionText}</h3>}
              <div className="answer-options">
                {question.options && question.options.map((option, index) => (
                  <label key={index} className={`option ${answers[currentQuestion] === option.letter ? 'selected' : ''}`}>
                    <input type="radio" name={`question-${currentQuestion}`} value={option.letter} checked={answers[currentQuestion] === option.letter} onChange={() => handleAnswerSelect(currentQuestion, option.letter)} />
                    <span className="option-letter">{option.letter}</span>
                    <span className="option-text">{option.text}</span>
                  </label>
                ))}
              </div>
            </motion.div>
          )}
        </div>
      </div>

      <div className="test-navigation">
        <button onClick={handlePrevious} disabled={currentQuestion === 0} className="btn-nav">← Önceki</button>
        <div className="nav-center"><span className="answered-count">{Object.keys(answers).length} / {parsedQuestions.length} cevaplandı</span></div>
        {currentQuestion === parsedQuestions.length - 1 ? (
          <button onClick={handleFinish} className="btn-finish">Testi Bitir</button>
        ) : (
          <button onClick={handleNext} className="btn-nav">Sonraki →</button>
        )}
      </div>
    </motion.div>
  );
};

export default ListeningPractice;
