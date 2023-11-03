document.addEventListener('DOMContentLoaded', function () {
    const extractButton = document.getElementById('extractButton');
        
    extractButton.addEventListener('click', function () {
        console.log('Button clicked')
        const textInput = document.getElementById('textInput');
        const allLangText = textInput.value;
        const projectLang = getProjectLang()


        runScript(allLangText, projectLang);
    });



    function runScript(allLangText, projectLang) {
        if (allLangText) {
            chrome.tabs.query({ active: true, currentWindow: true }, function(tabs) {
                chrome.scripting.executeScript({
                    target: { tabId: tabs[0].id },
                    function: function (allLangText, projectLang) {                        
                        //console.log(getProjectName());
                        //console.log(projectLang);
                        //console.log(allLangText);
                        
                        console.log(getTextFromLica())
                        console.log(parseExelString(allLangText))


                        function getProjectName() {
                            let dropDownElement = this.document.querySelector('.chosen-single')
                            let projectName = dropDownElement.querySelector('span')
                        
                            return projectName.innerText
                        }

                        function getTextFromLica() {
                            let crmLangElements = {}
                            let project = getProjectName()

                            for(let i = 0; i < Object.keys(projectLang[project]).length; i++) {
                                let textTab = document.getElementById(`text_${projectLang[project][i]}`)
                                crmLangElements[projectLang[project][i]] = textTab.innerText
                            }
                            
                            return crmLangElements
                        }

                        function parseExelString(inputString) {
                            const project = getProjectName()
                            const rows = inputString.trim().split('\n');
                            const extendRes = {mainText : {}, buttonText: {}}

                            let mText = []
                            let btnText =[]
                        
                            for (const row of rows) {
                                const columns = row.split('\t');
                                for (let i = 0; i < columns.length; i++) {
                                    if (i % 2 === 0) {
                                        mText.push(columns[i]);
                                    } else {
                                        btnText.push(columns[i]);
                                    }
                                }
                            }

                            for(let i = 0; i < Object.keys(projectLang[project]).length; i++) {
                                extendRes.mainText[projectLang[project][i]] = mText[i]
                                extendRes.buttonText[projectLang[project][i]] = btnText[i]

                                if(extendRes.mainText[projectLang[project][i]] === undefined) {
                                    extendRes.mainText[projectLang[project][i]] = extendRes.mainText['en']
                                    extendRes.buttonText[projectLang[project][i]] = extendRes.buttonText['en']
                                }
                            }

                            return extendRes;
                        }
                    },
                    args: [allLangText, projectLang]            
                });
            });
            
        } else {
            alert('Input field is empty.');
        }

        
    }


});


function getProjectLang() {
    return {
        Viks: ['ru', 'en', 'uz'],
        Slottica: ['ru', 'en', 'de', 'pl', 'tr', 'es', 'pt', 'sv', 'ja', 'kk', 'fr', 'hi', 'bn', 'az', 'fi', 'no'],
        SuperCat: ['ru', 'en', 'de', 'pl', 'tr', 'es', 'pt', 'fi', 'no'],
        LuckyBirdCasino: ['ru', 'en', 'de', 'pl', 'tr', 'es', 'pt', 'fi', 'no'],
        Spinamba: ['ru', 'en', 'tr', 'de', 'es', 'pt', 'sv', 'fi', 'no'],
        Slottyway: ['ru', 'en', 'tr', 'pl', 'de', 'es', 'pt', 'sv', 'fi', 'no'],
        AllrightCasino: ['ru', 'en', 'tr', 'pl', 'de', 'es', 'pt', 'ja', 'sv', 'fr', 'fi', 'no'],
        Spinbounty: ['ru', 'en', 'de', 'pl', 'fr'],
        Magic365: ['ru', 'en', 'pl'],
    }
}


