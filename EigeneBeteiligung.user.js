// ==UserScript==
// @name         Eigene Beteiligung
// @version      1.0.1
// @author       Allure149
// @include      *://leitstellenspiel.de/missions/*
// @include      *://www.leitstellenspiel.de/missions/*
// @include      *://missionchief.co.uk/missions/*
// @include      *://www.missionchief.co.uk/missions/*
// @include      *://missionchief.com/missions/*
// @include      *://www.missionchief.com/missions/*
// @grant        none
// ==/UserScript==
/* global $ */

(function() {
    'use strict';

    let own_vor_ort = $("#mission_vehicle_at_mission").find(".btn-backalarm-ajax").length;
    let own_anfahrt = $("#mission_vehicle_driving").find(".btn-backalarm-ajax").closest("td.hidden-xs").length;

    $("#amount_of_people").append(`<span class="amount_of_people_label">Eigene Fahrzeuge <span class="label label-default">${own_anfahrt + own_vor_ort}</span></span>`);
})();
