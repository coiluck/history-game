
// ボタンクリック時のエフェクト
document.querySelectorAll('.btn').forEach(btn => {
    btn.addEventListener('mousedown', () => {
        btn.style.transform = 'translateY(2px)';
        btn.style.boxShadow = '0 3px 10px rgba(0, 0, 0, 0.3)';
    });
   
    btn.addEventListener('mouseup', () => {
        btn.style.transform = '';
        btn.style.boxShadow = '';
    });
});

// infoボタンのエフェクト
const infoButton = document.querySelector('.info-button');
infoButton.addEventListener('mousedown', () => {
    infoButton.style.transform = 'translateY(2px)';
    infoButton.style.boxShadow = '0 2px 5px rgba(0, 0, 0, 0.3)';
});

infoButton.addEventListener('mouseup', () => {
    infoButton.style.transform = '';
    infoButton.style.boxShadow = '';
});

infoButton.addEventListener('click', () => {
  document.getElementById('modal-info').style.display = 'block';
});

document.getElementById('modal-info-layer').addEventListener('click', () => {
  document.getElementById('modal-info').style.display = 'none';
});

// selectモーダルの表示
document.getElementById('btn-characters').addEventListener('click', async () => {
  document.getElementById('modal-toppage').classList.add('fast-fadeout');
  // キャラクターグリッドの生成はselect.jsで行う
  setTimeout(() => {
    document.getElementById('modal-toppage').style.display = 'none';
    document.getElementById('modal-toppage').classList.remove('fast-fadeout');
    document.getElementById('modal-select').classList.add('fast-fadein');
    document.getElementById('modal-select').style.display = 'block';
  }, 500);
});

// gameモーダルの表示
document.getElementById('btn-start').addEventListener('click', () => {
  document.getElementById('modal-toppage').classList.add('fast-fadeout');
  setTimeout(() => {
    document.getElementById('modal-toppage').style.display = 'none';
    document.getElementById('modal-toppage').classList.remove('fast-fadeout');
    document.getElementById('modal-game').classList.add('fast-fadein');
    document.getElementById('modal-game').style.display = 'block';
  }, 500);
});
// gachaモーダルの表示
document.getElementById('btn-gacha').addEventListener('click', () => {
  document.getElementById('modal-toppage').classList.add('fast-fadeout');
  setTimeout(() => {
    document.getElementById('modal-toppage').style.display = 'none';
    document.getElementById('modal-toppage').classList.remove('fast-fadeout');
    document.getElementById('modal-gacha').classList.add('fast-fadein');
    document.getElementById('modal-gacha').style.display = 'block';
  }, 500);
});
// toppageモーダルの表示
document.getElementById('btn-gacha-back').addEventListener('click', () => {
  document.getElementById('modal-gacha').classList.add('fast-fadeout');
  setTimeout(() => {
    document.getElementById('modal-gacha').style.display = 'none';
    document.getElementById('modal-gacha').classList.remove('fast-fadeout');
    document.getElementById('modal-toppage').classList.add('fast-fadein');
    document.getElementById('modal-toppage').style.display = 'block';
  }, 500);
});
// toppageモーダルの表示
document.getElementById('btn-gacha-toTop').addEventListener('click', () => {
  document.getElementById('modal-gacha').classList.add('fast-fadeout');
  setTimeout(() => {
    document.getElementById('modal-gacha').style.display = 'none';
    document.getElementById('modal-gacha').classList.remove('fast-fadeout');
    document.getElementById('modal-toppage').classList.add('fast-fadein');
    document.getElementById('modal-toppage').style.display = 'block';
  }, 500);
});
// toppageモーダルの表示
document.getElementById('btn-gacha-back-result').addEventListener('click', () => {
  document.getElementById('modal-gacha').classList.add('fast-fadeout');
  document.getElementById('modal-gacha-result').classList.add('fast-fadeout');
  setTimeout(() => {
    document.getElementById('modal-gacha').style.display = 'none';
    document.getElementById('modal-gacha').classList.remove('fast-fadeout');
    document.getElementById('modal-gacha-result').style.display = 'none';
    document.getElementById('modal-gacha-result').classList.remove('fast-fadeout');
    document.getElementById('modal-toppage').classList.add('fast-fadein');
    document.getElementById('modal-toppage').style.display = 'block';
  }, 500);
});
// toppageモーダルの表示
document.getElementById('btn-gacha-result-toTop').addEventListener('click', () => {
  document.getElementById('modal-gacha').classList.add('fast-fadeout');
  document.getElementById('modal-gacha-result').classList.add('fast-fadeout');
  setTimeout(() => {
    document.getElementById('modal-gacha').style.display = 'none';
    document.getElementById('modal-gacha').classList.remove('fast-fadeout');
    document.getElementById('modal-gacha-result').style.display = 'none';
    document.getElementById('modal-gacha-result').classList.remove('fast-fadeout');
    document.getElementById('modal-toppage').classList.add('fast-fadein');
    document.getElementById('modal-toppage').style.display = 'block';
  }, 500);
});

// game-finish->toppage
document.getElementById('btn-game-finish-toTop').addEventListener('click', () => {
  document.getElementById('modal-game-finish').classList.remove('fast-fadein');
  document.getElementById('modal-game-finish').classList.add('fast-fadeout');
  setTimeout(() => {
    document.getElementById('modal-game-finish').style.display = 'none';
    document.getElementById('modal-game-finish').classList.remove('fast-fadeout');
    document.getElementById('modal-toppage').classList.add('fast-fadein');
    document.getElementById('modal-toppage').style.display = 'block';
  }, 500);
})