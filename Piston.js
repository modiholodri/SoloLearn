// Created by Modi

// sliding motion, based on screen coordinates
var viewRotation = 0.01;  // rotation acceleration

var alpha = Math.PI/5+Math.PI; // X rotation
var cosAlpha, sinAlpha;
var rotationSpeedX = 0;
var startSlideX;

var beta = Math.PI/18; // Y rotation
var sinBeta, cosBeta;
var rotationSpeedY = 0;
var startSlideY;

var mouseIsDown = false;

// engine template and settings
var engineBlock = [];
var piston = [];
var crankShaft = [];
var pistonRod = [];

var rodFactor = 0.7;
var engineSize;
var ballSize = 2.0;
var rotationSpeedEngine = 0;

// store the coordinates of each touch
var touchInfo = ""
function storeTouches( event ) {
  touchInfo = ""
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
  const totalBalls = ( engineBlock.length + piston.length + pistonRod.length + crankShaft.length ) * 3;
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
  engineSize = Math.min( halfWidth, halfHeight );

  var canvas = $( 'canvas' )[0];
  canvas.width = width;
  canvas.height = height;
  ctx = canvas.getContext( '2d' );

  viewRotation = $('#viewRotation').prop('value');

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
  }
}

// something changed in the settings initialize everything
function init( ) {
  initViewAndTouch();
  
  ballSize = $('#ballSize').prop('value');
    
  createEngine( );
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
  }
}

function createEngine( ) {
  let selectedEngine = $("input[name='engineSelection']:checked").val();
  if ( selectedEngine == 'fire' ) createFireEngine( );
  if ( selectedEngine == 'rainbow' ) createRainbowEngine( );
}

// create the engine block
function createEngineBlock( ) {
  engineBlock = [];
  if ( $('#showEngineBlock').prop('checked') ) {
    var blockWidth = engineSize/4;
    var blockHeight = engineSize*0.8;
    for ( let step = -1; step <= 1; step += 0.2) {
      addBall( engineBlock,  blockWidth,  blockWidth, blockHeight*step, 'rgba(40,40,40,0.7)' );
      addBall( engineBlock,  blockWidth, -blockWidth, blockHeight*step, 'rgba(40,40,40,0.7)' );
      addBall( engineBlock, -blockWidth,  blockWidth, blockHeight*step, 'rgba(40,40,40,0.7)' );
      addBall( engineBlock, -blockWidth, -blockWidth, blockHeight*step, 'rgba(40,40,40,0.7)' );
    }
    for ( let step = -1; step <= 1; step += 0.2) {
      addBall( engineBlock, blockWidth*step,  blockWidth, blockHeight, 'rgba(40,40,40,0.7)' );
      addBall( engineBlock, blockWidth*step, -blockWidth, blockHeight, 'rgba(40,40,40,0.7)' );
      addBall( engineBlock, blockWidth*step,  blockWidth, -blockHeight, 'rgba(40,40,40,0.7)' );
      addBall( engineBlock, blockWidth*step, -blockWidth, -blockHeight, 'rgba(40,40,40,0.7)' );
    }
    for ( let step = -1; step <= 1; step += 0.2) {
      addBall( engineBlock, blockWidth,  blockWidth*step, blockHeight, 'rgba(40,40,40,0.7)' );
      addBall( engineBlock, -blockWidth, blockWidth*step, blockHeight, 'rgba(40,40,40,0.7)' );
      addBall( engineBlock, blockWidth, blockWidth*step, -blockHeight, 'rgba(40,40,40,0.7)' );
      addBall( engineBlock, -blockWidth, blockWidth*step, -blockHeight, 'rgba(40,40,40,0.7)' );
    }
  }
}

function createRainbowEngine( ) {
  createEngineBlock( );

  // piston
  piston = [];  // reset the parts
  if ( $('#showPiston').prop('checked') ) {
    for ( let step = -0.1; step < 0.4; step += 0.1) {
      makeHorizontalCircle( piston, 0, 0, -engineSize*step, engineSize/4, 'green' );
    }
  }

  // piston rod
  pistonRod = [];
  if ( $('#showRod').prop('checked') ) {
    for ( let step = 0.1; step < rodFactor; step += 0.1) {
      makeHorizontalCircle( pistonRod, 0, 0, engineSize*step, engineSize/12, 'slateGrey' );
    }
    for ( let step = -0.1; step < 0.11; step += 0.05) {
      makeVerticalCircle( pistonRod, engineSize*step, 0, 0, engineSize/12, 'slateGrey' );
      makeVerticalCircle( pistonRod, engineSize*step, 0, rodFactor*engineSize, engineSize/12, 'slateGrey' );
    }
  }
  
  // crank shaft
  crankShaft = [];
  if ( $('#showShaft').prop('checked') ) {
    for ( let step = 0.1; step < 0.3; step += 0.1) {
      makeVerticalCircle( crankShaft, engineSize*step, 0, 0, engineSize/3, 'slateGrey' );
      makeVerticalCircle( crankShaft, -engineSize*step, 0, 0, engineSize/3, 'slateGrey' );
    }
    for ( let step = 0.2; step < 0.3; step += 0.05) {
      makeVerticalCircle( crankShaft, engineSize*step, 0, 0, engineSize/16, 'navy' );
      makeVerticalCircle( crankShaft, -engineSize*step, 0, 0, engineSize/16, 'navy' );
    }
  }

  // create a horizontal circle
  function makeHorizontalCircle( part, x, y, z, radius, color ) {
    const step = 5 / radius;
    const maxAngle = $('#showPartially').prop('value');

    for ( let angle = 0; angle < maxAngle; angle += step ) {
      const degree = angle * 360 / 2 / Math.PI;
      color = 'hsla( ' + degree + ',100% ,50%, 0.6 )';
      addBall( part, x + radius*Math.cos( angle ), y + radius*Math.sin( angle ), z, color );
    }
  }

  // create a horizontal circle
  function makeVerticalCircle( part, x, y, z, radius, color ) { 
    const step = 5 / radius;
    const maxAngle = $('#showPartially').prop('value');

    for ( let angle = 0; angle < maxAngle; angle += step ) {
      if ( radius > engineSize / 14 ) { // gradient only for big ones
        let degree = angle * 360 / 2 / Math.PI;
        color = 'hsla( ' + degree + ',100% ,50%, 0.6 )';
      }
      addBall( part, x, y + radius*Math.cos( angle ), z + radius*Math.sin( angle ), color );
    }
  }
}

// create a fire engine
function createFireEngine( ) {
  createEngineBlock( );

  // piston
  piston = [];  // reset the parts
  if ( $('#showPiston').prop('checked') ) {
    for ( let step = -0.1; step < 0.4; step += 0.1) {
      makeHorizontalCircle( piston, 0, 0, -engineSize*step, engineSize/4, 'green' );
    }
  }

  // piston rod
  pistonRod = [];
  if ( $('#showRod').prop('checked') ) {
    for ( let step = 0.1; step < rodFactor; step += 0.1) {
      makeHorizontalCircle( pistonRod, 0, 0, engineSize*step, engineSize/12, 'slateGrey' );
    }
    for ( let step = -0.1; step < 0.11; step += 0.05) {
      makeVerticalCircle( pistonRod, engineSize*step, 0, 0, engineSize/12, 'slateGrey' );
      makeVerticalCircle( pistonRod, engineSize*step, 0, rodFactor*engineSize, engineSize/12, 'slateGrey' );
    }
  }
  
  // crank shaft
  crankShaft = [];
  if ( $('#showShaft').prop('checked') ) {
    for ( let step = 0.1; step < 0.3; step += 0.1) {
      makeCounterWeight( crankShaft, engineSize*step, 0, 0, engineSize/3, 'slateGrey' );
      makeCounterWeight( crankShaft, -engineSize*step, 0, 0, engineSize/3, 'slateGrey' );
    }
    for ( let step = 0.2; step < 0.3; step += 0.05) {
      makeVerticalCircle( crankShaft, engineSize*step, 0, 0, engineSize/16, 'rgba(40,40,40,0.7)' );
      makeVerticalCircle( crankShaft, -engineSize*step, 0, 0, engineSize/16, 'rgba(40,40,40,0.7)' );
    }
  }

  // create a horizontal circle
  function makeHorizontalCircle( part, x, y, z, radius, color ) {
    const step = 5 / radius;
    const maxAngle = $('#showPartially').prop('value');

    for ( let angle = 0; angle < maxAngle; angle += step ) {
      let degree = angle * 360 / 8 / Math.PI;
      if ( angle > Math.PI ) degree = 360/4 - degree;
      color = 'hsla( ' + degree + ',100% ,50%, 0.6 )';
      addBall( part, x + radius*Math.cos( angle ), y + radius*Math.sin( angle ), z, color );
    }
  }

  // create a horizontal circle
  function makeVerticalCircle( part, x, y, z, radius, color ) { 
    const step = 5 / radius;
    const maxAngle = $('#showPartially').prop('value');

    for ( let angle = 0; angle < maxAngle; angle += step ) {
      if ( radius > engineSize / 14 ) { // gradient only for big ones
        let degree = angle * 360 / 8 / Math.PI;
        if ( angle > Math.PI ) degree = 360/4 - degree;
        color = 'hsla( ' + degree + ',100% ,50%, 0.6 )';
      }
      addBall( part, x, y + radius*Math.cos( angle ), z + radius*Math.sin( angle ), color );
    }
  }

  // create a horizontal circle
  function makeCounterWeight( part, x, y, z, radius, color ) { 
    const step = 5 / radius;
    const maxAngle = $('#showPartially').prop('value');

    for ( let angle = 0; angle < maxAngle; angle += step ) {
      if ( radius > engineSize / 14 ) { // gradient only for big ones
        let degree = angle * 360 / 8 / Math.PI;
        if ( angle > Math.PI ) degree = 360/4 - degree;
        color = 'hsla( ' + degree + ',100% ,50%, 0.6 )';
      }
      let pointZ = radius*Math.sin( angle );
      let pointY = radius*Math.cos( angle );
      if ( pointZ > 0 ) {
        if ( pointY > 0 ) addBall( part, x, y + (radius-pointZ), z + (radius-pointY), color );
        else addBall( part, x, y + (-radius+pointZ), z + (radius + pointY), color );
      }
      else addBall( part, x, y + pointY, z + pointZ, color );
    }
  }
}


// add another ball
function addBall( part, x, y, z, color ) {
  part.push( { x: x, y: y, z: z, c: color } );
}

var request;
function animate( ) {
  request = window.requestAnimationFrame( animate );
  ctx.fillStyle = 'rgba( 0, 0, 0,' + $('#fadeFactor').prop('value') + ')';
  ctx.fillRect( 0, 0, width, height );

  // rotate the whole thing or not
  updateViewAngle( rotationSpeedX, rotationSpeedY );

  // draw the axis
  if ( $('#showAxis').prop('checked') ) {
    projectLine ( 'X', 0, 0, 0, engineSize, 0, 0, 'red' );
    projectLine ( 'Y', 0, 0, 0, 0, engineSize, 0, 'green' );
    projectLine ( 'Z', 0, 0, 0, 0, 0, engineSize, 'blue' );
  }

  rotationSpeedEngine += +$('#engineSpeed').prop('value');

  // offset X, Y, Z and delta Pitch, Roll, Yaw
  const phaseShift = 2 * Math.PI / 3; 
  drawPiston ( -engineSize*0.55, 0, engineSize*0.5, 0, -phaseShift, 0 );
  drawPiston ( 0, 0, engineSize*0.5, 0, 0, 0 );
  drawPiston ( +engineSize*0.55, 0, engineSize*0.5, 0, phaseShift, 0 );

  showInfo();

  // draw a single piston
  // offset X, Y, Z and delta Pitch, Roll, Yaw
  function drawPiston ( oX, oY, oZ, dP, dR, dY ) {
    const engineRotationAngle = dR + rotationSpeedEngine;
  
    const rodLength = rodFactor*engineSize;
    const rodJournalY = Math.sin( engineRotationAngle )*engineSize/4;
    const rodJournalZ = Math.cos( engineRotationAngle )*engineSize/4;
    const zPiston = rodJournalZ - Math.sqrt( rodLength*rodLength - rodJournalY*rodJournalY ); 
    const rodAngle = Math.asin( rodJournalY/rodLength );
  
    // engine block
    drawPart( engineBlock, oX, oY, 0 );
    
    // piston rod
    initRotate3d( dP, rodAngle, dY );
    rotateDrawPart( pistonRod, oX, oY, zPiston + oZ );
    // piston
    drawPart( piston, oX, oY, zPiston + oZ );
    // crank shaft
    initRotate3d( dP, engineRotationAngle, dY );
    rotateDrawPart( crankShaft, oX, oY, oZ );
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
  };
  
  // project a simple grid line
  function projectLine( text, x0, y0, z0, x1, y1, z1, color ) {
    const p0 = project( x0, y0, z0 );
    const p1 = project( x1, y1, z1 );
    drawLine( text, p0, p1, color );
  };

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
  };
  
  // put it in perspective
  function project( x, y, z ) {
    const x2 = x*cosAlpha - y*sinAlpha;
    const y2 = ( x*sinAlpha + y*cosAlpha )*sinBeta - z*cosBeta;
    return {
      x: halfWidth + x2,
      y: halfHeight - y2
    }
  };
}

// restart the stuff
function resize( ) {
  window.cancelAnimationFrame( request );
  init( );
};

// sliding motion
function startSlide( x, y ) {
  startSlideX = x;
  startSlideY = y;
};

// slide it
function slideView( x, y ) {
  const dx = x - startSlideX;
  startSlideX = x;
  const dy = y - startSlideY;
  startSlideY = y;
  updateViewAngle( dx, dy );
  rotationSpeedX += dx / 5;
  rotationSpeedY += dy / 5;
};

// change view angle
function updateViewAngle( dx, dy ) {
  alpha += dx / 800;
  beta += dy / 800;
  cosAlpha = Math.cos( alpha );
  sinAlpha = Math.sin( alpha );
  sinBeta = Math.sin( beta );
  cosBeta = Math.cos( beta );
};

// document is loaded get the codes and set the call back
$( document ).ready( function( ) {
    createEngine( );
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