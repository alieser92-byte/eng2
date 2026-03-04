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
  const [isAudioPlaying, setIsAudioPlaying] = useState(false);
  const [audioCompleted, setAudioCompleted] = useState(false);
  const [showTranscript, setShowTranscript] = useState(false);
  
  const audioRef = useRef(null);

  useEffect(() => {
    const storedTest = sessionStorage.getItem('currentTest');
    if (storedTest) {
      const test = JSON.parse(storedTest);
      const listeningSection = test.sections.find(s => s.name === 'Listening');
      
      if (listeningSection) {
        // Parse questions from AI content
        const questions = parseListeningContent(test.aiGeneratedContent);
        
        if (questions.length > 0) {
          setParsedQuestions(questions);
        } else {
          // Fallback to mock questions if parsing fails
          const questionCount = typeof listeningSection.questions === 'number' 
            ? listeningSection.questions 
            : 10;
          
          const mockQuestions = Array.from({ length: questionCount }, (_, i) => ({
            id: i + 1,
            type: 'best-response',
            number: i + 1,
            conversation: `Sample conversation for question ${i + 1}`,
            questionText: `Question ${i + 1}: What is the main idea?`,
            options: [
              { letter: 'A', text: 'Option A' },
              { letter: 'B', text: 'Option B' },
              { letter: 'C', text: 'Option C' },
              { letter: 'D', text: 'Option D' }
            ]
          }));
          setParsedQuestions(mockQuestions);
        }
        
        const processedSection = {
          ...listeningSection,
          duration: listeningSection.timeLimit,
          taskTypes: listeningSection.tasks || []
        };
        
        setTestData(processedSection);
        setTimeLeft(listeningSection.timeLimit * 60);
      }
    }
  }, []);

  useEffect(() => {
    if (isStarted && timeLeft > 0 && !isFinished) {
      const timer = setTimeout(() => {
        setTimeLeft(timeLeft - 1);
      }, 1000);
      return () => clearTimeout(timer);
    } else if (timeLeft === 0 && isStarted) {
      setIsFinished(true);
    }
  }, [timeLeft, isStarted, isFinished]);

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const handleStart = () => {
    setIsStarted(true);
  };

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

  const handlePlayAudio = () => {
    const question = parsedQuestions[currentQuestion];
    if (!question) return;

    setIsAudioPlaying(true);
    
    // Text-to-Speech kullanarak sesi oynat
    if ('speechSynthesis' in window) {
      // Önceki sesi durdur
      window.speechSynthesis.cancel();
      
      // Okunacak metni hazırla
      let textToSpeak = '';
      
      if (question.conversation) {
        textToSpeak = question.conversation;
      } else if (question.questionText) {
        textToSpeak = question.questionText;
      }
      
      if (textToSpeak) {
        const utterance = new SpeechSynthesisUtterance(textToSpeak);
        utterance.lang = 'en-US';
        utterance.rate = 0.9; // Biraz yavaş okusun
        utterance.pitch = 1;
        
        utterance.onend = () => {
          setIsAudioPlaying(false);
          setAudioCompleted(true);
        };
        
        utterance.onerror = () => {
          setIsAudioPlaying(false);
          setAudioCompleted(true);
        };
        
        window.speechSynthesis.speak(utterance);
      } else {
        // Metin yoksa direkt tamamla
        setTimeout(() => {
          setIsAudioPlaying(false);
          setAudioCompleted(true);
        }, 1000);
      }
    } else {
      // SpeechSynthesis desteklenmiyorsa
      setTimeout(() => {
        setIsAudioPlaying(false);
        setAudioCompleted(true);
      }, 2000);
    }
  };

  const toggleTranscript = () => {
    setShowTranscript(!showTranscript);
  };

  if (!testData) {
    return (
      <div className="listening-practice">
        <div className="loading">
          <div className="spinner"></div>
          <p>Listening testi yükleniyor...</p>
        </div>
      </div>
    );
  }

  if (isFinished) {
    const answeredCount = Object.keys(answers).length;
    const percentage = ((answeredCount / parsedQuestions.length) * 100).toFixed(1);
    
    return (
      <motion.div
        className="listening-practice"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
      >
        <div className="results-container">
          <h2>Test Tamamlandı!</h2>
          <div className="results-stats">
            <div className="stat">
              <span className="stat-value">{answeredCount}</span>
              <span className="stat-label">Cevaplanan Soru</span>
            </div>
            <div className="stat">
              <span className="stat-value">{parsedQuestions.length}</span>
              <span className="stat-label">Toplam Soru</span>
            </div>
            <div className="stat">
              <span className="stat-value">{percentage}%</span>
              <span className="stat-label">Tamamlanma</span>
            </div>
          </div>
          <button onClick={() => window.location.href = '/test-generator'} className="btn-primary">
            Yeni Test Oluştur
          </button>
        </div>
      </motion.div>
    );
  }

  if (!isStarted) {
    return (
      <motion.div
        className="listening-practice"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
      >
        <div className="start-screen">
          <h1>Listening Bölümü</h1>
          <div className="test-info">
            <div className="info-card">
              <h3>Soru Sayısı</h3>
              <p>{parsedQuestions.length} öğe</p>
            </div>
            <div className="info-card">
              <h3>Süre</h3>
              <p>{testData.duration} dakika</p>
            </div>
            <div className="info-card">
              <h3>Görev Türü</h3>
              <ul className="task-list">
                {testData.taskTypes.map((task, index) => (
                  <li key={index}>{task}</li>
                ))}
              </ul>
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
          <button onClick={handleStart} className="btn-start">
            Teste Başla
          </button>
        </div>
      </motion.div>
    );
  }

  const question = parsedQuestions[currentQuestion];

  // Get question type label
  const getQuestionTypeLabel = (type) => {
    switch(type) {
      case 'best-response': return 'En iyi yanıtı seçin';
      case 'conversation': return 'Konuşmayı dinleyin';
      case 'announcement': return 'Duyuruyu dinleyin';
      case 'talk': return 'Konuşmayı dinleyin';
      default: return 'Soruyu yanıtlayın';
    }
  };

  return (
    <motion.div
      className="listening-practice"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
    >
      <div className="test-header">
        <div className="test-progress">
          <span>Soru {currentQuestion + 1} / {parsedQuestions.length}</span>
          <div className="progress-bar">
            <div 
              className="progress-fill" 
              style={{ width: `${((currentQuestion + 1) / parsedQuestions.length) * 100}%` }}
            ></div>
          </div>
        </div>
        <div className={`timer ${timeLeft < 300 ? 'warning' : ''}`}>
          ⏱️ {formatTime(timeLeft)}
        </div>
      </div>

      <div className="listening-content">
        <div className="audio-section">
          <div className="audio-player">
            <div className="audio-icon">
              {isAudioPlaying ? '🔊' : '🎧'}
            </div>
            <h3>{getQuestionTypeLabel(question?.type)}</h3>
            
            {question?.conversation && (
              <div className="conversation-box">
                <p className="conversation-text">{question.conversation}</p>
              </div>
            )}
            
            {!audioCompleted ? (
              <button 
                onClick={handlePlayAudio} 
                className="btn-play-audio"
                disabled={isAudioPlaying}
              >
                {isAudioPlaying ? '▶️ Oynatılıyor...' : '▶️ Ses Kaydını Oynat'}
              </button>
            ) : (
              <div className="audio-status">
                <span className="status-icon">✅</span>
                <span>Devam edebilirsiniz</span>
              </div>
            )}

            {audioCompleted && question?.conversation && (
              <div className="transcript-section">
                <button onClick={toggleTranscript} className="btn-transcript">
                  {showTranscript ? '📝 Diyaloğu Gizle' : '📝 Diyaloğu Göster'}
                </button>
                {showTranscript && (
                  <div className="transcript-content">
                    <p>{question.conversation}</p>
                  </div>
                )}
              </div>
            )}
          </div>

          {audioCompleted && question && (
            <motion.div 
              className="question-panel"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <h3 className="question-text">{question.questionText}</h3>
              
              <div className="answer-options">
                {question.options && question.options.map((option, index) => (
                  <label 
                    key={index} 
                    className={`option ${answers[currentQuestion] === option.letter ? 'selected' : ''}`}
                  >
                    <input
                      type="radio"
                      name={`question-${currentQuestion}`}
                      value={option.letter}
                      checked={answers[currentQuestion] === option.letter}
                      onChange={() => handleAnswerSelect(currentQuestion, option.letter)}
                    />
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
        <button 
          onClick={handlePrevious} 
          disabled={currentQuestion === 0}
          className="btn-nav"
        >
          ← Önceki
        </button>
        
        <div className="nav-center">
          <span className="answered-count">
            {Object.keys(answers).length} / {parsedQuestions.length} cevaplandı
          </span>
        </div>

        {currentQuestion === parsedQuestions.length - 1 ? (
          <button onClick={handleFinish} className="btn-finish">
            Testi Bitir
          </button>
        ) : (
          <button 
            onClick={handleNext}
            className="btn-nav"
          >
            Sonraki →
          </button>
        )}
      </div>
    </motion.div>
  );
};

export default ListeningPractice;
