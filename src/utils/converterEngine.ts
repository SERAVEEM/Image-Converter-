
export interface ConvertOptions {
    format : 'webp'  | 'avif'
    quality : number; // value from 0,5 to 1.0
    scale : number; // value from 0.5 to 2.0 (0.8 for 80%)
}

export function convertImage(file : File , options: ConvertOptions): Promise<Blob> {
    return new Promise ((resolve, reject) => {
        // create virtual image element in memory
        const img = new Image();
        const objectUrl = URL.createObjectURL(file);


        //after the image finished loading, draw it to canvas
        img.onload = () => {
            URL.revokeObjectURL(objectUrl); //cleaning up the url 

            //create canvas and calculate sclaed dimention
            const canvas = document.createElement('canvas')
            const ctx = canvas.getContext('2d')

            if (!ctx) {
                reject(new Error ('couldnt get canvas context'));
                return;
            }
            canvas.width = img.naturalWidth * options.scale;
            canvas.height = img.naturalHeight * options.scale;

            //draw image in to the canvas at the new scaled size
            ctx.drawImage(img, 0, 0, canvas.width, canvas.height)

            //compress and conver to blob
            const mimeType = options.format === 'webp'? 'image/webp' : 'image/avif';


            canvas.toBlob (
                (blob) => {
                    if (blob) {
                        resolve(blob);
                    } else {
                        reject(
                            new Error(`failed to convert to ${options.format.toUpperCase()}. your brower may not support to encode this format.`)
                        );
                    }
                },
                mimeType,
                options.quality
            );
        };

            //handle image errors
            img.onerror = () => {
                URL.revokeObjectURL(objectUrl);
                reject (new Error ('failed to load image file'))
            };
            img.src = objectUrl
        }, 
    );
}