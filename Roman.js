// Roman Comparator - 2018-07-08 - Created by Modi
/******************************************************
Compare different Roman Numerals codes side by side.
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
    // Python
    setCallback( '#load_PythonByZaidPatel', 'python', 'https://code.sololearn.com/c6uru8wGf6Sc/?ref=app#py' );
    setCallback( '#load_PythonByDragos', 'python', 'https://code.sololearn.com/c8mDxhpsv843/?ref=app#py' );
    setCallback( '#load_PythonByAndreyVostokov', 'python', 'https://code.sololearn.com/cDtAj50rwUit/?ref=app#py' );
    setCallback( '#load_PythonByMertYazıcı', 'python', 'https://code.sololearn.com/cJ87veojh4Je/?ref=app#py' );
    setCallback( '#load_PythonByZoetic_Zeel', 'python', 'https://code.sololearn.com/cpey3DWlWkIj/?ref=app#py' );
    setCallback( '#load_PythonByCepagrave', 'python', 'https://code.sololearn.com/cH1yhYmQ109e/?ref=app#py' );
    setCallback( '#load_PythonByKartikeySahu', 'python', 'https://code.sololearn.com/cLOi9wpPOJjF/?ref=app#py' );
    setCallback( '#load_PythonByWilliamSellier', 'python', 'https://code.sololearn.com/c0P38c3NB1KU/?ref=app#py' );
    setCallback( '#load_PythonByErikUmble', 'python', 'https://code.sololearn.com/cD5862LD4S3V/?ref=app#py' );
    setCallback( '#load_PythonBySubhrajyotyRoy', 'python', 'https://code.sololearn.com/c9uig3GZuT1M/?ref=app#py' );
    setCallback( '#load_PythonByLarryKarani', 'python', 'https://code.sololearn.com/crm09Spaaqha/?ref=app#py' );
    setCallback( '#load_PythonByMiso', 'python', 'https://code.sololearn.com/ce58O1847HSP/?ref=app#py' );
    setCallback( '#load_PythonByRuvenGrinberg', 'python', 'https://code.sololearn.com/cIFgw6XEsoBF/?ref=app#py' );
    setCallback( '#load_PythonByDomHarris', 'python', 'https://code.sololearn.com/cyzzNUqP9yJP/?ref=app#py' );
    setCallback( '#load_PythonByPasinduPerera', 'python', 'https://code.sololearn.com/cV7ZTbVIPDzC/?ref=app#py' );
    setCallback( '#load_PythonByHardikAhi', 'python', 'https://code.sololearn.com/c8LVXYVR3G0o/?ref=app#py' );
    setCallback( '#load_PythonByPaulJacobs', 'python', 'https://code.sololearn.com/c6CST5DZd7EP/?ref=app#py' );
    setCallback( '#load_PythonByEthanBoyd', 'python', 'https://code.sololearn.com/c9h2LTXWMiY0/?ref=app#py' );
    setCallback( '#load_PythonByXianCollier', 'python', 'https://code.sololearn.com/c4Jb0ZdNbLmp/?ref=app#py' );
    setCallback( '#load_PythonByLuisMartin', 'python', 'https://code.sololearn.com/cagdCjSPRR47/?ref=app#py' );
    setCallback( '#load_PythonBySKarfunkel', 'python', 'https://code.sololearn.com/czbn833pbq4L/?ref=app#py' );
    setCallback( '#load_PythonBySarahCheril', 'python', 'https://code.sololearn.com/c4C6T882kEf4/?ref=app#py' );
    setCallback( '#load_PythonByPeri', 'python', 'https://code.sololearn.com/cC3AA78RgZJK/?ref=app#py' );
    setCallback( '#load_PythonByDario', 'python', 'https://code.sololearn.com/cUmf0HkZC1oW/?ref=app#py' );
    setCallback( '#load_PythonByAndyPandy', 'python', 'https://code.sololearn.com/cYffQG4ZARy6/?ref=app#py' );
    setCallback( '#load_PythonByValnyx', 'python', 'https://code.sololearn.com/crQ0H1zo1QrW/?ref=app#py' );
    setCallback( '#load_PythonByMaurizioPrandini', 'python', 'https://code.sololearn.com/cyYr6yUwrbHW/?ref=app#py' );
    setCallback( '#load_PythonByOmniShift', 'python', 'https://code.sololearn.com/c0g4hl8K0cB1/?ref=app#py' );
    setCallback( '#load_PythonByYYama', 'python', 'https://code.sololearn.com/cvnq93yzELuL/?ref=app#py' );
    setCallback( '#load_PythonByRiyaThapar', 'python', 'https://code.sololearn.com/c6ncNRG5Fzlr/?ref=app#py' );
    setCallback( '#load_PythonByCodeMaster101', 'python', 'https://code.sololearn.com/c6MMNgJdMGIP/?ref=app#py' );
    setCallback( '#load_PythonByLeonardoVinicius', 'python', 'https://code.sololearn.com/c4M1wgT1KMsd/?ref=app#py' );
    setCallback( '#load_PythonByAfeefThasleem', 'python', 'https://code.sololearn.com/czuyFyV81ZhG/?ref=app#py' );
    setCallback( '#load_PythonByRam', 'python', 'https://code.sololearn.com/cCTzM2KP6wd7/?ref=app#py' );
    setCallback( '#load_PythonByWilliamSalunsonGalas', 'python', 'https://code.sololearn.com/c1rnUv0pq9b1/?ref=app#py' );
    setCallback( '#load_PythonByIshiraLiyanage', 'python', 'https://code.sololearn.com/cRRyH99QYz64/?ref=app#py' );
    setCallback( '#load_PythonBySimone', 'python', 'https://code.sololearn.com/cTVDvZ2Bcwcl/?ref=app#py' );
    setCallback( '#load_PythonByAndreyKondakov', 'python', 'https://code.sololearn.com/cDfOelOOqFY9/?ref=app#py' );
    setCallback( '#load_PythonByTom2003611', 'python', 'https://code.sololearn.com/cUAOAD7go9Nz/?ref=app#py' );
    setCallback( '#load_PythonByLenoxNdubi', 'python', 'https://code.sololearn.com/cH11p3Z6kc6t/?ref=app#py' );
    setCallback( '#load_PythonByGaryPurkett', 'python', 'https://code.sololearn.com/c820sw2VM4nJ/?ref=app#py' );
    setCallback( '#load_PythonByBenjaminSmylie', 'python', 'https://code.sololearn.com/cU6g5aJwo4mF/?ref=app#py' );
    setCallback( '#load_PythonByLaurensJan', 'python', 'https://code.sololearn.com/cC3I5ILCqOQT/?ref=app#py' );
    setCallback( '#load_PythonByNathanLewis', 'python', 'https://code.sololearn.com/cl7B0zGakvx5/?ref=app#py' );
    setCallback( '#load_PythonBySuvansh', 'python', 'https://code.sololearn.com/cjn8klRR8KKN/?ref=app#py' );
    setCallback( '#load_PythonByJayantChoudhary', 'python', 'https://code.sololearn.com/ciE6rH4ABMqV/?ref=app#py' );
    setCallback( '#load_PythonByFilipeBanzoli', 'python', 'https://code.sololearn.com/cO2bNf5d3xN2/?ref=app#py' );
    setCallback( '#load_PythonByMahmoudNasr', 'python', 'https://code.sololearn.com/cAWmdb834JKg/?ref=app#py' );
    setCallback( '#load_PythonByJazHamilton', 'python', 'https://code.sololearn.com/cKkAqJSXnPyI/?ref=app#py' );
    setCallback( '#load_PythonByJoaoMarcos', 'python', 'https://code.sololearn.com/cL16UBF68LRt/?ref=app#py' );
    setCallback( '#load_PythonByKILLaBYTE', 'python', 'https://code.sololearn.com/cds7d1XDEAFX/?ref=app#py' );
    setCallback( '#load_PythonByThameemJabirKJ', 'python', 'https://code.sololearn.com/cVHJwlO323o4/?ref=app#py' );
    setCallback( '#load_PythonByLorenzo', 'python', 'https://code.sololearn.com/cg0uGn7bzAa4/?ref=app#py' );
    setCallback( '#load_PythonByPaulDSouza', 'python', 'https://code.sololearn.com/cvF6GPckJH9U/?ref=app#py' );
    setCallback( '#load_PythonByStrange', 'python', 'https://code.sololearn.com/cCTS59BQZNvV/?ref=app#py' );
    setCallback( '#load_PythonByUlissesCruz', 'python', 'https://code.sololearn.com/cu5nVb4p88Es/?ref=app#py' );
    setCallback( '#load_PythonByTaiDucPham', 'python', 'https://code.sololearn.com/c25YXWbGQHvC/?ref=app#py' );
    setCallback( '#load_PythonByXavier', 'python', 'https://code.sololearn.com/cWarFBG7Xus2/?ref=app#py' );
    setCallback( '#load_PythonByRuss', 'python', 'https://code.sololearn.com/cFPtC0VYwYiQ/?ref=app#py' );
    setCallback( '#load_PythonByLorenzoParisi', 'python', 'https://code.sololearn.com/cnOQOzYm12w3/?ref=app#py' );
    setCallback( '#load_PythonByCorradoBattagliese', 'python', 'https://code.sololearn.com/crwZ3G1eXecO/?ref=app#py' );

    // C++
    setCallback( '#load_CPPBySzaky', 'cpp', 'https://code.sololearn.com/cmF1q55Fj8rU/?ref=app#cpp' );
    setCallback( '#load_CPPBySwim', 'cpp', 'https://code.sololearn.com/c1T38DE98C37/?ref=app#cpp' );
    setCallback( '#load_CPPByAntonioBernardini', 'cpp', 'https://code.sololearn.com/ca8z112fv2VB/?ref=app#cpp' );
    setCallback( '#load_CPPByBBR', 'cpp', 'https://code.sololearn.com/cMl7Zsxozu2y/?ref=app#cpp' );
    setCallback( '#load_CPPByVivekAgrawal', 'cpp', 'https://code.sololearn.com/cFQee4tl8N2O/?ref=app#cpp' );
    setCallback( '#load_CPPByIngoMaarman', 'cpp', 'https://code.sololearn.com/c9qfO6Tk7ABr/?ref=app#cpp' );
    setCallback( '#load_CPPByAJTurner', 'cpp', 'https://code.sololearn.com/cMDVYv5Szjwu/?ref=app#cpp' );
    setCallback( '#load_CPPByRishuKumar', 'cpp', 'https://code.sololearn.com/clFSosi4sY57/?ref=app#cpp' );
    setCallback( '#load_CPPBySachinSingh', 'cpp', 'https://code.sololearn.com/cGb72HCev9di/?ref=app#cpp' );
    setCallback( '#load_CPPByDmitriyGrigoriev', 'cpp', 'https://code.sololearn.com/csf51uG8wTMf/?ref=app#cpp' );
    setCallback( '#load_CPPBySpudo', 'cpp', 'https://code.sololearn.com/cS8i36467GIb/?ref=app#cpp' );
    setCallback( '#load_CPPByCezaryJaniak', 'cpp', 'https://code.sololearn.com/cwT13herqzOv/?ref=app#cpp' );
    setCallback( '#load_CPPBySuraj', 'cpp', 'https://code.sololearn.com/cNS8rZhQMPk5/?ref=app#cpp' );
    setCallback( '#load_CPPByCoderPP', 'cpp', 'https://code.sololearn.com/cdY9Sd3hGaWP/?ref=app#cpp' );
    setCallback( '#load_CPPBySalehAlsayed', 'cpp', 'https://code.sololearn.com/ca4q1DE7Jnlh/?ref=app#cpp' );
    setCallback( '#load_CPPByOrHy3', 'cpp', 'https://code.sololearn.com/cN93TB34LlwO/?ref=app#cpp' );
    setCallback( '#load_PythonByload_CPPByPawelZurawski', 'python', 'https://code.sololearn.com/c95KgqkAGPRm/?ref=app#cpp' );
    setCallback( '#load_CPPByIvanVladimirov', 'cpp', 'https://code.sololearn.com/cxXZ638435Qc/?ref=app#cpp' );
    setCallback( '#load_CPPByRoman', 'cpp', 'https://code.sololearn.com/cUWLdE12wjJL/?ref=app#cpp' );
    setCallback( '#load_CPPByVari93', 'cpp', 'https://code.sololearn.com/cNqt2RJ156J8/?ref=app#cpp' );
    setCallback( '#load_CPPByMichaelFedorov', 'cpp', 'https://code.sololearn.com/cSiTu6pP2TfP/?ref=app#cpp' );
    setCallback( '#load_CPPByShubhamSingh', 'cpp', 'https://code.sololearn.com/cEt3G6qlx9S4/?ref=app#cpp' );
    setCallback( '#load_CPPByShahin', 'cpp', 'https://code.sololearn.com/c0ioan47w4F1/?ref=app#cpp' );
    setCallback( '#load_CPPByZidanZidan', 'cpp', 'https://code.sololearn.com/cm5KsDbT98WR/?ref=app#cpp' );
    setCallback( '#load_CPPByDavidQiu', 'cpp', 'https://code.sololearn.com/cdRJQ94g1CSr/?ref=app#cpp' );
    setCallback( '#load_CPPByPerlaSmaniotto', 'cpp', 'https://code.sololearn.com/cPXDTXOx0MbX/?ref=app#cpp' );
    setCallback( '#load_CPPByNguy', 'cpp', 'https://code.sololearn.com/c8tB0UsTx13B/?ref=app#cpp' );
    setCallback( '#load_CPPByGabrielCervantesHurtado', 'cpp', 'https://code.sololearn.com/ciHSXFIWfwdh/?ref=app#cpp' );
    setCallback( '#load_CPPByShreyJain', 'cpp', 'https://code.sololearn.com/cLcBf4QZ7tsD/?ref=app#cpp' );

    // C#
    setCallback( '#load_CSharpByPaulCaron', 'csharp', 'https://code.sololearn.com/craUnxnmrv84/?ref=app#cs' );
    setCallback( '#load_CSharpByPawełSidorkiewicz', 'csharp', 'https://code.sololearn.com/ctrnJm8Q4DSt/?ref=app#cs' );
    setCallback( '#load_CSharpByNadeKrest', 'csharp', 'https://code.sololearn.com/c7v2CBCIm3n2/?ref=app#cs' );
    setCallback( '#load_CSharpByJacobGandemo', 'csharp', 'https://code.sololearn.com/cc5WB5p35UMX/?ref=app#cs' );
    setCallback( '#load_CSharpByFranciscoCasas', 'csharp', 'https://code.sololearn.com/cYBnTfDOk0oB/?ref=app#cs' );
    setCallback( '#load_CSharpByKuldeepTiwari', 'csharp', 'https://code.sololearn.com/cL4w50GGKq81/?ref=app#cs' );
    setCallback( '#load_CSharpBySilvioDuka', 'csharp', 'https://code.sololearn.com/cpjPtNE8bAtl/?ref=app#cs' );
    setCallback( '#load_CSharpBySamiel', 'csharp', 'https://code.sololearn.com/cXE9BgR1s42e/?ref=app#cs' );
    setCallback( '#load_CSharpBySelC', 'csharp', 'https://code.sololearn.com/ch8Dn1GAbQzq/?ref=app#cs' );
    setCallback( '#load_CSharpByWojciechPowch', 'csharp', 'https://code.sololearn.com/cm4mMG0qT229/?ref=app#cs' );
    setCallback( '#load_CSharpByPaoloTorregroza', 'csharp', 'https://code.sololearn.com/cYk7HdNUteQ1/?ref=app#cs' );
    setCallback( '#load_CSharpByArchweb', 'csharp', 'https://code.sololearn.com/cqOqV5Tx8qEb/?ref=app#cs' );
    setCallback( '#load_CSharpByBob', 'csharp', 'https://code.sololearn.com/cc4fW1jZ665K/?ref=app' );

    // Java
    setCallback( '#load_JavaByLukArToDo', 'java', 'https://code.sololearn.com/c95Y62c4p1dV/?ref=app#java' );
    setCallback( '#load_JavaByRahulJaiswal', 'java', 'https://code.sololearn.com/cXu3J9p0yNns/?ref=app#java' );
    setCallback( '#load_JavaByXnycs', 'java', 'https://code.sololearn.com/csqtILZZKaAR/?ref=app#java' );
    setCallback( '#load_JavaByMichal', 'java', 'https://code.sololearn.com/cu1g5Wqp8fNs/?ref=app#java' );
    setCallback( '#load_JavaByFaithfulMind', 'java', 'https://code.sololearn.com/c4P3CrqSLLNu/?ref=app#java' );
    setCallback( '#load_JavaByIHeb04', 'java', 'https://code.sololearn.com/cHB0tou4Kl9Q/?ref=app#java' );
    setCallback( '#load_JavaByMaheshkumarPalled', 'java', 'https://code.sololearn.com/cXsCEU1fik5A/?ref=app#java' );
    setCallback( '#load_JavaByKintungLuna', 'java', 'https://code.sololearn.com/c1jU0818NXLm/?ref=app#java' );
    setCallback( '#load_JavaByJayme', 'java', 'https://code.sololearn.com/c2Sx95Fx0qW3/?ref=app#java' );
    setCallback( '#load_JavaByJohnMcDonald', 'java', 'https://code.sololearn.com/c4BWws9AB3Uq/?ref=app#java' );
    setCallback( '#load_JavaByNightmare', 'java', 'https://code.sololearn.com/c2W815JN6JkU/?ref=app#java' );
    setCallback( '#load_JavaBySkyChedkurfeldFu', 'java', 'https://code.sololearn.com/c5Gl5F96reZ4/?ref=app#java' );
    setCallback( '#load_JavaByDavidVerduzco', 'java', 'https://code.sololearn.com/c3h6jBHsb7Zp/?ref=app#java' );
    setCallback( '#load_JavaByMichele', 'java', 'https://code.sololearn.com/cHuPkCUR07Ff/?ref=app#java' );
    setCallback( '#load_JavaBSatyaJitPradhan', 'java', 'https://code.sololearn.com/c17OVQH0xMjH/?ref=app' );
    setCallback( '#load_JavaByAmal', 'java', 'https://code.sololearn.com/cH3xxksMjUA1/?ref=app#java' );
    setCallback( '#load_JavaByDanielEakin', 'java', 'https://code.sololearn.com/cI4H08hyY01j/?ref=app#java' );
    setCallback( '#load_JavaByImamPratama', 'java', 'https://code.sololearn.com/cV7kSot0AN00/?ref=app#java' );
    setCallback( '#load_JavaByAntonioAvella', 'java', 'https://code.sololearn.com/c1468Vq6F7c1/?ref=app' );
    setCallback( '#load_JavaByKyriakosKyrkis', 'java', 'https://code.sololearn.com/cs9OhaqIrUbT/?ref=app#java' );
    setCallback( '#load_JavaByDaZzle', 'java', 'https://code.sololearn.com/ci9Ur3DqCR1v/?ref=app#java' );
    setCallback( '#load_JavaByMarcoBongini', 'java', 'https://code.sololearn.com/cLUXeRYd75ES/?ref=app#java' );
    setCallback( '#load_JavaByPiterDorohov', 'java', 'https://code.sololearn.com/cQxSB3Kl3awT/?ref=app#java' );

    // C
    setCallback( '#load_CByRanjithKatravula', 'c', 'https://code.sololearn.com/cK8TOqtZu5z8/?ref=app#c' );
    setCallback( '#load_CByJaredBird', 'c', 'https://code.sololearn.com/cjXyKFF3wD4P/?ref=app#c' );
    setCallback( '#load_CByGudduKumar', 'c', 'https://code.sololearn.com/cgTJIbET5XU3/?ref=app#c' );
    setCallback( '#load_CByJonasR', 'c', 'https://code.sololearn.com/ci60JXLH8sDS/?ref=app#c' );
    setCallback( '#load_CByGaligool', 'c', 'https://code.sololearn.com/c18uoTQ2L2F7/?ref=app#c' );

    // Ruby
    setCallback( '#load_RubyByKasi', 'ruby', 'https://code.sololearn.com/c2E37k10vS2y/?ref=app#rb' );
    setCallback( '#load_RubyByJeremy', 'ruby', 'https://code.sololearn.com/cG88J2edHwyH/?ref=app#rb' );

    // Roman Copmarator
    setCallback( '#load_CodeComparatorAbout', 'markdown', 'https://code.sololearn.com/c1cFz5lYwHpm/?ref=app' );
    setCallback( '#load_CodeComparatorInstructions', 'markdown', 'https://code.sololearn.com/c6HDkB1zS0e9/?ref=app' ); 
    
    getCode( 'markdown', 'Short Instructions', 'https://code.sololearn.com/c6HDkB1zS0e9/?ref=app' );
    $( '#showInCodeII' ).prop( 'checked', 'checked' );
    getCode( 'markdown', 'About Code Comparator', 'https://code.sololearn.com/c1cFz5lYwHpm/?ref=app' );
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