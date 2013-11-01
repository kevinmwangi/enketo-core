if ( typeof define !== 'function' ) {
    var define = require( 'amdefine' )( module );
}

define( [ "js/Form" ], function( Form ) {

    var loadForm = function( filename, editStr ) {
        var strings = mockForms1[ filename ];
        return new Form( strings.html_form, strings.xml_model, editStr );
    };

    describe( "Output functionality ", function( ) {
        // These tests were orginally meant for modilabs/enketo issue #141. However, they passed when they were
        // failing in the enketo client itself (same form). It appeared the issue was untestable (except manually)
        // since the issue was resolved by updating outputs with a one millisecond delay (!).
        // Nevertheless, these tests can be useful.
        var form = new Form( formStr2, dataStr2 );

        form.init( );

        it( "tested upon initialization: node random__", function( ) {
            expect( form.getFormO( ).$.find( '[data-value="/random/random__"]' ).text( ).length ).toEqual( 17 );
        } );

        it( "tested upon initialization: node uuid__", function( ) {
            expect( form.getFormO( ).$.find( '[data-value="/random/uuid__"]' ).text( ).length ).toEqual( 36 );
        } );
    } );

    describe( "Output functionality within repeats", function( ) {
        var $o = [ ],
            form = loadForm( 'outputs_in_repeats.xml' );
        form.init( );
        form.getFormO( ).$.find( 'button.repeat' ).click( );

        for ( var i = 0; i < 8; i++ ) {
            $o.push( form.getFormO( ).$.find( '.jr-output' ).eq( i ) );
        }

        form.getFormO( ).$.find( '[name="/outputs_in_repeats/rep/name"]' ).eq( 0 ).val( 'Martijn' ).trigger( 'change' );
        form.getFormO( ).$.find( '[name="/outputs_in_repeats/rep/name"]' ).eq( 1 ).val( 'Beth' ).trigger( 'change' );
        form.getFormO( ).$.find( '[data-name="/outputs_in_repeats/rep/animal"][value="elephant"]' ).eq( 0 ).prop( 'checked', true ).trigger( 'change' );
        form.getFormO( ).$.find( '[data-name="/outputs_in_repeats/rep/animal"][value="rabbit"]' ).eq( 1 ).prop( 'checked', true ).trigger( 'change' );

        it( 'shows correct value when referring to repeated node', function( ) {
            expect( $o[ 0 ].text( ) ).toEqual( 'Martijn' );
            expect( $o[ 1 ].text( ) ).toEqual( 'Martijn' );
            expect( $o[ 2 ].text( ) ).toEqual( 'elephant' );
            expect( $o[ 3 ].text( ) ).toEqual( 'Martijn' );
            expect( $o[ 4 ].text( ) ).toEqual( 'Beth' );
            expect( $o[ 5 ].text( ) ).toEqual( 'Beth' );
            expect( $o[ 6 ].text( ) ).toEqual( 'rabbit' );
            expect( $o[ 7 ].text( ) ).toEqual( 'Beth' );
        } );
    } );

    describe( "Preload and MetaData functionality", function( ) {
        var form, t;

        it( "ignores a calculate binding on [ROOT]/meta/instanceID", function( ) {
            form = new Form( formStr2, dataStr2 );
            form.init( );
            expect( form.getDataO( ).node( '/random/meta/instanceID' ).getVal( )[ 0 ].length ).toEqual( 41 );
        } );

        it( "generates an instanceID on meta/instanceID WITHOUT preload binding", function( ) {
            form = new Form( formStr2, dataStr2 );
            form.init( );
            form.getFormO( ).$.find( 'fieldset#jr-preload-items' ).remove( );
            expect( form.getFormO( ).$.find( 'fieldset#jr-preload-items' ).length ).toEqual( 0 );
            expect( form.getDataO( ).node( '/random/meta/instanceID' ).getVal( )[ 0 ].length ).toEqual( 41 );
        } );

        it( "generates an instanceID WITH preload binding", function( ) {
            form = new Form( formStr3, dataStr2 );
            form.init( );
            expect( form.getFormO( ).$
                .find( 'fieldset#jr-preload-items input[name="/random/meta/instanceID"][data-preload="instance"]' ).length )
                .toEqual( 1 );
            expect( form.getDataO( ).node( '/random/meta/instanceID' ).getVal( )[ 0 ].length ).toEqual( 41 );
        } );

        it( "does not generate a new instanceID if one is already present", function( ) {
            form = new Form( formStr3, dataStr3 );
            form.init( );
            expect( form.getDataO( ).node( '/random/meta/instanceID' ).getVal( )[ 0 ] ).toEqual( 'c13fe058-3349-4736-9645-8723d2806c8b' );
        } );

        it( "generates a timeStart on meta/timeStart WITHOUT preload binding", function( ) {
            form = new Form( formStr2, dataStr2 );
            form.init( );
            form.getFormO( ).$.find( 'fieldset#jr-preload-items' ).remove( );
            expect( form.getFormO( ).$.find( 'fieldset#jr-preload-items' ).length ).toEqual( 0 );
            expect( form.getDataO( ).node( '/random/meta/timeStart' ).getVal( )[ 0 ].length > 10 ).toBe( true );
        } );

        it( "generates a timeEnd on init and updates this after a beforesave event WITHOUT preload binding", function( ) {
            var timeEnd, timeEndNew;
            //jasmine.Clock.useMock();
            form = new Form( formStr2, dataStr2 );
            form.init( );
            form.getFormO( ).$.find( 'fieldset#jr-preload-items' ).remove( );
            expect( form.getFormO( ).$.find( 'fieldset#jr-preload-items' ).length ).toEqual( 0 );
            timeEnd = form.getDataO( ).node( '/random/meta/timeEnd' ).getVal( )[ 0 ];
            expect( timeEnd.length > 10 ).toBe( true );
            //setTimeout(function(){
            form.getFormO( ).$.trigger( 'beforesave' );
            timeEndNew = form.getDataO( ).node( '/random/meta/timeEnd' ).getVal( )[ 0 ];
            timeEnd = new Date( timeEnd );
            timeEndNew = new Date( timeEndNew );
            //for some reason the setTimeout function doesn't work
            expect( timeEnd - 1 < timeEndNew ).toBe( true );
            //}, 1001);
            //jasmine.Clock.tick(1001);
            //TODO FIX THIS PROPERLY
        } );

        function testPreloadExistingValue( node ) {
            it( "obtains unchanged preload value of item (WITH preload binding): " + node.selector + "", function( ) {
                form = new Form( formStr5, dataStr5a );
                form.init( );
                expect( form.getDataO( ).node( node.selector ).getVal( )[ 0 ] ).toEqual( node.result );
            } );
        }

        function testPreloadNonExistingValue( node ) {
            it( "has populated previously empty preload item (WITH preload binding): " + node.selector + "", function( ) {
                form = new Form( formStr5, dataStr5b );
                form.init( );
                expect( form.getDataO( ).node( node.selector ).getVal( )[ 0 ].length > 0 ).toBe( true );
            } );
        }

        t = [
            [ '/widgets/start_time', '2012-10-30T08:44:57.000-06:00' ],
            [ '/widgets/date_today', '2012-10-30' ],
            [ '/widgets/deviceid', 'some value' ],
            [ '/widgets/subscriberid', 'some value' ],
            [ '/widgets/my_simid', '2332' ],
            [ '/widgets/my_phonenumber', '234234324' ],
            [ '/widgets/application', 'some context' ],
            [ '/widgets/patient', 'this one' ],
            [ '/widgets/user', 'John Doe' ],
            [ '/widgets/uid', 'John Doe' ],
            //['/widgets/browser_name', 'fake'],
            //['/widgets/browser_version', 'xx'],
            //['/widgets/os_name', 'fake'],
            //['/widgets/os_version', 'xx'],
            [ '/widgets/meta/instanceID', 'uuid:56c19c6c-08e6-490f-a783-e7f3db788ba8' ]
        ];

        for ( i = 0; i < t.length; i++ ) {
            testPreloadExistingValue( {
                selector: t[ i ][ 0 ],
                result: t[ i ][ 1 ]
            } );
            testPreloadNonExistingValue( {
                selector: t[ i ][ 0 ]
            } );
        }
        testPreloadExistingValue( {
            selector: '/widgets/unknown',
            result: 'some value'
        } );
        testPreloadNonExistingValue( {
            selector: '/widgets/end_time'
        } );
    } );

    describe( "Loading instance values into html input fields functionality", function( ) {
        var form;

        it( 'correctly populates input fields of non-repeat node names in the instance', function( ) {
            form = loadForm( 'thedata.xml' ); //new Form(formStr1, dataStr1);
            form.init( );
            expect( form.getFormO( ).$.find( '[name="/thedata/nodeB"]' ).val( ) ).toEqual( 'b' );
            expect( form.getFormO( ).$.find( '[name="/thedata/repeatGroup/nodeC"]' ).eq( 2 ).val( ) ).toEqual( 'c3' );
            expect( form.getFormO( ).$.find( '[name="/thedata/nodeX"]' ).val( ) ).toEqual( undefined );
        } );

        it( 'correctly populates input field even if the instance node name is not unique and occurs at multiple levels', function( ) {
            form = new Form( formStr4, dataStr4 );
            form.init( );
            expect( form.getFormO( ).$.find( '[name="/nodename_bug/hh/hh"]' ).val( ) ).toEqual( 'hi' );
        } );

    } );

    describe( "Loading instance-to-edit functionality", function( ) {
        var form, loadErrors;

        describe( 'when a deprecatedID node is not present in the form format', function( ) {
            form = loadForm( 'thedata.xml', dataEditStr1 ); //new Form(formStr1, dataStr1, dataEditStr1);
            form.init( );

            it( "adds a deprecatedID node", function( ) {
                expect( form.getDataO( ).node( '* > meta > deprecatedID' ).get( ).length ).toEqual( 1 );
            } );

            //this is an important test even though it may not seem to be...
            it( "includes the deprecatedID in the string to be submitted", function( ) {
                expect( form.getDataO( ).getStr( ).indexOf( '<deprecatedID>' ) ).not.toEqual( -1 );
            } );

            it( "gives the new deprecatedID node the old value of the instanceID node of the instance-to-edit", function( ) {
                expect( form.getDataO( ).node( '*>meta>deprecatedID' ).getVal( )[ 0 ] ).toEqual( '7c990ed9-8aab-42ba-84f5-bf23277154ad' );
            } );

            it( "gives the instanceID node a new value", function( ) {
                expect( form.getDataO( ).node( '*>meta>instanceID' ).getVal( )[ 0 ].length ).toEqual( 41 );
                expect( form.getDataO( ).node( '*>meta>instanceID' ).getVal( )[ 0 ] ).not.toEqual( '7c990ed9-8aab-42ba-84f5-bf23277154ad' );
            } );

            it( "adds data from the instance-to-edit to the form instance", function( ) {
                expect( form.getDataO( ).node( '/thedata/nodeA' ).getVal( )[ 0 ] ).toEqual( '2012-02-05T15:34:00.000-04:00' );
                expect( form.getDataO( ).node( '/thedata/repeatGroup/nodeC', 0 ).getVal( )[ 0 ] ).toEqual( 'some data one' );
                expect( form.getDataO( ).node( '/thedata/repeatGroup/nodeC', 4 ).getVal( )[ 0 ] ).toEqual( 'some data five' );
            } );

        } );

        describe( 'when instanceID and deprecatedID nodes are already present in the form format', function( ) {
            form = loadForm( 'thedata.xml', dataEditStr1 ); //new Form(formStr1, dataEditStr1, dataEditStr1);
            form.init( );

            it( "does not NOT add another instanceID node", function( ) {
                expect( form.getDataO( ).node( '*>meta>instanceID' ).get( ).length ).toEqual( 1 );
            } );

            it( "does not NOT add another deprecatedID node", function( ) {
                expect( form.getDataO( ).node( '*>meta>deprecatedID' ).get( ).length ).toEqual( 1 );
            } );

            it( "gives the deprecatedID node the old value of the instanceID node of the instance-to-edit", function( ) {
                expect( form.getDataO( ).node( '*>meta>deprecatedID' ).getVal( )[ 0 ] ).toEqual( '7c990ed9-8aab-42ba-84f5-bf23277154ad' );
            } );

            it( "gives the instanceID node a new value", function( ) {
                expect( form.getDataO( ).node( '*>meta>instanceID' ).getVal( )[ 0 ].length ).toEqual( 41 );
                expect( form.getDataO( ).node( '*>meta>instanceID' ).getVal( )[ 0 ] ).not.toEqual( '7c990ed9-8aab-42ba-84f5-bf23277154ad' );
            } );

            it( "adds data from the instance-to-edit to the form instance", function( ) {
                expect( form.getDataO( ).node( '/thedata/nodeA' ).getVal( )[ 0 ] ).toEqual( '2012-02-05T15:34:00.000-04:00' );
                expect( form.getDataO( ).node( '/thedata/repeatGroup/nodeC', 0 ).getVal( )[ 0 ] ).toEqual( 'some data one' );
            } );
        } );

        describe( 'returns load errors upon initialization', function( ) {
            it( 'when the instance-to-edit contains nodes that are not present in the default instance', function( ) {
                var dataEditStr1a = dataEditStr1.replace( /thedata/g, 'thedata_updated' );
                form = loadForm( 'thedata.xml', dataEditStr1a ); //new Form(formStr1, dataStr1, dataEditStr1a);
                loadErrors = form.init( );
                console.log( 'loadErrors: ', loadErrors );
                expect( loadErrors.length ).toEqual( 11 );
            } );

            it( 'when an instance-to-edit is provided with double instanceID nodes', function( ) {
                var dataEditStr1a = dataEditStr1.replace( '</thedata>', '<meta><instanceID>uuid:3b35ac780c10468d8be7d8c44f3b17df</instanceID></meta></thedata>' );
                //first check it does not return erors when single instanceID node is present
                form = loadForm( 'thedata.xml', dataEditStr1 ); //new Form(formStr1, dataStr1, dataEditStr1);
                loadErrors = form.init( );
                expect( loadErrors.length ).toEqual( 0 );
                //then with the incorrect instance
                form = loadForm( 'thedata.xml', dataEditStr1a ); //new Form(formStr1, dataStr1, dataEditStr1a);
                loadErrors = form.init( );
                expect( loadErrors.length ).toEqual( 1 );
                expect( loadErrors[ 0 ] ).toEqual( "Found duplicate meta node (instanceID)!" );
            } );
        } );
    } );

    describe( 'repeat functionality', function( ) {
        var form, timerCallback;

        //turn jQuery animations off
        jQuery.fx.off = true;

        describe( 'cloning', function( ) {
            beforeEach( function( ) {
                form = loadForm( 'thedata.xml' ); //new Form(formStr1, dataStr1);
                form.init( );
            } );

            it( "removes the correct instance and HTML node when the '-' button is clicked (issue 170)", function( ) {
                var repeatSelector = '.jr-repeat[name="/thedata/repeatGroup"]',
                    nodePath = '/thedata/repeatGroup/nodeC',
                    nodeSelector = 'input[name="' + nodePath + '"]',
                    formH = form.getFormO( ),
                    data = form.getDataO( ),
                    index = 2;

                expect( formH.$.find( repeatSelector ).eq( index ).length ).toEqual( 1 );
                expect( formH.$.find( repeatSelector ).eq( index ).find( 'button.remove' ).length ).toEqual( 1 );
                expect( formH.$.find( nodeSelector ).eq( index ).val( ) ).toEqual( 'c3' );
                expect( data.node( nodePath, index ).getVal( )[ 0 ] ).toEqual( 'c3' );

                formH.$.find( repeatSelector ).eq( index ).find( 'button.remove' ).click( );
                expect( data.node( nodePath, index ).getVal( )[ 0 ] ).toEqual( undefined );
                //check if it removed the correct data node
                expect( data.node( nodePath, index - 1 ).getVal( )[ 0 ] ).toEqual( 'c2' );
                //check if it removed the correct html node
                expect( formH.$.find( repeatSelector ).eq( index ).length ).toEqual( 0 );
                expect( formH.$.find( nodeSelector ).eq( index - 1 ).val( ) ).toEqual( 'c2' );
            } );

            it( "marks cloned invalid fields as valid", function( ) {
                var repeatSelector = '.jr-repeat[name="/thedata/repeatGroup"]',
                    nodeSelector = 'input[name="/thedata/repeatGroup/nodeC"]',
                    formH = form.getFormO( ),
                    $node3 = formH.$.find( nodeSelector ).eq( 2 ),
                    $node4;

                formH.setInvalid( $node3 );

                expect( formH.$.find( repeatSelector ).length ).toEqual( 3 );
                expect( $node3.parent( ).hasClass( 'invalid-constraint' ) ).toBe( true );
                expect( formH.$.find( nodeSelector ).eq( 3 ).length ).toEqual( 0 );

                formH.$.find( repeatSelector ).eq( 2 ).find( 'button.repeat' ).click( );

                $node4 = formH.$.find( nodeSelector ).eq( 2 );
                expect( formH.$.find( repeatSelector ).length ).toEqual( 4 );
                expect( $node4.length ).toEqual( 1 );
                /*****************************************************************************************/
                //expect($node4.parent().hasClass('invalid-constraint')).toBe(false); TODO: FIX THIS TEST
            } );
        } );

        it( "clones nested repeats if they are present in the instance upon initialization (issue #359) ", function( ) {
            //note that this form contains multiple repeats in the instance
            form = loadForm( 'nested_repeats.xml' );
            form.init( );
            var formH = form.getFormO( ),
                model = form.getDataO( ),
                $1stLevelTargetRepeat = formH.$.find( '.jr-repeat[name="/nested_repeats/kids/kids_details"]' ).eq( 1 ),
                $2ndLevelTargetRepeats = $1stLevelTargetRepeat.find( '.jr-repeat[name="/nested_repeats/kids/kids_details/immunization_info"]' );

            expect( $1stLevelTargetRepeat.length ).toEqual( 1 );
            expect( $2ndLevelTargetRepeats.length ).toEqual( 3 );
        } );

        //doesn't work in bloody Travis. STFU Travis!
        xit( "doesn't duplicate date widgets in a cloned repeat", function( ) {
            form = loadForm( 'nested_repeats.xml' );
            form.init( );
            var formH = form.getFormO( ),
                model = form.getDataO( ),
                $dates = formH.$.find( '[name="/nested_repeats/kids/kids_details/immunization_info/date"]' );

            expect( $dates.length ).toEqual( 5 );
            expect( $dates.parent( ).find( '.widget.date' ).length ).toEqual( 5 );
        } );
    } );

    describe( 'calculations', function( ) {
        console.log( 'starting caclultations test' );
        var formH, dataO,
            form = loadForm( 'calcs_in_repeats.xml' );
        form.init( );
        formH = form.getFormO( );
        dataO = form.getDataO( );
        it( 'also work inside repeats', function( ) {
            formH.$.find( 'button.repeat' ).click( );
            formH.$.find( '[name="/calcs_in_repeats/rep1/num1"]:eq(0)' ).val( '10' ).trigger( 'change' );
            formH.$.find( '[name="/calcs_in_repeats/rep1/num1"]:eq(1)' ).val( '20' ).trigger( 'change' );
            console.log( 'model: ', dataO.getStr( ) );
            expect( dataO.node( '/calcs_in_repeats/rep1/num1', 0 ).getVal( )[ 0 ] ).toEqual( '10' );
            expect( dataO.node( '/calcs_in_repeats/rep1/num1', 1 ).getVal( )[ 0 ] ).toEqual( '20' );
            expect( dataO.node( '/calcs_in_repeats/rep1/calc3', 0 ).getVal( )[ 0 ] ).toEqual( '200' );
            expect( dataO.node( '/calcs_in_repeats/rep1/calc3', 1 ).getVal( )[ 0 ] ).toEqual( '400' );
            console.log( 'finished calc test' );
        } );

    } );


    describe( 'branching functionality', function( ) {
        var form;

        beforeEach( function( ) {
            //turn jQuery animations off
            jQuery.fx.off = true;
        } );

        it( "hides irrelevant branches upon initialization", function( ) {
            form = new Form( formStr6, dataStr6 );
            form.init( );
            expect( form.getFormO( ).$.find( '[name="/data/group"]' ).hasClass( 'disabled' ) ).toBe( true );
            expect( form.getFormO( ).$.find( '[name="/data/nodeC"]' ).parents( '.disabled' ).length ).toEqual( 1 );
        } );

        it( "reveals a group branch when the relevant condition is met", function( ) {
            form = new Form( formStr6, dataStr6 );
            form.init( );
            //first check incorrect value that does not meet relevant condition
            form.getFormO( ).$.find( '[name="/data/nodeA"]' ).val( 'no' ).trigger( 'change' );
            expect( form.getFormO( ).$.find( '[name="/data/group"]' ).hasClass( 'disabled' ) ).toBe( true );
            //then check value that does meet relevant condition
            form.getFormO( ).$.find( '[name="/data/nodeA"]' ).val( 'yes' ).trigger( 'change' );
            expect( form.getFormO( ).$.find( '[name="/data/group"]' ).hasClass( 'disabled' ) ).toBe( false );
        } );

        it( "reveals a question when the relevant condition is met", function( ) {
            form = new Form( formStr6, dataStr6 );
            form.init( );
            //first check incorrect value that does not meet relevant condition
            form.getFormO( ).$.find( '[name="/data/group/nodeB"]' ).val( 3 ).trigger( 'change' );
            expect( form.getFormO( ).$.find( '[name="/data/nodeC"]' ).parents( '.disabled' ).length ).toEqual( 1 );
            //then check value that does meet relevant condition
            form.getFormO( ).$.find( '[name="/data/group/nodeB"]' ).val( 2 ).trigger( 'change' );
            expect( form.getFormO( ).$.find( '[name="/data/nodeC"]' ).parents( '.disabled' ).length ).toEqual( 0 );
        } );

        /*
            Issue 208 was a combination of two issues:
            1. branch logic wasn't evaluated on repeated radiobuttons (only on the original) in branch.update()
            2. position[i] wasn't properly injected in makeBugCompiant() if the context node was a radio button or checkbox
        */
        it( 'a) evaluates relevant logic on a repeated radio-button-question and b) injects the position correctly (issue 208)', function( ) {
            var repeatSelector = 'fieldset.jr-repeat[name="/issue208/rep"]';
            //form = new Form(formStr7, dataStr7);
            form = loadForm( 'issue208.xml' );
            form.init( );

            form.getFormO( ).$.find( repeatSelector ).eq( 0 ).find( 'button.repeat' ).click( );
            expect( form.getFormO( ).$.find( repeatSelector ).length ).toEqual( 2 );
            //check if initial state of 2nd question in 2nd repeat is disabled
            expect( form.getFormO( ).$.find( repeatSelector ).eq( 1 )
                .find( '[data-name="/issue208/rep/nodeB"]' ).closest( '.restoring-sanity-to-legends' )
                .hasClass( 'disabled' ) ).toBe( true );
            //select 'yes' in first question of 2nd repeat
            form.getDataO( ).node( '/issue208/rep/nodeA', 1 ).setVal( 'yes', null, 'string' );
            //doublecheck if new value was set
            expect( form.getDataO( ).node( '/issue208/rep/nodeA', 1 ).getVal( )[ 0 ] ).toEqual( 'yes' );
            //check if 2nd question in 2nd repeat is now enabled
            expect( form.getFormO( ).$.find( repeatSelector ).eq( 1 )
                .find( '[data-name="/issue208/rep/nodeB"]' ).closest( '.restoring-sanity-to-legends' ).hasClass( 'disabled' ) ).toBe( false );

        } );

        describe( 'when used with calculated items', function( ) {
            form = loadForm( 'calcs.xml' );
            form.init( );
            var $node = form.getFormO( ).$.find( '[name="/calcs/cond1"]' );
            var dataO = form.getDataO( );

            it( 'evaluates a calculated item only when it becomes relevant', function( ) {
                //node without relevant attribute:
                expect( dataO.node( '/calcs/calc2' ).getVal( )[ 0 ] ).toEqual( '12' );
                //node that is irrelevant
                expect( dataO.node( '/calcs/calc1' ).getVal( )[ 0 ] ).toEqual( '' );
                $node.val( 'yes' ).trigger( 'change' );
                //node that has become relevant
                expect( dataO.node( '/calcs/calc1' ).getVal( )[ 0 ] ).toEqual( '3' );
            } );

            it( 'empties an already calculated item once it becomes irrelevant', function( ) {
                $node.val( 'yes' ).trigger( 'change' );
                expect( dataO.node( '/calcs/calc1' ).getVal( )[ 0 ] ).toEqual( '3' );
                $node.val( 'no' ).trigger( 'change' );
                expect( dataO.node( '/calcs/calc1' ).getVal( )[ 0 ] ).toEqual( '' );
            } );
        } );

        //for some reason form.init() causes a declaration exception "Cannot read property 'style' of undefined"
        //this may be a phantomjs issue, so I gave up trying to fix it.
        xdescribe( 'inside repeats when multiple repeats are present upon loading (issue #507)', function( ) {
            form = loadForm( 'multiple_repeats_relevant.xml' );
            form.init( );
            var $relNodes = form.getFormO( ).$.find( '[name="/multiple_repeats_relevant/rep/skipq"]' ).parent( '.jr-branch' );
            it( 'correctly evaluates the relevant logic of each question inside all repeats', function( ) {
                expect( $relNodes.length ).toEqual( 2 );
                //check if both questions with 'relevant' attributes in the 2 repeats are disabled
                expect( $relNodes.eq( 0 ).hasClass( 'disabled' ) ).toBe( true );
                expect( $relNodes.eq( 1 ).hasClass( 'disabled' ) ).toBe( true );
            } );
        } );
    } );

    describe( 'Required field validation', function( ) {
        var form, $numberInput, $branch;

        beforeEach( function( ) {
            jQuery.fx.off = true; //turn jQuery animations off
            form = new Form( formStr6, dataStr6 );
            form.init( );
            $numberInput = form.getFormO( ).$.find( '[name="/data/group/nodeB"]' );
            $numberLabel = form.getFormO( ).input.getWrapNodes( $numberInput );
        } );

        //this fails in phantomJS...
        xit( "validates a DISABLED and required number field without a value", function( ) {
            $numberInput.val( '' ).trigger( 'change' );
            expect( $numberLabel.length ).toEqual( 1 );
            expect( $numberInput.val( ).length ).toEqual( 0 );
            expect( $numberLabel.parents( '.jr-group' ).prop( 'disabled' ) ).toBe( true );
            expect( $numberLabel.hasClass( 'invalid-required' ) ).toBe( false );
        } );

        //see issue #144
        it( "validates an enabled and required number field with value 0 and 1", function( ) {
            form.getFormO( ).$.find( '[name="/data/nodeA"]' ).val( 'yes' ).trigger( 'change' );
            expect( $numberLabel.length ).toEqual( 1 );
            $numberInput.val( 0 ).trigger( 'change' ).trigger( 'validate' );
            expect( $numberLabel.hasClass( 'invalid-required' ) ).toBe( false );
            $numberInput.val( 1 ).trigger( 'change' ).trigger( 'validate' );
            expect( $numberLabel.hasClass( 'invalid-required' ) ).toBe( false );
        } );

        it( "invalidates an enabled and required number field without a value", function( ) {
            form.getFormO( ).$.find( '[name="/data/nodeA"]' ).val( 'yes' ).trigger( 'change' );
            $numberInput.val( '' ).trigger( 'change' ).trigger( 'validate' );
            expect( $numberLabel.hasClass( 'invalid-required' ) ).toBe( true );
        } );

        it( "invalidates an enabled and required textarea that contains only a newline character or other whitespace characters", function( ) {
            form = loadForm( 'thedata.xml' ); //new Form(formStr1, dataStr1);
            form.init( );
            var $textarea = form.getFormO( ).$.find( '[name="/thedata/nodeF"]' );
            $textarea.val( '\n' ).trigger( 'change' ).trigger( 'validate' );
            expect( $textarea.length ).toEqual( 1 );
            expect( $textarea.parent( 'label' ).hasClass( 'invalid-required' ) ).toBe( true );
            $textarea.val( '  \n  \n\r \t ' ).trigger( 'change' ).trigger( 'validate' );
            expect( $textarea.parent( 'label' ).hasClass( 'invalid-required' ) ).toBe( true );
        } );
    } );

    //TODO widgets are not loaded asynchronously, this is better moved to a separate widget test
    xdescribe( 'Readonly items', function( ) {
        it( 'preserve their default value', function( ) {
            var form = loadForm( 'readonly.xml' );
            form.init( );
            expect( form.getFormO( ).$.find( '[name="/readonly/a"] .note-value' ).text( ) ).toEqual( 'martijn' );
        } );
    } );

    describe( 'Itemset functionality', function( ) {
        var form;

        describe( 'in a cascading select using itext for all labels', function( ) {
            var $items1Radio, $items2Radio, $items3Radio, $items1Select, $items2Select, $items3Select, formHTMLO,
                sel1Radio = ':not(.itemset-template) > input:radio[data-name="/new_cascading_selections/group1/country"]',
                sel2Radio = ':not(.itemset-template) > input:radio[data-name="/new_cascading_selections/group1/city"]',
                sel3Radio = ':not(.itemset-template) > input:radio[data-name="/new_cascading_selections/group1/neighborhood"]',
                sel1Select = 'select[name="/new_cascading_selections/group2/country2"]',
                sel2Select = 'select[name="/new_cascading_selections/group2/city2"]',
                sel3Select = 'select[name="/new_cascading_selections/group2/neighborhood2"]';

            beforeEach( function( ) {
                jQuery.fx.off = true; //turn jQuery animations off
                form = loadForm( 'new_cascading_selections.xml' );
                form.init( );

                formHTMLO = form.getFormO( );
                spyOn( formHTMLO, 'itemsetUpdate' ).andCallThrough( );

                $items1Radio = function( ) {
                    return form.getFormO( ).$.find( sel1Radio );
                };
                $items2Radio = function( ) {
                    return form.getFormO( ).$.find( sel2Radio );
                };
                $items3Radio = function( ) {
                    return form.getFormO( ).$.find( sel3Radio );
                };
                $items1Select = function( ) {
                    return form.getFormO( ).$.find( sel1Select + ' > option:not(.itemset-template)' );
                };
                $items2Select = function( ) {
                    return form.getFormO( ).$.find( sel2Select + ' > option:not(.itemset-template)' );
                };
                $items3Select = function( ) {
                    return form.getFormO( ).$.find( sel3Select + ' > option:not(.itemset-template)' );
                };
            } );

            it( 'level 1: with <input type="radio"> elements has the expected amount of options', function( ) {
                expect( $items1Radio( ).length ).toEqual( 2 );
                expect( $items1Radio( ).siblings( ).text( ) ).toEqual( 'NederlandThe NetherlandsVerenigde StatenUnited States' );
                expect( $items2Radio( ).length ).toEqual( 0 );
                expect( $items3Radio( ).length ).toEqual( 0 );
            } );

            it( 'level 2: with <input type="radio"> elements has the expected amount of options', function( ) {
                //select first option in cascade
                runs( function( ) {
                    form.getFormO( ).$.find( sel1Radio + '[value="nl"]' ).prop( 'checked', true ).trigger( 'change' );
                } );

                waitsFor( function( ) {
                    return formHTMLO.itemsetUpdate.mostRecentCall.args[ 0 ] === 'country';
                }, 'itemsetUpdate not called!', 1000 );

                runs( function( ) {
                    expect( $items1Radio( ).length ).toEqual( 2 );
                    expect( $items2Radio( ).length ).toEqual( 3 );
                    expect( $items2Radio( ).siblings( ).text( ) ).toEqual( 'AmsterdamAmsterdamRotterdamRotterdamDrontenDronten' );
                    expect( $items3Radio( ).length ).toEqual( 0 );
                } );
            } );

            it( 'level 3: with <input type="radio"> elements has the expected amount of options', function( ) {
                //select first option
                runs( function( ) {
                    form.getFormO( ).$.find( sel1Radio + '[value="nl"]' ).attr( 'checked', true ).trigger( 'change' );
                } );

                waitsFor( function( ) {
                    return formHTMLO.itemsetUpdate.mostRecentCall.args[ 0 ] === 'country';
                }, 'itemsetUpdate not called!', 1000 );

                //select second option
                runs( function( ) {
                    form.getFormO( ).$.find( sel2Radio + '[value="ams"]' ).attr( 'checked', true ).trigger( 'change' );
                } );

                waitsFor( function( ) {
                    return formHTMLO.itemsetUpdate.mostRecentCall.args[ 0 ] === 'city';
                }, 'itemsetUpdate not called!', 1000 );

                runs( function( ) {
                    expect( $items1Radio( ).length ).toEqual( 2 );
                    expect( $items2Radio( ).length ).toEqual( 3 );
                    expect( $items3Radio( ).length ).toEqual( 2 );
                    expect( $items3Radio( ).siblings( ).text( ) ).toEqual( 'WesterparkWesterparkDe DamDam' );
                } );

                //select other first option to change itemset
                runs( function( ) {
                    form.getFormO( ).$.find( sel1Radio + '[value="nl"]' ).attr( 'checked', false );
                    form.getFormO( ).$.find( sel1Radio + '[value="usa"]' ).attr( 'checked', true ).trigger( 'change' );
                } );

                waitsFor( function( ) {
                    return formHTMLO.itemsetUpdate.mostRecentCall.args[ 0 ] === 'city';
                }, 'itemsetUpdate not called!', 1000 );

                runs( function( ) {
                    expect( $items1Radio( ).length ).toEqual( 2 );
                    expect( $items2Radio( ).length ).toEqual( 3 );
                    expect( $items2Radio( ).siblings( ).text( ) ).toEqual( 'DenverDenverNieuw AmsterdamNew York CityDe EngelenLos Angeles' );
                    expect( $items3Radio( ).length ).toEqual( 0 );
                } );
            } );

            it( 'level 1: with <select> <option> elements has the expected amount of options', function( ) {
                expect( $items1Select( ).length ).toEqual( 2 );
                expect( $items1Select( ).eq( 0 ).attr( 'value' ) ).toEqual( 'nl' );
                expect( $items1Select( ).eq( 1 ).attr( 'value' ) ).toEqual( 'usa' );
                expect( $items2Select( ).length ).toEqual( 0 );
            } );

            it( 'level 2: with <select> <option> elements has the expected amount of options', function( ) {
                //select first option in cascade
                runs( function( ) {
                    form.getFormO( ).$.find( sel1Select ).val( "nl" ).trigger( 'change' );
                } );

                waitsFor( function( ) {
                    return formHTMLO.itemsetUpdate.mostRecentCall.args[ 0 ] === 'country2';
                }, 'itemsetUpdate not called!', 1000 );

                runs( function( ) {
                    expect( $items1Select( ).length ).toEqual( 2 );
                    expect( $items2Select( ).length ).toEqual( 3 );
                    expect( $items2Select( ).eq( 0 ).attr( 'value' ) ).toEqual( 'ams' );
                    expect( $items2Select( ).eq( 2 ).attr( 'value' ) ).toEqual( 'dro' );
                    expect( $items3Select( ).length ).toEqual( 0 );
                } );
            } );

            it( 'level 3: with <select> <option> elements has the expected amount of options', function( ) {
                //select first option in cascade
                runs( function( ) {
                    form.getFormO( ).$.find( sel1Select ).val( "nl" ).trigger( 'change' );
                } );

                waitsFor( function( ) {
                    return formHTMLO.itemsetUpdate.mostRecentCall.args[ 0 ] === 'country2';
                }, 'itemsetUpdate not called!', 1000 );

                //select second option
                runs( function( ) {
                    form.getFormO( ).$.find( sel2Select ).val( "ams" ).trigger( 'change' );
                } );

                waitsFor( function( ) {
                    return formHTMLO.itemsetUpdate.mostRecentCall.args[ 0 ] === 'city2';
                }, 'itemsetUpdate not called!', 1000 );

                runs( function( ) {
                    expect( $items1Select( ).length ).toEqual( 2 );
                    expect( $items2Select( ).length ).toEqual( 3 );
                    expect( $items3Select( ).length ).toEqual( 2 );
                    expect( $items3Select( ).eq( 0 ).attr( 'value' ) ).toEqual( 'wes' );
                    expect( $items3Select( ).eq( 1 ).attr( 'value' ) ).toEqual( 'dam' );
                } );

                //select other first option to change itemset
                runs( function( ) {
                    form.getFormO( ).$.find( sel1Select ).val( "usa" ).trigger( 'change' );
                } );

                waitsFor( function( ) {
                    return formHTMLO.itemsetUpdate.mostRecentCall.args[ 0 ] === 'city2';
                }, 'itemsetUpdate not called!', 1000 );

                runs( function( ) {
                    expect( $items1Select( ).length ).toEqual( 2 );
                    expect( $items2Select( ).length ).toEqual( 3 );
                    expect( $items2Select( ).eq( 0 ).attr( 'value' ) ).toEqual( 'den' );
                    expect( $items2Select( ).eq( 2 ).attr( 'value' ) ).toEqual( 'la' );
                    expect( $items3Select( ).length ).toEqual( 0 );
                } );
            } );
        } );

        describe( 'in a cascading select that includes labels without itext', function( ) {
            var $items1Radio, $items2Radio, $items3Radio, formHTMLO,
                sel1Radio = ':not(.itemset-template) > input:radio[data-name="/form/state"]',
                sel2Radio = ':not(.itemset-template) > input:radio[data-name="/form/county"]',
                sel3Radio = ':not(.itemset-template) > input:radio[data-name="/form/city"]';

            beforeEach( function( ) {
                jQuery.fx.off = true; //turn jQuery animations off
                form = loadForm( 'cascading_mixture_itext_noitext.xml' );
                form.init( );

                formHTMLO = form.getFormO( );
                spyOn( formHTMLO, 'itemsetUpdate' ).andCallThrough( );

                $items1Radio = function( ) {
                    return form.getFormO( ).$.find( sel1Radio );
                };
                $items2Radio = function( ) {
                    return form.getFormO( ).$.find( sel2Radio );
                };
                $items3Radio = function( ) {
                    return form.getFormO( ).$.find( sel3Radio );
                };
            } );

            it( 'level 3: with <input type="radio"> elements using direct references to instance labels without itext has the expected amount of options', function( ) {
                //select first option
                runs( function( ) {
                    form.getFormO( ).$.find( sel1Radio + '[value="washington"]' )
                        .attr( 'checked', true ).trigger( 'change' );
                } );

                waitsFor( function( ) {
                    return formHTMLO.itemsetUpdate.mostRecentCall.args[ 0 ] === 'state';
                }, 'itemsetUpdate not called!', 1000 );

                //select second option
                runs( function( ) {
                    form.getFormO( ).$.find( sel2Radio + '[value="king"]' )
                        .attr( 'checked', true ).trigger( 'change' );
                } );

                waitsFor( function( ) {
                    return formHTMLO.itemsetUpdate.mostRecentCall.args[ 0 ] === 'county';
                }, 'itemsetUpdate not called!', 1000 );

                runs( function( ) {
                    expect( $items1Radio( ).length ).toEqual( 2 );
                    expect( $items2Radio( ).length ).toEqual( 3 );
                    expect( $items3Radio( ).length ).toEqual( 2 );
                    expect( $items3Radio( ).siblings( ).text( ) ).toEqual( 'SeattleRedmond' );
                } );
            } );
        } );

        describe( 'in a cloned repeat that includes a cascading select, ', function( ) {
            var countrySelector = '[data-name="/new_cascading_selections_inside_repeats/group1/country"]',
                citySelector = 'label:not(.itemset-template) [data-name="/new_cascading_selections_inside_repeats/group1/city"]',
                form, $masterRepeat, $clonedRepeat;

            beforeEach( function( ) {
                form = loadForm( 'new_cascading_selections_inside_repeats.xml' );
                form.init( );
                $masterRepeat = form.getFormO( ).$.find( '.jr-repeat' );
                //select usa in master repeat
                $masterRepeat.find( countrySelector + '[value="usa"]' ).prop( 'checked', true ).trigger( 'change' );
                //add repeat
                $masterRepeat.find( 'button.repeat' ).click( );
                $clonedRepeat = form.getFormO( ).$.find( '.jr-repeat.clone' );
            } );

            it( 'the itemset of the cloned repeat is correct (and not a cloned copy of the master repeat)', function( ) {
                expect( $masterRepeat.find( citySelector ).length ).toEqual( 3 );
                expect( $clonedRepeat.find( countrySelector + ':selected' ).val( ) ).toBeUndefined( );
                expect( $clonedRepeat.find( citySelector ).length ).toEqual( 0 );
            } );

            it( 'the itemset of the master repeat is not affected if the cloned repeat is changed', function( ) {
                $clonedRepeat.find( countrySelector + '[value="nl"]' ).prop( 'checked', true ).trigger( 'change' );
                expect( $masterRepeat.find( citySelector ).length ).toEqual( 3 );
                expect( $masterRepeat.find( citySelector ).eq( 0 ).attr( 'value' ) ).toEqual( 'den' );
                expect( $clonedRepeat.find( citySelector ).length ).toEqual( 3 );
                expect( $clonedRepeat.find( citySelector ).eq( 0 ).attr( 'value' ) ).toEqual( 'ams' );
            } );
        } );
    } );

    describe( 'output data functionality', function( ) {
        var dataO,
            form = new Form( '', '' );

        it( 'outputs a clone of the primary instance first child as a jQuery object if the object is wrapped inside <instance> and <model>', function( ) {
            dataO = form.Data( '<model><instance><node/></instance><instance id="secondary"><secondary/></instance></model>' );
            expect( dataO.getInstanceClone( ).length ).toEqual( 1 );
            expect( dataO.getInstanceClone( ).prop( 'nodeName' ) ).toEqual( 'node' );
        } );

        it( 'outputs a clone of the first node as a jQuery object if the object is NOT wrapped inside <instance> and <model>', function( ) {
            dataO = form.Data( '<node/>' );
            expect( dataO.getInstanceClone( ).length ).toEqual( 1 );
            expect( dataO.getInstanceClone( ).prop( 'nodeName' ) ).toEqual( 'node' );
        } );

    } );


    describe( 'clearing inputs', function( ) {
        $fieldset = $( '<fieldset><input type="number" value="23" /><input type="text" value="abc" /><textarea>abcdef</textarea></fieldset>"' );

        it( 'works!', function( ) {
            expect( $fieldset.find( '[type="number"]' ).val( ) ).toEqual( "23" );
            expect( $fieldset.find( '[type="text"]' ).val( ) ).toEqual( "abc" );
            expect( $fieldset.find( 'textarea' ).val( ) ).toEqual( "abcdef" );

            $fieldset.clearInputs( );

            expect( $fieldset.find( '[type="number"]' ).val( ) ).toEqual( "" );
            expect( $fieldset.find( '[type="text"]' ).val( ) ).toEqual( "" );
            expect( $fieldset.find( 'textarea' ).val( ) ).toEqual( "" );

        } );
    } );

} );
