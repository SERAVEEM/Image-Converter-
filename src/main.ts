// src/main.ts
import './style.css';
import { Dropzone } from './component/Dropzone';
import { CompareSlider } from './component/CompareSlider';
import { Queuelist } from './component/QueueList';
import { VideoReceiver } from './component/VideoReceiver';
import { convertImage } from './utils/converterEngine';
import { convertVideotoWebM } from './utils/videoConverter';
import { downloadBlob, formatBytes } from './utils/fileHelpers';
import JSZip from 'jszip';

// App State
let selectedFormat: 'webp' | 'avif' = 'webp';
let compressionQuality = 0.8; // 0.8 represents 80%
let resolutionScale = 1.0;    // 1.0 represents 100%
let previewFile: File | null = null;
let selectedVideoFile: File | null = null;

// DOM Elements Selection
const qualitySlider = document.getElementById('quality-slider') as HTMLInputElement;
const qualityVal = document.getElementById('quality-val') as HTMLElement;
const scaleSlider = document.getElementById('scale-slider') as HTMLInputElement;
const scaleVal = document.getElementById('scale-val') as HTMLElement;
const formatBtns = document.querySelectorAll('.format-toggle .toggle-btn');
const previewCard = document.getElementById('preview-card') as HTMLElement;
const dropzoneEl = document.getElementById('dropzone') as HTMLElement;
const convertBtn = document.getElementById('convert-all-btn') as HTMLButtonElement;

// Preview stats and loading overlay selectors
const previewLoading = document.getElementById('preview-loading') as HTMLElement;
const previewOrigSize = document.getElementById('preview-orig-size') as HTMLElement;
const previewCompSize = document.getElementById('preview-comp-size') as HTMLElement;
const previewSavings = document.getElementById('preview-savings') as HTMLElement;

//Video Conversion Actions 
const videoConverterBtn = document.getElementById ('video-convert-btn') as HTMLButtonElement;
const videoBitsPerSelect = document.getElementById ('video-bitrate-select') as HTMLSelectElement;
const videoStatusContainer = document.getElementById ('video-status-container') as HTMLElement;

videoConverterBtn.addEventListener('click', async () => {
  if(!selectedVideoFile) return ;

  //show process status 
 videoConverterBtn.disabled = true;
 videoStatusContainer.classList.remove ('hidden');

 try {
  const bitrate = parseInt(videoBitsPerSelect.value);

  // perfrom convertions
  const convertedBlob = await convertVideotoWebM (selectedVideoFile, { bitrate });

  //extract original name and save to webM
  const originalName = selectedVideoFile.name;
  const extensionIndex = originalName.lastIndexOf('.')
  const baseName = extensionIndex !== -1 ? originalName.substring(0, extensionIndex) : originalName;

  downloadBlob (convertedBlob, `${baseName}.webm`);
  }catch(err){
  console.error('video convertion failed:',err);
  alert('failed to convert video to WebM');
  }
  finally {
  //restore UI state
  videoConverterBtn.disabled = false;
  videoStatusContainer.classList.add('hidden')
  }


  
});
/* Helper to update real-time preview size and savings */
function updatePreviewStats(originalSize: number, compressedSize: number): void {
  previewOrigSize.textContent = formatBytes(originalSize);
  previewCompSize.textContent = formatBytes(compressedSize);
  
  const savings = 100 - (compressedSize / originalSize) * 100;
  if (savings > 0) {
    previewSavings.textContent = `Saved ${savings.toFixed(0)}%`;
    previewSavings.className = 'badge badge-savings-success';
  } else {
    previewSavings.textContent = `Size increased`;
    previewSavings.className = 'badge badge-savings-warning';
  }
}

/* Switches the active view mode and adjusts panel visibility */
function switchMode(mode: 'images' | 'videos'): void {
  const imagesTab = document.getElementById('mode-images-btn') as HTMLElement;
  const videosTab = document.getElementById('mode-videos-btn') as HTMLElement;

  if (mode === 'images') {
    imagesTab.classList.add('active');
    videosTab.classList.remove('active');

    // Show image panels
    if (previewFile) {
      document.getElementById('preview-card')?.classList.remove('hidden');
      document.getElementById('dropzone')?.classList.add('hidden');
    } else {
      document.getElementById('preview-card')?.classList.add('hidden');
      document.getElementById('dropzone')?.classList.remove('hidden');
    }
    document.getElementById('image-controls-card')?.classList.remove('hidden');
    document.getElementById('image-queue-card')?.classList.remove('hidden');

    // Hide video panels
    document.getElementById('video-dropzone')?.classList.add('hidden');
    document.getElementById('video-preview-card')?.classList.add('hidden');
    document.getElementById('video-controls-card')?.classList.add('hidden');
  } else {
    imagesTab.classList.remove('active');
    videosTab.classList.add('active');

    // Hide image panels
    document.getElementById('dropzone')?.classList.add('hidden');
    document.getElementById('preview-card')?.classList.add('hidden');
    document.getElementById('image-controls-card')?.classList.add('hidden');
    document.getElementById('image-queue-card')?.classList.add('hidden');

    // Show video panels
    if (selectedVideoFile) {
      document.getElementById('video-preview-card')?.classList.remove('hidden');
      document.getElementById('video-dropzone')?.classList.add('hidden');
    } else {
      document.getElementById('video-preview-card')?.classList.add('hidden');
      document.getElementById('video-dropzone')?.classList.remove('hidden');
    }
    document.getElementById('video-controls-card')?.classList.remove('hidden');
  }
}

// Video receiver handlers
function handleVideoSelected(file: File): void {
  selectedVideoFile = file;
  
  const videoNameEl = document.getElementById('video-info-name') as HTMLElement;
  const videoMetaEl = document.getElementById('video-info-meta') as HTMLElement;
  
  if (videoNameEl) videoNameEl.textContent = file.name;
  if (videoMetaEl) videoMetaEl.textContent = `Size: ${formatBytes(file.size)} | Type: ${file.type || 'video/x-generic'}`;
  
  document.getElementById('video-dropzone')?.classList.add('hidden');
  document.getElementById('video-preview-card')?.classList.remove('hidden');
}

function handleVideoCleared(): void {
  selectedVideoFile = null;
  document.getElementById('video-dropzone')?.classList.remove('hidden');
  document.getElementById('video-preview-card')?.classList.add('hidden');
}

// Initialize Components
const compareSlider = new CompareSlider(
  'comparison-container',
  'comparison-after-wrapper',
  'slider-handle',
  'image-before',
  'image-after'
);

const queueList = new Queuelist(
  'queue-list',
  'queue-count',
  'queue-actions',
  'clear-all-btn',
  'convert-all-btn',
  handleClearQueue,
  handleConvertQueue
);

new Dropzone(
  'dropzone',
  'file-input',
  'browse-btn',
  handleFilesSelected
);

new VideoReceiver(
  'video-dropzone',
  'video-file-input',
  'video-browse-btn',
  'video-clear-btn',
  handleVideoSelected,
  handleVideoCleared
);

// Switch mode event listeners
document.getElementById('mode-images-btn')?.addEventListener('click', () => switchMode('images'));
document.getElementById('mode-videos-btn')?.addEventListener('click', () => switchMode('videos'));



 /* Triggered when files are dropped or browsed */
function handleFilesSelected(files: File[]): void {
  // Add files to our visual queue list
  queueList.addFiles(files);

  // If there is no active preview, set the first uploaded file as our preview image
  const items = queueList.getItems();
  if (items.length > 0 && !previewFile) {
    setPreviewImage(items[0].file);
  }

  updateActionButtonUI();
}

/* Sets the active preview image and runs the first conversion render */
async function setPreviewImage(file: File): Promise<void> {
  previewFile = file;
  previewCard.classList.remove('hidden');
  dropzoneEl.classList.add('hidden'); // Shrink dropzone to focus on preview
  
  // Show original image in the left comparison pane
  const originalUrl = URL.createObjectURL(file);
  
  // Show loading indicator
  previewLoading.classList.remove('hidden');
  
  try {
    const compressedBlob = await convertImage(file, {
      format: selectedFormat,
      quality: compressionQuality,
      scale: resolutionScale
    });
    const compressedUrl = URL.createObjectURL(compressedBlob);
    
    // Load both urls into our interactive slider
    compareSlider.setImages(originalUrl, compressedUrl);
    
    // Update stats bar
    updatePreviewStats(file.size, compressedBlob.size);
  } catch (error) {
    console.error('Failed to generate preview', error);
  } finally {
    // Hide loading indicator
    previewLoading.classList.add('hidden');
  }
}

/* Regenerates the side-by-side preview whenever quality or format settings are changed */
async function refreshPreview(): Promise<void> {
  if (!previewFile) return;

  // Show loading indicator
  previewLoading.classList.remove('hidden');

  try {
    const compressedBlob = await convertImage(previewFile, {
      format: selectedFormat,
      quality: compressionQuality,
      scale: resolutionScale
    });
    
    const originalUrl = URL.createObjectURL(previewFile);
    const compressedUrl = URL.createObjectURL(compressedBlob);
    
    compareSlider.setImages(originalUrl, compressedUrl);
    
    // Update stats bar
    updatePreviewStats(previewFile.size, compressedBlob.size);
  } catch (err) {
    console.error('Failed to refresh preview:', err);
  } finally {
    // Hide loading indicator
    previewLoading.classList.add('hidden');
  }
}

/* Dynamically updates the Action button depending on how many files are in the queue */
function updateActionButtonUI(): void {
  const items = queueList.getItems();
  if (items.length === 1) {
    convertBtn.textContent = 'Convert & Download Image';
  } else {
    convertBtn.textContent = 'Convert All & Save ZIP';
  }
}

/* Resets the queue list and restores the blank drag-and-drop zone */
function handleClearQueue(): void {
  queueList.clear();
  previewFile = null;
  previewCard.classList.add('hidden');
  dropzoneEl.classList.remove('hidden');
  updateActionButtonUI();
}

/* Main batch-conversion executor */
async function handleConvertQueue(): Promise<void> {
  const items = queueList.getItems();
  if (items.length === 0) return;

  convertBtn.disabled = true;
  convertBtn.textContent = 'Converting...';

  const zip = new JSZip();
  let completedCount = 0;

  for (const item of items) {
    try {
      queueList.updateProgress(item.id, 30); // 30% progress 
      
      // Perform local canvas conversion
      const compressedBlob = await convertImage(item.file, {
        format: selectedFormat,
        quality: compressionQuality,
        scale: resolutionScale
      });

      queueList.updateProgress(item.id, 75); // 75% progress (Compressed)
      queueList.markSuccess(item.id, compressedBlob); // 100% progress
      
      // Get the correct filename extension
      const originalName = item.file.name;
      const extensionIndex = originalName.lastIndexOf('.');
      const baseName = extensionIndex !== -1 ? originalName.substring(0, extensionIndex) : originalName;
      const newFilename = `${baseName}.${selectedFormat}`;

      //no zip if theres only 1 file
      if (items.length === 1) {
        downloadBlob(compressedBlob, newFilename);
      } else {
        // add file blob to our ZIP archive
        zip.file(newFilename, compressedBlob);
      }
      
      completedCount++;
    } catch (error) {
      queueList.markFailed(item.id, error instanceof Error ? error.message : 'Unknown error');
    }
  }

  // If we converted multiple items, generate and trigger ZIP download
  if (items.length > 1 && completedCount > 0) {
    try {
      const zipBlob = await zip.generateAsync({ type: 'blob' });
      downloadBlob(zipBlob, 'optishift-converted.zip');
    } catch (err) {
      alert('Failed to generate ZIP file');
    }
  }

  // Restore button controls
  convertBtn.disabled = false;
  updateActionButtonUI();
}

// GUI Event Listeners Controls

// Quality Slider Listener
qualitySlider.addEventListener('input', () => {
  compressionQuality = parseInt(qualitySlider.value) / 100;
  qualityVal.textContent = `${qualitySlider.value}%`;
  refreshPreview(); // Updates preview in real time!
});

// Resolution Scale Slider Listener
scaleSlider.addEventListener('input', () => {
  resolutionScale = parseInt(scaleSlider.value) / 100;
  scaleVal.textContent = `${scaleSlider.value}%`;
  refreshPreview(); // Updates preview in real time
});

// Format Selector (WebP / AVIF) buttons listeners
formatBtns.forEach((btn) => {
  btn.addEventListener('click', (e) => {
    const target = e.currentTarget as HTMLButtonElement;
    
    // Toggle active style
    formatBtns.forEach((b) => b.classList.remove('active'));
    target.classList.add('active');
    
    selectedFormat = target.getAttribute('data-format') as 'webp' | 'avif';
    refreshPreview();
    updateActionButtonUI();
  });
});
