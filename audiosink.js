registerProcessor("AudioSink", class AudioSink extends AudioWorkletProcessor {
  constructor(options) {
    super();
    let sab = options.processorOptions.sab;
    this.consumerSide = new RingBuffer(sab, Float32Array);
    this.mediaChannelCount = options.processorOptions.mediaChannelCount;
    this.deinterleaveBuffer = new Float32Array(this.mediaChannelCount * 128);
    this.s = 0;
  }

  // Deinterleave audio data from input (linear Float32Array) to output, an
  // array of Float32Array.
  deinterleave(input, output) {
    let inputIdx = 0;
    let outputChannelCount = output.length;
    for (var i = 0; i < output[0].length; i++) {
      for (var j = 0; j < outputChannelCount; j++) {
        output[j][i] = input[inputIdx++];
      }
    }
  }
  process(inputs, outputs, params) {
    if (this.consumerSide.pop(this.deinterleaveBuffer) != this.deinterleaveBuffer.length) {
      console.log("Warning: audio underrun");
    }
    this.deinterleave(this.deinterleaveBuffer, outputs[0]);
    return true;
  }
});
