// ==UserScript==
// @name         Chainwise Optimalisatie Statusoverzichten
// @namespace    http://tampermonkey.net/
// @version      2.6
// @description  Mutaties aan Status overzichten in Chainwise zodat het overzichterlijker is.
// @author       Gijs Hofman
// @match        https://heldertelecom.chainwisehosted.nl/modules/helpdesk/statusoverzicht_calls_vw.asp*
// @grant        none
// @run-at       document-idle
// @license MIT
// ==/UserScript==

(function() {
    'use strict';

    // -----------------------------------------------------------
    // CONFIGURATIE
    // -----------------------------------------------------------

    const TABEL_SELECTOR = 'table.ListBody.fixed-header';

    // Kolomtitels die VOLLEDIG verborgen moeten worden. (Spaties en hoofdletters worden genegeerd)
    const KOLOM_TITELS_OM_TE_VERBERGEN = [
        "binnen deadline",
        "totaal alle statussen",
        "gereed",
        "gereed vol",
        "eind arc",
        "vrp",
        "exact"
    ];

    // Titels agressief opschonen voor vergelijking (alle spaties en hoofdletters verwijderd)
    const VERBERG_TITELS_SCHOON = KOLOM_TITELS_OM_TE_VERBERGEN.map(t => t.replace(/\s/g, '').toLowerCase());

    // RIJ-TITELS die VOLLEDIG verborgen moeten worden (gebaseerd op de tekst in de EERSTE cel)
    const RIJ_TITELS_OM_TE_VERBERGEN = [
        "totaal",
        "ticket soorten",
        "administratie",
        "bestellingen",
        "engineering",
        "nieuw/ opzegging/ aanpassing - oc | vast",
        "nieuw/ opzegging/ aanpassing - overige | vast",
        "nieuw/ opzegging/ verlenging/ np | mobiel",
        "project",
        //"storing / issue",
        "verzoek binnendienst",
        "verzoek servicedesk",
        "werkzaamheden intern",
        "Uitvoerders",
        "sales am",
        "sales ondersteuning",
        "verlenging en nieuw",
        " "
    ];

    // Titels agressief opschonen voor rij-vergelijking
    const VERBERG_RIJEN_SCHOON = RIJ_TITELS_OM_TE_VERBERGEN.map(t => t.replace(/\s/g, '').toLowerCase());


    const INDEX_UITVOERDER = 0;
    const LAATSTE_KOLOM_INDEX = 13; // Index van de lege kolom

    // Configuratie Rijen (Markering)
    const NAAM_GIJS = 'Gijs Hofman';
    const KLEUR_GIJS_BG = '#cfe2ff';
    const KLEUR_GIJS_RAND = '#0dcaf0';

    const NAAM_SERVICEDESK = 'Afdeling Servicedesk';
    const KLEUR_SD_BG = '#ffc107';
    const KLEUR_SD_RAND = '#b28704';

    const NAAM_TICKET = 'storing / issue';
    const KLEUR_TI_BG = '#f5d7f3';
    const KLEUR_TI_RAND = '#a893a7';

    // -----------------------------------------------------------
    // HULPFUNCTIE: Maak tekst schoon voor vergelijking
    // -----------------------------------------------------------
    function cleanTitle(text) {
        if (!text) return '';
        // Verwijder alle whitespace (inclusief &nbsp; en normale spaties) en zet om naar kleine letters
        return text.replace(/\s/g, '').toLowerCase();
    }

    // -----------------------------------------------------------
    // FUNCTIE 1: VOLLEDIG VERBERGEN VAN KOLOMMEN (Titel-gebaseerd)
    // -----------------------------------------------------------

    function verbergKolommen(table) {
        if (!table) return [];

        const headerRow = table.querySelector('thead tr');
        if (!headerRow) return [];

        const verborgenIndexen = [];

        // 1. Bepaal de indexen op basis van de titels
        headerRow.querySelectorAll('td').forEach((th, index) => {
            const titelSchoneVersie = cleanTitle(th.textContent);

            // console.log(`[Chainwise Debug] Kolom ${index}: '${titelSchoneVersie}'`);

            let moetVerbergen = false;

            // Controleer of de schoongemaakte titel in de lijst staat
            if (VERBERG_TITELS_SCHOON.includes(titelSchoneVersie)) {
                moetVerbergen = true;
            }

            // Expliciete check voor de lege laatste kolom (index 13)
            if (index === LAATSTE_KOLOM_INDEX) {
                 moetVerbergen = true;
            }

            // Pas 'display: none' toe en verzamel de index
            if (moetVerbergen) {
                if (!verborgenIndexen.includes(index)) {
                     verborgenIndexen.push(index);
                }
                th.style.display = 'none';
            }
        });

        // 2. Verberg de cellen in de tbody op basis van de gevonden indexen
        table.querySelectorAll('tbody tr').forEach(row => {
            row.querySelectorAll('td').forEach((td, index) => {
                // De colspan rij skippen we
                if (td.getAttribute('colspan')) return;

                if (verborgenIndexen.includes(index)) {
                    td.style.display = 'none';
                }
            });
        });

        return verborgenIndexen; // Geef de gevonden indexen terug voor de markering
    }

    // -----------------------------------------------------------
    // FUNCTIE 2: RIJEN VERBERGEN, MARKEREN EN OPTIMALISEREN
    // -----------------------------------------------------------

    function markeerEnOptimaliseerRijen(table, kolommen_verborgen) {
        if (!table) return;

        const doelen = [
            { naam: NAAM_GIJS, bg: KLEUR_GIJS_BG, rand: KLEUR_GIJS_RAND },
            { naam: NAAM_SERVICEDESK, bg: KLEUR_SD_BG, rand: KLEUR_SD_RAND },
            { naam: NAAM_TICKET, bg: KLEUR_TI_BG, rand: KLEUR_TI_RAND }
        ];

        table.querySelectorAll('tbody tr').forEach(row => {
            const eersteCel = row.querySelector('td');
            if (!eersteCel) return; // Rij zonder cellen negeren

            // --- NIEUWE STAP 0: RIJEN VERBERGEN (Totaal, ticket soorten, administratie) ---
            const rijTitelSchoneVersie = cleanTitle(eersteCel.textContent);

            if (VERBERG_RIJEN_SCHOON.includes(rijTitelSchoneVersie)) {
                row.style.display = 'none';
                // Stop de verdere verwerking voor deze verborgen rij
                return;
            }
            // Einde nieuwe stap 0


            const uitvoerderCel = row.querySelectorAll('td')[INDEX_UITVOERDER];
            const doel = doelen.find(d => uitvoerderCel && uitvoerderCel.textContent.trim() === d.naam);


            // --- STAP 1: OPTIMALISATIE (Geldt voor ALLE ZICHTBARE rijen) ---

            row.querySelectorAll('td').forEach((td, index) => {
                // Sla de 'uitvoerder' cel (index 0) en colspan rijen over
                if (index > 0 && !td.getAttribute('colspan')) {
                     // Verberg alle kinder-elementen behalve de eerste
                    const kinderen = td.children;
                    for (let i = 1; i < kinderen.length; i++) {
                        kinderen[i].style.display = 'none';
                    }
                }
            });


            // --- STAP 2: MARKERING (Geldt ALLEEN voor Gijs Hofman en Servicedesk) ---

            if (doel) {
                // 1. Pas de markering toe op de rij-eigenschappen
                row.style.outline = `2px solid ${doel.rand}`;
                row.style.fontWeight = 'bold';

                // 2. Pas de gekozen achtergrondkleur per cel toe, ALLEEN op de zichtbare kolommen
                row.querySelectorAll('td').forEach((td, index) => {
                    // Als de cel zichtbaar is (NIET in de lijst van verborgen kolommen)
                    if (!kolommen_verborgen.includes(index)) {
                        td.style.backgroundColor = doel.bg;
                    }
                });
            }
        });
    }


    // -----------------------------------------------------------
    // UITVOERING
    // -----------------------------------------------------------

    const tableElement = document.querySelector(TABEL_SELECTOR);

    if (tableElement) {
        // Functie 1 retourneert de dynamische indexen
        const verborgenIndexen = verbergKolommen(tableElement);

        markeerEnOptimaliseerRijen(tableElement, verborgenIndexen);
    } else {
        console.error('Tampermonkey Script: De hoofdtabel kon niet gevonden worden.');
    }

})();
