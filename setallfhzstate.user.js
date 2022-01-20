// ==UserScript==
// @name         Status aller Fhz gleichzeitig setzen
// @description  Setzt alle Fahrzeuge einer Wache auf Status 2 oder 6
// @version      1.0.1
// @author       Allure149
// @include      /^https?:\/\/(?:w{3}\.)?(?:(policie\.)?operacni-stredisko\.cz|(politi\.)?alarmcentral-spil\.dk|(polizei\.)?leitstellenspiel\.de|(?:(police\.)?missionchief-australia|(police\.)?missionchief|(poliisi\.)?hatakeskuspeli|missionchief-japan|missionchief-korea|(politiet\.)?nodsentralspillet|(politie\.)?meldkamerspel|operador193|(policia\.)?jogo-operador112|jocdispecerat112|dispecerske-centrum|112-merkez|dyspetcher101-game)\.com|(police\.)?missionchief\.co\.uk|centro-de-mando\.es|centro-de-mando\.mx|(police\.)?operateur112\.fr|(polizia\.)?operatore112\.it|(policja\.)?operatorratunkowy\.pl|dispetcher112\.ru|(polis\.)?larmcentralen-spelet\.se)\/buildings\/.*$/
// @updateURL    https://github.com/types140/LSS-Scripte/raw/master/setallfhzstate.user.js
// @downloadURL  https://github.com/types140/LSS-Scripte/raw/master/setallfhzstate.user.js
// ==/UserScript==
/* global $ */

(function() {
    'use strict';

    if(["1","3","4","7","8","10","14"].includes($("h1:first").attr("building_type"))) return;

    $(".dl-horizontal:first dd:nth-child(4)").append(`<span id="setAllFms6" class="btn btn-default btn-xs">Alle Fhz. S6 setzen</span>
                                                      <span id="setAllFms2" class="btn btn-default btn-xs">Alle Fhz. S2 setzen</span>`);

    $("#setAllFms6").on("click", function(){
        setfms("6");
    });

    $("#setAllFms2").on("click", function(){
        setfms("2");
    });

    function setfms(state){
        $("#vehicle_table tbody tr").each(function(){
            var $this = $(this);
            var vehicleId = $("a[href^='/vehicles/']:first", $this).attr("href").replace("/vehicles/","");

            $.get("/vehicles/"+vehicleId+"/set_fms/"+state).done(function(){
                $("span[class~=building_list_fms][vehicle_id="+vehicleId+"]").toggleClass("building_list_fms_6 building_list_fms_2").text(state=="2"?"2":"6");
            });
        });
    }
})();
