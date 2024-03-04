let sampleSource;
let gainNode;
let effectNode;
let isPlaying = false;
var audioContext;
var selectedFile = null;

class EffectNode extends AudioWorkletNode {

    constructor(context, options) {
        super(context, 'effect-processor', options);
        this.port.onmessage = this.onMessage.bind(this);
    }

    // Processor 側から来たメッセージを受け取り処理を行う
    onMessage(event) {
        const data = event.data;
        if (data.type === 'processing') {
            console.log('processing!!');
        }
    }

    setEffectActive(value) {
        // Node 側から Processor 側にメッセージを送る
        this.port.postMessage({ type: 'effect-active', value: value });
    }
}

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
        audioContext = new (window.AudioContext || window.webkitAudioContext)();
        await audioContext.resume();
    }
    catch (e) {
        alert('Web Audio API is not supported in this browser');
    }

    // ファイルをWeb Audio APIで使える形式に変換
    let arrayBuffer;
    if (selectedFile == null) {
        const response = await fetch("./assets/sample.mp3");
        arrayBuffer = await response.arrayBuffer();
    } else {
        arrayBuffer = await selectedFile.arrayBuffer();
    }
    const audioBuffer = await audioContext.decodeAudioData(arrayBuffer);

    try {
        await audioContext.audioWorklet.addModule('./wasm-worklet-processor.js');
        // effectNode = new EffectNode(audioContext, 'effect-processor');
        effectNode = new EffectNode(audioContext, {
            processorOptions: {
                numberOfChannels: audioBuffer.numberOfChannels,
                sampleRate: audioBuffer.sampleRate
            }
        });

        // await audioContext.audioWorklet.addModule('./distortion-processor.js');
        // effectNode = new DistortionNode(audioContext, 'distortion-processor');
    } catch (e) {
        let err = e instanceof Error ? e : new Error(String(e));
        throw new Error(
            `Failed to load audio analyzer worklet at url. Further info: ${err.message}`
        );
    }

    return audioBuffer;
}

// AudioBufferをaudioContextに接続し再生する関数
function playSample(audioContext, audioBuffer) {
    sampleSource = audioContext.createBufferSource();
    gainNode = audioContext.createGain();  // GainNodeを作成

    // 変換されたバッファーを音源として設定
    sampleSource.buffer = audioBuffer;

    // ノードを接続
    sampleSource.connect(effectNode).connect(gainNode).connect(audioContext.destination);

    // Effectの現在の状態を反映
    applyEffect(document.querySelector("#effectToggle").checked);

    // 再生開始
    sampleSource.loop = true;
    sampleSource.start();
    isPlaying = true;
}

function applyEffect(isChecked) {
    console.log('Toggle Effect:', isChecked);

    effectNode.setEffectActive(isChecked);
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
    playSample(audioContext, sample);
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

window.addEventListener('load', async () => {
    const buttonPlay = document.getElementById('play');
    buttonPlay.disabled = false;
});

// ファイル選択ダイアログを表示するボタンを作成し、クリック時にダイアログを開く
const fileSelectButton = document.getElementById('selectFile');
fileSelectButton.addEventListener('click', () => {
    fileInput.click();
});