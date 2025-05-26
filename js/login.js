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

document.getElementById('register-link').addEventListener('click', function() {
  document.getElementById('modal-login').style.display = 'none';
  document.getElementById('modal-register').style.display = 'block';
});

function toLogin() {
  document.getElementById('modal-register').style.display = 'none';
  document.getElementById('modal-login').style.display = 'block';
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

    // OKなら新しいユーザードキュメントのデータを準備
    const userData = {
      user: username,
      password: password,
      gem: 0,
      character: [1]
    };

    // Firestoreの'users'コレクションに新しいドキュメントを追加
    // addDoc関数は自動的にユニークなIDを生成します
    const docRef = await addDoc(collection(db, 'users'), userData);
              
    console.log('新しいユーザーが作成されました。ドキュメントID:', docRef.id);

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

    console.log('検索するユーザー名:', username); // デバッグ用

    if (!username || !password) {
      alert('ユーザー名とパスワードを入力してください');
      return;
    }

    // デバッグ用：全てのユーザーを取得して確認
    const usersRef = collection(db, 'users');

    const q = query(usersRef, where('user', '==', username));
    const querySnapshot = await getDocs(q);

    console.log('クエリ結果:', querySnapshot.size, '件'); // デバッグ用

    if (querySnapshot.empty) {
      alert('ユーザー名が見つかりません');
      return;
    }

    // 以下は既存のコードと同じ...
    const userDoc = querySnapshot.docs[0];
    const userData = userDoc.data();
    
    if (userData.password !== password) {
      alert('パスワードが間違っています');
      return;
    }

    console.log('ログイン成功:', userData);
    
    window.currentUser = {
      id: userDoc.id,
      user: userData.user,
      gem: userData.gem,
      character: userData.character
    };

    enterToppage();
  
  } catch (error) {
    console.error('ログインエラー:', error);
    alert('ログイン中にエラーが発生しました: ' + error.message);
  } finally {
    loginBtn.disabled = false;
    loginBtn.textContent = 'ログイン';
  }
}


window.login = login;
window.register = register;
window.toLogin = toLogin;

function enterToppage() {
  // ユーザー情報をtopページに反映
  document.getElementById('gem-count').textContent = window.currentUser.gem;
  // デフォルトではキャラクター1(織田信長)を選択
  if (localStorage.getItem('currentCharacter') === null) {
    localStorage.setItem('currentCharacter', 1);
  } else {
    // 別のがあるならそれを使う
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
  console.log('探します - ID:', id, 'Type:', typeof id); // デバッグ用ログ
  const data = await loadData();
  
  if (!data) {
    console.log('データを読み込めませんでした');
    return;
  }
    
  // IDで検索
  const person = data.find(item => item.id === Number(id));
  console.log('選択中のキャラ:', person); // デバッグ用ログ
  
  if (person) {
    // Topページに反映
    document.querySelector('.character-name').textContent = person.name;
    document.getElementById('birth-year').textContent = person.birth;
    document.getElementById('death-year').textContent = person.death;
    document.getElementById('description').innerHTML = person.description;
    document.getElementById('character-image').src = person.imgpath;
  } else {
    console.log(`id: ${id} の人物が見つかりませんでした`);
    localStorage.setItem('currentCharacter', 1);
    displayPersonInfo(1);
  }
}




