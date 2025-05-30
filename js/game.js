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
  console.log(`Now isFlipped: ${isFlipped}`);
  setTimeout(enableButtons, 600);
}



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
  setTimeout(newQuestion, 1000);
});

// ゲームで使う変数
let lives = 3; // 残りのライフ
let score = 0; // 正解数
let choices = []; // これ何のためにあるんだっけ？？？
// これを使って比較
let nowTargetBirth = null;
let nowTargetDeath = null;

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

async function newQuestion() {
  // 次の人物を取得
  const nextCharacterId = await getNewCharacterId();
  // データを反映
  const nextCharacter = gameDataCache.find(character => character.id === Number(nextCharacterId));
  nowTargetBirth = Number(nextCharacter.birth);
  nowTargetDeath = Number(nextCharacter.death);
  if (isFlipped) {
    // 今は裏側->card-front側に書く
    document.getElementById('target-name-front').textContent = nextCharacter.name;
  } else {
    // 今は表側->card-back側に書く
    document.getElementById('target-name-back').textContent = nextCharacter.name;
  }
  // 更新した側にひっくり返す
  flipCards();
}

async function getNewCharacterId() {
  const gameData = await getGameData();
  // 最初のIDと最後のIDを取得
  const minId = gameData[0].id;
  const maxId = gameData[gameData.length - 1].id;
  let randomId;
  do {
    randomId = Math.floor(Math.random() * (maxId - minId + 1)) + minId;
  } while (randomId === currentCharacterId || randomId === 22 || randomId === 25 || randomId === 199 || randomId === 193);
  // gamedata.jsonにイブン・バットゥータを2個入れてしまっていた...
  // ヴァスコ・ダ・ガマも2個入れてしまっていた...
  // 王直の生年が不明だからデータから削除
  // ロックが二人いた
  // この値は選択中のキャラクターではない
  return randomId;
}

async function checkAnswer(event) {
  // クリックされたボタン要素を取得
  const clickedButton = event.target;
  const choiceType = clickedButton.dataset.choice;
  // どのボタンがクリックされたかを判別
  switch (choiceType) {
    case 'older':
      // 今の人物の誕生より前に死んだ
      if (nowTargetDeath < currentCharacterBirth) {
        // 正解
        score++;
        document.getElementById('game-score').textContent = `正解数: ${score}`;
      } else {
        // 不正解
        takeDamage();
      }
      break;
    case 'same-era':
      // 時代を共にする
      if (nowTargetDeath >= currentCharacterBirth && currentCharacterDeath >= nowTargetBirth) {
        // 正解
        score++;
        document.getElementById('game-score').textContent = `正解数: ${score}`;
      } else {
        // 不正解
        takeDamage();
      }
      break;
    case 'newer':
      // 今の人物の死後に生まれた
      if (nowTargetBirth > currentCharacterDeath) {
        // 正解
        score++;
        document.getElementById('game-score').textContent = `正解数: ${score}`;
      } else {
        // 不正解
        takeDamage();
      }
      break;
    default:
      console.log('不明なボタンが押されました。');
      break;
  }
  // 問題がないのなら次の問題へ
  newQuestion();
}

document.querySelectorAll('.choice-button').forEach(button => {
  button.addEventListener('click', async (event) => {
    await checkAnswer(event);
  });
});

function takeDamage() {
  lives--;
  // 画面を赤く
  if (lives <= 0) {
    // ゲームオーバー
    alert('ゲームオーバーです。');
    return;
  }
  document.querySelector('.lives-container').innerHTML = '';
  for (let i = 0; i < lives; i++) {
    document.querySelector('.lives-container').innerHTML += '<span class="heart">❤️</span>';
  }
}