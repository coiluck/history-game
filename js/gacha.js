import { db } from './login.js';
import { doc, getDoc, updateDoc } from "https://www.gstatic.com/firebasejs/11.8.1/firebase-firestore.js";

async function deductGem(amount) {
  // 宝石を消費する関数
  try {
    const userId = window.currentUser.id;
    const userDocRef = doc(db, "users", userId);
    // 現在のgemを取得
    const userSnap = await getDoc(userDocRef);
    if (userSnap.exists()) {
      const userData = userSnap.data();
      const currentGem = userData.gem;

      if (currentGem >= amount) {
        const newGem = currentGem - amount;
        // gemを更新
        await updateDoc(userDocRef, {
          gem: newGem
        });
        // 変数に入れる
        window.currentUser.gem = newGem;
        // 表示
        document.querySelectorAll('.gem-count').forEach(gem => {
          gem.textContent = window.currentUser.gem;
        });
      } else {
        // 変数とdbが違う
        console.error("エラー: gemが足りません");
      }
    } else {
      console.error("エラー: ユーザードキュメントが見つかりません");
    }
  } catch (error) {
    console.error("エラーが発生しました:", error);
  }
}

async function gainCharacter(randomNumbers) {
  // 所持キャラクターを追加する関数
  try {
    const userId = window.currentUser.id;
    const userDocRef = doc(db, "users", userId);

    const userSnap = await getDoc(userDocRef);

    if (!userSnap.exists()) {
      console.error("ユーザーが見つかりません");
      return;
    }

    const userData = userSnap.data();
    const currentCharacters = userData.character || [1];

    // 重複しないキャラクターIDだけを追加
    const newCharacters = randomNumbers.filter(num => !currentCharacters.includes(num));

    if (newCharacters.length === 0) {
      console.log("すべてのキャラクターはすでに所持しています");
      return;
    }

    const updatedCharacters = [...currentCharacters, ...newCharacters];

    await updateDoc(userDocRef, {
      character: updatedCharacters
    });

    // DBから最新のデータを再取得
    const updatedUserSnap = await getDoc(userDocRef);
    const updatedUserData = updatedUserSnap.data();
    
    // window.currentUser.characterを更新
    window.currentUser.character = updatedUserData.character;

    console.log(`追加しました: ${newCharacters}`);
  } catch (error) {
    console.error("エラー:", error);
  }
}

async function setGachaResult(randomNumbers) {
  const container = document.getElementById('gacha-result-img-container');

  if (!container) {
    console.error('エラー: id="gacha-result-img-container" の要素が見つかりません。');
    return;
  }

  // 前回の結果が残っている場合を考慮し、コンテナの中身を空にする
  container.innerHTML = '';

  try {
    // 外部のJSONファイルをfetchで読み込む
    const response = await fetch('data.json');

    // fetchが成功したかチェック
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    // レスポンスをJSON形式にパース
    const data = await response.json();

    // randomNumbers配列の各数値に対して処理を行う
    for (const id of randomNumbers) {
      // JSONデータの中から、idが一致する人物オブジェクトを探す
      const person = data.find(p => p.id === id);

      // personが見つかった場合
      if (person) {
        // img要素を新しく作成
        const img = document.createElement('img'); 
        // 画像を設定
        img.src = person.imgpath;
        img.className = 'gacha-result-img';
        img.alt = person.name;
        // コンテナ要素の中に作成したimg要素を追加
        container.appendChild(img);
      } else {
        // idに一致する人物が見つからなかった
        console.warn(`ID ${id} に合致する人物がdata.jsonに見つかりませんでした`);
      }
    }
  } catch (error) {
    console.error('ガチャ結果の読み込みまたは設定中にエラーが発生しました:', error);
  }
}


function drawGacha() {
  if (window.currentUser.gem < 300) {
    return;
  }
  // モーダルを結果用のものに遷移し、リセット
  document.getElementById('modal-gacha').classList.remove('fast-fadein')
  document.getElementById('modal-gacha').style.display = 'none';
  document.getElementById('modal-gacha-result').style.display = 'block';
  document.getElementById('gacha-result-img-container').innerHTML = '';
  // 宝石を300消費
  deductGem(300);
  // ランダムな数字を3回生成
  const randomNumbers = [];
  while (randomNumbers.length < 3) {
    // 3から40までの数字を生成
    const randomNumber = Math.floor(Math.random() * (40 - 3 + 1)) + 3;
    if (!randomNumbers.includes(randomNumber)) {
      randomNumbers.push(randomNumber);
    }
  }
  console.log(randomNumbers);
  // ガチャの結果をdbとローカル変数に保存
  gainCharacter(randomNumbers);
  // 生成した数字をもとに、データベースから該当するデータを取得し、画像要素を追加
  setGachaResult(randomNumbers);
}
  
document.getElementById('btn-gacha-draw').addEventListener('click', drawGacha);
document.getElementById('btn-gacha-draw-result').addEventListener('click', drawGacha);
