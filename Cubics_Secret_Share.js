// ==UserScript==
// @name         Cubics - Standaardtekst
// @namespace    https://secret.cubics.cloud/
// @version      1.1.0
// @description  Vult automatisch de vier standaardvelden in.
// @match        https://secret.cubics.cloud/*
// @run-at       document-idle
// @grant        none
// ==/UserScript==

(function () {
    'use strict';

    const standaardtekst = `Gebruikersnaam: 
Wachtwoord: 
Hostnaam: 
Tenantnaam: `;

    const tekstvak = document.querySelector(
        'form[method="POST"] textarea#secret[name="secret"]'
    );

    if (!tekstvak || tekstvak.readOnly || tekstvak.disabled ||
        tekstvak.value.trim() !== '') return;

    tekstvak.value = standaardtekst;
    tekstvak.dispatchEvent(new Event('input', { bubbles: true }));
    tekstvak.dispatchEvent(new Event('change', { bubbles: true }));
})();