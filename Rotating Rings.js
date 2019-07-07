//"use strict";
// Created by Modi

// sliding motion, based on screen coordinates
var alpha = 0.5; // X rotation
var cosAlpha, sinAlpha;
var rotationSpeedX = 0;
var startSlideX;

var beta = 0.5; // Y rotation
var sinBeta, cosBeta;
var rotationSpeedY = 0;
var startSlideY;

var mouseIsDown = false;

// parts template and settings
var outerBlock = [ ];
var parts = [ ];

var blockSize;
var ballSize = 2.0;

// store the coordinates of each touch
var touchInfo = "";
function storeTouches ( event ) {
  touchInfo = "";
  for ( let i = 0; i < event.touches.length; i++ ) {
    touchInfo += 
      '<p>Touch ' + i + 
      ' X -> ' + Math.round ( event.touches[i].pageX ) +
      ' Y -> ' + Math.round ( event.touches[i].pageY ) + '</p>';
  }
}

// calculate the frame rate per second
// the higher filterStrength, the less the fps will reflect temporary variations
// a value of 1 will only keep the last value
var filterStrength = 20;
var frameTime = 0, lastLoop = new Date( ), thisLoop;
function getFrameRate ( ) {
  const thisFrameTime = ( thisLoop = new Date ( ) ) - lastLoop;
  frameTime += ( thisFrameTime - frameTime ) / filterStrength;
  lastLoop = thisLoop;
  return 1000 / frameTime;
}

// show the Info menu
var infoCount = 0;
function showInfo ( ) {
  if ( ( infoCount++ ) % 3 !== 0 ) return;
  const frameRate = getFrameRate ( ) * 3;  // has to be calculated every frame
  $( '#info' ).html ( 
    '<p>Frame Rate: ' + frameRate.toFixed ( 1 ) + '</p>' +
    '<p>Balls: ' + totalBalls + '</p>' +
    '<p>Rotation X: ' + rotationSpeedX.toFixed ( 3 ) + '</p>' +
    '<p>Rotation Y: ' + rotationSpeedY.toFixed ( 3 ) + '</p>' +
    touchInfo );
}

// view and touch/mouse handling
var width, halfWidth;
var height, halfHeight;
var ctx;
function initViewAndTouch ( ) {
  width = window.innerWidth;
  height = window.innerHeight;
  halfWidth = width / 2;
  halfHeight = height / 2;
  blockSize = Math.min ( halfWidth, halfHeight ) * 0.8;

  var canvas = $( 'canvas' )[ 0 ];
  canvas.width = width;
  canvas.height = height;
  ctx = canvas.getContext ( '2d' );

  // handle the touch stuff
  canvas.ontouchstart = function ( event ) {
    event.preventDefault ( );
    storeTouches ( event );

    if ( event.touches.length == 1 ) {
      startSlide ( event.touches[ 0 ].pageX, event.touches[ 0 ].pageY );
    }
  };

  canvas.ontouchmove = function ( event ) {
    event.preventDefault ( );
    storeTouches ( event );

    if ( event.touches.length == 1 ) {
     slideView ( event.touches[ 0 ].pageX, event.touches[ 0 ].pageY );   
    }
  };

  canvas.ontouchend = function ( ) {
    touchInfo = "";
  };

  // handle the mouse drag stuff
  canvas.onmousedown = function ( event ) {
    event.preventDefault ( );
    startSlide ( event.pageX, event.pageY );
    mouseIsDown = true;
  };

  canvas.onmousemove = function ( event ) {
    event.preventDefault ( );
    if ( mouseIsDown ) {
        slideView( event.pageX, event.pageY );
    }
  };

  canvas.onmouseleave = function ( ) {
    mouseIsDown = false;
  };

  canvas.onmouseup = function ( ) {
    mouseIsDown = false;
  };

  // handle the click stuff
  canvas.onclick = function ( ) {
    mouseIsDown = false;
  };
  
   // handle the click stuff
  canvas.ondblclick = function ( ) {
    rotationSpeedX = 0;
    rotationSpeedY = 0;
    setRotationSpeed ( 'stop' ); // for the actual parts
  };
}

// something changed in the settings initialize everything
function init ( ) {
  initViewAndTouch ( );
  createParts ( );
  reInit ( );
  animate ( );
}

function setRotationSpeed ( rotationSpeed ) {
  if ( rotationSpeed === 'stop' ) {
    $( '#doPitch' ).prop ( 'checked', false );
    $( '#doRoll' ).prop ( 'checked', false );
    $( '#doYaw' ).prop ( 'checked', false );
    rotationSpeed = 0;
  }
  const doPitch = $( '#doPitch' ).prop ( 'checked' );
  const doRoll = $( '#doRoll' ).prop ( 'checked' );
  let doYaw = $( '#doYaw' ).prop ( 'checked' );
  let selectedType = $( "input[name='typeSelection']:checked" ).val ( );
  if ( selectedType == 'squares' || selectedType == 'cubes' ) doYaw = false;
  
  const numberOfParts = parts.length - 1; // don't rotate the outer part
  for ( let step = 0; step < numberOfParts; step++ ) {
    if ( step%2 === 0 ) {
        parts[ step ].deltaPitch = rotationSpeed;
    }
    else parts[ step ].deltaRoll = rotationSpeed;
    parts [step ].deltaYaw = rotationSpeed;

    if ( !doPitch ) parts[ step ].deltaPitch = 0;
    if ( !doRoll ) parts[ step ].deltaRoll = 0;
    if ( !doYaw ) parts[ step ].deltaYaw = 0;
  }
}

function reInit ( ) {
  let rotationSpeed = +$( '#rotationSpeed' ).prop ( 'value' );
  setRotationSpeed ( rotationSpeed );
  ballSize = $( '#ballSize' ).prop ( 'value' );
}

function createParts ( ) {
  let selectedTheme = $( "input[name='themeSelection']:checked" ).val ( );
  let selectedType = $( "input[name='typeSelection']:checked" ).val ( );
  let numberOfParts = +$( '#numberOfParts' ).prop ( 'value' );

  // parts
  parts = [];  // reset the parts
  for ( let partNumber = 0; partNumber < numberOfParts; partNumber++ ) {
    let singlePart = {
        [ 'pitch' ]: 0, [ 'deltaPitch' ]: 0,
        [ 'roll' ]: 0, [ 'deltaRoll' ]: 0,
        [ 'yaw' ]: 0, [ 'deltaYaw' ]: 0
    }; 

    let balls = [ ];
    if ( selectedType == 'rings' || selectedType == 'balls' ) {
      makeRingPart ( partNumber, balls,
          blockSize * ( partNumber + 1 ) / numberOfParts, 
          $( '#showPartially' ).prop ( 'value' ) );
    }
    if ( selectedType == 'squares' || selectedType == 'cubes' ) {
      makeSquarePart ( partNumber, balls,
          blockSize * ( partNumber + 1 ) / numberOfParts, 
          $( '#showPartially' ).prop ( 'value' ) );
    }
    singlePart[ 'balls' ] = balls;
    parts.push ( singlePart );
  }
  reInit ( );

  // create a ring part
  function makeRingPart ( number, part, radius, maxAngle ) {
    // draw the actual circle
    let angleStep = Math.PI * 2 / radius;
    for ( let angle = 0; angle < maxAngle; angle += angleStep ) {
      let color = 'white';
      const cosRadius = Math.cos ( angle ) * radius;
      const sinRadius = Math.sin ( angle ) * radius;

      let degree = angle * 360 / 2 / Math.PI; // rainbow
      if ( selectedTheme === 'fire' ) {
        degree = angle * 360 / 8 / Math.PI;
        if ( angle > Math.PI ) degree = 360 / 4 - degree;
      }
      color = 'hsla(' + Math.floor ( degree ) + ',100%,50%,0.6)';
      addBall ( part, color, cosRadius, sinRadius, 0 );
      if ( selectedType === 'balls' ) {
        if ( number % 2 === 0 ) {
          addBall ( part, color, 0, cosRadius, sinRadius );
        } 
        else {
          addBall ( part, color, cosRadius, 0, sinRadius );
        }
      }
    }

    // draw the connection piece
    let x = 0;
    let y = 0;
    if ( number % 2 === 0 ) {
      y = radius - blockSize / numberOfParts / 2;
    }
    else {
      x = radius - blockSize / numberOfParts / 2;
    }
    radius = blockSize / numberOfParts / 2;
    angleStep = Math.PI * 2 / radius;
    for ( let angle = 0; angle < Math.PI * 2; angle += angleStep ) {
      const cosRadius = Math.cos ( angle ) * radius;
      const sinRadius = Math.sin ( angle ) * radius;
      addBall ( part, 'blue', x + cosRadius, y + sinRadius, 0 );
      addBall ( part, 'blue', -x + cosRadius, -y + sinRadius, 0 );
      if ( selectedType === 'balls' ) {
        if ( number % 2 === 0 ) {
          addBall ( part, 'blue', x, y + cosRadius, sinRadius );
          addBall ( part, 'blue', -x,-y + cosRadius, sinRadius );
        }
        else {
          addBall ( part, 'blue', x + cosRadius, y, sinRadius );
          addBall ( part, 'blue', -x + cosRadius, -y, sinRadius );
        }
      }
    }
  }

  // create a square part
  function makeSquarePart ( number, part, sideLength, maxAngle ) {
    // draw the actual square
    make3dLine ( part, 'violet', sideLength, 0, 0, 0, sideLength, 0 );
    make3dLine ( part, 'violet', 0, sideLength, 0, -sideLength, 0, 0 );
    make3dLine ( part, 'violet', -sideLength, 0, 0, 0, -sideLength, 0 );
    make3dLine ( part, 'violet', 0, -sideLength, 0, sideLength, 0, 0 );
    if ( selectedType === 'cubes' ) {
      if ( number % 2 === 0 ) {
        //addBall ( part, color, 0, cosRadius, sinRadius );
        make3dLine ( part, 'violet', 0, sideLength, 0, 0, 0, sideLength );
        make3dLine ( part, 'violet', 0, 0, sideLength, 0, -sideLength, 0 );
        make3dLine ( part, 'violet', 0, -sideLength, 0, 0, 0, -sideLength );
        make3dLine ( part, 'violet', 0, 0, -sideLength, 0, sideLength, 0 );
          } 
      else {
        //addBall ( part, color, cosRadius, 0, sinRadius );
        make3dLine ( part, 'violet', sideLength, 0, 0, 0, 0, sideLength );
        make3dLine ( part, 'violet', 0, 0, sideLength, -sideLength, 0, 0 );
        make3dLine ( part, 'violet', -sideLength, 0, 0, 0, 0, -sideLength );
        make3dLine ( part, 'violet', 0, 0, -sideLength, sideLength, 0, 0 );
      }
    }

    // draw the connection piece
    smallerSideLength = sideLength - blockSize / numberOfParts;
    if ( number % 2 === 0 ) {
      make3dLine ( part, 'green', 0, smallerSideLength, 0, 0, sideLength, 0 )
      make3dLine ( part, 'green', 0, -smallerSideLength, 0, 0, -sideLength, 0 )
    }
    else {
      make3dLine ( part, 'green', smallerSideLength, 0, 0, sideLength, 0, 0 )
      make3dLine ( part, 'green', -smallerSideLength, 0, 0, -sideLength, 0, 0 )
    }
  }

  function make3dLine ( part, color, x1, y1, z1, x2, y2, z2 ) {
    let deltaX = x2 - x1;
    let deltaY = y2 - y1;
    let deltaZ = z2 - z1;
    const lineLength = Math.sqrt ( deltaX * deltaX + deltaY * deltaY + deltaZ * deltaZ );
    const numberOfPoints = lineLength / 5;
    deltaX /= numberOfPoints;
    deltaY /= numberOfPoints;
    deltaZ /= numberOfPoints;
  
    let deltaDegree = 360 / numberOfPoints; // rainbow
    if ( selectedTheme === 'fire' ) deltaDegree /= 8;
    for ( let point = -1, degree = 0; point < numberOfPoints - 1; point++, degree += deltaDegree ) {
      color = 'hsla(' + Math.floor ( degree ) + ',100%,50%,0.6)';
      addBall ( part, color, x1, y1, z1 );
      x1 += deltaX;
      y1 += deltaY;
      z1 += deltaZ;
    }
  }

  createContainingBox ( );

  // count the balls
  totalBalls = outerBlock.length;
  for( let i = 0; i < parts.length; i++ ) {
    totalBalls += parts[ i ].balls.length;
  }
}

// create the containing box
function createContainingBox ( ) {
  outerBlock = [ ];
  if ( !$( '#showBox' ).prop ( 'checked' ) ) return;

  for ( let step = -1; step <= 1; step += 0.2 ) {
    var sizeStep = blockSize*step;
    addBall ( outerBlock, 'rgba(140,140,140,0.7)',  blockSize,  blockSize, sizeStep );
    addBall ( outerBlock, 'rgba(140,140,140,0.7)',  blockSize, -blockSize, sizeStep );
    addBall ( outerBlock, 'rgba(140,140,140,0.7)', -blockSize,  blockSize, sizeStep );
    addBall ( outerBlock, 'rgba(140,140,140,0.7)', -blockSize, -blockSize, sizeStep );
    addBall ( outerBlock, 'rgba(140,140,140,0.7)', sizeStep,  blockSize, blockSize );
    addBall ( outerBlock, 'rgba(140,140,140,0.7)', sizeStep, -blockSize, blockSize );
    addBall ( outerBlock, 'rgba(140,140,140,0.7)', sizeStep,  blockSize, -blockSize );
    addBall ( outerBlock, 'rgba(140,140,140,0.7)', sizeStep, -blockSize, -blockSize );
    addBall ( outerBlock, 'rgba(140,140,140,0.7)', blockSize,  sizeStep, blockSize );
    addBall ( outerBlock, 'rgba(140,140,140,0.7)', -blockSize, sizeStep, blockSize );
    addBall ( outerBlock, 'rgba(140,140,140,0.7)', blockSize, sizeStep, -blockSize );
    addBall ( outerBlock, 'rgba(140,140,140,0.7)', -blockSize, sizeStep, -blockSize );
  }
}

// add another ball
function addBall ( part, color, x, y, z ) {
  part.push ( { 
      x: x, 
      y: y, 
      z: z, 
      color: color } 
  );
}

// initialize the rotation factors
var Axx, Axy, Axz;
var Ayx, Ayy, Ayz;
var Azx, Azy, Azz;
function initRotate3d ( pitch, roll, yaw ) { 
  const cosPitch = Math.cos ( pitch );  // pitch: y
  const sinPitch = Math.sin ( pitch );
  const cosRoll = Math.cos ( roll );  // roll: x
  const sinRoll = Math.sin ( roll );
  const cosYaw = Math.cos ( yaw );  // yaw: z
  const sinYaw = Math.sin ( yaw );

  Axx = cosYaw * cosPitch;
  Axy = cosYaw * sinPitch * sinRoll - sinYaw * cosRoll;
  Axz = cosYaw * sinPitch * cosRoll + sinYaw * sinRoll;

  Ayx = sinYaw * cosPitch;
  Ayy = sinYaw * sinPitch * sinRoll + cosYaw * cosRoll;
  Ayz = sinYaw * sinPitch * cosRoll - cosYaw * sinRoll;

  Azx = -sinPitch;
  Azy = cosPitch * sinRoll;
  Azz = cosPitch * cosRoll;
}

// do the actual rotation
function doRotate3d ( ball ) { // pitch: x, roll: y, yaw: z
  return {
      x: Axx * ball.x + Axy * ball.y + Axz * ball.z,
      y: Ayx * ball.x + Ayy * ball.y + Ayz * ball.z,
      z: Azx * ball.x + Azy * ball.y + Azz * ball.z
  };
}

// initialize the yaw factors
function initYaw ( yaw ) { 
  const cosYaw = Math.cos ( yaw );  // yaw: z
  const sinYaw = Math.sin ( yaw );

  Axx = cosYaw;
  Axy = -sinYaw;

  Ayx = sinYaw;
  Ayy = cosYaw;
}

// do the actual yawing
function doYaw ( ball ) { // pitch: x, roll: y, yaw: z
  return {
      x: Axx * ball.x + Axy * ball.y,
      y: Ayx * ball.x + Ayy * ball.y,
      z: ball.z
  };
}

// initialize the pitch roll factors
function initPitchRoll ( pitch, roll ) { 
  const cosPitch = Math.cos ( pitch );  // pitch: y
  const sinPitch = Math.sin ( pitch );
  const cosRoll = Math.cos ( roll );  // roll: x
  const sinRoll = Math.sin ( roll );

  Axx = cosPitch;
  Axy = sinPitch * sinRoll;
  Axz = sinPitch * cosRoll;

  Ayy = cosRoll;
  Ayz = -sinRoll;

  Azx = -sinPitch;
  Azy = cosPitch * sinRoll;
  Azz = cosPitch * cosRoll;
}

// do the actual pitching and rolling
function doPitchRoll ( ball ) { // pitch: x, roll: y, yaw: z
  return {
      x: Axx * ball.x + Axy * ball.y + Axz * ball.z,
      y: Ayy * ball.y + Ayz * ball.z,
      z: Azx * ball.x + Azy * ball.y + Azz * ball.z
  };
}



let request;
function animate ( ) {
  request = window.requestAnimationFrame ( animate );
  ctx.fillStyle = 'rgba(0,0,0,' + $( '#fadeFactor' ).prop ( 'value' ) + ')';
  ctx.fillRect ( 0, 0, width, height );

  // rotate the whole thing or not
  updateViewAngle ( rotationSpeedX, rotationSpeedY );

  // draw the axis
  if ( $( '#showAxis' ).prop( 'checked' ) ) {
    projectLine ( 'X', 0, 0, 0, blockSize, 0, 0, 'red' );
    projectLine ( 'Y', 0, 0, 0, 0, blockSize, 0, 'green' );
    projectLine ( 'Z', 0, 0, 0, 0, 0, blockSize, 'blue' );
  }

  drawIt ( );
  showInfo ( );

  // draw a single part
  function drawIt ( ) {
    // containing box
    drawPart ( outerBlock );
    
    // parts
    let rotationStream = [ ];
    const numberOfParts = parts.length;
    for ( let i = 0; i < numberOfParts; i++ ) {
      addToRotationStream ( rotationStream, parts[ i ].balls );
      // rotate the part for the shifted angles
      parts[ i ].pitch += parts[ i ].deltaPitch;
      parts[ i ].roll += parts[ i ].deltaRoll;
      parts[ i ].yaw += parts[ i ].deltaYaw;
      initYaw ( parts[ i ].yaw );
      yawPart ( rotationStream );
      initPitchRoll ( parts[ i ].roll, parts[ i ].pitch );
      pitchRollPart ( rotationStream );
    }
    drawPart ( rotationStream );
  }
  
  function addToRotationStream( rotationStream, part ) {
    const partLength = part.length;
    for ( let i = 0; i < partLength; i++ ) {
      rotationStream.push ( { 
          x: part[ i ].x, 
          y: part[ i ].y, 
          z: part[ i ].z, 
          color: part[ i ].color } );
    }
  }

  // rotate a part
  function rotatePart ( part ) {
    const partLength = part.length;
    for ( let i = 0; i < partLength; i++ ) {
      const ball = doRotate3d( part[ i ] );
      part[ i ].x = ball.x;
      part[ i ].y = ball.y;
      part[ i ].z = ball.z;
    }
  }

  // rotate a part
  function yawPart ( part ) {
    const partLength = part.length;
    for ( let i = 0; i < partLength; i++ ) {
      const ball = doYaw( part[ i ] );
      part[ i ].x = ball.x;
      part[ i ].y = ball.y;
      part[ i ].z = ball.z;
    }
  }

  // rotate a part
  function pitchRollPart ( part ) {
    const partLength = part.length;
    for ( let i = 0; i < partLength; i++ ) {
      const ball = doPitchRoll( part[ i ] );
      part[ i ].x = ball.x;
      part[ i ].y = ball.y;
      part[ i ].z = ball.z;
    }
  }

  // draw a part
  function drawPart ( part ) {
    const partLength = part.length;
    for ( let i = 0; i < partLength; i++ ) {
      drawBall( part[ i ].x, part[ i ].y, part[ i ].z, part[ i ].color );
    }
  }

  // draw a single ball
  function drawBall ( x, y, z, color ) {
    const p2D = project ( x, y, z );
    ctx.beginPath ( );
    ctx.fillStyle = color;
    ctx.fillRect ( p2D.x, p2D.y, ballSize, ballSize );
  }
  
  // project a simple grid line
  function projectLine ( text, x0, y0, z0, x1, y1, z1, color ) {
    const p0 = project ( x0, y0, z0 );
    const p1 = project ( x1, y1, z1 );
    drawLine ( text, p0, p1, color );
  }

  // draw a simple line (axis)
  function drawLine ( text, pa2d, pb2d, color ) {
    ctx.globalAlpha = 0.3;
    ctx.lineWidth = 2;
    ctx.strokeStyle = color;
    ctx.beginPath ( );
    ctx.moveTo ( pa2d.x, pa2d.y );
    ctx.lineTo ( pb2d.x, pb2d.y );
    ctx.stroke ( );
    ctx.font = "20px Arial";
    ctx.fillStyle = color;
    ctx.textAlign = "center";
    ctx.fillText ( text, pb2d.x, pb2d.y );
  }
  
  // put it in perspective
  function project( x, y, z ) {
    const x2 = x * cosAlpha - y * sinAlpha;
    const y2 = ( x * sinAlpha + y * cosAlpha ) * sinBeta - z * cosBeta;
    return {
      x: halfWidth + x2,
      y: halfHeight - y2
    };
  }
}

// restart the stuff
function resize ( ) {
  window.cancelAnimationFrame ( request );
  init ( );
}

// sliding motion
function startSlide ( x, y ) {
  startSlideX = x;
  startSlideY = y;
}

// slide it
function slideView ( x, y ) {
  const deltaX = x - startSlideX;
  startSlideX = x;
  const deltaY = y - startSlideY;
  startSlideY = y;
  updateViewAngle ( deltaX, deltaY );
  rotationSpeedX += deltaX / 5;
  rotationSpeedY += deltaY / 5;
}

// change view angle
function updateViewAngle ( deltaX, deltaY ) {
  alpha += deltaX / 800;
  beta += deltaY / 800;
  cosAlpha = Math.cos ( alpha );
  sinAlpha = Math.sin ( alpha );
  sinBeta = Math.sin ( beta );
  cosBeta = Math.cos ( beta );
}

// document is loaded get the codes and set the call back
$( document ).ready ( function ( ) {
    createParts ( );
    setTimeout ( function( ) { 
      $( '.menuButton' ).click ( function ( ) {
        $( this ).toggleClass( 'show' );
        $( '.menuSections' ).toggleClass ( 'show' );
      });
      $( '.helpButton' ).click ( function ( ) {
        $( '.helpSections' ).toggleClass ( 'show' );
      });
      $( '.infoButton' ).click ( function ( ) {
        $( '.infoSections' ).toggleClass ( 'show' );
      });
      $( '.resetButton' ).click ( function ( ) {
        rotationSpeedX = 0;
        rotationSpeedY = 0;
        setRotationSpeed ( 'stop' ); // for the actual parts
      });
    }, 600 );
});