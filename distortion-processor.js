// Distortionエフェクトのサンプル
// 全てJavascriptで実装した場合

class DistortionProcessor extends AudioWorkletProcessor {

    constructor() {
        super();
        this.effectActive = false;
        this.port.onmessage = this.onMessage.bind(this);
    }

    // Node 側から来たメッセージを受け取り処理を行う
    onMessage(event) {
        const data = event.data;
        if (data.type === 'effect-active') {
            this.setActive(data.value);
        }
    }

    setActive(value) {
        this.effectActive = value;
    }

    // 音の処理
    process(inputs, outputs, parameters) {
        const input = inputs[0];
        const output = outputs[0];
        const distortionAmount = this.effectActive ? 20 : 1;

        for (let channel = 0; channel < input.length; ++channel) {
            const inputChannel = input[channel];
            const outputChannel = output[channel];

            for (let i = 0; i < inputChannel.length; ++i) {
                // シグモイド関数を使用して歪みを得る
                outputChannel[i] = Math.sign(inputChannel[i]) * (1 - Math.exp(-distortionAmount * Math.abs(inputChannel[i])));

                // 歪みの範囲を[-1, 1]にクリッピング
                outputChannel[i] = Math.max(-1, Math.min(1, outputChannel[i]));
            }
        }

        // Processor 側から Node 側にメッセージを送るには・・
        this.port.postMessage({ type: 'processing', value: '...' });

        return true;
    }
}

registerProcessor('distortion-processor', DistortionProcessor);