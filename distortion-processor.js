class DistortionProcessor extends AudioWorkletProcessor {
    process(inputs, outputs, parameters) {
        const input = inputs[0];
        const output = outputs[0];

        for (let channel = 0; channel < input.length; ++channel) {
            const inputChannel = input[channel];
            const outputChannel = output[channel];

            for (let i = 0; i < inputChannel.length; ++i) {
                // より派手な歪み関数を使用（例: シグモイド関数）
                const distortionAmount = 10;  // 歪みの強さ（調整可能）

                // シグモイド関数を使用して歪みを得る
                outputChannel[i] = Math.sign(inputChannel[i]) * (1 - Math.exp(-distortionAmount * Math.abs(inputChannel[i])));

                // 歪みの範囲を[-1, 1]にクリッピング
                outputChannel[i] = Math.max(-1, Math.min(1, outputChannel[i]));
            }
        }

        return true;
    }
}

registerProcessor('distortion-processor', DistortionProcessor);