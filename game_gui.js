$( window ).on('load', function() {

//##################
//## Setup In Game ui functions
//##################
GUI = {}

//used to set the UI theme
GUI.theme_class = ".themeDefault"

//###############
//settings and code for card and process drag and drop functionality
GUI.card_settings = {}
GUI.card_settings.onDrag = {
    stack: "div"
  , containment: "#game_area"
  , start: function( event, ui ) {
        //make sure the card is part of the game area while dragging
        //  allows us to drag a card off a processor
        if ( $(this).parent()[0].id != "game_area" ) {
            ui.helper.appendTo("#game_area")
        }

        //drag the whole stack
        if ($('.card_count:hover', this).length != 0) {
            return true;

        //allow taking one card from a stack
        } else if ( $( this ).attr("count") > 1 ) {
            count = $( this ).attr("count")

            //clone so the stack is left behind
            var stack = $( this )
                   .clone()
                   .draggable(GUI.card_settings.onDrag)
                   .droppable(GUI.card_settings.onDrop);
            stack.appendTo("#game_area");
            stack.attr("count", count-1);
            $( ".card_count", stack).text(count-1);

            //hide the little number bubble if it is 1. Note: should never be less then 1
            if (count-1 <= 1) { $( ".card_count", stack).hide(); }

            //reset count on the dragged card
            $(this).attr("count", 1);
            $( ".card_count", this ).text("1");
            $( ".card_count", this ).hide();
        }
        
        //allow the mouse to interact with elements under the card
        $(this).css("pointer-events","none");
        $(".card_count", this).css("pointer-events","none");

        return true;
    }
  , stop: function(event, ui) {
        //re-enable mouse interactings on the card once the dragging is done
        $(this).css("pointer-events","auto");
        $(".card_count", this).css("pointer-events","auto");
    }
  , drag: function(e, ui) {
        //so silly this has to be done but seems to be the only way to allow
        //   the draggable to follow the mouse cursor after a parent change
        ui.position.left = ui.offset.left
        ui.position.top = ui.offset.top
    }
}
GUI.card_settings.onDrop = {
    //this allows us to stack cards
    drop: function( event, ui ) {
        //if the current card is slotted into a processor we do not stack them
        if ( $(this).attr("slotted") ) { return; }

        //allow combinding two card of the same type into a stack
        dragged = ui.draggable[0]
        if ($(dragged).attr("type") == $(this).attr("type")) {
            target_count = $( this ).attr("count") || 1;
            source_count = $( dragged ).attr("count") || 1;
            count = Number(target_count)+Number(source_count);

            $( dragged ).remove();
            $( this ).attr("count", count);
            $( ".card_count", this).text(count).show();

        }
    }
}

GUI.process_settings = {}
GUI.process_settings.slideSpeed = 100;
GUI.process_settings.onDrag = {
    stack: "div"
  , containment: "#game_area"
}
GUI.process_settings.onDropCardslot = {
    drop: function( event, ui ) {
        //stop if a card is already slotted here.
        if ( $(this).find('.card').length >= 1) { return; }

        //also stop if type is invalid
        //TODO

        dragged = ui.draggable[0]
        //if accepted we need to adjust the position so it matches up then add it.
        $(dragged).appendTo( $(this) )
                  .css("top", $(this).position().top + 
                             parseInt($(this).css('marginTop'), 10))
                  .css("left", $(this).position().left + 
                             parseInt($(this).css('marginLeft'), 10));
        
        //card is in a slot and cannot be stacked with same type anymore.
        $(dragged).attr("slotted", true);
    }
}

//##################
//Major UI functions

//change ui screens
GUI.switch_ui_screens = function(screen_id){
    if ( $("#"+screen_id + " .ui-screen") ) {
        $(".ui-screen").hide();
        $("#"+screen_id).show();
    }
}

//Create and add UI elements for a card
GUI.add_card_ui = function(type){
    var card_html = "<div class='card' type='"+type+"'><p>"+type+"</p></div>";
    var stack_counter_html = 
        "<span class='card_count' style='display:none;'></span>";

    var card_obj = $(card_html)
                   .draggable(GUI.card_settings.onDrag)
                   .droppable(GUI.card_settings.onDrop)
                   .append(stack_counter_html)

    $("#game_area").append( card_obj )

    return card_obj;
}


//Create and add UI elements for a process
GUI.add_process_ui = function(type){
    $("#game_area").append( $("<div class='process'></div>")
                                .draggable(GUI.process_settings.onDrag)
                                .hover( function() { $(".process_tray", this).finish().slideDown(); }, function() { $(".process_tray", this).finish().slideUp(); } )
                                .append("<div class='process_detail'>"+type+"</div>")
                                .append( $("<div class='process_tray'></div>")
                                    .hide()
                                    .append( $("<button class='start_button'>Start</button>").button() )
                                    .append("<p>Target</p>")
                                    .append( $("<div class='card_slot'></div>")
                                        .droppable(GUI.process_settings.onDropCardslot)
                                    )
                                )
    )
}


//################
//Button functions

function newGameButton(){
    GUI.switch_ui_screens("game_mat");

    //testing
    GUI.add_card_ui("Wood")
    GUI.add_card_ui("Wood")
    GUI.add_card_ui("Wood")
    GUI.add_card_ui("Stone")


    GUI.add_process_ui("Reactor")

    //this is so cards don't all start on top of eachother should only be needed at
    //  start of a game.
    var screen_width = $("#game_area").css('width');

    var cards = $("#game_area").find(".card");
    var processes = $("#game_area").find(".process")

    var card_top = $(document).height()*0.7; //70% height
    var process_top = $(document).height()*0.2; //20% height

    var spaceing = $("#game_area").position().left;

    $.each( cards,  function(i, card) {
        $(card).css({top: card_top, left: spaceing + spaceing*i});
    })

    $.each( processes,  function(i, process) {
        $(process).css({top: process_top, left: spaceing + spaceing*i});
    }) 

}

function saveGameButton(){

}

function loadGameButton(){

}

function startEditorButton(){

}

function showCreditsButton() {

}

function openGameMenuButton(){
    $("#game_menu").dialog( "open" );
}

function closeGameMenuButton() { 
    $("#game_menu").dialog( "close" );
}

function exitToMainButton() { 
    closeGameMenuButton();
    GUI.switch_ui_screens("main_menu");

    //tell data model to shutdown
}

//##########################
//## Setup Each UI "screen"
//##########################

//#################
//setup main menu
$("body").append( $("<div id='main_menu' class='ui-screen'><h1>Main Menu</h1></div>")
                      .append( $("<ul class='menu'></ul>")
                          .append("<li class='new_game-button'>New Game</li>"
                                 ,"<li class='load_game-button'>Load Game</li>"
                                 ,"<li    id='editor-button'>Editor</li>"
                                 ,"<li    id='credits-button'>Credits</li>")
))
$("#main_menu li").button() //style the buttons

//#####################
//setup in-game menu
$("body").append( $("<div id='game_menu' title='Game Menu'></div>")
                      .append( $("<ul class='menu'></ul>")
                          .append("<li    id='continue_game-button'>Continue Game</li>"
                                 ,"<li    id='save_game-button'>Save Game</li>"
                                 ,"<li class='new_game-button'>New Game</li>"
                                 ,"<li class='load_game-button'>Load Game</li>"
                                 ,"<li    id='exit-button'>Exit to Main Menu</li>")
))
$("#game_menu").dialog({dialogClass: 'game_menu', resizable: false, draggable: false, modal: true})
$("#game_menu li").button() //style the buttons
$("#game_menu").dialog( "close" ) //hide by default


//#################
//setup game area
$("body").append( $("<div id='game_mat' class='ui-screen'></div>") 
                      .append("<div id='open_game_menu-button'>Open Menu</div>"
                             ,"<div id='game_area'></div>")
)
$("#open_game_menu-button").button();
$("#game_mat").hide()


//################
//setup buttons for all the above screens

$(".new_game-button"      ).on('click', newGameButton);
$(".load_game-button"     ).on('click', loadGameButton);
$("#save_game-button"     ).on('click', saveGameButton);
$("#open_game_menu-button").on('click', openGameMenuButton);
$("#continue_game-button" ).on('click', closeGameMenuButton);
$("#credits-button"       ).on('click', showCreditsButton);
$("#editor-button"        ).on('click', startEditorButton);
$("#exit-button"          ).on('click', exitToMainButton);

});
