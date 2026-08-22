import os
import time
import pickle
import numpy as np
import streamlit as st
from PIL import Image
from predict import CropDiseasePredictor
from utils.disease_info import get_disease_details

# Configure Streamlit page layout and appearance
st.set_page_config(
    page_title="LeafShield AI - Crop Disease Detector",
    page_icon="🌿",
    layout="wide",
    initial_sidebar_state="expanded"
)

# Custom premium styling using Outfit Google Font and glassmorphism elements
CUSTOM_CSS = """
<style>
@import url('https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;600;800&display=swap');

/* Apply font across Streamlit elements */
html, body, [class*="css"], .stMarkdown {
    font-family: 'Outfit', sans-serif;
}

/* Glassmorphism containers for Streamlit native bordered containers */
div[data-testid="stVerticalBlockBorder"] {
    background: rgba(255, 255, 255, 0.04) !important;
    border-radius: 20px !important;
    border: 1px solid rgba(255, 255, 255, 0.08) !important;
    backdrop-filter: blur(12px) !important;
    box-shadow: 0 10px 30px 0 rgba(0, 0, 0, 0.25) !important;
    padding: 28px !important;
    margin-bottom: 25px !important;
    transition: transform 0.3s ease, border-color 0.3s ease !important;
}
div[data-testid="stVerticalBlockBorder"]:hover {
    transform: translateY(-4px);
    border-color: rgba(46, 213, 115, 0.3) !important;
}

/* Headings and titles */
.gradient-title {
    font-size: 3.2rem;
    font-weight: 800;
    background: linear-gradient(135deg, #2ed573 0%, #1abc9c 100%);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    margin-bottom: 5px;
}
.subtitle {
    font-size: 1.2rem;
    color: #a4b0be;
    margin-bottom: 30px;
    font-weight: 300;
}

/* Badges for plant classifications */
.plant-badge {
    background: rgba(46, 213, 115, 0.15);
    color: #2ed573;
    border: 1px solid rgba(46, 213, 115, 0.3);
    padding: 6px 14px;
    border-radius: 50px;
    font-size: 0.9rem;
    font-weight: 600;
    display: inline-block;
    margin-right: 8px;
    margin-bottom: 10px;
}
.disease-badge {
    background: rgba(255, 71, 87, 0.15);
    color: #ff4757;
    border: 1px solid rgba(255, 71, 87, 0.3);
    padding: 6px 14px;
    border-radius: 50px;
    font-size: 0.9rem;
    font-weight: 600;
    display: inline-block;
    margin-bottom: 10px;
}
.healthy-badge {
    background: rgba(46, 213, 115, 0.25);
    color: #2ed573;
    border: 1px solid #2ed573;
    padding: 6px 14px;
    border-radius: 50px;
    font-size: 0.9rem;
    font-weight: 600;
    display: inline-block;
    margin-bottom: 10px;
}

/* Result metrics */
.stat-value {
    font-size: 2.2rem;
    font-weight: 800;
    color: #ffffff;
    margin-top: 5px;
}
.stat-label {
    font-size: 0.85rem;
    color: #747d8c;
    text-transform: uppercase;
    letter-spacing: 1px;
}

/* Tip sections */
.tip-box {
    background: rgba(255, 255, 255, 0.02);
    border-left: 4px solid #1abc9c;
    padding: 12px 18px;
    margin: 8px 0;
    border-radius: 0 8px 8px 0;
}
.tip-icon {
    font-weight: bold;
    color: #1abc9c;
    margin-right: 6px;
}

/* Upload area customizations */
.uploaded-img-frame {
    border-radius: 16px;
    overflow: hidden;
    border: 2px solid rgba(255, 255, 255, 0.08);
    box-shadow: 0 8px 24px rgba(0,0,0,0.3);
}

/* Banner for Demo mode */
.demo-banner {
    background: linear-gradient(90deg, #f39c12 0%, #e67e22 100%);
    color: white;
    padding: 10px 20px;
    border-radius: 10px;
    font-weight: bold;
    margin-bottom: 25px;
    text-align: center;
    box-shadow: 0 4px 15px rgba(230, 126, 34, 0.3);
}
</style>
"""

# Inject custom CSS
st.markdown(CUSTOM_CSS, unsafe_allow_html=True)

# Define directories for sample images
SAMPLES_DIR = os.path.join("assets", "sample_images")
os.makedirs(SAMPLES_DIR, exist_ok=True)

# Generate simple placeholder sample files if none exist
def verify_or_create_sample_files():
    """Checks for sample files, and creates dummy leaf images if empty."""
    samples = {
        "Tomato_Early_Blight.jpg": (220, 70, 70),  # Reddish-brown spots mock
        "Tomato_Healthy.jpg": (46, 204, 113),      # Lush Green mock
        "Potato_Late_Blight.jpg": (44, 62, 80)       # Dark charcoal spots mock
    }
    
    for filename, color in samples.items():
        filepath = os.path.join(SAMPLES_DIR, filename)
        if not os.path.exists(filepath):
            # Create a 400x400 colored square with some text as a simple mock image
            img = Image.new("RGB", (400, 400), color=color)
            img.save(filepath)

verify_or_create_sample_files()

# Try to load the model
@st.cache_resource
def load_disease_predictor():
    """Attempts to initialize the predictor. Returns (predictor, is_demo_mode)."""
    try:
        predictor = CropDiseasePredictor()
        return predictor, False
    except Exception as e:
        # Fallback to Demo Mode if models are missing
        return None, True

predictor, is_demo_mode = load_disease_predictor()

# --- SIDEBAR CONTENT ---
with st.sidebar:
    st.markdown("### 🌿 LeafShield AI")
    st.markdown("Using transfer learning on Google's **MobileNetV2** architecture, LeafShield AI analyzes foliage photographs to identify diseases and recommend rapid cures.")
    
    st.markdown("---")
    st.markdown("### 🖥️ Deployment Status")
    if is_demo_mode:
        st.markdown("🔴 **Neural Network**: Not Loaded")
        st.markdown("🟡 **Operational Mode**: **DEMO / SIMULATION**")
        st.markdown(
            "⚠️ *A trained model was not found in `model/`. Run `python train.py` to train your classifier and deploy to production.*"
        )
    else:
        st.markdown("🟢 **Neural Network**: Fully Operational")
        if predictor.use_tflite:
            st.markdown("⚡ **Model Type**: Quantized TFLite (~4MB)")
        else:
            st.markdown("🟢 **Model Type**: Full Keras H5 (~15MB)")
        st.markdown("🟢 **Operational Mode**: **PRODUCTION**")
        
    st.markdown("---")
    st.markdown("### 🛡️ Clean Farming Tips")
    st.markdown("1. **Prune Bottom Foliage**: Prevent soil-borne spores from splashing onto bottom leaves.")
    st.markdown("2. **Morning Watering**: Avoid damp foliage overnight by watering plants early in the day.")
    st.markdown("3. **Airflow Spacing**: Keep tomatoes spaced 2 feet apart to lower leaf humidity.")

# --- MAIN UI ---
st.markdown('<div class="gradient-title">LeafShield AI</div>', unsafe_allow_html=True)
st.markdown('<div class="subtitle">Real-Time Crop Disease Diagnosis & Treatment Recommendations</div>', unsafe_allow_html=True)

if is_demo_mode:
    st.markdown(
        '<div class="demo-banner">ℹ️ Running in Mock Demo Mode (No Trained Model Found in model/). Follow the steps below to train the AI.</div>', 
        unsafe_allow_html=True
    )

# Establish layout columns
col_left, col_right = st.columns([1, 1], gap="large")

# Initialize selected sample image variable in session state
if "sample_selected" not in st.session_state:
    st.session_state.sample_selected = None

# Left column: Interactive uploads, previews, and samples
with col_left:
    with st.container(border=True):
        st.markdown("### 📸 Input Leaf Image")
        
        # File uploader
        uploaded_file = st.file_uploader(
            "Upload a clear close-up photo of a leaf", 
            type=["png", "jpg", "jpeg"],
            help="Make sure the leaf surface is fully visible and in focus."
        )
        
        # Sample images selector
        st.markdown("**Or test with standard sample crops:**")
        sample_cols = st.columns(3)
        
        samples_map = {
            "Tomato Early Blight": "Tomato_Early_Blight.jpg",
            "Tomato Healthy": "Tomato_Healthy.jpg",
            "Potato Late Blight": "Potato_Late_Blight.jpg"
        }
        
        for idx, (label, fname) in enumerate(samples_map.items()):
            with sample_cols[idx]:
                if st.button(label, use_container_width=True):
                    st.session_state.sample_selected = fname
                    # Clear uploaded file state visually
                    uploaded_file = None
                    st.rerun()
    
        # Determine current image to inspect
        active_image = None
        image_display_path = None
        
        # 1. Prioritize manual file upload
        if uploaded_file is not None:
            st.session_state.sample_selected = None  # Reset sample selection
            try:
                active_image = Image.open(uploaded_file)
            except Exception:
                st.error("The uploaded file is not a valid image. Please upload a PNG or JPG leaf photo.")
                active_image = None
        # 2. Fallback to clicked sample
        elif st.session_state.sample_selected is not None:
            sample_path = os.path.join(SAMPLES_DIR, st.session_state.sample_selected)
            if os.path.exists(sample_path):
                active_image = Image.open(sample_path)
                image_display_path = sample_path
    
        # Preview section
        if active_image is not None:
            st.markdown("---")
            # Analyze Button placed ABOVE preview to prevent scroll UX issues
            predict_button = st.button("🔍 Run Disease Diagnosis", type="primary", use_container_width=True)
            
            st.markdown("**Leaf Image Preview:**")
            st.image(active_image, use_container_width=True)
        else:
            # Visual empty state
            st.info("💡 Please upload a leaf photo or click on one of the sample buttons to start the diagnostic scan.")
            predict_button = False

# Right column: Analysis output
with col_right:
    if predict_button and active_image is not None:
        with st.container(border=True):
            st.markdown("### 🩺 Diagnostic Report")
            
            # Progress scanner animation
            with st.spinner("Initializing neural scan... Analyzing leaf structures..."):
                time.sleep(1.2)  # Aesthetic sleep to show scan loading
                
                # RUN INFERENCE
                if is_demo_mode:
                    # Simulated prediction mappings based on source image/choice
                    if st.session_state.sample_selected == "Tomato_Early_Blight.jpg":
                        mock_class = "tomato_early_blight"
                        mock_confidence = 0.962
                    elif st.session_state.sample_selected == "Potato_Late_Blight.jpg":
                        mock_class = "potato_late_blight"
                        mock_confidence = 0.894
                    elif st.session_state.sample_selected == "Tomato_Healthy.jpg":
                        mock_class = "tomato_healthy"
                        mock_confidence = 0.985
                    else:
                        # Random selection if uploading an arbitrary file in demo mode
                        options = ["tomato_early_blight", "potato_late_blight", "tomato_healthy", "pepper_bell_bacterial_spot"]
                        mock_class = np.random.choice(options)
                        mock_confidence = float(np.random.uniform(0.85, 0.99))
                    
                    details = get_disease_details(mock_class)
                    diagnosis = {
                        "plant": details["plant"],
                        "disease": details["disease"],
                        "scientific_name": details["scientific_name"],
                        "confidence": mock_confidence,
                        "confidence_percentage": f"{mock_confidence * 100:.1f}%",
                        "symptoms": details["symptoms"],
                        "treatment": details["treatment"],
                        "prevention": details["prevention"]
                    }
                else:
                    # Active neural pipeline
                    diagnosis = predictor.predict(active_image)
                    
            # --- UI PRESENTATION OF RESULTS ---
            if not is_demo_mode and diagnosis["confidence"] < 0.60:
                st.warning(
                    "The model is not confident this image contains a valid crop leaf. "
                    "Please upload a clearer leaf photo or choose a sample image."
                )
            st.success("Diagnosis Complete!")
            
            # Class Badges
            st.markdown(f'<span class="plant-badge">🌾 Plant: {diagnosis["plant"]}</span>', unsafe_allow_html=True)
            
            is_healthy = diagnosis["disease"].lower() == "healthy"
            if is_healthy:
                st.markdown(f'<span class="healthy-badge">🟢 Status: {diagnosis["disease"]}</span>', unsafe_allow_html=True)
            else:
                st.markdown(f'<span class="disease-badge">⚠️ Disease: {diagnosis["disease"]}</span>', unsafe_allow_html=True)
                
            # Scientific Name
            if diagnosis["scientific_name"] != "N/A":
                st.markdown(f"*Pathogen: {diagnosis['scientific_name']}*")
                
            st.markdown("---")
            
            # Grid metrics
            metric_col1, metric_col2 = st.columns(2)
            with metric_col1:
                st.markdown(f'<div class="stat-label">Confidence Score</div>', unsafe_allow_html=True)
                st.markdown(f'<div class="stat-value">{diagnosis["confidence_percentage"]}</div>', unsafe_allow_html=True)
            with metric_col2:
                st.markdown(f'<div class="stat-label">Urgency Level</div>', unsafe_allow_html=True)
                if is_healthy:
                    st.markdown(f'<div class="stat-value" style="color: #2ed573;">LOW</div>', unsafe_allow_html=True)
                elif diagnosis["confidence"] > 0.90:
                    st.markdown(f'<div class="stat-value" style="color: #ff4757;">CRITICAL</div>', unsafe_allow_html=True)
                else:
                    st.markdown(f'<div class="stat-value" style="color: #ffa502;">MEDIUM</div>', unsafe_allow_html=True)

            # Confidence bar mapping
            progress_color = "#2ed573" if is_healthy else ("#ff4757" if diagnosis["confidence"] > 0.90 else "#ffa502")
            st.progress(diagnosis["confidence"])
            
            st.markdown("---")
            
            # Tab layouts for Details
            tab_symptoms, tab_treatment, tab_prevention = st.tabs([
                "🩺 Symptoms", 
                "🌿 Quick Treatment", 
                "🛡️ Long-term Prevention"
            ])
            
            with tab_symptoms:
                st.markdown("#### Primary Identifiers:")
                for s in diagnosis["symptoms"]:
                    st.markdown(f'<div class="tip-box"><span class="tip-icon">🔎</span>{s}</div>', unsafe_allow_html=True)
                    
            with tab_treatment:
                st.markdown("#### Recommended Remedial Steps:")
                for t in diagnosis["treatment"]:
                    st.markdown(f'<div class="tip-box" style="border-left-color: #ffa502;"><span class="tip-icon">💊</span>{t}</div>', unsafe_allow_html=True)
                    
            with tab_prevention:
                st.markdown("#### Preventative Cultural Practices:")
                for p in diagnosis["prevention"]:
                    st.markdown(f'<div class="tip-box" style="border-left-color: #2ed573;"><span class="tip-icon">🛡️</span>{p}</div>', unsafe_allow_html=True)
            
    else:
        # Waiting state
        with st.container(border=True):
            st.markdown("<div style='text-align: center; padding: 30px 10px;'>", unsafe_allow_html=True)
            st.markdown("<h1 style='font-size: 4rem; color: #57606f; margin-bottom: 20px;'>🔬</h1>", unsafe_allow_html=True)
            st.markdown("### Scan Diagnostics System Online")
            st.markdown("Once you upload an image or click a sample leaf on the left, click **Run Disease Diagnosis** to inspect the crop structure under the neural classifier.")
            st.markdown("</div>", unsafe_allow_html=True)
