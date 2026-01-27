// フリップ時計の実装
const flipCards = {
    'hour-tens': document.getElementById('hour-tens'),
    'hour-ones': document.getElementById('hour-ones'),
    'minute-tens': document.getElementById('minute-tens'),
    'minute-ones': document.getElementById('minute-ones'),
    'second-tens': document.getElementById('second-tens'),
    'second-ones': document.getElementById('second-ones')
};

const fullscreenBtn = document.getElementById('fullscreen-btn');

function updateClock() {
    const now = new Date();
    
    const hours = String(now.getHours()).padStart(2, '0');
    const minutes = String(now.getMinutes()).padStart(2, '0');
    const seconds = String(now.getSeconds()).padStart(2, '0');
    
    const timeString = hours + minutes + seconds;
    
    const cardIds = ['hour-tens', 'hour-ones', 'minute-tens', 'minute-ones', 'second-tens', 'second-ones'];
    
    cardIds.forEach((id, index) => {
        const card = flipCards[id];
        const newNumber = timeString[index];
        const currentNumber = card.querySelector('.flip-card-front').textContent;
        
        if (newNumber !== currentNumber) {
            // 次の数字を背面に設定
            card.querySelector('.flip-card-back').textContent = newNumber;
            
            // フリップアニメーションを実行
            card.classList.add('flip');
            
            // アニメーション完了後、前面を更新して状態をリセット
            setTimeout(() => {
                card.querySelector('.flip-card-front').textContent = newNumber;
                card.classList.remove('flip');
                // card.querySelector('.flip-card-back').textContent = newNumber;
            }, 900);
        }
    });
}

// 初期表示
updateClock();

// 毎秒更新
setInterval(updateClock, 1000);

function toggleFullscreen() {
    if (!document.fullscreenElement) {
        document.documentElement.requestFullscreen().catch(() => {});
        fullscreenBtn.textContent = '全画面解除';
    } else {
        document.exitFullscreen().catch(() => {});
        fullscreenBtn.textContent = '全画面';
    }
}

if (fullscreenBtn) {
    fullscreenBtn.addEventListener('click', toggleFullscreen);
    document.addEventListener('fullscreenchange', () => {
        fullscreenBtn.textContent = document.fullscreenElement ? '全画面解除' : '全画面';
    });
}
