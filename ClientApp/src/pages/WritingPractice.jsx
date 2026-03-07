import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { motion } from 'framer-motion';
import AIPromptModal from '../components/AIPromptModal';
import { generateWritingEvalPrompt } from '../utils/promptGenerator';
import './WritingPractice.css';

function WritingPractice() {
  const [taskType, setTaskType] = useState(null); // 'integrated' or 'independent'
  const [currentPrompt, setCurrentPrompt] = useState('');
  const [essayContent, setEssayContent] = useState('');
  const [wordCount, setWordCount] = useState(0);
  const [timeRemaining, setTimeRemaining] = useState(1800); // 30 minutes
  const [isTimerRunning, setIsTimerRunning] = useState(false);
  const [evaluation, setEvaluation] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPromptModal, setShowPromptModal] = useState(false);
  const [aiPromptText, setAiPromptText] = useState('');
  const [isLecturePlaying, setIsLecturePlaying] = useState(false);

  const integratedPrompts = [
    {
      reading: "Many corporations have begun implementing work-from-home policies for their employees. This shift is primarily driven by technological advances that make remote work feasible. Companies report increased productivity, reduced overhead costs, and improved employee satisfaction. Studies show that remote workers take fewer sick days and report better work-life balance.",
      listening: "While the passage highlights benefits of remote work, there are significant drawbacks to consider. Remote workers often experience isolation and decreased collaboration with colleagues. Many struggle with work-life boundaries when their home becomes their office. Additionally, companies face challenges in maintaining corporate culture and training new employees effectively in remote settings.",
      prompt: "Summarize the points made in the lecture, being sure to explain how they challenge the specific points made in the reading passage."
    },
    {
      reading: "The use of standardized testing in education has been a subject of debate. Proponents argue that standardized tests provide objective measures of student achievement and help identify areas where schools need improvement. These tests ensure accountability and allow for fair comparisons across different schools and districts.",
      listening: "However, critics argue that standardized testing has serious limitations. Tests often measure only a narrow range of skills and don't capture creativity, critical thinking, or practical abilities. Many teachers report that excessive test preparation takes time away from meaningful learning. Furthermore, test anxiety can significantly impact students' performance, making scores unreliable indicators of actual knowledge.",
      prompt: "Summarize the points made in the lecture, explaining how they cast doubt on the points made in the reading passage."
    }
  ];

  const independentPrompts = [
    "Do you agree or disagree with the following statement? The best way to travel is in a group led by a tour guide. Use specific reasons and examples to support your answer.",
    "Some people believe that the Earth is being harmed by human activity. Others feel that human activity makes the Earth a better place to live. What is your opinion? Use specific reasons and examples to support your answer.",
    "Do you agree or disagree with the following statement? It is more important for students to understand ideas and concepts than it is for them to learn facts. Use specific reasons and examples to support your answer.",
    "Do you agree or disagree with the following statement? Successful people try new things and take risks rather than only doing what they know how to do well. Use specific reasons and examples to support your answer.",
    "Some people prefer to live in a small town. Others prefer to live in a big city. Which place would you prefer to live in? Use specific reasons and details to support your answer."
  ];

  useEffect(() => {
    let interval;
    if (isTimerRunning && timeRemaining > 0) {
      interval = setInterval(() => {
        setTimeRemaining(prev => prev - 1);
      }, 1000);
    } else if (timeRemaining === 0) {
      handleSubmit();
    }
    return () => clearInterval(interval);
  }, [isTimerRunning, timeRemaining]);

  useEffect(() => {
    const words = essayContent.trim().split(/\s+/).filter(word => word.length > 0);
    setWordCount(words.length);
  }, [essayContent]);

  // Cleanup speech synthesis on unmount
  useEffect(() => {
    return () => {
      if (window.speechSynthesis) {
        window.speechSynthesis.cancel();
      }
    };
  }, []);

  const startTask = (type) => {
    // Stop any ongoing speech
    if (window.speechSynthesis) {
      window.speechSynthesis.cancel();
    }
    setIsLecturePlaying(false);
    
    setTaskType(type);
    if (type === 'integrated') {
      const randomPrompt = integratedPrompts[Math.floor(Math.random() * integratedPrompts.length)];
      setCurrentPrompt(randomPrompt);
      setTimeRemaining(1200); // 20 minutes
    } else {
      const randomPrompt = independentPrompts[Math.floor(Math.random() * independentPrompts.length)];
      setCurrentPrompt(randomPrompt);
      setTimeRemaining(1800); // 30 minutes
    }
    setEssayContent('');
    setWordCount(0);
    setEvaluation(null);
    setIsTimerRunning(true);
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const handlePlayLecture = () => {
    if (isLecturePlaying) {
      // Stop speaking
      window.speechSynthesis.cancel();
      setIsLecturePlaying(false);
      return;
    }

    // Start speaking
    if ('speechSynthesis' in window && currentPrompt.listening) {
      const utterance = new SpeechSynthesisUtterance(currentPrompt.listening);
      utterance.lang = 'en-US';
      utterance.rate = 0.9; // Slightly slower for clarity
      utterance.pitch = 1;
      
      utterance.onstart = () => {
        setIsLecturePlaying(true);
      };
      
      utterance.onend = () => {
        setIsLecturePlaying(false);
      };
      
      utterance.onerror = (event) => {
        console.error('Speech synthesis error:', event);
        setIsLecturePlaying(false);
      };
      
      window.speechSynthesis.speak(utterance);
    } else {
      alert('Tarayıcınız ses sentezlemeyi desteklemiyor.');
    }
  };

  const handleSubmit = () => {
    setIsTimerRunning(false);
    const promptText = typeof currentPrompt === 'string' ? currentPrompt : currentPrompt.prompt;
    const evalPrompt = generateWritingEvalPrompt(essayContent, promptText, taskType);
    setAiPromptText(evalPrompt);
    setShowPromptModal(true);
  };

  // Auto-advance to next section after showing results
  useEffect(() => {
    if (evaluation && parsedQuestions.length > 0) {
      const sectionsOrder = JSON.parse(sessionStorage.getItem('sectionsOrder') || '[]');
      const currentSectionIndex = sectionsOrder.indexOf('Writing');
      
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
  }, [evaluation, parsedQuestions.length]);

  const handleAIEvalResponse = (aiContent) => {
    setIsSubmitting(true);
    try {
      // Try to parse JSON from AI response
      const jsonStart = aiContent.indexOf('{');
      const jsonEnd = aiContent.lastIndexOf('}');
      let evalData;
      
      if (jsonStart >= 0 && jsonEnd > jsonStart) {
        const jsonStr = aiContent.substring(jsonStart, jsonEnd + 1);
        evalData = JSON.parse(jsonStr);
      } else {
        // Fallback: create a basic evaluation from text
        evalData = {
          score: 20,
          maxScore: 30,
          feedback: {
            grammar: aiContent.substring(0, 200),
            vocabulary: 'See full response above.',
            organization: 'See full response above.',
            development: 'See full response above.',
            overallComments: aiContent
          },
          evaluatedAt: new Date().toISOString()
        };
      }

      // Ensure all required fields
      if (!evalData.maxScore) evalData.maxScore = 30;
      if (!evalData.evaluatedAt) evalData.evaluatedAt = new Date().toISOString();
      if (!evalData.feedback) {
        evalData.feedback = {
          grammar: '', vocabulary: '', organization: '', development: '', overallComments: aiContent
        };
      }

      setEvaluation(evalData);
      setShowPromptModal(false);
    } catch (error) {
      console.error('Error parsing AI response:', error);
      setEvaluation({
        score: 20,
        maxScore: 30,
        feedback: {
          grammar: 'AI yanıtı işlenemedi.',
          vocabulary: '',
          organization: '',
          development: '',
          overallComments: aiContent
        },
        evaluatedAt: new Date().toISOString()
      });
      setShowPromptModal(false);
    }
    setIsSubmitting(false);
  };

  const resetTask = () => {
    setTaskType(null);
    setCurrentPrompt('');
    setEssayContent('');
    setWordCount(0);
    setTimeRemaining(1800);
    setIsTimerRunning(false);
    setEvaluation(null);
  };

  return (
    <div className="writing-practice">
      <motion.div 
        className="writing-header"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <h1>✍️ Writing Practice</h1>
        <p>TOEFL formatında yazma pratiği yapın ve detaylı AI değerlendirmesi alın</p>
      </motion.div>

      {!taskType ? (
        <motion.div 
          className="task-selection"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          <h2>Görev Tipi Seçin</h2>
          <div className="writing-tasks">
            <div 
              className="writing-task-card"
              onClick={() => startTask('integrated')}
            >
              <div className="task-badge">Task 1</div>
              <div className="task-icon">📚</div>
              <h3>Integrated Writing</h3>
              <p>Okuma ve dinleme materyallerine dayalı yazma</p>
              <div className="task-details">
                <div className="detail-item">
                  <span>⏱️</span>
                  <span>20 dakika</span>
                </div>
                <div className="detail-item">
                  <span>📝</span>
                  <span>150-225 kelime</span>
                </div>
              </div>
              <button className="start-task-btn">Başla →</button>
            </div>

            <div 
              className="writing-task-card featured"
              onClick={() => startTask('independent')}
            >
              <div className="task-badge">Task 2</div>
              <div className="task-icon">💭</div>
              <h3>Independent Writing</h3>
              <p>Kişisel görüş ve deneyimlerinize dayalı yazma</p>
              <div className="task-details">
                <div className="detail-item">
                  <span>⏱️</span>
                  <span>30 dakika</span>
                </div>
                <div className="detail-item">
                  <span>📝</span>
                  <span>300+ kelime</span>
                </div>
              </div>
              <button className="start-task-btn">Başla →</button>
            </div>
          </div>

          <div className="writing-tips">
            <h3>💡 Writing Tips</h3>
            <div className="tips-grid">
              <div className="tip">
                <span>📋</span>
                <p><strong>Planlama:</strong> İlk 2-3 dakikayı planlama için kullanın</p>
              </div>
              <div className="tip">
                <span>🏗️</span>
                <p><strong>Yapı:</strong> Giriş, 2-3 paragraf, sonuç</p>
              </div>
              <div className="tip">
                <span>🔤</span>
                <p><strong>Kelime Sayısı:</strong> Minimum gereksinimleri aşın</p>
              </div>
              <div className="tip">
                <span>✅</span>
                <p><strong>İnceleme:</strong> Son 3-5 dakikayı düzeltme için ayırın</p>
              </div>
            </div>
          </div>
        </motion.div>
      ) : !evaluation ? (
        <motion.div 
          className="writing-area"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          <div className="writing-layout">
            <div className="prompt-section">
              <div className="timer-bar">
                <div className="timer-display">
                  <span className="timer-label">⏱️ Kalan Süre:</span>
                  <span className={`timer-value ${timeRemaining < 300 ? 'warning' : ''}`}>
                    {formatTime(timeRemaining)}
                  </span>
                </div>
                <div className="word-counter">
                  <span className="word-label">📝 Kelime:</span>
                  <span className="word-value">{wordCount}</span>
                  <span className="word-target">
                    / {taskType === 'integrated' ? '150-225' : '300+'}
                  </span>
                </div>
              </div>

              {taskType === 'integrated' ? (
                <div className="integrated-prompt">
                  <div className="reading-section">
                    <h3>📖 Reading Passage (3 minutes)</h3>
                    <div className="passage-content">
                      {currentPrompt.reading}
                    </div>
                  </div>
                  <div className="listening-section">
                    <h3>🎧 Lecture (Simulation)</h3>
                    <div className="lecture-content">
                      <div className="audio-player">
                        <button 
                          className="play-btn"
                          onClick={handlePlayLecture}
                        >
                          {isLecturePlaying ? '⏸️ Durdur' : '▶️ Play Lecture'}
                        </button>
                      </div>
                      <div className="lecture-notes">
                        <p className="note-hint">Gerçek testte lecture dinleyeceksiniz. Şimdilik aşağıdaki içeriği okuyun:</p>
                        <p>{currentPrompt.listening}</p>
                      </div>
                    </div>
                  </div>
                  <div className="prompt-question">
                    <h3>✏️ Question</h3>
                    <p>{currentPrompt.prompt}</p>
                  </div>
                </div>
              ) : (
                <div className="independent-prompt">
                  <h3>✏️ Essay Question</h3>
                  <p className="prompt-text">{currentPrompt}</p>
                  <div className="prompt-instructions">
                    <h4>Instructions:</h4>
                    <ul>
                      <li>State your opinion clearly</li>
                      <li>Support your position with specific reasons and examples</li>
                      <li>Organize your essay logically with an introduction, body paragraphs, and conclusion</li>
                      <li>Write at least 300 words</li>
                    </ul>
                  </div>
                </div>
              )}
            </div>

            <div className="editor-section">
              <div className="editor-toolbar">
                <button className="tool-btn" title="Bold">
                  <strong>B</strong>
                </button>
                <button className="tool-btn" title="Italic">
                  <em>I</em>
                </button>
                <button className="tool-btn" title="Underline">
                  <u>U</u>
                </button>
              </div>
              <textarea
                className="essay-editor"
                value={essayContent}
                onChange={(e) => setEssayContent(e.target.value)}
                placeholder="Start writing your essay here..."
                disabled={!isTimerRunning}
              />
              <div className="editor-actions">
                <button className="save-draft-btn">💾 Taslak Kaydet</button>
                <button 
                  className="submit-btn"
                  onClick={handleSubmit}
                  disabled={isSubmitting || wordCount === 0}
                >
                  {isSubmitting ? '⏳ Değerlendiriliyor...' : '✅ Gönder'}
                </button>
              </div>
            </div>
          </div>
        </motion.div>
      ) : (
        <motion.div 
          className="evaluation-section"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
        >
          <div className="evaluation-header">
            <h2>📊 Essay Değerlendirmesi</h2>
            <div className="overall-score">
              <div className="score-circle-large">
                <span className="score-number">{evaluation.score}</span>
                <span className="score-max">/ {evaluation.maxScore}</span>
              </div>
              <div className="score-rating">
                {evaluation.score >= 24 ? '🌟 Mükemmel' :
                 evaluation.score >= 20 ? '✅ İyi' :
                 evaluation.score >= 15 ? '👍 Orta' : '📚 Geliştirilmeli'}
              </div>
            </div>
          </div>

          <div className="feedback-sections">
            <div className="feedback-card">
              <h3>📚 Grammar & Syntax</h3>
              <div className="feedback-content">
                <p>{evaluation.feedback.grammar}</p>
              </div>
            </div>

            <div className="feedback-card">
              <h3>🔤 Vocabulary & Word Choice</h3>
              <div className="feedback-content">
                <p>{evaluation.feedback.vocabulary}</p>
              </div>
            </div>

            <div className="feedback-card">
              <h3>🏗️ Organization & Structure</h3>
              <div className="feedback-content">
                <p>{evaluation.feedback.organization}</p>
              </div>
            </div>

            <div className="feedback-card">
              <h3>💡 Development & Support</h3>
              <div className="feedback-content">
                <p>{evaluation.feedback.development}</p>
              </div>
            </div>
          </div>

          <div className="overall-comments">
            <h3>💬 Overall Comments</h3>
            <p>{evaluation.feedback.overallComments}</p>
          </div>

          <div className="essay-review">
            <h3>📝 Your Essay</h3>
            <div className="essay-display">
              {essayContent}
            </div>
            <div className="essay-stats">
              <span>Kelime Sayısı: {wordCount}</span>
              <span>Tamamlanma: {new Date(evaluation.evaluatedAt).toLocaleString('tr-TR')}</span>
            </div>
          </div>

          <div className="action-buttons">
            <button className="review-btn">📥 Raporu İndir</button>
            <button className="new-task-btn" onClick={resetTask}>
              🔄 Yeni Görev
            </button>
          </div>
        </motion.div>
      )}

      {/* AI Prompt Modal */}
      <AIPromptModal
        isOpen={showPromptModal}
        onClose={() => setShowPromptModal(false)}
        prompt={aiPromptText}
        onSubmitResponse={handleAIEvalResponse}
        title="✍️ Yazma Değerlendirmesi"
      />
    </div>
  );
}

export default WritingPractice;
