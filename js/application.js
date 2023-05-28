// src/utils.js
function calc_sr(osc) {
  return 28636360 / 32 / (osc + 2);
}
function calc_shift(res, ws) {
  return res + 9 - ws;
}
function log2(x) {
  var y = Math.log2(x);
  return y >> 0 === y ? y : false;
}

// src/note_input.jsx
var _notes = ["C", "C#", "D", "D#", "E", "F", "F#", "G", "G#", "A", "A#", "B"];
function split_value(value) {
  return [value % 12, value / 12 >> 0];
}
function NoteFrequency(value) {
  var [note, octave] = split_value(value);
  var n = (note + 3) % 12;
  if (n >= 3)
    octave -= 1;
  var base = 27.5 * 2 ** octave;
  return base * 2 ** (n / 12);
}
var NoteInput = class extends preact.Component {
  constructor(props) {
    super(props);
    this._noteChange = this.noteChange.bind(this);
    this._octaveChange = this.octaveChange.bind(this);
  }
  noteChange(e) {
    e.preventDefault();
    var [note, octave] = split_value(this.props.value);
    note = +e.target.value;
    this.change(note, octave);
  }
  octaveChange(e) {
    e.preventDefault();
    var [note, octave] = split_value(this.props.value);
    octave = +e.target.value;
    this.change(note, octave);
  }
  change(note, octave) {
    var { onChange } = this.props;
    if (onChange) {
      var value = note + 12 * octave;
      onChange(value);
    }
  }
  render() {
    var { onChange, value, disabled } = this.props;
    var notes = _notes.map((x, ix) => {
      return /* @__PURE__ */ preact.h("option", {
        key: ix,
        value: ix
      }, x);
    });
    var octaves = [];
    for (var i = 0; i < 9; ++i) {
      octaves.push(
        /* @__PURE__ */ preact.h("option", {
          key: i,
          value: i
        }, i)
      );
    }
    var [note, octave] = split_value(value);
    return /* @__PURE__ */ preact.h(preact.Fragment, null, /* @__PURE__ */ preact.h("select", {
      onChange: this._noteChange,
      value: note,
      disabled
    }, notes), " ", /* @__PURE__ */ preact.h("select", {
      onChange: this._octaveChange,
      value: octave,
      disabled
    }, octaves), " ", NoteFrequency(value).toFixed(2), " Hz");
  }
};

// src/wave_data.jsx
function mod(a, b) {
  return (a % b + b) % b;
}
function sine() {
  const a = 127;
  const p = 256;
  var rv = [];
  for (var n = 0; n < 256; ++n) {
    var x = 128 + Math.round(a * Math.sin(n * Math.PI / 128));
    rv.push(x || 1);
  }
  return rv;
}
function square() {
  var rv = [];
  for (var n = 0; n < 128; ++n)
    rv.push(255);
  for (var n = 0; n < 128; ++n)
    rv.push(1);
  return rv;
}
function triangle() {
  var rv = [];
  const a = 127;
  const p = 256;
  for (var n = 0; n < 256; ++n) {
    var x = 128 + Math.round(4 * a / p * Math.abs(mod(n - p / 4, p) - p / 2)) - a;
    rv.push(x || 1);
  }
  return rv;
}
function sawtooth() {
  var rv = [];
  const a = 127;
  const p = 256;
  for (var n = 0; n < 256; ++n) {
    var x = 128 + Math.round(a * 2 * (n / p - Math.floor(0.5 + n / p)));
    rv.push(x || 1);
  }
  return rv;
}
function WaveData(props) {
  var { assembler, shape } = props;
  var data;
  switch (shape) {
    case 0:
      data = sine();
      break;
    case 1:
      data = square();
      break;
    case 2:
      data = triangle();
      break;
    case 3:
      data = sawtooth();
      break;
  }
  var hex = data.map((x) => x < 16 ? "0" + x.toString(16) : x.toString(16));
  var code = [];
  if (assembler == 0) {
    for (var n = 0; n < 16; ++n) {
      var line = "    hex " + hex.slice(n * 16, n * 16 + 16).join("") + "\n";
      code.push(line);
    }
  }
  if (assembler == 1) {
    for (var n = 0; n < 16; ++n) {
      var line = "    dc h'" + hex.slice(n * 16, n * 16 + 16).join("") + "'\n";
      code.push(line);
    }
  }
  if (assembler == 2) {
    for (var n = 0; n < 32; ++n) {
      var line = "    dc.b $" + hex.slice(n * 8, n * 8 + 8).join(",$") + "\n";
      code.push(line);
    }
  }
  return /* @__PURE__ */ preact.h("code", null, /* @__PURE__ */ preact.h("pre", null, code));
}

// src/input.jsx
var _onames = [];
function Oscillators(props) {
  if (!_onames.length) {
    for (var i = 1; i < 33; ++i) {
      var x = (calc_sr(i) / 1e3).toFixed(2) + " kHz";
      _onames.push(x);
    }
  }
  var options = _onames.map((x2, ix) => {
    var i2 = ix + 1;
    return /* @__PURE__ */ preact.h("option", {
      value: i2,
      key: i2
    }, i2, " \u2013 ", x2);
  });
  return /* @__PURE__ */ preact.h("select", {
    ...props
  }, options);
}
function WaveSize(props) {
  var options = [];
  for (var i = 8; i < 16; ++i) {
    var ext = 1 << i;
    var int = i - 8;
    options.push(/* @__PURE__ */ preact.h("option", {
      value: int,
      key: int
    }, ext));
  }
  return /* @__PURE__ */ preact.h("select", {
    value: props.value,
    onChange: props.onChange
  }, options);
}
function Resolution(props) {
  var options = [];
  for (var i = 0; i < 8; ++i) {
    options.push(/* @__PURE__ */ preact.h("option", {
      value: i,
      key: i
    }, i));
  }
  return /* @__PURE__ */ preact.h("select", {
    value: props.value,
    onChange: props.onChange
  }, options);
}
function Frequency(props) {
  return /* @__PURE__ */ preact.h("input", {
    type: "number",
    min: "0",
    max: "65535",
    value: props.value,
    onChange: props.onChange
  });
}
function Assembler(props) {
  var options = ["Merlin", "ORCA/M", "MPW"].map((o, ix) => {
    return /* @__PURE__ */ preact.h("option", {
      key: ix,
      value: ix
    }, o);
  });
  return /* @__PURE__ */ preact.h("select", {
    ...props
  }, options);
}
function WaveShape(props) {
  var options = ["Sine", "Square", "Triangle", "Sawtooth"].map((o, ix) => {
    return /* @__PURE__ */ preact.h("option", {
      key: ix,
      value: ix
    }, o);
  });
  return /* @__PURE__ */ preact.h("select", {
    ...props
  }, options);
}
function CheckBox(props) {
  return /* @__PURE__ */ preact.h("input", {
    type: "checkbox",
    ...props
  });
}

// src/duration_input.jsx
function split_value2(x) {
  if (x === void 0 || x === null)
    return ["", 0];
  if (typeof x == "number")
    return [x, 0];
  var xx = x.split(":");
  if (xx.length == 2)
    return xx;
  if (xx.length == 1)
    return [x, 0];
  return ["", 0];
}
function DurationToSeconds(x) {
  let [time, unit] = split_value2(x);
  switch (+unit) {
    case 0:
      return +time;
    case 1:
      return +time / 1e3;
    case 2:
      return +time / 60;
    default:
      return 0;
  }
}
function DurationSplit(x) {
  let [time, unit] = split_value2(x);
  switch (+unit) {
    case 0:
      return [+time, "s"];
    case 1:
      return [+time / 1e3, "ms"];
    case 2:
      return [+time / 60, "ticks"];
    default:
      return [0, ""];
  }
}
var DurationInput = class extends preact.Component {
  constructor(props) {
    super(props);
    this._amtChange = this.amtChange.bind(this);
    this._unitChange = this.unitChange.bind(this);
  }
  amtChange(e) {
    e.preventDefault();
    let { value } = this.props;
    var [time, unit] = split_value2(value);
    var new_time = e.target.value.replace(/^\s+|\s+$/g, "");
    var n = Number(new_time);
    if (Number.isNaN(n)) {
      e.target.value = time;
      return;
    }
    this.change(new_time, unit);
  }
  unitChange(e) {
    e.preventDefault();
    let { value } = this.props;
    var [time, unit] = split_value2(value);
    var new_unit = +e.target.value;
    let s = DurationToSeconds(value);
    if (new_unit == unit)
      return;
    var new_time = 0;
    switch (new_unit) {
      case 0:
        new_time = s;
        break;
      case 1:
        new_time = s * 1e3;
        break;
      case 2:
        new_time = s * 60;
        break;
    }
    this.change(new_time, new_unit);
  }
  change(time, unit) {
    let { onChange } = this.props;
    if (onChange) {
      onChange(time + ":" + unit);
    }
  }
  render() {
    var { value, disabled } = this.props;
    var [amt, unit] = split_value2(value);
    var options = ["Seconds", "Milliseconds", "Ticks"].map((x, ix) => {
      return /* @__PURE__ */ preact.h("option", {
        key: ix,
        value: ix
      }, x);
    });
    return /* @__PURE__ */ preact.h(preact.Fragment, null, /* @__PURE__ */ preact.h("input", {
      type: "text",
      value: amt,
      disabled,
      onChange: this._amtChange
    }), " ", /* @__PURE__ */ preact.h("select", {
      value: unit,
      disabled,
      onChange: this._unitChange
    }, options));
  }
};

// src/application.jsx
var C4 = 4 * 12;
function nmultiply(x) {
  if (x == 0)
    return 0;
  if (x == 1)
    return /* @__PURE__ */ preact.h("i", null, "n");
  return /* @__PURE__ */ preact.h(preact.Fragment, null, x, " * ", /* @__PURE__ */ preact.h("i", null, "n"));
}
function simplify(res, freq) {
  while (res && !(freq & 1)) {
    freq >>= 1;
    --res;
  }
  return [res, freq];
}
function SampleDisplay(props) {
  var { shift, freq } = props;
  if (freq == 0)
    return [];
  var freq2 = log2(freq);
  var fspan = /* @__PURE__ */ preact.h("span", {
    title: "Frequency"
  }, freq);
  var fspann = freq == 1 ? /* @__PURE__ */ preact.h("i", null, "n") : /* @__PURE__ */ preact.h(preact.Fragment, null, "(", fspan, " * ", /* @__PURE__ */ preact.h("i", null, "n"), ")");
  var rv = [];
  rv.push(
    /* @__PURE__ */ preact.h("div", null, "Sample", /* @__PURE__ */ preact.h("sub", null, "n"), " = RAM[ ", fspann, " >> ", shift, " ]")
  );
  rv.push(
    /* @__PURE__ */ preact.h("div", null, "Sample", /* @__PURE__ */ preact.h("sub", null, "n"), " = RAM[ ", fspann, " / ", 1 << shift, " ]")
  );
  if (freq2) {
    if (freq2 >= shift) {
      rv.push(
        /* @__PURE__ */ preact.h("div", null, "Sample", /* @__PURE__ */ preact.h("sub", null, "n"), " = RAM[ ", nmultiply(freq / (1 << shift)), " ]")
      );
    } else {
      rv.push(
        /* @__PURE__ */ preact.h("div", null, "Sample", /* @__PURE__ */ preact.h("sub", null, "n"), " = RAM[ ", nmultiply(freq >> freq2), " >> ", shift - freq2, " ]")
      );
      rv.push(
        /* @__PURE__ */ preact.h("div", null, "Sample", /* @__PURE__ */ preact.h("sub", null, "n"), " = RAM[ ", nmultiply(freq >> freq2), " / ", 1 << shift - freq2, " ]")
      );
    }
  }
  return rv;
}
function NoteDisplay(props) {
  const { osc, note } = props;
  return PitchDisplay({ osc, pitch: NoteFrequency(note) });
}
function PitchDisplay(props) {
  var { osc, pitch } = props;
  const wave = 0;
  const sr = calc_sr(osc);
  const f = pitch / (sr / (1 << 8 + wave));
  var best_res = 0;
  var best_freq = 0;
  for (var res = 0; res < 8; ++res) {
    const shift = 1 << calc_shift(res, wave);
    const tmp = Math.round(f * shift);
    if (tmp >= 65536)
      break;
    best_res = res;
    best_freq = tmp;
  }
  [best_res, best_freq] = simplify(best_res, best_freq);
  return /* @__PURE__ */ preact.h(preact.Fragment, null, /* @__PURE__ */ preact.h(RateDisplay, {
    wave: 0,
    osc,
    freq: best_freq,
    res: best_res
  }), /* @__PURE__ */ preact.h("div", null, "Wave Size: 256"), /* @__PURE__ */ preact.h("div", null, "Resolution: ", best_res), /* @__PURE__ */ preact.h("div", null, "Frequency: ", best_freq));
}
function RateDisplay(props) {
  const { osc, wave, freq, res } = props;
  const sr = calc_sr(osc);
  const shift = 1 << calc_shift(res, wave);
  const size = 256 << wave;
  const rate = sr / (size * shift / freq);
  return /* @__PURE__ */ preact.h("div", null, "Rate: ", rate.toFixed(2), " Hz");
}
function ResampleDisplay(props) {
  var { osc, size, freq } = props;
  const sr = calc_sr(osc);
  const f = freq / sr;
  var best_res = 0;
  var best_freq = 0;
  for (var res = 0; res < 8; ++res) {
    var tmp = Math.round(f * (1 << calc_shift(res, size)));
    if (tmp >= 65536)
      break;
    best_res = res;
    best_freq = tmp;
  }
  [best_res, best_freq] = simplify(best_res, best_freq);
  var best_shift = calc_shift(best_res, size);
  return /* @__PURE__ */ preact.h(preact.Fragment, null, /* @__PURE__ */ preact.h("div", null, "Resolution: ", best_res), /* @__PURE__ */ preact.h("div", null, "Frequency: ", best_freq), /* @__PURE__ */ preact.h(SampleDisplay, {
    freq: best_freq,
    shift: best_shift
  }));
}
function HyperDisplay(props) {
  var { pitch, freq } = props;
  const r = freq * 261.63 / (26320 * pitch);
  const offset = Math.round(3072 * Math.log2(r));
  const relative = offset < 0 ? -offset + 32768 : offset;
  return /* @__PURE__ */ preact.h("div", null, "Relative: ", relative);
}
function TimerDisplay(props) {
  var { osc, duration } = props;
  const [time, units] = DurationSplit(duration);
  const sr = calc_sr(osc);
  const cycles = time * sr;
  const size = 0;
  var best_res = 0;
  var best_freq = 0;
  var actual = 0;
  best = [];
  for (var res = 0; res < 8; ++res) {
    var shift = 1 << calc_shift(res, size);
    var f = Math.round(shift * 256 / cycles);
    if (f >= 65536)
      continue;
    actual = Math.ceil(256 * shift / f);
    best_res = res;
    best_freq = f;
  }
  [best_res, best_freq] = simplify(best_res, best_freq);
  var best_shift = calc_shift(best_res, size);
  switch (units) {
    case "s":
      break;
    case "ms":
      actual *= 1e3;
      break;
    case "ticks":
      actual *= 60;
      break;
  }
  return /* @__PURE__ */ preact.h(preact.Fragment, null, /* @__PURE__ */ preact.h("div", null, "Time: ", actual ? (actual / sr).toFixed(2) + " " + units : "N/A"), /* @__PURE__ */ preact.h("div", null, "Resolution: ", best_res ? best_res : "N/A"), /* @__PURE__ */ preact.h("div", null, "Frequency: ", best_freq ? best_freq : "N/A"), /* @__PURE__ */ preact.h(SampleDisplay, {
    freq: best_freq,
    shift: best_shift
  }));
}
var Application = class extends preact.Component {
  constructor(props) {
    super(props);
    this._oscChange = this.oscChange.bind(this);
    this._waveChange = this.waveChange.bind(this);
    this._resChange = this.resChange.bind(this);
    this._freqChange = this.freqChange.bind(this);
    this._noteChange = this.noteChange.bind(this);
    this._pitchChange = this.pitchChange.bind(this);
    this._durationChange = this.durationChange.bind(this);
    this._tabChange = this.tabChange.bind(this);
    this._asmChange = this.asmChange.bind(this);
    this._shapeChange = this.shapeChange.bind(this);
    this._inFreqChange = this.inFreqChange.bind(this);
    this._inSizeChange = this.inSizeChange.bind(this);
    this._indeterminateChange = this.indeterminateChange.bind(this);
    this.state = {
      osc: 32,
      wave: 0,
      res: 0,
      freq: 512,
      tab: 0,
      note: C4,
      assembler: 0,
      shape: 0,
      in_freq: 44100,
      in_size: 0,
      indeterminate: false,
      pitch: 440
    };
  }
  oscChange(e) {
    e.preventDefault();
    var v = +e.target.value || 0;
    this.setState({ osc: v });
  }
  waveChange(e) {
    e.preventDefault();
    var v = +e.target.value || 0;
    this.setState({ wave: v });
  }
  resChange(e) {
    e.preventDefault();
    var v = +e.target.value || 0;
    this.setState({ res: v });
  }
  pitchChange(e) {
    e.preventDefault();
    var v = +e.target.value;
    if (v < 0)
      v = 0;
    if (v > 65535)
      v = 65535;
    this.setState({ pitch: v });
  }
  freqChange(e) {
    e.preventDefault();
    var v = +e.target.value >> 0;
    if (v < 0)
      v = 0;
    if (v > 65535)
      v = 65535;
    this.setState({ freq: v });
  }
  inFreqChange(e) {
    e.preventDefault();
    var v = +e.target.value >> 0;
    if (v < 0)
      v = 0;
    if (v > 65535)
      v = 65535;
    this.setState({ in_freq: v });
  }
  inSizeChange(e) {
    e.preventDefault();
    var v = +e.target.value || 0;
    this.setState({ in_size: v });
  }
  tabChange(e) {
    e.preventDefault();
    var v = +e.target.value;
    this.setState({ tab: v });
  }
  noteChange(v) {
    this.setState({ note: v });
  }
  durationChange(v) {
    this.setState({ duration: v });
  }
  asmChange(e) {
    e.preventDefault();
    var v = +e.target.value;
    this.setState({ assembler: v });
  }
  shapeChange(e) {
    e.preventDefault();
    var v = +e.target.value;
    this.setState({ shape: v });
  }
  indeterminateChange(e) {
    e.preventDefault();
    var v = !!e.target.checked;
    this.setState({ indeterminate: v });
  }
  sampleChildren() {
    var { osc, wave, res, freq } = this.state;
    var shift = calc_shift(res, wave);
    return /* @__PURE__ */ preact.h(preact.Fragment, null, /* @__PURE__ */ preact.h("div", null, /* @__PURE__ */ preact.h("label", null, "Oscillators"), " ", /* @__PURE__ */ preact.h(Oscillators, {
      value: osc,
      onChange: this._oscChange
    })), /* @__PURE__ */ preact.h("div", null, /* @__PURE__ */ preact.h("label", null, "Wave Size"), " ", /* @__PURE__ */ preact.h(WaveSize, {
      value: wave,
      onChange: this._waveChange
    })), /* @__PURE__ */ preact.h("div", null, /* @__PURE__ */ preact.h("label", null, "Resolution"), " ", /* @__PURE__ */ preact.h(Resolution, {
      value: res,
      onChange: this._resChange
    })), /* @__PURE__ */ preact.h("div", null, /* @__PURE__ */ preact.h("label", null, "Frequency"), " ", /* @__PURE__ */ preact.h(Frequency, {
      value: freq,
      onChange: this._freqChange
    })), /* @__PURE__ */ preact.h(RateDisplay, {
      wave,
      osc,
      freq,
      shift,
      res
    }), /* @__PURE__ */ preact.h(SampleDisplay, {
      freq,
      shift
    }));
  }
  noteChildren() {
    var { osc, wave, note } = this.state;
    return /* @__PURE__ */ preact.h(preact.Fragment, null, /* @__PURE__ */ preact.h("div", null, /* @__PURE__ */ preact.h("label", null, "Oscillators"), " ", /* @__PURE__ */ preact.h(Oscillators, {
      value: osc,
      onChange: this._oscChange
    })), /* @__PURE__ */ preact.h("div", null, /* @__PURE__ */ preact.h("label", null, "Note"), " ", /* @__PURE__ */ preact.h(NoteInput, {
      value: note,
      onChange: this._noteChange
    })), /* @__PURE__ */ preact.h(NoteDisplay, {
      osc,
      note,
      wave
    }));
  }
  pitchChildren() {
    var { osc, wave, pitch } = this.state;
    return /* @__PURE__ */ preact.h(preact.Fragment, null, /* @__PURE__ */ preact.h("div", null, /* @__PURE__ */ preact.h("label", null, "Oscillators"), " ", /* @__PURE__ */ preact.h(Oscillators, {
      value: osc,
      onChange: this._oscChange
    })), /* @__PURE__ */ preact.h("div", null, /* @__PURE__ */ preact.h("label", null, "Pitch"), " ", /* @__PURE__ */ preact.h(Frequency, {
      value: pitch,
      onChange: this._pitchChange
    }), " Hz"), /* @__PURE__ */ preact.h(PitchDisplay, {
      osc,
      pitch,
      wave
    }));
  }
  waveChildren() {
    var { assembler, shape } = this.state;
    return /* @__PURE__ */ preact.h(preact.Fragment, null, /* @__PURE__ */ preact.h("div", null, /* @__PURE__ */ preact.h("label", null, "Assembler"), " ", /* @__PURE__ */ preact.h(Assembler, {
      value: assembler,
      onChange: this._asmChange
    })), /* @__PURE__ */ preact.h("div", null, /* @__PURE__ */ preact.h("label", null, "Wave Type"), " ", /* @__PURE__ */ preact.h(WaveShape, {
      value: shape,
      onChange: this._shapeChange
    })), /* @__PURE__ */ preact.h(WaveData, {
      assembler,
      shape
    }));
  }
  resampleChildren() {
    var { osc, in_freq, in_size } = this.state;
    return /* @__PURE__ */ preact.h(preact.Fragment, null, /* @__PURE__ */ preact.h("div", null, /* @__PURE__ */ preact.h("label", null, "Oscillators"), " ", /* @__PURE__ */ preact.h(Oscillators, {
      value: osc,
      onChange: this._oscChange
    })), /* @__PURE__ */ preact.h("div", null, /* @__PURE__ */ preact.h("label", null, "In Frequency"), " ", /* @__PURE__ */ preact.h(Frequency, {
      value: in_freq,
      onChange: this._inFreqChange
    })), /* @__PURE__ */ preact.h("div", null, /* @__PURE__ */ preact.h("label", null, "In Size"), " ", /* @__PURE__ */ preact.h(WaveSize, {
      value: in_size,
      onChange: this._inSizeChange
    })), /* @__PURE__ */ preact.h(ResampleDisplay, {
      osc,
      size: in_size,
      freq: in_freq
    }));
  }
  timerChildren() {
    var { osc, duration } = this.state;
    return /* @__PURE__ */ preact.h(preact.Fragment, null, /* @__PURE__ */ preact.h("div", null, /* @__PURE__ */ preact.h("label", null, "Oscillators"), " ", /* @__PURE__ */ preact.h(Oscillators, {
      value: osc,
      onChange: this._oscChange
    })), /* @__PURE__ */ preact.h("div", null, /* @__PURE__ */ preact.h("label", null, "Duration"), " ", /* @__PURE__ */ preact.h(DurationInput, {
      value: duration,
      onChange: this._durationChange
    })), /* @__PURE__ */ preact.h(TimerDisplay, {
      osc,
      duration
    }));
  }
  hyperChildren() {
    var { in_freq, note, indeterminate } = this.state;
    if (indeterminate)
      note = C4;
    return /* @__PURE__ */ preact.h(preact.Fragment, null, /* @__PURE__ */ preact.h("div", null, /* @__PURE__ */ preact.h("label", null, "Oscillators"), " ", /* @__PURE__ */ preact.h(Oscillators, {
      value: 32,
      disabled: true
    })), /* @__PURE__ */ preact.h("div", null, /* @__PURE__ */ preact.h("label", null, "In Frequency"), " ", /* @__PURE__ */ preact.h(Frequency, {
      value: in_freq,
      onChange: this._inFreqChange
    })), /* @__PURE__ */ preact.h("div", null, /* @__PURE__ */ preact.h("label", null, "Indeterminate"), /* @__PURE__ */ preact.h(CheckBox, {
      checked: indeterminate,
      onChange: this._indeterminateChange
    })), /* @__PURE__ */ preact.h("div", {
      style: indeterminate ? { display: "none" } : ""
    }, /* @__PURE__ */ preact.h("label", null, "Pitch"), " ", /* @__PURE__ */ preact.h(NoteInput, {
      value: note,
      onChange: this._noteChange,
      disabled: indeterminate
    })), /* @__PURE__ */ preact.h(HyperDisplay, {
      freq: in_freq,
      pitch: NoteFrequency(note)
    }));
  }
  render() {
    var { osc, wave, res, freq, tab } = this.state;
    var children;
    switch (tab) {
      case 0:
        children = this.sampleChildren();
        break;
      case 1:
        children = this.resampleChildren();
        break;
      case 2:
        children = this.noteChildren();
        break;
      case 3:
        children = this.pitchChildren();
        break;
      case 4:
        children = this.waveChildren();
        break;
      case 5:
        children = this.timerChildren();
        break;
      case 6:
        children = this.hyperChildren();
        break;
    }
    const Labels = ["Sample", "Resample", "Note", "Pitch", "Wave", "Timer", "HyperCard Pitch"];
    var options = Labels.map((o, ix) => {
      return /* @__PURE__ */ preact.h("option", {
        key: ix,
        value: ix
      }, o);
    });
    return /* @__PURE__ */ preact.h("fieldset", null, /* @__PURE__ */ preact.h("legend", null, /* @__PURE__ */ preact.h("select", {
      value: tab,
      onChange: this._tabChange
    }, options)), children);
  }
};

// src/main.jsx
window.addEventListener("load", function() {
  preact.render(
    /* @__PURE__ */ preact.h(Application, null),
    document.getElementById("application")
  );
});
