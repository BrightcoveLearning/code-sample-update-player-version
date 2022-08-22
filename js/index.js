let BCLS = (function (window, document) {
    // account id calue is the default
    let player_id,
        player_code,
        player_id_input = document.getElementById('player_id_input'),
        account_id_input = document.getElementById('account_id_input'),
        client_id_input = document.getElementById('client_id_input'),
        client_secrect_input = document.getElementById('client_secrect_input'),
        update_player = document.getElementById('update_player'),
        create_response = document.getElementById('create_response'),
        publish_response = document.getElementById('publish_response'),
        player_embedded = document.getElementById('player_embedded'),
        preview_player = document.getElementById('preview_player');

    // event handlers
    update_player.addEventListener('click', function () {
        createRequest('updatePlayer');
    });

    preview_player.addEventListener('click', function () {
        // inject the player - clear the div first to allow repeated clicks
        player_embedded.innerHTML = '';
        player_embedded.insertAdjacentHTML('afterbegin', player_code);
    });


    /**
     * createRequest sets up requests, send them to makeRequest(), and handles responses
     * @param  {string} type the request type
     */
    function createRequest(type) {
        let options = {},
            requestBody = {},
            proxyURL = 'https://solutions.brightcove.com/bcls/bcls-proxy/bcls-proxy-v2.php',
            baseURL = 'https://players.api.brightcove.com/v2/accounts/',
            endpoint,
            responseDecoded;

        if (client_id_input.value.length > 0 && client_secrect_input.value.length > 0 && player_id_input.value.length > 0 && account_id_input.value.length > 0) {

            options.player_id_input = player_id_input.value;
            options.account_id_input = account_id_input.value;
            options.client_id = client_id_input.value;
            options.client_secret = client_secrect_input.value;

        }else{
          alert('Enter data in all fields');
        }

        options.proxyURL = proxyURL;

        switch (type) {
            case 'updatePlayer':
                endpoint = options.account_id_input + '/players/' + options.player_id_input + '/configuration';
                options.url = baseURL + endpoint;
                options.requestType = 'PATCH';
                requestBody.player = {};
                requestBody.player.template = {};
                requestBody.player.template.locked = false;
                requestBody.player.template.version = '6.65.3';

                options.requestBody = JSON.stringify(requestBody);

                makeRequest(options, function (response) {
                    responseDecoded = JSON.parse(response);
                    player_id = responseDecoded.id;
                    create_response.textContent = JSON.stringify(responseDecoded, null, 2);

                    if (player_id) {
                        createRequest('publishPlayer');
                    }
                });
                break;
            case 'publishPlayer':
                endpoint = options.account_id_input + '/players/' + player_id_input.value + '/publish';
                options.url = baseURL + endpoint;
                options.requestType = 'POST';

                makeRequest(options, function (response) {
                    responseDecoded = JSON.parse(response);
                    player_code = responseDecoded.embed_code;
                    publish_response.textContent = JSON.stringify(responseDecoded, null, 2);
                });
                break;

            // additional cases
            default:
                console.log('Should not be getting to the default case - bad request type sent');
                break;
        }
    }

    /**
     * send API request to the proxy
     * @param {Object} options for the request
     * @param {String} options.url the full API request URL
      * @param {String} options.client_id client id for the account( default is in the proxy)
     * @param {String} options.client_secret client secret for the account(default is in the proxy)
     * @param {String = "GET", "POST", "PATCH", "PUT", "DELETE"} requestData[options.requestType = "GET"] HTTP type for the request
     * @param {String} options.proxyURL proxyURL to send the request to
     *@param {Function} [callback] callback function that will process the response
     */

    function makeRequest(options, callback) {
        let httpRequest = new XMLHttpRequest(),
            response,
            proxyURL = options.proxyURL,
            // response handler
            getResponse = function () {
                try {
                    if (httpRequest.readyState === 4) {
                        if (httpRequest.status >= 200 && httpRequest.status < 300) {
                            response = httpRequest.responseText;
                            // some API requests return '{null}' for empty responses - breaks JSON.parse
                            if (response === '{null}') {
                                response = null;
                            }
                            // return the response
                            callback(response);
                        } else {
                            alert('There was a problem with the request. Request returned ' + httpRequest.status);
                        }
                    }
                } catch (e) {
                    alert('Caught Exception: ' + e);
                }
            };
        /**
         * set up request data
         * the proxy used here takes the following request body:
         * JSON.strinify(options)
         */
        // set response handler
        httpRequest.onreadystatechange = getResponse;
        // open the request
        httpRequest.open('POST', proxyURL);
        // set headers if there is a set header line, remove it
        // open and send request
        httpRequest.send(JSON.stringify(options));
    }

})(window, document);