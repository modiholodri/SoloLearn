// Created by dρlυѕρlυѕ

$( document ).ready( function() {
  setTimeout( function() { 
    $( '.menu_button' ).click( function() {
      $( this ).toggleClass( 'show' );
      $( '.menu_sections' ).toggleClass( 'show' );
    });
  }, 400);

  $( '.link' ).click( function() {   
    setTimeout( function() { 
      $( '.menu_sections' ).removeClass( 'show' );
      $( '.menu_button' ).removeClass( 'show' );
    }, 500);
  });
});

//smooth scrolling
$( document ).on( 'click', 'a', function( event ) {
  event.preventDefault( );
  $( 'html, body' ).animate( {
    scrollTop: $( $.attr( this, 'href' ) ).offset( ).top
  }, 500);
});