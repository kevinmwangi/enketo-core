/**
 * Simple file manager with cross-browser support. That uses the FileReader
 * to create previews. Can be replaced with a more advanced version that
 * obtains files from storage.
 *
 * The replacement should support the same public methods and return the same
 * types.
 */

define( [ "q" ], function( Q ) {
    "use strict";

    var maxSize,
        supported = typeof FileReader === 'function';

    function init() {
        var deferred = Q.defer();

        if ( supported ) {
            deferred.resolve( true );
        } else {
            deferred.reject( new Error( 'FileReader not supported.' ) );
        }

        return deferred.promise;
    }

    function isSupported() {
        return supported;
    }

    function getFileUrl( subject ) {
        var error, reader,
            deferred = Q.defer();

        if ( typeof subject === 'string' ) {
            // TODO obtain from storage
        } else if ( typeof subject === 'object' ) {
            if ( _isTooLarge( subject ) ) {
                error = new Error( 'File too large (max ' +
                    ( Math.round( ( _getMaxSize() * 100 ) / ( 1024 * 1024 ) ) / 100 ) +
                    ' Mb)' );
                deferred.reject( error );
            } else {
                reader = new FileReader();
                reader.onload = function( e ) {
                    deferred.resolve( e.target.result );
                };
                reader.onerror = function( e ) {
                    deferred.reject( error );
                };
                reader.readAsDataURL( subject );
            }
        }
        return deferred.promise;
    }

    function getFiles() {
        var file,
            deferred = Q.defer(),
            files = [];

        $( 'form.or input[type="file"]' ).each( function() {
            file = this.files[ 0 ];
            if ( file ) {
                files.push( file );
            }
        } );
        deferred.resolve( files );
        return deferred.promise;
    }

    function _isTooLarge( file ) {
        return file && file.size > _getMaxSize();
    }

    function _getMaxSize() {
        if ( !maxSize ) {
            maxSize = $( document ).data( 'maxSubmissionSize' ) || 5 * 1024 * 1024;
        }
        return maxSize;
    }

    return {
        isSupported: isSupported,
        init: init,
        getFileUrl: getFileUrl,
        getFiles: getFiles
    };
} );
