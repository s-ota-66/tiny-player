// https://qiita.com/Micochan/items/6be0034a9f75bb0706cd

#include <emscripten/bind.h>
#include <vector>
#include <cmath>

using namespace emscripten;

const unsigned kRenderQuantumFrames = 128;
const unsigned kBytesPerChannel = kRenderQuantumFrames * sizeof(float);

class LowPassFilter
{
public:
  void Process(uintptr_t input_ptr, uintptr_t output_ptr,
               unsigned channel_count)
  {
    float *input_buffer = reinterpret_cast<float *>(input_ptr);
    float *output_buffer = reinterpret_cast<float *>(output_ptr);

    // Resize arrays to match the number of channels
    ResizeArrays(channel_count);

    // Process each channel separately
    for (unsigned channel = 0; channel < channel_count; ++channel)
    {
      float *destination = output_buffer + channel * kRenderQuantumFrames;
      float *source = input_buffer + channel * kRenderQuantumFrames;

      // Apply filter to each sample
      for (unsigned i = 0; i < kRenderQuantumFrames; ++i)
      {
        destination[i] = b0 / a0 * source[i] +
                         b1 / a0 * in1[channel] +
                         b2 / a0 * in2[channel] -
                         a1 / a0 * out1[channel] -
                         a2 / a0 * out2[channel];

        in2[channel] = in1[channel];
        in1[channel] = source[i];
        out2[channel] = out1[channel];
        out1[channel] = destination[i];
      }
    }
  }

  LowPassFilter(float samplerate, float freq, float q) : samplerate(samplerate), freq(freq), q(q)
  {
    // Calculate filter coefficients
    const float omega = 2.0 * M_PI * freq / samplerate;
    const float alpha = sin(omega) / (2.0 * q);
    a0 = 1.0 + alpha;
    a1 = -2.0 * cos(omega);
    a2 = 1.0 - alpha;
    b0 = (1.0 - cos(omega)) / 2.0;
    b1 = 1.0 - cos(omega);
    b2 = (1.0 - cos(omega)) / 2.0;
  }

private:
  float samplerate;
  float freq;
  float q;
  std::vector<float> in1, in2, out1, out2;
  float a0, a1, a2, b0, b1, b2;

  void ResizeArrays(unsigned channel_count)
  {
    in1.resize(channel_count);
    in2.resize(channel_count);
    out1.resize(channel_count);
    out2.resize(channel_count);
  }
};

EMSCRIPTEN_BINDINGS(my_module)
{
  class_<LowPassFilter>("LowPassFilter")
      .constructor<float, float, float>()
      .function("process",
                &LowPassFilter::Process,
                allow_raw_pointers());
}
