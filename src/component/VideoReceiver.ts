export class VideoReceiver {
  private dropzoneEl: HTMLElement;
  private fileInputEl: HTMLInputElement;
  private browseBtnEl: HTMLButtonElement;
  private clearBtnEl: HTMLButtonElement;
  
  private onFileSelectedCallback: (file: File) => void;
  private onFileClearedCallback: () => void;

  constructor(
    dropzoneId: string,
    fileInputId: string,
    browseBtnId: string,
    clearBtnId: string,
    onFileSelected: (file: File) => void,
    onFileCleared: () => void
  ) {
    this.dropzoneEl = document.getElementById(dropzoneId) as HTMLElement;
    this.fileInputEl = document.getElementById(fileInputId) as HTMLInputElement;
    this.browseBtnEl = document.getElementById(browseBtnId) as HTMLButtonElement;
    this.clearBtnEl = document.getElementById(clearBtnId) as HTMLButtonElement;
    
    this.onFileSelectedCallback = onFileSelected;
    this.onFileClearedCallback = onFileCleared;

    this.initEvents();
  }

  private initEvents(): void {
    // Browse button click triggers file input
    this.browseBtnEl.addEventListener('click', () => {
      this.fileInputEl.click();
    });

    // File input change handler
    this.fileInputEl.addEventListener('change', () => {
      if (this.fileInputEl.files && this.fileInputEl.files.length > 0) {
        this.handleFile(this.fileInputEl.files[0]);
      }
    });

    // Drag-and-drop events
    this.dropzoneEl.addEventListener('dragover', (e: DragEvent) => {
      e.preventDefault();
      this.dropzoneEl.classList.add('dragover');
    });

    this.dropzoneEl.addEventListener('dragleave', () => {
      this.dropzoneEl.classList.remove('dragover');
    });

    this.dropzoneEl.addEventListener('drop', (e: DragEvent) => {
      e.preventDefault();
      this.dropzoneEl.classList.remove('dragover');
      
      if (e.dataTransfer && e.dataTransfer.files && e.dataTransfer.files.length > 0) {
        this.handleFile(e.dataTransfer.files[0]);
      }
    });

    // Clear/Remove button handler
    this.clearBtnEl.addEventListener('click', () => {
      this.clear();
    });
  }

  private handleFile(file: File): void {
    const allowedTypes = ['video/mp4', 'video/webm', 'video/quicktime', 'video/x-msvideo'];
    
    // Some OS/browsers may not map AVI or MOV extension to standard mime types properly, so check extension too
    const extension = file.name.split('.').pop()?.toLowerCase();
    const allowedExtensions = ['mp4', 'webm', 'mov', 'avi'];
    
    const isValidType = allowedTypes.includes(file.type) || (extension && allowedExtensions.includes(extension));
    
    if (!isValidType) {
      alert(`Format not supported: ${file.name}. Please select MP4, WebM, MOV, or AVI.`);
      return;
    }

    // Limit size to 100MB
    const maxSize = 100 * 1024 * 1024; // 100MB in bytes
    if (file.size > maxSize) {
      alert(`File is too large: ${file.name}. Maximum size is 100MB.`);
      return;
    }

    this.onFileSelectedCallback(file);
    this.fileInputEl.value = ''; // Reset input element so same file can be selected again
  }

  public clear(): void {
    this.fileInputEl.value = '';
    this.onFileClearedCallback();
  }
}
