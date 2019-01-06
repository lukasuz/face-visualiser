// /**
// * Initialises the webcam
// * @returns {Promise} containing the reference to the html video element
// */
// function initVideo() {
//   const video = document.getElementById('videoElement')
//   if (navigator.mediaDevices.getUserMedia) {
//       navigator.mediaDevices.getUserMedia({video: true})
//     .then(function(stream) {
//       video.srcObject = stream
//       return Promise.resolve(video)
//     })
//     .catch(err => {
//       return Promise.reject(err)
//     })
//   }
// }
