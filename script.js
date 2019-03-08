const BOARD_SIZE = 360
const BALL_DIAMETER = 20
const PADDLE_HEIGHT = 10
const PADDLE_WIDTH = 60
const PADDLE_X = (PADDLE_HEIGHT - PADDLE_WIDTH) / 2
const PADDLE_Y = 10
const PADDLE_VELOCITY = 5

const ARROW_KEY_LEFT = 'ArrowLeft'
const ARROW_KEY_RIGHT = 'ArrowRight'

const BRICK_ROW_COUNT = 4
const BRICK_COLUMN_COUNT = 4
const BRICK_WIDTH = 77.5
const BRICK_HEIGHT = 20
const BRICK_PADDING = 10
const BRICK_OFFSET_TOP = 10
const BRICK_OFFSET_LEFT = 10

const Ball = ({posX, posY}) => {
  return <div id="ball" style={{left: posX, top: posY}}></div>
}

const Paddle = ({posX}) => {
  return <div id="paddle" style={{left: posX, bottom: PADDLE_Y}}></div>
}

const Brick = ({posX, posY, display}) => {
  return <div className="brick" style={{left: posX, top: posY, display: display ? 'block' : 'none'}}></div>
}

class Breakout extends React.Component {
  constructor(props) {
    super(props)

    this.bricks = []
    for (let c = 0; c < BRICK_COLUMN_COUNT; c++) {
        this.bricks[c] = []
        for (let r = 0; r < BRICK_ROW_COUNT; r++) {
            this.bricks[c][r] = {
              x: (c * (BRICK_WIDTH + BRICK_PADDING)) + BRICK_OFFSET_LEFT,
              y: (r * (BRICK_HEIGHT + BRICK_PADDING)) + BRICK_OFFSET_TOP,
              status: 1 }
        }
    }

    this.state = {
      ballX: 50,
      ballY: 200,
      paddleX: BOARD_SIZE / 2,
      dx: 3,
      dy: -3,
      bricks: this.bricks,
      shaking: false,
    }
  }

  _arrowPressed = ''

  _handleKeyDown = (e) => {
    if (e.key == ARROW_KEY_LEFT) {
        this._arrowPressed = ARROW_KEY_LEFT
    } else if (e.key == ARROW_KEY_RIGHT) {
        this._arrowPressed = ARROW_KEY_RIGHT
    }
  }

  _handleKeyUp = (e) => {
    if (e.key == this._arrowPressed) {
      this._arrowPressed = ''
    }
  }

  update() {
    this._requestID = requestAnimationFrame(() => this.update())

    let {ballX, ballY, dx, dy, paddleX, bricks} = this.state

    let newState = {
      ballX: ballX + dx,
      ballY: ballY + dy,
    }

    const _brickCollisions = () => {
      for (let c = 0; c < BRICK_COLUMN_COUNT; c++) {
        for (let r = 0; r < BRICK_ROW_COUNT; r++) {
          let b = bricks[c][r]
          if (b.status == 1) {
            if (ballX > b.x && ballX < b.x + BRICK_WIDTH
                && ballY > b.y && ballY < b.y + BRICK_HEIGHT) {
              newState.dy = -dy
              newState.bricks = bricks
              newState.bricks[c][r].status = 0
              newState.shaking = true
              setTimeout(() => this.setState({shaking: false}), 300)
            }
          }
        }
      }
    }

    _brickCollisions()

    // Wall collisions
    if (ballX + dx > BOARD_SIZE - BALL_DIAMETER || ballX + dx < 0) {
      newState.dx = -dx
    }

    if (ballY + dy < 0) {
      newState.dy = -dy

    } else if (ballY + dy > BOARD_SIZE - BALL_DIAMETER - PADDLE_Y * 2) {
      if (ballX > paddleX && ballX < paddleX + PADDLE_WIDTH) {
        newState.dy = -dy
      } else {
        cancelAnimationFrame(this._requestID)
        alert('Game over')
        document.location.reload()
      }
    }

    // Paddle movement
    if (this._arrowPressed == ARROW_KEY_LEFT && paddleX > 0) {
      newState.paddleX = paddleX - PADDLE_VELOCITY
    } else if (this._arrowPressed == ARROW_KEY_RIGHT
               && paddleX < BOARD_SIZE - PADDLE_WIDTH) {
      newState.paddleX = paddleX + PADDLE_VELOCITY
    }

    this.setState(newState)
  }

  componentDidMount() {
    this.update()
    document.addEventListener('keydown', this._handleKeyDown)
    document.addEventListener('keyup', this._handleKeyUp)
  }

  render() {
    return <div id="gameboard" className={this.state.shaking ? 'shaking' : ''}>
      {[
        <Ball posX={this.state.ballX} posY={this.state.ballY} key="ball"></Ball>,
        <Paddle posX={this.state.paddleX} key="paddle"></Paddle>
      ].concat(
        this.bricks
          .flat()
          .map((brick, index) => 
                 <Brick key={index}
                        posX={brick.x}
                        posY={brick.y}
                        display={brick.status == 1}></Brick>))}
    </div>
  }
}

ReactDOM.render(
  <Breakout></Breakout>,
  document.getElementById('root')
)