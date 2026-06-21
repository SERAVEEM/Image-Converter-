export class Dropzone {
    private dropzoneEl: HTMLElement;
    private fileInputEl : HTMLInputElement; //change to HTMLInputElement
    private browseBtnEl : HTMLInputElement; //change to HTMLInputElement
    private onFilesSelectedCallback : (files : File[]) => void;

    constructor (
        dropZoneId: string, 
        fileInputId: string, 
        browseBtnId: string,
        onFilesSelected : (files: File[]) => void  
    ) {
        this.dropzoneEl = document.getElementById(dropZoneId) as HTMLElement;
        this.fileInputEl = document.getElementById(fileInputId) as HTMLInputElement; //cast to HTMLInputElement
        this.browseBtnEl = document.getElementById(browseBtnId) as HTMLInputElement; //cast to HTMLInputElement
        this.onFilesSelectedCallback = onFilesSelected;

        this.initEvents();
    }
    private initEvents() : void {
        //trigger the hidden browser input when "browse" button is clicked
        this.browseBtnEl.addEventListener('click', ()=> {
            this.fileInputEl.click();       
        });

        //handle files chosen via the browser file selection dialog
        this.fileInputEl.addEventListener('change', ()=> {
            if(this.fileInputEl.files) {
                this.handleFileSelection(this.fileInputEl.files)
            }
        });
        //handle files drag over the dropzone
        this.dropzoneEl.addEventListener('dragover', (e : DragEvent) => {
            e.preventDefault();
            this.dropzoneEl.classList.remove('dragover');
        });

        //handle files drop into the drop zone
        this.dropzoneEl.addEventListener('drop', (e : DragEvent)=> {
            e.preventDefault();
            this.dropzoneEl.classList.remove('dragover');
            if(e.dataTransfer && e.dataTransfer.files) {
                this.handleFileSelection (e.dataTransfer.files)
            }
        });
    }

    private handleFileSelection (filelist: FileList):void {
        const validFiles : File[] = []
        const allowedTypes = ['image/png', 'image/jpg', 'image/jpg'];

        for (let i = 0; i< FileList.length; i ++) {
            const file = filelist[i]
            if(allowedTypes.includes(file.type)) {
                validFiles.push(file);
            } else {
                alert(`file format not supported: ${file.name}. please select JPG, JPEG or PNG.`);
            }
        }

        if (validFiles.length > 0) {
            this.onFilesSelectedCallback(validFiles);
        }
        this.fileInputEl.value = '';
    }
}