// modal-selectのキャラクターのセットはlogin.jsで行っています
// window.currentUser.characterの設定後に行うためです

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
  
  if (currentCharacter) {
    localStorage.setItem('currentCharacter', currentCharacter.id);
    // 選択中のキャラクターをTopページに反映
    document.querySelector('.character-name').textContent = currentCharacter.name;
    document.getElementById('birth-year').textContent = currentCharacter.birth;
    document.getElementById('death-year').textContent = currentCharacter.death;
    document.getElementById('description').innerHTML = currentCharacter.effect;
    document.getElementById('character-image').src = currentCharacter.imgpath;
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