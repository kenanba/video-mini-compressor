export default {
  pandaCompress: {
    title: 'PandaCompress',
    subtitle: 'Professional Video Compression in Browser',
    info: "Videos are processed **only in your browser**. No data leaves your device, so there's **no privacy risk**.",

    // Status Banner
    status: {
      secureConfigured: '✓ Browser security configured',
      blockingFFmpeg: '⚠ Browser blocking FFmpeg - Disable Shields/Blockers',
    },

    // Main Interface
    ffmpeg: {
      initializing: 'Initialize FFmpeg Engine',
      loadButton: 'Load FFmpeg',
      ready: '✅ FFmpeg ready!',
    },

    // File Upload
    upload: {
      label: '📹 Select video or drag here',
      original: 'Original',
    },

    // Quality Settings
    quality: {
      title: 'Quality Level',
      levels: {
        0: 'Minimal (Small)',
        1: 'Low (Small)',
        2: 'Medium (Balanced)',
        3: 'High (Good)',
        4: 'Very High (Very good)',
        5: 'Maximum (Best)',
      },
      min: 'Minimal',
      max: 'Maximum',
    },

    // Format Selection
    format: {
      label: '🎬 Output Format',
      options: {
        mp4: 'MP4 (H.264) - Universal',
        webm: 'WebM (VP9) - Web-optimized',
        avi: 'AVI - Compatible',
        mkv: 'MKV (Matroska) - Flexible',
        mov: 'MOV (QuickTime) - Apple',
      },
    },

    // Compress Button
    compress: {
      button: '🚀 Compress & download video',
      buttonLoading: 'Compressing...',
    },

    // Terminal
    terminal: {
      title: 'FFmpeg Live Output',
      live: 'LIVE',
    },

    // Processing Messages
    processing: {
      starting: 'Starting compression...',
      initializing: 'Initializing FFmpeg...',
      originalSize: 'Original: {size} MB',
      quality: 'Quality: {label} (CRF={crf}, {bitrate})',
      finished: '✅ Finished: {size} MB ({savings}% smaller)',
      error: '❌ Error: {error}',
    },

    // Notifications
    notifications: {
      success: {
        title: '✅ Compression successful!',
        message:
          'Original: {original} MB\nCompressed: {compressed} MB\nSavings: {savings}%\n\nDownload started!',
      },
      error: {
        title: '❌ Error',
        message: 'Error: {error}',
      },
      status: {
        mobileNotSupported: 'Video compression is currently not supported on mobile devices.',
      },
      noFile: {
        title: 'No file',
        message: 'Please select a video file first.',
      },
    },
  },
};
