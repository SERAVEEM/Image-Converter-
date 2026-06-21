// src/component/CompareSlider.ts

export class CompareSlider {
  private containerEl: HTMLElement;
  private afterWrapperEl: HTMLElement;
  private handleEl: HTMLElement;
  private beforeImgEl: HTMLImageElement;
  private afterImgEl: HTMLImageElement;
  private isDragging: boolean = false;

  constructor(
    containerId: string,
    afterWrapperId: string,
    handleId: string,
    beforeImgId: string,
    afterImgId: string
  ) {
    this.containerEl = document.getElementById(containerId) as HTMLElement;
    this.afterWrapperEl = document.getElementById(afterWrapperId) as HTMLElement;
    this.handleEl = document.getElementById(handleId) as HTMLElement;
    this.beforeImgEl = document.getElementById(beforeImgId) as HTMLImageElement;
    this.afterImgEl = document.getElementById(afterImgId) as HTMLImageElement;

    this.initEvents();
  }

  /* Sets up the images and resets the slider to the center (50%) */
  public setImages(originalSrc: string, compressedSrc: string): void {
    this.beforeImgEl.src = originalSrc;
    this.afterImgEl.src = compressedSrc;
    
    // Reset positions to 50% split on load
    this.updateSliderPosition(50);
  }

  private initEvents(): void {
    // 1. Mouse Drag events
    this.handleEl.addEventListener('mousedown', (e: MouseEvent) => {
      e.preventDefault();
      this.isDragging = true;
    });

    window.addEventListener('mousemove', (e: MouseEvent) => {
      if (!this.isDragging) return;
      this.handleMove(e.clientX);
    });

    window.addEventListener('mouseup', () => {
      this.isDragging = false;
    });

    // 2. Touch Drag events (for mobile screens)
    this.handleEl.addEventListener('touchstart', ()=> {
        this.isDragging = true;
    });

    window.addEventListener('touchmove', (e: TouchEvent) => {
      if (!this.isDragging) return;
      if (e.touches.length > 0) {
        this.handleMove(e.touches[0].clientX);
      }
    });

    window.addEventListener('touchend', () => {
      this.isDragging = false;
    });
  }

  private handleMove(clientX: number): void {
    // Get the bounding box of the comparison container to find its coordinates
    const containerRect = this.containerEl.getBoundingClientRect();
    
    // Calculate the position of the cursor relative to the container's left edge
    const relativeX = clientX - containerRect.left;
    
    // Convert coordinate to a percentage (0% to 100%)
    let percentage = (relativeX / containerRect.width) * 100;
    
    // Clamp the percentage between 0 and 100 so the handle doesn't move outside
    if (percentage < 0) percentage = 0;
    if (percentage > 100) percentage = 100;
    
    this.updateSliderPosition(percentage);
  }

  private updateSliderPosition(percentage: number): void {
    // Update the slider handle horizontal position
    this.handleEl.style.left = `${percentage}%`;
    
    // Update the width of the overlay wrapper containing the second image
    this.afterWrapperEl.style.width = `${percentage}%`;
  }
}
