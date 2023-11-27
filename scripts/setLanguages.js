export function getProjectLang(radioTemplate) {
    let allItems = document.querySelectorAll('#itemList li');
    let selectedItemsSorted = Array.from(allItems)
      .filter(item => item.classList.contains('selected'))
      .sort((a, b) => {
        const idA = parseInt(a.id);
        const idB = parseInt(b.id);
        return idA - idB;
      })
      .map(item => item.textContent);

    if (selectedItemsSorted.length > 0 ) {
        return {
            Viks: selectedItemsSorted,
            Slottica: selectedItemsSorted,
            SuperCat: selectedItemsSorted,
            LuckyBirdCasino: selectedItemsSorted,
            Spinamba: selectedItemsSorted,
            Slottyway: selectedItemsSorted,
            AllrightCasino: selectedItemsSorted,
            Spinbounty: selectedItemsSorted,
            Magic365: selectedItemsSorted,
            Spinado: selectedItemsSorted,
        }
    } else if (radioTemplate === "telegramTemplate") {
        return {
            Viks: ['ru', 'en', 'uz'],
            Slottica: ['ru', 'en', 'de', 'pl', 'tr', 'es', 'pt', 'sv', 'ja', 'kk', 'fr', 'hi', 'bn', 'az', 'fi', 'no'],
            SuperCat: ['ru', 'en', 'de', 'pl', 'tr', 'es', 'pt', 'fi', 'no'],
            LuckyBirdCasino: ['ru', 'en', 'de', 'pl', 'tr', 'es', 'pt', 'fi', 'no'],
            Spinamba: ['ru', 'en', 'tr', 'de', 'pl', 'es', 'pt', 'sv', 'fi', 'no'],
            Slottyway: ['ru', 'en', 'tr', 'pl', 'de', 'es', 'pt', 'sv', 'fi', 'no'],
            AllrightCasino: ['ru', 'en', 'tr', 'pl', 'de', 'es', 'pt', 'ja', 'sv', 'fr', 'fi', 'no'],
            Spinbounty: ['ru', 'en', 'de', 'pl', 'fr'],
            Magic365: ['ru', 'en', 'pl'],
            Spinado: ['ru', 'en', 'pl', 'es', 'pt', 'kk'],
        };
    } else if (radioTemplate === "pushTemplate") {
        return {
            Viks: ['ru', 'en', 'uz'],
            Slottica: ['ru', 'en', 'de', 'pl', 'tr', 'es', 'pt', 'sv', 'fr', 'ja', 'kk', 'hi', 'bn', 'az', 'fi', 'no'],
            SuperCat: ['ru', 'en', 'de', 'pl', 'tr', 'es', 'pt', 'fi', 'no'],
            LuckyBirdCasino: ['ru', 'en', 'de', 'pl', 'tr', 'es', 'pt', 'fi', 'no'],
            Spinamba: ['ru', 'en', 'de', 'pl', 'tr', 'es', 'pt', 'sv', 'fi', 'no'],
            Slottyway: ['ru', 'tr', 'en', 'de', 'es', 'pl', 'pt', 'sv', 'fi', 'no'],
            AllrightCasino: ['ru', 'en', 'de', 'pl', 'tr', 'es', 'pt', 'ja', 'sv', 'fr', 'fi', 'no'],
            Spinbounty: ['ru', 'en', 'de', 'pl', 'fr'],
            Magic365: ['ru', 'en', 'pl'],
            Spinado: ['ru', 'en', 'pl', 'es', 'pt', 'kk'],
        }
    } else if (radioTemplate === "smsTemplate") {
        return {
            Viks: ['ru', 'en', 'pl'],
            Slottica: ['ru', 'en', 'hi', 'fr', 'de', 'pl', 'tr', 'es', 'pt', 'sv', 'ja', 'kk', 'uz', 'bn', 'az'],
            SuperCat: ['ru', 'en', 'de', 'pl', 'tr', 'es', 'pt', 'fi', 'no'],
            LuckyBirdCasino: ['ru', 'en', 'de', 'pl', 'tr', 'es', 'pt', 'fi', 'no'],
            Spinamba: ['ru', 'en', 'pl', 'es', 'tr', 'de', 'pt', 'fi', 'no'],
            Slottyway: ['ru', 'en', 'de', 'pl', 'tr', 'es', 'pt', 'sv'],
            AllrightCasino: ['ru', 'en', 'pl', 'tr', 'de', 'es', 'pt', 'sv', 'jp', 'fr'],
            Spinbounty: ['ru', 'en', 'de', 'pl', 'fr'],
            Magic365: ['ru', 'en', 'pl'],
            Spinado: ['ru', 'en', 'pl', 'es', 'pt', 'kk'],
        }
    }
}

