export function formatBytes(bytes : number, decimals = 2):string {  
    if (bytes === 0) return '0 Bytes';

    const BYTES_IN_KYLOBYTES = 1024;
    const decimalPlaces = decimals < 0 ? 0 :decimals;
    const unitLabels = ['Bytes', 'KB','MB', 'GB'];

    //calulate which unit index we are at (0 = bytes, 1=kb, 2=mb, 3 = GB)
    const unitIndex = Math.floor(Math.log(bytes) / Math.log(BYTES_IN_KYLOBYTES))
    // Divide bytes by 1024^ unitIndex to get the size in the target unit, format it, and append the label
    const formatedSize = parseFloat((bytes/Math.pow(BYTES_IN_KYLOBYTES, unitIndex)).toFixed(decimalPlaces))

    return `${formatedSize} ${unitLabels[unitIndex]}`    
}

export function downloadBlob (blob : Blob, filename:string) :void {
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a')

    a.href = url
    a.download = filename;

    document.body.appendChild(a);
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url);
    
}