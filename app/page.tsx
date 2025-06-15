"use client"

import { useState, useEffect, useRef } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Slider } from "@/components/ui/slider"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import {
  Play,
  Pause,
  Square,
  Volume2,
  Settings,
  Zap,
  Music,
  Disc,
  Radio,
  RotateCcw,
  Download,
  Upload,
  AudioWaveformIcon as Waveform,
} from "lucide-react"

// Simulated audio samples
const AUDIO_SAMPLES = {
  cowbell: [
    { name: "Cowbell 1", pattern: [1, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0] },
    { name: "Cowbell 2", pattern: [1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0] },
    { name: "Cowbell 3", pattern: [1, 0, 0, 1, 0, 1, 0, 0, 1, 0, 0, 1, 0, 1, 0, 0] },
  ],
  kicks: [
    { name: "Kick 1", pattern: [1, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0] },
    { name: "Kick 2", pattern: [1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 0] },
  ],
  snares: [
    { name: "Snare 1", pattern: [0, 0, 1, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0, 1, 0] },
    { name: "Snare 2", pattern: [0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0] },
  ],
  hats: [
    { name: "Hi-hat 1", pattern: [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1] },
    { name: "Hi-hat 2", pattern: [1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0] },
  ],
}

// Simulated presets
const PRESETS = {
  "Rio Rider": {
    bpm: 140,
    swing: 15,
    tapeDrag: 25,
    drumKit: "Brazilian Funk",
    pattern: [1, 0, 0, 1, 1, 0, 0, 1, 1, 0, 0, 1, 1, 0, 0, 1],
    pitch808: 0,
    glide808: 30,
    distortion808: 60,
    saturation: 70,
    reverb: 40,
    delay: 20,
    vinylCrackle: 50,
    tapeWobble: 30,
  },
  "Funk do Morro": {
    bpm: 150,
    swing: 25,
    tapeDrag: 40,
    drumKit: "Classic Phonk",
    pattern: [1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0],
    pitch808: -12,
    glide808: 50,
    distortion808: 80,
    saturation: 90,
    reverb: 30,
    delay: 15,
    vinylCrackle: 40,
    tapeWobble: 60,
  },
  "Slowed N Distorted": {
    bpm: 90,
    swing: -10,
    tapeDrag: 70,
    drumKit: "Distorted 808s",
    pattern: [1, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 1, 0, 0, 0],
    pitch808: -24,
    glide808: 80,
    distortion808: 100,
    saturation: 100,
    reverb: 70,
    delay: 60,
    vinylCrackle: 80,
    tapeWobble: 90,
  },
  "Memphis Jungle": {
    bpm: 160,
    swing: 0,
    tapeDrag: 10,
    drumKit: "Memphis Raw",
    pattern: [1, 0, 1, 1, 1, 0, 1, 1, 1, 0, 1, 1, 1, 0, 1, 1],
    pitch808: 12,
    glide808: 0,
    distortion808: 50,
    saturation: 60,
    reverb: 20,
    delay: 30,
    vinylCrackle: 20,
    tapeWobble: 10,
  },
}

export default function PhonkWaveBR() {
  // Main state
  const [isPlaying, setIsPlaying] = useState(false)
  const [currentPreset, setCurrentPreset] = useState("Rio Rider")
  const [bpm, setBpm] = useState([140])
  const [swing, setSwing] = useState([15])
  const [tapeDrag, setTapeDrag] = useState([25])
  const [masterVolume, setMasterVolume] = useState([75])

  // Drum machine state
  const [selectedKit, setSelectedKit] = useState("Brazilian Funk")
  const [drumPattern, setDrumPattern] = useState(PRESETS["Rio Rider"].pattern.map(Boolean))
  const [selectedDrumType, setSelectedDrumType] = useState("cowbell")

  // 808 state
  const [pitch808, setPitch808] = useState([0])
  const [glide808, setGlide808] = useState([30])
  const [distortion808, setDistortion808] = useState([60])

  // Effects state
  const [saturation, setSaturation] = useState([70])
  const [reverb, setReverb] = useState([40])
  const [delay, setDelay] = useState([20])
  const [eqRadio, setEqRadio] = useState(false)
  const [chopper, setChopper] = useState([0])
  const [pitchShift, setPitchShift] = useState([0])

  // Vinyl emulator state
  const [vinylCrackle, setVinylCrackle] = useState([50])
  const [tapeWobble, setTapeWobble] = useState([30])

  // Audio visualization
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [currentStep, setCurrentStep] = useState(-1)
  const animationRef = useRef<number>()

  // Sample browser
  const [sampleBrowserOpen, setSampleBrowserOpen] = useState(false)
  const [sampleCategory, setSampleCategory] = useState("Cowbells")
  const [selectedSample, setSelectedSample] = useState("")
  const [samplesLoaded, setSamplesLoaded] = useState([])

  const sampleCategories = {
    Cowbells: [
      "Cowbell_Phonk_A.wav",
      "Cowbell_Memphis_Raw.wav",
      "Cowbell_Rio_Rider.wav",
      "Cowbell_Distorted.wav",
      "Cowbell_Morro.wav",
    ],
    "808 Bass": [
      "808_Heavy_D.wav",
      "808_Favela.wav",
      "808_Distortion_King.wav",
      "808_Memphis_Sub.wav",
      "808_Long_Decay.wav",
    ],
    Vocals: [
      "BR_Funk_Vocal_Cut.wav",
      "Memphis_Vocal_Chop.wav",
      "Phonk_Dark_Vocal.wav",
      "Rio_Female_Vocal.wav",
      "Distorted_Hook.wav",
    ],
    FX: [
      "Tape_Saturation.wav",
      "Vinyl_Crackle_Heavy.wav",
      "Cassette_Hiss.wav",
      "Radio_Tuning.wav",
      "Tape_Stop_Effect.wav",
    ],
    Loops: [
      "BR_Phonk_Loop_140bpm.wav",
      "Morro_Beat_150bpm.wav",
      "Memphis_Style_Loop.wav",
      "Cowbell_Pattern_A.wav",
      "Rio_Bass_Line_140bpm.wav",
    ],
  }

  const drumKits = ["Classic Phonk", "Memphis Raw", "Brazilian Funk", "Distorted 808s", "Vintage Tape", "Modern Trap"]
  const drumTypes = ["cowbell", "kicks", "snares", "hats"]

  // Load preset
  useEffect(() => {
    if (PRESETS[currentPreset]) {
      const preset = PRESETS[currentPreset]
      setBpm([preset.bpm])
      setSwing([preset.swing])
      setTapeDrag([preset.tapeDrag])
      setSelectedKit(preset.drumKit)
      setDrumPattern(preset.pattern.map(Boolean))
      setPitch808([preset.pitch808])
      setGlide808([preset.glide808])
      setDistortion808([preset.distortion808])
      setSaturation([preset.saturation])
      setReverb([preset.reverb])
      setDelay([preset.delay])
      setVinylCrackle([preset.vinylCrackle])
      setTapeWobble([preset.tapeWobble])
    }
  }, [currentPreset])

  // Sequencer animation
  useEffect(() => {
    if (isPlaying) {
      let step = 0
      const stepsPerBeat = 4
      const msPerBeat = (60 / bpm[0]) * 1000

      const runSequencer = () => {
        setCurrentStep(step)
        step = (step + 1) % 16
        animationRef.current = requestAnimationFrame(() => {
          setTimeout(runSequencer, msPerBeat / stepsPerBeat)
        })
      }

      runSequencer()
    } else {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current)
      }
      setCurrentStep(-1)
    }

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current)
      }
    }
  }, [isPlaying, bpm])

  // Audio visualization
  useEffect(() => {
    if (!canvasRef.current) return

    const canvas = canvasRef.current
    const ctx = canvas.getContext("2d")
    if (!ctx) return

    const width = canvas.width
    const height = canvas.height

    // Clear canvas
    ctx.fillStyle = "rgba(0, 0, 0, 0.3)"
    ctx.fillRect(0, 0, width, height)

    // Draw waveform
    ctx.beginPath()
    ctx.strokeStyle = isPlaying ? "#f97316" : "#9333ea"
    ctx.lineWidth = 2

    const segments = 100
    const amplitude = height / 3
    const frequency = isPlaying ? 0.05 : 0.02
    const wobble = tapeWobble[0] / 100

    for (let i = 0; i < segments; i++) {
      const x = (width / segments) * i
      const t = Date.now() * 0.001

      // Create a complex waveform with wobble effect
      const y =
        height / 2 +
        Math.sin(i * frequency + t * 2) * amplitude * 0.5 +
        Math.sin(i * frequency * 0.5 + t * 3 + Math.sin(t * wobble * 2)) * amplitude * 0.3 +
        (isPlaying && drumPattern[currentStep] ? Math.sin(i * 0.4 + t * 10) * amplitude * 0.4 : 0)

      if (i === 0) {
        ctx.moveTo(x, y)
      } else {
        ctx.lineTo(x, y)
      }
    }
    ctx.stroke()

    // Add vinyl crackle visualization
    if (vinylCrackle[0] > 10) {
      const crackleAmount = vinylCrackle[0] / 100
      ctx.fillStyle = `rgba(255, 255, 255, ${crackleAmount * 0.2})`

      for (let i = 0; i < crackleAmount * 50; i++) {
        const x = Math.random() * width
        const y = Math.random() * height
        const size = Math.random() * 2 * crackleAmount
        ctx.fillRect(x, y, size, size)
      }
    }

    // Sequencer position indicator
    if (currentStep >= 0) {
      const stepWidth = width / 16
      ctx.fillStyle = "rgba(249, 115, 22, 0.5)"
      ctx.fillRect(currentStep * stepWidth, 0, stepWidth, height)
    }

    const animationId = requestAnimationFrame(() => {})
    return () => cancelAnimationFrame(animationId)
  }, [isPlaying, currentStep, vinylCrackle, tapeWobble])

  const toggleStep = (index: number) => {
    const newPattern = [...drumPattern]
    newPattern[index] = !newPattern[index]
    setDrumPattern(newPattern)
  }

  const loadSamplePattern = (type: string, index: number) => {
    if (AUDIO_SAMPLES[type] && AUDIO_SAMPLES[type][index]) {
      setDrumPattern(AUDIO_SAMPLES[type][index].pattern.map(Boolean))
    }
  }

  const handlePresetChange = (preset: string) => {
    setCurrentPreset(preset)
  }

  const toggleSampleBrowser = () => {
    setSampleBrowserOpen(!sampleBrowserOpen)
  }

  const selectSample = (sample) => {
    setSelectedSample(sample)

    // Add to loaded samples list if not already included
    if (!samplesLoaded.includes(sample)) {
      setSamplesLoaded((prev) => [...prev, sample].slice(-5)) // Keep last 5 samples
    }

    // Simulate loading a sample
    setTimeout(() => {
      setSampleBrowserOpen(false)
    }, 500)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-black to-orange-900 p-4">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="text-center space-y-2">
          <h1 className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-orange-400 to-purple-400">
            PhonkWave BR
          </h1>
          <p className="text-gray-300">Brazilian Phonk Production Suite</p>
          <div className="flex items-center justify-center gap-4">
            <Badge variant="secondary" className="bg-orange-600/20 text-orange-300">
              🇧🇷 Brazilian Phonk
            </Badge>
            <Badge variant="secondary" className="bg-purple-600/20 text-purple-300">
              🔥 Cowbell Heavy
            </Badge>
            <Badge variant="secondary" className="bg-gray-600/20 text-gray-300">
              📼 Vintage Vibes
            </Badge>
          </div>
        </div>

        {/* Audio Visualization */}
        <Card className="bg-black/40 border-orange-500/30">
          <CardContent className="p-4">
            <canvas ref={canvasRef} width={1000} height={100} className="w-full h-24 rounded-md" />
          </CardContent>
        </Card>

        {/* Transport & Master Controls */}
        <Card className="bg-black/40 border-orange-500/30">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <Button
                  size="lg"
                  onClick={() => setIsPlaying(!isPlaying)}
                  className="bg-orange-600 hover:bg-orange-700"
                >
                  {isPlaying ? <Pause className="w-6 h-6" /> : <Play className="w-6 h-6" />}
                </Button>
                <Button variant="outline" size="lg" onClick={() => setIsPlaying(false)}>
                  <Square className="w-4 h-4" />
                </Button>
                <div className="text-2xl font-mono text-orange-400">{bpm[0]} BPM</div>
              </div>

              <div className="flex items-center gap-6">
                <div className="space-y-2">
                  <Label className="text-gray-300">Preset</Label>
                  <Select value={currentPreset} onValueChange={handlePresetChange}>
                    <SelectTrigger className="w-48 bg-black/60 border-purple-500/30">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {Object.keys(PRESETS).map((preset) => (
                        <SelectItem key={preset} value={preset}>
                          {preset}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label className="text-gray-300">Master Volume</Label>
                  <div className="flex items-center gap-2">
                    <Volume2 className="w-4 h-4 text-gray-400" />
                    <Slider value={masterVolume} onValueChange={setMasterVolume} max={100} step={1} className="w-24" />
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Drum Machine & 808 */}
          <div className="space-y-6">
            {/* Drum Machine */}
            <Card className="bg-black/40 border-orange-500/30">
              <CardHeader>
                <CardTitle className="text-orange-400 flex items-center gap-2">
                  <Zap className="w-5 h-5" />
                  Drum Machine
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label className="text-gray-300">Kit</Label>
                  <Select value={selectedKit} onValueChange={setSelectedKit}>
                    <SelectTrigger className="bg-black/60 border-purple-500/30">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {drumKits.map((kit) => (
                        <SelectItem key={kit} value={kit}>
                          {kit}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Drum Type Selector */}
                <div className="space-y-2">
                  <Label className="text-gray-300">Drum Type</Label>
                  <div className="flex gap-2">
                    {drumTypes.map((type) => (
                      <Button
                        key={type}
                        variant={selectedDrumType === type ? "default" : "outline"}
                        size="sm"
                        onClick={() => setSelectedDrumType(type)}
                        className={selectedDrumType === type ? "bg-orange-600" : ""}
                      >
                        {type.charAt(0).toUpperCase() + type.slice(1)}
                      </Button>
                    ))}
                  </div>
                </div>

                {/* Sample Patterns */}
                <div className="space-y-2">
                  <Label className="text-gray-300">Sample Patterns</Label>
                  <div className="flex gap-2 flex-wrap">
                    {AUDIO_SAMPLES[selectedDrumType]?.map((sample, index) => (
                      <Button
                        key={index}
                        variant="outline"
                        size="sm"
                        onClick={() => loadSamplePattern(selectedDrumType, index)}
                        className="text-xs"
                      >
                        {sample.name}
                      </Button>
                    ))}
                  </div>
                </div>

                {/* Step Sequencer */}
                <div className="space-y-2">
                  <Label className="text-gray-300">Pattern</Label>
                  <div className="grid grid-cols-8 gap-1">
                    {drumPattern.map((active, index) => (
                      <Button
                        key={index}
                        size="sm"
                        variant={active ? "default" : "outline"}
                        onClick={() => toggleStep(index)}
                        className={`h-8 w-8 p-0 ${
                          currentStep === index && isPlaying
                            ? "ring-2 ring-white"
                            : active
                              ? "bg-orange-600 hover:bg-orange-700"
                              : "bg-black/60 border-gray-600 hover:bg-gray-800"
                        }`}
                      >
                        {index + 1}
                      </Button>
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label className="text-gray-300">Swing</Label>
                    <Slider value={swing} onValueChange={setSwing} min={-50} max={50} step={1} />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-gray-300">Tape Drag</Label>
                    <Slider value={tapeDrag} onValueChange={setTapeDrag} max={100} step={1} />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* 808 Synth Engine */}
            <Card className="bg-black/40 border-purple-500/30">
              <CardHeader>
                <CardTitle className="text-purple-400 flex items-center gap-2">
                  <Music className="w-5 h-5" />
                  808 Synth Engine
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label className="text-gray-300">Pitch Slide</Label>
                  <Slider value={pitch808} onValueChange={setPitch808} min={-24} max={24} step={1} />
                  <div className="text-xs text-gray-400 text-right">
                    {pitch808[0] > 0 ? "+" : ""}
                    {pitch808[0]} semitones
                  </div>
                </div>
                <div className="space-y-2">
                  <Label className="text-gray-300">Glide</Label>
                  <Slider value={glide808} onValueChange={setGlide808} max={100} step={1} />
                  <div className="text-xs text-gray-400 text-right">{glide808[0]}%</div>
                </div>
                <div className="space-y-2">
                  <Label className="text-gray-300">Distortion</Label>
                  <Slider value={distortion808} onValueChange={setDistortion808} max={100} step={1} />
                  <div className="text-xs text-gray-400 text-right">{distortion808[0]}%</div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Middle Column - Melody Engine & Vinyl */}
          <div className="space-y-6">
            {/* Melody Engine */}
            <Card className="bg-black/40 border-green-500/30">
              <CardHeader>
                <CardTitle className="text-green-400 flex items-center gap-2">
                  <Disc className="w-5 h-5" />
                  Melody Engine
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <Tabs defaultValue="fm" className="w-full">
                  <TabsList className="grid w-full grid-cols-2 bg-black/60">
                    <TabsTrigger value="fm">FM Synth</TabsTrigger>
                    <TabsTrigger value="sample">Sample Loader</TabsTrigger>
                  </TabsList>

                  <TabsContent value="fm" className="space-y-4">
                    <div className="space-y-2">
                      <Label className="text-gray-300">Carrier Freq</Label>
                      <Slider defaultValue={[440]} min={100} max={2000} step={10} />
                      <div className="text-xs text-gray-400 text-right">440 Hz</div>
                    </div>
                    <div className="space-y-2">
                      <Label className="text-gray-300">Modulation</Label>
                      <Slider defaultValue={[50]} max={100} step={1} />
                      <div className="text-xs text-gray-400 text-right">50%</div>
                    </div>
                    <div className="space-y-2">
                      <Label className="text-gray-300">Eerie Factor</Label>
                      <Slider defaultValue={[30]} max={100} step={1} />
                      <div className="text-xs text-gray-400 text-right">30%</div>
                    </div>
                  </TabsContent>

                  <TabsContent value="sample" className="space-y-4">
                    {/* Main Upload Button */}
                    <div className="space-y-2">
                      <Button
                        variant="outline"
                        className="w-full h-12 border-dashed border-2 border-green-500/30 hover:border-green-500/50 bg-green-900/10 hover:bg-green-900/20"
                        onClick={toggleSampleBrowser}
                      >
                        <Upload className="w-5 h-5 mr-2" />
                        <div className="flex flex-col items-center">
                          <span className="font-medium">Upload Audio File</span>
                          <span className="text-xs text-gray-400">WAV, MP3, AIFF, FLAC</span>
                        </div>
                      </Button>

                      {/* Quick Access Buttons */}
                      <div className="grid grid-cols-2 gap-2">
                        <Button variant="outline" size="sm" className="text-xs">
                          <span className="mr-1">📁</span> Browse PC Files
                        </Button>
                        <Button variant="outline" size="sm" className="text-xs" onClick={toggleSampleBrowser}>
                          <span className="mr-1">🎵</span> Sample Library
                        </Button>
                      </div>
                    </div>

                    {/* File Drop Zone */}
                    <div className="border-2 border-dashed border-gray-600 rounded-lg p-4 text-center bg-black/20">
                      <div className="space-y-2">
                        <Upload className="w-8 h-8 mx-auto text-gray-400" />
                        <p className="text-sm text-gray-400">Drag & drop audio files here</p>
                        <p className="text-xs text-gray-500">Supports: WAV, MP3, AIFF, FLAC up to 32-bit/192kHz</p>
                      </div>
                    </div>

                    {sampleBrowserOpen && (
                      <Card className="bg-black/90 border-green-500/30 absolute z-10 w-[95%] max-h-[400px]">
                        <CardHeader className="pb-2">
                          <CardTitle className="text-green-400 flex justify-between items-center">
                            <span>Audio File Browser</span>
                            <Button variant="ghost" size="sm" onClick={() => setSampleBrowserOpen(false)}>
                              ✕
                            </Button>
                          </CardTitle>
                        </CardHeader>
                        <CardContent>
                          <Tabs defaultValue={sampleCategory} className="w-full" onValueChange={setSampleCategory}>
                            <TabsList className="grid grid-cols-5 bg-black/60 mb-3">
                              {Object.keys(sampleCategories).map((category) => (
                                <TabsTrigger key={category} value={category} className="text-xs">
                                  {category}
                                </TabsTrigger>
                              ))}
                            </TabsList>

                            <div className="max-h-48 overflow-y-auto border border-gray-700 rounded-md p-2 bg-black/40">
                              {sampleCategories[sampleCategory]?.map((sample) => (
                                <div
                                  key={sample}
                                  className="flex items-center justify-between p-2 hover:bg-gray-800/50 rounded group"
                                >
                                  <div className="flex items-center">
                                    <Waveform className="w-4 h-4 mr-2 text-green-400" />
                                    <span className="text-sm">{sample}</span>
                                  </div>
                                  <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <Button size="sm" variant="ghost" className="h-6 w-6 p-0">
                                      <Play className="w-3 h-3" />
                                    </Button>
                                    <Button
                                      size="sm"
                                      variant="default"
                                      className="h-6 px-2 text-xs bg-green-700 hover:bg-green-800"
                                      onClick={() => selectSample(sample)}
                                    >
                                      Load
                                    </Button>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </Tabs>

                          {samplesLoaded.length > 0 && (
                            <div className="mt-3 pt-3 border-t border-gray-700">
                              <Label className="text-xs text-gray-400 mb-2 block">Recently Loaded</Label>
                              <div className="flex flex-wrap gap-1">
                                {samplesLoaded.map((sample) => (
                                  <Badge
                                    key={sample}
                                    className="bg-green-900/30 text-green-400 text-xs cursor-pointer hover:bg-green-900/50"
                                    onClick={() => selectSample(sample)}
                                  >
                                    {sample.split("_")[0]}
                                  </Badge>
                                ))}
                              </div>
                            </div>
                          )}

                          <div className="flex justify-between mt-4 pt-3 border-t border-gray-700">
                            <Button size="sm" variant="outline" className="text-xs">
                              <span className="mr-1">📂</span> Open Folder
                            </Button>
                            <div className="flex gap-2">
                              <Button size="sm" variant="outline" className="text-xs">
                                Preview
                              </Button>
                              <Button size="sm" variant="default" className="text-xs bg-green-700 hover:bg-green-800">
                                Import Selected
                              </Button>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    )}

                    {/* Current Sample Display */}
                    <div className="space-y-3">
                      <Label className="text-gray-300">Loaded Sample</Label>
                      <div className="bg-black/40 rounded-md p-3 border border-gray-700">
                        {selectedSample ? (
                          <div className="space-y-2">
                            <div className="flex justify-between items-center">
                              <span className="text-sm text-green-400 font-medium">{selectedSample}</span>
                              <div className="flex gap-2">
                                <Badge className="bg-green-900/30 text-green-400 text-xs">Loaded</Badge>
                                <Button size="sm" variant="ghost" className="h-6 w-6 p-0">
                                  <Play className="w-3 h-3" />
                                </Button>
                              </div>
                            </div>

                            {/* Sample Info */}
                            <div className="grid grid-cols-3 gap-2 text-xs text-gray-400">
                              <div>Length: 2.4s</div>
                              <div>Rate: 44.1kHz</div>
                              <div>Bit: 24-bit</div>
                            </div>

                            {/* Waveform Visualization */}
                            <div className="h-12 bg-black/40 rounded-md relative overflow-hidden border border-gray-800">
                              <div className="absolute inset-0 flex items-center justify-center">
                                <div className="w-full px-3">
                                  <div className="h-8 flex items-center">
                                    {Array.from({ length: 60 }).map((_, i) => (
                                      <div
                                        key={i}
                                        className="w-1 bg-green-500/70 mx-[1px]"
                                        style={{
                                          height: `${Math.sin(i * 0.3) * 25 + Math.random() * 20 + 20}%`,
                                        }}
                                      />
                                    ))}
                                  </div>
                                </div>
                              </div>
                              {/* Playhead indicator */}
                              <div className="absolute top-0 left-4 w-0.5 h-full bg-orange-400 opacity-75"></div>
                            </div>
                          </div>
                        ) : (
                          <div className="h-20 flex flex-col items-center justify-center text-gray-500 text-sm">
                            <Upload className="w-6 h-6 mb-1 opacity-50" />
                            <span>No audio file loaded</span>
                            <span className="text-xs">Click upload or drag files above</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>

            {/* Vinyl Emulator */}
            <Card className="bg-black/40 border-yellow-500/30">
              <CardHeader>
                <CardTitle className="text-yellow-400 flex items-center gap-2">
                  <RotateCcw className="w-5 h-5" />
                  Vinyl Emulator
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label className="text-gray-300">Vinyl Crackle</Label>
                  <Slider value={vinylCrackle} onValueChange={setVinylCrackle} max={100} step={1} />
                  <div className="text-xs text-gray-400 text-right">{vinylCrackle[0]}%</div>
                </div>
                <div className="space-y-2">
                  <Label className="text-gray-300">Tape Wobble</Label>
                  <Slider value={tapeWobble} onValueChange={setTapeWobble} max={100} step={1} />
                  <div className="text-xs text-gray-400 text-right">{tapeWobble[0]}%</div>
                </div>
                <div className="space-y-2">
                  <Label className="text-gray-300">Lo-Fi Amount</Label>
                  <Slider defaultValue={[60]} max={100} step={1} />
                  <div className="text-xs text-gray-400 text-right">60%</div>
                </div>

                {/* Vinyl visualization */}
                <div className="mt-4 relative">
                  <div className="w-full h-24 bg-black/40 rounded-full flex items-center justify-center overflow-hidden">
                    <div
                      className="w-[90%] h-[90%] rounded-full bg-gradient-to-br from-gray-700 to-gray-900 animate-spin"
                      style={{
                        animationDuration: isPlaying ? "2s" : "0s",
                        animationTimingFunction: "linear",
                        animationIterationCount: "infinite",
                      }}
                    >
                      <div className="w-[20%] h-[20%] rounded-full bg-gray-800 absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2"></div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Right Column - Effects Rack */}
          <div className="space-y-6">
            <Card className="bg-black/40 border-red-500/30">
              <CardHeader>
                <CardTitle className="text-red-400 flex items-center gap-2">
                  <Settings className="w-5 h-5" />
                  Effects Rack
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Saturation */}
                <div className="space-y-2">
                  <Label className="text-gray-300">Saturation</Label>
                  <Slider value={saturation} onValueChange={setSaturation} max={100} step={1} />
                  <div className="text-xs text-gray-400 text-right">{saturation[0]}%</div>
                  <div className="flex gap-2">
                    <Button size="sm" variant="outline" className="text-xs">
                      Soft Clip
                    </Button>
                    <Button size="sm" variant="default" className="text-xs bg-red-600 hover:bg-red-700">
                      Tape
                    </Button>
                    <Button size="sm" variant="outline" className="text-xs">
                      Tube
                    </Button>
                  </div>
                </div>

                {/* Reverb & Delay */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label className="text-gray-300">Reverb</Label>
                    <Slider value={reverb} onValueChange={setReverb} max={100} step={1} />
                    <div className="text-xs text-gray-400 text-right">{reverb[0]}%</div>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-gray-300">Vintage Delay</Label>
                    <Slider value={delay} onValueChange={setDelay} max={100} step={1} />
                    <div className="text-xs text-gray-400 text-right">{delay[0]}%</div>
                  </div>
                </div>

                {/* EQ */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label className="text-gray-300">EQ</Label>
                    <div className="flex items-center gap-2">
                      <Radio className="w-4 h-4 text-gray-400" />
                      <Switch checked={eqRadio} onCheckedChange={setEqRadio} />
                      <Label className="text-xs text-gray-400">Radio</Label>
                    </div>
                  </div>
                  <div className="grid grid-cols-3 gap-2">
                    <div className="text-center">
                      <Label className="text-xs text-gray-400">Low</Label>
                      <Slider
                        defaultValue={[0]}
                        min={-12}
                        max={12}
                        step={1}
                        orientation="vertical"
                        className="h-16 mx-auto"
                      />
                      <div className="text-xs text-gray-400">0 dB</div>
                    </div>
                    <div className="text-center">
                      <Label className="text-xs text-gray-400">Mid</Label>
                      <Slider
                        defaultValue={[0]}
                        min={-12}
                        max={12}
                        step={1}
                        orientation="vertical"
                        className="h-16 mx-auto"
                      />
                      <div className="text-xs text-gray-400">0 dB</div>
                    </div>
                    <div className="text-center">
                      <Label className="text-xs text-gray-400">High</Label>
                      <Slider
                        defaultValue={[0]}
                        min={-12}
                        max={12}
                        step={1}
                        orientation="vertical"
                        className="h-16 mx-auto"
                      />
                      <div className="text-xs text-gray-400">0 dB</div>
                    </div>
                  </div>
                </div>

                {/* Chopper & Pitch Shifter */}
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label className="text-gray-300">Chopper (Stutter/Gate)</Label>
                    <Slider value={chopper} onValueChange={setChopper} max={100} step={1} />
                    <div className="text-xs text-gray-400 text-right">{chopper[0]}%</div>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-gray-300">Pitch Shifter</Label>
                    <Slider value={pitchShift} onValueChange={setPitchShift} min={-12} max={12} step={1} />
                    <div className="text-xs text-gray-400 text-right">
                      {pitchShift[0] > 0 ? "+" : ""}
                      {pitchShift[0]} semitones
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Export Options */}
            <Card className="bg-black/40 border-blue-500/30">
              <CardHeader>
                <CardTitle className="text-blue-400">Export</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <Button className="w-full" variant="outline">
                  <Download className="w-4 h-4 mr-2" />
                  Export to MIDI
                </Button>
                <Button className="w-full" variant="outline">
                  <Download className="w-4 h-4 mr-2" />
                  Export to FL Piano Roll
                </Button>
                <Button className="w-full bg-blue-600 hover:bg-blue-700">
                  <Download className="w-4 h-4 mr-2" />
                  Render Audio
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* BPM Control */}
        <Card className="bg-black/40 border-orange-500/30">
          <CardContent className="p-4">
            <div className="flex items-center justify-center gap-4">
              <Label className="text-gray-300">BPM</Label>
              <Slider value={bpm} onValueChange={setBpm} min={60} max={200} step={1} className="w-64" />
              <span className="text-orange-400 font-mono w-12">{bpm[0]}</span>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
