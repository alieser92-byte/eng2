import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import './AIPromptModal.css';

function AIPromptModal({ isOpen, onClose, prompt, onSubmitResponse, title = 'AI Prompt' }) {
  const [step, setStep] = useState(1); // 1: show prompt, 2: paste response
  const [aiResponse, setAiResponse] = useState('');
  const [copied, setCopied] = useState(false);
  const textareaRef = useRef(null);

  const handleCopyPrompt = async () => {
    try {
      await navigator.clipboard.writeText(prompt);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Fallback for older browsers
      const textarea = document.createElement('textarea');
      textarea.value = prompt;
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand('copy');
      document.body.removeChild(textarea);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleNext = () => {
    setStep(2);
    setTimeout(() => {
      if (textareaRef.current) textareaRef.current.focus();
    }, 300);
  };

  const handleSubmit = () => {
    if (!aiResponse.trim()) {
      alert('Lütfen AI yanıtını yapıştırın.');
      return;
    }
    onSubmitResponse(aiResponse.trim());
    handleReset();
  };

  const handleReset = () => {
    setStep(1);
    setAiResponse('');
    setCopied(false);
  };

  const handleClose = () => {
    handleReset();
    onClose();
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        className="ai-modal-overlay"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={handleClose}
      >
        <motion.div
          className="ai-modal"
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 20 }}
          transition={{ type: 'spring', damping: 25, stiffness: 300 }}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="ai-modal-header">
            <h2>{title}</h2>
            <button className="ai-modal-close" onClick={handleClose}>✕</button>
          </div>

          {/* Steps indicator */}
          <div className="ai-modal-steps">
            <div className={`step-item ${step >= 1 ? 'active' : ''}`}>
              <div className="step-number">1</div>
              <span>Prompt'u Kopyala</span>
            </div>
            <div className="step-line"></div>
            <div className={`step-item ${step >= 2 ? 'active' : ''}`}>
              <div className="step-number">2</div>
              <span>Yanıtı Yapıştır</span>
            </div>
          </div>

          {/* Content */}
          <div className="ai-modal-body">
            {step === 1 && (
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                className="step-content"
              >
                <div className="step-instructions">
                  <p>📋 Aşağıdaki promptu kopyalayıp <strong>ChatGPT</strong> veya <strong>Gemini</strong>'ye yapıştırın:</p>
                </div>
                <div className="prompt-box">
                  <pre className="prompt-text">{prompt}</pre>
                </div>
                <div className="step-actions">
                  <button
                    className={`copy-btn ${copied ? 'copied' : ''}`}
                    onClick={handleCopyPrompt}
                  >
                    {copied ? '✅ Kopyalandı!' : '📋 Prompt\'u Kopyala'}
                  </button>
                  <button className="next-btn" onClick={handleNext}>
                    Sonraki Adım →
                  </button>
                </div>
              </motion.div>
            )}

            {step === 2 && (
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                className="step-content"
              >
                <div className="step-instructions">
                  <p>📝 ChatGPT/Gemini'den aldığınız yanıtı aşağıya yapıştırın:</p>
                </div>
                <textarea
                  ref={textareaRef}
                  className="response-textarea"
                  placeholder="AI yanıtını buraya yapıştırın..."
                  value={aiResponse}
                  onChange={(e) => setAiResponse(e.target.value)}
                  rows={15}
                />
                <div className="response-info">
                  <span className={`char-count ${aiResponse.length > 100 ? 'valid' : ''}`}>
                    {aiResponse.length} karakter
                  </span>
                  {aiResponse.length > 100 && <span className="valid-badge">✅ Yeterli içerik</span>}
                </div>
                <div className="step-actions">
                  <button className="back-btn" onClick={() => setStep(1)}>
                    ← Geri
                  </button>
                  <button
                    className="submit-btn"
                    onClick={handleSubmit}
                    disabled={!aiResponse.trim()}
                  >
                    🚀 Oluştur
                  </button>
                </div>
              </motion.div>
            )}
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}

export default AIPromptModal;
