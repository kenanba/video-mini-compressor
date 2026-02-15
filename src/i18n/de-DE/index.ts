export default {
  pandaCompress: {
    title: 'PandaCompress',
    subtitle: 'Professionelle Video-Kompression im Browser',
    info: 'Deine Videos werden **nur im Browser** verarbeitet – sie verlassen niemals dein Gerät. Keine Daten werden gespeichert, daher ist **kein Datenschutz-Risiko** vorhanden.',

    // Status Banner
    status: {
      secureConfigured: '✓ Browser-Sicherheit konfiguriert',
      blockingFFmpeg: '⚠ Browser blockiert FFmpeg - Deaktiviere Shields/Blocker',
      mobileNotSupported: 'Video-Kompression auf mobilen Geräten wird derzeit nicht unterstützt.',
    },

    // Main Interface
    ffmpeg: {
      initializing: 'FFmpeg Engine initialisieren',
      loadButton: 'FFmpeg laden',
      ready: '✅ FFmpeg bereit!',
    },

    // File Upload
    upload: {
      label: '📹 Video auswählen oder hierher ziehen',
      original: 'Original',
    },

    // Quality Settings
    quality: {
      title: 'Qualitätsstufe',
      levels: {
        0: 'Minimal (Klein)',
        1: 'Niedrig (Klein)',
        2: 'Mittel (Ausgewogen)',
        3: 'Hoch (Gut)',
        4: 'Sehr Hoch (Sehr gut)',
        5: 'Maximum (Beste)',
      },
      min: 'Minimal',
      max: 'Maximum',
    },

    // Format Selection
    format: {
      label: '🎬 Ausgabe-Format',
      options: {
        mp4: 'MP4 (H.264) - Universal',
        webm: 'WebM (VP9) - Web-optimiert',
        avi: 'AVI - Kompatibel',
        mkv: 'MKV (Matroska) - Flexibel',
        mov: 'MOV (QuickTime) - Apple',
      },
    },

    // Compress Button
    compress: {
      button: '🚀 Video komprimieren & herunterladen',
      buttonLoading: 'Komprimiere...',
    },

    // Terminal
    terminal: {
      title: 'FFmpeg Live Output',
      live: 'LIVE',
    },

    // Processing Messages
    processing: {
      starting: 'Starte Kompression...',
      initializing: 'Initialisiere FFmpeg...',
      originalSize: 'Original: {size} MB',
      quality: 'Qualität: {label} (CRF={crf}, {bitrate})',
      finished: '✅ Fertig: {size} MB ({savings}% kleiner)',
      error: '❌ Fehler: {error}',
    },

    // Notifications
    notifications: {
      success: {
        title: '✅ Kompression erfolgreich!',
        message:
          'Original: {original} MB\nKomprimiert: {compressed} MB\nErsparnis: {savings}%\n\nDownload gestartet!',
      },
      error: {
        title: '❌ Fehler',
        message: 'Fehler: {error}',
      },
      noFile: {
        title: 'Keine Datei',
        message: 'Bitte wähle zuerst eine Videodatei aus.',
      },
    },
  },
};
