# 🌿 LeafShield AI: Crop Disease Detection from Smartphone Photos

[![Python Version](https://img.shields.io/badge/python-3.9+-blue.svg)](https://www.python.org/)
[![TensorFlow Version](https://img.shields.io/badge/tensorflow-2.10+-orange.svg)](https://www.tensorflow.org/)
[![Streamlit App](https://img.shields.io/badge/streamlit-UI-red.svg)](https://streamlit.io/)
[![Model Format](https://img.shields.io/badge/model-TFLite%20Quantized-green.svg)](https://www.tensorflow.org/lite)

LeafShield AI is a state-of-the-art, end-to-end crop disease diagnosis web application. By utilizing transfer learning with Google’s **MobileNetV2** architecture and the **PlantVillage** dataset, LeafShield AI analyzes smartphone photographs of leaves to immediately detect plant species, diagnose diseases, provide confidence ratings, and offer actionable organic and chemical treatment remedies.

---

## 🌟 Key Features

1. **Automatic Dataset Management**: Automatic downloader that creates folders, verifies, downloads, and extracts the Kaggle `plantdisease` dataset.
2. **Dynamic Data Augmentation**: In-model Keras augmentation pipeline applying random rotation, zoom, flips, and contrast changes to increase generalization.
3. **Pre-trained MobileNetV2 Base**: High-efficiency CNN leveraging deep feature maps learned from millions of images on ImageNet.
4. **Quantized TFLite Edge Optimization**: Automatic post-training integer quantization to compress the model from ~15 MB down to ~4 MB for hyper-fast, low-memory browser and edge execution.
5. **Glassmorphic Streamlit Dashboard**: A stunning, modern, dark-themed responsive dashboard with custom CSS, progress sliders, diagnostic gauges, and interactive expanders.
6. **Smart Demo Mode Fallback**: Automatically senses if the model isn't trained yet, switching to a simulated interactive showcase mode so developers and users can play with the diagnostic dashboard immediately.
7. **Interactive Sample Drawer**: Comes preloaded with professional leaf photography representing healthy crops and blights, letting users test predictions instantly.

---

## 📂 Project Directory Structure

The project has been organized according to strict modular production standards:

```
crop-disease-detector/
│
├── app.py                      # Glassmorphic Streamlit Web Application
├── train.py                    # Complete model training and evaluation pipeline
├── predict.py                  # Dual Keras H5 & Quantized TFLite prediction engine
├── requirements.txt            # Python dependencies lists
├── README.md                   # Project documentation
│
├── model/                      # Saved weights and parameters
│   ├── crop_disease_model.h5   # Trained standard Keras model
│   ├── crop_disease_model.tflite # Compressed, 8-bit quantized TFLite model
│   └── label_encoder.pkl       # Serialized class list
│
├── dataset/                    # PlantVillage dataset folder (populated automatically)
│
├── utils/                      # Internal helper modules
│   ├── preprocess.py           # Scaling routines and Keras augmentation pipelines
│   ├── disease_info.py         # Disease dictionary, symptoms, and cures DB
│   └── helpers.py              # Kaggle download, recursive paths, and plotting helpers
│
├── assets/                     # High-res static images
│   └── sample_images/          # Sample leaves for instant testing in the dashboard
│       ├── Tomato_Healthy.jpg
│       ├── Tomato_Early_Blight.jpg
│       └── Potato_Late_Blight.jpg
│
└── notebooks/                  # Interactive experimentation
    └── experimentation.ipynb  # Step-by-step walk-through of the ML architecture
```
## 🚀 Quick Start

1. Install required packages:
   ```bash
   pip install -r requirements.txt
   ```
2. Train the model (creates `model/` files):
   ```bash
   python train.py
   ```
3. Launch the Streamlit dashboard:
   ```bash
   streamlit run app.py
   ```
   If Streamlit is not installed as a command, use:
   ```bash
   python -m streamlit run app.py
   ```
4. Optionally run a single-image CLI prediction:
   ```bash
   python predict.py path\to\leaf_image.jpg
   ```
---

## 🛠️ Installation & Setup

Follow these straightforward steps to run the application locally on your computer.

### Step 1: Clone the Code & Setup Python Environment
Create a clean workspace folder, clone the code, and ensure Python (3.9+) is active.

### Step 2: Install Libraries
Install all required libraries at once:
```bash
pip install -r requirements.txt
```

---

## 🔑 Kaggle API Credentials Setup

LeafShield AI downloads the 800 MB PlantVillage dataset automatically. For this to work, you must link your Kaggle Account:

1. **Log in to Kaggle**: Go to [https://www.kaggle.com](https://www.kaggle.com).
2. **Download API Token**: Go to your **Account Settings** and scroll down to the API section. Click **Create New API Token**.
3. **Save Token**: A file named `kaggle.json` will download.
4. **Place Token**: Save the `kaggle.json` file **directly in the root of the project folder**:
   ```
   c:\Users\User\Downloads\Crop Disease Detection from Smartphone Photos\kaggle.json
   ```
   *Note: LeafShield's helper module will automatically move it to `~/.kaggle/` and set proper permissions on startup!*

---

## 🚀 Model Training & Quantization

To download the dataset, train the neural network, plot evaluations, and export the quantized TFLite binary, run:

```bash
python train.py
```

### What happens under the hood during training?
* Configures folders and validates your Kaggle API key.
* Automatically downloads and unzips `emmarex/plantdisease` to `dataset/`.
* Spits the dataset into `80% Train` and `20% Validation` batches.
* Loads MobileNetV2 with frozen ImageNet weights.
* Inserts dynamic augmentation (rotation, flips, zoom, contrast) directly inside the model.
* Sets up learning-rate schedulers (`ReduceLROnPlateau`), checkpoints, and early-stoppers.
* Saves the best classifier as `model/crop_disease_model.h5`.
* Exports loss/accuracy charts and a confusion matrix to `model/`.
* Converts and quantizes the Keras graph to `model/crop_disease_model.tflite`, shrinking the model size by ~73%!

---

## 💻 Running the Streamlit Web Application

Launch the glassmorphic interactive web dashboard locally:

```bash
streamlit run app.py
```

### How to use the app:
1. **Interactive Demo Mode**: If you haven't run `train.py` yet, the app launches in **Demo Mode**. You can click on the pre-loaded **Tomato Early Blight**, **Tomato Healthy**, or **Potato Late Blight** samples to see the layout instantly!
2. **Real-time Diagnostic Scan**: Once your model is trained, upload any leaf picture or choose a sample, click **Run Disease Diagnosis**, and watch the model instantly classify the plant species, compute confidence levels, and list symptoms, treatments, and prevention tips.

---

## 🔬 Deep-dive Experiments

Want to see how the image preprocessing and data augmentation looks visually?
Open the interactive experimentation notebook:
```bash
jupyter notebook notebooks/experimentation.ipynb
```
*Contains step-by-step Python code demonstrating the Keras augmentation layer and plotting leaf transformations side-by-side using Matplotlib.*

---

## 🔮 Future Enhancements

* **Multi-Modal AI Integration**: Add LLM-guided farming consultations where users can ask questions about their diagnostic report.
* **Offline Mobile App**: Bundle the quantized 4MB TFLite file into a native React Native or Flutter app that farmers can run offline without an internet connection in fields.
* **Weather-Alert Syncing**: Connect the system to local weather APIs to warn farmers of impending high humidity (which triggers Late Blight outbreaks).
