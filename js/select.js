document.addEventListener('DOMContentLoaded', function() {
  // 所持キャラクターを取得

});

// 選択中のキャラクターの情報を表示

// トップへボタンを押したとき
document.querySelector('.btn-secondary').addEventListener('click', () => {
  // モーダルを遷移
  document.getElementById('modal-select').classList.remove ('fast-fadein');
  document.getElementById('modal-select').classList.add('fast-fadeout');
  setTimeout(() => {
    document.getElementById('modal-select').style.display = 'none';
    document.getElementById('modal-select').classList.remove('fast-fadeout');
    document.getElementById('modal-toppage').classList.add('fast-fadein');
    document.getElementById('modal-toppage').style.display = 'block';
  }, 500);
});
// 選択ボタンを押したとき
document.querySelector('.btn-primary').addEventListener('click', () => {
  // 選択中のキャラクターをTopページに反映
  // モーダルを遷移
  document.getElementById('modal-select').classList.remove ('fast-fadein');
  document.getElementById('modal-select').classList.add('fast-fadeout');
  setTimeout(() => {
    document.getElementById('modal-select').style.display = 'none';
    document.getElementById('modal-select').classList.remove('fast-fadeout');
    document.getElementById('modal-toppage').classList.add('fast-fadein');
    document.getElementById('modal-toppage').style.display = 'block';
  }, 500);
});

