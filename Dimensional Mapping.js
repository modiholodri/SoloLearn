// Created by Modi

// quality variable. Standard quality - 1.00
var quality = 1.00;

// rotation angles
var alpha = 0; // Math.PI;
var beta = Math.PI/2;
var cosAlpha = Math.cos( alpha );
var sinAlpha = Math.sin( alpha );
var sinBeta = Math.sin( beta );
var cosBeta = Math.cos( beta );
var mouseIsDown = false;

// fix the settings
var rotationSpeedX = 0;
var rotationSpeedY = 0;
var angle = 40;
// sliding motion
var startSlideX;
var startSlideY;
var doRoll = false;
var doPitch = false;

// setup the canvas
var width, halfWidth;
var height, halfHeight;
var ctx;

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
  $( '#info' ).html( 
    '<p>Frame Rate: ' + getFrameRate( ) + '</p>' +
    '<p>Balls: ' + clickedBalls.length + '</p>' +
    '<p>RotationX: ' + rotationSpeedX.toFixed( 3 ) + '</p>' +
    '<p>RotationY: ' + rotationSpeedY.toFixed( 3 ) + '</p>' +
    '<p>sinAlpha: ' + sinAlpha.toFixed( 3 ) + '</p>' +
    '<p>cosAlpha: ' + cosAlpha.toFixed( 3 ) + '</p>' +
    '<p>sinBeta: ' + sinBeta.toFixed( 3 ) + '</p>' +
    '<p>cosBeta: ' + cosBeta.toFixed( 3 ) + '</p>' +
    '<p>StartSlideX: ' + Math.round( startSlideX ) + '</p>' +
    '<p>StartSlideY: ' + Math.round( startSlideY ) + '</p>' + 
    touchInfo );
}

// something changed in the settings init everything
function init( ) {
  var canvas = $( 'canvas' )[0];
  canvas.width = width = Math.round( quality * window.innerWidth );
  canvas.height = height = Math.round( quality * window.innerHeight );
  halfWidth = width / 2;
  halfHeight = height / 2;
  ctx = canvas.getContext( '2d' );
  rotationSpeedX = 0;
  rotationSpeedY = 0;
    
  // handle the touch stuff
  canvas.ontouchstart = function( event ) {
    event.preventDefault();
    showTouches( event );

    if( event.touches.length == 1 ) {
      //addBall( event.touches[0].pageX, event.touches[0].pageY ); // add a ball
      startSlide( event.touches[0].pageX, event.touches[0].pageY );
    }
  };
  canvas.ontouchmove = function( event ) {
    event.preventDefault();
    showTouches( event );

    if( event.touches.length == 1 ) {
      addBall( event.touches[0].pageX, event.touches[0].pageY ); // add a ball
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
    //addBall( event.pageX, event.pageY ); // add a ball
    mouseIsDown = true;
  };
  canvas.onmouseleave = canvas.onmouseup = function( event ) {
    mouseIsDown = false;
  };
  canvas.onmousemove = function( event ) {
    event.preventDefault();
    if ( mouseIsDown ) {
        slideIt( event.pageX, event.pageY );
        addBall( event.pageX, event.pageY ); // add a ball
    }
  };
  canvas.onmousedown = function( event ) {
    event.preventDefault();
    startSlide( event.pageX, event.pageY );
    //addBall( event.pageX, event.pageY ); // add a ball
    mouseIsDown = true;
  };

  // handle the mouse click stuff
  canvas.onclick = function( event ) {
    event.preventDefault();
    addBall( event.pageX, event.pageY ); // add a ball
    mouseIsDown = false;
  };
  canvas.onmouseup = function( event ) {
    event.preventDefault();
    startSlideX = null;
    startSlideY = null;
    mouseIsDown = false;
  };

  // handle the mouse double click stuff
  canvas.ondblclick = function( event ) {
    event.preventDefault();
    resize( );
  };

  animate( );
}

// ball locations
var clickedBalls = [];
var spatialBalls = [];


function rotate( px, py, pz, pitch, roll, yaw ) { // pitch:x roll:y yaw:z
    var cosPitch = Math.cos( pitch );
    var sinPitch = Math.sin( pitch );

    var cosRoll = Math.cos( roll );
    var sinRoll = Math.sin( roll );

    var cosYaw = Math.cos( yaw );
    var sinYaw = Math.sin( yaw );

    var Axx = cosYaw*cosPitch;
    var Axy = cosYaw*sinPitch*sinRoll - sinYaw*cosRoll;
    var Axz = cosYaw*sinPitch*cosRoll + sinYaw*sinRoll;

    var Ayx = sinYaw*cosPitch;
    var Ayy = sinYaw*sinPitch*sinRoll + cosYaw*cosRoll;
    var Ayz = sinYaw*sinPitch*cosRoll - cosYaw*sinRoll;

    var Azx = -sinPitch;
    var Azy = cosPitch*sinRoll;
    var Azz = cosPitch*cosRoll;

    return {
        x: Axx*px + Axy*py + Axz*pz,
        y: Ayx*px + Ayy*py + Ayz*pz,
        z: Azx*px + Azy*py + Azz*pz
    }
}

// add another ball
function addBall( x2, y2 ) {
  // on virtual screen
  x2 = x2 - halfWidth;
  y2 = halfHeight - y2;
  clickedBalls.push( { x: x2, y: y2, z: 0 } );
  // rotated ball
  var p = rotate ( x2, 
                   y2, 
                   0, 
                   beta, 0, alpha );
  spatialBalls.push( { x: p.x, y: p.y, z: p.z } );
}

var request;
function animate( ) {
  request = window.requestAnimationFrame( animate );
  ctx.clearRect( 0, 0, width, height );
  
  // get the settings
  doRoll = $('#doRoll').prop('checked');
  doPitch = $('#doPitch').prop('checked');
  var showWheel = $('#showWheel').prop('checked');
  var showAxis = $('#showAxis').prop('checked');
  var showDots = $('#showDots').prop('checked');

  // rotate the whole thing or not
  if ( doRoll ) rotationSpeedX *= 1; // slowdown
  else rotationSpeedX = 0;
  if ( doPitch ) rotationSpeedY *= 1; // slowdown
  else rotationSpeedY = 0;
  slide( rotationSpeedX, rotationSpeedY );
  
  cosAlpha = Math.cos( alpha );
  sinAlpha = Math.sin( alpha );
  sinBeta = Math.sin( beta );
  cosBeta = Math.cos( beta );

  // project the grid
  var x, y;
  if ( showWheel ) {
    for( x = -100; x <= 100; x += 25 ) {
      projectGrid( x, -100,  100, x, 100,  100 );
      projectGrid( x, -100, -100, x, 100, -100 );
      projectGrid( x,  100, -100, x,  100, 100 );
      projectGrid( x, -100, -100, x, -100, 100 );
    }
    projectGrid(  100, -100, 0,  100, 100, 0 ); // middle horizontal
    projectGrid(  100, 0, -100,  100, 0, 100 ); // middle vertical
    projectGrid( -100, -100, 0, -100, 100, 0 ); // middle horizontal
    projectGrid( -100, 0, -100, -100, 0, 100 ); // middle vertical
    for( y = -100; y <= 100; y +=25 ) {
      projectGrid( -100, y,  0, 100, y, 0 );
      projectGrid( -100, y,  100, 100, y,  100 );
      projectGrid( -100, y, -100, 100, y, -100 );
    }
  }

  addFlash ( startSlideX, startSlideY );

  if ( showDots ) {
    // project the dots
    ctx.globalAlpha = 0.7;
    for( var i=0; i<clickedBalls.length; i++) {
       projectBall ( clickedBalls[i].x, clickedBalls[i].y, clickedBalls[i].z, 'red' );
    }
    for( var i=0; i<spatialBalls.length; i++) {
      projectBall ( spatialBalls[i].x, spatialBalls[i].y, spatialBalls[i].z, 'blue' );
   }
 }

  if ( showAxis ) {
    // reference axis for testing
    projectBall ( 0, 0, 0, 'yellow' );
    projectVirtualScreen ( );
  
    var halfArea = Math.min( halfWidth, halfHeight ) * 0.7;
    var halfArea8 = Math.min( halfWidth, halfHeight ) * 0.8;
    var halfArea9 = Math.min( halfWidth, halfHeight ) * 0.9;

    drawLine ( 'sα', halfWidth, halfHeight-halfArea8, halfWidth+halfArea*sinAlpha, halfHeight-halfArea8, 'red' );
    drawLine ( 'cα', halfWidth, halfHeight-halfArea9, halfWidth+halfArea*cosAlpha, halfHeight-halfArea9, 'red' );
    drawLine ( 'sβ', halfWidth-halfArea9, halfHeight, halfWidth-halfArea9, halfHeight+halfArea*sinBeta, 'green' );
    drawLine ( 'cβ', halfWidth-halfArea8, halfHeight, halfWidth-halfArea8, halfHeight+halfArea*cosBeta, 'green' );

    drawLine ( 'sX', halfWidth-halfArea, halfHeight-halfArea, halfWidth+halfArea, halfHeight-halfArea, 'red' );
    drawLine ( 'sY', halfWidth-halfArea, halfHeight-halfArea, halfWidth-halfArea, halfHeight+halfArea, 'green' );

    projectLine ( 'X', 0, 0, 0, halfArea, 0, 0, 'red' );
    projectLine ( 'Y', 0, 0, 0, 0, halfArea, 0, 'green' );
    projectLine ( 'Z', 0, 0, 0, 0, 0, halfArea, 'blue' );
  }

  showInfo();

  // add the current touch flash
  function addFlash( x2, y2 ) {
    if ( x2 < 1 || !$('#showDots').prop('checked') ) return;
    var virtualScreen = { x: x2 - halfWidth, y: halfHeight - y2, z: 0 };
    var realScreen = rotate ( virtualScreen.x, virtualScreen.y, virtualScreen.z, -alpha, 0, -beta );
    projectLine( "Screen", realScreen.x, realScreen.y, realScreen.z, 
                          virtualScreen.x, virtualScreen.y, -virtualScreen.z, 'yellow' );
    realScreen = rotate ( virtualScreen.x, virtualScreen.y, virtualScreen.z, -alpha, -beta, 0 );
    projectLine( "Screen", realScreen.x, realScreen.y, realScreen.z, 
                          virtualScreen.x, virtualScreen.y, -virtualScreen.z, 'blue' );
    realScreen = rotate ( virtualScreen.x, virtualScreen.y, virtualScreen.z, 0, -alpha, -beta );
    projectLine( "Screen", realScreen.x, realScreen.y, realScreen.z, 
                          virtualScreen.x, virtualScreen.y, -virtualScreen.z, 'grey' );
    realScreen = rotate ( virtualScreen.x, virtualScreen.y, virtualScreen.z, -beta, -alpha, 0  );
    projectLine( "Screen", realScreen.x, realScreen.y, realScreen.z, 
                          virtualScreen.x, virtualScreen.y, -virtualScreen.z, 'pink' );
    realScreen = rotate ( virtualScreen.x, virtualScreen.y, virtualScreen.z, 0, -beta, -alpha );
    projectLine( "Screen", realScreen.x, realScreen.y, realScreen.z, 
                          virtualScreen.x, virtualScreen.y, -virtualScreen.z, 'purple' );
    realScreen = rotate ( virtualScreen.x, virtualScreen.y, virtualScreen.z, -beta, 0, -alpha );
    projectLine( "Screen", realScreen.x, realScreen.y, realScreen.z, 
                          virtualScreen.x, virtualScreen.y, -virtualScreen.z, 'grey' );
  }

  // project a single ball
  function projectBall( x, y, z, color ) {
    ctx.beginPath( );
    var radius = 4;

    var point2D = project( x, y, z );
    ctx.fillStyle = color;
    ctx.fillRect( point2D.x, point2D.y, radius, radius );
  };
  
    // project a simple grid line
  function projectLine( text, x0, y0, z0, x1, y1, z1, color ) {
    var p0 = project( x0, y0, z0 );
    var p1 = project( x1, y1, z1 );
    drawLine( text, p0.x, p0.y, p1.x, p1.y, color );
  };
  
  function drawLine( text, x0, y0, x1, y1, color ) {
    ctx.globalAlpha = 0.7;
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
  
  // project a simple grid line
  function projectGrid( x0, y0, z0, x1, y1, z1 ) {
    ctx.globalAlpha = 0.4;
    ctx.strokeStyle = 'red';
    ctx.beginPath( );
    var p0 = project( x0, y0, z0 );
    ctx.moveTo( p0.x, p0.y );
    var p1 = project( x1, y1, z1 );
    ctx.lineTo( p1.x, p1.y );
    ctx.stroke( );
  };
  
  // draw part of a wave
  function projectVirtualScreen( ) {
    ctx.fillStyle = 'red';
    ctx.globalAlpha = 0.2;
    var halfArea = Math.min( halfWidth, halfHeight ) * 0.7;

    ctx.beginPath( );
    // points
    var p0 = project( -halfArea, halfArea, 0 );
    ctx.moveTo( p0.x, p0.y );
    var p1 = project( halfArea, halfArea, 0 );
    ctx.lineTo( p1.x, p1.y );
    var p3 = project( halfArea, -halfArea, 0 );
    ctx.lineTo( p3.x, p3.y );
    var p4 = project( -halfArea, -halfArea, 0 );
    ctx.lineTo( p4.x, p4.y );

    ctx.fill( );
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
  var dx = 0;
  if ( doRoll ) {
      dx = x - startSlideX;
      rotationSpeedX += dx / 50;
  }
  else rotationSpeedX = 0;
  startSlideX = x;

  var dy = 0;
  if ( doPitch ) {
      dy = y - startSlideY;
      rotationSpeedY -= dy / 50;
  }
  else rotationSpeedY = 0;
  startSlideY = y;

  slide( dx, dy );
};

// change Alpha
function slide( dx, dy ) {
  alpha += dx/400;
  beta += dy/400;
};

// document is loaded get the codes and set the call back
$( document ).ready( function( ) {
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
    }, 600);
});