// Created by Modi


// rotation angles
var alpha = 0;
var beta = 0;
var cosAlpha = Math.cos( alpha );
var sinAlpha = Math.sin( alpha );
var sinBeta = Math.sin( beta );
var cosBeta = Math.cos( beta );
var mouseIsDown = false;

var size = 2.0;
var fade = 0.6;

// sliding motion
var startSlideX;
var startSlideY;

// setup the canvas
var width, halfWidth;
var height, halfHeight;
var ctx;

var touchInfo = "";
function showTouches( event ) {
  touchInfo = "";
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
    '<p>Balls: ' + balls.length + '</p>' +

    '<p>sinAlpha: ' + sinAlpha.toFixed( 3 ) + '</p>' +
    '<p>cosAlpha: ' + cosAlpha.toFixed( 3 ) + '</p>' +
    '<p>cosBeta: ' + cosBeta.toFixed( 3 ) + '</p>' +
    '<p>StartSlideX: ' + Math.round( startSlideX ) + '</p>' +
    '<p>StartSlideY: ' + Math.round( startSlideY ) + '</p>' + 
    touchInfo );
}

// something changed in the settings init everything
function init( ) {
  var canvas = $( 'canvas' )[0];
  canvas.width = width = window.innerWidth;
  canvas.height = height = window.innerHeight;
  halfWidth = width / 2;
  halfHeight = height / 2;
  ctx = canvas.getContext( '2d' );
  rotationSpeed = 0;
  
  size = $('#size').prop('value');
  fade = $('#fade').prop('value');
    
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

    for( var i = 0; i <  event.touches.length; i++ ) {
      addBall( event.touches[i].pageX, event.touches[i].pageY ); // add a ball
    }
    slideIt( event.touches[0].pageX, event.touches[0].pageY );
  };
  canvas.ontouchend = function( event ) {
    touchInfo = "";
  };

  // handle the mouse drag stuff
  canvas.onmousedown = function( event ) {
    event.preventDefault();
    startSlide( event.pageX, event.pageY );
    addBall( event.pageX, event.pageY ); // add a ball
    mouseIsDown = true;
  };
  canvas.onmouseleave = canvas.onmouseup = function( event ) {
    mouseIsDown = false;
  };
  canvas.onmousemove = function( event ) {
    event.preventDefault();
    if ( mouseIsDown ) {
        // slideIt( event.pageX, event.pageY );
        addBall( event.pageX, event.pageY ); // add a ball
    }
  };

  // handle the mouse click stuff
  canvas.onclick = canvas.ondblclick = function( event ) {
    event.preventDefault();
    addBall( event.pageX, event.pageY ); // add a ball
    mouseIsDown = false;
  };

if(window.DeviceMotionEvent) { 
window.addEventListener("devicemotion", motion, false); 
} 
else { 
console.log("DeviceMotionEvent is not supported"); 
}

if(window.DeviceOrientationEvent){ 
window.addEventListener("deviceorientation", orientation, false); }else{ console.log("DeviceOrientationEvent is not supported"); }

  animate( );
}

function motion(event) { 
// console.log("Accelerometer: " + event.accelerationIncludingGravity.x + ", " + event.accelerationIncludingGravity.y + ", " + event.accelerationIncludingGravity.z ); 
}

function orientation(event) { 
// console.log("Magnetometer: " + event.alpha + ", " + event.beta + ", " + event.gamma );
}


// ball locations
var balls = [];

var ax = 0;
var ay = 0;
var az = 9.81/60;

function updatePosition ( ball ){
  //update velocity
  ball.vx += ax;
  ball.vy += ay;
  ball.vz += az;

  //update position
  ball.x += ball.vx;
  ball.y += ball.vy;
  ball.z += ball.vz;
}

var dFilterStrength = 20;
var dx = 0;
var dy = 0;

// add another ball
function addBall( x2, y2 ) {
  var c = 'slateGrey';
  if( $( '#randomColor' ).prop( 'checked' ) ) {
  c = '#' + Math.floor ( Math.random( ) * 16777215 ).toString( 16 );
  }
  if( $( '#smoothColor' ).prop( 'checked' ) ) {
  var r = 256 * ( width - x2 )/width;
  var b = 256 * ( height - y2 ) / height;
  var g = 256 * y2 / height;
  c = 'rgb( '+r+','+g+','+b+')';
  }

  var factor = 3;
  var deltaX = ( x2 - startSlideX ) / factor;
  var deltaY = ( y2 - startSlideY ) / factor;
  
  dx += ( deltaX - dx ) / dFilterStrength;
  dy += ( deltaY - dy ) / dFilterStrength

  y2 = halfHeight - y2;
  x2 = x2 - halfWidth; 

  var x = x2*cosAlpha;
  var y = -x2*sinAlpha;
  var z = -y2;

  balls.push( { 
    x: x, y: y, z: z, 
    vx: dx-5, vy: 3, vz: dy-6,
    c: c
  } );
}

var request;
function animate( ) {
  request = window.requestAnimationFrame( animate );
  ctx.fillStyle = 'rgba( 0, 0, 0,' + fade + ')';
  ctx.fillRect( 0, 0, width, height );

  
  cosAlpha = Math.cos( alpha );
  sinAlpha = Math.sin( alpha );
  sinBeta = Math.sin( beta );
  cosBeta = Math.cos( beta );

  // draw the grid
  var x, y;
  if ( $('#showWheel').prop('checked') ) {
    
  }
  
  // remove fallen though balls
  while( balls.length > 0 && balls[0].z > 1000 ) {
      balls.shift( );
  }
  
  // move the balls forward

  for( var i=0; i<balls.length; i++) {
      updatePosition ( balls[i] );
      drawBall ( balls[i] );
  }


  showInfo();

  // draw a single ball
  function drawBall( ball ) {


    var point2D = project( ball.x, ball.y, ball.z );
    
    ctx.beginPath( );
    ctx.fillStyle = ball.c;
    ctx.fillRect( point2D.x, point2D.y, size, size );
  };
  
  // draw a simple grid line
  function drawLine( x0, y0, z0, x1, y1, z1, color ) {
    var p0 = project( x0, y0, z0 );
    var p1 = project( x1, y1, z1 );

    ctx.strokeStyle = color;
    ctx.beginPath( );

    ctx.moveTo( p0.x, p0.y );

    ctx.lineTo( p1.x, p1.y );
    ctx.stroke( );
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

  startSlideX = x;
  startSlideY = y;
};



// Full Screen Part - 2018-10-06 - Created by Modi
/******************************************************
Run a SoloLearn code fullscreen in the browser.
******************************************************/
// Copyright (c) 2018 Modi (Reinhold Lauer)
// Permission is hereby granted, free of charge, to any person obtaining a copy
// of this software and associated documentation files (the "Software"), to deal
// in the Software without restriction, including without limitation the rights
// to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
// copies of the Software, and to permit persons to whom the Software is
// furnished to do so, subject to the following conditions:
// The above copyright notice and this permission notice shall be included in
// all copies or substantial portions of the Software.

// get and combine the codes into one so that it can be executed
function downloadCode( ) {
    var htmlCode = window.parent.defaultCodes.html;  // HTML code will contain the combined code at the end
    var cssCode = window.parent.defaultCodes.css;  // CSS code from SoloLearn
    var jsCode = window.parent.defaultCodes.javascript;  // JavaScript code from SoloLearn

    // add CSS and JavaScript to the HTML code
    htmlCode = htmlCode.replace( '<\/head>', '<style>\n\n' + cssCode + '\n\n<\/style><\/head>' );
    htmlCode = htmlCode.replace( '<\/body>', '<script>\n\n' + jsCode + '\n\n<\/script><\/body>' );
    
    // make the blob
    var codeAsBlob = new Blob([ htmlCode ], { type: 'html' });
    
    // create a download link
    var downloadLink = document.createElement("a");
    downloadLink.download = "Gravity Stuff.html";
    downloadLink.innerHTML = "Download File";
    if ( window.webkitURL ) { // Chrome allows the link to be clicked without actually adding it to the DOM.
        downloadLink.href = window.webkitURL.createObjectURL( codeAsBlob );
    } 
    else if ( window.URL && window.URL.createObjectURL ) { // Firefox requires the link to be added to the DOM before it can be clicked.
        downloadLink.href = window.URL.createObjectURL( codeAsBlob );
        downloadLink.style.display = "none";
        document.body.appendChild( downloadLink );
    }
    else {
        console.log( 'Error: Could not figure out how to handle the URL...' );
    }
    // and click on the download link
    downloadLink.click();
}

// document is loaded get the codes and set the call back
$( document ).ready( function( ) {
    if ( location.hostname == 'code.sololearn.com' ) { // if the code is running in the browser under SoloLearn
        if ( confirm ( 'Running in your browser under SoloLearn...\nLaunch the download to make me fullscreen?' ) ) {
            downloadCode( );
        }
    }

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