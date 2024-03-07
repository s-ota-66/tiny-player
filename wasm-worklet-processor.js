// Copyright (c) 2018 The Chromium Authors. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.

import Module from './simple-kernel.wasmmodule.js';
import { RENDER_QUANTUM_FRAMES, MAX_CHANNEL_COUNT, HeapAudioBuffer }
    from './lib/wasm-audio-helper.js';

/**
 * A simple demonstration of WASM-powered AudioWorkletProcessor.
 *
 * @class WASMWorkletProcessor
 * @extends AudioWorkletProcessor
 */
class WASMWorkletProcessor extends AudioWorkletProcessor {
    /**
     * @constructor
     */
    constructor(options) {
        super();

        this.numberOfChannels = 2;
        this.sampleRate = 44100.0;

        if (options.processorOptions.numberOfChannels) {
            this.numberOfChannels = options.processorOptions.numberOfChannels;
        }

        if (options.processorOptions.sampleRate) {
            this.sampleRate = options.processorOptions.sampleRate;
        }

        // Allocate the buffer for the heap access. Start with stereo, but it can
        // be expanded up to 32 channels.
        this._heapInputBuffer = new HeapAudioBuffer(
            Module, RENDER_QUANTUM_FRAMES, this.numberOfChannels, MAX_CHANNEL_COUNT);
        this._heapOutputBuffer = new HeapAudioBuffer(
            Module, RENDER_QUANTUM_FRAMES, this.numberOfChannels, MAX_CHANNEL_COUNT);
        this._kernel = new Module.LowPassFilter(this.sampleRate, 192.0, 1.2);
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

    /**
     * System-invoked process callback function.
     * @param  {Array} inputs Incoming audio stream.
     * @param  {Array} outputs Outgoing audio stream.
     * @param  {Object} parameters AudioParam data.
     * @return {Boolean} Active source flag.
     */
    process(inputs, outputs, parameters) {
        // Use the 1st input and output only to make the example simpler. |input|
        // and |output| here have the similar structure with the AudioBuffer
        // interface. (i.e. An array of Float32Array)
        const input = inputs[0];
        const output = outputs[0];

        // チャンネル数を取得します。
        const channelCount = input.length;

        if (!this.effectActive) {
            for (let channel = 0; channel < channelCount; ++channel) {
                const inputChannel = input[channel];
                const outputChannel = output[channel];

                for (let i = 0; i < inputChannel.length; ++i) {
                    outputChannel[i] = inputChannel[i];
                }
            }

            return true;
        }

        // 実際のオーディオデータに基づき、ヒープバッファを取得しなおします。
        this._heapInputBuffer.adaptChannel(channelCount);
        this._heapOutputBuffer.adaptChannel(channelCount);

        // 入力をヒープにコピーします。
        for (let channel = 0; channel < channelCount; ++channel) {
            this._heapInputBuffer.getChannelData(channel).set(input[channel]);
        }

        // WASMでエフェクトを適用します。
        this._kernel.process(
            this._heapInputBuffer.getHeapAddress(),
            this._heapOutputBuffer.getHeapAddress(),
            channelCount);

        // エフェクトが適用されたバッファを出力へ書き戻します。
        for (let channel = 0; channel < channelCount; ++channel) {
            output[channel].set(this._heapOutputBuffer.getChannelData(channel));
        }

        // Processor 側から Node 側にメッセージを送るには・・
        this.port.postMessage({ type: 'processing', value: '...' });

        return true;
    }
}

registerProcessor('effect-processor', WASMWorkletProcessor);