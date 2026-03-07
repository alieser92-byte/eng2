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
  const [showEvalModal, setShowEvalModal] = useState(false);
  const [evalPrompt, setEvalPrompt] = useState('');
  const [evaluationResults, setEvaluationResults] = useState(null);

  const mediaRecorderRef = useRef(null);
  const recognitionRef = useRef(null);
  const audioStreamRef = useRef(null);
  const isRecordingRef = useRef(false); // Separate ref for audio stream

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
    // Web Speech API setup - only initialize once
    if ('webkitSpeechRecognition' in window) {
      const recognition = new window.webkitSpeechRecognition();
      recognition.continuous = true; // Keep listening
      recognition.interimResults = true;
      recognition.lang = 'en-US';
      recognition.maxAlternatives = 1;

      recognition.onresult = (event) => {
        let fullTranscript = '';

        // Get all results, not just from resultIndex
        for (let i = 0; i < event.results.length; i++) {
          const result = event.results[i];
          fullTranscript += result[0].transcript + (result.isFinal ? ' ' : '');
        }

        setTranscript(fullTranscript.trim());
      };

      recognition.onerror = (event) => {
        console.error('Speech recognition error:', event.error);
        if (event.error === 'aborted') {
          // User stopped recording intentionally, ignore
          return;
        }
        if (event.error === 'no-speech') {
          // No speech detected - this will trigger onend, handle cleanup there
          console.log('No speech detected, will handle in onend');
          return;
        }
        // For other errors, log but don't break the recording
        console.error('Speech recognition error (non-critical):', event.error);
      };

      recognition.onend = () => {
        console.log('Recognition ended - isRecording:', isRecordingRef.current);
        
        // If we're still supposed to be recording, this is an unexpected stop
        // (e.g., due to no-speech timeout). Clean up everything.
        if (isRecordingRef.current) {
          console.log('Unexpected recognition end, cleaning up recording state');
          
          // Stop media recorder
          if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
            try {
              mediaRecorderRef.current.stop();
            } catch (e) {
              console.log('Error stopping mediaRecorder:', e);
            }
          }
          
          // Stop audio tracks
          if (audioStreamRef.current) {
            audioStreamRef.current.getTracks().forEach(track => track.stop());
            audioStreamRef.current = null;
          }
          
          // Reset recording state
          setIsRecording(false);
          isRecordingRef.current = false;
          console.log('Recording state reset due to recognition end');
        }
      };

      recognitionRef.current = recognition;
    }

    // Cleanup on unmount
    return () => {
      if (recognitionRef.current) {
        try {
          recognitionRef.current.abort();
        } catch (e) {
          console.log('Recognition cleanup error:', e);
        }
      }
      if (audioStreamRef.current) {
        audioStreamRef.current.getTracks().forEach(track => track.stop());
        audioStreamRef.current = null;
      }
      if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
        try {
          mediaRecorderRef.current.stop();
        } catch (e) {
          console.log('MediaRecorder cleanup error:', e);
        }
      }
    };
  }, []); // Empty dependency - run only once on mount

  const startPractice = (type) => {
    setTaskType(type);
    const questions = toeflQuestions[type];
    const randomQuestion = questions[Math.floor(Math.random() * questions.length)];
    setCurrentQuestion(randomQuestion);
    setConversation([{ role: 'system', text: randomQuestion, time: new Date() }]);
  };

  const startRecording = async () => {
    if (isRecordingRef.current) {
      console.log('Already recording, ignoring start');
      return;
    }
    
    console.log('=== STARTING RECORDING ===');
    
    try {
      // First check if microphone permission is available
      if (navigator.permissions && navigator.permissions.query) {
        try {
          const permissionStatus = await navigator.permissions.query({ name: 'microphone' });
          if (permissionStatus.state === 'denied') {
            alert('Mikrofon erişimi reddedildi. Lütfen tarayıcı ayarlarından mikrofon iznini açın:\n\n1. Adres çubuğunun solundaki kilit/mikrofon ikonuna tıklayın\n2. Mikrofon iznini "İzin ver" olarak ayarlayın\n3. Sayfayı yenileyin');
            return;
          }
        } catch (e) {
          // Some browsers don't support permissions API, continue anyway
          console.log('Permission API not supported:', e);
        }
      }

      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      audioStreamRef.current = stream; // Store stream separately for cleanup

      const audioChunks = [];
      mediaRecorder.ondataavailable = (event) => {
        audioChunks.push(event.data);
      };

      mediaRecorder.onstop = () => {
        const audioBlob = new Blob(audioChunks, { type: 'audio/wav' });
        // Don't do cleanup here, let handleRecordAnswer do it
        // Just create the blob for potential AI processing
      };

      mediaRecorder.start();
      console.log('MediaRecorder started');
      
      // Start speech recognition
      if (recognitionRef.current) {
        try {
          recognitionRef.current.start();
          console.log('Recognition started');
        } catch (e) {
          console.log('Recognition start error (may already be running):', e);
          // If recognition fails to start, it's not critical - continue with MediaRecorder only
        }
      }
      
      // Only set recording state to true AFTER everything started successfully
      isRecordingRef.current = true;
      setIsRecording(true);
      setTranscript(''); // Clear previous transcript
      console.log('Recording fully started, transcript cleared');
    } catch (error) {
      console.error('Error starting recording:', error);
      
      // Reset states on error (in case something was partially started)
      setIsRecording(false);
      isRecordingRef.current = false;
      
      // Clean up any partially started resources
      if (audioStreamRef.current) {
        audioStreamRef.current.getTracks().forEach(track => track.stop());
        audioStreamRef.current = null;
      }
      if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
        try {
          mediaRecorderRef.current.stop();
        } catch (e) {
          console.log('Error stopping mediaRecorder during cleanup:', e);
        }
      }
      
      // More specific error messages
      if (error.name === 'NotAllowedError' || error.name === 'PermissionDeniedError') {
        alert('Mikrofon erişimi reddedildi.\n\nÇözüm:\n1. Tarayıcı adres çubuğunun solundaki kilit/mikrofon ikonuna tıklayın\n2. Mikrofon iznini "İzin ver" olarak değiştirin\n3. Sayfayı yenileyin (F5)');
      } else if (error.name === 'NotFoundError' || error.name === 'DevicesNotFoundError') {
        alert('Mikrofon bulunamadı. Lütfen mikrofonunuzun bağlı olduğundan emin olun.');
      } else if (error.name === 'NotReadableError') {
        alert('Mikrofon başka bir uygulama tarafından kullanılıyor. Lütfen diğer uygulamaları kapatın.');
      } else {
        alert('Mikrofon erişimi alınamadı: ' + error.message + '\n\nLütfen tarayıcı ayarlarından mikrofon iznini kontrol edin.');
      }
    }
  };

  const stopRecording = () => {
    if (!isRecordingRef.current) {
      console.log('Not recording, ignoring stop');
      return;
    }
    
    console.log('=== STOPPING RECORDING (Practice Mode) ===');
    
    try {
      // 1. Set flag to false immediately
      setIsRecording(false);
      isRecordingRef.current = false;
      
      // 2. Stop speech recognition first
      if (recognitionRef.current) {
        try {
          recognitionRef.current.abort();
          console.log('✓ Recognition aborted');
        } catch (e) {
          console.log('Recognition stop error:', e);
        }
      }
      
      // 3. Stop media recorder
      if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
        try {
          mediaRecorderRef.current.stop();
          console.log('✓ MediaRecorder stopped');
        } catch (e) {
          console.log('MediaRecorder stop error:', e);
        }
      }
      
      // 4. Stop all media stream tracks
      if (audioStreamRef.current) {
        audioStreamRef.current.getTracks().forEach(track => {
          try {
            track.stop();
            console.log('✓ Track stopped:', track.label);
          } catch (e) {
            console.log('Track stop error:', e);
          }
        });
        audioStreamRef.current = null;
      }

      // Add user message to conversation
      setConversation(prev => [
        ...prev,
        { role: 'user', text: transcript, time: new Date() }
      ]);
      
      console.log('=== RECORDING STOPPED SUCCESSFULLY ===');
    } catch (err) {
      console.error('Error in stopRecording:', err);
    }
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

  // Auto-advance to next section after showing results
  useEffect(() => {
    if (isFinished && parsedQuestions.length > 0) {
      const sectionsOrder = JSON.parse(sessionStorage.getItem('sectionsOrder') || '[]');
      const currentSectionIndex = sectionsOrder.indexOf('Speaking');
      
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

  const handleEvaluateAllAnswers = () => {
    // Generate prompt for all answered questions
    const answeredQuestions = Object.entries(answers).map(([idx, answer]) => {
      const q = parsedQuestions[parseInt(idx)];
      return `**Question ${q.globalNumber || q.number}** (${q.type === 'listen-repeat' ? 'Listen and Repeat' : 'Interview'}):
**Prompt:** ${q.prompt}
**Student Response:** ${answer}
`;
    }).join('\n---\n\n');

    const fullPrompt = `You are an expert TOEFL Speaking evaluator. Evaluate the following speaking responses:

${answeredQuestions}

For each response, provide:
1. **Score (0-4)**: Rate delivery, language use, and topic development
2. **Feedback**: Specific comments on pronunciation, grammar, vocabulary, and content
3. **Improvements**: Actionable suggestions

Return your evaluation in this JSON format:
{
  "overallScore": 24,
  "responses": [
    {
      "questionNumber": 1,
      "score": 3.5,
      "delivery": "Clear pronunciation with minor hesitations...",
      "languageUse": "Good vocabulary range, some grammatical errors...",
      "topicDevelopment": "Well-structured response...",
      "improvements": ["Practice reduced hesitation", "Review past tense usage"]
    }
  ],
  "overallFeedback": "Your speaking shows good progress..."
}`;

    setEvalPrompt(fullPrompt);
    setShowEvalModal(true);
  };

  const handleEvalResponse = (aiContent) => {
    try {
      const jsonStart = aiContent.indexOf('{');
      const jsonEnd = aiContent.lastIndexOf('}');
      
      if (jsonStart >= 0 && jsonEnd > jsonStart) {
        const jsonStr = aiContent.substring(jsonStart, jsonEnd + 1);
        const evalData = JSON.parse(jsonStr);
        setEvaluationResults(evalData);
      } else {
        // Fallback: parse as text
        setEvaluationResults({
          overallScore: 20,
          overallFeedback: aiContent,
          responses: []
        });
      }
      setShowEvalModal(false);
    } catch (error) {
      console.error('Error parsing evaluation:', error);
      alert('AI yanıtı işlenirken hata oluştu. Lütfen tekrar deneyin.');
    }
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

  const handleRecordAnswer = async () => {
    console.log('handleRecordAnswer called, isRecordingRef:', isRecordingRef.current, 'isRecording state:', isRecording);
    
    if (isRecordingRef.current) {
      console.log('=== STOPPING RECORDING ===');
      
      try {
        // 1. IMMEDIATELY set flag to false to update UI
        setIsRecording(false);
        isRecordingRef.current = false;
        
        // 2. Stop speech recognition FIRST (most important)
        if (recognitionRef.current) {
          try {
            recognitionRef.current.abort(); // Use abort instead of stop for immediate effect
            console.log('✓ Recognition aborted');
          } catch (e) {
            console.log('Recognition abort error:', e);
          }
        }
        
        // 3. Stop media recorder
        if (mediaRecorderRef.current) {
          try {
            if (mediaRecorderRef.current.state === 'recording') {
              mediaRecorderRef.current.stop();
              console.log('✓ MediaRecorder stopped');
            }
          } catch (e) {
            console.log('MediaRecorder stop error:', e);
          }
        }
        
        // 4. Stop and release all audio tracks IMMEDIATELY
        if (audioStreamRef.current) {
          const tracks = audioStreamRef.current.getTracks();
          console.log('Stopping', tracks.length, 'audio tracks');
          tracks.forEach(track => {
            try {
              track.stop();
              console.log('✓ Track stopped:', track.label);
            } catch (e) {
              console.log('Track stop error:', e);
            }
          });
          audioStreamRef.current = null;
        }
        
        // 5. Save the answer with current transcript
        const currentTranscript = transcript.trim();
        if (currentTranscript) {
          setAnswers(prev => ({
            ...prev,
            [currentQuestionIndex]: currentTranscript
          }));
          console.log('✓ Answer saved:', currentTranscript.substring(0, 50) + '...');
        }
        
        console.log('=== RECORDING STOPPED SUCCESSFULLY ===');
      } catch (err) {
        console.error('Error stopping recording:', err);
      }
    } else {
      console.log('=== STARTING RECORDING ===');
      await startRecording();
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
          <div className="results-container" style={{ maxWidth: '900px', margin: '2rem auto', padding: '2rem', background: 'white', borderRadius: '16px', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}>
            <h2 style={{ textAlign: 'center', marginBottom: '2rem' }}>🎉 Speaking Bölümü Tamamlandı!</h2>
            
            <div className="results-stats" style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem', marginBottom: '2rem' }}>
              <div className="stat" style={{ padding: '1.5rem', background: '#e3f2fd', borderRadius: '12px', textAlign: 'center' }}>
                <span className="stat-value" style={{ fontSize: '2rem', fontWeight: 'bold', color: '#2196F3', display: 'block' }}>{answeredCount}</span>
                <span className="stat-label" style={{ fontSize: '0.9rem', color: '#666' }}>Cevaplanan Soru</span>
              </div>
              <div className="stat" style={{ padding: '1.5rem', background: '#f3e5f5', borderRadius: '12px', textAlign: 'center' }}>
                <span className="stat-value" style={{ fontSize: '2rem', fontWeight: 'bold', color: '#9C27B0', display: 'block' }}>{parsedQuestions.length}</span>
                <span className="stat-label" style={{ fontSize: '0.9rem', color: '#666' }}>Toplam Soru</span>
              </div>
              <div className="stat" style={{ padding: '1.5rem', background: '#e8f5e9', borderRadius: '12px', textAlign: 'center' }}>
                <span className="stat-value" style={{ fontSize: '2rem', fontWeight: 'bold', color: '#4CAF50', display: 'block' }}>{percentage}%</span>
                <span className="stat-label" style={{ fontSize: '0.9rem', color: '#666' }}>Tamamlanma</span>
              </div>
            </div>

            {answeredCount > 0 && !evaluationResults && (
              <div style={{ marginBottom: '1.5rem', padding: '1rem', background: '#fff3cd', borderRadius: '8px', border: '1px solid #ffc107' }}>
                <p style={{ margin: 0, fontSize: '0.95rem', color: '#856404' }}>
                  💡 Cevaplarınızı AI ile değerlendirin ve detaylı geri bildirim alın!
                </p>
                <button 
                  onClick={handleEvaluateAllAnswers}
                  className="btn-primary"
                  style={{ width: '100%', padding: '12px', fontSize: '1rem', marginTop: '1rem', background: '#667eea', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer' }}
                >
                  🤖 Cevapları AI ile Değerlendir
                </button>
              </div>
            )}

            {evaluationResults && (
              <div style={{ marginBottom: '2rem', padding: '1.5rem', background: '#f8f9fa', borderRadius: '12px' }}>
                <h3 style={{ marginBottom: '1rem', color: '#667eea' }}>📊 AI Değerlendirme Sonuçları</h3>
                <div style={{ padding: '1rem', background: 'white', borderRadius: '8px', marginBottom: '1rem', textAlign: 'center' }}>
                  <div style={{ fontSize: '3rem', fontWeight: 'bold', color: '#667eea' }}>{evaluationResults.overallScore}/30</div>
                  <div style={{ fontSize: '1rem', color: '#666' }}>Genel Puan</div>
                </div>
                
                {evaluationResults.overallFeedback && (
                  <div style={{ padding: '1rem', background: 'white', borderRadius: '8px', marginBottom: '1rem' }}>
                    <h4 style={{ marginBottom: '0.5rem', color: '#333' }}>📝 Genel Değerlendirme</h4>
                    <p style={{ margin: 0, lineHeight: '1.6', color: '#666' }}>{evaluationResults.overallFeedback}</p>
                  </div>
                )}

                {evaluationResults.responses?.map((resp, idx) => (
                  <div key={idx} style={{ padding: '1rem', background: 'white', borderRadius: '8px', marginBottom: '1rem' }}>
                    <h4 style={{ marginBottom: '0.75rem', color: '#667eea' }}>Soru {resp.questionNumber} - Puan: {resp.score}/4</h4>
                    {resp.delivery && <p style={{ margin: '0.5rem 0', fontSize: '0.9rem' }}><strong>🎤 Delivery:</strong> {resp.delivery}</p>}
                    {resp.languageUse && <p style={{ margin: '0.5rem 0', fontSize: '0.9rem' }}><strong>📚 Language Use:</strong> {resp.languageUse}</p>}
                    {resp.topicDevelopment && <p style={{ margin: '0.5rem 0', fontSize: '0.9rem' }}><strong>💡 Topic Development:</strong> {resp.topicDevelopment}</p>}
                    {resp.improvements && resp.improvements.length > 0 && (
                      <div style={{ marginTop: '0.75rem', padding: '0.75rem', background: '#e8f5e9', borderRadius: '6px' }}>
                        <strong style={{ fontSize: '0.9rem', color: '#2e7d32' }}>✨ İyileştirme Önerileri:</strong>
                        <ul style={{ margin: '0.5rem 0 0 1.5rem', padding: 0 }}>
                          {resp.improvements.map((imp, i) => <li key={i} style={{ fontSize: '0.85rem', color: '#555' }}>{imp}</li>)}
                        </ul>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}

            <button onClick={() => window.location.href = '/test-generator'} className="btn-primary" style={{ width: '100%', padding: '12px', fontSize: '1rem' }}>
              Yeni Test Oluştur
            </button>
          </div>
          
          <AIPromptModal
            isOpen={showEvalModal}
            onClose={() => setShowEvalModal(false)}
            prompt={evalPrompt}
            onSubmitResponse={handleEvalResponse}
            title="🎤 AI Değerlendirme"
          />
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
            <span>Soru {parsedQuestions[currentQuestionIndex]?.globalNumber || currentQuestionIndex + 1} / {parsedQuestions.length}</span>
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
              <h3>Soru {question?.globalNumber || question?.number}</h3>
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
            <button onClick={handlePreviousQuestion} disabled={currentQuestionIndex === 0} className="btn-nav">← Önceki</button>
            <div className="nav-center">
              <span className="answered-count">{Object.keys(answers).length} / {parsedQuestions.length} cevaplandı</span>
            </div>
            {currentQuestionIndex === parsedQuestions.length - 1 ? (
              <button onClick={handleFinishTest} className="btn-finish">Testi Bitir</button>
            ) : (
              <button onClick={handleNextQuestion} className="btn-nav">Sonraki →</button>
            )}
          </div>
        
        <AIPromptModal
          isOpen={showEvalModal}
          onClose={() => setShowEvalModal(false)}
          prompt={evalPrompt}
          onSubmitResponse={handleEvalResponse}
          title="🎤 AI Değerlendirme"
        />
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
