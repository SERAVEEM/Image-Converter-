// src/component/QueueList.ts
import { formatBytes } from '../utils/fileHelpers'; // Fixed: lowercase 'b' to match your file

export interface QueueItem {
  id: string;
  file: File;
  status: 'pending' | 'processing' | 'success' | 'failed';
  originalSize: number;
  compressedSize?: number;
  compressedBlob?: Blob; // Fixed: added '?' to make it optional
}

export class Queuelist {
  private listEl: HTMLElement;
  private countEl: HTMLElement;
  private actionsEl: HTMLElement;
  private clearBtnEl: HTMLButtonElement;
  private converBtnEl: HTMLButtonElement;

  private items: QueueItem[] = []; // Fixed: declared the internal items array
  
  private onClearCallback: () => void;
  private onConverterCallback: () => void; // Fixed: added missing colon ':'

  constructor(
    listId: string,
    countId: string,
    actionsId: string,
    clearBtnId: string,
    convertBtnId: string,
    onClear: () => void,
    onConvert: () => void
  ) {
    this.listEl = document.getElementById(listId) as HTMLElement;
    this.countEl = document.getElementById(countId) as HTMLElement;
    this.actionsEl = document.getElementById(actionsId) as HTMLElement;
    this.clearBtnEl = document.getElementById(clearBtnId) as HTMLButtonElement;
    this.converBtnEl = document.getElementById(convertBtnId) as HTMLButtonElement;

    this.onClearCallback = onClear;
    this.onConverterCallback = onConvert; // Fixed: assign to onConverterCallback

    this.initEvents();
  }

  // Fixed: Added the missing initEvents method
  private initEvents(): void {
    this.clearBtnEl.addEventListener('click', () => this.onClearCallback());
    this.converBtnEl.addEventListener('click', () => this.onConverterCallback());
  }

  public getItems(): QueueItem[] { // Changed to public so other files can access items
    return this.items;
  }

  public addFiles(files: File[]): void { // Fixed: File type is capitalized
    // hide empty queue message
    const emptyEl = document.getElementById('queue-empty');
    if (emptyEl) emptyEl.classList.add('hidden');

    // show action bar
    this.actionsEl.classList.remove('hidden');

    files.forEach((file) => {
      // generate unique ID for each file item
      const id = 'file-' + Date.now() + '-' + Math.floor(Math.random() * 1000);

      const item: QueueItem = {
        id, 
        file, 
        status: 'pending',
        originalSize: file.size
      };
      
      this.items.push(item); // Fixed: lowercase 'items'
      this.renderItem(item);
    });
    this.updateSummaryCount();
  }

  // update an item's progress bar in the DOM 
  public updateProgress(id: string, progress: number): void {
    const item = this.items.find((i) => i.id === id); // Fixed: 'const' typo fixed
    if (!item) return;

    item.status = 'processing';
    const barEl = document.querySelector(`#${id} .queue-progress-bar`) as HTMLElement;
    if (barEl) {
      barEl.style.width = `${progress}%`;
    }
  }

  // update item status to success and calculates savings
  public markSuccess(id: string, compressedBlob: Blob): void {
    const item = this.items.find((i) => i.id === id);
    if (!item) return;
    
    item.status = 'success';
    item.compressedSize = compressedBlob.size;
    item.compressedBlob = compressedBlob;
    
    const barEl = document.querySelector(`#${id} .queue-progress-bar`) as HTMLElement;
    if (barEl) {
      barEl.style.width = '100%';
      barEl.classList.add('success');
    }
    
    // Calculate percentage size savings
    const savings = 100 - (item.compressedSize / item.originalSize) * 100;
    const savingsText = savings > 0 ? `Saved ${savings.toFixed(0)}%` : 'Size increased';
    
    const metaEl = document.querySelector(`#${id} .queue-item-meta`) as HTMLElement;
    if (metaEl) {
      metaEl.innerHTML = `
        <span>Original: ${formatBytes(item.originalSize)}</span> | 
        <span style="color: var(--color-success); font-weight: 500;">
          Compressed: ${formatBytes(item.compressedSize)} (${savingsText})
        </span>
      `;
    }
  }

  // Added the missing markFailed method
  public markFailed(id: string, errorMessage: string): void {
    const item = this.items.find((i) => i.id === id);
    if (!item) return;

    item.status = 'failed';
    const metaEl = document.querySelector(`#${id} .queue-item-meta`) as HTMLElement;
    if (metaEl) {
      metaEl.innerHTML = `<span style="color: var(--color-error);">${errorMessage}</span>`;
    }
  }

  public clear(): void {
    this.items = [];
    this.listEl.innerHTML = `
      <div class="queue-empty" id="queue-empty">
        <p>No images in queue yet. Upload images to start.</p>
      </div>
    `;
    this.actionsEl.classList.add('hidden');
    this.updateSummaryCount();
  }

  private updateSummaryCount(): void {
    this.countEl.textContent = `${this.items.length} files`;
  }

  private renderItem(item: QueueItem): void {
    const itemHtml = `
      <div class="queue-item" id="${item.id}">
        <div class="queue-item-header">
          <span class="queue-item-name" title="${item.file.name}">${item.file.name}</span>
          <span class="queue-item-meta">Waiting...</span>
        </div>
        <div class="queue-item-meta">
          <span>Size: ${formatBytes(item.originalSize)}</span>
        </div>
        <div class="queue-item-progress">
          <div class="queue-progress-bar" style="width: 0%;"></div>
        </div>
      </div>
    `; 
    
    // Append to list element
    this.listEl.insertAdjacentHTML('beforeend', itemHtml);
  }
}
