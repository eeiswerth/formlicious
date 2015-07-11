Formlicious = {
    validators: {
        nonEmptyValidator: function(field, input) {
            if (input == null) {
                return false;
            }
            input = $.trim(input);
            return input.length > 0;
        },
        stringValidator: function(field, input) {
            var isString = Match.test(input, String);
            if (!isString) {
                return false;
            }
            input = $.trim(input);
            if (field.maxlength) {
                if (input.length > field.maxlength) {
                    return false;
                }
            }
            return true;
        }
    }
};