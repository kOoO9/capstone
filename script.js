//import html2canvas from 'html2canvas';
const video = document.getElementById('videoInput')
//let click_button = document.getElementById("click-photo");
let num=0
Promise.all([
    faceapi.nets.tinyFaceDetector.loadFromUri('/models'),
    faceapi.nets.faceRecognitionNet.loadFromUri('/models'),
    faceapi.nets.faceLandmark68Net.loadFromUri('/models'),
    faceapi.nets.ssdMobilenetv1.loadFromUri('/models') //heavier/accurate version of tiny face detector
]).then(start)

function start() {
    
    navigator.getUserMedia(
        { video:{} },
        stream => video.srcObject = stream,
        err => console.error(err)
    )
    recognizeFaces()
}

// click_button.addEventListener('click', function() {
//     canvas.getContext('2d').drawImage(video, 0, 0, canvas.width, canvas.height);
//     let image_data_url = canvas.toDataURL('image/jpeg');

//     // data url of the image
//     console.log(image_data_url);
// });

async function recognizeFaces() {
    const labels = ['Black Widow','Captain America'] // for WebCam
    const labeledFaceDescriptors = await Promise.all(
        labels.map(async (label)=>{
            const descriptions = []
            for(let i=1; i<=5; i++) {
                const img = await faceapi.fetchImage(`../labeled_images/${label}/${i}.jpg`)
                const detections = await faceapi.detectSingleFace(img).withFaceLandmarks().withFaceDescriptor()
                descriptions.push(detections.descriptor)
            }
            return new faceapi.LabeledFaceDescriptors(label, descriptions)
        })
    )
    const faceMatcher = new faceapi.FaceMatcher(labeledFaceDescriptors, 0.6)
    document.getElementById('videoInput').play(); ///
    video.addEventListener('play', () => {
        const canvas = faceapi.createCanvasFromMedia(video)
        document.body.append(canvas)
        const displaySize = { width: video.width, height: video.height }
        faceapi.matchDimensions(canvas, displaySize)

        setInterval(async () => {
          const detections = await faceapi.detectAllFaces(video, new faceapi.TinyFaceDetectorOptions()).withFaceLandmarks().withFaceDescriptors()
          canvas.getContext('2d',{ willReadFrequently: true }).clearRect(0, 0, canvas.width, canvas.height)
          const resizedDetections = faceapi.resizeResults(detections, displaySize)

          const results = resizedDetections.map((d) => {
            return faceMatcher.findBestMatch(d.descriptor)
        })
        results.forEach( (result, i) => {
            const box = resizedDetections[i].detection.box
            const drawBox = new faceapi.draw.DrawBox(box, { label: result.toString() })
            drawBox.draw(canvas)
            console.log(result._label)
            if(result._label=='unknown'){
                num +=1
                console.log(num)
                if(num>50){
                    canvas.getContext('2d').drawImage(video, 0, 0, canvas.width, canvas.height);
                    let image_data_url = canvas.toDataURL('image/jpeg');
                    const encodingBase=btoa(image_data_url);     
                    //const decodedString = atob(encodingBase);               
                    console.log(image_data_url)
                    console.log(encodingBase)
                    //console.log(decodedString)
                    num=-100
                 }
            }
    
        })
        //console.log(results._label)

        }, 100)        
    })
}

// video.addEventListener('play', async () => {
//     const canvas = faceapi.createCanvasFromMedia(video)
//     document.body.append(canvas)
    
//     const displaySize = { width: video.width, height: video.height }
//     faceapi.matchDimensions(canvas, displaySize)

    

//     setInterval(async () => {
//         const detections = await faceapi.detectAllFaces(video).withFaceLandmarks().withFaceDescriptors()

//         const resizedDetections = faceapi.resizeResults(detections, displaySize)

//         canvas.getContext('2d').clearRect(0, 0, canvas.width, canvas.height)

//         const results = resizedDetections.map((d) => {
//             return faceMatcher.findBestMatch(d.descriptor)
//         })
//         results.forEach( (result, i) => {
//             const box = resizedDetections[i].detection.box
//             const drawBox = new faceapi.draw.DrawBox(box, { label: result.toString() })
//             drawBox.draw(canvas)
//         })
//     }, 100)


// function loadLabeledImages() {
//     //const labels = ['Black Widow', 'Captain America', 'Hawkeye' , 'Jim Rhodes', 'Tony Stark', 'Thor', 'Captain Marvel']
//     const labels = ['Prashant Kumar'] // for WebCam
//     return Promise.all(
//         labels.map(async (label)=>{
//             const descriptions = []
//             for(let i=1; i<=2; i++) {
//                 const img = await faceapi.fetchImage(`../labeled_images/${label}/${i}.jpg`)
//                 const detections = await faceapi.detectSingleFace(img).withFaceLandmarks().withFaceDescriptor()
//             }
//             const faceDescriptors = [detections.descriptor]
//             return new faceapi.LabeledFaceDescriptors(label, faceDescriptors)
//         })
//     )
// }