( function( angular ) {
  'use strict';
  /*
  * Applies the jQuery-based select2 to the selected element
  *
  * If a custom-rendering attribute is specified the default object structure is not used (id and text properties expected)
  * in favour of using the item itself. This is useful when used with input elements where full responsiblity is taken for querying and formatting results.
  *
  * <input type="hidden" ngyn-select2="options" ng-model="selection" multiple custom-rendering class="span11" ></input>
  */
  angular.module( 'ngynSelect2', [] ).directive( 'ngynSelect2', ['$parse', '$timeout', function( $parse, $timeout ) {
    return {
      require: '?ngModel',
      priority: '150', // must be higher priority than ngyn-select-key
      restrict: 'A',

      compile: function( originalElement ) {
        var placeholderText,
            placeholderOption = originalElement.find( 'option[value=""]' );

        if ( placeholderOption.length > 0 ) {
          placeholderText = placeholderOption.text();
          placeholderOption.text( '' );
        }

        return function link( scope, elm, attrs, ngModelController ) {
          var NG_OPTIONS_REGEXP = /^\s*([\s\S]+?)(?:\s+as\s+([\s\S]+?))?(?:\s+group\s+by\s+([\s\S]+?))?\s+for\s+(?:([\$\w][\$\w]*)|(?:\(\s*([\$\w][\$\w]*)\s*,\s*([\$\w][\$\w]*)\s*\)))\s+in\s+([\s\S]+?)(?:\s+track\s+by\s+([\s\S]+?))?$/;
          var optionsExp = attrs.ngOptions,
              match,
              valuesFn;
          if ( optionsExp ) {
            match = optionsExp.match( NG_OPTIONS_REGEXP );
            valuesFn = $parse( match[7] );
          }
          
          // keep class of the select2 in sync with the underlying select
          var oldClass = '';
          scope.$watch( function() {
            var container = elm.select2( 'container' );
            var newClass = elm.attr( 'class' );
            if ( newClass !== oldClass ) {
              angular.forEach( oldClass.split( ' ' ), function( c ) {
                container.removeClass( c );
              } );
              angular.forEach( newClass.split( ' ' ), function( c ) {
                container.addClass( c );
              } );
              oldClass = newClass;
            }
          } );

          var createDefaultResultParser = function() {
            var key = attrs.keyPath || 'id';
            var display = attrs.displayPath || 'text';
            var keyParser = $parse( key );
            var displayParser = $parse( display );
            return function( result ) {
              return {
                id: keyParser( result ),
                text: displayParser( result )
              };
            };
          };

          var parseResult = angular.isDefined( attrs.customRendering ) ?
            function( result ) { return result; } :
            createDefaultResultParser();

          var parseResults = function( originalValues ) {
            if ( !originalValues ) {
              return originalValues;
            }

            var values = angular.isArray( originalValues ) ? originalValues : [originalValues];

            var results = [];
            angular.forEach( values, function( r ) {
              results.push( parseResult( r ) );
            } );
            return angular.isArray( originalValues ) ? results : results[0];
          };

          attrs.$observe( 'disabled', function( value ) {
            elm.select2( 'enable', !value );
          } );

          if ( !elm.is( 'select' ) ) {

            /* Problem 3 */
            ngModelController.$parsers.push( function() {
              return elm.select2( 'data' );
            } );

            /* Problem 4 */
            ngModelController.$formatters.push( function( newval ) {
              elm.select2( 'data', parseResults( newval ) );
              return newval;
            } );

            /* Problem 2 */
            elm.on( 'change', function( e ) {
              scope.$apply( function() {
                ngModelController.$setViewValue( e.val );
              } );
            } );
          }

          // initialize the select2
          var options = {};

          if ( placeholderText ) {
            options.placeholder = placeholderText;
          }

          if ( elm.is( 'input' ) ) {
            options.multiple = angular.isDefined( attrs.multiple );
          } else {
            options.placeholderOption = function() {
              return elm.find('option[value="?"]'); 
            };
          }

          angular.extend( options, scope.$eval( attrs.ngynSelect2 ) );

          /* Problem 1 */
          /*
          * watch the model and the collection to ensure select2 is kept in sync with
          * the underlying select
          */

          if ( elm.is( 'select' ) ) {
            scope.$watch( attrs.ngModel, function() {
              elm.select2( 'val', elm.val() );
            } );

            if ( valuesFn ) {
              // watch the collection; re-evaluating it's reresentation and state every $digest
              scope.$watch( function() { return valuesFn( scope ); }, function( collection ) {
                if ( !collection || !collection.length ) {
                  return;
                }
                $timeout( function() {
                  elm.select2( 'val', elm.val() );
                } );
              }, true );
            }

          }

          // running in a $timeout yields significant performance improvements
          // we do however ensure the apply phase is skipped by setting the 3rd arg to false
          // this also incidentally avoids the dom being corrupted during linking
          $timeout( function() {
            elm.select2( options );
            if ( !elm.is( 'select' ) ) {
              elm.select2( 'data', parseResults( ngModelController.$modelValue ) );
            }
          }, 0, false );
        };
      }
    };
  }] );

} )( window.angular );

/* Problem descriptions */
/*
SELECT BASED
P1: When updating ng-model, select2 doesn't reflect the new value
S1a: Use a formatter to call elm.select2('val', elm.val()); (error prone and doesn't deal with collection changing)
S1b: every time we $digest, ensure the values are synced.

INPUT BASED
P2: When selecting an item manually, the value does not trigger an ng-model update
S2: Watch elm.change and trigger $setViewValue(elm.val())

P3: When selecting an item manually, the value is just an id
S3: Use a $parser to return elm.select2('data'), which is the value the control was initialized with

P4: When updating ng-model, select2 doesn't reflect the new value
S4: Use a formatter to call elm.select2('data', newModelValue);
    The id is plucked from data for use in val, but we need the full data for retrieval
    as it can't be mapped to an option as it is in a select

*/