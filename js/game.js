import { db } from './login.js';
import { doc, getDoc, updateDoc } from "https://www.gstatic.com/firebasejs/11.8.1/firebase-firestore.js";

// フリップ効果で使う変数
let isFlipping = false;
let isFlipped = false;

function disableButtons() {
  document.querySelectorAll('.choice-button').forEach(button => {
    button.disabled = true;
  });
  isFlipping = true;
  isProcessing = true;  // フリップ中も処理中としてマーク
}

function enableButtons() {
  document.querySelectorAll('.choice-button').forEach(button => {
    button.disabled = false;
  });
  isFlipping = false;
  isProcessing = false;  // フリップ完了時に処理中フラグを解除
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
let nowTargetId = null;
// これを使って比較
let nowTargetName = null;
let nowTargetBirth = null;
let nowTargetDeath = null;
let nowTargetDiscription = null;
// 選択肢の連続クリックによるバグを防ぐ
let isProcessing = false;

function initGame() {
  // 変数の初期化
  lives = 3;
  score = 0;
  nowTargetId = null;
  nowTargetName = null;
  nowTargetBirth = null;
  nowTargetDeath = null;
  nowTargetDiscription = null;
  isProcessing = false;
  isFlipped = false;
  // 表示の初期化
  document.getElementById('damage-modal').style.display = 'none';
  document.getElementById('game-score').textContent = `正解数: ${score}`;
  document.querySelector('.lives-container').innerHTML = '';
  for (let i = 0; i < lives; i++) {
    document.querySelector('.lives-container').innerHTML += '<span class="heart">❤️</span>';
  }
  // flipカードの状態と内容を初期化
  const targetCardWrapper = document.querySelector('.card-wrapper');
  if (targetCardWrapper) {
    targetCardWrapper.classList.remove('flipped');
  }
  document.getElementById('target-name-front').innerHTML = '';
  document.getElementById('target-name-back').textContent = '';
  document.getElementById('judge-correct-incorrect').textContent = '';

}

async function newQuestion() {
  // 次の人物を取得
  const nextCharacterId = await getNewCharacterId();
  // データを反映
  const nextCharacter = gameDataCache.find(character => character.id === Number(nextCharacterId));
  nowTargetId = Number(nextCharacterId);
  nowTargetName = nextCharacter.name;
  nowTargetBirth = Number(nextCharacter.birth);
  nowTargetDeath = Number(nextCharacter.death);
  nowTargetDiscription = nextCharacter.description;
  
  // 変更->表面は正誤判定、裏面が問題
  if (isFlipped) {
    // 今は裏側->card-front側に書く
    console.log('連続の高速なクリックはゲーム動作に悪影響を与えます');
    return;  // 早期リターン
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
  randomId = Math.floor(Math.random() * (maxId - minId + 1)) + minId;
  // gamedata.jsonから削除した人物
  // データのダブり
  // イブン・バットゥータ, ロック, ヴァスコ・ダ・ガマ, マテオリッチ, マリアテレジア, マルコポーロ
  // 人名じゃなかった
  // ジャックリー, フロンド, ラダイト
  // その他の理由
  // ダービー父子、ダライラマ, 王直の生年が不明, ラサール
  // この数字多くなりすぎだし1800以降の人物入れてナポレオンで昔連打作戦つぶすか
  // 22 25 76 83 91 93 143 159 163 166 175 180 199 193
  // この値は選択中のキャラクター以外の人物のidではなくないか。gamedata.jsonとdata.jsonのidは一致しない
  // じゃあdo while文なくして重複を許そう
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
        document.getElementById('judge-correct-incorrect').textContent = "正解";
        document.getElementById('target-name-front').innerHTML = `${nowTargetName}<br><br>${nowTargetBirth} - ${nowTargetDeath}<br><br>${nowTargetDiscription}`;
        flipCards();
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
        document.getElementById('judge-correct-incorrect').textContent = "正解";
        document.getElementById('target-name-front').innerHTML = `${nowTargetName}<br><br>${nowTargetBirth} - ${nowTargetDeath}<br><br>${nowTargetDiscription}`;
        flipCards();
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
        document.getElementById('judge-correct-incorrect').textContent = "正解";
        document.getElementById('target-name-front').innerHTML = `${nowTargetName}<br><br>${nowTargetBirth} - ${nowTargetDeath}<br><br>${nowTargetDiscription}`;
        flipCards();
      } else {
        // 不正解
        takeDamage();
      }
      break;
    default:
      console.log('不明なボタンが押されました。');
      break;
  }
  if(score >= 30) {
    // ゲーム終了
    gameFinish();
  } else {
    // 問題がないのなら次の問題へ
    setTimeout(newQuestion, 1500);
  }
}

document.querySelectorAll('.choice-button').forEach(button => {
  button.addEventListener('click', async (event) => {
    // 連続クリック防止
    if (isProcessing || isFlipping) return;
    isProcessing = true;
    
    // 回答の正誤判定
    await checkAnswer(event);
    
    // 次の問題への移行は、アニメーション完了後に自動的に行われる
  });
});

function takeDamage() {
  lives--;
  document.getElementById('judge-correct-incorrect').textContent = "不正解";
  document.getElementById('target-name-front').innerHTML = `${nowTargetName}<br><br>${nowTargetBirth} - ${nowTargetDeath}<br><br>${nowTargetDiscription}`;
  flipCards();
  // 画面を赤く
  document.getElementById('damage-modal').style.display = 'block';
  if (lives <= 0) {
    // ゲームオーバー
    gameOver()
    return;
  }
  // ゲームオーバーじゃないなら赤い画面消す
  setTimeout(() => {
    document.getElementById('damage-modal').style.display = 'none';
  }, 500);
  // 新しいライフに更新
  document.querySelector('.lives-container').innerHTML = '';
  for (let i = 0; i < lives; i++) {
    document.querySelector('.lives-container').innerHTML += '<span class="heart">❤️</span>';
  }
}

function gameOver() {
  // modal-game-finishを更新
  document.querySelector('.game-finish-title').textContent = 'ゲームオーバー';
  document.querySelector('.game-finish-text').textContent = 'ライフがなくなりました';
  document.querySelector('.game-finish-score-primary').textContent = `正解数: ${score}`;
  document.querySelector('.game-finish-score-secondary').textContent = `獲得した宝石: ${score * 10}`;
  // 正解数に応じてgemを獲得
  gainGem(score);
  // ゲームモーダルを閉じる
  document.getElementById('modal-game').classList.remove('fast-fadein');
  document.getElementById('modal-game').classList.add('fast-fadeout');
  setTimeout(() => {
    document.getElementById('modal-game').style.display = 'none';
    document.getElementById('modal-game').classList.remove('fast-fadeout');
    document.getElementById('modal-game-finish').classList.add('fast-fadein');
    document.getElementById('modal-game-finish').style.display = 'block';
  }, 500);
}
function gameFinish() {
  // modal-game-finishを更新
  document.querySelector('.game-finish-title').textContent = 'ゲームクリア！';
  document.querySelector('.game-finish-text').textContent = '30問正解したのでゲームクリアです';
  document.querySelector('.game-finish-score-primary').textContent = `正解数: ${score}`;
  document.querySelector('.game-finish-score-secondary').textContent = `獲得した宝石: ${score * 10}`;
  // 正解数に応じてgemを獲得
  gainGem(score);
  // ゲームモーダルを閉じる
  document.getElementById('modal-game').classList.remove('fast-fadein');
  document.getElementById('modal-game').classList.add('fast-fadeout');
  setTimeout(() => {
    document.getElementById('modal-game').style.display = 'none';
    document.getElementById('modal-game').classList.remove('fast-fadeout');
    document.getElementById('modal-game-finish').classList.add('fast-fadein');
    document.getElementById('modal-game-finish').style.display = 'block';
  }, 500);
}

async function gainGem(score) {
  // 正解数に応じてgemを獲得
  const gem = score * 10;
  // 獲得したgemを反映
  window.currentUser.gem += gem;
  try {
    // ユーザーのドキュメントを取得
    const userId = window.currentUser.id;
    const userDocRef = doc(db, "users", userId);
    // ユーザーのドキュメントを更新
    await updateDoc(userDocRef, {
      gem: window.currentUser.gem
    });
    // 表示の更新
    document.querySelectorAll('.gem-count').forEach(gem => {
      gem.textContent = window.currentUser.gem;
    });
  } catch (error) {
    console.error("エラー:", error);
  }
}
