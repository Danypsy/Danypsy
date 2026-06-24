from pathlib import Path
import joblib

MODEL_PATH = Path('models/sector_classifier.joblib')
_model = None

def load_model():
    global _model
    if _model is None:
        if not MODEL_PATH.exists():
            raise FileNotFoundError(f"Model file not found at {MODEL_PATH}. Run train_model.py first.")
        _model = joblib.load(MODEL_PATH)
    return _model

def classify_sector(text: str) -> str:
    """Classify a job posting text into a sector."""
    model = load_model()
    return model.predict([text])[0]

if __name__ == '__main__':
    sample = "Develop new software applications and manage systems"
    print(classify_sector(sample))
