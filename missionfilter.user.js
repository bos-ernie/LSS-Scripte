// ==UserScript==
// @name         MissionFilter
// @version      1.1.0
// @author       Allure149
// @include      /^https?:\/\/[www.]*(?:leitstellenspiel\.de|missionchief\.co\.uk|missionchief\.com|meldkamerspel\.com|centro-de-mando\.es|missionchief-australia\.com|larmcentralen-spelet\.se|operatorratunkowy\.pl|operatore112\.it|operateur112\.fr|dispetcher112\.ru|alarmcentral-spil\.dk|nodsentralspillet\.com|operacni-stredisko\.cz|112-merkez\.com|jogo-operador112\.com|operador193\.com|centro-de-mando\.mx|dyspetcher101-game\.com|missionchief-japan\.com)\/.*$/
// @updateURL    https://github.com/types140/LSS-Scripte/raw/master/missionfilter.user.js
// @grant        GM_addStyle
// ==/UserScript==
/* global $ */

(function() {
    'use strict';

    GM_addStyle(`.mfhide{display:none}`);

    if (localStorage.getItem("mfCredits") === null) {
        localStorage.mfCredits = 8000;
    }

    var checkCredits = parseInt(localStorage.mfCredits, 10);

    var getMissionRequirements = {};
    $.getJSON('https://lssm.ledbrain.de/api/missions.php').done(function(data){
        getMissionRequirements = data;
        console.log(data[0]);
        var showHide = "";

        initMissionFilter();

        var missionMarkerOrig = missionMarkerAdd;
        missionMarkerAdd = e => {
            missionMarkerOrig(e);

            if(e.alliance_id != "null"){
                showHide = processMissionFilter(e.mtid);
                if(showHide == "hide") $('#mission_'+e.id).addClass('mfhide');
            }
        };
    });

    var getMissionTypeId = data => data.mission_type_id.value;

    var processMissionFilter = getMissionTypeId => {
        var returnValue = "";
        var missionCredits = 0;
        var missionTypeId = parseInt(getMissionTypeId);

        if(isNaN(missionTypeId)){
            missionCredits = 10000;
        } else {
            if(getMissionRequirements[missionTypeId] != undefined) missionCredits = getMissionRequirements[missionTypeId].credits;
            else return false;
        }

        if(missionCredits > checkCredits) returnValue = "show";
        else returnValue = "hide";

        return returnValue;
    }

    var initMissionFilter = () => {
        $('#mission_list_alliance > .missionSideBarEntry, #mission_list_alliance_event > .missionSideBarEntry, #mission_list_sicherheitswache > .missionSideBarEntry').each(function(){
            var $this = $(this);
            var $attributes = $this[0].attributes;
            var missionTypeId = parseInt(getMissionTypeId($attributes));
            var initShowHide = processMissionFilter(missionTypeId);

            if(initShowHide == "hide") $this.addClass('mfhide');
        });
    }

    if($('#alliance_li').length > 0){
        $('#alliance_li .dropdown-menu').append(`<div class="col-sm-12">
                                                     <div class="input-group">
                                                         <span class="input-group-addon">Ab</span>
                                                         <input type="textbox" maxlength="5" class="form-control" id="mfMinCredits" value=${checkCredits}>
                                                         <span class="input-group-addon">Cr. Eins. ausbl.</span>
                                                         <span class="input-group-addon" style="padding:0">
                                                             <button type="button" class="btn btn-xs" id="mfSave">
                                                                 <div class="glyphicon glyphicon-ok"></div>
                                                             </button>
                                                         </span>
                                                     </div>
                                                 </div>`);
    }

    $('#mfSave').on('click', function(){
        localStorage.mfCredits = $('#mfMinCredits').val();
        location.reload();
    });
})();
