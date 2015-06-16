requirejs.config( {
    baseUrl: "lib/enketo-core/lib",
    paths: {
        "enketo-js": "../src/js",
        "enketo-widget": "../src/widget",
        "enketo-config": "../config.json",
        "text": "text/text",
        "xpath": "xpath/build/xpathjs_javarosa",
        "file-manager": "../src/js/file-manager",
        "jquery": "bower-components/jquery/dist/jquery",
        "jquery-ui": "bower-components/jqueryui/jquery-ui.min",
        "jquery.ui.widget": "bower-components/jqueryui/jquery.ui.widget",
        "jquery.xpath": "jquery-xpath/jquery.xpath",
        "jquery.touchswipe": "jquery-touchswipe/jquery.touchSwipe",
        "leaflet": "leaflet/leaflet",
        "bootstrap-slider": "bootstrap-slider/js/bootstrap-slider",
        "q": "bower-components/q/q",
        "switchButton": "switchButton/jquery.switchButton"
    },
    shim: {
        "xpath": {
            exports: "XPathJS"
        },
        "bootstrap": {
            deps: [ "jquery" ],
            exports: "jQuery.fn.popover"
        },
        "widget/date/bootstrap3-datepicker/js/bootstrap-datepicker": {
            deps: [ "jquery" ],
            exports: "jQuery.fn.datepicker"
        },
        "widget/time/bootstrap3-timepicker/js/bootstrap-timepicker": {
            deps: [ "jquery" ],
            exports: "jQuery.fn.timepicker"
        },
        "Modernizr": {
            exports: "Modernizr"
        },
        "leaflet": {
            exports: "L"
        }
    }
} );

requirejs( [ 'jquery', 'Modernizr', 'enketo-js/Form', 'file-manager', 'jquery.ui.widget', 'switchButton' ],
    function( $, Modernizr, Form, fileManager ) {
        var loadErrors, form;

        //if querystring touch=true is added, override Modernizr
        if ( getURLParameter( 'touch' ) === 'true' ) {
            Modernizr.touch = true;
            $( 'html' ).addClass( 'touch' );
        }


        // check if HTML form is hardcoded or needs to be retrieved
        // if ( getURLParameter( 'xform' ) !== 'null' ) {
        //     $( '.guidance' ).remove();
        //     $.get( 'http://xslt-dev.enketo.org/?xform=' + getURLParameter( 'xform' ), function( data ) {
        //         var $data;
        //         //this replacement should move to XSLT after which the GET can just return 'xml' and $data = $(data)
        //         data = data.replace( /jr\:template=/gi, 'template=' );
        //         $data = $( $.parseXML( data ) );
        //         formStr = ( new XMLSerializer() ).serializeToString( $data.find( 'form:eq(0)' )[ 0 ] );
        //         modelStr = ( new XMLSerializer() ).serializeToString( $data.find( 'model:eq(0)' )[ 0 ] );
        //         $( '#validate-form' ).before( formStr );
        //         initializeForm();
        //     }, 'text' );
        // } else if ( $( 'form.or' ).length > 0 ) {
        //     $( '.guidance' ).remove();
        //     initializeForm();
        // }

        var $data;
        data = data.replace( /jr\:template=/gi, 'template=' );
        $data = $( $.parseXML( data ) );
        // $($data.find( 'form:eq(0)' )[0]).find("#form-title").remove();
        formStr = ( new XMLSerializer() ).serializeToString( $data.find( 'form:eq(0)' )[ 0 ] );
        modelStr = ( new XMLSerializer() ).serializeToString( $data.find( 'model:eq(0)' )[ 0 ] );
        //modelToEditStr = ( new XMLSerializer() ).serializeToString( $data.find( 'model:eq(0)' )[ 0 ] );
        $( '.paper' ).append( formStr );
        initializeForm();

        // validate handler for validate button
        $( '#validate-form' ).on( 'click', function() {
            form.validate();
            if ( !form.isValid() ) {
                alert( 'Form contains errors. Please see fields marked in red.' );
            } else {
                alert( 'Form is valid! (see XML record and media files in the console)' );
                var record = form.getDataStr();
                console.log( 'record:', form.getDataStr() );
                // fileManager.getFiles()
                //     .then( function( files ) {
                //         //console.log( 'media files:', files );
                //     } );
            }
        } );

        //initialize the form

        function initializeForm() {
            form = new Form( 'form.or:eq(0)', modelStr, modelToEditStr );
            //for debugging
            window.form = form;
            //initialize form and check for load errors
            loadErrors = form.init();
            if ( loadErrors.length > 0 ) {
                alert( 'loadErrors: ' + loadErrors.join( ', ' ) );
            }
        }

        //get query string parameter

        function getURLParameter( name ) {
            return decodeURI(
                ( RegExp( name + '=' + '(.+?)(&|$)' ).exec( location.search ) || [ , null ] )[ 1 ]
            );
        }

        var checked = true;
        var notchecked = false;

        $('#onOff').switchButton( {
            width:70,
            height:20,
            button_width: 35,
            on_label: 'EDIT ON',
            off_label: 'EDIT OFF',
            checked: false,
            'on_callback':editOn,
            'off_callback':editOff

        });

        function editOn(){
            console.log("It is checked");
            fnOpenNormalDialog();
            // var checked = document.getElementById("onOff").checked = true;
            // var notchecked = document.getElementById("onOff").checked = false;

            // if (checked) {
            //     console.log("It is checked")
            // }else{
            //     console.log("It is not checked")
            // }
        }
        function editOff(){
            console.log("It is not checked");
        }

        function fnOpenNormalDialog() {
            $("#dialog-confirm").html("Confirm Dialog Box");

            // Define the Dialog and its properties.
            $("#dialog-confirm").dialog({
                resizable: false,
                modal: true,
                title: "Modal",
                height: 250,
                width: 400,
                buttons: {
                    "Yes": function () {
                        $(this).dialog('close');
                        callback(true);
                    },
                        "No": function () {
                        $(this).dialog('close');
                        callback(false);
                    }
                }
            });
        }

        //$('#btnOpenDialog').click(fnOpenNormalDialog);

        function callback(value) {
            if (value) {
                alert("Confirmed");
            } else {
                alert("Rejected");
            }
        }


    } );
