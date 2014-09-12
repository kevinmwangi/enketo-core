define( [ 'jquery', 'enketo-js/Widget', 'file-manager' ], function( $, Widget, fileManager ) {
    "use strict";

    var pluginName = 'filepicker';

    /**
     * FilePicker that works both offline and online. It abstracts the file storage/cache away
     * with the injected fileManager that has the following methods:
     *
     * - isSupported() : whether the file storage/cache method is supported on the browser
     * - init() : async initalization, returning promise
     * - getFileUrl(filename | file) : async return promise with the fileUrl to be used for previews
     * - getFiles(instanceId?) : async returns promise with files belonging to the specified instanceID
     *
     * The fileManager will publish the 'ready' event when it is ready as some file storage
     * may require user permissions.
     *
     * @constructor
     * @param {Element} element [description]
     * @param {(boolean|{touch: boolean, maxlength:number})} options options
     * @param {*=} e     event
     */

    function Filepicker( element, options, e ) {
        if ( e ) {
            e.stopPropagation();
            e.preventDefault();
        }
        this.namespace = pluginName;
        Widget.call( this, element, options );
        this._init();
    }

    // copy the prototype functions from the Widget super class
    Filepicker.prototype = Object.create( Widget.prototype );

    // ensure the constructor is the new one
    Filepicker.prototype.constructor = Filepicker;

    /**
     * initialize
     */
    Filepicker.prototype._init = function() {
        var $input = $( this.element ),
            existingFileName = $input.attr( 'data-loaded-file-name' ),
            that = this;

        this.mediaType = $input.attr( 'accept' );

        $input.parent().addClass( 'with-media clearfix' );

        this.$fakeInput = $input.after( '<div class="fake-input"></div>' );

        if ( existingFileName ) {
            this._showFileName( existingFileName, mediaType );
        }

        if ( !fileManager.isSupported() ) {
            this._showFeedback( 'File Uploads not supported in this browser.', 'warning' );
            return;
        }

        fileManager.init()
            .then( function() {
                that._changeListener();
                if ( existingFileName ) {
                    that._createPreview( fileManager.getFile( existingFileName ) );
                }
            } )
            .catch( function( error ) {
                that._showFeedback( error.message, 'error' );
            } );
        // TODO: show "waiting for approval" message?
    };

    Filepicker.prototype._getMaxSubmissionSize = function() {
        var maxSize = $( document ).data( 'maxSubmissionSize' );
        return maxSize || 5 * 1024 * 1024;
    };

    Filepicker.prototype._changeListener = function() {
        var that = this,
            $input = $( this.element );

        $input.on( 'change.passthrough.' + this.namespace, function( event ) {
            var prevFileName, file, $preview;

            if ( event.namespace === 'passthrough' ) {
                $input.trigger( 'change.file' );
                return false;
            }
            prevFileName = $input.attr( 'data-previous-file-name' );
            file = $input[ 0 ].files[ 0 ];

            $input.siblings( '.file-preview, .file-loaded' ).remove();

            fileManager.getFileUrl( file )
                .then( function( url ) {
                    $preview = that._createPreview( url, that.mediaType );
                    $input.attr( 'data-previous-file-name', file.name )
                        .removeAttr( 'data-loaded-file-name' );
                    //.siblings( '.file-loaded' ).remove();
                    $input.trigger( 'change.passthrough' ).after( $preview );
                } )
                .catch( function( error ) {
                    // TODO: empty the things

                    that._showFeedback( error.message, 'error' );
                } );
        } );
    };

    Filepicker.prototype._showFileName = function( fileName ) {
        this.$fakeInput.text( fileName );
    };

    Filepicker.prototype._showFeedback = function( message, status ) {
        if ( !this.$feedback || this.$feedback.length === 0 ) {
            this.$feedback = $( '<div class="file-feedsfback"></div>' ).insertAfter( this.$fakeInput );
        }
        // replace text and replace all existing classes with the new status class
        this.$feedback.text( message ).attr( 'class', status );
        console.debug( 'feedback element', this.$feedback[ 0 ] );
    };

    Filepicker.prototype._createPreview = function( url, mediaType ) {
        var $preview;

        switch ( mediaType ) {
            case 'image/*':
                $preview = $( '<img />' );
                break;
            case 'audio/*':
                $preview = $( '<audio controls="controls"/>' );
                break;
            case 'video/*':
                $preview = $( '<video controls="controls"/>' );
                break;
            default:
                $preview = $( '<span>No preview for this mediatype</span>' );
                break;
        }

        return $preview.addClass( 'file-preview' ).attr( 'src', url );
    };

    Filepicker.prototype.destroy = function( element ) {
        $( element )
        //data is not used elsewhere by enketo
        .removeData( this.namespace )
        //remove all the event handlers that used this.namespace as the namespace
        .off( '.' + this.namespace )
        //show the original element
        .show()
        //remove elements immediately after the target that have the widget class
        .next( '.widget' ).remove().end()
        //console.debug( this.namespace, 'destroy' );
        .siblings( '.file-feedback, .file-preview, .file-loaded' ).remove();
    };

    $.fn[ pluginName ] = function( options, event ) {

        options = options || {};

        return this.each( function() {
            var $this = $( this ),
                data = $this.data( pluginName );

            //only instantiate if options is an object (i.e. not a string) and if it doesn't exist already
            if ( !data && typeof options === 'object' ) {
                $this.data( pluginName, ( data = new Filepicker( this, options, event ) ) );
            }
            //only call method if widget was instantiated before
            else if ( data && typeof options == 'string' ) {
                //pass the element as a parameter as this is used in fix()
                data[ options ]( this );
            }
        } );
    };

} );
