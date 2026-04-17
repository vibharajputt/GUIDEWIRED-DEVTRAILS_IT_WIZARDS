import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Mic, MicOff, AlertCircle, CheckCircle, Activity } from 'lucide-react';
import { simulateDisruption } from '../services/api';

export default function VoiceSOS({ workerZone, workerPincode, onClaimTriggered }) {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [status, setStatus] = useState('idle'); // idle, listening, processing, success, partial
  const recognitionRef = useRef(null);

  useEffect(() => {
    // Initialize Web Speech API
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (SpeechRecognition) {
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = false;
      recognitionRef.current.interimResults = true;
      recognitionRef.current.lang = 'en-IN'; // Defaulting to Indian English, handles hinglish well

      recognitionRef.current.onstart = () => {
        setIsListening(true);
        setStatus('listening');
        setTranscript('');
      };

      recognitionRef.current.onresult = (event) => {
        const current = event.resultIndex;
        const result = event.results[current][0].transcript;
        setTranscript(result);
      };

      recognitionRef.current.onend = async () => {
        setIsListening(false);
        // If we stopped abruptly or user stopped speaking
        if (status === 'listening' || status === 'processing') {
             processVoiceCommand(transcript);
        }
      };

      recognitionRef.current.onerror = (event) => {
        console.error('Speech recognition error', event.error);
        setIsListening(false);
        setStatus('idle');
      };
    }
    
    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
    };
  }, [transcript]);

  const toggleListen = () => {
    if (isListening) {
      recognitionRef.current?.stop();
    } else {
      setTranscript('Listening to your SOS...');
      recognitionRef.current?.start();
    }
  };

  const processVoiceCommand = async (text) => {
    setStatus('processing');
    const lowerText = text.toLowerCase();
    
    // Simple NLP / Keyword Extractor
    let detectedType = null;
    if (lowerText.includes('flood') || lowerText.includes('water')) detectedType = 'FLOOD';
    else if (lowerText.includes('rain') || lowerText.includes('storm')) detectedType = 'HEAVY_RAIN';
    else if (lowerText.includes('heat') || lowerText.includes('hot')) detectedType = 'EXTREME_HEAT';
    else if (lowerText.includes('accident') || lowerText.includes('crash')) detectedType = 'ACCIDENT';
    else if (lowerText.includes('curfew') || lowerText.includes('police')) detectedType = 'CURFEW';
    else if (lowerText.includes('fog') || lowerText.includes('see')) detectedType = 'DENSE_FOG';
    
    if (detectedType) {
      setTimeout(async () => {
        try {
           const res = await simulateDisruption({
               disruption_type: detectedType,
               pincode: workerPincode || '400053',
               zone: workerZone || 'Andheri West',
               value: 100, // mock extreme value
               duration_hours: 2
           });
           setStatus('success');
           if (onClaimTriggered) onClaimTriggered(res.data);
           setTimeout(() => {
             setStatus('idle');
             setTranscript('');
           }, 5000);
        } catch(e) {
           console.error(e);
           setStatus('idle');
        }
      }, 1500);
    } else {
      setStatus('partial');
      setTranscript(`Audio parsed: "${text}". No severe triggers detected. Contacting support.`);
      setTimeout(() => {
        setStatus('idle');
        setTranscript('');
      }, 5000);
    }
  };

  return (
    <div className="fixed bottom-6 right-6 z-[100] flex flex-col items-end">
      
      <AnimatePresence>
        {status !== 'idle' && (
          <motion.div 
            initial={{ opacity: 0, y: 20, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.9 }}
            className="mb-4 glass-super p-4 rounded-2xl w-72 shadow-2xl border border-brand-500/30 overflow-hidden relative"
          >
            {/* Visualizer Background Effect */}
            {isListening && (
              <div className="absolute inset-0 flex items-end justify-center opacity-30 pb-2 space-x-1 pointer-events-none">
                {[1,2,3,4,5,6].map(i => (
                  <motion.div key={i}
                    animate={{ height: ['10%', '60%', '10%'] }}
                    transition={{ repeat: Infinity, duration: Math.random() * 0.5 + 0.5 }}
                    className="w-2 bg-brand-400 rounded-t-full"
                  />
                ))}
              </div>
            )}
            
            <div className="relative z-10 flex items-start space-x-3">
               <div className={`p-2 rounded-full mt-1 ${status === 'processing' ? 'bg-indigo-500/20 text-indigo-400 animate-pulse' : status === 'success' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-red-500/20 text-red-500'}`}>
                  {status === 'listening' ? <Mic size={20} /> : status === 'success' ? <CheckCircle size={20} /> : <Activity size={20} />}
               </div>
               <div>
                 <h4 className="font-bold text-white text-sm">Voice AI Assistant</h4>
                 <p className="text-xs text-slate-300 italic mt-1 font-medium min-h-[40px]">
                    "{transcript || '...'}"
                 </p>
                 {status === 'processing' && <p className="text-[10px] text-brand-300 uppercase mt-2 tracking-wider animate-pulse">Running NLP Extractor...</p>}
                 {status === 'success' && <p className="text-[10px] text-emerald-300 uppercase mt-2 tracking-wider font-bold">Autonomous Claim Generated!</p>}
               </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <button 
        onClick={toggleListen}
        className={`relative flex items-center justify-center p-4 rounded-full shadow-[0_0_20px_rgba(0,0,0,0.5)] transition-all ${
          isListening 
            ? 'bg-red-600 border border-red-500 text-white' 
            : 'bg-gradient-to-tr from-brand-600 to-indigo-600 hover:from-brand-500 hover:to-indigo-500 border border-brand-400/50 text-white'
        }`}
      >
        {isListening ? (
          <>
            <span className="absolute inset-0 rounded-full animate-ping bg-red-500 opacity-40"></span>
            <MicOff size={24} />
          </>
        ) : (
          <Mic size={24} />
        )}
      </button>

    </div>
  );
}
