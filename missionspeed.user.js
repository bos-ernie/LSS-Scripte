// ==UserScript==
// @name         MissionSpeed
// @version      2.0.1
// @author       Allure149
// @include      /^https?:\/\/[www.]*(?:leitstellenspiel\.de|missionchief\.co\.uk|missionchief\.com|meldkamerspel\.com|centro-de-mando\.es|missionchief-australia\.com|larmcentralen-spelet\.se|operatorratunkowy\.pl|operatore112\.it|operateur112\.fr|dispetcher112\.ru|alarmcentral-spil\.dk|nodsentralspillet\.com|operacni-stredisko\.cz|112-merkez\.com|jogo-operador112\.com|operador193\.com|centro-de-mando\.mx|dyspetcher101-game\.com|missionchief-japan\.com|missionchief-japan\.com|jocdispecerat112\.com)\/.*$/
// @updateURL    https://github.com/types140/LSS-Scripte/raw/master/missionspeed.user.js
// @grant        none
// ==/UserScript==
/* global $ */


(function() {
    'use strict';

    $('#search_input_field_missions').before(`<div id="missionSpeed" class="btn-group">
			                                      <a id="mspa" class="btn btn-xs btn-success"><div class="glyphicon glyphicon-pause"></div></a>
                                                  <a id="msfb" class="btn btn-xs btn-success"><div class="glyphicon glyphicon-fast-backward"></div></a>
			                                      <a id="msb" class="btn btn-xs btn-success"><div class="glyphicon glyphicon-backward"></div></a>
			                                      <a id="mspl" class="btn btn-xs btn-success"><div class="glyphicon glyphicon-play"></div></a>
			                                      <a id="msf" class="btn btn-xs btn-success"><div class="glyphicon glyphicon-forward"></div></a>
			                                      <a id="msff" class="btn btn-xs btn-success"><div class="glyphicon glyphicon-fast-forward"></div></a>
			                                      <a id="msvf" class="btn btn-xs btn-success"><div class="glyphicon glyphicon-plane"></div></a>
			                                  </div>`);
    switch(mission_speed){
        case 0: $('#mspl').toggleClass("btn-success btn-warning");
            break;
        case 1: $('#msf').toggleClass("btn-success btn-warning");
            break;
        case 2: $('#msff').toggleClass("btn-success btn-warning");
            break;
        case 3: $('#msvf').toggleClass("btn-success btn-warning");
            break;
        case 4: $('#msb').toggleClass("btn-success btn-warning");
            break;
        case 5: $('#msfb').toggleClass("btn-success btn-warning");
            break;
        case 6: $('#mspa').toggleClass("btn-success btn-warning");
            break;
    }

    $('#mspa, #msfb, #msb, #mspl, #msf, #msff, #msvf').on('click', function(){
        var clickedId = $(this).attr('id');

        switch(clickedId){
            case "mspa": $.get('/missionSpeed?speed=6');
                         mission_speed = 6;
                break;
            case "msfb": $.get('/missionSpeed?speed=5');
                         mission_speed = 5;
                break;
            case "msb": $.get('/missionSpeed?speed=4');
                         mission_speed = 4;
                break;
            case "mspl": $.get('/missionSpeed?speed=0');
                         mission_speed = 0;
                break;
            case "msf": $.get('/missionSpeed?speed=1');
                         mission_speed = 1;
                break;
            case "msff": $.get('/missionSpeed?speed=2');
                         mission_speed = 2;
                break;
            case "msvf": if(user_premium) {
                             $.get('/missionSpeed?speed=3');
                             mission_speed = 3;
                         } else {
                             return false;
                         }
                break;
        }

        $('#mspa, #msfb, #msb, #mspl, #msf, #msff, #msvf').removeClass().addClass('btn btn-xs btn-success');

        $('#' + clickedId).toggleClass('btn-success btn-warning');
    });
})();
