import {getProjectLang, getRadiobutton} from './scripts/setLanguages.js'


document.addEventListener('DOMContentLoaded', function () {
    const extractButton = document.getElementById('extractButton');

    extractButton.addEventListener('click', function () {
        const radioTemplate = getRadiobutton()
        console.log(radioTemplate)
        const allLangText = document.getElementById('textInput').value;
        const projectLang = getProjectLang(radioTemplate)
        console.log(projectLang)

        runScript(allLangText, projectLang, radioTemplate)

        chrome.runtime.onMessage.addListener((resultText) => {
            let result = resultText.resultText
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

            processNumbersProblem()
            
            function processNumbersProblem() {
                //Вимбачте за гівнокод
                if(!checkGlobalTemplateNumLen) {
                    for(const key in nmbProblem.templateText.globalText) {
                        const li = document.createElement('li');
                        li.style.color = 'red'
                        li.textContent = `На ${key.toUpperCase()} мові ${nmbProblem.templateText.globalText[key].length} цифрових символів(Головний текст)`
                        otherProblems.appendChild(li)
                    }
                    
                } else if(!checkSideTemplateNumLen) {
                    for(const key in nmbProblem.templateText.sideText) {
                        const li = document.createElement('li');
                        li.style.color = 'red'
                        li.textContent = `На ${key.toUpperCase()} мові ${nmbProblem.templateText.sideText[key].length} цифрових символів(Текст кнопки або тайтла)`
                        otherProblems.appendChild(li)
                    }
                }

                if (!checkGlobalTemplateNumVal) {
                    const li = document.createElement('li');    
                    let incorectVal = findKeyValuesNotEqualToMajority(nmbProblem.templateText.globalText)
                    li.style.color = 'red'
                    li.textContent = `Значення цифр сходяться не всюди(дата, ставка, призові і т. д.) на мовах: ${Object.keys(incorectVal)} (Головний текст)`
                    otherProblems.appendChild(li)
                } else if (!checkSideTemplateNumLVal) {
                    const li = document.createElement('li');    
                    let incorectVal = findKeyValuesNotEqualToMajority(nmbProblem.templateText.sideText)
                    li.style.color = 'red'
                    li.textContent = `Значення цифр сходяться не всюди(дата, ставка, призові і т. д.) на мовах: ${Object.keys(incorectVal)} (Текст кнопки або тайтла)`
                    otherProblems.appendChild(li)
                }

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
                        
                        console.log(templateText)
                        console.log(exelText)
                        //console.log(radioTemp)
    
    
                        let resultText = compareAllTexts(templateText, exelText)
                        chrome.runtime.sendMessage({ resultText });
    
                        function getProjectName() {
                          let dropDownElement = this.document.querySelector('.chosen-single');
                      
                          // Check if dropDownElement or the span element is not found
                          if (!dropDownElement) {
                              // Search for the chosen element in the HTML
                              let selectedOption = document.querySelector('#brand_id option:checked');
                      
                              // Return the text content of the selected option or a default value if not found
                              return selectedOption ? selectedOption.textContent : 'DefaultProjectName';
                          }
                      
                          let projectNameElement = dropDownElement.querySelector('span');
                      
                          // Check if projectNameElement is not found
                          if (!projectNameElement || projectNameElement.innerText === undefined) {
                              // Search for the chosen element in the HTML
                              let selectedOption = document.querySelector('#brand_id option:checked');
                      
                              // Return the text content of the selected option or a default value if not found
                              return selectedOption ? selectedOption.textContent : 'DefaultProjectName';
                          }
                      
                          // Return the text content of the projectNameElement
                          return projectNameElement.innerText;
                      }
    
                        function getTextFromMelica() {
                            let crmLangElements = {globalText: {}, sideText: {}}
                            let project = getProjectName()
    
                            if(radioTemp === "telegramTemplate") {
                                return processTelegramTemplate()
                            } else if (radioTemp === "pushTemplate") {
                                return processPushTemplate()
                            } else if (radioTemp === "smsTemplate") {
                                return processSmsTemplate()
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
                                crmLangElements.sideText = processUserNameTitle(crmLangElements.sideText) 
                                
                                return crmLangElements
                            }
                            //Функція яка вирізає [USER:%user_name%, 1|1]
                            function processUserNameTitle(titleText) {
                                
                                for(let key in titleText) {
                                    if(titleText[key].toLowerCase().includes('user_name_ru')) alert('Присутній user_name_ru')
    
                                    if(titleText[key].includes('[') && titleText[key].includes(']')) {
                                        let lapki = []
                                        //
                                        let parametr0 = titleText[key].indexOf('[') - 1 >= 0 ? titleText[key][0] : '';
                                        let parametr1 = titleText[key].slice(titleText[key].indexOf(']') - 1, titleText[key].indexOf(']'))
                                        let parametr2 = titleText[key].slice(titleText[key].indexOf(']') + 1, titleText[key].length)
    
                                        lapki.push(parametr0 + parametr1 + parametr2)
                                        
                                        //console.log(lapki.join('').toString())
                                        titleText[key] = lapki.join('').toString()
                                    }
                                }
                                return titleText
                            }

                            function processSmsTemplate() {
                                for (let i = 0; i < projectLang[project].length; i++) { 
                                    const langKey = projectLang[project][i];
                                    const tempLang = (langKey === 'ru') ? 'sms_text_' : `text_${langKey}`
                                    let constTab

                                    if (tempLang === 'sms_text_'){
                                        constTab = document.getElementById(tempLang).innerHTML;
                                        crmLangElements.globalText[langKey] = constTab;
                                        crmLangElements.sideText[langKey] = '';
                                    } else {
                                        constTab = document.getElementById(tempLang).innerHTML;
                                        crmLangElements.globalText[langKey] = constTab;
                                        crmLangElements.sideText[langKey] = '';
                                    }
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
                                    if(radioTemp !== "smsTemplate") {
                                        if (i % 2 === 0) {
                                            mTextArr.push(columns[i]);
                                        } else {
                                            btnTextArr.push(columns[i]);
                                        }
                                    } else {      
                                        mTextArr.push(columns[i]);
                                        btnTextArr.push('');
                                    }

                                }
                            }


                            mText = mTextArr.filter(item => item.trim() !== '')
                            btnText = btnTextArr.filter(item => item.trim() !== '')
  
                            for(let i = 0; i < Object.keys(projectLang[project]).length; i++) {
                                const langKeys = projectLang[project][i]
    
                                extendRes.mainText[langKeys] = mText[i]
                                extendRes.sideText[langKeys] = btnText[i]
    
                                if(extendRes.mainText[langKeys] === undefined ) {
                                    extendRes.mainText[langKeys] = extendRes.mainText['en']
                                    extendRes.sideText[langKeys] = extendRes.sideText['en']
                                }
                            }

                            
    
                            if(radioTemp === "pushTemplate") {
                                let tempMain = extendRes.sideText
                                let tempSide = extendRes.mainText
                                
                                extendRes.mainText = tempMain
                                extendRes.sideText = tempSide
                            }

                            if(radioTemp == "smsTemplate") {
                                let tempSide
                                for(let i = 0; i < Object.keys(projectLang[project]).length; i++) {
                                    tempSide = ''
                                    extendRes.sideText[projectLang[project][i]] = tempSide
                                }
                            }
    
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
    
    
                            const totalfullfinalyaaa = sanitizedString.replace('amp;', '')
                        
                            return totalfullfinalyaaa;
                        }
    
                        function getProblemsWithImage() {
                            let project = getProjectName()
                            let problems = []
                            if(radioTemp === "telegramTemplate") {
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
                            } else if(radioTemp === "pushTemplate") {
                                let iconLink = document.getElementById(`icon_name`).value
                                let imgInk = document.getElementById(`img_name`).value
                                let linkLINK = document.getElementById(`link`).value
    
                                if(iconLink.trim() === "") {
                                    problems.push(`Відсутній лінк на іконку`)
                                } 
    
                                if(imgInk.trim() === "") {
                                    problems.push(`Відсутній лінк на картинку`)
                                }
    
                                if(linkLINK.trim() === '') {
                                    problems.push(`Відсутній лінк`)
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

});


