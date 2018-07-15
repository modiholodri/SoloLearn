// Bonus Comparator - 2018-07-15 - Created by Modi
/******************************************************
Compare different Bonus codes side by side.
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
function getCode( language, title, codePageOnSoloLearn ) { 

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

// set the callback for the corresponding selection
function setCallback( actionElement, language, codePageOnSoloLearn ) { 
    $( actionElement ).on( 'click', function( ) { 
        getCode( language, $( actionElement ).text(), codePageOnSoloLearn );
    });
}

$( document ).ready( function( ) {
    // SameSame
    setCallback( '#load_C', 'c', 'https://code.sololearn.com/cct5i2KUthjd/#c' );
    setCallback( '#load_CPP', 'cpp', 'https://code.sololearn.com/cr15pyY8DCux/#cpp' );
    setCallback( '#load_CSharp', 'csharp', 'https://code.sololearn.com/cqk0aIT4O0f8/#cs' );
    setCallback( '#load_Java', 'java', 'https://code.sololearn.com/c72uJ0G7reUi/#java' );
    setCallback( '#load_JavaScript', 'javascript', 'https://code.sololearn.com/WFcyVtYDIwNK/#js' );
    setCallback( '#load_Python', 'python', 'https://code.sololearn.com/cn0nTmI5AGRw/#py' );
    setCallback( '#load_PHP', 'php', 'https://code.sololearn.com/wH5Q9WX2fGa8/#php' );
    setCallback( '#load_Ruby', 'ruby', 'https://code.sololearn.com/cy4kl3IGhMMR/#rb' );
    setCallback( '#load_Kotlin', 'kotlin', 'https://code.sololearn.com/cKdkltvkIGd4/#kt' );
    
    // Different
    setCallback( '#load_CppByCppSolder', 'cpp', 'https://code.sololearn.com/cYweLUlyFcAU/#cpp' );
    setCallback( '#load_PythonByJanMarkus', 'python', 'https://code.sololearn.com/cYxMMSKSL1SR/?ref=app#py' );
    setCallback( '#load_JavaScriptByMorpheus', 'javascript', 'https://code.sololearn.com/WWocT24lkGpR/#js' );
    
    // External
    setCallback( '#load_FortranByGordie', 'fortran', 'https://code.sololearn.com/cKrWdz5k0Ln0#c' );
    setCallback( '#load_SchemeByGordie', 'scheme', 'https://code.sololearn.com/c56cfDzQDb5Y/#rb' );
    
    // Code Copmarator
    setCallback( '#load_BonusComparatorAbout', 'markdown', 'https://code.sololearn.com/c328hWfi0vEk/#rb' );
    setCallback( '#load_BonusComparatorInstructions', 'markdown', 'https://code.sololearn.com/c52PstQJwx5Z/#rb' ); 
    setCallback( '#load_BonusComparatorHTML', 'html', 'https://code.sololearn.com/WfpY4zqBx9yk/#html' );
    setCallback( '#load_BonusComparatorCSS', 'css', 'https://code.sololearn.com/WfpY4zqBx9yk/?ref=app#css' );
    setCallback( '#load_BonusComparatorJS', 'javascript', 'https://code.sololearn.com/WfpY4zqBx9yk/?ref=app#js' );
    setCallback( '#load_BonusAbout', 'markdown', 'https://code.sololearn.com/cskbrkRpnfgr/#rb' );
    
    getCode( 'markdown', 'Short Instructions', 'https://code.sololearn.com/c52PstQJwx5Z/#rb' );
    $( '#showInCodeII' ).prop( 'checked', 'checked' );
    getCode( 'markdown', 'About Code Comparator', 'https://code.sololearn.com/c328hWfi0vEk/#rb' );
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