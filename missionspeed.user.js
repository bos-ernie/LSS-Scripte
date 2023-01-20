// ==UserScript==
// @name         MissionSpeed
// @description  set dynamically the period between your missions
// @version      3.0.1
// @author       Allure149
// @match        https://www.leitstellenspiel.de/
// @match        https://polizei.leitstellenspiel.de/
// @match        https://www.missionchief.com/
// @match        https://police.missionchief.com/
// @match        https://www.missionchief.co.uk/
// @match        https://police.missionchief.co.uk/
// @match        https://www.missionchief-australia.com/
// @match        https://police.missionchief-australia.com/
// @updateURL    https://github.com/types140/LSS-Scripte/raw/master/missionspeed.user.js
// @downloadURL  https://github.com/types140/LSS-Scripte/raw/master/missionspeed.user.js
// @grant        none
// ==/UserScript==
/* global $, I18n, mission_speed, user_premium */


(function() {
    'use strict';

    //
    // configuration for grouping buttons
    // (could result into pushing the buttons one line down)
    //
    // true = buttons should be grouped
    // false = buttons should NOT be grouped
    // standard: true
    //
    const group_buttons = true;

    //
    // lists all possible periods for generating missions
    //
    // the order here reflects the order of buttons in the game!!
    // new entries are to be made as follows (copy the lines to be sure!):
    //{
    //    mode: "<name of the new mode according to the overview in the game>",
    //    number: <number of speed (read from the URL of the speed)>,
    //    id: "<free to choose>",
    //    secs: <seconds count up to the next mission>,
    //    icon: "<name of the icon without the preceding 'glyphicon glyphicon-' (see https://getbootstrap.com/docs/3.3/components/)>",
    //    premium: <if premium is neccessary for this mode du be used, written as true (yes) or false (no)>
    //},
    //
    // descriptions in <...> inclusive the characters needs to be replaced!
    //
    const periods = [
        { mode: "Pause", number: 6, id: "mspa", secs: 0, icon: "pause", premium: false },
        { mode: "Extra langsam", number: 5, id: "msfb", secs: 600, icon: "fast-backward", premium: false },
        { mode: "Langsamer", number: 8, id: "mssb", secs: 420, icon: "step-backward", premium: false },
        { mode: "Langsam", number: 4, id: "msb", secs: 300, icon: "backward", premium: false },
        { mode: "Realistisch", number: 0, id: "mspl", secs: 180, icon: "play", premium: false },
        { mode: "Semi-Realistisch", number: 7, id: "msf", secs: 120, icon: "forward", premium: false },
        { mode: "Normal", number: 1, id: "mssf", secs: 60, icon: "step-forward", premium: false },
        { mode: "Schnell", number: 2, id: "msff", secs: 30, icon: "fast-forward", premium: false },
        { mode: "Turbo", number: 3, id: "msvf", secs: 20, icon: "plane", premium: true },
    ];

    //
    // translations
    // the format should be self explaining
    // for detailed language codes see: https://github.com/types140/LSS-Scripte/blob/master/translate/lang.js
    const msLang = {
        de_DE: { sec: "Sekunde", secs: "Sekunden", min: "Minute", mins: "Minuten" },
        en_US: { sec: "Second", secs: "Seconds", min: "Minute", mins: "Minutes" },
        en_GB: { sec: "Second", secs: "Seconds", min: "Minute", mins: "Minutes" },
        en_AU: { sec: "Second", secs: "Seconds", min: "Minute", mins: "Minutes" },
    };

    // ########################################
    // Don't change anything from here except
    // you really know what you are doing!!!
    // ########################################

    let currentTimeId = "";

    if($('#search_input_field_missions').length != 0){
        $('#search_input_field_missions').before(`<div id="missionSpeed"></div>`);
        if(group_buttons) $("#missionSpeed").addClass("btn-group");

        for(const time of periods){
            // som = seconds or minutes

            // convert seconds to minutes
            const somNumber = time.secs >= 60 ? time.secs / 60 : time.secs;

            // if seconds > 60 the word "minutes" is used, otherwise "seconds"
            // if seconds or minutes > 1 then use plural words
            let somDescription = function(){
                if(time.secs < 60){
                    if(time.secs === 1) return msLang[I18n.locale].sec;
                    else return msLang[I18n.locale].secs;
                } else {
                    if(time.secs / 60 === 1) return msLang[I18n.locale].min;
                    else return msLang[I18n.locale].mins;
                }
            };

            // save the id of the current used speed
            if(time.number === mission_speed){
                currentTimeId = time.id;
            }

            $("#missionSpeed").append(`<span id="${time.id}" title="${somNumber} ${somDescription()}" class="btn btn-xs btn-${time.number === mission_speed ? "warning" : "success"} glyphicon glyphicon-${time.icon}"></span>`);
        }
    }

    // suppress preceded Pause-Button
    if($("#mission_speed_pause").length != 0) $("#mission_speed_pause").remove();

    $("#missionSpeed").on('click', function(e){
        const el = e.target;

        // select new period from the "database"
        const newTime = periods.find(e => e.id === el.id);

        // if the periodmode needs premium and the player doesn't have it the period doesn't need to be set
        if(newTime.premium && !user_premium) return;

        $.get(`/missionSpeed?speed=${newTime.number}`, function(){
            // select new speed (as an orange button)
            $(el).toggleClass('btn-success btn-warning');

            // deselect old speed
            $(`#${currentTimeId}`).toggleClass('btn-success btn-warning');

            // notice new speed ID
            currentTimeId = newTime.id;

            // the local saved, generated by the system, needs also to be updated
            mission_speed = newTime.number;
        });
    });
})();
