<template>
  <q-page class="page-gradient">
    <!-- Header -->
    <div class="header-section text-center q-pa-xl">
      <div class="panda-icon q-mb-md">🐼</div>
      <div class="text-h3 text-weight-bold text-white q-mb-xs">PandaCompress</div>
      <div class="text-h6 text-white-8">Professionelle Video-Kompression im Browser</div>
    </div>

    <!-- Status Banner -->
    <q-banner
      :class="isIsolated ? 'bg-positive' : 'bg-negative'"
      class="text-white q-mb-lg rounded-borders banner-status"
      dense
    >
      <template v-slot:avatar>
        <q-icon :name="isIsolated ? 'check_circle' : 'warning'" size="md" />
      </template>
      <div class="text-weight-medium">
        {{
          isIsolated
            ? '✓ Browser-Sicherheit konfiguriert'
            : '⚠ Browser blockiert FFmpeg - Deaktiviere Shields/Blocker'
        }}
      </div>
    </q-banner>

    <!-- Main Card -->
    <q-card class="main-card shadow-10">
      <q-card-section v-if="!loaded" class="text-center q-pa-xl">
        <q-icon name="memory" size="80px" color="primary" class="q-mb-md" />
        <p class="text-h6 text-grey-8 q-mb-lg">FFmpeg Engine initialisieren</p>
        <q-btn
          color="primary"
          label="FFmpeg laden"
          icon="play_arrow"
          :loading="isLoading && !loaded"
          @click="loadFFmpeg"
          size="lg"
          class="full-width"
          rounded
          unelevated
        />
      </q-card-section>

      <q-card-section v-else class="q-pa-lg">
        <!-- File Upload -->
        <q-file
          v-model="videoFile"
          label="📹 Video auswählen oder hierher ziehen"
          filled
          accept="video/*"
          class="file-input q-mb-md"
          :disable="isLoading"
          counter
        >
          <template v-slot:prepend>
            <q-icon name="videocam" color="primary" />
          </template>
          <template v-slot:append>
            <q-icon name="attach_file" />
          </template>
          <template v-slot:hint v-if="videoFile">
            Original: {{ (videoFile.size / 1024 / 1024).toFixed(2) }} MB
          </template>
        </q-file>

        <!-- Quality Slider -->
        <div class="q-mb-md">
          <div class="text-subtitle2 text-grey-8 q-mb-sm">
            <q-icon name="tune" size="xs" /> Qualitätsstufe
          </div>
          <q-slider
            v-model="qualityLevel"
            :min="0"
            :max="5"
            :step="1"
            snap
            markers
            label
            color="primary"
            :disable="isLoading"
            class="quality-slider"
          />
          <div class="row justify-between text-caption text-grey-7 q-mt-xs">
            <span>Minimal</span>
            <span class="text-weight-bold text-primary">{{ qualityLabels[qualityLevel] }}</span>
            <span>Maximum</span>
          </div>
        </div>

        <!-- Format Selection -->
        <q-select
          v-model="outputFormat"
          :options="formatOptions"
          label="🎬 Ausgabe-Format"
          filled
          class="q-mb-lg"
          :disable="isLoading"
          emit-value
          map-options
        >
          <template v-slot:prepend>
            <q-icon name="movie_filter" color="primary" />
          </template>
        </q-select>

        <!-- Compress Button -->
        <q-btn
          color="primary"
          :label="isLoading ? 'Komprimiere...' : '🚀 Video komprimieren & herunterladen'"
          :icon="isLoading ? 'hourglass_empty' : 'compress'"
          size="lg"
          class="full-width compress-btn"
          :loading="isLoading"
          :disable="!videoFile"
          @click="startCompression"
          rounded
          unelevated
        />

        <!-- Terminal Output -->
        <q-slide-transition>
          <div v-if="isLoading && ffmpegLogs.length > 0" class="q-mt-lg">
            <div class="terminal-container">
              <div class="terminal-header">
                <q-icon name="terminal" size="sm" />
                <span class="q-ml-xs text-weight-medium">FFmpeg Live Output</span>
                <q-space />
                <q-badge color="green" class="pulse">LIVE</q-badge>
              </div>
              <div ref="terminalOutput" class="terminal-output">
                <div
                  v-for="(log, index) in ffmpegLogs.slice(-15)"
                  :key="index"
                  class="terminal-line"
                >
                  {{ log }}
                </div>
              </div>
            </div>
          </div>
        </q-slide-transition>
      </q-card-section>
    </q-card>
  </q-page>
</template>

<script lang="ts">
import { ref, onMounted, nextTick } from 'vue';
import { FFmpeg } from '@diffusion-studio/ffmpeg-js';
import type { FFmpegConfigurationGPLExtended } from '@diffusion-studio/ffmpeg-js';

interface CodecConfig {
  video: string;
  audio: string;
  mimeType: string;
}

export default {
  name: 'IndexPage',
  setup() {
    const videoFile = ref<File | null>(null);
    const qualityLevel = ref(2); // 0-5 Slider
    const qualityLabels = [
      'Niedrig (Klein)',
      'Mittel (Ausgewogen)',
      'Hoch (Gut)',
      'Sehr Hoch (Sehr gut)',
      'Maximum (Beste)',
    ];
    const outputFormat = ref('mp4');
    const formatOptions = [
      { label: 'MP4 (H.264) - Universal', value: 'mp4' },
      { label: 'WebM (VP9) - Web-optimiert', value: 'webm' },
      { label: 'AVI - Kompatibel', value: 'avi' },
      { label: 'MKV (Matroska) - Flexibel', value: 'mkv' },
      { label: 'MOV (QuickTime) - Apple', value: 'mov' },
    ];
    const isLoading = ref(false);
    const loaded = ref(false);
    const isIsolated = ref(false);
    const ffmpegLogs = ref<string[]>([]);
    const terminalOutput = ref<HTMLElement>();

    const ffmpeg = new FFmpeg<FFmpegConfigurationGPLExtended>({
      config: 'gpl-extended',
    });

    onMounted(() => {
      isIsolated.value = typeof SharedArrayBuffer !== 'undefined';
    });

    const loadFFmpeg = () => {
      isLoading.value = true;
      ffmpegLogs.value = ['Initialisiere FFmpeg...'];

      ffmpeg.whenReady(() => {
        loaded.value = true;
        isLoading.value = false;
        ffmpegLogs.value.push('✅ FFmpeg bereit!');
      });
    };

    const startCompression = async () => {
      if (!videoFile.value) return;

      isLoading.value = true;
      ffmpegLogs.value = ['Starte Kompression...'];

      const originalSize = videoFile.value.size;

      // ⭐ Console.log abfangen für echte FFmpeg-Logs
      const originalConsoleLog = console.log;
      console.log = (...args: unknown[]) => {
        const message = args.join(' ');
        if (message.includes('frame=') || message.includes('fps=') || message.includes('Lsize=')) {
          ffmpegLogs.value.push(message);
          void nextTick(() => {
            if (terminalOutput.value) {
              terminalOutput.value.scrollTop = terminalOutput.value.scrollHeight;
            }
          });
        }
        originalConsoleLog(...args);
      };

      try {
        const qualitySettings = [
          { crf: 32, bitrate: '500k', preset: 'fast' as const, label: qualityLabels[1] },
          { crf: 28, bitrate: '1000k', preset: 'medium' as const, label: qualityLabels[2] },
          { crf: 23, bitrate: '2000k', preset: 'medium' as const, label: qualityLabels[3] },
          { crf: 20, bitrate: '3000k', preset: 'slow' as const, label: qualityLabels[4] },
          { crf: 18, bitrate: '5000k', preset: 'slower' as const, label: qualityLabels[5] },
        ];

        // ⭐ Sicherer Index (0-5)
        const safeQualityLevel = Math.min(Math.max(qualityLevel.value, 0), 5);
        const settings = qualitySettings[safeQualityLevel]!; // ⭐ Non-null assertion

        const inputName = 'input.mp4';
        const outputName = `output.${outputFormat.value}`;

        ffmpegLogs.value.push(`Original: ${(originalSize / 1024 / 1024).toFixed(2)} MB`);
        await ffmpeg.writeFile(inputName, videoFile.value);

        ffmpegLogs.value.push(
          `Qualität: ${settings.label} (CRF=${settings.crf}, ${settings.bitrate})`,
        );

        const codecConfig = getCodecForFormat(outputFormat.value);

        const ffmpegArgs = [
          '-i',
          inputName,
          '-c:v',
          codecConfig.video,
          '-crf',
          settings.crf.toString(),
          '-b:v',
          settings.bitrate,
          '-maxrate',
          settings.bitrate,
          '-bufsize',
          '2M',
          '-preset',
          settings.preset,
          '-c:a',
          codecConfig.audio,
          '-b:a',
          '128k',
          '-movflags',
          '+faststart',
          outputName,
        ];
        await ffmpeg.exec(ffmpegArgs);

        const data = ffmpeg.readFile(outputName);
        const result = data instanceof Uint8Array ? data : new Uint8Array(data as ArrayBuffer);

        const compressedSize = result.length;
        const savings = ((1 - compressedSize / originalSize) * 100).toFixed(1);

        ffmpegLogs.value.push(
          `✅ Fertig: ${(compressedSize / 1024 / 1024).toFixed(2)} MB (${savings}% kleiner)`,
        );

        const blob = new Blob([result as BlobPart], { type: codecConfig.mimeType });
        const url = URL.createObjectURL(blob);

        ffmpeg.deleteFile(inputName);
        ffmpeg.deleteFile(outputName);

        const a = document.createElement('a');
        a.href = url;
        a.download = `compressed_${videoFile.value.name.split('.')[0]}.${outputFormat.value}`;
        a.click();

        setTimeout(() => URL.revokeObjectURL(url), 1000);

        alert(
          `✅ Kompression erfolgreich!\n\n` +
            `Original: ${(originalSize / 1024 / 1024).toFixed(2)} MB\n` +
            `Komprimiert: ${(compressedSize / 1024 / 1024).toFixed(2)} MB\n` +
            `Ersparnis: ${savings}%\n\n` +
            `Download gestartet!`,
        );
        videoFile.value = null;
      } catch (error) {
        console.error('❌ Fehler:', error);
        ffmpegLogs.value.push('❌ Fehler: ' + String(error));
        alert('Fehler: ' + String(error));
      } finally {
        console.log = originalConsoleLog;
        isLoading.value = false;
      }
    };

    const getCodecForFormat = (format: string): CodecConfig => {
      const configs: Record<string, CodecConfig> = {
        mp4: { video: 'libx264', audio: 'aac', mimeType: 'video/mp4' },
        webm: { video: 'libvpx-vp9', audio: 'libopus', mimeType: 'video/webm' },
        avi: { video: 'libx264', audio: 'mp3', mimeType: 'video/x-msvideo' },
        mkv: { video: 'libx264', audio: 'aac', mimeType: 'video/x-matroska' },
        mov: { video: 'libx264', audio: 'aac', mimeType: 'video/quicktime' },
      };
      // ⭐ Expliziter Return-Type garantiert nie undefined
      return (configs[format] || configs.mp4) as CodecConfig;
    };

    return {
      videoFile,
      qualityLevel,
      qualityLabels,
      outputFormat,
      formatOptions,
      isLoading,
      loaded,
      isIsolated,
      ffmpegLogs,
      terminalOutput,
      loadFFmpeg,
      startCompression,
    };
  },
};
</script>

<style scoped>
.page-gradient {
  min-height: 100vh;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  padding: 20px;
}

.header-section {
  margin-bottom: 30px;
}

.panda-icon {
  font-size: 80px;
  animation: bounce 2s infinite;
}

@keyframes bounce {
  0%,
  100% {
    transform: translateY(0);
  }
  50% {
    transform: translateY(-10px);
  }
}

.banner-status {
  max-width: 800px;
  margin: 0 auto 20px auto;
}

.main-card {
  max-width: 700px;
  margin: 0 auto;
  border-radius: 20px;
  overflow: hidden;
}

.file-input {
  border: 2px dashed rgba(103, 126, 234, 0.3);
  border-radius: 15px;
  transition: all 0.3s;
}

.file-input:hover {
  border-color: rgba(103, 126, 234, 0.8);
  background: rgba(103, 126, 234, 0.05);
}

.quality-slider {
  padding: 10px 0;
}

.compress-btn {
  font-size: 16px;
  padding: 15px;
  font-weight: 600;
}

.terminal-container {
  background: #1a1a1a;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.4);
}

.terminal-header {
  background: #2d2d2d;
  color: #aaa;
  padding: 12px 16px;
  display: flex;
  align-items: center;
  border-bottom: 1px solid #444;
}

.pulse {
  animation: pulse 2s infinite;
}

@keyframes pulse {
  0%,
  100% {
    opacity: 1;
  }
  50% {
    opacity: 0.5;
  }
}

.terminal-output {
  padding: 16px;
  max-height: 320px;
  overflow-y: auto;
  color: #0f0;
  font-size: 10px;
  line-height: 1.3;
  font-family: 'Consolas', 'Monaco', monospace;
  letter-spacing: -0.3px;
}

.terminal-line {
  white-space: pre;
  margin-bottom: 2px;
}

.terminal-output::-webkit-scrollbar {
  width: 10px;
}

.terminal-output::-webkit-scrollbar-track {
  background: #1a1a1a;
}

.terminal-output::-webkit-scrollbar-thumb {
  background: #555;
  border-radius: 5px;
}
</style>
