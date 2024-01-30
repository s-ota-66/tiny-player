window.AudioContext = window.AudioContext || window.webkitAudioContext;
const ctx = new AudioContext();

let sampleSource;
let gainNode;  // GainNodeを格納する変数
let isPlaying = false;

// 音源を取得しAudioBuffer形式に変換して返す関数
async function setupSample() {
    const response = await fetch("./assets/sample.mp3");
    const arrayBuffer = await response.arrayBuffer();
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
    sampleSource.connect(gainNode);
    gainNode.connect(ctx.destination);

    // 出力につなげる
    sampleSource.start();
    isPlaying = true;
}

// エフェクトを追加する関数
function applyEffect() {
    // 独自のエフェクトをここに追加
    // 例: 音量を変更する
    gainNode.gain.value = 1.0;  // 音量を半分に変更
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

document.querySelector("#volume").addEventListener("input", function() {
    const volumeValue = parseFloat(this.value);
    changeVolume(volumeValue);
});