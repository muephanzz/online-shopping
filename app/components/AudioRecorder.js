import { useState } from "react";
import { Mic } from "lucide-react";

export const AudioRecorder = () => {
  const [isRecording, setIsRecording] = useState(false);

  const startRecording = () => {
    setIsRecording(true);
    // Implement audio recording logic here
  };

  const stopRecording = () => {
    setIsRecording(false);
    // Stop recording and save the audio
  };

  return (
    <div>
      <button
        onClick={isRecording ? stopRecording : startRecording}
        className="text-blue-500"
      >
        <Mic size={24} />
      </button>
    </div>
  );
};
