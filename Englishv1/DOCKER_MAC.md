# 🚀 TOEFL Prep App - Mac Kurulum (Apple Silicon)

Bu klavuz, Mac (M1/M2/M3) kullanıcıları için **tek komutla** uygulamayı çalıştırmanızı sağlar.

## 📋 Gereksinimler

1. **Docker Desktop for Mac** (Apple Silicon uyumlu)
   - İndir: https://www.docker.com/products/docker-desktop/
   - Kurulum sonrası Docker Desktop'ı başlatın

## ⚡ Hızlı Başlangıç

### 1️⃣ Docker'ın Çalıştığını Doğrulayın
```bash
docker --version
# Çıktı: Docker version 24.x.x veya üzeri
```

### 2️⃣ Proje Klasörüne Gidin
```bash
cd /path/to/Englishv1
```

### 3️⃣ Uygulamayı Başlatın
```bash
docker-compose up --build
```

**İlk build 5-10 dakika sürer** (node_modules, .NET restore vb.)

### 4️⃣ Tarayıcıda Açın
```
http://localhost:5000
```

🎉 **Hazır!** Uygulama çalışıyor.

---

## 🛠️ Kullanışlı Komutlar

### Uygulamayı Durdur
```bash
# Ctrl+C ile veya:
docker-compose down
```

### Yeniden Build (Kod Değişikliklerinden Sonra)
```bash
docker-compose up --build --force-recreate
```

### Cache'i Temizle
```bash
docker-compose down --rmi all --volumes
docker system prune -a
```

### Logları İzle
```bash
docker-compose logs -f
```

### Container'a Gir (Debug için)
```bash
docker exec -it toefl-prep-app sh
```

---

## 🔧 Sorun Giderme

### Port 5000 Kullanımda Hatası
```bash
# Port'u değiştirmek için docker-compose.yml'de:
ports:
  - "3000:5000"  # 3000 portuna değiştir
```

### Build Hatası
```bash
# Cache'i temizle ve tekrar dene
docker-compose down --rmi all
docker-compose up --build
```

### Docker Çalışmıyor
```bash
# Docker Desktop'ı yeniden başlat
# Menü bar'daki Docker ikonuna tıkla > Restart
```

---

## 📚 Docker Komutları Özeti

| Komut | Açıklama |
|-------|----------|
| `docker-compose up` | Uygulamayı başlat |
| `docker-compose up --build` | Yeniden build et ve başlat |
| `docker-compose down` | Uygulamayı durdur |
| `docker-compose logs` | Logları göster |
| `docker ps` | Çalışan container'ları listele |
| `docker images` | Mevcut image'ları listele |

---

## 🎯 Avantajlar

✅ **Tek Komut**: `docker-compose up --build`  
✅ **Bağımlılık Yok**: Node.js, .NET veya başka bir şey yüklemenize gerek yok  
✅ **Tutarlı Ortam**: Her yerde aynı şekilde çalışır  
✅ **Kolay Paylaşım**: Docker'ı olan herkes çalıştırabilir  
✅ **Apple Silicon Optimize**: ARM64 için native çalışır  

---

## 🔐 API Keys (Opsiyonel)

Eğer OpenAI entegrasyonu kullanıyorsanız:

```bash
# .env dosyası oluşturun
touch .env

# İçine ekleyin:
OPENAI_API_KEY=sk-...
```

Sonra `docker-compose.yml`'e ekleyin:
```yaml
environment:
  - OPENAI_API_KEY=${OPENAI_API_KEY}
```

---

**Yardıma ihtiyacınız olursa issue açın!** 🚀
