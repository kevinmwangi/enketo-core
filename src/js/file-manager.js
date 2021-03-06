if ( typeof exports === 'object' && typeof exports.nodeName !== 'string' && typeof define !== 'function' ) {
    var define = function( factory ) {
        factory( require, exports, module );
    };
}
/**
 * Simple file manager with cross-browser support. That uses the FileReader
 * to create previews. Can be replaced with a more advanced version that
 * obtains files from storage.
 *
 * The replacement should support the same public methods and return the same
 * types.
 */

define( function( require, exports, module ) {
    'use strict';
    var Promise = require( 'lie' );
    var $ = require( 'jquery' );

    var supported = typeof FileReader !== 'undefined',
        notSupportedAdvisoryMsg = '';

    /**
     * Initialize the file manager .
     * @return {[type]} promise boolean or rejection with Error
     */
    function init() {
        if ( supported ) {
            return Promise.resolve( true );
        } else {
            return Promise.reject( new Error( 'FileReader not supported.' ) );
        }
    }

    /**
     * Whether filemanager is supported in browser
     * @return {Boolean}
     */
    function isSupported() {
        return supported;
    }

    /**
     * Whether the filemanager is waiting for user permissions
     * @return {Boolean} [description]
     */
    function isWaitingForPermissions() {
        return false;
    }

    /**
     * Obtains a url that can be used to show a preview of the file when used
     * as a src attribute.
     *
     * @param  {?string|Object} subject File or filename
     * @return {[type]}         promise url string or rejection with Error
     */
    function getFileUrl( subject ) {
        return new Promise( function( resolve, reject ) {
            var error, reader;

            if ( !subject ) {
                resolve( null );
            } else if ( typeof subject === 'string' ) {
                // TODO obtain from storage
            } else if ( typeof subject === 'object' ) {
                if ( _isTooLarge( subject ) ) {
                    error = new Error( 'File too large (max ' +
                        ( Math.round( ( _getMaxSize() * 100 ) / ( 1024 * 1024 ) ) / 100 ) +
                        ' Mb)' );
                    reject( error );
                } else {
                    reader = new FileReader();
                    reader.onload = function( e ) {
                        resolve( e.target.result );
                    };
                    reader.onerror = function( e ) {
                        reject( error );
                    };
                    reader.readAsDataURL( subject );
                }
            } else {
                reject( new Error( 'Unknown error occurred' ) );
            }
        } );
    }

    /**
     * Obtain files currently stored in file input elements of open record
     * @return {[File]} array of files
     */
    function getCurrentFiles() {
        var file,
            files = [];

        // first get any files inside file input elements
        $( 'form.or input[type="file"]' ).each( function() {
            file = this.files[ 0 ];
            if ( file ) {
                files.push( file );
            }
        } );
        return files;
    }

    /**
     * Placeholder function to check if file size is acceptable. 
     * 
     * @param  {Blob}  file [description]
     * @return {Boolean}      [description]
     */
    function _isTooLarge( file ) {
        return false;
    }

    module.exports = {
        isSupported: isSupported,
        notSupportedAdvisoryMsg: notSupportedAdvisoryMsg,
        isWaitingForPermissions: isWaitingForPermissions,
        init: init,
        getFileUrl: getFileUrl,
        getCurrentFiles: getCurrentFiles
    };
} );
