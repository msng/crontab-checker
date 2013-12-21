$(function () {
    'use strict';

    var crontabInputId = 'crontab';
    var resultId = 'result';
    var submitButtonId = 'check';
    var daysOfWeek = '日月火水木金土日';
    var rangeOfUnits = {
        '分': [0, 59],
        '時': [0, 23],
        '日': [1, 31],
        '月': [1, 12],
        '曜': [0, 7]
    };
    var errors = {
        'error': 'error',
        'insufficient': '要素が不足しています',
        'outOfRange': 'out of range',
        'unexpectedValue': 'unexpected value'
    };

    $('#' + submitButtonId).on('click', function () {
        var crontab = $('#' + crontabInputId).val();

        // Split params with whitespace
        var params = crontab.split(/ +/);
        var resultBox = $('#' + resultId);

        // Check if this line has at least 5 params
        if (params.length < 5) {
            resultBox.html(getErrorMessage(null, 'insufficient'));
            return;
        }

        var minute, hour , day, month, dow, command;

        // Extract cron timing params
        var timings = params.splice(0, 5);
        minute = timings.shift();
        hour = timings.shift();
        day = timings.shift();
        month = timings.shift();
        dow = timings.shift();

        // Join params left as a line of a command
        if (params.length > 0) {
            command = params.join(' ');
        } else {
            command = '';
        }

        // Initialize the result table
        var table = $('<table></table>');
        table.append('<tr><th>月</th><th>日</th><th>曜日</th><th>時</th><th>分</th></tr>');

        // Prepare a table row for the result
        var result = '<tr>';

        // Add timings to the result
        result += describe(month, '月', false, 'ヶ月');
        result += describe(day, '日');
        result += describe(dow, '曜', daysOfWeek, '日');
        result += describe(hour, '時', false, '時間');
        result += describe(minute, '分');
        result += '</tr>';

        // Add command to the result
        result += '<tr>';
        result += '<td class="left" colspan="5">' + htmlEscape(command) + '</td>';
        result += '</tr>';

        table.append(result);

        resultBox.html(table);
    });

    function describe(param, unit, convert, unitForInterval) {
        return '<td>' + parse(param, unit, convert, unitForInterval) + '</td>';
    }

    function parse(param, unit, convert, unitForInterval) {
        // Split the elements with `,` for multiple params
        var elements = param.split(',');

        // Initialize the result
        var result = '';

        // Get allowed ranges for this unit
        var rangeOfUnit = rangeOfUnits[unit];

        for (var i = 0; i < elements.length; i++) {
            var intervalElements = elements[i].split('/');

            var interval;
            var element = intervalElements[0];
            if (intervalElements.length == 2) {
                interval = intervalElements[1];
            }

            // Can not have more than 2 elements;
            if (intervalElements.length > 2) {
                return getErrorMessage(element);
            }

            if (element === '*') {
                if (interval && interval > 1) {
                    result += '<em>' + interval + (unitForInterval || unit) + 'おき</em>';
                } else {
                    result += '<span class="gray">すべて</span>';
                }
            } else {
                if (i >= 1) {
                    result += ', <br>';
                }

                // Split the element with `-` for range
                var rangeElements = element.split('-');

                // Range can not have more than 2 elements
                if (rangeElements.length > 2) {
                    return getErrorMessage(element);
                }

                // Check if each element is within allowed range
                for (var j = 0; j < rangeElements.length; j++) {
                    if (rangeElements[j] < rangeOfUnit[0] || rangeElements[j] > rangeOfUnit[1]) {
                        return getErrorMessage(element, 'outOfRange');
                    }
                }

                // Check if each element has expected values only
                if (!expectedValuesOnly(rangeElements)) {
                    return getErrorMessage(element, 'unexpectedValue');
                }

                // Convert values if specified
                if (convert) {
                    rangeElements[0] = convert.charAt(rangeElements[0]);
                }
                rangeElements[0] = '<em>' + htmlEscape(rangeElements[0]) + unit + '</em>';

                // Apply the above to the second element, if any
                if (rangeElements[1]) {
                    if (convert) {
                        rangeElements[1] = convert.charAt(rangeElements[1]);
                    }
                    rangeElements[1] = '<em>' + htmlEscape(rangeElements[1]) + unit + '</em>';
                }

                // Join the minimum and the maximum;
                // do nothing is the element is not a range
                element = rangeElements.join('から');

                result += element;
                if (interval && interval > 1) {
                    result += 'の<em>' + interval + (unitForInterval || unit) + 'おき</em>';
                }
            }
        }
        return result;
    }

    function getErrorMessage(data, type) {
        // Set type 'error' if type is omitted or error message is not assigned
        if (typeof type === 'undefined' || !errors[type]) {
            type = 'error';
        }
        // Get an error indicator
        var error = errors[type];

        // If data is given, add separator
        if (data) {
            error += ': ';
        } else {
            // Set void string in case data is null
            data = '';
        }

        return '<span class="error">' + error + data + '</span>';
    }

    function expectedValuesOnly(values) {
        var result = true;
        $(values).each(function () {
            if (!this.match(/^[0-9\*\/]+$/)) {
                result = false;
            }
        });
        return result;
    }

    function htmlEscape(str) {
        return $('<div>').text(str).html();
    }
});
