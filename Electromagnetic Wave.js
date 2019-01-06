// Created by Rull Deef 🐺
// https://code.sololearn.com/W3bBU8i1UX9G

// Modified by Modi

// quality variable. Standard quality - 1.00
var quality = 1.00;

// rotation angles
var alpha = Math.PI/6;
var beta = Math.PI/8;
var sinBeta = Math.sin( beta );
var cosBeta = Math.cos( beta );

// setup the canvas
var width, height, ctx;
var blSi;  // block size
function init( ) {
  var canvas = $( 'canvas' )[0];
  canvas.width = width = Math.round( quality * window.innerWidth );
  canvas.height = height = Math.round( quality * window.innerHeight );
  ctx = canvas.getContext( '2d' );
  blSi = width/10.5;
  
  canvas.onmousedown = canvas.ontouchstart = function( event ) {
    startSlide( event.pageX || event.touches[0].pageX );
  };
  
  canvas.onmouseup = canvas.ontouchmove = function( event ) {
    slideTo( event.pageX || event.touches[0].pageX );
  };

  animate( );
}

// old values 
var xO, yO, zO;
var waveAlpha = 1;
var oldFadeWaves = true;
// photon locations
var balls = [];
addBall( ); // add the first ball

// add another ball
function addBall( ) {
  var existAlready = false
  for( var i=0; i<balls.length; i++) {
    if ( balls[i].xP == -5 ) {
      existAlready = true;
      break;
    }
  }
  if ( !existAlready ) balls.push( { xP: -5, drawnAlready: false } );
}

var request;
function animate( ) {
  request = window.requestAnimationFrame( animate );
  ctx.clearRect( 0, 0, width, height );
  
  // get the settings
  var phase = Math.PI/120 * $('#phase').prop('value');
  var showBalls = $('#showBalls').prop('checked');
  var shrinkBalls = $('#shrinkBalls').prop('checked');
  var showWaves = $('#showWaves').prop('checked');
  var fadeWaves = $('#fadeWaves').prop('checked');
  var fillWaves = $('#fillWaves').prop('checked');
  var showOuterGrid = $('#outerGrid').prop('checked');
  var showInnerGrid = $('#innerGrid').prop('checked');
  var showPane = $('#showPane').prop('checked');
  // shift the time or not
  var tN = 0;
  if ( $('#shiftTime').prop('checked') ) tN = Date.now( )/5e2;
  // rotate the whole thing or not
  if( $( '#rotate' ).prop('checked') ) slide( 1 );
  var cosAlpha = Math.cos( alpha );
  var sinAlpha = Math.sin( alpha );
  
  // draw the grid
  var x, y;
  if ( showInnerGrid ) {
    for( x = -4; x <= 4; x++ ) {
      drawGrid( x, -1, 0, x, 1, 0 ); // middle horizontal
      drawGrid( x, 0, -1, x, 0, 1 ); // middle vertical
    }
    drawGrid( -5, 0, 0, 5, 0, 0 ); // the center line
  }
  if ( showOuterGrid ) {
    for( x = -5; x <= 5; x++ ) {
      drawGrid( x, -1,  1, x, 1,  1 );
      drawGrid( x, -1, -1, x, 1, -1 );
      drawGrid( x,  1, -1, x,  1, 1 );
      drawGrid( x, -1, -1, x, -1, 1 );
    }
    drawGrid(  5, -1, 0,  5, 1, 0 ); // middle horizontal
    drawGrid(  5, 0, -1,  5, 0, 1 ); // middle vertical
    drawGrid( -5, -1, 0, -5, 1, 0 ); // middle horizontal
    drawGrid( -5, 0, -1, -5, 0, 1 ); // middle vertical
    for( y = -1; y <= 1; y++ ) {
      if ( y !== 0 ) drawGrid( -5, y,  0, 5, y, 0 );
      drawGrid( -5, y,  1, 5, y,  1 );
      drawGrid( -5, y, -1, 5, y, -1 );
    }
  }

  // fix the settings
  var stepX = 0.1;
  var fromX = -5;
  var toX = 5;
  if ( sinAlpha > 0 ) { // reverse the drawing
    stepX = -stepX;
    fromX = -fromX;
    toX = -toX;
  }

  
  for( var i=0; i<balls.length; i++) {
      balls[i].xP += 0.1;
      if ( balls[i].xP >= 5 ) balls[i].xP = -5;
      balls[i].drawnAlready = false;
  }
  var xW = 0; // x for the waves
  // document.querySelector( '#info' ).innerText = 'cosAlpha ' + cosAlpha;
  // document.querySelector( '#info' ).innerText = 'fromX ' + fromX + '  xP ' + xP + '  dA ' + drawnAlready;  
  // draw the waves
  for( xW = fromX; (fromX<0 && xW<=toX) || (fromX>0 && xW>=toX); xW += stepX ) {
    var xN = xW*blSi; 
    var yN = Math.sin( Math.PI * ( xW-tN ) )*blSi;
    var zN = Math.sin( Math.PI * ( xW-tN ) + phase )*blSi;
    if ( xW == fromX ) {
      xO = xN;
      yO = yN;
      zO = zN;
    }
    
    if ( fadeWaves ) waveAlpha = 1-(xW+5)/10;
    else if ( fadeWaves != oldFadeWaves ) waveAlpha = 1-(balls[0].xP+5)/10;
    oldFadeWaves = fadeWaves;
    ctx.globalAlpha = waveAlpha;
    
    var zA = zO + zN;
    var yA = yO + yN;
    
    if ( cosAlpha > 0 ) {
      if ( zA>0 ) { // ++ electric
        if ( yA>0 ) { // ++electric ++magnetic
          drawWave( xO, yO, 0, xN, yN, 0, 'blue' ); // magnetic
          drawWave( xO, yO, zO, xN, yN, zN, 'yellow' ); // result
          drawWave( xO, 0, zO, xN, 0, zN, 'green' ); // electric    
        }
        else { // ++electric --magnetic
          drawWave( xO, 0, zO, xN, 0, zN, 'green' ); // electric
          drawWave( xO, yO, zO, xN, yN, zN, 'yellow' ); // result
          drawWave( xO, yO, 0, xN, yN, 0, 'blue' ); // magnetic
        }
      }
      else { // --electric 
        if ( yA>0 ) { // --electric ++magnetic
          drawWave( xO, yO, zO, xN, yN, zN, 'yellow' ); // result
          drawWave( xO, yO, 0, xN, yN, 0, 'blue' ); // magnetic
          drawWave( xO, 0, zO, xN, 0, zN, 'green' ); // electric   
        }
        else { // --electric --magnetic
          drawWave( xO, 0, zO, xN, 0, zN, 'green' ); // electric
          drawWave( xO, yO, zO, xN, yN, zN, 'yellow' ); // result
          drawWave( xO, yO, 0, xN, yN, 0, 'blue' ); // magnetic
        }
      }
    }
    else {
      if ( zA>0 ) { // ++ electric
        if ( yA>0 ) { // ++electric ++magnetic
          drawWave( xO, yO, 0, xN, yN, 0, 'blue' ); // magnetic
          drawWave( xO, 0, zO, xN, 0, zN, 'green' ); // electric    
          drawWave( xO, yO, zO, xN, yN, zN, 'yellow' ); // result
        }
        else { // ++electric --magnetic
          drawWave( xO, yO, 0, xN, yN, 0, 'blue' ); // magnetic
          drawWave( xO, yO, zO, xN, yN, zN, 'yellow' ); // result
          drawWave( xO, 0, zO, xN, 0, zN, 'green' ); // electric
        }
      }
      else { // --electric 
        if ( yA>0 ) { // --electric ++magnetic
          drawWave( xO, 0, zO, xN, 0, zN, 'green' ); // electric   
          drawWave( xO, yO, zO, xN, yN, zN, 'yellow' ); // result
          drawWave( xO, yO, 0, xN, yN, 0, 'blue' ); // magnetic
        }
        else { // --electric --magnetic
          drawWave( xO, yO, 0, xN, yN, 0, 'blue' ); // magnetic
          drawWave( xO, yO, zO, xN, yN, zN, 'yellow' ); // result
          drawWave( xO, 0, zO, xN, 0, zN, 'green' ); // electric
        }
      }
    }
 
    for( var i=0; i<balls.length; i++ ) {
        if ( !balls[i].drawnAlready && 
           ( ( fromX<0 && xW >= balls[i].xP ) || ( fromX>0 && xW <= balls[i].xP ) ) ) {
          balls[i].drawnAlready = true;
          drawPane( xN );
          ctx.globalAlpha = 1;
          drawBall( xN, yN,  0, 'blue' );
          drawBall( xN,  0, zN, 'green' );
          drawBall( xN, yN, zN, 'yellow' );
        }
    }
    
    // remember the old stuff
    xO = xN;
    yO = yN;
    zO = zN;
  }

  // draw the upper grid
  var yS = 1;
  var xS = 5;
  if ( cosAlpha > 0 ) yS = -1;
  if ( sinAlpha > 0 ) xS = -5;
  if ( showOuterGrid ) {
    // short side grid
    for( x = -5; x <= 5; x++ ) {
      drawGrid( x, -1,  1, x,  1, 1 ); // top horizontal short
      drawGrid( x, yS, -1, x, yS, 1 ); // vertical short
    }
    // long top grid
    drawGrid( -5,  0,  1, 5,  0,  1 ); // top middle
    drawGrid( -5, -1,  1, 5, -1,  1 ); // top side
    drawGrid( -5,  1,  1, 5,  1,  1 ); // top side
    // flipping long side grid
    drawGrid( -5,  yS,  0, 5,  yS,  0 ); // side middle
    drawGrid( -5,  yS, -1, 5,  yS, -1 ); // side bottom
    // missing "front" grid
    drawGrid( xS,  -1,  0, xS,   1,  0 ); // horizontal middle
    drawGrid( xS,   0,  1, xS,   0, -1 ); // vertical middle
    drawGrid( xS, -yS,  1, xS, -yS, -1 ); // vertical flipping 
    drawGrid( xS,  -1, -1, xS,   1, -1 ); // bottom
  }

  // draw a single ball
  function drawBall( xN, yN, zN, color ) {

    if ( !showBalls ) return;

    ctx.beginPath( );
    // new one
    var radius = 0.1;
    if ( shrinkBalls ) radius = radius * Math.sqrt( yN*yN + zN*zN );
    else radius = radius * blSi;
    var p7 = project( xN, yN, zN );
    ctx.arc( p7.x, p7.y, radius, 0, 2 * Math.PI );

    ctx.fillStyle = color;
    ctx.fill( );
  };
  
  // draw part of a wave
  function drawWave( xO, yO, zO, xN, yN, zN, color ) {

    if ( !showWaves ) return;
    
    ctx.beginPath( );
    // point zero
    var p0 = project( xO, 0, 0 );
    ctx.moveTo( p0.x, p0.y );
    // old point
    var p1 = project( xO, yO, zO );
    ctx.lineTo( p1.x, p1.y );
    // new one
    var p3 = project( xN, yN, zN );
    ctx.lineTo( p3.x, p3.y );
    // draw outline
    ctx.strokeStyle = color;   
    ctx.stroke( );
    
    if ( fillWaves ) {
      // back to the roots
      var p4 = project( xN, 0, 0 );
      ctx.lineTo( p4.x, p4.y );

      // fill it
      ctx.fillStyle = color;
      ctx.fill( );
    }
  };
  
  // draw a simple grid line
  function drawGrid( x0, y0, z0, x1, y1, z1 ) {
    ctx.globalAlpha = 0.4;
    ctx.strokeStyle = 'red';
    ctx.beginPath( );
    var p0 = project( x0*blSi, y0*blSi, z0*blSi );
    ctx.moveTo( p0.x, p0.y );
    var p1 = project( x1*blSi, y1*blSi, z1*blSi );
    ctx.lineTo( p1.x, p1.y );
    ctx.stroke( );
  };
  
  // draw part of a wave
  function drawPane( xN ) {

    if ( !showPane ) return;
    
    ctx.fillStyle = 'red';
    ctx.beginPath( );
    // points
    var p0 = project( xN, blSi, blSi );
    ctx.moveTo( p0.x, p0.y );
    var p1 = project( xN, blSi, -blSi );
    ctx.lineTo( p1.x, p1.y );
    var p3 = project( xN, -blSi, -blSi );
    ctx.lineTo( p3.x, p3.y );
    var p4 = project( xN, -blSi, blSi );
    ctx.lineTo( p4.x, p4.y );

    ctx.fill( );
  };
  
  // put it in perspective
  function project( x, y, z ) {
    return {
      x: width/2 + x*cosAlpha - y*sinAlpha,
      y: height/2 - ( x*sinAlpha + y*cosAlpha )*sinBeta - z*cosBeta
    }
  };
}

// restart the stuff
function resize( ) {
  window.cancelAnimationFrame( request );
  init( );
};

// sliding motion
var slideX;
function startSlide( x ) {
  slideX = x;
};

// slide it
function slideTo( x ) {
  var dx = x - slideX;
  slideX = x;
  slide( dx );
};

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
    downloadLink.download = "ElectromagneticWaveModified.html";
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
        alert ( 'Running in the SoloLearn app. Run me in your browser to make me fullscreen...' );
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
});