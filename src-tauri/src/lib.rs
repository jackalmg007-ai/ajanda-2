// Ajanda — bu uygulama tamamen statik HTML/CSS/JS ile çalışır.
// Rust tarafı yalnızca pencereyi açıp ../index.html dosyasını yüklemekten sorumludur.
// İleride dosya sistemi, bildirim vb. Tauri eklentileri eklemek isterseniz
// bu dosyaya .plugin(...) çağrıları ekleyebilirsiniz.

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .run(tauri::generate_context!())
        .expect("Ajanda çalıştırılırken hata oluştu");
}
