// Created by Modi


// rotation angles
var alpha = Math.PI/5+Math.PI;
var beta = Math.PI/18;
var cosAlpha = Math.cos( alpha );
var sinAlpha = Math.sin( alpha );
var sinBeta = Math.sin( beta );
var cosBeta = Math.cos( beta );
var mouseIsDown = false;
var ballSize = 2.0;
var fade = 0.6;
var viewRotation = 0.01;
var engineRotation = 0.01;
var rotationSpeedEngine = 0;

// fix the settings
var rotationSpeedX = 0;
var rotationSpeedY = 0;
// sliding motion
var startSlideX;
var startSlideY;

// setup the canvas
var width, halfWidth;
var height, halfHeight;
var ctx;
var size;

// ball locations
var piston = [];
var crankShaft = [];
var pistonRod = [];
var rodLength = 0.7;

var touchInfo = ""
function showTouches( event ) {
  touchInfo = ""
  for (var i = 0; i < event.touches.length; i++) {
    touchInfo += 
      '<p>Touch ' + i + 
      ' X -> ' + Math.round( event.touches[i].pageX ) +
      ' Y -> ' + Math.round( event.touches[i].pageY ) + '</p>';
  }
}

// calculate the frame rate per second
// The higher filterStrength, the less the fps will reflect temporary variations
// A value of 1 will only keep the last value
var filterStrength = 60;
var frameTime = 0, lastLoop = new Date(), thisLoop;
function getFrameRate ( ) {
  var thisFrameTime = ( thisLoop = new Date() ) - lastLoop;
  frameTime += ( thisFrameTime - frameTime ) / filterStrength;
  lastLoop = thisLoop;
  return ( 1000 / frameTime ).toFixed( 1 );
}

function showInfo ( ) {
  let totalBalls = ( piston.length + pistonRod.length + crankShaft.length ) * 3;
  $( '#info' ).html( 
    '<p>Frame Rate: ' + getFrameRate( ) + '</p>' +
    '<p>Balls: ' + totalBalls + '</p>' +
    '<p>Rotation X: ' + rotationSpeedX.toFixed( 3 ) + '</p>' +
    '<p>Rotation Y: ' + rotationSpeedY.toFixed( 3 ) + '</p>' +
    '<p>sinAlpha: ' + sinAlpha.toFixed( 3 ) + '</p>' +
    '<p>cosAlpha: ' + cosAlpha.toFixed( 3 ) + '</p>' +
    '<p>cosBeta: ' + cosBeta.toFixed( 3 ) + '</p>' +
    touchInfo );
}

// something changed in the settings init everything
function init( ) {
  width = window.innerWidth;
  height = window.innerHeight;
  halfWidth = width / 2;
  halfHeight = height / 2;
  size = Math.min( halfWidth, halfHeight );
  
  var canvas = $( 'canvas' )[0];
  canvas.width = width;
  canvas.height = height;

  ctx = canvas.getContext( '2d' );
  
  ballSize = $('#ballSize').prop('value');
  fade = $('#fade').prop('value');
  viewRotation = $('#viewRotation').prop('value');
  engineRotation = $('#engineRotation').prop('value');
    
  // handle the touch stuff
  canvas.ontouchstart = function( event ) {
    event.preventDefault();
    showTouches( event );

    if( event.touches.length == 1 ) {
      startSlide( event.touches[0].pageX, event.touches[0].pageY );
    }
  };
  canvas.ontouchmove = function( event ) {
    event.preventDefault();
    showTouches( event );

    if(event.touches.length==1) {
     slideIt( event.touches[0].pageX, event.touches[0].pageY );   
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
        slideIt( event.pageX, event.pageY );
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
    rotationSpeedEngine = 0;
  }
  createEngine( );
  animate( );
}

// rotation factors
var Axx, Axy, Axz;
var Ayx, Ayy, Ayz;
var Azx, Azy, Azz;

// initialize the rotation factors
function initRotate( pitch, roll, yaw ) { // pitch:x roll:y yaw:z
  var cosPitch = Math.cos( pitch );
  var sinPitch = Math.sin( pitch );

  var cosRoll = Math.cos( roll );
  var sinRoll = Math.sin( roll );

  var cosYaw = Math.cos( yaw );
  var sinYaw = Math.sin( yaw );

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
function doRotate( px, py, pz ) { // pitch:x roll:y yaw:z
  return {
      x: Axx*px + Axy*py + Axz*pz,
      y: Ayx*px + Ayy*py + Ayz*pz,
      z: Azx*px + Azy*py + Azz*pz
  }
}

function createEngine( ) {
  piston = [];
  crankShaft = [];
  pistonRod = [];

  let step = 0;
  // piston
  addBall( piston, 0, 0, 0, 'yellow' ); // reference point
  for ( step=0.13; step<0.25; step+=0.05) {
    makeVerticalCircle( piston, size*step, 0, 0, size/16, 'navy' );
    makeVerticalCircle( piston, -size*step, 0, 0, size/16, 'navy' );
  }
  for ( step=-0.1; step<0.4; step+=0.1) {
    makeHorizontalCircle( piston, 0, 0, -size*step, size/4, 'green' );
  }

  // piston rod
  for ( step=0.1; step<rodLength; step+=0.1) {
    makeHorizontalCircle( pistonRod, 0, 0, size*step, size/12, 'slateGrey' );
  }
  for ( step=-0.1; step<0.11; step+=0.05) {
    makeVerticalCircle( pistonRod, size*step, 0, 0, size/12, 'slateGrey' );
    // makeVerticalCircle( pistonRod, -size*step, 0, 0, size/12, 'slateGrey' );
    makeVerticalCircle( pistonRod, size*step, 0, rodLength*size, size/12, 'slateGrey' );
    // makeVerticalCircle( pistonRod, -size*step, 0, rodLength*size, size/12, 'slateGrey' );
  }
  
  // crank shaft
  addBall( crankShaft, 0, 0, size/4, 'yellow' ); // reference point
  for ( step=-0.1; step<0.2; step+=0.1) {
    // makeVerticalCircle( crankShaft, size*step, 0, size/4, size/16, 'purple' );
  }
  for ( step=0.1; step<0.3; step+=0.1) {
    makeVerticalCircle( crankShaft, size*step, 0, 0, size/3, 'slateGrey' );
    makeVerticalCircle( crankShaft, -size*step, 0, 0, size/3, 'slateGrey' );
  }
  for ( step=0.2; step<0.3; step+=0.05) {
    makeVerticalCircle( crankShaft, size*step, 0, 0, size/16, 'navy' );
    makeVerticalCircle( crankShaft, -size*step, 0, 0, size/16, 'navy' );
  }
}

// create a horizontal circle
function makeHorizontalCircle( part, x, y, z, radius, color ) {
  let step = 4 / radius;
  let maxAngle = $('#showPartially').prop('value');

  for ( let angle = 0; angle < maxAngle; angle += step ) {
    let maxAngle = 2*Math.PI;
    let degree = angle * 360 / 2 / Math.PI;
    color = 'hsla( ' + degree + ',100% ,50%, 0.6 )';
    addBall( part, x+radius*Math.cos( angle ), y+radius*Math.sin( angle ), z, color );
  }
}

// create a horizontal circle
function makeVerticalCircle( part, x, y, z, radius, color ) { 
  let step = 3 / radius;
  let maxAngle = $('#showPartially').prop('value');
  if ( radius > size / 14 ) step = 4 / radius;
  for ( let angle = 0; angle < maxAngle; angle += step ) {
    if ( radius > size / 14 ) {
      let degree = angle * 360 / 2 / Math.PI;
      color = 'hsla( ' + degree + ',100% ,50%, 0.6 )';
    }
    addBall( part, x, y+radius*Math.cos( angle ), z+radius*Math.sin( angle ), color );
  }
}


// add another ball
function addBall( part, x, y, z, color ) {
  part.push( { x: x, y: y, z: z, c: color } );
}

var request;
function animate( ) {
  request = window.requestAnimationFrame( animate );
  ctx.fillStyle = 'rgba( 0, 0, 0,' + fade + ')';
  ctx.fillRect( 0, 0, width, height );

  // rotate the whole thing or not
  rotationSpeedX += +viewRotation;
  rotationSpeedY += +viewRotation;
  rotationSpeedEngine += +engineRotation;
  slide( rotationSpeedX, rotationSpeedY );
  
  cosAlpha = Math.cos( alpha );
  sinAlpha = Math.sin( alpha );
  sinBeta = Math.sin( beta );
  cosBeta = Math.cos( beta );

  // draw the axis
  if ( $('#showAxis').prop('checked') ) {
    projectLine ( 'X', 0, 0, 0, size, 0, 0, 'red' );
    projectLine ( 'Y', 0, 0, 0, 0, size, 0, 'green' );
    projectLine ( 'Z', 0, 0, 0, 0, 0, size, 'blue' );
  }

  // offset X, Y, Z and delta Pitch, Roll, Yaw
  var thirdPI = 2 * Math.PI / 3; 
  drawPiston ( -size*0.55, 0, size*0.5, 0, -thirdPI, 0 );
  drawPiston ( 0, 0, size*0.5, 0, 0, 0 );
  drawPiston ( +size*0.55, 0, size*0.5, 0, thirdPI, 0 );

  showInfo();

  // draw a single piston
  // offset X, Y, Z and delta Pitch, Roll, Yaw
  function drawPiston ( oX, oY, oZ, dP, dR, dY ) {
    let time = Date.now()/3e2 + dR + rotationSpeedEngine;
  
    var rl = rodLength*size;
    let csy = Math.sin(time)*size/4;
    let csz = Math.cos(time)*size/4;
    let zPiston = csz - Math.sqrt( rl*rl - csy*csy ); 
    let rodAngle = Math.asin( csy/rl );
  
    // piston rod
    initRotate( dP, rodAngle, dY );
    rotateDrawPart( pistonRod, oX, oY, zPiston + oZ );
    // piston
    drawPart( piston, oX, oY, oZ + zPiston );
    // crank shaft
    initRotate( dP, time, dY );
    rotateDrawPart( crankShaft, oX, oY, oZ );
  }
  
  // rotate a part
  function rotateDrawPart ( part, oX, oY, oZ ) {
    for( var i=0; i<part.length; i++) {
      let ball = doRotate( part[i].x, part[i].y, part[i].z );
      drawBall ( ball.x + oX, ball.y + oY, ball.z + oZ, part[i].c );
    }
  }

  // draw a part
  function drawPart ( part, oX, oY, oZ ) {
    for( var i=0; i<part.length; i++) {
      drawBall ( part[i].x + oX, part[i].y + oY, part[i].z + oZ, part[i].c );
    }
  }

  // draw a single ball
  function drawBall( x, y, z, color ) {
    var p2D = project( x, y, z );
    ctx.beginPath( );
    ctx.fillStyle = color;
    ctx.fillRect( p2D.x, p2D.y, ballSize, ballSize );
  };
  
  // project a simple grid line
  function projectLine( text, x0, y0, z0, x1, y1, z1, color ) {
    var p0 = project( x0, y0, z0 );
    var p1 = project( x1, y1, z1 );
    drawLine( text, p0.x, p0.y, p1.x, p1.y, color );
  };
  
  function drawLine( text, x0, y0, x1, y1, color ) {
    ctx.globalAlpha = 1;
    ctx.lineWidth = 2;
    ctx.strokeStyle = color;
    ctx.beginPath( );
    ctx.moveTo( x0, y0 );
    ctx.lineTo( x1, y1 );
    ctx.stroke( );
    ctx.font = "20px Arial";
    ctx.fillStyle = color;
    ctx.textAlign = "center";
    ctx.fillText( text, x1, y1 );
  };
   
  
  // put it in perspective
  function project( x, y, z ) {
    var x2 = x*cosAlpha - y*sinAlpha;
    var y2 = ( x*sinAlpha + y*cosAlpha )*sinBeta - z*cosBeta;
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
function slideIt( x, y ) {
  var dx = x - startSlideX;
  startSlideX = x;
  var dy = y - startSlideY;
  startSlideY = y;
  slide( dx, dy );
  rotationSpeedX += dx / 5;
  rotationSpeedY += dy / 5;
};

// change view angle
function slide( dx, dy ) {
  alpha += dx/800;
  beta += dy/800;
};

// document is loaded get the codes and set the call back
$( document ).ready( function( ) {
    createEngine( );
    setTimeout( function() { 
      $( '.menuButton' ).click( function() {
        $( this ).toggleClass( 'show' );
        $( '.menuSections' ).toggleClass( 'show' );
      });
      $( '.helpButton' ).click( function() {
        $( '.helpSections' ).toggleClass( 'show' );
      });
      $( '.infoButton' ).click( function() {
        $( '.infoSections' ).toggleClass( 'show' );
      });
      $( '.resetButton' ).click( function() {
        rotationSpeedX = 0;
        rotationSpeedY = 0;
        rotationSpeedEngine = 0;
      });
    }, 600);
});