
 // ==UserScript==
 // @name         Cubics - Standaard inloggegevens
 // @namespace    https://secret.cubics.cloud/
 // @version      1.3.1
 // @By           Nicky Oomen
 // @description  Vult standaardgegevens in bij een nieuw bericht.
 // @match        https://secret.cubics.cloud/*
 // @run-at       document-idle
 // @grant        none
 // ==/UserScript==

 (function () {
     'use strict';

     const regels = [
         'Gebruikersnaam: ',
         'Wachtwoord: ',
         'Hostnaam: xelionXX.helderbellen.nl',
         'Tenantnaam: pbxX',
         'Intern Nummer: 2XX',
         'Direct Nummer: +31XXXXXXXXX'
     ].join('\n');

     function invullen() {
         if (location.pathname !== '/' || location.search) return true;

         const tekstvak = document.getElementById('secret');

         if (!tekstvak || tekstvak.tagName !== 'TEXTAREA') {
             return false;
         }

         if (tekstvak.disabled || tekstvak.readOnly) return true;

         if (!tekstvak.value.trim()) {
             tekstvak.value = regels;
             tekstvak.dispatchEvent(
                 new Event('input', { bubbles: true })
             );
             tekstvak.dispatchEvent(
                 new Event('change', { bubbles: true })
             );
         }

         tekstvak.style.minHeight = '200px';
         return true;
     }

     if (!invullen()) {
         const observer = new MutationObserver(() => {
             if (invullen()) observer.disconnect();
         });

         observer.observe(document.documentElement, {
             childList: true,
             subtree: true
         });
     }
 })();
