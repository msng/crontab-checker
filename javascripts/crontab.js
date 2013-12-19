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
        var params = crontab.split(/ +/);
        var resultBox = $('#' + resultId);
        if (params.length < 5) {
            resultBox.html(getErrorMessage(null, 'insufficient'));
            return;
        }

        var minute, hour , day, month, dow, command;

        var timings = params.splice(0, 5);
        minute = timings.shift();
        hour = timings.shift();
        day = timings.shift();
        month = timings.shift();
        dow = timings.shift();

        if (params.length > 0) {
            command = params.join(' ');
        } else {
            command = '';
        }

        var table = $('<table></table>');
        table.append('<tr><th>月</th><th>日</th><th>曜日</th><th>時</th><th>分</th><th>コマンド</th></tr>');

        var result = '<tr>';

        result += describeElement(month, '月');
        result += describeElement(day, '日');
        result += describeElement(dow, '曜', daysOfWeek);
        result += describeElement(hour, '時');
        result += describeElement(minute, '分');

        result += '<td class="left">' + htmlEscape(command) + '</td>';

        result += '</tr>';

        table.append(result);

        resultBox.html(table);
    });



    function describeElement(elements, unit, convert) {
        return '<td>' + parseElement(elements, unit, convert) + '</td>';
    }

    function parseElement(elements, unit, convert) {
        var splitElements = elements.split(',');
        var result = '';
        var rangeOfUnit = rangeOfUnits[unit];
        for (var i = 0; i < splitElements.length; i++) {
            if (splitElements[i] === '*') {
                result += '<span class="gray">すべて</span>';
            } else {
                if (i >= 1) {
                    result += ', ';
                }

                var subElements = splitElements[i].split('-');

                // Range can not have more than 2 elements
                if (subElements.length > 2) {
                    return getErrorMessage(splitElements[i]);
                }

                // Check if each element is within allowed range
                for (var j = 0; j < subElements.length; j++) {
                    if (subElements[j] < rangeOfUnit[0] || subElements[j] > rangeOfUnit[1]) {
                        return getErrorMessage(splitElements[i], 'outOfRange');
                    }
                }
                if (!expectedValuesOnly(subElements)) {
                    return getErrorMessage(splitElements[i], 'unexpectedValue');
                }

                if (convert) {
                    subElements[0] = convert.charAt(subElements[0]);
                    if (subElements[1]) {
                        subElements[1] = convert.charAt(subElements[1]);
                    }
                }
                $(subElements).each(function(index, subElement) {
                    subElements[index] = '<em>' + htmlEscape(subElement) + unit + '</em>';
                });
                splitElements[i] = subElements.join('から');
                result += splitElements[i];
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
        $(values).each(function() {
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
