Formlicious = {
    validators: {
        nonEmptyValidator: function(field, input) {
            if (input == null) {
                return false;
            }
            input = $.trim(input);
            return input.length > 0;
        },
        creditCardExpirationValidator: function(field, input) {
            if (!input) {
                return false;
            }
            var month = parseInt(input.month, 10);
            var year = parseInt(input.year);
            var currentYear = new Date().getFullYear();

            return month >= 1 && month <= 12 && year >= currentYear && year <= currentYear + 20;
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
            var result = true;
            if (field.required) {
                result = Formlicious.validators.nonEmptyValidator(field, input);
            }
            return result;
        },

        /**
         * Validates a credit card # as per the Luhn formula.
         * @param field
         * @param input
         * @return {Boolean}
         */
        creditCardValidator: function(field, input) {
            if (!Formlicious.validators.nonEmptyValidator(field, input)) {
                return false;
            }

            // Remove all spaces.
            input = input.replace(/ /g, '');
            var numberArray = [];
            for (var i = 0; i < input.length; ++i) {
                var num = parseInt(input[i], 10);
                if (num < 0 || num > 9) {
                    return false;
                }

                numberArray.push(num);
            }

            for (var i = numberArray.length - 2; i >= 0; i = i - 2) {
                numberArray[i] = numberArray[i] * 2;
                if (numberArray[i] > 9) {
                    numberArray[i] = numberArray[i] - 9;
                }
            }

            var sum = 0;
            for (var i = 0; i < numberArray.length; ++i) {
                sum += numberArray[i];
            }

            return sum % 10 === 0;
        }
    }
};