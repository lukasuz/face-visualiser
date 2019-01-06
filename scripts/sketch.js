let video
let loaded = false
let recursive = true

let facialLandmarks
let tinyFaceDetectorOptions
const INPUT_SIZE = 128

let scaleFactor = 700
let pointSize = 1
let stride = 25
let distanceFactor = 24
let sizeFactor = 10
let grid = []
let maxDistance = 25

let colorM
let canvas

class colorManger {
  constructor(){
    this.h = 0
    this.s = 70
    this.l = 50
    this.step = 2
  }
  getNextColour() {
    this.h = (this.h + this.step) % 360
    return [this.h, this.s, this.l]
  }
}

/* Setup function once called at the start */
function setup() {
  if (navigator.mediaDevices.getUserMedia) {
      navigator.mediaDevices.getUserMedia({video: true})
    .then(function(stream) {
      video = document.getElementById('videoElement')
      video.srcObject = stream

      canvas = createCanvas(windowWidth, windowHeight)
      console.log(canvas)
      textSize(40)
      textAlign(CENTER, CENTER)
      text('loading...', windowWidth/2, windowHeight/2)

      return video
    })
    .then(async video => {
      const MODEL_PATH = 'http://localhost:8080/'

      await faceapi.loadFaceLandmarkTinyModel(MODEL_PATH)
      await faceapi.loadTinyFaceDetectorModel(MODEL_PATH)

      tinyFaceDetectorOptions = new faceapi.TinyFaceDetectorOptions({
        inputSize: INPUT_SIZE,
        scoreThreshold: 0.5
      })
      colorM = new colorManger()
      updateLandmarks()
      loaded = true

      noStroke()
      generateGrid(stride)
      // grid.forEach(point => {
      //   ellipse(point[0], point[1], pointSize, pointSize)
      // })
    })
    .catch(err => {
      console.error(err)
      alert(err)
    })
  }
}

function generateGrid(stride) {
  for(let x = 0; x < windowWidth; x += stride) {
    for(let y = 0; y < windowHeight; y += stride) {
      grid.push([x, y])
    }
  }
}

let counter = 0
async function updateLandmarks() {
  // const facialLandmarks = await faceapi.detectSingleFace(video, tinyFaceDetectorOptions).withFaceLandmarks(true)
  const facialLandmarks = await faceapi.detectFaceLandmarksTiny(video)
  c = colorM.getNextColour()
  // // console.log(c)
  fill(color('hsl('+c[0]+','+c[1]+'%,'+c[2]+'%)'))
  if(facialLandmarks) {
    if (counter < 20) {
      counter++
      console.log(facialLandmarks)
    }
    let lm = facialLandmarks.positions
    background(0)
    lm = normalizeFace(lm)
    lm = mirrorFace(lm)

    lm = scaleFace(lm, scaleFactor)

    lm = centerFace(lm)

    grid.forEach(point => {
      let bestDistance = findNearest(lm, point)
      let invertedNormDist = 1 - (bestDistance / (windowWidth/2))
      let size = Math.max(Math.pow(invertedNormDist, distanceFactor) * sizeFactor, pointSize)
      // // fill(color('rgba('+rndNum()+','+rndNum()+','+rndNum()+','+invertedNormDist+')')) rndcolor
      // // c = colorM.getNextColour()
      // // // console.log(c)
      // // fill(color('hsl('+c[0]+','+c[1]+'%,'+c[2]+'%)'))
      //
      // ellipse(point[0], point[1], size, size)
      // if (bestDistance < maxDistance) {
      //   rect(point[0], point[1], size, size)
      // }
        // ellipse(point[0], point[1], pointSize, pointSize)
      // }
    })
    lm.forEach(landmark => {
      ellipse(landmark['_x'], landmark['_y'], 5, 5)
    })
  }
  if (recursive) updateLandmarks()
}

function rndNum() {
  return Math.floor(Math.random() * 256)
}

/**
* @returns num
*/
function findNearest(neighbourhood, point) {
  let nearestNeighbour = neighbourhood[0]
  let nearestDist = dist(point[0], point[1], neighbourhood[0]['_x'], neighbourhood[0]['_y'])
  neighbourhood.forEach(neighbour => {
    let newDistance = dist(point[0], point[1], neighbour['_x'], neighbour['_y'])
    if (newDistance < nearestDist) {
        nearestDist = newDistance
        nearestNeighbour = neighbour
    }
  })
  return nearestDist
}


function scaleFace(values, factor) {
  for(let j = 0; j < values.length; j++) {
    values[j]['_x'] = values[j]['_x'] * factor
    values[j]['_y'] = values[j]['_y'] * factor
  }
  return values
}


function normalizeFace(values) {
  let yVals = getMaxMin(values, '_x')
  let xVals = getMaxMin(values, '_y')

  for(let j = 0; j < values.length; j++) {
    values[j]['_x'] = (values[j]['_x'] - xVals[1]) / (xVals[0] - xVals[1]) - 0.5
    values[j]['_y'] = (values[j]['_y'] - yVals[1]) / (yVals[0] - yVals[1]) - 0.5
  }

  return values
}

function mirrorFace(values) {
  for(let j = 0; j < values.length; j++) {
    values[j]['_x'] =  -1 * values[j]['_x']
  }
  return values
}

function getMaxMin(values, elmName) {
  let biggestVal = values[0][elmName]
  let smallestVal = values[0][elmName]

  for(let i = 0; i < values.length; i++) {
    if (biggestVal < values[i][elmName]) biggestVal = values[i][elmName]
    if (smallestVal > values[i][elmName]) smallestVal = values[i][elmName]
  }
  return [biggestVal, smallestVal]
}

function centerFace(values) {
  biggest = getBiggest(values)

  values.forEach(value => {
    // input size has an effect on the values that why the addition seems so random
    value['_x'] = (value['_x'] + windowWidth / 2) + biggest[0] / 4
    value['_y'] = (value['_y'] + windowHeight / 2) + biggest[1] / 4
  })
  return values
}

function getBiggest(values) {
  let biggestX = values[0]['_x']
  let biggestY = values[0]['_y']
  for(let i = 0; i < values.length; i++) {
    if (biggestX < values[i]['_x']) biggestX = values[i]['_x']
    if (biggestY < values[i]['_y']) biggestY = values[i]['_y']
  }
  return [biggestX, biggestY]
}

function getSmallest(values) {
  let smallestX = values[0]['_x']
  let smallestY = values[0]['_y']
  for(let i = 0; i < values.length; i++) {
    if (smallestX > values[i]['_x']) smallestX = values[i]['_x']
    if (smallestY > values[i]['_y']) smallestY = values[i]['_y']
  }
  return [smallestX, smallestY]
}

/* Eventhandler function provided by p5 */
function windowResized() {
  resizeCanvas(windowWidth, windowHeight)
}
