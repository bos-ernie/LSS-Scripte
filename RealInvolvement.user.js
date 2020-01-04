// ==UserScript==
// @name         RealInvolvement
// @version      1.0.0
// @author       Allure149
// @description  Zeigt Sprechwuensche aller Einsaetze an
// @include      *://leitstellenspiel.de/missions/*
// @include      *://www.leitstellenspiel.de/missions/*
// @include      *://missionchief.co.uk/missions/*
// @include      *://www.missionchief.co.uk/missions/*
// @include      *://missionchief.com/missions/*
// @include      *://www.missionchief.com/missions/*
// @include      *://meldkamerspel.com/missions/*
// @include      *://www.meldkamerspel.com/missions/*
// @include      *://centro-de-mando.es/missions/*
// @include      *://www.centro-de-mando.es/missions/*
// @include      *://missionchief-australia.com/missions/*
// @include      *://www.missionchief-australia.com/missions/*
// @include      *://larmcentralen-spelet.se/missions/*
// @include      *://www.larmcentralen-spelet.se/missions/*
// @include      *://operatorratunkowy.pl/missions/*
// @include      *://www.operatorratunkowy.pl/missions/*
// @include      *://operatore112.it/missions/*
// @include      *://www.operatore112.it/missions/*
// @include      *://operateur112.fr/missions/*
// @include      *://www.operateur112.fr/missions/*
// @include      *://dispetcher112.ru/missions/*
// @include      *://www.dispetcher112.ru/missions/*
// @grant        none
// ==/UserScript==
/* global $ */

(function() {
    'use strict';

    let ownVehiclesOnDrive = $("#mission_vehicle_driving >> tr").find("td.hidden-xs >> a.btn-backalarm-ajax").length;
    let ownVehiclesAtMission = $("#mission_vehicle_at_mission").find(".btn-backalarm-ajax").length;

    if(ownVehiclesOnDrive + ownVehiclesAtMission == 0 && $("#missionH1 > span").hasClass("glyphicon-user")) {
        $("#missionH1 > span").toggleClass("glyphicon-user glyphicon-asterisk");
    }
})();
