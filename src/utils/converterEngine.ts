
export interface ConvertOptions {
    format: 'webp' | 'avif'
    quality: number; // value from 0,5 to 1.0
    scale: number; // value from 0.5 to 2.0 (0.8 for 80%)
}

export function convertImage(file: File, options: ConvertOptions): Promise<Blob> {
    return new Promise((resolve, reject) => {
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
                reject(new Error('couldnt get canvas context'));
                return;
            }
            canvas.width = img.naturalWidth * options.scale;
            canvas.height = img.naturalHeight * options.scale;

            //draw image in to the canvas at the new scaled size
            ctx.drawImage(img, 0, 0, canvas.width, canvas.height)

            //compress and convert to blob
            if (options.format === 'avif') {
                const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);

                // Dynamically import @jsquash/avif to load the WASM binary on demand
                import('@jsquash/avif')
                    .then(async (avifModule) => {
                        try {
                            // Map options.quality (0.0 to 1.0) to cqLevel (63 to 0)
                            // cqLevel: 0 (lossless/best) to 63 (worst)
                            const cqLevel = Math.round(63 - (options.quality * 63));

                            const avifBuffer = await avifModule.encode(imageData, {
                                cqLevel: cqLevel,
                                speed: 6, // balanced effort
                            });

                            const blob = new Blob([avifBuffer], { type: 'image/avif' });
                            resolve(blob);
                        } catch (err) {
                            reject(err instanceof Error ? err : new Error('AVIF encoding failed'));
                        }
                    })
                    .catch((err) => {
                        reject(new Error('Failed to load AVIF encoder module: ' + err.message));
                    });
            } else {
                const mimeType = 'image/webp';
                canvas.toBlob(
                    (blob) => {
                        if (blob) {
                            resolve(blob);
                        } else {
                            reject(
                                new Error(`Failed to convert to WEBP. Your browser may not support WebP canvas encoding.`)
                            );
                        }
                    },
                    mimeType,
                    options.quality
                );
            }
        };

        //handle image errors
        img.onerror = () => {
            URL.revokeObjectURL(objectUrl);
            reject(new Error('failed to load image file'))
        };
        img.src = objectUrl
    },
    );
}