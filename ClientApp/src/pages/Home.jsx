import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import './Home.css';

function Home() {
  const [currentTest, setCurrentTest] = React.useState(null);

  React.useEffect(() => {
    const testInfo = sessionStorage.getItem('currentTest');
    if (testInfo) {
      setCurrentTest(JSON.parse(testInfo));
    }
  }, []);

  const handleSectionClick = (e, feature) => {
    if (feature.sectionName) {
      if (!currentTest) {
        e.preventDefault();
        alert('Bu bölüme girmeden önce "Test Üretici" kısmından yeni bir test oluşturmanız gerekiyor. Dummy data kullanımı kaldırılmıştır.');
        return;
      }
      
      // Test varsa section ayarlayıp devam edelim
      sessionStorage.setItem('currentSection', feature.sectionName);
    }
  };

  const features = [
    {
      icon: '📝',
      title: 'Test Üretici',
      description: 'AI ile TOEFL formatında yeni testler oluşturun',
      link: '/test-generator',
      color: '#667eea'
    },
    {
      icon: '📖',
      title: 'Reading',
      description: 'Okuma pasajlarını ve sorularını çözün',
      link: '/test-content',
      color: '#ff9a9e',
      sectionName: 'Reading'
    },
    {
      icon: '🎧',
      title: 'Listening',
      description: 'Dinleme pratikleri ve soruları',
      link: '/listening-practice',
      color: '#a18cd1',
      sectionName: 'Listening'
    },
    {
      icon: '🎤',
      title: 'Speaking',
      description: 'AI ile konuşun, anlık altyazı ve feedback alın',
      link: '/speaking-practice',
      color: '#f093fb',
      sectionName: 'Speaking'
    },
    {
      icon: '✍️',
      title: 'Writing',
      description: 'Essay yazın ve AI değerlendirmesi alın',
      link: '/writing-practice',
      color: '#4facfe',
      sectionName: 'Writing'
    },
    {
      icon: '📚',
      title: 'Kelime Çalışması',
      description: 'Vocabulary builder ve flashcards',
      link: '/vocabulary',
      color: '#43e97b'
    },
    {
      icon: '📊',
      title: 'İlerleme Takibi',
      description: 'Detaylı istatistikler ve güçlü/zayıf alanlarınız',
      link: '/dashboard',
      color: '#fa709a'
    }
  ];

  return (
    <div className="home">
      <motion.div 
        className="hero"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <h1 className="hero-title">TOEFL Hazırlık Platformu</h1>
        <p className="hero-subtitle">
          AI destekli, TOEFL formatında kapsamlı hazırlık sistemi
        </p>
        <div className="hero-stats">
          <div className="stat">
            <span className="stat-number">4</span>
            <span className="stat-label">Bölüm</span>
          </div>
          <div className="stat">
            <span className="stat-number">120</span>
            <span className="stat-label">Max Puan</span>
          </div>
          <div className="stat">
            <span className="stat-number">∞</span>
            <span className="stat-label">AI Sorular</span>
          </div>
        </div>
      </motion.div>

      <div className="features-grid">
        {features.map((feature, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: index * 0.1 }}
          >
            <Link 
              to={feature.link} 
              className="feature-card"
              onClick={(e) => handleSectionClick(e, feature)}
            >
              <div className="feature-icon" style={{ background: feature.color }}>
                {feature.icon}
              </div>
              <h3 className="feature-title">{feature.title}</h3>
              <p className="feature-description">{feature.description}</p>
              <div className="feature-arrow">→</div>
            </Link>
          </motion.div>
        ))}
      </div>

      <motion.div 
        className="toefl-structure"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.8, delay: 0.6 }}
      >
        <h2>TOEFL iBT Yapısı</h2>
        <div className="structure-grid">
          <div className="structure-item">
            <h3>📖 Reading</h3>
            <p>3-4 passages</p>
            <p>30-40 sorular</p>
            <p>54-72 dakika</p>
          </div>
          <div className="structure-item">
            <h3>🎧 Listening</h3>
            <p>3-4 lectures</p>
            <p>28-39 sorular</p>
            <p>41-57 dakika</p>
          </div>
          <div className="structure-item">
            <h3>🗣️ Speaking</h3>
            <p>4 görev</p>
            <p>Bağımsız & Entegre</p>
            <p>17 dakika</p>
          </div>
          <div className="structure-item">
            <h3>✏️ Writing</h3>
            <p>2 görev</p>
            <p>Integrated & Independent</p>
            <p>50 dakika</p>
          </div>
        </div>
      </motion.div>
    </div>
  );
}

export default Home;
