// Created by Modi

// quality variable. Standard quality - 1.00
var quality = 1.00;

// rotation angles
var alpha = Math.PI/8;
var beta = Math.PI/18;
var cosAlpha = Math.cos( alpha );
var sinAlpha = Math.sin( alpha );
var sinBeta = Math.sin( beta );
var cosBeta = Math.cos( beta );
var mouseIsDown = false;

// fix the settings
var rotationSpeed = 1;
// sliding motion
var startSlideX;
var startSlideY;

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
    '<p>Balls: ' + balls.length + '</p>' +
    '<p>Rotation: ' + rotationSpeed.toFixed( 3 ) + '</p>' +
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
  canvas.width = width = Math.round( quality * window.innerWidth );
  canvas.height = height = Math.round( quality * window.innerHeight );
  halfWidth = width / 2;
  halfHeight = height / 2;
  ctx = canvas.getContext( '2d' );
  rotationSpeed = 2;
    
  // handle the touch stuff
  canvas.ontouchstart = function( event ) {
    event.preventDefault();
    showTouches( event );

    if( event.touches.length == 1 ) {
      addBall( event.touches[0].pageX, event.touches[0].pageY ); // add a ball
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
    else if ( event.touches.length == 2 ) {
     resize( );
    }
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
        slideIt( event.pageX, event.pageY );
        addBall( event.pageX, event.pageY ); // add a ball
    }
  };

  // handle the mouse click stuff
  canvas.onclick = canvas.ondblclick = function( event ) {
    event.preventDefault();
    addBall( event.pageX, event.pageY ); // add a ball
    mouseIsDown = false;
  };

  animate( );
}

// old values 
var xO, yO, zO;
var waveAlpha = 1;
var oldFadeWaves = true;
// ball locations
var balls = [];

// add another ball
function addBall( x2, y2 ) {

  y2 = halfHeight - y2;
  x2 = x2 - halfWidth; 

  var x = x2*cosAlpha;
  var y = -x2*sinAlpha;
  var z = -y2;

  balls.push( { x: x, y: y, z: z } );
}

var request;
function animate( ) {
  request = window.requestAnimationFrame( animate );
  ctx.clearRect( 0, 0, width, height );
  
  // get the settings
  var showWheel = $('#showWheel').prop('checked');

  // rotate the whole thing or not
  rotationSpeed *= 1; // slowdown
  slide( 1 * rotationSpeed );
  
  cosAlpha = Math.cos( alpha );
  sinAlpha = Math.sin( alpha );
  sinBeta = Math.sin( beta );
  cosBeta = Math.cos( beta );

  // draw the grid
  var x, y;
  if ( showWheel ) {
    for( x = -100; x <= 100; x += 20 ) {
      drawGrid( x, -100,  100, x, 100,  100 );
      drawGrid( x, -100, -100, x, 100, -100 );
      drawGrid( x,  100, -100, x,  100, 100 );
      drawGrid( x, -100, -100, x, -100, 100 );
    }
    drawGrid(  100, -100, 0,  100, 100, 0 ); // middle horizontal
    drawGrid(  100, 0, -100,  100, 0, 100 ); // middle vertical
    drawGrid( -100, -100, 0, -100, 100, 0 ); // middle horizontal
    drawGrid( -100, 0, -100, -100, 0, 100 ); // middle vertical
    for( y = -100; y <= 100; y +=20 ) {
      drawGrid( -100, y,  0, 100, y, 0 );
      drawGrid( -100, y,  100, 100, y,  100 );
      drawGrid( -100, y, -100, 100, y, -100 );
    }
  }

  // move the balls forward
  ctx.globalAlpha = 0.8;
  for( var i=0; i<balls.length; i++) {
      drawBall ( balls[i].x, balls[i].y, balls[i].z, 'slategrey' );
  }
  // drawBall ( 100, 0, 0, 'yellow' );
  // drawBall ( 0, 100, 0, 'blue' );
  // drawBall ( 0, 0, 100, 'green' );

  showInfo();

  // draw a single ball
  function drawBall( x, y, z, color ) {
    ctx.beginPath( );
    var radius = 4;

    var point2D = project( x, y, z );
    ctx.fillStyle = color;
    ctx.fillRect( point2D.x, point2D.y, radius, radius );
  };
  
  // draw a simple grid line
  function drawGrid( x0, y0, z0, x1, y1, z1 ) {
    ctx.globalAlpha = 0.4;
    ctx.strokeStyle = 'red';
    ctx.beginPath( );
    var p0 = project( x0, y0, z0 );
    ctx.moveTo( p0.x, p0.y );
    var p1 = project( x1, y1, z1 );
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
  var dx = x - startSlideX;
  startSlideX = x;
  slide( dx );
  rotationSpeed += dx / 5;
};

// change Alpha
function slide( dx ) {
  alpha += dx/200;
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
    downloadLink.download = "Tornado.html";
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
    if ( location.protocol == 'about:' ) { // if the code is running in the app
        ; // do nothing for now
    }
    else if ( location.hostname == 'code.sololearn.com' ) { // if the code is running in the browser under SoloLearn
        if ( confirm ( 'Running in your browser under SoloLearn...\nLaunch the download to make me fullscreen?' ) ) {
            downloadCode( );
        }
    }
    else if ( location.protocol == 'file:' ) { // if the code is running in the browser in a downloaded file
        alert ( 'Thanks a lot for making me fullscreen!' );
    }
    else { // no clue where the code is running
        alert ( 'I have no clue where I am running...' );
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