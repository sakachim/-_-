// キャビネット仕様
const CABINET_DIMENSIONS = {
    width: 455,    // mm
    depth: 690,    // mm
    height: 1260   // mm
};

// キャビネット容積を計算
const CABINET_VOLUME = CABINET_DIMENSIONS.width * CABINET_DIMENSIONS.depth * CABINET_DIMENSIONS.height;

// アプリケーション初期化
document.addEventListener('DOMContentLoaded', function () {
    initializeTable();
    calculateTotal();
});

/**
 * テーブルを初期化（50行分の入力フォームを生成）
 */
function initializeTable() {
    const tbody = document.getElementById('equipmentBody');

    for (let i = 1; i <= 50; i++) {
        const row = createTableRow(i);
        tbody.appendChild(row);
    }
}

/**
 * テーブル行を作成
 * @param {number} rowNumber - 行番号
 * @returns {HTMLTableRowElement} テーブル行要素
 */
function createTableRow(rowNumber) {
    const tr = document.createElement('tr');

    tr.innerHTML = `
        <td class="row-number">${rowNumber}</td>
        <td>
            <input 
                type="text" 
                id="name-${rowNumber}" 
                placeholder="機器名称"
                autocomplete="off"
            >
        </td>
        <td>
            <input 
                type="number" 
                id="depth-${rowNumber}" 
                placeholder="0" 
                min="0" 
                step="1"
                data-row="${rowNumber}"
                class="dimension-input"
            >
        </td>
        <td>
            <input 
                type="number" 
                id="width-${rowNumber}" 
                placeholder="0" 
                min="0" 
                step="1"
                data-row="${rowNumber}"
                class="dimension-input"
            >
        </td>
        <td>
            <input 
                type="number" 
                id="height-${rowNumber}" 
                placeholder="0" 
                min="0" 
                step="1"
                data-row="${rowNumber}"
                class="dimension-input"
            >
        </td>
        <td>
            <input 
                type="number" 
                id="quantity-${rowNumber}" 
                placeholder="0" 
                min="0" 
                step="1"
                value="1"
                data-row="${rowNumber}"
                class="dimension-input"
            >
        </td>
        <td>
            <span class="volume-display" id="volume-${rowNumber}">0</span>
        </td>
    `;

    // 各入力フィールドにイベントリスナーを追加
    const inputs = tr.querySelectorAll('.dimension-input');
    inputs.forEach(input => {
        input.addEventListener('input', handleInputChange);
    });

    return tr;
}

/**
 * 入力値変更時のハンドラー
 * @param {Event} event - 入力イベント
 */
function handleInputChange(event) {
    const rowNumber = event.target.dataset.row;
    updateRowVolume(rowNumber);
    calculateTotal();
}

/**
 * 行の容積を更新
 * @param {number} rowNumber - 行番号
 */
function updateRowVolume(rowNumber) {
    const depth = parseFloat(document.getElementById(`depth-${rowNumber}`).value) || 0;
    const width = parseFloat(document.getElementById(`width-${rowNumber}`).value) || 0;
    const height = parseFloat(document.getElementById(`height-${rowNumber}`).value) || 0;
    const quantity = parseFloat(document.getElementById(`quantity-${rowNumber}`).value) || 0;

    const volume = depth * width * height * quantity;

    const volumeDisplay = document.getElementById(`volume-${rowNumber}`);
    volumeDisplay.textContent = formatNumber(volume);
}

/**
 * 合計容積と必要キャビネット台数を計算
 */
function calculateTotal() {
    let totalVolume = 0;

    // 全50行の容積を合計
    for (let i = 1; i <= 50; i++) {
        const depth = parseFloat(document.getElementById(`depth-${i}`).value) || 0;
        const width = parseFloat(document.getElementById(`width-${i}`).value) || 0;
        const height = parseFloat(document.getElementById(`height-${i}`).value) || 0;
        const quantity = parseFloat(document.getElementById(`quantity-${i}`).value) || 0;

        totalVolume += depth * width * height * quantity;
    }

    // 必要キャビネット台数を計算（切り上げ）
    const cabinetsNeeded = totalVolume > 0 ? Math.ceil(totalVolume / CABINET_VOLUME) : 0;

    // 結果を表示
    document.getElementById('totalVolume').textContent = formatNumber(totalVolume) + ' mm³';
    document.getElementById('cabinetsNeeded').textContent = cabinetsNeeded + '台';

    // アニメーション効果
    animateValue('totalVolume');
    animateValue('cabinetsNeeded');
}

/**
 * 数値をカンマ区切りでフォーマット
 * @param {number} num - フォーマットする数値
 * @returns {string} フォーマットされた文字列
 */
function formatNumber(num) {
    return Math.round(num).toLocaleString('ja-JP');
}

/**
 * 値更新時のアニメーション効果
 * @param {string} elementId - 要素ID
 */
function animateValue(elementId) {
    const element = document.getElementById(elementId);
    element.style.transform = 'scale(1.05)';
    element.style.transition = 'transform 0.2s ease';

    setTimeout(() => {
        element.style.transform = 'scale(1)';
    }, 200);
}

/**
 * データをローカルストレージに保存（オプション機能）
 */
function saveData() {
    const data = [];

    for (let i = 1; i <= 50; i++) {
        const name = document.getElementById(`name-${i}`).value;
        const depth = document.getElementById(`depth-${i}`).value;
        const width = document.getElementById(`width-${i}`).value;
        const height = document.getElementById(`height-${i}`).value;
        const quantity = document.getElementById(`quantity-${i}`).value;

        if (name || depth || width || height || quantity) {
            data.push({ name, depth, width, height, quantity });
        }
    }

    localStorage.setItem('cabinetCalculatorData', JSON.stringify(data));
}

/**
 * ローカルストレージからデータを読み込み（オプション機能）
 */
function loadData() {
    const savedData = localStorage.getItem('cabinetCalculatorData');

    if (savedData) {
        try {
            const data = JSON.parse(savedData);

            data.forEach((item, index) => {
                const rowNumber = index + 1;
                if (rowNumber <= 50) {
                    if (item.name) document.getElementById(`name-${rowNumber}`).value = item.name;
                    if (item.depth) document.getElementById(`depth-${rowNumber}`).value = item.depth;
                    if (item.width) document.getElementById(`width-${rowNumber}`).value = item.width;
                    if (item.height) document.getElementById(`height-${rowNumber}`).value = item.height;
                    if (item.quantity) document.getElementById(`quantity-${rowNumber}`).value = item.quantity;

                    updateRowVolume(rowNumber);
                }
            });

            calculateTotal();
        } catch (error) {
            console.error('データの読み込みに失敗しました:', error);
        }
    }
}

// 自動保存機能（5秒ごと）
setInterval(() => {
    saveData();
}, 5000);

// ページ読み込み時にデータを復元
window.addEventListener('load', () => {
    loadData();
});
