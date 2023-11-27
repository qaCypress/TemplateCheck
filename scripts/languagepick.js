let counter = 1;

function toggleItem(item, languageCode) {
  item.classList.toggle('selected');

  if (item.classList.contains('selected')) {
    item.id = counter;
    counter++;
    console.log('Clicked item with ID:', item.id);
  } else {
    item.id = '';
  }

  saveState();
}

function saveState() {
  const itemList = document.getElementById('itemList');
  const selectedItems = Array.from(itemList.getElementsByClassName('selected')).map(item => ({
    id: item.id,
    languageCode: item.innerText
  }));

  localStorage.setItem('selectedItems', JSON.stringify(selectedItems));
}

function loadState() {
  const itemList = document.getElementById('itemList');
  const savedItems = JSON.parse(localStorage.getItem('selectedItems')) || [];

  savedItems.forEach(savedItem => {
    const item = Array.from(itemList.getElementsByTagName('LI')).find(item => item.innerText === savedItem.languageCode);

    if (item) {
      item.classList.add('selected');
      item.id = savedItem.id;
    }
  });
}

document.getElementById('itemList').addEventListener('click', function (event) {
  if (event.target.tagName === 'LI') {
    toggleItem(event.target, event.target.innerText);
  }
});

loadState();