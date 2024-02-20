window.AudioContext = window.AudioContext || window.webkitAudioContext;

let sampleSource;
let gainNode;
let effectNode;
let isPlaying = false;
var ctx;
var selectedFile = null;

// ファイル選択ダイアログの要素
const fileInput = document.getElementById('fileInput');

// ファイルが選択されたときの処理
fileInput.addEventListener('change', async (event) => {
    selectedFile = event.target.files[0];
    if (selectedFile) {
        // 選択されたファイル名を表示する
        const selectedFileNameSpan = document.getElementById('selectedFileName');
        selectedFileNameSpan.textContent = `Selected File: ${selectedFile.name}`;
    }
});

// 音源を取得しAudioBuffer形式に変換して返す関数
async function setupSample() {
    try {
        ctx = new AudioContext();
    }
    catch (e) {
        alert('Web Audio API is not supported in this browser');
    }

    try {
        await ctx.audioWorklet.addModule('distortion-processor.js');
        effectNode = new AudioWorkletNode(ctx, 'distortion-processor');
    } catch (e) {
        let err = e instanceof Error ? e : new Error(String(e));
        throw new Error(
            `Failed to load audio analyzer worklet at url. Further info: ${err.message}`
        );
    }

    let arrayBuffer;
    if (selectedFile == null) {
        const response = await fetch("./assets/sample.mp3");
        arrayBuffer = await response.arrayBuffer();
    } else {
        arrayBuffer = await selectedFile.arrayBuffer();
    }
    // Web Audio APIで使える形式に変換
    const audioBuffer = await ctx.decodeAudioData(arrayBuffer);
    return audioBuffer;
}

// AudioBufferをctxに接続し再生する関数
function playSample(ctx, audioBuffer) {
    sampleSource = ctx.createBufferSource();
    gainNode = ctx.createGain();  // GainNodeを作成

    // 変換されたバッファーを音源として設定
    sampleSource.buffer = audioBuffer;

    // GainNodeを接続
    gainNode.connect(ctx.destination);

    // EffectNodeの接続
    applyEffect(document.querySelector("#effectToggle").checked);

    // 出力につなげる
    sampleSource.start();
    isPlaying = true;
}

function applyEffect(isChecked) {
    console.log('Toggle Effect:', isChecked);

    sampleSource.disconnect();
    effectNode.disconnect();
    if (isChecked) {
        sampleSource.connect(effectNode);
        effectNode.connect(gainNode);
    } else {        
        sampleSource.connect(gainNode);
    }
}

function changeVolume(volume) {
    if (gainNode) {
        gainNode.gain.value = volume;
    }
}

document.querySelector("#play").addEventListener("click", async () => {
    // 再生中なら二重に再生されないようにする
    if (isPlaying) return;
    const sample = await setupSample();
    playSample(ctx, sample);
    changeVolume(0.5);
});

// oscillatorを破棄し再生を停止する
document.querySelector("#stop").addEventListener("click", async () => {
    sampleSource?.stop();
    isPlaying = false;
});

document.querySelector("#volume").addEventListener("input", function () {
    const volumeValue = parseFloat(this.value);
    changeVolume(volumeValue);
});

document.querySelector("#effectToggle").addEventListener("change", function () {
    applyEffect(this.checked);
});


// ファイル選択ダイアログを表示するボタンを作成し、クリック時にダイアログを開く
const fileSelectButton = document.getElementById('selectFile');
fileSelectButton.addEventListener('click', () => {
    fileInput.click();
});