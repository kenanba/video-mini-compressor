# PandaCompress - Browser-based Video Compression

Professional video compression powered by FFmpeg.js running entirely in the browser. No server uploads needed!

## Features

- ✅ **100% Client-side** - All processing happens in your browser
- 🎯 **Multiple Quality Levels** - From minimal to maximum quality
- 🎬 **Multi-format Support** - MP4, WebM, AVI, MKV, MOV
- 🌍 **i18n Support** - German and English translations
- 📊 **Real-time Terminal Output** - See FFmpeg progress live
- 🔔 **Quasar Notifications** - Clean user feedback
- 🔒 **Privacy First** - Videos never leave your device

## Setup

### 1. Install Dependencies

```bash
npm install
# or
yarn install
```

### 2. Required Packages

Make sure these dependencies are installed:

```bash
npm install @diffusion-studio/ffmpeg-js
npm install vue-i18n@9
```

### 3. Configure i18n in Quasar

Update your `quasar.config.js` or `main.ts` to include i18n:

```typescript
// In your main.ts or boot file
import { createApp } from 'vue';
import i18n from './i18n';

const app = createApp(App);
app.use(i18n);
app.mount('#app');
```

### 4. Browser Requirements

For FFmpeg.js to work properly, your browser must support:
- **SharedArrayBuffer**
- **Cross-Origin Isolation**

Add these headers to your development server:

```
Cross-Origin-Embedder-Policy: require-corp
Cross-Origin-Opener-Policy: same-origin
```

In **Quasar**, add to `quasar.config.js`:

```javascript
devServer: {
  headers: {
    'Cross-Origin-Embedder-Policy': 'require-corp',
    'Cross-Origin-Opener-Policy': 'same-origin',
  },
}
```

## Usage

1. **Load FFmpeg** - Click "FFmpeg laden" to initialize the engine
2. **Select Video** - Choose or drag a video file
3. **Choose Quality** - Select compression level (0-5)
4. **Pick Format** - Choose output format (MP4, WebM, etc.)
5. **Compress** - Click compress button and wait
6. **Download** - File downloads automatically when done

## File Structure

```
src/
├── pages/
│   └── IndexPage.vue          # Main component
├── i18n/
│   ├── index.ts              # i18n configuration
│   └── locales/
│       ├── de.ts             # German translations
│       └── en.ts             # English translations
```

## Key Features Explained

### No Asset Storage
Videos are processed entirely in-memory using FFmpeg.js virtual file system. No files are saved to disk during processing.

### Quasar Notify Integration
All user feedback (success, errors, warnings) uses Quasar's notification system:

```typescript
$q.notify({
  type: 'positive',
  message: 'Compression successful!',
  position: 'top',
  timeout: 5000,
});
```

### i18n Support
Switch languages easily:

```typescript
const { locale } = useI18n();
locale.value = 'en'; // Switch to English
locale.value = 'de'; // Switch to German
```

### Real-time Terminal
FFmpeg output is captured via console.log interception and displayed in a live terminal window.

## Quality Levels

| Level | CRF | Bitrate | Preset | Use Case |
|-------|-----|---------|--------|----------|
| 0 | 32 | 500k | fast | Minimal size, low quality |
| 1 | 28 | 1000k | medium | Small size, acceptable quality |
| 2 | 23 | 2000k | medium | Balanced (default) |
| 3 | 20 | 3000k | slow | High quality |
| 4 | 18 | 5000k | slower | Very high quality |
| 5 | 18 | 5000k | slower | Maximum quality |

## Supported Formats

- **MP4** - H.264 video, AAC audio (universal compatibility)
- **WebM** - VP9 video, Opus audio (web-optimized)
- **AVI** - H.264 video, MP3 audio (legacy compatibility)
- **MKV** - H.264 video, AAC audio (flexible container)
- **MOV** - H.264 video, AAC audio (Apple ecosystem)

## Troubleshooting

### "Browser blocking FFmpeg"
- Disable browser shields/ad blockers
- Ensure COOP/COEP headers are set
- Try in Chrome/Edge (best FFmpeg.js support)

### Compression fails
- Check video file is valid
- Try a smaller file first
- Check browser console for errors

### Terminal not showing output
- FFmpeg logs are filtered for progress info
- Logs include: frame=, fps=, Lsize=, time=

## Development

```bash
# Start dev server
npm run dev

# Build for production
npm run build

# Lint
npm run lint
```

## License

MIT

## Credits

- Powered by [FFmpeg.js](https://github.com/diffusion-studio/ffmpeg-js)
- Built with [Quasar Framework](https://quasar.dev)
- Icons from Material Design Icons