// Comparator Engine - 2018-07-15 - Created by Modi
/******************************************************
Compare different SoloLearn codes side by side.
*******************************************************/

function showWhere( ) {
    if ( $( '#showInCodeI' ).prop( 'checked' ) ) return 'codeI';
    if ( $( '#showInCodeII' ).prop( 'checked' ) ) return 'codeII';
}

// load the code in element
function showCodeIn( showIn, language, title, codePageOnSoloLearn, sourceCode ) { 
    $( '#' + showIn + 'Title' ).text( title );
    $( '#' + showIn + 'Title' ).attr( 'href', codePageOnSoloLearn );
    $( '#' + showIn + 'UpDown' ).attr( 'href', codePageOnSoloLearn );
    $( '#' + showIn + 'Code' ).text( sourceCode );
    $( '#' + showIn + 'Code' ).removeClass( $( '#' + showIn + 'Code' ).attr( 'class' ) ).addClass( 'line-numbers language-' + language );
}
    
// load the code in the corresponding selection    
function getCode( language, codePageOnSoloLearn, title ) { 

    var whereToShow = showWhere(); // remember for later when successfully loaded
    $( '#' + whereToShow + 'Title' ).text( 'Loading...' );
    $( '#' + whereToShow + 'Code' ).text( 'Loading, please wait...' );

    // handle JavaScript special case
    var codeLocation = language == 'javascript' ? 'input.saveJsCode' : 'input.saveSourceCode'; 
    codeLocation = language == 'css' ? 'input.saveCssCode' : codeLocation;
    
    $.ajax({ 
        type: 'GET',
        url: 'https://cors-anywhere.herokuapp.com/' + codePageOnSoloLearn,
        dataType : 'html',
        success: function( data, status, xhr ) { // succeeded with the request
            if ( status == 'success' ) {
                var sourceCode = $( data ).find( codeLocation ).attr( 'value' ); 
                showCodeIn( whereToShow, language, title, codePageOnSoloLearn, sourceCode );
            }
            Prism.highlightAll();
        },
        error: function( error ) {  // log any error
            $.ajax( { // try it the other way...
                type: 'GET',
                url: codePageOnSoloLearn,
                dataType : 'html',
                success: function( data, status, xhr ) { // succeeded with the request
                    if ( status == 'success' ) {
                        var sourceCode = $( data ).find( codeLocation ).attr( 'value' ); 
                        showCodeIn( whereToShow, language, title, codePageOnSoloLearn, sourceCode );
                    }
                    Prism.highlightAll( );
                },
                error: function( error ) {  // log any error
                    showCodeIn( whereToShow, 'csharp', 'Failed...', codePageOnSoloLearn, 
                        '# Had problems loading the code...\n' + 
                        '# Click on the title and try to open the code in SoloLearn.' );
                    Prism.highlightAll( );
                }
            });
        }
    });
}

// synch the code areas heights
var lastCodeIAreaHeight = $( '#codeIArea' ).height( );
function checkForChanges( ) {
    if ( $( '#codeIArea' ).height( ) != lastCodeIAreaHeight ) {
        lastCodeIAreaHeight = $( '#codeIArea' ).height( ); 
        $( '#codeIIArea' ).height( lastCodeIAreaHeight );
    }
    setTimeout( checkForChanges, 100 );
}

// set the callback for each object
function setCallbacks(  ) { 
    var iCallbackNumber = 0;
    $( '#codeICode' ).text( 'Setting callbacks...' );
    $( '.SLCode' ).each( function ( ) {
        $( '#codeICode' ).text( 'Setting callbacks ' + iCallbackNumber++  );
        $( this ).on( 'click', function( ) { 
            getCode($( this ).attr( 'codeLanguage' ), 
                    $( this ).attr( 'codePage' ), 
                    $( this ).text() ); // the title
        });
    });
}

$( document ).ready( function( ) {
    setCallbacks( ); 

    getCode( 'markdown', 'https://code.sololearn.com/ctCS6Qqa1sXS/#rb', 'Short Instructions' );
    $( '#showInCodeII' ).prop( 'checked', 'checked' );
    getCode( 'markdown', 'https://code.sololearn.com/csrf6fwFdJq2/#rb', 'About Comparator Engine' );
    $( '#showInCodeI' ).prop( 'checked', 'checked' );

    // set the tooltips in the titles
    var soloLearnLink = 'Go to the SoloLearn code page where you can up vote the code or leave a comment.';
    var codeAreaSelector = 'Selecte the active code area where the next code chosen in the menu will be shown.'
    $( '#codeITitle').attr( 'title', soloLearnLink )
    $( '#codeIUpDown').attr( 'title', soloLearnLink )
    $( '#codeISelector').attr( 'title', codeAreaSelector )
    $( '#codeIITitle').attr( 'title', soloLearnLink )
    $( '#codeIIUpDown').attr( 'title', soloLearnLink )
    $( '#codeIISelector').attr( 'title', codeAreaSelector )
    
    checkForChanges();
});