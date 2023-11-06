document.addEventListener('DOMContentLoaded', function () {
    const extractButton = document.getElementById('extractButton');
    


    extractButton.addEventListener('click', function () {
        console.log('Button clicked')

        const textInput = document.getElementById('textInput');
        const allLangText = textInput.value;
        const projectLang = getProjectLang()
        


       runScript(allLangText, projectLang);

       chrome.runtime.onMessage.addListener((resultText) => {
            result = resultText.resultText
            const extractList = document.getElementById('projectList');
            extractList.textContent = `Мови проєкту ${result.project}`
            console.log(result)
            console.log(extractList)
            

            for (const key in result.mainTxt) {
                const li = document.createElement('li');
                li.textContent = result.mainTxt[key];

                if(li.textContent.includes("БІДА")) {
                    li.style.color = 'red'
                } else {
                    li.style.color = 'green'
                }

                extractList.appendChild(li);
            }

            
       })
        
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

                        const templateText = getTextFromLica()
                        const exelText = getExelString(allLangText)
                        console.log(templateText)
                        console.log(exelText)


                        let resultText = compareAllTexts(templateText, exelText)

                        chrome.runtime.sendMessage({ resultText });

                        function getProjectName() {
                            let dropDownElement = this.document.querySelector('.chosen-single')
                            let projectName = dropDownElement.querySelector('span')
                        
                            return projectName.innerText
                        }

                        function getTextFromLica() {
                            let crmLangElements = {globalText: {}, sideText: {}}
                            let project = getProjectName()

                            for(let i = 0; i < Object.keys(projectLang[project]).length; i++) {
                                let textTab = document.getElementById(`text_${projectLang[project][i]}`)
                                let textSide = document.getElementById(`buttons_${projectLang[project][i]}`).querySelector('input[type="text"]');


                                crmLangElements.globalText[projectLang[project][i]] = textTab.innerText
                                crmLangElements.sideText[projectLang[project][i]] = textSide.value
                            }
                            
                            return crmLangElements
                        }

                        function getExelString(inputString) {
                            
                            const project = getProjectName()
                            const rows = inputString.trim().split('\n');
                            const extendRes = {mainText: {}, buttonText: {}}

                            let mTextArr = []
                            let btnTextArr = []
                        
                            for (const row of rows) {
                                const columns = row.split('\t');
                                for (let i = 0; i < columns.length; i++) {
                                    if (i % 2 === 0) {
                                        mTextArr.push(columns[i]);
                                    } else {
                                        btnTextArr.push(columns[i]);
                                    }
                                }
                            }

                            mText = mTextArr.filter(item => item.trim() !== '')
                            btnText = btnTextArr.filter(item => item.trim() !== '')

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

                        function compareAllTexts(LicaText, ExelText) {

                            let comparison = {mainTxt: {}, sideTxt: {}, project: getProjectName()}
                            
                    
                            for (const key in LicaText.globalText) {
                                const licaTextValue = stripHtmlTagsAndSpaces(LicaText.globalText[key]);
                                const exelTextValue = stripHtmlTagsAndSpaces(ExelText.mainText[key]);
                                const licaTextSideValue = stripHtmlTagsAndSpaces(LicaText.sideText[key]);
                                const exelTextSideValue = stripHtmlTagsAndSpaces(ExelText.buttonText[key]);
                        
                                if (licaTextValue !== exelTextValue || licaTextSideValue !== exelTextSideValue) {
                                    comparison.mainTxt[key] = `БІДА на ${key} мові`
                                    //console.log(`Mismatch in ${key}`);
                                    //console.log(`LicaText: ${licaTextValue}`);
                                    //console.log(`ExelText: ${exelTextValue}`);
                                } else{
                                    comparison.mainTxt[key] = `На ${key} мові все ок`
                                    //console.log(`помилок НЕМАЄЄЄ на ${key}`)
                                    //console.log(`LicaText: ${licaTextValue}`);
                                    //console.log(`ExelText: ${exelTextValue}`);
                                }
                            }
                            
                            /*for (const key in LicaText.sideText) {
                                const licaTextValue = stripHtmlTagsAndSpaces(LicaText.sideText[key]);
                                const exelTextValue = stripHtmlTagsAndSpaces(ExelText.buttonText[key]);
                        
                                if (licaTextValue !== exelTextValue) {
                                    comparison.sideTxt[key] = `Несостиковка на ${key} мові`
                                    //console.log(`Mismatch in ${key}`);
                                    //console.log(`LicaText: ${licaTextValue}`);
                                    //console.log(`ExelText: ${exelTextValue}`);
                                }
                                else{
                                    comparison.sideTxt[key] = `На ${key} мові все ок`
                                    //console.log(`помилок НЕМАЄЄЄ на ${key}`)
                                    //console.log(`LicaText: ${licaTextValue}`);
                                    //console.log(`ExelText: ${exelTextValue}`);
                                }
                            }*/

                            return comparison
                     
                        }
                        

                        function stripHtmlTagsAndSpaces(stringToFilter) {
                            // Remove HTML tags
                            const stringWithoutTags = stringToFilter.replace(/<[^>]*>/g, '');
                        
                            // Remove non-breaking spaces (&nbsp;)
                            const stringWithoutNonBreakingSpaces = stringWithoutTags.replace(/&nbsp;/g, ' ');
                        
                            // Trim extra whitespaces
                            const trimmedString = stringWithoutNonBreakingSpaces.replace(/\s+/g, ' ').trim();
                        
                            // Remove extra double quotes
                            const sanitizedString = trimmedString.replace(/"/g, '').trim();
                        
                            return sanitizedString;
                        }
                        
                        
                        const string1 = getTextFromLica().globalText.ru
                        
                        const string2 = getExelString(allLangText).mainText.ru
                        
                        const filteredString1 = stripHtmlTagsAndSpaces(string1);

                        const filteredString2 = stripHtmlTagsAndSpaces(string2);

                        
                       

                        //console.log(filteredString1.toString())
                        //console.log(filteredString2.toString())
                        const result = filteredString1 === filteredString2;
                        //console.log(result); // This will output "true"


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
        Spinamba: ['ru', 'en', 'tr', 'de', 'pl', 'es', 'pt', 'sv', 'fi', 'no'],
        Slottyway: ['ru', 'en', 'tr', 'pl', 'de', 'es', 'pt', 'sv', 'fi', 'no'],
        AllrightCasino: ['ru', 'en', 'tr', 'pl', 'de', 'es', 'pt', 'ja', 'sv', 'fr', 'fi', 'no'],
        Spinbounty: ['ru', 'en', 'de', 'pl', 'fr'],
        Magic365: ['ru', 'en', 'pl'],
    }
}


