// Firebaseの初期化とデータベース接続
import { initializeApp } from "https://www.gstatic.com/firebasejs/11.8.1/firebase-app.js";
import { getFirestore, collection, addDoc, query, where, getDocs } from "https://www.gstatic.com/firebasejs/11.8.1/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "AIzaSyA7ybbJaNT_lsVvVHTrf0a6O6kZKQwkdhw",
  authDomain: "history-game-f830b.firebaseapp.com",
  projectId: "history-game-f830b",
  storageBucket: "history-game-f830b.firebasestorage.app",
  messagingSenderId: "444767632476",
  appId: "1:444767632476:web:08b504ed29834082ad7a99"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// 他のモジュールで使えるようにexport
export { db };

document.getElementById('register-link').addEventListener('click', function() {
  document.getElementById('modal-login').style.display = 'none';
  document.getElementById('modal-register').style.display = 'block';
});

function toLogin() {
  document.getElementById('modal-register').style.display = 'none';
  document.getElementById('modal-login').style.display = 'block';
}

// SHA-256ハッシュ化（ユーザー名をsaltとして使用）
async function hashPassword(username, password) {
  const data = new TextEncoder().encode(username + ':' + password);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  return Array.from(new Uint8Array(hashBuffer))
    .map(b => b.toString(16).padStart(2, '0'))
    .join('');
}

// ユーザー名の重複チェック関数
async function checkUserExists(username) {
  try {
    // usersコレクションでユーザー名が一致するドキュメントを検索
    const usersRef = collection(db, 'users');
    const q = query(usersRef, where('user', '==', username));
    const querySnapshot = await getDocs(q);
    // 検索結果が空でなければユーザーが存在する
    return !querySnapshot.empty;
  } catch (error) {
    console.error('ユーザー存在チェックエラー');
    throw error;
  }
}
// ユーザー新規登録のメイン関数
async function register() {
  // ボタンを無効化してダブルクリックを防ぐ
  const registerBtn = document.getElementById('register-btn');
  registerBtn.disabled = true;
  registerBtn.textContent = '登録中...';

  try {
    // フォームから取得
    const username = document.getElementById('username-register').value.trim();
    const password = document.getElementById('password-register').value;

    // 入力値の検証
    if (!username || !password) {
      return;
    }
    if (username.length < 3) {
      alert('ユーザー名は3文字以上で入力してください');
      return;
    }
    // ユーザー名の重複チェック
    const userExists = await checkUserExists(username);
    if (userExists) {
      alert('このユーザー名は既に使用されています');
      return;
    }

    const hashedPassword = await hashPassword(username, password);

    const userData = {
      user: username,
      password: hashedPassword,
      gem: 0,
      character: [1]
    };

    const docRef = await addDoc(collection(db, 'users'), userData);

    window.currentUser = {
      id: docRef.id,
      username: username, // これも多分使わない
      gem: 0,
      character: [1]
    };

    enterToppage();

  } catch (error) {
    // エラーが起きた場合
    console.error('ユーザー登録エラー');
    alert('登録中にエラーが発生しました。もう一度お試しください');
  } finally {
    // ボタンを再度有効化
    registerBtn.disabled = false;
    registerBtn.textContent = '新規登録';
  }
}

async function login() {
  const loginBtn = document.getElementById('login-btn');
  loginBtn.disabled = true;
  loginBtn.textContent = 'ログイン中...';

  try {
    const username = document.getElementById('username').value.trim();
    const password = document.getElementById('password').value;

    if (!username || !password) {
      alert('ユーザー名とパスワードを入力してください');
      return;
    }

    const usersRef = collection(db, 'users');
    const q = query(usersRef, where('user', '==', username));
    const querySnapshot = await getDocs(q);

    if (querySnapshot.empty) {
      alert('ユーザー名が見つかりません');
      return;
    }

    const userDoc = querySnapshot.docs[0];
    const userData = userDoc.data();

    const hashedPassword = await hashPassword(username, password);
    if (userData.password !== hashedPassword) {
      alert('パスワードが間違っています');
      return;
    }

    window.currentUser = {
      id: userDoc.id,
      user: userData.user,
      gem: userData.gem,
      character: userData.character
    };

    enterToppage();
  
  } catch (error) {
    console.error('ログインエラー');
    alert('ログイン中にエラーが発生しました。もう一度お試しください');
  } finally {
    loginBtn.disabled = false;
    loginBtn.textContent = 'ログイン';
  }
}


window.login = login;
window.register = register;
window.toLogin = toLogin;

function enterToppage() {
  // gemを更新(toppageとgachaの両方)
  document.querySelectorAll('.gem-count').forEach(gem => {
    gem.textContent = window.currentUser.gem;
  });
  // デフォルトではキャラクター1(織田信長)を選択
  if (localStorage.getItem('currentCharacter') === null) {
    localStorage.setItem('currentCharacter', 1);
  } else if (!window.currentUser.character.includes(Number(localStorage.getItem('currentCharacter')))) {
    // 持っていないキャラを選択していたらキャラクター1(織田信長)に変更
    // ローカルストレージを使用しているので、同じブラウザで別のアカウントを作ると所持していないキャラを選択する不具合がある
    localStorage.setItem('currentCharacter', 1);
  }
  displayPersonInfo(localStorage.getItem('currentCharacter'));
  // ページを遷移
  document.getElementById('modal-login').style.display = 'none';
  document.getElementById('modal-register').style.display = 'none';
  document.getElementById('modal-toppage').style.display = 'block';
}

// jsonファイルを読み込む
async function loadData() {
  try {
    const response = await fetch('data.json');
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('データの読み込みに失敗しました:', error);
    return null;
  }
}
  
// IDに基づいて人物情報を表示
async function displayPersonInfo(id) {
  const data = await loadData();

  if (!data) {
    return;
  }

  const person = data.find(item => item.id === Number(id));

  if (person) {
    document.querySelector('.character-name').textContent = person.name;
    document.getElementById('birth-year').textContent = person.birth;
    document.getElementById('death-year').textContent = person.death;
    document.getElementById('description').innerHTML = person.description;
    document.getElementById('character-image').src = person.imgpath;
  } else {
    localStorage.setItem('currentCharacter', 1);
    displayPersonInfo(1);
  }
}




