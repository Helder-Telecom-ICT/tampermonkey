// ==UserScript==
// @name         Cubics - Standaard inloggegevens
// @namespace    https://secret.cubics.cloud/
// @version      1.3.0
// @description  Vult zes regels in bij een nieuw bericht.
// @match        https://secret.cubics.cloud/*
// @run-at       document-end
// @grant        none
// ==/UserScript==

(function () {
    'use strict';

    function invullen() {
        if (location.pathname !== '/' || location.search) return;

        var tekstvak = document.getElementById('secret');

        if (!tekstvak || tekstvak.tagName !== 'TEXTAREA' ||
            tekstvak.readOnly || tekstvak.disabled) return;

        if (tekstvak.value.trim() === '') {
            tekstvak.value = [
                'Gebruikersnaam: ',
                'Wachtwoord: ',
                'Hostnaam: xelionXX.helderbellen.nl',
                'Tenantnaam: pbxX',
                'Intern Nummer: 2XX',
                'Direct Nummer: +31XXXXXXXXX'
            ].join('\n');

            tekstvak.dispatchEvent(
                new Event('input', { bubbles: true })
            );
            tekstvak.dispatchEvent(
                new Event('change', { bubbles: true })
            );
        }

        tekstvak.style.height = '200px';
    }

    if (document.readyState === 'loading') {
        document.addEventListener(
            'DOMContentLoaded', invullen, { once: true }
        );
    } else {
        invullen();
    }
})();
