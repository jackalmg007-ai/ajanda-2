# Ajanda — Kişisel Planlayıcı

Deri ciltli bir masaüstü ajandası görünümünde, web teknolojileriyle (HTML/CSS/JS) yazılmış ve
**Tauri** ile masaüstü uygulamasına dönüştürülebilen bir kişisel planlayıcı.

Gün / Hafta / Ay / Projeler / Bilgi / Adres / Özelleştir görünümlerini, ortadaki cilt
mandalından açılan Hesap Makinesi, Mp3 Çalar ve HızlıResim (hafıza) araçlarını içerir.
Tamamen yerel çalışır, hiçbir veriniz internete gönderilmez.

---

## Hangi sürümü kullanmalıyım?

| Sürüm | Kurulum | Bağımlılık | En garantili kullanım |
|---|---|---|---|
| **`dist/index.html` (tek dosya)** | Yok, çift tıkla | Sadece bir tarayıcı | USB'den **her** bilgisayarda, kesin çalışır |
| **Windows kurulum dosyası** (`.exe`, aşağıda anlatılıyor) | Birkaç saniye, yönetici izni gerekmez | Yok — WebView2 dahili | Gerçek masaüstü uygulaması istiyorsanız |

Eğer tek önceliğiniz "hangi bilgisayara taksam da çalışsın" ise, `dist/index.html` hâlâ en
garantili seçenektir — hiçbir çalışma zamanına ya da işletim sistemine bağımlı değildir.
Aşağıdaki `.exe` yöntemi, gerçek bir masaüstü uygulaması istediğiniz için var ve mümkün
olan en bağımlılıksız hale getirildi, ama Windows'a özgüdür ve bir kurulum adımı içerir
(aşağıda neden olduğunu açıklıyorum).

---

## 1) Tek dosya HTML (garantili taşınabilir)

Kurulum gerektirmez. `dist/index.html` dosyasını (ve yanındaki `app.js`'i) USB belleğe kopyalayın, herhangi bir
bilgisayarda (Windows/Mac/Linux) çift tıklayın. Sadece bir tarayıcı yeterli.

Verilerinizi bilgisayarlar arası taşımak için **Bilgi** sayfasındaki **Dışa Aktar / İçe
Aktar** butonlarını kullanın (aşağıdaki "Veri saklama" bölümüne bakın) — bu, `file://`
üzerinden açılan sayfalarda tarayıcıların yerel depolama davranışının tanımsız/tutarsız
olmasının tek gerçekten güvenilir çözümüdür (bkz. [MDN localStorage](https://developer.mozilla.org/en-US/docs/Web/API/Window/localStorage)).

---

## 2) Windows için taşınabilir kurulum (.exe) — GitHub Actions ile otomatik derleme

Ben bu sohbette gerçek bir Windows makinesine erişemediğim için `.exe` dosyasını burada
derleyip test edemiyorum. Bunun yerine projeyi, **GitHub'ın ücretsiz Windows
sunucularında kendiliğinden derlensin** diye hazırladım — sizin Rust, Visual Studio ya da
başka bir şey kurmanıza gerek yok.

### Neden "tam taşınabilir tek exe" değil de "kurulum dosyası"?

Windows uygulamaları webview göstermek için **WebView2** adlı bir bileşene ihtiyaç duyar.
Bunu çözmenin üç yolu var:

1. **Sistemdeki WebView2'yi kullan** (varsayılan) — Windows 10 (2018 sonrası)/11'de zaten
   yüklü, ama çok eski/kısıtlı bir bilgisayarda olmayabilir.
2. **Kurulum sırasında WebView2'yi indir** — internet gerektirir.
3. **WebView2'nin tamamını uygulamanın içine göm** (`fixedRuntime` modu) — hiçbir şeye
   bağımlı olmaz, internet gerekmez. **Ben bunu seçtim.**

Sorun şu: Tauri/WebView2'nin teknik yapısı gereği, gömülü WebView2'yi **çalışma anında
doğru bulabilmesi için** uygulamanın Tauri'nin kendi kurulum betiği üzerinden kurulmuş
olması güvenilir yoldur (ham `.exe` dosyasını çalışma zamanı klasörüyle birlikte bir
USB'ye kopyalayıp kurulumsuz çalıştırmak, Tauri'nin GitHub deposundaki açık sorunlara göre
[güvenilir şekilde çalışmayabiliyor](https://github.com/tauri-apps/tauri/issues/1378)).
Bu yüzden en **garantili** yol, çok hafif ve hızlı bir kurulum adımı: yönetici izni
istemeyen, birkaç saniye süren, internete ihtiyaç duymayan bir `setup.exe`.

Bunu USB'de taşımak isterseniz: `setup.exe` dosyasının kendisini USB'ye koyun, her yeni
bilgisayarda çalıştırıp (birkaç saniye) kurun. Kurulum `%LOCALAPPDATA%` altına yapılır,
yönetici şifresi istemez.

### Nasıl derlenir

1. Bu proje klasörünü bir GitHub deposuna yükleyin (push edin). GitHub hesabınız yoksa
   ücretsiz açabilirsiniz: https://github.com/signup
2. Depoda **Actions** sekmesine gidin → **"Windows taşınabilir sürüm oluştur"** iş
   akışını seçin → **Run workflow** butonuna basın (ya da `main` dalına her push'ta
   otomatik tetiklenir).
3. Derleme bitince (~5-10 dakika) açılan çalıştırmanın altındaki **Summary** sayfasında
   iki indirilebilir paket göreceksiniz:
   - **`ajanda-windows-kurulum`** → asıl önerilen, garantili sonuç. İçinde
     `Ajanda_1.0.0_x64-setup.exe` var. Bunu çalıştırın, uygulama saniyeler içinde kurulur.
   - **`ajanda-windows-portable-deneysel`** → kurulumsuz, ham `.exe` + WebView2 klasörünü
     yan yana koyduğum bir klasör. **Deneyseldir, ben doğrulayamadım** — çalışırsa bonus,
     çalışmazsa yukarıdaki kurulum dosyasını kullanın.

### Plan B: WebView2 otomatik indirme adımı başarısız olursa

İş akışı, WebView2'nin "sabit sürüm" dosyalarını topluluk kaynaklı bir NuGet paketinden
otomatik indirmeye çalışır. Bu adım ileride bir sebeple başarısız olursa (paket
kaldırılmış/değişmiş olabilir), Tauri'nin resmi elle-indirme talimatını izleyebilirsiniz:

1. https://developer.microsoft.com/en-us/microsoft-edge/webview2/#download-section
   adresinden "Fixed Version" (x64) `.cab` dosyasını indirin.
2. Windows'ta komut istemcisinde açın: `expand dosya.cab -F:* hedefKlasör`
3. Çıkan dosyaları `src-tauri/webview2runtime/` klasörüne kopyalayın.
4. `npm run build -- --bundles nsis` komutunu Windows'ta çalıştırın.

Ayrıntılı resmi belge: https://v2.tauri.app/distribute/windows-installer/#fixed-version

---

## 3) Kendi bilgisayarınızda (Windows/Mac/Linux) manuel derleme

GitHub Actions kullanmak istemiyorsanız, kendi makinenizde de derleyebilirsiniz.

### Gereksinimler

- [Node.js](https://nodejs.org/) (18 veya üzeri)
- [Rust](https://www.rust-lang.org/tools/install) (`rustup` ile kurulması önerilir)
- İşletim sisteminize göre Tauri'nin istediği sistem bağımlılıkları — güncel liste:
  https://v2.tauri.app/start/prerequisites/

### Adımlar

```bash
# 1. Bağımlılıkları kurun (Tauri CLI'ı indirir)
npm install

# 2. Uygulama ikonlarını üretin (tüm platformlar için)
npm run icon

# 3. Geliştirme modunda çalıştırın (canlı pencere açılır)
npm run dev

# 4. Dağıtılabilir masaüstü uygulamasını üretin
npm run build
```

macOS/Linux'ta bu, sisteminizdeki webview'i kullanan normal bir paket üretir (`.dmg`/`.app`,
`.deb`/`.AppImage`) — bu platformlarda WebView2 sorunu yoktur, ekstra ayara gerek yoktur.

Windows'ta yerel derleme yaparsanız, `tauri.conf.json` içindeki `fixedRuntime` ayarı
`src-tauri/webview2runtime/` klasörünün var olmasını bekler — yukarıdaki "Plan B" adımlarını
izleyin ya da hızlıca denemek için `tauri.conf.json`'daki `webviewInstallMode` bloğunu
geçici olarak silip varsayılan (`downloadBootstrapper`) davranışa dönebilirsiniz.

`npm run build` tamamlandığında kurulum dosyalarını şu klasörde bulacaksınız:
`src-tauri/target/release/bundle/`

---

## Proje yapısı

```
├── dist/
│   ├── index.html                      # Uygulamanın tüm arayüzü (tek sayfa)
│   └── app.js                          # Tüm mantık — framework yok
├── app-icon.png                        # Kaynak ikon (npm run icon ile çoklu boyutlara dönüştürülür)
├── package.json                        # Tauri CLI betikleri
├── .github/workflows/
│   └── build-windows-portable.yml      # GitHub Actions: Windows kurulumunu otomatik derler
└── src-tauri/
    ├── Cargo.toml                      # Rust bağımlılıkları
    ├── tauri.conf.json                 # Pencere boyutu, uygulama adı, paketleme/WebView2 ayarları
    ├── build.rs
    ├── capabilities/
    │   └── default.json                # Tauri v2 izin/güvenlik modeli
    └── src/
        ├── main.rs
        └── lib.rs
```

## Veri saklama hakkında

- Uygulama, verilerinizi (notlar, görevler, projeler, kişiler) **otomatik olarak
  `localStorage`'a kaydeder** — Tauri masaüstü uygulamasında bu tamamen güvenilir
  çalışır (gerçek bir masaüstü penceresi olduğu için `file://` belirsizliği söz konusu
  değildir). Yani `.exe` sürümünde pencereyi kapatıp tekrar açtığınızda verileriniz
  yerinde olacaktır.
- **Bilgi** sayfasındaki **Dışa Aktar / İçe Aktar** butonları, verinizi bir `.json`
  dosyasına yedekleyip başka bir bilgisayara/USB'ye taşımanızı sağlar.
- Daha sağlam/gerçek bir veritabanı isterseniz, Tauri'nin resmi dosya sistemi eklentisini
  (`@tauri-apps/plugin-fs`) ya da SQL eklentisini (`@tauri-apps/plugin-sql`) ekleyip
  verileri diske yazabilirsiniz: https://v2.tauri.app/plugin/

## Özelleştirme fikirleri

- `dist/app.js` en üstündeki `COVER_OPTIONS`, `PROJECT_PALETTE`, `QP_ICONS`, `ICON_CATS`
  dizilerini değiştirerek renkleri/simgeleri kolayca güncelleyebilirsiniz.
- Mp3 Çalar şu an yalnızca arayüz simülasyonudur (gerçek ses dosyası bağlı değildir);
  gerçek ses çalmak isterseniz `mp3HTML()`/`mp3StartTimer()` fonksiyonlarına bir
  `<audio>` etiketi ekleyebilirsiniz.

## Görsel referans hakkında bir not

Renk paleti (turuncu vurgu `#FF8602`, ana metin `#575039`) ve yazı tipi (Verdana/Arial
sans-serif) seçimleri, benzer bir masaüstü ajanda uygulamasının genel stilinden ilham
alınarak ayarlandı. Bu depoda o uygulamaya ait hiçbir görsel/ikon/skin dosyası
bulunmaz — tüm arayüz elemanları (kapaklar, ikonlar, dokular) sıfırdan CSS/emoji ile
yeniden üretilmiştir.
