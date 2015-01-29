(function() {

    "use strict;"

    return module.exports = function(extension){
        switch( extension ){
            case "html" :
            case "htm" :
            case "xml" :
                return "(<!\\-\\-)?"
            case "sh":
            case "pl":
            case "rb":
            case "coffee":
                return "(#+)?";
            case "php":
                return "(\\/+|\\/*\\*+|#+)?";
            case "js":
            case "ts":
            case "sass":
            case "scss":
                return "(\\/+|\\/+\\*+|\\*+)?";
            default :
                return undefined;
        }
    }

}).call(this);