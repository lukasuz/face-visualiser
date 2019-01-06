// window.onload = () => {
//     if (navigator.mediaDevices.getUserMedia) {
//         navigator.mediaDevices.getUserMedia({video: true})
//       .then(function(stream) {
//         const video = document.getElementById('videoElement')
//         video.srcObject = stream
//         return video
//       })
//       .then(async video => {
//         await faceapi.loadSsdMobilenetv1Model(MODEL_PATH)
//         await faceapi.loadFaceLandmarkModel(MODEL_PATH)
//         await faceapi.loadFaceRecognitionModel(MODEL_PATH)
//
//         let fullFaceDescriptions = await faceapi.detectAllFaces(video).withFaceLandmarks().withFaceDescriptors()
//         // fullFaceDescriptions = fullFaceDescriptions.map(fd => fd.forSize(video.width, video.height))
//
//         const detectionsArray = fullFaceDescriptions.map(fd => fd.landmarks)
//         console.log(detectionsArray)
//       })
//       .catch(err => {
//         console.error(err)
//         alert(err)
//       })
//     }
// }
