// 呼び出されたときにキャッシュがあればそれを返し、なければdata.jsonを読み込む
let charactersDataCache = null;
async function getCharactersData() {
  if (!charactersDataCache) {
    const response = await fetch('data.json');
    charactersDataCache = await response.json();
  }
  return charactersDataCache;
}

// トップへボタンを押したとき
document.querySelector('.btn-secondary').addEventListener('click', async () => {
  // モーダルを遷移
  document.getElementById('modal-select').classList.remove('fast-fadein');
  document.getElementById('modal-select').classList.add('fast-fadeout');
  
  // データを取得
  const charactersData = await getCharactersData();
  
  setTimeout(() => {
    document.getElementById('modal-select').style.display = 'none';
    document.getElementById('modal-select').classList.remove('fast-fadeout');
    document.getElementById('modal-toppage').classList.add('fast-fadein');
    document.getElementById('modal-toppage').style.display = 'block';
    // データを選択中のものにリセット
    let currentCharacterId = localStorage.getItem('currentCharacter');
    const currentCharacter = charactersData.find(char => char.id === currentCharacterId);
    if (currentCharacter) {
      document.querySelector('.character-info-select h3').textContent = currentCharacter.name;
      document.querySelector('.character-info-select #birth-year-select').textContent = currentCharacter.birth;
      document.querySelector('.character-info-select #death-year-select').textContent = currentCharacter.death;
      document.getElementById('description-select').textContent = currentCharacter.effect;
    }
  }, 500);
});

// 選択ボタンを押したとき
document.querySelector('.btn-primary').addEventListener('click', async () => {
  // データを取得
  const charactersData = await getCharactersData();
  // 選択中のキャラクター特定
  const currentCharacterName = document.querySelector('.character-info-select h3').textContent;
  const currentCharacter = charactersData.find(char => char.name === currentCharacterName);
  const availableCharacters = window.currentUser.character || [];
  if (currentCharacter && availableCharacters.includes(currentCharacter.id) ) {
    localStorage.setItem('currentCharacter', currentCharacter.id);
    // 選択中のキャラクターをTopページに反映
    document.querySelector('.character-name').textContent = currentCharacter.name;
    document.getElementById('birth-year').textContent = currentCharacter.birth;
    document.getElementById('death-year').textContent = currentCharacter.death;
    document.getElementById('description').innerHTML = currentCharacter.description;
    document.getElementById('character-image').src = currentCharacter.imgpath;
  } else {
    // 選択中のキャラクターが所持していないキャラクターの場合
    // ただし、このエラーハンドリングはcursor: not-allowedによってボタンを押せなくするところでするべき
    // これはCSSを書き換えられた場合のための予備であり、通常は表示されない、はず
    alert('所持していないキャラクターです');
  }
  
  // モーダルを遷移
  document.getElementById('modal-select').classList.remove('fast-fadein');
  document.getElementById('modal-select').classList.add('fast-fadeout');
  setTimeout(() => {
    document.getElementById('modal-select').style.display = 'none';
    document.getElementById('modal-select').classList.remove('fast-fadeout');
    document.getElementById('modal-toppage').classList.add('fast-fadein');
    document.getElementById('modal-toppage').style.display = 'block';
  }, 500);
});

// キャラクター選択画面を開いたときにグリッドを初期化
document.getElementById('btn-characters').addEventListener('click', () => {
  initializeCharacterGrid();
});


// modal-selectのキャラクターのセット
async function initializeCharacterGrid() {
  try {
    // data.jsonを読み込み
    const response = await fetch('data.json');
    const charactersData = await response.json();
    
    // character-gridコンテナを取得
    const characterGrid = document.querySelector('.character-grid');

    // character-grid内の子要素を一度すべて削除
    characterGrid.innerHTML = '';

    // 現在のキャラクターIDを取得（最初に選択されるキャラクター）
    const currentCharacterId = parseInt(localStorage.getItem('currentCharacter'));
    
    // window.currentUser.characterの配列を取得（利用可能なキャラクターのID配列）
    const availableCharacters = window.currentUser.character || [];
    
    // キャラクターの表示順序を整理
    let orderedCharacters = [];
    
    // 最初に現在選択されているキャラクターを追加
    const currentCharacter = charactersData.find(char => char.id === currentCharacterId);
    if (currentCharacter) {
      orderedCharacters.push(currentCharacter);
    }
    
    // 次に所持しているキャラクター（現在のキャラクター以外）を追加
    const ownedCharacters = charactersData.filter(char => 
      char.id !== currentCharacterId && availableCharacters.includes(char.id)
    );
    orderedCharacters = orderedCharacters.concat(ownedCharacters);
    
    // 最後に所持していないキャラクターを追加
    const unownedCharacters = charactersData.filter(char => 
      char.id !== currentCharacterId && !availableCharacters.includes(char.id)
    );
    orderedCharacters = orderedCharacters.concat(unownedCharacters);
    
    // 40個のcharacter-itemを作成
    for (let i = 0; i < 40; i++) {
      const characterItem = document.createElement('div');
      // 最初のアイテムにselectedクラスを追加
      if (i === 0) {
        characterItem.className = 'character-item selected';
      } else {
        characterItem.className = 'character-item';
      }
      // キャラクターデータが存在する場合
      if (i < orderedCharacters.length) {
        const character = orderedCharacters[i];
        // キャラクターが利用可能かどうかチェック
        const isAvailable = availableCharacters.includes(character.id);
        // 未所持の場合はdisabledクラスを追加
        if (!isAvailable) {
          characterItem.classList.add('character-card-disabled');
        }
        // 画像要素を作成
        const img = document.createElement('img');
        img.src = character.imgpath;
        img.alt = character.name;
        // 画像をcharacter-itemに追加
        characterItem.appendChild(img);
        // クリック時にcharacter-info-selectに人物の情報を表示
        characterItem.addEventListener('click', function() {
          document.querySelector('.character-info-select h3').textContent = character.name;
          // 生年月日を表示
          document.querySelector('.character-info-select #birth-year-select').textContent = character.birth;
          // 没年月日を表示
          document.querySelector('.character-info-select #death-year-select').textContent = character.death;
          // 業績を表示
          document.querySelector('.character-info-select #description-select').innerHTML = character.description;
          
          // 所持状態に応じて異なるイベントハンドラを実行
          if (isAvailable) {
            clickOwnedCharacters();
          } else {
            clickUnwnedCharacters();
          }
        });
      }
      // character-itemをgridに追加
      characterGrid.appendChild(characterItem);
    }
    // 選択中のキャラクターの情報をcharacter-info-selectに表示
    document.querySelector('.character-info-select h3').textContent = currentCharacter.name;
    // 生年月日を表示
    document.querySelector('.character-info-select #birth-year-select').textContent = currentCharacter.birth;
    // 没年月日を表示
    document.querySelector('.character-info-select #death-year-select').textContent = currentCharacter.death;
    // 業績を表示
    document.querySelector('.character-info-select #description-select').innerHTML = currentCharacter.description;
  } catch (error) {
    console.error('Error loading character data:', error);
  }
}

// 所持しているキャラクターをクリックしたときの処理
function clickOwnedCharacters() {
  // 選択ボタンを押せるようにする
  const selectButton = document.querySelector('.btn-primary');
  selectButton.disabled = false;
  // 今まで.selectedクラスがついていたものから.selectedクラスを削除
  const selectedCharacter = document.querySelector('.character-item.selected');
  if (selectedCharacter) {
    selectedCharacter.classList.remove('selected');
  }
  // 選択したキャラの画像に.selectedクラスを追加
  this.classList.add('selected');
}

// 所持していないキャラクターをクリックしたときの処理
function clickUnwnedCharacters() {
  // 選択ボタンを押せなくする
  const selectButton = document.querySelector('.btn-primary');
  selectButton.disabled = true;
}
