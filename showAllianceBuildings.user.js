// ==UserScript==
// @name         Verbandsgebaeude einblenden
// @version      1.0.1
// @description  Behebt den aktuellen Fehler Verbandsgebaeude nicht einblenden zu koennen
// @author       Allure149
// @include      /^https?:\/\/(?:w{3}\.)?(?:leitstellenspiel\.de|(?:meldkamerspel|missionchief|missionchief-australia|nodsentralspillet|112-merkez|jogo-operador112|operador193|dyspetcher101-game|missionchief-japan|jocdispecerat112|missionchief-korea|hatakeskuspeli|dispecerske-centrum)\.com|missionchief\.co\.uk|centro-de-mando\.es|operatorratunkowy\.pl|larmcentralen-spelet\.se|operatore112\.it|operateur112\.fr|dispetcher112\.ru|alarmcentral-spil\.dk|operacni-stredisko\.cz|centro-de-mando\.mx)\/$/
// @grant        none
// ==/UserScript==

(function() {"use strict";var m=document.querySelector(".alliance-buildings-filter").parentNode.parentNode,c=m.childNodes[0],st=(s)=>{alliance_building_show=s.checked};st(c);m.addEventListener("click", ()=>st(c));})();
