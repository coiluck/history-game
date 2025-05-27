// playableなキャラクターのデータのキャッシュ
let charactersDataCacheAtGame = null;

async function getCharactersDataAtGame() {
  if (!charactersDataCacheAtGame) {
    const response = await fetch('data.json');
    charactersDataCacheAtGame = await response.json();
  }
  return charactersDataCacheAtGame;
}
// non-playableなキャラクターのデータのキャッシュ
let gameDataCache = null;
async function getGameData() {
  if (!gameDataCache) {
    const response = await fetch('gamedata.json');
    gameDataCache = await response.json();
  }
  return gameDataCache;
}

// 選択中のキャラクターの情報（ほかは使うの最初だけだからidで取得する）
let currentCharacterId = null;
let currentCharacterBirth = null;
let currentCharacterDeath = null;

document.getElementById('btn-start').addEventListener('click', async () => {
  try {
    // キャラクターデータの初期化
    await getCharactersDataAtGame();
    
    // 選択中のキャラを取得
    currentCharacterId = localStorage.getItem('currentCharacter');
    console.log(`${currentCharacterId}のidの人物でゲームを開始します`);
    const currentCharacter = charactersDataCacheAtGame.find(character => character.id === Number(currentCharacterId));
    
    if (!currentCharacter) {
      throw new Error('Character not found');
    }

    currentCharacterBirth = currentCharacter.birth;
    currentCharacterDeath = currentCharacter.death;
    
    // 選択中のキャラをセット
    document.getElementById('game-character-image').querySelector('img').src = currentCharacter.imgpath;
    document.getElementById('game-character-name').textContent = currentCharacter.name;
    document.getElementById('game-character-dates').textContent = `${currentCharacterBirth} - ${currentCharacterDeath}`;
  } catch (error) {
    console.error('Error initializing game:', error);
    alert('ゲームの初期化中にエラーが発生しました。');
  }
  initGame();
});

// ゲームで使う変数
let lives = 3;
let score = 0;
let targetCharacter = null;
let choices = [];

function initGame() {
  lives = 3;
  score = 0;
  targetCharacter = null;
  choices = [];

  document.getElementById('game-score').textContent = `正解数: ${score}`;
  document.querySelector('.lives-container').innerHTML = '';
  for (let i = 0; i < lives; i++) {
    document.querySelector('.lives-container').innerHTML += '<span class="heart">❤️</span>';
  }
}

// フリップ効果で使う変数
let isFlipping = false;
let isFlipped = false;

function disableButtons() {
  document.querySelectorAll('.choice-button').forEach(button => {
    button.disabled = true;
  });
  isFlipping = true;
}

function enableButtons() {
  document.querySelectorAll('.choice-button').forEach(button => {
    button.disabled = false;
  });
  isFlipping = false;
}

function flipCards() {
  if (isFlipping) return;
  
  disableButtons();
  
  const targetCardWrapper = document.querySelector('.card-wrapper');
  
  if (isFlipped) {
      targetCardWrapper.classList.remove('flipped');
      isFlipped = false;
  } else {
      targetCardWrapper.classList.add('flipped');
      isFlipped = true;
  }
  
  setTimeout(enableButtons, 600);
}

document.querySelectorAll('.choice-button').forEach(button => {
  button.addEventListener('click', flipCards);
});


