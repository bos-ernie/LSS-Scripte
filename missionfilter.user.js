// ==UserScript==
// @name         MissionFilter
// @version      1.3.0
// @author       Allure149
// @include      /^https?:\/\/[www.]*(?:leitstellenspiel\.de|missionchief\.co\.uk|missionchief\.com|meldkamerspel\.com|centro-de-mando\.es|missionchief-australia\.com|larmcentralen-spelet\.se|operatorratunkowy\.pl|operatore112\.it|operateur112\.fr|dispetcher112\.ru|alarmcentral-spil\.dk|nodsentralspillet\.com|operacni-stredisko\.cz|112-merkez\.com|jogo-operador112\.com|operador193\.com|centro-de-mando\.mx|dyspetcher101-game\.com|missionchief-japan\.com)\/$/
// @updateURL    https://github.com/types140/LSS-Scripte/raw/master/missionfilter.user.js
// @grant        none
// ==/UserScript==
/* global $,alliance_id,user_id */

(async function() {
    'use strict';

    if(!alliance_id || alliance_id == 0) return false;
    if(localStorage.getItem("mfCredits") === null) localStorage.mfCredits = 8000;

    if(!localStorage.aMissions || JSON.parse(localStorage.aMissions).lastUpdate < (new Date().getTime() - 5 * 1000 * 60)) await $.getJSON('/einsaetze.json').done(data => localStorage.setItem('aMissions', JSON.stringify({lastUpdate: new Date().getTime(), value: data})) );
    var aMissions = JSON.parse(localStorage.aMissions).value;

    var filterMissionTypeId = data => +data.mission_type_id.value;

    function processMissionFilter(getMissionTypeId) {
        var returnValue = "";
        var missionCredits = 0;
        var missionTypeId = getMissionTypeId;
        var missionRequirements = aMissions.filter((e) => e.id == missionTypeId)[0];

        if(isNaN(missionTypeId)){
            missionCredits = 10000;
        } else {
            if(missionRequirements) missionCredits = +missionRequirements.average_credits;
            else return false;
        }

        if(missionCredits > +localStorage.mfCredits) returnValue = false;
        else returnValue = true;

        return returnValue;
    }

    function initMissionFilter() {
        $('#mission_list_alliance > .missionSideBarEntry, #mission_list_alliance_event > .missionSideBarEntry, #mission_list_sicherheitswache > .missionSideBarEntry').each(function(){
            var $this = $(this);
            var $attributes = $this[0].attributes;
            var missionTypeId = filterMissionTypeId($attributes);

            if(processMissionFilter(missionTypeId)) $this.addClass('hidden');
        });
    }

    initMissionFilter();

    var missionMarkerOrig = missionMarkerAdd;
    missionMarkerAdd = e => {
        missionMarkerOrig(e);

        if(e.alliance_id && e.user_id != user_id && processMissionFilter(e.mtid)) $('#mission_'+e.id).addClass('hidden');
        else return false;
    }

    $('#alliance_li .dropdown-menu').append(`<div class="col-sm-12">
                                                 <div class="input-group">
                                                     <span class="input-group-addon">Ab</span>
                                                     <input type="text" maxlength="5" class="form-control" id="mfMinCredits" value=${localStorage.mfCredits} style="min-width: 5em !important">
                                                     <span class="input-group-addon">Cr. Eins. anz.</span>

                                                     <span class="input-group-addon" style="padding:0">
                                                         <button type="button" class="btn btn-xs" id="mfSave">
                                                             <div class="glyphicon glyphicon-ok"></div>
                                                         </button>
                                                     </span>
                                                 </div>
                                             </div>`);

    $('#mfSave').on('click', function(){
        localStorage.mfCredits = $('#mfMinCredits').val();
        location.reload();
    });
})();
