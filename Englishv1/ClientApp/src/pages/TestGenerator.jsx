import React, { useState } from 'react';
import axios from 'axios';
import { motion } from 'framer-motion';
import AIPromptModal from '../components/AIPromptModal';
import { generateToeflPrompt, buildTestStructure } from '../utils/promptGenerator';
import './TestGenerator.css';

function TestGenerator() {
  const [difficulty, setDifficulty] = useState('intermediate');
  const [sections, setSections] = useState(['Reading', 'Listening', 'Speaking', 'Writing']);
  const [generatedTest, setGeneratedTest] = useState(null);
  const [loading, setLoading] = useState(false);
  const [activeSection, setActiveSection] = useState(null);
  const [showPromptModal, setShowPromptModal] = useState(false);
  const [currentPrompt, setCurrentPrompt] = useState('');

  const [pdfLoading, setPdfLoading] = useState(false);

  const handleSectionToggle = (section) => {
    if (sections.includes(section)) {
      setSections(sections.filter(s => s !== section));
    } else {
      setSections([...sections, section]);
    }
  };

  const generateTest = () => {
    if (sections.length === 0) return;
    const prompt = generateToeflPrompt(difficulty, sections);
    setCurrentPrompt(prompt);
    setShowPromptModal(true);
  };

  const handleAIResponse = (aiContent) => {
    setLoading(true);
    try {
      const testData = buildTestStructure(difficulty, sections, aiContent);
      setGeneratedTest(testData);
      setShowPromptModal(false);
    } catch (error) {
      console.error('Error building test:', error);
      alert('Test oluşturulurken hata oluştu');
    }
    setLoading(false);
  };

  const downloadPDF = async () => {
    if (!generatedTest) return;
    
    setPdfLoading(true);
    try {
      const response = await axios.post('/api/toefl/generate-pdf', {
        testId: String(generatedTest.testId),
        difficulty: generatedTest.difficulty,
        sections: generatedTest.sections.map(s => s.name),
        aiGeneratedContent: generatedTest.aiGeneratedContent || ''
      }, {
        responseType: 'blob',
        timeout: 120000 // 2 dakika timeout
      });

      // Sunucu hata döndüyse blob olarak gelir, kontrol edelim
      if (response.data.type && response.data.type.includes('application/json')) {
        const text = await response.data.text();
        const errorData = JSON.parse(text);
        throw new Error(errorData.message || 'Bilinmeyen hata');
      }

      const blob = new Blob([response.data], { type: 'application/pdf' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `TOEFL_Practice_Test_${generatedTest.testId}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error generating PDF:', error);
      // Blob yanıtından hata mesajını çıkar
      let errorMessage = 'PDF oluşturulurken hata oluştu.';
      if (error.response && error.response.data instanceof Blob) {
        try {
          const text = await error.response.data.text();
          const errorData = JSON.parse(text);
          errorMessage = errorData.message || errorData.error || errorMessage;
          console.error('Server error details:', errorData);
        } catch (e) {
          // Blob parse edilemezse genel mesaj göster
        }
      } else if (error.message) {
        errorMessage = error.message;
      }
      alert(`PDF Hatası: ${errorMessage}\n\nLütfen tekrar deneyin.`);
    }
    setPdfLoading(false);
  };

  const startSection = (sectionName) => {
    setActiveSection(sectionName);
    
    // Navigate to appropriate practice page
    const routes = {
      'Reading': '/test-content',
      'Listening': '/listening-practice', 
      'Speaking': '/speaking-practice',
      'Writing': '/writing-practice'
    };
    
    if (routes[sectionName]) {
      // Store test content and section in sessionStorage
      if (generatedTest) {
        sessionStorage.setItem('currentTest', JSON.stringify(generatedTest));
        sessionStorage.setItem('currentSection', sectionName);
      }
      window.location.href = routes[sectionName];
    } else {
      alert(`${sectionName} bölümü için pratik sayfası hazırlanıyor...`);
    }
  };

  return (
    <div className="test-generator">
      <motion.div 
        className="generator-header"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <h1>🎯 TOEFL Test Üretici</h1>
        <p>AI ile TOEFL formatında özgün pratik testleri oluşturun</p>
      </motion.div>

      <div className="generator-content">
        <motion.div 
          className="settings-panel"
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2 }}
        >
          <h2>Test Ayarları</h2>
          
          <div className="setting-group">
            <label>Zorluk Seviyesi</label>
            <select 
              value={difficulty} 
              onChange={(e) => setDifficulty(e.target.value)}
              className="difficulty-select"
            >
              <option value="beginner">Başlangıç (60-80)</option>
              <option value="intermediate">Orta (80-100)</option>
              <option value="advanced">İleri (100-120)</option>
            </select>
          </div>

          <div className="setting-group">
            <label>Bölümler</label>
            <div className="sections-checkboxes">
              {['Reading', 'Listening', 'Speaking', 'Writing'].map(section => (
                <label key={section} className="checkbox-label">
                  <input
                    type="checkbox"
                    checked={sections.includes(section)}
                    onChange={() => handleSectionToggle(section)}
                  />
                  <span>{section}</span>
                </label>
              ))}
            </div>
          </div>

          <button 
            onClick={generateTest} 
            disabled={loading || sections.length === 0}
            className="generate-btn"
          >
            {loading ? '⏳ Oluşturuluyor...' : '✨ Test Oluştur'}
          </button>

          <div className="info-box">
            <h3>ℹ️ Nasıl Çalışır?</h3>
            <p>1. Ayarları seçip "Test Oluştur"a tıklayın</p>
            <p>2. Açılan prompt'u ChatGPT/Gemini'ye yapıştırın</p>
            <p>3. AI yanıtını geri yapıştırıp testi oluşturun</p>
          </div>
        </motion.div>

        <motion.div 
          className="preview-panel"
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.3 }}
        >
          {!generatedTest ? (
            <div className="empty-state">
              <div className="empty-icon">📄</div>
              <h3>Test henüz oluşturulmadı</h3>
              <p>Sol panelden ayarları yapıp test oluşturun</p>
            </div>
          ) : (
            <div className="test-preview">
              <div className="preview-header">
                <h2>Test Önizleme</h2>
                <button onClick={downloadPDF} className="download-btn" disabled={pdfLoading}>
                  {pdfLoading ? '⏳ PDF Oluşturuluyor...' : '📥 PDF İndir'}
                </button>
              </div>

              <div className="test-info">
                <div className="info-item">
                  <span className="info-label">Test ID:</span>
                  <span className="info-value">{generatedTest.testId}</span>
                </div>
                <div className="info-item">
                  <span className="info-label">Oluşturulma:</span>
                  <span className="info-value">
                    {new Date(generatedTest.generatedAt).toLocaleString('tr-TR')}
                  </span>
                </div>
                <div className="info-item">
                  <span className="info-label">Zorluk:</span>
                  <span className="info-value">{generatedTest.difficulty}</span>
                </div>
              </div>

              <div className="sections-preview">
                <h3>Bölümler</h3>
                {generatedTest.sections.map((section, index) => (
                  <div key={index} className="section-card">
                    <div className="section-header">
                      <h4>{section.name}</h4>
                      <span className="section-badge">
                        {section.questions} soru
                      </span>
                    </div>
                    <div className="section-details">
                      <div className="detail">
                        <span>⏱️</span>
                        <span>{section.timeLimit} dakika</span>
                      </div>
                      <div className="detail">
                        <span>📝</span>
                        <span>{section.questions} soru</span>
                      </div>
                    </div>
                    {section.modules && section.modules.length > 0 && (
                      <div className="module-list">
                        {section.modules.map((mod, mi) => (
                          <div key={mi} className="module-item">
                            <span className="module-name">{mod.name}</span>
                            <span className="module-questions">{mod.questions} soru</span>
                          </div>
                        ))}
                      </div>
                    )}
                    <button 
                      className="start-section-btn"
                      onClick={() => startSection(section.name)}
                    >
                      Başla →
                    </button>
                  </div>
                ))}
              </div>

              <div className="score-info">
                <h3>Puanlama Bilgisi</h3>
                <div className="score-grid">
                  <div className="score-item">
                    <div className="score-circle">6</div>
                    <span>Her Bölüm (1-6)</span>
                  </div>
                  <div className="score-item">
                    <div className="score-circle total">6</div>
                    <span>Ortalama (1-6)</span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </motion.div>
      </div>

      {/* AI Prompt Modal */}
      <AIPromptModal
        isOpen={showPromptModal}
        onClose={() => setShowPromptModal(false)}
        prompt={currentPrompt}
        onSubmitResponse={handleAIResponse}
        title="🤖 TOEFL Test İçeriği Oluştur"
      />
    </div>
  );
}

export default TestGenerator;
