$(function () {
    var crontabInputId = 'crontab';
    var resultId = 'result';
    var submitButtonId = 'check';
    var daysOfWeek = '日月火水木金土日';
    var rangeOfUnits = {
        '分':[0,59],
        '時':[0,23],
        '日':[1,31],
        '月':[1,12],
        '曜日':[0,6]
    };

    $('#' + submitButtonId).on('click', function () {
        var crontab = $('#' + crontabInputId).val();
        var params = crontab.split(/ +/);
        var resultBox = $('#' + resultId);
        if (params.length < 5) {
            resultBox.html('<span class="error">要素が不足しています</span>');
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

        var result = '';

        result += describeElement(month, '月');
        result += describeElement(day, '日');

        if (dow != '*') {
            result += describeElement(dow, '曜日', daysOfWeek);
        }

        result += describeElement(hour, '時');
        result += describeElement(minute, '分');

        if (command) {
            result += "<br><br>" + htmlEscape(command);
        }

        resultBox.html(result);
    });

    function describeElement(elements, unit, convert) {
        var splitElements = elements.split(',');
        var result = '';
        var rangeOfUnit = rangeOfUnits[unit];
        for (var i = 0; i < splitElements.length; i++) {
            if (splitElements[i] == '*') {
                result += '毎' + unit;
            } else {
                if (i >= 1) {
                    result += 'と';
                }

                var subElements = splitElements[i].split('-');
                if (subElements.length > 2) {
                    return '<span class="error">エラー: "' + splitElements[i] + '"</span>';
                }
                for (var j = 0; j < subElements.length; j++) {
                    if (subElements[j]<rangeOfUnit[0]||subElements[j]>rangeOfUnit[1]){
                        return '<span class="error">out of range: "' + splitElements[i] + '"</span>';
                    }
                }
                if (convert) {
                    subElements[0] = convert.charAt(subElements[0]);
                    subElements[1] = convert.charAt(subElements[1]);
                }
                splitElements[i] = subElements.join('から');
                result += '<em>' + htmlEscape(splitElements[i]) + '</em>' + unit;
            }
        }
        result += ' ';
        return result;
    }

    function htmlEscape(str) {
        return $('<div>').text(str).html();
    }
});