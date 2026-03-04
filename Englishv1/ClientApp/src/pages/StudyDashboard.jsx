import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { motion } from 'framer-motion';
import './StudyDashboard.css';

function StudyDashboard() {
  const [progressData, setProgressData] = useState(null);
  const [timeFilter, setTimeFilter] = useState('week'); // week, month, all

  useEffect(() => {
    fetchProgressData();
  }, []);

  const fetchProgressData = async () => {
    try {
      const response = await axios.get('/api/toefl/study-progress');
      setProgressData(response.data);
    } catch (error) {
      console.error('Error fetching progress:', error);
      // Mock data for demo
      setProgressData({
        totalTests: 24,
        averageScore: 92.5,
        strongAreas: ['Reading', 'Writing'],
        improvementAreas: ['Listening', 'Speaking'],
        studyStreak: 12,
        lastStudied: new Date().toISOString(),
        sectionScores: {
          Reading: 28,
          Listening: 24,
          Speaking: 22,
          Writing: 26
        },
        recentTests: [
          { date: '2024-03-01', score: 95, sections: { R: 29, L: 25, S: 23, W: 27 } },
          { date: '2024-02-28', score: 91, sections: { R: 28, L: 24, S: 22, W: 26 } },
          { date: '2024-02-25', score: 89, sections: { R: 27, L: 23, S: 21, W: 25 } },
          { date: '2024-02-22', score: 94, sections: { R: 29, L: 26, S: 22, W: 28 } },
          { date: '2024-02-20', score: 90, sections: { R: 28, L: 24, S: 22, W: 26 } }
        ],
        studyTime: {
          thisWeek: 18.5,
          lastWeek: 15,
          total: 156
        },
        vocabularyProgress: {
          learned: 450,
          inProgress: 125,
          total: 1000
        }
      });
    }
  };

  if (!progressData) {
    return (
      <div className="dashboard-loading">
        <div className="loader"></div>
        <p>Verileriniz yükleniyor...</p>
      </div>
    );
  }

  const getScoreColor = (score) => {
    if (score >= 100) return '#43e97b';
    if (score >= 80) return '#4facfe';
    if (score >= 60) return '#ffc107';
    return '#f55753';
  };

  const getSectionIcon = (section) => {
    const icons = {
      Reading: '📖',
      Listening: '🎧',
      Speaking: '🗣️',
      Writing: '✍️'
    };
    return icons[section] || '📚';
  };

  return (
    <div className="study-dashboard">
      <motion.div 
        className="dashboard-header"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <div className="header-content">
          <div>
            <h1>📊 Study Dashboard</h1>
            <p>TOEFL hazırlık ilerlemenizi takip edin</p>
          </div>
          <div className="time-filters">
            <button 
              className={`filter-btn ${timeFilter === 'week' ? 'active' : ''}`}
              onClick={() => setTimeFilter('week')}
            >
              Bu Hafta
            </button>
            <button 
              className={`filter-btn ${timeFilter === 'month' ? 'active' : ''}`}
              onClick={() => setTimeFilter('month')}
            >
              Bu Ay
            </button>
            <button 
              className={`filter-btn ${timeFilter === 'all' ? 'active' : ''}`}
              onClick={() => setTimeFilter('all')}
            >
              Tümü
            </button>
          </div>
        </div>
      </motion.div>

      <div className="dashboard-grid">
        {/* Key Metrics */}
        <motion.div 
          className="metrics-row"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <div className="metric-card score">
            <div className="metric-icon">🎯</div>
            <div className="metric-content">
              <span className="metric-value" style={{ color: getScoreColor(progressData.averageScore) }}>
                {progressData.averageScore}
              </span>
              <span className="metric-label">Ortalama Puan</span>
              <span className="metric-sublabel">/ 120</span>
            </div>
          </div>

          <div className="metric-card">
            <div className="metric-icon">📝</div>
            <div className="metric-content">
              <span className="metric-value">{progressData.totalTests}</span>
              <span className="metric-label">Toplam Test</span>
              <span className="metric-sublabel">Tamamlandı</span>
            </div>
          </div>

          <div className="metric-card">
            <div className="metric-icon">🔥</div>
            <div className="metric-content">
              <span className="metric-value">{progressData.studyStreak}</span>
              <span className="metric-label">Gün Streak</span>
              <span className="metric-sublabel">Devam ediyor!</span>
            </div>
          </div>

          <div className="metric-card">
            <div className="metric-icon">⏱️</div>
            <div className="metric-content">
              <span className="metric-value">{progressData.studyTime.thisWeek}h</span>
              <span className="metric-label">Bu Hafta</span>
              <span className="metric-sublabel">Çalışma Süresi</span>
            </div>
          </div>
        </motion.div>

        {/* Section Scores */}
        <motion.div 
          className="section-scores-card dashboard-card"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <h2>📊 Bölüm Puanları</h2>
          <div className="sections-grid">
            {Object.entries(progressData.sectionScores).map(([section, score]) => (
              <div key={section} className="section-score-item">
                <div className="section-header">
                  <span className="section-icon">{getSectionIcon(section)}</span>
                  <span className="section-name">{section}</span>
                </div>
                <div className="score-bar-container">
                  <div 
                    className="score-bar"
                    style={{
                      width: `${(score / 30) * 100}%`,
                      background: `linear-gradient(90deg, ${getScoreColor((score / 30) * 120)}, ${getScoreColor((score / 30) * 120)}aa)`
                    }}
                  />
                </div>
                <div className="score-display">
                  <span className="score-value">{score}</span>
                  <span className="score-max">/ 30</span>
                </div>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Performance Chart */}
        <motion.div 
          className="performance-chart dashboard-card"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <h2>📈 Performans Grafiği</h2>
          <div className="chart-container">
            {progressData.recentTests.map((test, index) => (
              <div key={index} className="chart-bar">
                <div 
                  className="bar"
                  style={{
                    height: `${(test.score / 120) * 100}%`,
                    background: `linear-gradient(180deg, ${getScoreColor(test.score)}, ${getScoreColor(test.score)}aa)`
                  }}
                >
                  <span className="bar-value">{test.score}</span>
                </div>
                <span className="bar-label">
                  {new Date(test.date).toLocaleDateString('tr-TR', { month: 'short', day: 'numeric' })}
                </span>
              </div>
            ))}
          </div>
          <div className="chart-legend">
            <div className="legend-item">
              <span className="legend-color" style={{ background: '#43e97b' }}></span>
              <span>100-120</span>
            </div>
            <div className="legend-item">
              <span className="legend-color" style={{ background: '#4facfe' }}></span>
              <span>80-99</span>
            </div>
            <div className="legend-item">
              <span className="legend-color" style={{ background: '#ffc107' }}></span>
              <span>60-79</span>
            </div>
            <div className="legend-item">
              <span className="legend-color" style={{ background: '#f55753' }}></span>
              <span>0-59</span>
            </div>
          </div>
        </motion.div>

        {/* Strengths & Weaknesses */}
        <motion.div 
          className="strengths-weaknesses dashboard-card"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <h2>💪 Güçlü & Zayıf Alanlar</h2>
          <div className="areas-grid">
            <div className="area-section strong">
              <h3>✅ Güçlü Alanlar</h3>
              <ul>
                {progressData.strongAreas.map((area, index) => (
                  <li key={index}>
                    <span className="area-icon">{getSectionIcon(area)}</span>
                    <span>{area}</span>
                  </li>
                ))}
              </ul>
              <p className="area-tip">
                Bu alanlardaki performansınızı korumaya devam edin!
              </p>
            </div>

            <div className="area-section weak">
              <h3>📚 Geliştirilmeli</h3>
              <ul>
                {progressData.improvementAreas.map((area, index) => (
                  <li key={index}>
                    <span className="area-icon">{getSectionIcon(area)}</span>
                    <span>{area}</span>
                  </li>
                ))}
              </ul>
              <p className="area-tip">
                Bu alanlara daha fazla zaman ayırmanızı öneririz.
              </p>
            </div>
          </div>
        </motion.div>

        {/* Vocabulary Progress */}
        <motion.div 
          className="vocabulary-progress dashboard-card"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
        >
          <h2>📚 Kelime İlerlemesi</h2>
          <div className="vocab-stats">
            <div className="vocab-stat">
              <span className="vocab-number">{progressData.vocabularyProgress.learned}</span>
              <span className="vocab-label">Öğrenildi</span>
            </div>
            <div className="vocab-stat">
              <span className="vocab-number">{progressData.vocabularyProgress.inProgress}</span>
              <span className="vocab-label">Öğreniliyor</span>
            </div>
            <div className="vocab-stat">
              <span className="vocab-number">{progressData.vocabularyProgress.total}</span>
              <span className="vocab-label">Toplam</span>
            </div>
          </div>
          <div className="vocab-progress-bar">
            <div 
              className="vocab-progress-fill"
              style={{
                width: `${(progressData.vocabularyProgress.learned / progressData.vocabularyProgress.total) * 100}%`
              }}
            />
          </div>
          <p className="progress-text">
            {Math.round((progressData.vocabularyProgress.learned / progressData.vocabularyProgress.total) * 100)}% tamamlandı
          </p>
        </motion.div>

        {/* Recent Activity */}
        <motion.div 
          className="recent-activity dashboard-card"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
        >
          <h2>🕐 Son Testler</h2>
          <div className="activity-list">
            {progressData.recentTests.slice(0, 5).map((test, index) => (
              <div key={index} className="activity-item">
                <div className="activity-date">
                  <span className="date-day">
                    {new Date(test.date).getDate()}
                  </span>
                  <span className="date-month">
                    {new Date(test.date).toLocaleDateString('tr-TR', { month: 'short' })}
                  </span>
                </div>
                <div className="activity-content">
                  <h4>Practice Test #{progressData.totalTests - index}</h4>
                  <div className="test-sections">
                    {Object.entries(test.sections).map(([key, value]) => (
                      <span key={key} className="section-mini">
                        {key}: {value}
                      </span>
                    ))}
                  </div>
                </div>
                <div className="activity-score">
                  <span 
                    className="score-badge"
                    style={{ background: getScoreColor(test.score) }}
                  >
                    {test.score}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Study Goals */}
        <motion.div 
          className="study-goals dashboard-card"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
        >
          <h2>🎯 Haftalık Hedefler</h2>
          <div className="goals-list">
            <div className="goal-item completed">
              <span className="goal-icon">✅</span>
              <span className="goal-text">3 practice test tamamla</span>
              <span className="goal-progress">3/3</span>
            </div>
            <div className="goal-item in-progress">
              <span className="goal-icon">🔄</span>
              <span className="goal-text">15 saat çalışma</span>
              <span className="goal-progress">{progressData.studyTime.thisWeek}/15</span>
            </div>
            <div className="goal-item">
              <span className="goal-icon">⏳</span>
              <span className="goal-text">50 yeni kelime öğren</span>
              <span className="goal-progress">28/50</span>
            </div>
            <div className="goal-item">
              <span className="goal-icon">⏳</span>
              <span className="goal-text">5 essay yaz</span>
              <span className="goal-progress">2/5</span>
            </div>
          </div>
          <button className="set-goals-btn">Hedefleri Düzenle</button>
        </motion.div>
      </div>
    </div>
  );
}

export default StudyDashboard;
