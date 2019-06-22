//"use strict";
// Created by Modi

// sliding motion, based on screen coordinates
var alpha = Math.PI/5+Math.PI; // X rotation
var cosAlpha, sinAlpha;
var rotationSpeedX = 0;
var startSlideX;

var beta = Math.PI/18; // Y rotation
var sinBeta, cosBeta;
var rotationSpeedY = 0;
var startSlideY;

var mouseIsDown = false;

// rings template and settings
var outerBlock = [];
var rings = [];

var blockSize;
var ballSize = 2.0;

// store the coordinates of each touch
var touchInfo = "";
function storeTouches( event ) {
  touchInfo = "";
  for (let i = 0; i < event.touches.length; i++) {
    touchInfo += 
      '<p>Touch ' + i + 
      ' X -> ' + Math.round( event.touches[i].pageX ) +
      ' Y -> ' + Math.round( event.touches[i].pageY ) + '</p>';
  }
}

// calculate the frame rate per second
// the higher filterStrength, the less the fps will reflect temporary variations
// a value of 1 will only keep the last value
var filterStrength = 60;
var frameTime = 0, lastLoop = new Date(), thisLoop;
function getFrameRate ( ) {
  const thisFrameTime = ( thisLoop = new Date() ) - lastLoop;
  frameTime += ( thisFrameTime - frameTime ) / filterStrength;
  lastLoop = thisLoop;
  return 1000 / frameTime;
}

// show the Info menu
var infoCount = 0;
function showInfo ( ) {
  if ( (infoCount++)%3 !== 0 ) return;
  const frameRate = getFrameRate( )*3;  // has to be calculated every frame
  $( '#info' ).html( 
    '<p>Frame Rate: ' + frameRate.toFixed( 1 ) + '</p>' +
    '<p>Balls: ' + totalBalls + '</p>' +
    '<p>Rotation X: ' + rotationSpeedX.toFixed( 3 ) + '</p>' +
    '<p>Rotation Y: ' + rotationSpeedY.toFixed( 3 ) + '</p>' +
    touchInfo );
}

// view and touch/mouse handling
var width, halfWidth;
var height, halfHeight;
var ctx;
function initViewAndTouch( ) {
  width = window.innerWidth;
  height = window.innerHeight;
  halfWidth = width / 2;
  halfHeight = height / 2;
  blockSize = Math.min( halfWidth, halfHeight )*0.8;

  var canvas = $( 'canvas' )[0];
  canvas.width = width;
  canvas.height = height;
  ctx = canvas.getContext( '2d' );

  // handle the touch stuff
  canvas.ontouchstart = function( event ) {
    event.preventDefault();
    storeTouches( event );

    if( event.touches.length == 1 ) {
      startSlide( event.touches[0].pageX, event.touches[0].pageY );
    }
  };
  canvas.ontouchmove = function( event ) {
    event.preventDefault();
    storeTouches( event );

    if(event.touches.length==1) {
     slideView( event.touches[0].pageX, event.touches[0].pageY );   
    }
  };
  canvas.ontouchend = function( event ) {
    touchInfo = "";
  };

  // handle the mouse drag stuff
  canvas.onmousedown = function( event ) {
    event.preventDefault();
    startSlide( event.pageX, event.pageY );
    mouseIsDown = true;
  };
  canvas.onmouseleave = canvas.onmouseup = function( event ) {
    mouseIsDown = false;
  };
  canvas.onmousemove = function( event ) {
    event.preventDefault();
    if ( mouseIsDown ) {
        slideView( event.pageX, event.pageY );
    }
  };

  // handle the click stuff
  canvas.onclick = function(event) {
    event.preventDefault();
    mouseIsDown = false;
  };
  
   // handle the click stuff
  canvas.ondblclick = function( event ) {
    rotationSpeedX = 0;
    rotationSpeedY = 0;
  };
}

// something changed in the settings initialize everything
function init( ) {
  initViewAndTouch();
  
  ballSize = $('#ballSize').prop('value');
    
  createRings( );
  animate( );
}

// rotation factors
var Axx, Axy, Axz;
var Ayx, Ayy, Ayz;
var Azx, Azy, Azz;

// initialize the rotation factors
function initRotate3d( pitch, roll, yaw ) { 
  const cosPitch = Math.cos( pitch );  // pitch: x
  const sinPitch = Math.sin( pitch );
  const cosRoll = Math.cos( roll );  // roll: y
  const sinRoll = Math.sin( roll );
  const cosYaw = Math.cos( yaw );  // yaw: z
  const sinYaw = Math.sin( yaw );

  Axx = cosYaw*cosPitch;
  Axy = cosYaw*sinPitch*sinRoll - sinYaw*cosRoll;
  Axz = cosYaw*sinPitch*cosRoll + sinYaw*sinRoll;

  Ayx = sinYaw*cosPitch;
  Ayy = sinYaw*sinPitch*sinRoll + cosYaw*cosRoll;
  Ayz = sinYaw*sinPitch*cosRoll - cosYaw*sinRoll;

  Azx = -sinPitch;
  Azy = cosPitch*sinRoll;
  Azz = cosPitch*cosRoll;
}

// do the actual rotation
function doRotate3d( ball ) { // pitch: x, roll: y, yaw: z
  return {
      x: Axx*ball.x + Axy*ball.y + Axz*ball.z,
      y: Ayx*ball.x + Ayy*ball.y + Ayz*ball.z,
      z: Azx*ball.x + Azy*ball.y + Azz*ball.z
  };
}

const maximum = 5;
function createRings( ) {
  let selectedTheme = $("input[name='themeSelection']:checked").val();
  let rotationSpeed = +$('#rotationSpeed').prop('value');

  // rings
  rings = [];  // reset the parts
  for ( let step = maximum; step > 0; step -= 1) {
    let singleRing = {
        ['pitch']:0, ['deltaPitch']:0,
        ['roll']:0, ['deltaRoll']:0,
        ['yaw']:0, ['deltaYaw']:0
    }; 
    if ( step === maximum ) ; // don;t rotate the outer ring
    else if ( step%2 === 0 ) singleRing.deltaRoll = rotationSpeed;
    else singleRing.deltaPitch = rotationSpeed;

    let balls = [];
    makeRing( step, balls, 0, 0, 0, blockSize*step/maximum );
    singleRing['balls'] = balls;
    rings.push( singleRing );
  }

  // create a horizontal circle
  function makeRing( number, part, x, y, z, radius ) {
    const step = Math.PI * 2 / radius;
    const maxAngle = $('#showPartially').prop('value');

    // draw the actual circle
    for ( let angle = 0; angle < maxAngle; angle += step ) {
      let color = 'white';
      if ( selectedTheme == 'rainbow' ) {
        const degree = angle * 360 / 2 / Math.PI;
        color = 'hsla( ' + degree + ',100% ,50%, 0.6 )';
      }
      else if ( selectedTheme == 'fire' ) {
        let degree = angle * 360 / 8 / Math.PI;
        if ( angle > Math.PI ) degree = 360/4 - degree;
        color = 'hsla( ' + degree + ',100% ,50%, 0.6 )';
      }
      addBall( part, x + radius*Math.cos( angle ), y + radius*Math.sin( angle ), z, color );
    }

    // draw the connection piece
    for ( let connection = radius-blockSize/maximum; connection < radius; connection += 5 ) {
      if ( number%2 === 0 ) {
        addBall( part, x, y + connection, z, 'blue' );
        addBall( part, x, y - connection, z, 'blue' );
      }
      else {
        addBall( part, x + connection, y, z, 'blue' );
        addBall( part, x - connection, y, z, 'blue' );
      }
    }
  }

  createContainingBox( );

  // count the balls
  totalBalls = outerBlock.length;
  for( let i = 0; i < rings.length; i++) {
    totalBalls += rings[i].balls.length;
  }
}

// create the containing box
function createContainingBox( ) {
  outerBlock = [];
  if ( $('#showBox').prop('checked') ) return;

  for ( let step = -1; step <= 1; step += 0.2) {
    addBall( outerBlock,  blockSize,  blockSize, blockSize*step, 'rgba(140,140,140,0.7)' );
    addBall( outerBlock,  blockSize, -blockSize, blockSize*step, 'rgba(140,140,140,0.7)' );
    addBall( outerBlock, -blockSize,  blockSize, blockSize*step, 'rgba(140,140,140,0.7)' );
    addBall( outerBlock, -blockSize, -blockSize, blockSize*step, 'rgba(140,140,140,0.7)' );
    addBall( outerBlock, blockSize*step,  blockSize, blockSize, 'rgba(140,140,140,0.7)' );
    addBall( outerBlock, blockSize*step, -blockSize, blockSize, 'rgba(140,140,140,0.7)' );
    addBall( outerBlock, blockSize*step,  blockSize, -blockSize, 'rgba(140,140,140,0.7)' );
    addBall( outerBlock, blockSize*step, -blockSize, -blockSize, 'rgba(140,140,140,0.7)' );
    addBall( outerBlock, blockSize,  blockSize*step, blockSize, 'rgba(140,140,140,0.7)' );
    addBall( outerBlock, -blockSize, blockSize*step, blockSize, 'rgba(140,140,140,0.7)' );
    addBall( outerBlock, blockSize, blockSize*step, -blockSize, 'rgba(140,140,140,0.7)' );
    addBall( outerBlock, -blockSize, blockSize*step, -blockSize, 'rgba(140,140,140,0.7)' );
  }
}

// add another ball
function addBall( part, x, y, z, color ) {
  part.push( { x: x, y: y, z: z, c: color } );
}

let deltaPitch = 0;
let deltaRoll = 0;

let request;
function animate( ) {
  request = window.requestAnimationFrame( animate );
  ctx.fillStyle = 'rgba( 0, 0, 0,' + $('#fadeFactor').prop('value') + ')';
  ctx.fillRect( 0, 0, width, height );

  // rotate the whole thing or not
  updateViewAngle( rotationSpeedX, rotationSpeedY );

  // draw the axis
  if ( $('#showAxis').prop('checked') ) {
    projectLine ( 'X', 0, 0, 0, blockSize, 0, 0, 'red' );
    projectLine ( 'Y', 0, 0, 0, 0, blockSize, 0, 'green' );
    projectLine ( 'Z', 0, 0, 0, 0, 0, blockSize, 'blue' );
  }

  // offset X, Y, Z and delta Pitch, Roll, Yaw
  drawIt ( 0, 0, 0, 0, 0, 0 );

  showInfo();

  // draw a single rings
  // offset X, Y, Z and delta Pitch, Roll, Yaw
  function drawIt ( oX, oY, oZ, dP, dR, dY ) {
    // containing box
    drawPart( outerBlock, oX, oY, 0 );
    
    // rings
    let shiftedPitch = 0;
    let shiftedRoll = 0;
    let shiftedYaw = 0;
    for( let i = 0; i < rings.length; i++) {
      // get the shifted angles for this round
      if ( i < maximum ) {
        shiftedPitch += rings[i].deltaPitch; 
        shiftedRoll -= rings[i].deltaRoll; 
        shiftedYaw += rings[i].deltaYaw;
      }
      // rotate the ring for the shifted angles
      rings[i].pitch += shiftedPitch;
      rings[i].roll += shiftedRoll;
      rings[i].yaw += shiftedYaw;
      initRotate3d ( rings[i].pitch, rings[i].roll, 0 );
      rotateDrawPart ( rings[i].balls, oX, oY, oZ );
    }
  }
  
  // rotate a part
  function rotateDrawPart ( part, oX, oY, oZ ) {
    for( let i = 0; i < part.length; i++) {
      const ball = doRotate3d( part[i] );
      drawBall ( ball.x + oX, ball.y + oY, ball.z + oZ, part[i].c );
    }
  }

  // draw a part
  function drawPart ( part, oX, oY, oZ ) {
    for( let i = 0; i < part.length; i++) {
      drawBall ( part[i].x + oX, part[i].y + oY, part[i].z + oZ, part[i].c );
    }
  }

  // draw a single ball
  function drawBall( x, y, z, color ) {
    const p2D = project( x, y, z );
    ctx.beginPath( );
    ctx.fillStyle = color;
    ctx.fillRect( p2D.x, p2D.y, ballSize, ballSize );
  }
  
  // project a simple grid line
  function projectLine( text, x0, y0, z0, x1, y1, z1, color ) {
    const p0 = project( x0, y0, z0 );
    const p1 = project( x1, y1, z1 );
    drawLine( text, p0, p1, color );
  }

  // draw a simple line (axis)
  function drawLine( text, pa2d, pb2d, color ) {
    ctx.globalAlpha = 0.3;
    ctx.lineWidth = 2;
    ctx.strokeStyle = color;
    ctx.beginPath( );
    ctx.moveTo( pa2d.x, pa2d.y );
    ctx.lineTo( pb2d.x, pb2d.y );
    ctx.stroke( );
    ctx.font = "20px Arial";
    ctx.fillStyle = color;
    ctx.textAlign = "center";
    ctx.fillText( text, pb2d.x, pb2d.y );
  }
  
  // put it in perspective
  function project( x, y, z ) {
    const x2 = x*cosAlpha - y*sinAlpha;
    const y2 = ( x*sinAlpha + y*cosAlpha )*sinBeta - z*cosBeta;
    return {
      x: halfWidth + x2,
      y: halfHeight - y2
    };
  }
}

// restart the stuff
function resize( ) {
  window.cancelAnimationFrame( request );
  init( );
}

// sliding motion
function startSlide( x, y ) {
  startSlideX = x;
  startSlideY = y;
}

// slide it
function slideView( x, y ) {
  const deltaX = x - startSlideX;
  startSlideX = x;
  const deltaY = y - startSlideY;
  startSlideY = y;
  updateViewAngle( deltaX, deltaY );
  rotationSpeedX += deltaX / 5;
  rotationSpeedY += deltaY / 5;
}

// change view angle
function updateViewAngle( deltaX, deltaY ) {
  alpha += deltaX / 800;
  beta += deltaY / 800;
  cosAlpha = Math.cos( alpha );
  sinAlpha = Math.sin( alpha );
  sinBeta = Math.sin( beta );
  cosBeta = Math.cos( beta );
}

// document is loaded get the codes and set the call back
$( document ).ready( function( ) {
    createRings( );
    setTimeout( function( ) { 
      $( '.menuButton' ).click( function( ) {
        $( this ).toggleClass( 'show' );
        $( '.menuSections' ).toggleClass( 'show' );
      });
      $( '.helpButton' ).click( function( ) {
        $( '.helpSections' ).toggleClass( 'show' );
      });
      $( '.infoButton' ).click( function( ) {
        $( '.infoSections' ).toggleClass( 'show' );
      });
      $( '.resetButton' ).click( function( ) {
        rotationSpeedX = 0;
        rotationSpeedY = 0;
      });
    }, 600 );
});