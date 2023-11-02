document.addEventListener('DOMContentLoaded', function () {
    const extractButton = document.getElementById('extractButton');
    
    extractButton.addEventListener('click', function () {
        const urlInput = document.getElementById('urlInput');
        const templateUrl = urlInput.value;
        setTemplateInfo(templateUrl);
    });
});



function setTemplateInfo(templateUrl) {
    if (templateUrl) {
        chrome.tabs.query({ active: true, currentWindow: true }, function(tabs) {
            chrome.scripting.executeScript({
                target: { tabId: tabs[0].id },
                function: function (templateUrl) {
                    let new_window = window.open(templateUrl, '_blank');
                    console.log(templateUrl);
                    new_window.addEventListener('load', function() {
                        let Zaholovok = this.document.querySelectorAll('h2');
                        console.log(Zaholovok);
                    });

                    setTimeout(function() {
                        new_window.close()
                    },2000)
                    
                },
                args: [templateUrl]
            });
        });
        
    } else {
        console.log('URL input field is empty.');
    }
}