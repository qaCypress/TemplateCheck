document.addEventListener('DOMContentLoaded', function () {
    const extractButton = document.getElementById('extractButton');

    extractButton.addEventListener('click', function () {
        console.log('Button clicked')

        const radioTemplate = getRadiobutton()
        const allLangText = document.getElementById('textInput').value;
        const projectLang = getProjectLang(radioTemplate)
        

       runScript(allLangText, projectLang, radioTemplate);

       chrome.runtime.onMessage.addListener((resultText) => {
            result = resultText.resultText
            const extractList = document.getElementById('projectList');
            const otherProblems = document.getElementById('OtherProblems')
            const titleList = document.getElementById('titleList');
            const titleList2 = document.getElementById('titleList2');


            titleList.textContent = `Мови проєкту ${result.project} `
            console.log(result)
            //console.log(extractList)
            
            
            //---------------------------------------------------------------------------------------
            for (const key in result.resultOfComparison) {
                const li = document.createElement('li');
                li.textContent = result.resultOfComparison[key];
                li.setAttribute('lang-details', key)
                if(li.textContent.includes("БІДА")) {
                    li.style.color = 'red'
                } else {
                    li.style.color = 'green'
                }

                extractList.appendChild(li);
            }

            //---------------------------------------------------------------------------------------
            //Можливо колись
            /*
            const listItems = document.querySelectorAll('li');
            const detailsContainer = document.getElementById('details-container');
            listItems.forEach(item => {
                item.addEventListener('mouseenter', function () {
                    const details = this.getAttribute('lang-details');
                    detailsContainer.innerHTML = `Текст з екселю: ${result.textForComparison.exelTxt.mainText[details]}`;
                    detailsContainer.style.display = 'block';
                });
                item.addEventListener('mouseleave', function () {
                    detailsContainer.style.display = 'none';
                });
            })*/

            //---------------------------------------------------------------------------------------
            titleList2.textContent = `Інші проблеми`
            if(result.imageProblem !== '') {
                for(let i = 0; i < result.imageProblem.length; i++) {
                    const li = document.createElement('li');
                    li.textContent = result.imageProblem[i]
                    li.style.color = 'red'
    
                    otherProblems.appendChild(li)
                }
            }

            //---------------------------------------------------------------------------------------
            const nmbProblem = result.numbersProblem

            const areAllValuesSameLength = obj => {
                const values = Object.values(obj);
                const firstValue = values[0];
                return values.every(val => val.length === firstValue.length);
            };

            const areAllValuesSame = obj => {
                const values = Object.values(obj);
                const firstValue = values[0];
                return values.every(val => val === firstValue );
            };

            let checkGlobalTemplateNumLen = areAllValuesSameLength(nmbProblem.templateText.globalText)
            let checkSideTemplateNumLen = areAllValuesSameLength(nmbProblem.templateText.sideText)
            let checkGlobalTemplateNumVal = areAllValuesSame(nmbProblem.templateText.globalText)
            let checkSideTemplateNumLVal = areAllValuesSame(nmbProblem.templateText.sideText)


            if(!checkGlobalTemplateNumLen || !checkSideTemplateNumLen) {
                for(const key in nmbProblem.templateText.globalText) {
                    const li = document.createElement('li');
                    li.style.color = 'red'
                    li.textContent = `На ${key.toUpperCase()} мові ${nmbProblem.templateText.globalText[key].length} цифрових символів`
                    otherProblems.appendChild(li)
                }
            } else if (!checkGlobalTemplateNumVal || !checkSideTemplateNumLVal) {
                const li = document.createElement('li');    
                let incorectVal = findKeyValuesNotEqualToMajority(nmbProblem.templateText.globalText)
                li.style.color = 'red'
                li.textContent = `Значення цифр сходяться не всюди(дата, ставка, призові і т. д.) на мовах: ${Object.keys(incorectVal)}`
                otherProblems.appendChild(li)
            }

            function findKeyValuesNotEqualToMajority(obj) {
                // Count occurrences of each value
                const valueCounts = {};
                Object.values(obj).forEach(value => {
                    valueCounts[value] = (valueCounts[value] || 0) + 1;
                });
            
                // Find the majority value(s)
                const majorityValues = Object.keys(valueCounts).filter(key => valueCounts[key] > 1);
            
                // Find key-value pairs where the value is not equal to the majority
                const keyValuesNotEqualToMajority = Object.entries(obj)
                    .filter(([key, value]) => !majorityValues.includes(value))
                    .reduce((acc, [key, value]) => {
                        acc[key] = value;
                        return acc;
                    }, {});
            
                return keyValuesNotEqualToMajority;
            }

       })
    });



    function runScript(allLangText, projectLang, radioTemplate) {
        if (allLangText) {
            chrome.tabs.query({ active: true, currentWindow: true }, function(tabs) {
                chrome.scripting.executeScript({
                    target: { tabId: tabs[0].id },
                    function: function (allLangText, projectLang, radioTemplate) {                        
                        //console.log(getProjectName());
                        //console.log(projectLang);
                        //console.log(allLangText);
                        const radioTemp = radioTemplate
                        const templateText = getTextFromMelica()
                        const exelText = getExelString(allLangText)
                        
                        //console.log(templateText)
                        //console.log(exelText)
                        console.log(radioTemp)


                        let resultText = compareAllTexts(templateText, exelText)
                        chrome.runtime.sendMessage({ resultText });

                        function getProjectName() {
                            let dropDownElement = this.document.querySelector('.chosen-single')
                            let projectName = dropDownElement.querySelector('span')
                        
                            return projectName.innerText
                        }

                        function getTextFromMelica() {
                            let crmLangElements = {globalText: {}, sideText: {}}
                            let project = getProjectName()

                            if(radioTemp === "telegramTemplate") {
                                return processTelegramTemplate()
                            } else if (radioTemp === "pushTemplate") {
                                return processPushTemplate()
                            }

                            function processTelegramTemplate() {
                                for (let i = 0; i < projectLang[project].length; i++) {
                                    const langKey = projectLang[project][i];
                                    const textTab = document.getElementById(`text_${langKey}`);
                                    const textSide = document.getElementById(`buttons_${langKey}`).querySelector('input[type="text"]');
                                    
                                    crmLangElements.globalText[langKey] = textTab.innerText;
                                    crmLangElements.sideText[langKey] = textSide.value;
                                }
                                return crmLangElements
                            }

                            function processPushTemplate() {
                                for (let i = 0; i < projectLang[project].length; i++) {
                                    const langKey = projectLang[project][i];
                                    const tempLang = (langKey === 'ru') ? '' : langKey;
                                    const tempLang2 = (langKey === 'ru') ? '' : `_${langKey}`;
                            
                                    const textTab = document.getElementById(`message_${tempLang}`).innerHTML;
                                    const textSide = document.getElementById(`w_title${tempLang2}`).querySelector('input[type="text"]').value;
                            
                                    crmLangElements.globalText[langKey] = textTab;
                                    crmLangElements.sideText[langKey] = textSide;
                                }
                                return crmLangElements
                            }
                        }

                        function getExelString(inputString) {
                            const project = getProjectName()
                            const rows = inputString.trim().split('\n');
                            const extendRes = {mainText: {}, sideText: {}}

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
                                extendRes.sideText[projectLang[project][i]] = btnText[i]

                                if(extendRes.mainText[projectLang[project][i]] === undefined) {
                                    extendRes.mainText[projectLang[project][i]] = extendRes.mainText['en']
                                    extendRes.sideText[projectLang[project][i]] = extendRes.sideText['en']
                                }
                            }
                            console.log(extendRes)
                            return extendRes;
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

                        function getProblemsWithImage() {
                            let project = getProjectName()
                            let problems = []
                            for(let i = 0; i < Object.keys(projectLang[project]).length; i++) {
                                let imageLink = document.getElementById(`img_name_${projectLang[project][i]}`).value
                                let divButton = document.getElementById(`buttons_${projectLang[project][i]}`)


                                if(imageLink.trim() === "") {                 
                                    problems.push(`Відсутній лінк на картинку на ${projectLang[project][i].toUpperCase()} мові`) 
                                }

                                if(!(divButton.innerHTML.trim() === "")) {
                                    let buttonLink = divButton.querySelectorAll('input[type="text"]')[1].value

                                    if(buttonLink === "") {
                                        problems.push(`Відсутнє посилання під кнопкою на ${projectLang[project][i].toUpperCase()} мові`) 
                                    } 
                                               
                                } else {
                                    problems.push(`Дів з кнопкою пустий на ${projectLang[project][i].toUpperCase()} мові`) 

                                }

                            }
                            return problems
                        }

                        function getAllNumbers() {
                            const templateText = getTextFromMelica()
                            const exelText = getExelString(allLangText)

                            function removeNonNumericSymbolsAndReturnLength(obj) {
                                for (let key in obj) {
                                    if (typeof obj[key] === 'string') {
                                        // Use regular expression to replace non-numeric symbols with an empty string
                                        obj[key] = obj[key].replace(/[^0-9]/g, '');
                                    }
                                }
                            }

                            removeNonNumericSymbolsAndReturnLength(templateText.globalText)
                            removeNonNumericSymbolsAndReturnLength(exelText.mainText)
                            removeNonNumericSymbolsAndReturnLength(templateText.sideText)
                            removeNonNumericSymbolsAndReturnLength(exelText.sideText)


                             return {templateText, exelText}
                        }

                        function compareAllTexts(MelicaText, ExelText) {

                            let comparison = {
                                resultOfComparison: {}, 
                                project: getProjectName(), 
                                imageProblem: getProblemsWithImage(), 
                                textForComparison: {
                                    MelicaTxt: {mainText: {}, sideText: {}}, 
                                    exelTxt: {mainText: {}, sideText: {}}
                                },
                                numbersProblem: getAllNumbers()
                            }
                            
                    
                            for (const key in MelicaText.globalText) {
                                const MelicaTextValue = stripHtmlTagsAndSpaces(MelicaText.globalText[key]);
                                const exelTextValue = stripHtmlTagsAndSpaces(ExelText.mainText[key]);
                                const MelicaTextSideValue = stripHtmlTagsAndSpaces(MelicaText.sideText[key]);
                                const exelTextSideValue = stripHtmlTagsAndSpaces(ExelText.sideText[key]);
                        
                                if (MelicaTextValue !== exelTextValue || MelicaTextSideValue !== exelTextSideValue) {
                                    comparison.resultOfComparison[key] = `БІДА на ${key.toUpperCase()} мові`
                                    comparison.textForComparison.MelicaTxt.mainText[key] = MelicaTextValue
                                    comparison.textForComparison.MelicaTxt.sideText[key] = MelicaTextSideValue
                                    comparison.textForComparison.exelTxt.mainText[key] = exelTextValue
                                    comparison.textForComparison.exelTxt.sideText[key] = exelTextSideValue

                                } else{
                                    comparison.resultOfComparison[key] = `На ${key.toUpperCase()} мові все ок`
                                    comparison.textForComparison.MelicaTxt.mainText[key] = MelicaTextValue
                                    comparison.textForComparison.MelicaTxt.sideText[key] = MelicaTextSideValue
                                    comparison.textForComparison.exelTxt.mainText[key] = exelTextValue
                                    comparison.textForComparison.exelTxt.sideText[key] = exelTextSideValue

                                }
                            }
                            

                            return comparison          
                        }

                
                    },
                    args: [allLangText, projectLang, radioTemplate]            
                });
            });
            
        } else {
            alert('Input field is empty.');
        }

        
    }

    function getRadiobutton() {
        let radioTemplate;
        const checkedRadio = document.querySelector('input[type="radio"]:checked');
        if (checkedRadio) {
            radioTemplate = checkedRadio.id;
        }
        document.getElementById('templateForm').addEventListener('change', (event) => {
            radioTemplate = event.target.id;  
        });
        return radioTemplate
    }
});


function getProjectLang(radioTemplate) {
    if (radioTemplate === "telegramTemplate") {
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
        }
    }
}

