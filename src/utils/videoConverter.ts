export interface VideoConverterOptions {
  bitrate?: number;
}

/**
 * @param file
 * @param options 
 * @returns
 */
export function convertVideotoWebM (file : File, options: VideoConverterOptions = {}):
Promise<Blob> {
    return new Promise ((resolve, reject)=> {
        // create virtual video player in memory
        const video = document.createElement('video');
        video.preload = 'auto';
        video.muted = true;
        video.playsInline = true ;

        const objectUrl = URL.createObjectURL(file);
        
        video.onloadedmetadata = () => {
        try {
            // to capture the video into an stream for recomession using MSE
            const stream = (video as any).captureStream()
            ?(video as any).captureStream()
            :(video as any).mozCaptureStream();

            // negotiate supported WebM codecs and options 
            let mimeType = 'video/webm;codecs=vp9,opus';
            if (!MediaRecorder.isTypeSupported(mimeType)) {
                mimeType = 'video/webm;codecs=vp8,opus';
                if(!MediaRecorder.isTypeSupported(mimeType)) {
                    mimeType = 'video/webm';
                }
            }

            // init media recorder with config
            const recorderOptions : MediaRecorderOptions = {mimeType};
            if(options.bitrate) {
                recorderOptions.videoBitsPerSecond = options.bitrate;
            }

            const recorder = new MediaRecorder(stream, recorderOptions);
            const chunks : Blob[] = [];

            // data collect 
            recorder.ondataavailable = (e) => {
                if (e.data && e.data.size > 0) {
                    chunks.push(e.data);
                }
            };

            //resolver final blob when playback ends
            recorder.onstop = () => {
                URL.revokeObjectURL(objectUrl);
                const webmBlob = new Blob(chunks, {type : mimeType});
                resolve (webmBlob);
            };

            //start recording 
            recorder.start();
            video.play().catch (reject);

            //stop recorder if finished 
            video.onended = () => {
                recorder.stop();
            };
        } catch (err) {
            URL.revokeObjectURL (objectUrl) ;
            reject (err)
        }
        };
        //handle video load eror
        video.onerror = () => {
            URL.revokeObjectURL (objectUrl) ;
            reject (new Error ('failed to load video file'));
        };
        video.src = objectUrl
    })
}
