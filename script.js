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
const dateDisplay = document.getElementById('date-display');
const weekdayDisplay = document.getElementById('weekday-display');
const alertSound = document.getElementById('alert-sound');
const settingsBtn = document.getElementById('settings-btn');
const settingsPanel = document.getElementById('settings-panel');
const closeSettingsBtn = document.getElementById('close-settings-btn');
const addAlarmBtn = document.getElementById('add-alarm-btn');
const alarmHourInput = document.getElementById('alarm-hour');
const alarmMinuteInput = document.getElementById('alarm-minute');
const alarmList = document.getElementById('alarm-list');

const weekdayNames = ['日曜日', '月曜日', '火曜日', '水曜日', '木曜日', '金曜日', '土曜日'];

let lastAlertTime = null;
let alarmTimes = [];

// LocalStorage から時報設定を読み込む
function loadAlarmTimes() {
    const saved = localStorage.getItem('alarmTimes');
    alarmTimes = saved ? JSON.parse(saved) : [[8, 50]];
    renderAlarmList();
}

// LocalStorage に時報設定を保存
function saveAlarmTimes() {
    localStorage.setItem('alarmTimes', JSON.stringify(alarmTimes));
}

// 時報リストを表示
function renderAlarmList() {
    alarmList.innerHTML = '';
    const sorted = alarmTimes.sort((a, b) => a[0] * 60 + a[1] - (b[0] * 60 + b[1]));
    sorted.forEach((alarm, index) => {
        const item = document.createElement('div');
        item.className = 'alarm-item';
        const time = document.createElement('span');
        time.className = 'alarm-time';
        time.textContent = `${String(alarm[0]).padStart(2, '0')}:${String(alarm[1]).padStart(2, '0')}`;
        const deleteBtn = document.createElement('button');
        deleteBtn.className = 'delete-alarm-btn';
        deleteBtn.textContent = '削除';
        deleteBtn.onclick = () => {
            alarmTimes.splice(index, 1);
            saveAlarmTimes();
            renderAlarmList();
        };
        item.appendChild(time);
        item.appendChild(deleteBtn);
        alarmList.appendChild(item);
    });
}

// 時報を追加
function addAlarm() {
    const hour = parseInt(alarmHourInput.value);
    const minute = parseInt(alarmMinuteInput.value);

    if (isNaN(hour) || isNaN(minute) || hour < 0 || hour > 23 || minute < 0 || minute > 59) {
        alert('正しい時刻を入力してください（時：0-23、分：0-59）');
        return;
    }

    // 重複チェック
    if (alarmTimes.some(alarm => alarm[0] === hour && alarm[1] === minute)) {
        alert('その時刻は既に設定されています');
        return;
    }

    alarmTimes.push([hour, minute]);
    saveAlarmTimes();
    renderAlarmList();
    alarmHourInput.value = '';
    alarmMinuteInput.value = '';
}

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

    // 日付と曜日を更新
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const date = String(now.getDate()).padStart(2, '0');
    const weekday = weekdayNames[now.getDay()];

    dateDisplay.textContent = `${year}年${month}月${date}日`;
    weekdayDisplay.textContent = weekday;

    // 時報機能
    const currentHour = now.getHours();
    const currentMinute = now.getMinutes();
    const currentTimeKey = `${currentHour}:${currentMinute}`;

    // 設定された時刻に達したら音声を再生
    for (const [hour, minute] of alarmTimes) {
        if (currentHour === hour && currentMinute === minute) {
            // 同じ時刻で重複再生を防止
            if (lastAlertTime !== currentTimeKey) {
                alertSound.currentTime = 0;
                alertSound.play().catch(() => {
                    console.log('音声再生に失敗しました。alert.mp3がtemplatesフォルダに存在することを確認してください。');
                });
                lastAlertTime = currentTimeKey;
            }
            break;
        }
    }

    // 秒が変わったときにリセット（次の時刻で再度再生できるように）
    if (now.getSeconds() === 0 && lastAlertTime !== null) {
        const checkTime = `${now.getHours()}:${now.getMinutes()}`;
        if (checkTime !== lastAlertTime) {
            lastAlertTime = null;
        }
    }
}

// 初期表示
loadAlarmTimes();
updateClock();

// 毎秒更新
setInterval(updateClock, 1000);

// 設定パネルの開閉
settingsBtn.addEventListener('click', () => {
    settingsPanel.classList.remove('hidden');
});

closeSettingsBtn.addEventListener('click', () => {
    settingsPanel.classList.add('hidden');
});

// パネル外をクリックで閉じる
settingsPanel.addEventListener('click', (e) => {
    if (e.target === settingsPanel) {
        settingsPanel.classList.add('hidden');
    }
});

// 時報を追加するボタン
addAlarmBtn.addEventListener('click', addAlarm);

// Enter キーで追加
alarmHourInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') addAlarm();
});
alarmMinuteInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') addAlarm();
});

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
