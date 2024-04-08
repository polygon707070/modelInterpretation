SetComponent = {
    ext_lang: 'set_code',
    formats: ['format_set_json'],
    struct_support: true,

    factory: function(sandbox) {
        return new setViewerWindow(sandbox);
    }
};

var setViewerWindow = function(sandbox) {

    var self = this;
    this.sandbox = sandbox;
    this.sandbox.container = sandbox.container;

    var inputSet = '#set-tools-' + sandbox.container + " #set-input"
    var buttonSave = '#set-tools-' + sandbox.container + " #button-load-set";
    var example = '#set-tools-' + sandbox.container + " #set-example";

    var keynodes = ['ui_set_load_in_memory', 'ui_set_example'];

    $('#' + sandbox.container).prepend('<div class="inputBox" id="set-tools-' + sandbox.container + '"></div>');
    $('#set-tools-' + sandbox.container).load('static/components/html/set-main-page.html', function() {
        SCWeb.core.Server.resolveScAddr(keynodes, function (keynodes) {
            SCWeb.core.Server.resolveIdentifiers(keynodes, function (idf) {
                var buttonLoad = idf[keynodes['ui_set_load_in_memory']];
                var exampleText = idf[keynodes['ui_set_example']];

                $(buttonSave).html(buttonLoad);
                $(example).html(exampleText);

                $(buttonSave).click(function() {
                    var setString = $(inputSet).val();

                    if (isValidUserString(setString)) {
                        callGenSet(getUserSet(setString));
                    }
                });
            });
        });
    });

    this.applyTranslation = function(namesMap) {
        SCWeb.core.Server.resolveScAddr(keynodes, function (keynodes) {
            SCWeb.core.Server.resolveIdentifiers(keynodes, function (idf) {
                var buttonLoad = idf[keynodes['ui_set_load_in_memory']];
                var exampleText = idf[keynodes['ui_set_example']];

                $(buttonSave).html(buttonLoad);
                $(example).html(exampleText);
            });
        });
    };
    this.sandbox.eventApplyTranslation = $.proxy(this.applyTranslation, this);

};

SCWeb.core.ComponentManager.appendComponentInitialize(SetComponent);

function getUserSet(userString){
    if (isValidUserString(userString) != 1) 
        return "Incorrect input!";
    const emptySetSymbol = '\u00D8';
    userString = userString.replace(/\s+/g, '');
    var currentUserSet = {
        nameOfTheSet: getNameOfTheSet(userString),
        elementsOfTheSet: []
    };
    userString = deleteUslessSymbols(userString); 
        for(var i = 0; i < userString.length; i++){
            if(userString[i] == '{') {
                var numberOfOpeningBrackets = 1;
                var numberOfClosingBrackets = 0;
                for(var j = i + 1; j < userString.length; j++){
                    if(userString[j] == '{') numberOfOpeningBrackets++;
                    if(userString[j] == '}') numberOfClosingBrackets++;
                    if(numberOfClosingBrackets == numberOfOpeningBrackets) {
                        currentUserSet.elementsOfTheSet.push(userString.slice(i, j + 1));     
                        i = j - 1;
                        break;
                    }
                }
            }
        }
    if(userString.indexOf(emptySetSymbol) != -1) 
        currentUserSet.elementsOfTheSet.push(userString.match(emptySetSymbol).join(''));
    currentUserSet.elementsOfTheSet = addSimpleElementsToTheSet(userString, currentUserSet.elementsOfTheSet);
    var uniqueElementsOfTheSet = currentUserSet.elementsOfTheSet.filter(
        (value, input, set) => set.indexOf(value) === input);
    if(currentUserSet.elementsOfTheSet.length > uniqueElementsOfTheSet.length)
        return "Exception!";
    return currentUserSet;
}

function getNameOfTheSet(userString) {
    for (var i = 0; i < userString.length; i++)
        if(userString[i] == '=') 
            return userString.substring(0,i);
}

function deleteUslessSymbols(userString) {
    var indexOfEqual = userString.indexOf('=');
        return userString.slice(indexOfEqual + 1, userString.length).replace(/{/,'').slice(0, -1);
}

function addSimpleElementsToTheSet(userString, elementsOfTheSet) {
    for(var i = 0; i < elementsOfTheSet.length; i++){
        userString = userString.replace(elementsOfTheSet[i], '');
    }
    var validElements = userString.match(/(\w+)/g);
    for (var elemnts in validElements) {
        elementsOfTheSet.push(validElements[elemnts]);
    }
    return elementsOfTheSet;
}

function isValidUserString(userString){
    var indexOfEqual = userString.indexOf('=');
    if (indexOfEqual > userString.indexOf('{') || 
        indexOfEqual > userString.indexOf('}') ||
        indexOfEqual == -1)
            return false;
    userString = userString.slice(indexOfEqual + 1, userString.length);
    if(userString.indexOf('{') !=0 && userString.charAt(userString.length - 1) != '}') 
      return false;
    var numberOfOpeningBrackets = 0;
    var numberOfClosingBrackets = 0; 
    userString = deleteUslessSymbols(userString); 
    for(var i = 0; i < userString.length; i++){
        if(userString.charAt(i) == '{')
            numberOfOpeningBrackets++;
        if(userString.charAt(i) == '}')
            numberOfClosingBrackets++;
    }
    if (numberOfOpeningBrackets != numberOfClosingBrackets)
        return false;
    return true;
}


function setGeneration(vertex, elements){

    SCWeb.core.Server.resolveScAddr(['nrel_system_identifier','set','element_of_set'], function (keynodes) {

        var nrelSysId = keynodes['nrel_system_identifier'];
        var conceptSet = keynodes['set'];
        var conceptElement = keynodes['element_of_set'];

        window.sctpClient.create_node(sc_type_const).done(function (setNode) {

            window.sctpClient.create_link().done(function (linkId) {
                window.sctpClient.set_link_content(linkId, vertex);
                window.sctpClient.create_arc(sc_type_const, setNode, linkId).done(function (commonArc) {
                    window.sctpClient.create_arc(sc_type_arc_pos_const_perm, nrelSysId, commonArc);

                    window.sctpClient.create_arc(sc_type_arc_pos_const_perm, conceptSet, setNode);

                    elements.forEach(function (element){
                        window.sctpClient.create_node(sc_type_const).done(function (el) {
                            window.sctpClient.create_arc(sc_type_arc_pos_const_perm, setNode, el);
                            window.sctpClient.create_link().done(function (linkEl) {
                                window.sctpClient.set_link_content(linkEl, element);
                                window.sctpClient.create_arc(sc_type_const, el, linkEl).done(function (commonArc) {
                                    window.sctpClient.create_arc(sc_type_arc_pos_const_perm, nrelSysId, commonArc);
                                    window.sctpClient.create_arc(sc_type_arc_pos_const_perm, conceptElement, el);
                                });
                            });
                        });
                    });
                });
            });

            SCWeb.core.Main.doDefaultCommand([setNode]);
        });
    });
}


function callGenSet(userSet){

    var vertex = userSet.nameOfTheSet;
    var elements = [];

    for(var element in userSet.elementsOfTheSet){
        elements.push(userSet.elementsOfTheSet[element]);
    }

    setGeneration(vertex, elements);
}
