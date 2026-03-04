# TOEFL Preparation Platform Setup Guide

## Quick Start - Hızlı Başlangıç

### Adım 1: Backend'i Başlat

Yeni bir PowerShell terminal açın ve şu komutları çalıştırın:

```powershell
cd c:\Users\aeser.ARCHITECHT\source\repos\Englishv1\Englishv1
dotnet restore
dotnet run
```

Backend başarıyla başladığında şu mesajı göreceksiniz:
```
Now listening on: https://localhost:7000
```

### Adım 2: Frontend'i Başlat

**YENİ** bir PowerShell terminal açın ve şu komutları çalıştırın:

```powershell
cd c:\Users\aeser.ARCHITECHT\source\repos\Englishv1\ClientApp
npm install
npm run dev
```

Frontend başarıyla başladığında şu mesajı göreceksiniz:
```
Local: http://localhost:3000
```

### Adım 3: Uygulamayı Aç

Tarayıcınızda şu adrese gidin:
```
http://localhost:3000
```

## Özellikler

✅ **Test Generator** - AI ile TOEFL formatında testler oluştur
✅ **Speaking Practice** - Mikrofon ile konuş, anlık transkript ve AI feedback al
✅ **Writing Practice** - Essay yaz ve AI değerlendirmesi al
✅ **Vocabulary Builder** - Flashcard'lar ile kelime öğren
✅ **Study Dashboard** - İlerleme ve performans takibi

## Gereksinimler

- ✅ .NET Core 8.0 SDK
- ✅ Node.js (v18 veya üzeri)
- ✅ Modern web tarayıcısı (Chrome, Edge, Firefox)
- 🎤 Mikrofon (Speaking Practice için)

## Sorun Giderme

### Backend Çalışmıyor
```powershell
# .NET SDK kontrol et
dotnet --version

# Projeyi temizle ve yeniden başlat
dotnet clean
dotnet restore
dotnet build
dotnet run
```

### Frontend Çalışmıyor
```powershell
# Node.js kontrol et
node --version
npm --version

# node_modules'ü temizle ve yeniden kur
rm -r node_modules
npm install
npm run dev
```

### Port Zaten Kullanılıyor
Backend için 7000, frontend için 3000 portları kullanılıyor.
Başka program bu portları kullanıyorsa:

**Backend:** `Program.cs` dosyasında portu değiştirin
**Frontend:** `vite.config.js` dosyasında portu değiştirin

## API Test

Swagger UI ile API'yi test edebilirsiniz:
```
https://localhost:7000/swagger
```

---

Kolay gelsin! 🚀
