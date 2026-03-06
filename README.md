# TOEFL Hazırlık Platformu

AI destekli, TOEFL formatında kapsamlı hazırlık sistemi.

## 🎯 Özellikler

### 1. Test Üretici (Test Generator)
- AI ile TOEFL formatında yeni testler oluşturma
- Reading, Listening, Speaking, Writing bölümleri
- Özelleştirilebilir zorluk seviyeleri
- PDF formatında test indirme

### 2. Konuşma Pratiği (Speaking Practice)
- AI ile gerçek zamanlı konuşma pratiği
- Anlık transkripsiyon (Speech-to-Text)
- Independent ve Integrated görevler
- Detaylı AI feedback ve puanlama
- Pronunciation, Fluency, Grammar değerlendirmesi

### 3. Yazma Pratiği (Writing Practice)
- TOEFL formatında essay yazma
- Integrated Writing (Reading + Listening)
- Independent Writing (Opinion essay)
- AI ile detaylı değerlendirme
- Grammar, Vocabulary, Organization, Development analizi
- Gerçek zamanlı kelime sayacı ve süre takibi

### 4. Kelime Çalışması (Vocabulary Builder)
- Flashcard sistemi
- Akademik ve genel kelime listeleri
- Pronunciation ve örnek cümleler
- Eş anlamlılar ve kullanım örnekleri
- İlerleme takibi

### 5. İlerleme Takibi (Study Dashboard)
- Genel performans metrikleri
- Bölüm bazı puanlama
- Performans grafiği
- Güçlü ve zayıf alanlar analizi
- Çalışma streak ve hedefler
- Son aktiviteler

## 🏗️ Teknoloji Stack

### Backend
- **.NET Core 8.0** - Web API
- **ASP.NET Core** - RESTful API endpoints
- **Swagger** - API documentation

### Frontend
- **React 18** - UI framework
- **React Router** - Sayfa yönlendirme
- **Framer Motion** - Animasyonlar
- **Vite** - Build tool
- **Axios** - HTTP client

### AI & Özellikler
- **Web Speech API** - Konuşma tanıma
- **MediaRecorder API** - Ses kaydı
- **AI Integration** - Test üretimi, değerlendirme, feedback

## 📦 Kurulum

### Backend Kurulumu

1. Backend klasörüne gidin:
```powershell
cd Englishv1
```

2. NuGet paketlerini yükleyin:
```powershell
dotnet restore
```

3. Uygulamayı çalıştırın:
```powershell
dotnet run
```

Backend `https://localhost:7000` adresinde çalışacaktır.

### Frontend Kurulumu

1. Frontend klasörüne gidin:
```powershell
cd ClientApp
```

2. Bağımlılıkları yükleyin:
```powershell
npm install
```

3. Development server'ı başlatın:
```powershell
npm run dev
```

Frontend `http://localhost:3000` adresinde çalışacaktır.

## 🚀 Çalıştırma

### Hızlı Başlangıç

Aynı anda iki terminal açın:

**Terminal 1 - Backend:**
```powershell
cd Englishv1
dotnet run
```

**Terminal 2 - Frontend:**
```powershell
cd ClientApp
npm run dev
```

Tarayıcınızda `http://localhost:3000` adresine gidin.

## 📁 Proje Yapısı

```
Englishv1/
├── Englishv1/                  # Backend (.NET Core)
│   ├── Controllers/            # API Controllers
│   │   ├── ToeflController.cs  # TOEFL test endpoints
│   │   └── AIController.cs     # AI işlemleri
│   ├── Program.cs              # Entry point
│   └── Englishv1.csproj       # Project file
│
└── ClientApp/                  # Frontend (React)
    ├── src/
    │   ├── pages/             # Sayfa bileşenleri
    │   │   ├── Home.jsx
    │   │   ├── TestGenerator.jsx
    │   │   ├── SpeakingPractice.jsx
    │   │   ├── WritingPractice.jsx
    │   │   ├── VocabularyBuilder.jsx
    │   │   └── StudyDashboard.jsx
    │   ├── App.jsx            # Ana uygulama
    │   └── main.jsx           # Entry point
    └── package.json           # Dependencies
```

## 🔌 API Endpoints

### TOEFL Controller
- `POST /api/toefl/generate-practice-test` - Yeni test oluştur
- `POST /api/toefl/evaluate-writing` - Essay değerlendir
- `POST /api/toefl/transcribe-speech` - Konuşma transkribe et
- `GET /api/toefl/study-progress` - İlerleme bilgisi

### AI Controller
- `POST /api/ai/conversation` - AI sohbet
- `POST /api/ai/generate-questions` - Soru üret
- `POST /api/ai/analyze-speaking` - Konuşma analizi

## 🎨 Özellikler ve Kullanım

### Test Generator
1. Zorluk seviyesi seçin (Beginner, Intermediate, Advanced)
2. Test bölümlerini seçin (Reading, Listening, Speaking, Writing)
3. "Test Oluştur" butonuna tıklayın
4. Oluşturulan testi önizleyin ve PDF olarak indirin

### Speaking Practice
1. Görev tipi seçin (Independent veya Integrated)
2. Soruyu okuyun ve hazırlanın
3. Mikrofon butonuna tıklayarak konuşmaya başlayın
4. Canlı transkript ekranda görünecektir
5. Bittiğinde otomatik AI feedback alın

### Writing Practice
1. Görev tipi seçin (Integrated veya Independent)
2. Prompt'u okuyun
3. Essay'inizi yazın (kelime sayısını takip edin)
4. Süre bitmeden önce gönderin
5. Detaylı AI değerlendirmesi alın

### Vocabulary Builder
- Flashcard'ları çevirin ve öğrenin
- "Biliyorum" veya "Öğreniyorum" olarak işaretleyin
- Word List'te tüm kelimeleri görüntüleyin
- İlerlemeinizi takip edin

### Study Dashboard
- Genel performansınızı görün
- Bölüm puanlarınızı kontrol edin
- Zaman içindeki ilerlemenizi takip edin
- Güçlü ve zayıf alanlarınızı belirleyin

## 🔧 Geliştirme

### Backend Geliştirme
- Controllers klasöründe yeni endpoint'ler ekleyin
- AI entegrasyonu için gerçek AI servislerini bağlayın (OpenAI, Azure Cognitive Services vb.)

### Frontend Geliştirme
- `src/pages` klasöründe yeni sayfalar ekleyin
- `App.jsx` içinde route'ları güncelleyin
- CSS dosyalarını düzenleyerek tasarımı özelleştirin

## 🍎 Mac (Apple Silicon) için Hızlı Kurulum

> **Tek komutla çalıştırın!** Docker ile tüm uygulama otomatik olarak build edilip ayağa kalkar.

### Gereksinimler
- **Docker Desktop for Mac** (Apple Silicon - M1/M2/M3 uyumlu)
  - İndirin: https://www.docker.com/products/docker-desktop/

### Adım 1: Docker'ı Çalıştırın
```bash
# Docker Desktop'ı açın ve çalıştığından emin olun
docker --version
```

### Adım 2: Uygulamayı Başlatın
```bash
cd Englishv1
docker-compose up --build
```

### Adım 3: Tarayıcıda Açın
```
http://localhost:5000
```

### Durdurma ve Temizleme
```bash
# Uygulamayı durdur
docker-compose down

# Container'ı tamamen sil (cache temizliği)
docker-compose down --rmi all --volumes
```

### Yeniden Build (Değişikliklerden Sonra)
```bash
docker-compose up --build --force-recreate
```

### Önemli Notlar
- ✅ Apple Silicon (ARM64) için optimize edilmiş
- ✅ Frontend ve Backend otomatik build edilir
- ✅ Port 5000'de çalışır
- ✅ Tek komutla tüm bağımlılıklar kurulur
- ⚠️ İlk build 5-10 dakika sürebilir (sonraki başlatmalar çok hızlıdır)

## 📝 Notlar

- Bu uygulama TOEFL formatını takip eden bir pratik aracıdır
- Gerçek TOEFL testinin yerine geçmez
- AI fonksiyonları şu anda mock data kullanmaktadır
- Gerçek AI entegrasyonu için OpenAI API veya benzeri servisleri entegre etmeniz gerekmektedir

## 🚧 Gelecek Özellikler

- [ ] Gerçek AI entegrasyonu (OpenAI GPT-4, Azure Speech Services)
- [ ] Kullanıcı hesapları ve authentication
- [ ] Veritabanı entegrasyonu (SQL Server, PostgreSQL)
- [ ] PDF oluşturma ve indirme
- [ ] Reading pasajları ve sorular
- [ ] Listening materyalleri
- [ ] Vocabulary quiz sistemi
- [ ] Sosyal paylaşım özellikleri
- [ ] Mobil uygulama

## 📄 Lisans

Bu proje eğitim amaçlıdır ve TOEFL'în resmi bir ürünü değildir.

## 🤝 Katkı

Geliştirmeler için pull request açabilirsiniz.

## 📞 İletişim

Sorularınız için issue açabilirsiniz.

---

**Not:** TOEFL® ETS'nin (Educational Testing Service) tescilli markasıdır. Bu proje ETS ile ilişkili değildir.
