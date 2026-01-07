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
 * 機器がキャビネットに収まるかチェック
 * @param {number} depth - 縦サイズ
 * @param {number} width - 横サイズ
 * @param {number} height - 高さサイズ
 * @returns {boolean} 収まる場合はtrue
 */
function checkFitsInCabinet(depth, width, height) {
    // 機器の寸法をソート（小さい順）
    const equipmentDims = [depth, width, height].sort((a, b) => a - b);
    // キャビネットの寸法をソート（小さい順）
    const cabinetDims = [CABINET_DIMENSIONS.width, CABINET_DIMENSIONS.depth, CABINET_DIMENSIONS.height].sort((a, b) => a - b);

    // 各寸法がキャビネットに収まるかチェック（最適な向きで配置）
    return equipmentDims[0] <= cabinetDims[0] &&
        equipmentDims[1] <= cabinetDims[1] &&
        equipmentDims[2] <= cabinetDims[2];
}

/**
 * 行の容積を更新
 * @param {number} rowNumber - 行番号
 * @returns {boolean} 有効な機器かどうか
 */
function updateRowVolume(rowNumber) {
    const depth = parseFloat(document.getElementById(`depth-${rowNumber}`).value) || 0;
    const width = parseFloat(document.getElementById(`width-${rowNumber}`).value) || 0;
    const height = parseFloat(document.getElementById(`height-${rowNumber}`).value) || 0;
    const quantity = parseFloat(document.getElementById(`quantity-${rowNumber}`).value) || 0;

    const volume = depth * width * height * quantity;

    const volumeDisplay = document.getElementById(`volume-${rowNumber}`);
    const row = volumeDisplay.closest('tr');

    // 寸法が入力されている場合のみチェック
    if (depth > 0 || width > 0 || height > 0) {
        if (!checkFitsInCabinet(depth, width, height)) {
            // キャビネットに入らない場合
            volumeDisplay.textContent = '収納不可';
            volumeDisplay.classList.add('error');
            row.classList.add('error-row');
            return false;
        }
    }

    // 正常な場合
    volumeDisplay.textContent = formatNumber(volume);
    volumeDisplay.classList.remove('error');
    row.classList.remove('error-row');
    return true;
}

/**
 * 合計容積と必要キャビネット台数を計算
 */
function calculateTotal() {
    let totalVolume = 0;
    let hasError = false;
    let errorEquipments = [];

    // 全50行の容積を合計
    for (let i = 1; i <= 50; i++) {
        const depth = parseFloat(document.getElementById(`depth-${i}`).value) || 0;
        const width = parseFloat(document.getElementById(`width-${i}`).value) || 0;
        const height = parseFloat(document.getElementById(`height-${i}`).value) || 0;
        const quantity = parseFloat(document.getElementById(`quantity-${i}`).value) || 0;

        // 寸法が入力されている場合のみチェック
        if (depth > 0 || width > 0 || height > 0) {
            if (!checkFitsInCabinet(depth, width, height)) {
                hasError = true;
                const name = document.getElementById(`name-${i}`).value || `行${i}`;
                errorEquipments.push(name);
            } else {
                totalVolume += depth * width * height * quantity;
            }
        }
    }

    const totalVolumeElement = document.getElementById('totalVolume');
    const cabinetsNeededElement = document.getElementById('cabinetsNeeded');
    const resultCard = document.querySelector('.result-card');

    if (hasError) {
        // エラーがある場合
        totalVolumeElement.textContent = '計測不可';
        cabinetsNeededElement.textContent = '計測不可';
        totalVolumeElement.classList.add('error');
        cabinetsNeededElement.classList.add('error');
        resultCard.classList.add('has-error');

        // エラーメッセージを表示
        showErrorMessage(`以下の機器がキャビネットの内寸を超えています: ${errorEquipments.join(', ')}`);
    } else {
        // 正常な場合
        const cabinetsNeeded = totalVolume > 0 ? Math.ceil(totalVolume / CABINET_VOLUME) : 0;

        totalVolumeElement.textContent = formatNumber(totalVolume) + ' mm³';
        cabinetsNeededElement.textContent = cabinetsNeeded + '台';
        totalVolumeElement.classList.remove('error');
        cabinetsNeededElement.classList.remove('error');
        resultCard.classList.remove('has-error');

        hideErrorMessage();
    }

    // アニメーション効果
    animateValue('totalVolume');
    animateValue('cabinetsNeeded');
}

/**
 * エラーメッセージを表示
 * @param {string} message - エラーメッセージ
 */
function showErrorMessage(message) {
    let errorDiv = document.getElementById('errorMessage');
    if (!errorDiv) {
        errorDiv = document.createElement('div');
        errorDiv.id = 'errorMessage';
        errorDiv.className = 'error-message';
        const resultCard = document.querySelector('.result-card');
        resultCard.insertAdjacentElement('afterend', errorDiv);
    }
    errorDiv.textContent = '⚠️ ' + message;
    errorDiv.style.display = 'block';
}

/**
 * エラーメッセージを非表示
 */
function hideErrorMessage() {
    const errorDiv = document.getElementById('errorMessage');
    if (errorDiv) {
        errorDiv.style.display = 'none';
    }
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
