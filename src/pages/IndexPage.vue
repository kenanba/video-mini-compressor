<template>
  <q-page class="page-gradient">
    <!-- Header -->
    <div class="header-section text-center q-pa-sm">
      <!-- Language Switcher -->
      <div class="language-switcher">
        <q-select
          v-model="currentLocale"
          :options="languageOptions"
          dense
          outlined
          class="language-select"
          emit-value
          map-options
          @update:model-value="changeLanguage"
        >
          <template v-slot:prepend>
            <q-icon name="language" color="white" />
          </template>
        </q-select>
      </div>

      <div class="panda-icon q-mb-md">🐼</div>
      <q-icon name="info" color="white" size="16px" class="q-ml-sm">
        <q-tooltip anchor="top middle" self="bottom middle">
          {{ t('pandaCompress.info') }}
        </q-tooltip>
      </q-icon>
    </div>
    <!-- Status Banner -->
    <q-banner
      :class="isIsolated && !isMobile ? 'bg-positive' : 'bg-negative'"
      class="text-white rounded-borders banner-status"
      dense
    >
      <template v-slot:avatar>
        <q-icon :name="isIsolated && !isMobile ? 'check_circle' : 'warning'" size="md" />
      </template>
      <div class="text-weight-medium">
        {{
          isIsolated && !isMobile
            ? t('pandaCompress.status.secureConfigured')
            : t('pandaCompress.status.mobileNotSupported')
        }}
      </div>
    </q-banner>

    <!-- Main Card -->
    <q-card class="main-card shadow-10">
      <q-card-section v-if="!loaded" class="text-center q-pa-xl">
        <q-icon name="memory" size="80px" color="primary" class="q-mb-md" />
        <p class="text-h6 text-grey-8 q-mb-lg">{{ t('pandaCompress.ffmpeg.initializing') }}</p>
        <q-btn
          color="primary"
          :label="t('pandaCompress.ffmpeg.loadButton')"
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
          :label="t('pandaCompress.upload.label')"
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
            {{ t('pandaCompress.upload.original') }}:
            {{ (videoFile.size / 1024 / 1024).toFixed(2) }} MB
          </template>
        </q-file>

        <!-- Quality Slider -->
        <div class="q-mb-md">
          <div class="text-subtitle2 text-grey-8 q-mb-sm">
            <q-icon name="tune" size="xs" /> {{ t('pandaCompress.quality.title') }}
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
            <span>{{ t('pandaCompress.quality.min') }}</span>
            <span class="text-weight-bold text-primary">
              {{ t(`pandaCompress.quality.levels.${qualityLevel}`) }}
            </span>
            <span>{{ t('pandaCompress.quality.max') }}</span>
          </div>
        </div>

        <!-- Format Selection -->
        <q-select
          v-model="outputFormat"
          :options="formatOptions"
          :label="t('pandaCompress.format.label')"
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
          :label="
            isLoading
              ? t('pandaCompress.compress.buttonLoading')
              : t('pandaCompress.compress.button')
          "
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
                <span class="q-ml-xs text-weight-medium">{{
                  t('pandaCompress.terminal.title')
                }}</span>
                <q-space />
                <q-badge color="green" class="pulse">{{
                  t('pandaCompress.terminal.live')
                }}</q-badge>
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

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useI18n } from 'vue-i18n';
import { useQuasar } from 'quasar';
import { FFmpeg } from '@diffusion-studio/ffmpeg-js';
import type { FFmpegConfigurationGPLExtended } from '@diffusion-studio/ffmpeg-js';
import { i18n } from 'boot/i18n';

interface CodecConfig {
  video: string;
  audio: string;
  mimeType: string;
}

const { t, locale } = useI18n();
const $q = useQuasar();

// Language settings
const currentLocale = ref(locale.value);
const languageOptions = [
  { label: '🇩🇪 Deutsch', value: 'de-DE' },
  { label: '🇬🇧 English', value: 'en-US' },
];

const videoFile = ref<File | null>(null);
const qualityLevel = ref(2); // 0-5 Slider
const outputFormat = ref('mp4');
const formatOptions = ref([
  { label: t('pandaCompress.format.options.mp4'), value: 'mp4' },
  { label: t('pandaCompress.format.options.webm'), value: 'webm' },
  { label: t('pandaCompress.format.options.avi'), value: 'avi' },
  { label: t('pandaCompress.format.options.mkv'), value: 'mkv' },
  { label: t('pandaCompress.format.options.mov'), value: 'mov' },
]);
const isLoading = ref(false);
const loaded = ref(false);
const isIsolated = ref(false);
const isMobile = ref(false);

const ffmpegLogs = ref<string[]>([]);
const terminalOutput = ref<HTMLElement>();

const ffmpeg = new FFmpeg<FFmpegConfigurationGPLExtended>({
  config: 'gpl-extended',
});

onMounted(() => {
  // Check if browser supports SharedArrayBuffer for FFmpeg
  isIsolated.value = typeof SharedArrayBuffer !== 'undefined';
  isMobile.value = /Android|iPhone|iPad|iPod/i.test(navigator.userAgent);
});

/**
 * Change application language and Quasar language pack
 */

const changeLanguage = async (newLocale: 'en-US' | 'de-DE') => {
  i18n.global.locale.value = newLocale;

  localStorage.setItem('locale', newLocale);

  const langPack =
    newLocale === 'de-DE' ? await import('quasar/lang/de-DE') : await import('quasar/lang/en-US');

  $q.lang.set(langPack.default);
};

const loadFFmpeg = () => {
  isLoading.value = true;
  ffmpegLogs.value = [t('pandaCompress.processing.initializing')];

  ffmpeg.whenReady(() => {
    loaded.value = true;
    isLoading.value = false;
    ffmpegLogs.value.push(t('pandaCompress.ffmpeg.ready'));

    // Show success notification
    $q.notify({
      type: 'positive',
      message: t('pandaCompress.ffmpeg.ready'),
      position: 'top',
      timeout: 2000,
    });
  });
};

const startCompression = async () => {
  if (isMobile.value) {
    $q.notify({
      type: 'negative',
      message: t('pandaCompress.notifications.mobileNotSupported'),
      position: 'top',
      timeout: 5000,
    });
    return;
  }
  if (!videoFile.value) {
    $q.notify({
      type: 'warning',
      message: t('pandaCompress.notifications.noFile.message'),
      position: 'top',
      timeout: 2000,
    });
    return;
  }

  isLoading.value = true;
  ffmpegLogs.value = [t('pandaCompress.processing.starting')];

  const originalSize = videoFile.value.size;

  // Capture console.log and display in BOTH console AND terminal

  try {
    // Quality presets for different compression levels
    const qualitySettings = [
      { crf: 32, bitrate: '500k', preset: 'fast' as const },
      { crf: 28, bitrate: '1000k', preset: 'medium' as const },
      { crf: 23, bitrate: '2000k', preset: 'medium' as const },
      { crf: 20, bitrate: '3000k', preset: 'slow' as const },
      { crf: 18, bitrate: '5000k', preset: 'slower' as const },
    ];

    // Ensure quality level is within bounds (0-5)
    const safeQualityLevel = Math.min(Math.max(qualityLevel.value, 1), 5);
    const settings = qualitySettings[safeQualityLevel - 1]!;

    const inputName = 'input.mp4';
    const outputName = `output.${outputFormat.value}`;

    ffmpegLogs.value.push(
      t('pandaCompress.processing.originalSize', {
        size: (originalSize / 1024 / 1024).toFixed(2),
      }),
    );

    // Write video file to FFmpeg virtual file system (in-memory, not saved to disk)
    await ffmpeg.writeFile(inputName, videoFile.value);

    ffmpegLogs.value.push(
      t('pandaCompress.processing.quality', {
        label: t(`pandaCompress.quality.levels.${qualityLevel.value}`),
        crf: settings.crf,
        bitrate: settings.bitrate,
      }),
    );

    const codecConfig = getCodecForFormat(outputFormat.value);

    // Build FFmpeg command arguments
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

    // Execute FFmpeg compression
    await ffmpeg.exec(ffmpegArgs);

    // Read compressed file from FFmpeg virtual file system
    const data = ffmpeg.readFile(outputName);
    const result = data instanceof Uint8Array ? data : new Uint8Array(data as ArrayBuffer);

    const compressedSize = result.length;
    const savings = ((1 - compressedSize / originalSize) * 100).toFixed(1);

    ffmpegLogs.value.push(
      t('pandaCompress.processing.finished', {
        size: (compressedSize / 1024 / 1024).toFixed(2),
        savings,
      }),
    );

    // Create blob and trigger download
    const blob = new Blob([result as BlobPart], { type: codecConfig.mimeType });
    const url = URL.createObjectURL(blob);

    // Clean up FFmpeg virtual file system
    ffmpeg.deleteFile(inputName);
    ffmpeg.deleteFile(outputName);

    // Trigger download
    const a = document.createElement('a');
    a.href = url;
    a.download = `compressed_${videoFile.value.name.split('.')[0]}.${outputFormat.value}`;
    a.click();

    // Clean up blob URL after download
    setTimeout(() => URL.revokeObjectURL(url), 1000);

    // Show success notification
    $q.notify({
      type: 'positive',
      message: t('pandaCompress.notifications.success.message', {
        original: (originalSize / 1024 / 1024).toFixed(2),
        compressed: (compressedSize / 1024 / 1024).toFixed(2),
        savings,
      }),
      position: 'top',
      timeout: 5000,
      multiLine: true,
    });

    // Reset file input
    videoFile.value = null;
  } catch (error) {
    console.error('❌ Error:', error);
    const errorMessage = String(error);
    ffmpegLogs.value.push(t('pandaCompress.processing.error', { error: errorMessage }));

    // Show error notification
    $q.notify({
      type: 'negative',
      message: t('pandaCompress.notifications.error.message', { error: errorMessage }),
      position: 'top',
      timeout: 5000,
    });
  } finally {
    // Restore original console.log
    isLoading.value = false;
  }
};

/**
 * Get codec configuration for the selected output format
 */
const getCodecForFormat = (format: string): CodecConfig => {
  const configs: Record<string, CodecConfig> = {
    mp4: { video: 'libx264', audio: 'aac', mimeType: 'video/mp4' },
    webm: { video: 'libvpx-vp9', audio: 'libopus', mimeType: 'video/webm' },
    avi: { video: 'libx264', audio: 'mp3', mimeType: 'video/x-msvideo' },
    mkv: { video: 'libx264', audio: 'aac', mimeType: 'video/x-matroska' },
    mov: { video: 'libx264', audio: 'aac', mimeType: 'video/quicktime' },
  };
  return (configs[format] || configs.mp4) as CodecConfig;
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
  position: relative;
}

.language-switcher {
  position: absolute;
  top: 20px;
  right: 20px;
  z-index: 10;
}

.language-select {
  min-width: 150px;
  background: rgba(255, 255, 255, 0.15);
  backdrop-filter: blur(10px);
  border-radius: 10px;
}

.language-select :deep(.q-field__control) {
  color: white;
}

.language-select :deep(.q-field__native),
.language-select :deep(.q-field__label) {
  color: white;
}

.language-select :deep(.q-field__append) {
  color: white;
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

/* Responsive language switcher */
@media (max-width: 600px) {
  .language-switcher {
    position: static;
    display: flex;
    justify-content: center;
    margin-bottom: 20px;
  }

  .language-select {
    min-width: 140px;
  }
}
</style>
