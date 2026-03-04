import React, { useState, useRef, useEffect } from 'react';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import AIPromptModal from '../components/AIPromptModal';
import { generateSpeakingAnalysisPrompt } from '../utils/promptGenerator';
import { parseSpeakingContent } from '../utils/contentParser';
import './SpeakingPractice.css';

function SpeakingPractice() {
  const [isRecording, setIsRecording] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [aiResponse, setAiResponse] = useState('');
  const [conversation, setConversation] = useState([]);
  const [currentQuestion, setCurrentQuestion] = useState(null);
  const [preparationTime, setPreparationTime] = useState(15);
  const [responseTime, setResponseTime] = useState(45);
  const [mode, setMode] = useState('practice'); // practice, test
  const [taskType, setTaskType] = useState('independent');
  const [showPromptModal, setShowPromptModal] = useState(false);
  const [aiPromptText, setAiPromptText] = useState('');
  const [pendingTranscript, setPendingTranscript] = useState('');
  
  // Test mode states
  const [testData, setTestData] = useState(null);
  const [parsedQuestions, setParsedQuestions] = useState([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [isStarted, setIsStarted] = useState(false);
  const [isFinished, setIsFinished] = useState(false);
  const [timeLeft, setTimeLeft] = useState(0);
  const [answers, setAnswers] = useState({});
  const [isPromptPlaying, setIsPromptPlaying] = useState(false);

  const mediaRecorderRef = useRef(null);
  const recognitionRef = useRef(null);

  const toeflQuestions = {
    independent: [
      "Do you agree or disagree with the following statement: Students should be required to take at least one course in ethics. Use specific reasons and examples to support your answer.",
      "Some people prefer to work independently, while others prefer to work as part of a team. Which do you prefer? Use specific reasons and examples to support your answer.",
      "Do you agree or disagree with the following statement: Technology has made the world a better place. Use specific reasons and examples to support your answer."
    ],
    integrated: [
      "The reading passage discusses the benefits of renewable energy. The lecture you just heard presents opposing viewpoints. Summarize the points made in the lecture and explain how they cast doubt on the reading passage.",
      "The professor describes two theories about the extinction of dinosaurs. Using the examples from the lecture, explain the two theories and their supporting evidence."
    ]
  };

  // Check for test mode on mount
  useEffect(() => {
    const storedTest = sessionStorage.getItem('currentTest');
    const storedSection = sessionStorage.getItem('currentSection');
    
    if (storedTest && storedSection === 'Speaking') {
      const test = JSON.parse(storedTest);
      const speakingSection = test.sections.find(s => s.name === 'Speaking');
      
      if (speakingSection) {
        setMode('test');
        
        // Parse questions from AI content
        const questions = parseSpeakingContent(test.aiGeneratedContent);
        
        if (questions.length > 0) {
          setParsedQuestions(questions);
        } else {
          // Fallback mock questions
          const mockQuestions = [
            { type: 'listen-repeat', number: 1, prompt: 'We have a variety of wildlife.', instructions: 'Listen and repeat.' },
            { type: 'listen-repeat', number: 2, prompt: 'Bears, wolves, and large cats are to the right.', instructions: 'Listen and repeat.' },
            { type: 'interview', number: 8, prompt: 'Do you currently live in a big city, a small town, or a village?', instructions: 'Respond to the question.' }
          ];
          setParsedQuestions(mockQuestions);
        }
        
        setTestData(speakingSection);
        setTimeLeft(speakingSection.timeLimit * 60);
      }
    }
  }, []);

  // Timer for test mode
  useEffect(() => {
    if (mode === 'test' && isStarted && timeLeft > 0 && !isFinished) {
      const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
      return () => clearTimeout(timer);
    } else if (mode === 'test' && timeLeft === 0 && isStarted) {
      setIsFinished(true);
    }
  }, [timeLeft, isStarted, isFinished, mode]);

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  useEffect(() => {
    // Web Speech API setup
    if ('webkitSpeechRecognition' in window) {
      const recognition = new window.webkitSpeechRecognition();
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang = 'en-US';

      recognition.onresult = (event) => {
        let interimTranscript = '';
        let finalTranscript = '';

        for (let i = event.resultIndex; i < event.results.length; i++) {
          const transcript = event.results[i][0].transcript;
          if (event.results[i].isFinal) {
            finalTranscript += transcript + ' ';
          } else {
            interimTranscript += transcript;
          }
        }

        setTranscript(finalTranscript + interimTranscript);
      };

      recognitionRef.current = recognition;
    }
  }, []);

  const startPractice = (type) => {
    setTaskType(type);
    const questions = toeflQuestions[type];
    const randomQuestion = questions[Math.floor(Math.random() * questions.length)];
    setCurrentQuestion(randomQuestion);
    setConversation([{ role: 'system', text: randomQuestion, time: new Date() }]);
  };

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;

      const audioChunks = [];
      mediaRecorder.ondataavailable = (event) => {
        audioChunks.push(event.data);
      };

      mediaRecorder.onstop = async () => {
        const audioBlob = new Blob(audioChunks, { type: 'audio/wav' });
        await sendAudioToAI(audioBlob);
      };

      mediaRecorder.start();
      recognitionRef.current?.start();
      setIsRecording(true);
      setTranscript('');
    } catch (error) {
      console.error('Error starting recording:', error);
      alert('Mikrofon erişimi alınamadı. Lütfen izinleri kontrol edin.');
    }
  };

  const stopRecording = () => {
    mediaRecorderRef.current?.stop();
    recognitionRef.current?.stop();
    setIsRecording(false);

    // Add user message to conversation
    setConversation(prev => [
      ...prev,
      { role: 'user', text: transcript, time: new Date() }
    ]);
  };

  const sendAudioToAI = async (audioBlob) => {
    // Instead of calling AI API, show the prompt modal
    setPendingTranscript(transcript);
    const evalPrompt = generateSpeakingAnalysisPrompt(transcript, currentQuestion, 45);
    setAiPromptText(evalPrompt);
    setShowPromptModal(true);
  };

  const handleAISpeakingResponse = (aiContent) => {
    try {
      let feedbackData;
      const jsonStart = aiContent.indexOf('{');
      const jsonEnd = aiContent.lastIndexOf('}');
      
      if (jsonStart >= 0 && jsonEnd > jsonStart) {
        const jsonStr = aiContent.substring(jsonStart, jsonEnd + 1);
        feedbackData = JSON.parse(jsonStr);
      } else {
        feedbackData = {
          overallScore: 20,
          delivery: { score: 3, feedback: aiContent.substring(0, 150) },
          languageUse: { score: 3, feedback: 'See full response.' },
          topicDevelopment: { score: 3, feedback: 'See full response.' },
          improvements: ['See full AI response for details.']
        };
      }

      const aiMsg = feedbackData.delivery?.feedback || 'Değerlendirme tamamlandı.';
      setAiResponse(aiMsg);
      
      setConversation(prev => [
        ...prev,
        { 
          role: 'ai', 
          text: aiMsg,
          feedback: feedbackData,
          time: new Date() 
        }
      ]);
      setShowPromptModal(false);
    } catch (error) {
      console.error('Error parsing AI speaking response:', error);
      setConversation(prev => [
        ...prev,
        { 
          role: 'ai', 
          text: aiContent,
          feedback: {
            overallScore: 20,
            delivery: { score: 3, feedback: aiContent.substring(0, 200) },
            languageUse: { score: 3, feedback: '' },
            topicDevelopment: { score: 3, feedback: '' },
            improvements: []
          },
          time: new Date() 
        }
      ]);
      setShowPromptModal(false);
    }
  };

  // Test mode handlers
  const handleStartTest = () => {
    setIsStarted(true);
  };

  const handleNextQuestion = () => {
    if (currentQuestionIndex < parsedQuestions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
      setTranscript('');
    }
  };

  const handlePreviousQuestion = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(currentQuestionIndex - 1);
    }
  };

  const handleFinishTest = () => {
    setIsFinished(true);
  };

  // Text-to-Speech ile prompt'u oku
  const handlePlayPrompt = () => {
    const question = parsedQuestions[currentQuestionIndex];
    if (!question || isPromptPlaying) return;

    setIsPromptPlaying(true);
    
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      
      const textToSpeak = question.prompt || question.questionText || '';
      
      if (textToSpeak) {
        const utterance = new SpeechSynthesisUtterance(textToSpeak);
        utterance.lang = 'en-US';
        utterance.rate = 0.9;
        utterance.pitch = 1;
        
        utterance.onend = () => {
          setIsPromptPlaying(false);
        };
        
        utterance.onerror = () => {
          setIsPromptPlaying(false);
        };
        
        window.speechSynthesis.speak(utterance);
      } else {
        setIsPromptPlaying(false);
      }
    } else {
      setIsPromptPlaying(false);
    }
  };

  const handleRecordAnswer = () => {
    if (isRecording) {
      mediaRecorderRef.current?.stop();
      recognitionRef.current?.stop();
      setIsRecording(false);
      
      // Save the answer
      setAnswers(prev => ({
        ...prev,
        [currentQuestionIndex]: transcript
      }));
    } else {
      startRecording();
    }
  };

  // ====== TEST MODE RENDER ======
  if (mode === 'test') {
    // Loading state
    if (!testData || parsedQuestions.length === 0) {
      return (
        <div className="speaking-practice">
          <div className="loading">
            <div className="spinner"></div>
            <p>Speaking testi yükleniyor...</p>
          </div>
        </div>
      );
    }

    // Finished state
    if (isFinished) {
      const answeredCount = Object.keys(answers).length;
      const percentage = ((answeredCount / parsedQuestions.length) * 100).toFixed(1);
      
      return (
        <motion.div
          className="speaking-practice"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          <div className="results-container">
            <h2>Speaking Testi Tamamlandı!</h2>
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

    // Start screen
    if (!isStarted) {
      return (
        <motion.div
          className="speaking-practice"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          <div className="start-screen">
            <h1>Speaking Bölümü</h1>
            <div className="test-info">
              <div className="info-card">
                <h3>Soru Sayısı</h3>
                <p>{parsedQuestions.length} öğe</p>
              </div>
              <div className="info-card">
                <h3>Süre</h3>
                <p>{testData.timeLimit} dakika</p>
              </div>
              <div className="info-card">
                <h3>Görev Türü</h3>
                <ul className="task-list">
                  {testData.tasks?.map((task, index) => (
                    <li key={index}>{task}</li>
                  ))}
                </ul>
              </div>
            </div>
            <div className="instructions">
              <h3>📢 Talimatlar</h3>
              <ul>
                <li><strong>Listen and Repeat (1-7):</strong> Cümleyi dinleyin ve tekrarlayın</li>
                <li><strong>Interview (8-11):</strong> Soruları dinleyin ve kendi fikirlerinizle yanıtlayın</li>
                <li>Mikrofon butonuna tıklayarak kayda başlayın</li>
                <li>Kaydı durdurmak için tekrar tıklayın</li>
              </ul>
            </div>
            <button onClick={handleStartTest} className="btn-start">
              Teste Başla
            </button>
          </div>
        </motion.div>
      );
    }

    // Test question view
    const question = parsedQuestions[currentQuestionIndex];

    return (
      <motion.div
        className="speaking-practice"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
      >
        <div className="test-header">
          <div className="test-progress">
            <span>Soru {currentQuestionIndex + 1} / {parsedQuestions.length}</span>
            <div className="progress-bar">
              <div 
                className="progress-fill" 
                style={{ width: `${((currentQuestionIndex + 1) / parsedQuestions.length) * 100}%` }}
              ></div>
            </div>
          </div>
          <div className={`timer ${timeLeft < 60 ? 'warning' : ''}`}>
            ⏱️ {formatTime(timeLeft)}
          </div>
        </div>

        <div className="speaking-test-content">
          <div className="question-section">
            <div className="question-type-badge">
              {question?.type === 'listen-repeat' ? '🎧 Listen and Repeat' : '🎤 Interview'}
            </div>
            
            <div className="question-card">
              <h3>Soru {question?.number}</h3>
              <p className="question-instructions">{question?.instructions}</p>
              
              <div className="prompt-box">
                {question?.type === 'listen-repeat' ? (
                  <>
                    <div className="trainer-label">Trainer:</div>
                    <p className="prompt-text">"{question?.prompt}"</p>
                  </>
                ) : (
                  <>
                    <div className="interviewer-label">Interviewer:</div>
                    <p className="prompt-text">{question?.prompt}</p>
                  </>
                )}
                
                <button 
                  onClick={handlePlayPrompt} 
                  className={`play-prompt-btn ${isPromptPlaying ? 'playing' : ''}`}
                  disabled={isPromptPlaying}
                >
                  {isPromptPlaying ? '🔊 Oynatılıyor...' : '▶️ Sesi Dinle'}
                </button>
              </div>

              <div className="recording-section">
                <div className={`microphone-button ${isRecording ? 'recording' : ''}`}>
                  <button
                    onClick={handleRecordAnswer}
                    className="mic-btn"
                  >
                    {isRecording ? '⏹️' : '🎤'}
                  </button>
                  {isRecording && (
                    <motion.div
                      className="pulse-ring"
                      animate={{
                        scale: [1, 1.5, 1],
                        opacity: [0.5, 0, 0.5]
                      }}
                      transition={{
                        duration: 2,
                        repeat: Infinity
                      }}
                    />
                  )}
                </div>
                <p className="recording-status">
                  {isRecording ? '🔴 Kaydediliyor...' : answers[currentQuestionIndex] ? '✅ Kaydedildi' : '▶️ Mikrofona tıklayın'}
                </p>
              </div>

              {transcript && (
                <div className="live-transcript">
                  <h4>📝 Transkript</h4>
                  <div className="transcript-box">
                    {transcript}
                  </div>
                </div>
              )}

              {answers[currentQuestionIndex] && !isRecording && (
                <div className="saved-answer">
                  <h4>💾 Kaydedilen Cevap</h4>
                  <p>{answers[currentQuestionIndex]}</p>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="test-navigation">
          <button 
            onClick={handlePreviousQuestion} 
            disabled={currentQuestionIndex === 0}
            className="btn-nav"
          >
            ← Önceki
          </button>
          
          <div className="nav-center">
            <span className="answered-count">
              {Object.keys(answers).length} / {parsedQuestions.length} cevaplandı
            </span>
          </div>

          {currentQuestionIndex === parsedQuestions.length - 1 ? (
            <button onClick={handleFinishTest} className="btn-finish">
              Testi Bitir
            </button>
          ) : (
            <button onClick={handleNextQuestion} className="btn-nav">
              Sonraki →
            </button>
          )}
        </div>
      </motion.div>
    );
  }

  // ====== PRACTICE MODE RENDER (Original) ======
  return (
    <div className="speaking-practice">
      <motion.div 
        className="practice-header"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <h1>🎤 Speaking Practice</h1>
        <p>TOEFL formatında konuşma pratiği yapın ve anlık geri bildirim alın</p>
      </motion.div>

      <div className="practice-layout">
        <motion.div 
          className="main-panel"
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2 }}
        >
          {!currentQuestion ? (
            <div className="task-selection">
              <h2>Görev Tipi Seçin</h2>
              <div className="task-cards">
                <div 
                  className="task-card"
                  onClick={() => startPractice('independent')}
                >
                  <div className="task-icon">🗣️</div>
                  <h3>Independent Task</h3>
                  <p>Kişisel görüşünüzü ifade edin</p>
                  <ul>
                    <li>Hazırlık: 15 saniye</li>
                    <li>Konuşma: 45 saniye</li>
                    <li>1 görev</li>
                  </ul>
                  <button className="select-btn">Seç →</button>
                </div>

                <div 
                  className="task-card"
                  onClick={() => startPractice('integrated')}
                >
                  <div className="task-icon">📚</div>
                  <h3>Integrated Task</h3>
                  <p>Okuma ve dinleme üzerine konuşun</p>
                  <ul>
                    <li>Hazırlık: 30 saniye</li>
                    <li>Konuşma: 60 saniye</li>
                    <li>3 görev</li>
                  </ul>
                  <button className="select-btn">Seç →</button>
                </div>
              </div>
            </div>
          ) : (
            <div className="practice-area">
              <div className="question-box">
                <h3>📝 Question {taskType === 'independent' ? '1' : '2'}</h3>
                <p>{currentQuestion}</p>
                <div className="timers">
                  <div className="timer">
                    <span>Hazırlık</span>
                    <span className="time">{preparationTime}s</span>
                  </div>
                  <div className="timer">
                    <span>Konuşma</span>
                    <span className="time">{responseTime}s</span>
                  </div>
                </div>
              </div>

              <div className="recording-area">
                <div className={`microphone-button ${isRecording ? 'recording' : ''}`}>
                  <button
                    onClick={isRecording ? stopRecording : startRecording}
                    className="mic-btn"
                  >
                    {isRecording ? '⏹️' : '🎤'}
                  </button>
                  {isRecording && (
                    <motion.div
                      className="pulse-ring"
                      animate={{
                        scale: [1, 1.5, 1],
                        opacity: [0.5, 0, 0.5]
                      }}
                      transition={{
                        duration: 2,
                        repeat: Infinity
                      }}
                    />
                  )}
                </div>
                <p className="recording-status">
                  {isRecording ? '🔴 Kaydediliyor...' : '▶️ Başlatmak için mikrofona tıklayın'}
                </p>
              </div>

              <div className="live-transcript">
                <h4>📝 Canlı Transkript</h4>
                <div className="transcript-box">
                  {transcript || 'Konuşmaya başladığınızda transkript burada görünecek...'}
                </div>
              </div>
            </div>
          )}
        </motion.div>

        <motion.div 
          className="conversation-panel"
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.3 }}
        >
          <h3>💬 Sohbet Geçmişi & Feedback</h3>
          <div className="conversation-history">
            <AnimatePresence>
              {conversation.map((msg, index) => (
                <motion.div
                  key={index}
                  className={`message ${msg.role}`}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                >
                  <div className="message-header">
                    <span className="role-icon">
                      {msg.role === 'system' ? '❓' : msg.role === 'user' ? '👤' : '🤖'}
                    </span>
                    <span className="timestamp">
                      {msg.time.toLocaleTimeString('tr-TR')}
                    </span>
                  </div>
                  <div className="message-content">{msg.text}</div>
                  
                  {msg.feedback && (
                    <div className="feedback-box">
                      <h5>📊 Değerlendirme</h5>
                      <div className="score-display">
                        <div className="score-item">
                          <span>Genel Puan</span>
                          <span className="score">{msg.feedback.overallScore}/30</span>
                        </div>
                      </div>
                      <div className="feedback-items">
                        <div className="feedback-item">
                          <span>🎯 Delivery:</span>
                          <span>{msg.feedback.delivery?.score}/4</span>
                          <p>{msg.feedback.delivery?.feedback}</p>
                        </div>
                        <div className="feedback-item">
                          <span>📚 Language Use:</span>
                          <span>{msg.feedback.languageUse?.score}/4</span>
                          <p>{msg.feedback.languageUse?.feedback}</p>
                        </div>
                        <div className="feedback-item">
                          <span>💡 Topic Development:</span>
                          <span>{msg.feedback.topicDevelopment?.score}/4</span>
                          <p>{msg.feedback.topicDevelopment?.feedback}</p>
                        </div>
                      </div>
                      <div className="improvements">
                        <h6>✨ İyileştirme Önerileri:</h6>
                        <ul>
                          {msg.feedback.improvements?.map((imp, i) => (
                            <li key={i}>{imp}</li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  )}
                </motion.div>
              ))}
            </AnimatePresence>
          </div>

          {currentQuestion && (
            <button 
              className="new-question-btn"
              onClick={() => {
                setCurrentQuestion(null);
                setConversation([]);
                setTranscript('');
              }}
            >
              🔄 Yeni Soru
            </button>
          )}
        </motion.div>
      </div>

      {/* AI Prompt Modal */}
      <AIPromptModal
        isOpen={showPromptModal}
        onClose={() => setShowPromptModal(false)}
        prompt={aiPromptText}
        onSubmitResponse={handleAISpeakingResponse}
        title="🎤 Konuşma Değerlendirmesi"
      />
    </div>
  );
}

export default SpeakingPractice;
