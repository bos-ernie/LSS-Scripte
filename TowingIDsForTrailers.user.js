// ==UserScript==
// @name         towing vehicle IDs in trailer view
// @description  shows IDs for corresponding vehicles in trailer view
// @version      1.0.0
// @author       Allure149
// @include      /^https?:\/\/(?:w{3}\.)?(?:leitstellenspiel\.de|(?:meldkamerspel|missionchief|missionchief-australia|nodsentralspillet|112-merkez|jogo-operador112|operador193|dyspetcher101-game|missionchief-japan|jocdispecerat112|missionchief-korea|hatakeskuspeli|dispecerske-centrum)\.com|missionchief\.co\.uk|centro-de-mando\.es|operatorratunkowy\.pl|larmcentralen-spelet\.se|operatore112\.it|operateur112\.fr|dispetcher112\.ru|alarmcentral-spil\.dk|operacni-stredisko\.cz|centro-de-mando\.mx)\/vehicles/.*/edit$/
// @grant        none
// ==/UserScript==
var p=document.querySelector('#vehicle_tractive_vehicle_id');if(p)for(let t of p.children)t.value&&(t.text+=` (${t.value})`);