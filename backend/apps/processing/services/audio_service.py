"""
Voice search / audio transcription (Version 4).
Uses Google's free Web Speech API via SpeechRecognition - WAV files only,
avoids needing ffmpeg installed for format conversion.
"""
import speech_recognition as sr


def extract_text_from_audio(file_path: str) -> str:
    recognizer = sr.Recognizer()
    with sr.AudioFile(file_path) as source:
        audio_data = recognizer.record(source)
    try:
        return recognizer.recognize_google(audio_data)
    except sr.UnknownValueError:
        return "[Could not understand audio - no clear speech detected]"
    except sr.RequestError as e:
        return f"[Speech recognition service error: {e}]"