//variable parameters of application
const HEIGHT = 1000
const CENTER_X = HEIGHT / 2
const CENTER_Y = HEIGHT / 2
const NO_NOODLES = 6000 //inc this to make more noodles, therefore more closer to the edge of bowl (although higher number inc computing time)
const MIN_RADIUS = 25
const MAX_RADIUS = 50
const MAX_LENGTH = 500
const WIDTH_NOODLE = 9
const BOWL_THICKNESS = 5
const PI = Math.PI
const TWO_PI = 2 * Math.PI
const NOODLE_THICKNESS = 1.5 //thickness of line drawing noodle

var context

class Circle { //class to build the circles later used to draw each arc of a noodle. It therefore has methods to find starting angle, end angle, arc length, end points 



  constructor(start_x, start_y, opp_x, opp_y, angle, acw) {
    this.start_x = start_x //starting point for circle
    this.start_y = start_y
    this.opp_x = opp_x // finds point opposite on circle (along diameter)
    this.opp_y = opp_y
    this.angle = PI * angle / 180 //random angle through circle (input in degrees, uses radians in code)
    this.acw = acw
    const end = this.getEndPoint() // Starting point for next circle/ end point for this circle (just giving as new variable)
    this.end_x = end.x
    this.end_y = end.y
    this.c_x = end.c_x
    this.c_y = end.c_y
    this.radius = Math.sqrt(Math.pow(this.start_x - this.c_x, 2) + Math.pow(this.start_y - this.c_y, 2)) // using pythagoras
  }

  getDrawingFields() { // parameters that need to be called to draw the actual noodle
    return {
      x: this.c_x, //x,y are that of centre
      y: this.c_y,
      r: this.radius,
      sa: this.getInitialAngle(),
      ea: this.getFinalAngle(),
      acw: this.acw
    }
  }
  getStartPoint() {
    return {
      x: this.start_x,
      y: this.start_y
    }
  }

  getInitialAngle() { // finds angle at which noodle is starting 
    const x = this.start_x - this.c_x
    const y = this.c_y - this.start_y // opposite way to x as origin in canvas is in top left of screen (y axis is opposite) 
    var angle = -Math.atan(y / x) // make neg as the arc function from canvas takes positive angle from the horizontal clockwise (down) which is opposite sign to the anticlockwise convention tan function uses 
    return x < 0 ? angle + PI : angle // to make it conform to the canvas convention for neg 

  }

  getFinalAngle() { //same method of inital angle method
    const x = this.end_x - this.c_x
    const y = this.c_y - this.end_y
    var angle = -Math.atan(y / x)
    return x < 0 ? angle + PI : angle
  }

  getEndPoint() {
    const c_x = (this.start_x + this.opp_x) / 2 //finds centre point
    const c_y = (this.start_y + this.opp_y) / 2


    const end_x = (this.start_x - c_x) * (Math.cos(this.angle)) - (c_y - this.start_y) * (Math.sin(this.angle)) + c_x //finding the end point using a rotation matrix 
    const end_y = (c_y - this.start_y) * (Math.cos(this.angle)) + (this.start_x - c_x) * (Math.sin(this.angle)) + c_y //takes centre of the circle as the origin 

    return {
      x: end_x,
      y: end_y,
      c_x: c_x,
      c_y: c_y
    }
  }

  getLength() {
    return this.radius * this.angle //finds arc length
  }



  getNextPoint(distance) { //distance = radius of new circle, this gives opp_x and y for next
    const unit_vector_x = (this.end_x - this.c_x) / this.radius
    const unit_vector_y = (this.c_y - this.end_y) / this.radius
    return {
      x: this.end_x + (unit_vector_x * distance * 2),
      y: this.end_y - (unit_vector_y * distance * 2),
    }
  }
}



class Arc { //class for combining circle elements, has a method generateArc that returns list of circle elements needed to draw a noodle to the boundary conditions eg below max length



  constructor(length, x, y, min_rad, bowl_rad) { // length = no of points included in the noodle, x & y are starting points
    this.valid = true
    this.circleList = this.generateArc(length, x, y, min_rad, bowl_rad)
  }

  getCircleList() {
    return this.circleList
  }

  isValid() {
    return this.valid
  }

  generateArc(length, x, y, min_rad, bowl_rad) {
    var circleList = []
    var f_x = x // first starting point used in Circle
    var f_y = y
    var s_x = f_x + randomBetweenOneAndTwo() * min_rad * randomNegative() //finds second point
    var s_y = f_y + randomBetweenOneAndTwo() * min_rad * randomNegative() // max rad = 2 * min rad

    var angle = generateRandomAngle()
    var remaining_length = length
    var acw = true

    while (remaining_length > 0 && this.valid) { //doesnt continue if runs out of length or goes out of bounds
      const circle = new Circle(f_x, f_y, s_x, s_y, angle, acw)
      remaining_length -= circle.getLength() //updates length so that it remains below max length



      const end_point = circle.getEndPoint()
      f_x = end_point.x // update new starting point with the previous end point
      f_y = end_point.y

      if (Math.sqrt(Math.pow(end_point.c_x - CENTER_X, 2) +
          Math.pow(end_point.c_y - CENTER_Y, 2)) > bowl_rad - min_rad * 2) { //makes the noodle in valid so it wont plot if it goes outside the bowl at any point
        this.valid = false
        //return circleList //why
      }

      angle = generateRandomAngle()
      const opp_point = circle.getNextPoint(min_rad * randomBetweenOneAndTwo())
      s_x = opp_point.x
      s_y = opp_point.y
      acw = !acw //alternating between cw and acw for smooth noodle
      //keep looping while noodle length is below max


      circleList.push(circle)
    }
    return circleList
  }
}

class Noodle {



  constructor(arc) {
    this.arc = arc
    this.drawingFields = {}
  }



  isValid() {
    return this.arc.isValid()
  }



  drawArc(r, width = NOODLE_THICKNESS, colour = 'black') {
    context.beginPath()
    context.arc(this.drawingFields.x, this.drawingFields.y, r, this.drawingFields.sa, this.drawingFields.ea, this.drawingFields.acw)
    context.lineWidth = width
    context.strokeStyle = colour
    context.stroke()
  }



  draw(width) {
    const circleList = this.arc.getCircleList()
    for (let i = 0; i < circleList.length; i++) {
      const circle = circleList[i]
      this.drawingFields = circle.getDrawingFields()

      if (i == 0) {
        var start = circle.getStartPoint()
        context.beginPath()
        context.arc(start.x, start.y, width / 2, 0, TWO_PI, this.drawingFields.acw)
        context.fillStyle = 'white'
        context.lineWidth = NOODLE_THICKNESS
        context.strokeStyle = 'black'
        context.fill()
        context.stroke()
      }

      if (i == circleList.length - 1) {
        var end = circle.getEndPoint()
        context.beginPath()
        context.arc(end.x, end.y, width / 2, 0, TWO_PI, this.drawingFields.acw)
        context.fillStyle = 'white'
        context.lineWidth = NOODLE_THICKNESS
        context.strokeStyle = 'black'
        context.fill()
        context.stroke()
      }

      this.drawArc(this.drawingFields.r, width, 'white')
      this.drawArc(this.drawingFields.r + width / 2)
      this.drawArc(this.drawingFields.r - width / 2)
    }
  }
}

//Bootstrap the application
function bootstrap() { //generates 'grid'/actual drawing canvas
  var body = document.getElementById('canvas-body')
  body.width = parseInt(HEIGHT)
  body.height = parseInt(HEIGHT)
  var canvas = document.getElementById('canvas')
  canvas.width = parseInt(HEIGHT)
  canvas.height = parseInt(HEIGHT)
  context = canvas.getContext('2d')
}

function randomNegative() {
  return Math.random() < 0.5 ? -1 : 1 //any no generated below 0.5 returns -1, above = 1 etc
}

function randomBetweenOneAndTwo() { //rando number between 1 and 2
  return Math.random() + 1
}

function generateRandomAngle() { //angles between 90 and 270
  return Math.random() * 180 + 90
}


function main() {
  bootstrap()

  const radius = CENTER_X * 9 / 10 //bowl radius = 450

  let i = 0
  while (i < NO_NOODLES) {
    const start_x = Math.random() * (radius * 2)
    const start_y = Math.random() * (radius * 2)
    const rad = Math.random() * (MAX_RADIUS - MIN_RADIUS) + MIN_RADIUS
    var arc = new Arc(MAX_LENGTH, start_x, start_y, rad, radius)
    var noodle = new Noodle(arc)
    if (noodle.isValid()) {
      noodle.draw(WIDTH_NOODLE)
      i++
    }
  }
  //draws bowl
  context.beginPath()
  context.arc(CENTER_X, CENTER_Y, radius, 0, TWO_PI, true)
  context.lineWidth = BOWL_THICKNESS
  context.strokeStyle = 'black'
  context.stroke()
}
