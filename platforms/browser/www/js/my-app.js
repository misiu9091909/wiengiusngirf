// Initialize app
var myApp = new Framework7();


// If we need to use custom DOM library, let's save it to $$ variable:
var $$ = Dom7;

// Add view
var mainView = myApp.addView('.view-main', {
    // Because we want to use dynamic navbar, we need to enable it for this view:
    dynamicNavbar: true
});

var wpcf7Fields = {};
var websiteEndpoint = 'http://polelove.nazwa.pl/nowastrona/';

// Handle Cordova Device Ready Event
$$(document).on('deviceready', function() {
    var $form = $$('#the_form');
    if ($form) {
        var obtainWpcf7Fields = function() {
            $$.get(websiteEndpoint, {cf7_form_data:1}, function(data) {
                wpcf7Fields = JSON.parse(data);
            });
        };
        obtainWpcf7Fields();

        var getMissingFieldsLabels = function() {
            var result = [];
            $form.find('[required]').each(function() {
                if (!$$(this).val()) {
                    result.push($form.find('.label[data-for="' + $$(this).attr('name') + '"]').text());
                    return false;
                }
            });
            return result;
        };

        var submitFormData = function() {
            // date: RRRR-MM-DD, hour HH:MM
            var missingFieldsLabels = getMissingFieldsLabels();
            $$('.error').text('');
            if (missingFieldsLabels.length > 0) {
                $$('.error').text('Pola: ' + missingFieldsLabels.join(', ') + ' są wymagane.');
                return;
            }
            var formData = myApp.formToJSON($form);
            formData['g'] = formData.hour_and_minute.substr(0, 2);
            formData['min'] = formData.hour_and_minute.substr(3, 2);
            formData.hour_and_minute = null;
            formData['r'] = formData.date_of_absence.substr(0, 4);
            formData['m'] = formData.date_of_absence.substr(5, 2);
            formData['d'] = formData.date_of_absence.substr(8, 2);
            formData.date_of_absence = null;

            var requestData = {_wpcf7_is_ajax_call: 1};
            for (key in formData) {
                if (formData[key] !== null) {
                    requestData[key] = formData[key];
                }
            }
            for (key in wpcf7Fields) {
                requestData[key] = wpcf7Fields[key];
            }
            console.log(requestData);
            $$.post(websiteEndpoint, requestData, function(data) {
                console.log(data);
                $$('.success').text('Dziękujemy za zgłoszenie!');
            });
        };
        $form.on('click', '.submit', submitFormData);

    }

    $$(document).on('click', '.exit', function() {
        navigator.app.exitApp();
    });
});

