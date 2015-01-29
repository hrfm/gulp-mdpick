(function() {

    "use strict;"

    return module.exports = function(extension){
        switch( extension ){
            case "sh":
            case "pl":
            case "rb":
                return "(#+)?";
            case "php":
                return "(\\/+|\\/*\\*+|#+)?";
            default :
                return "(\\/+|\\/*\\*+)?";
        }
    }

}).call(this);