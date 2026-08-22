import os
import shutil
import matplotlib.pyplot as plt
import numpy as np
from sklearn.metrics import confusion_matrix

def create_folders():
    """
    Automatically creates the project directory structure if folders do not exist.
    """
    folders = [
        "model",
        "dataset",
        "utils",
        "assets/sample_images",
        "notebooks"
    ]
    for folder in folders:
        os.makedirs(folder, exist_ok=True)
        print(f"Created/verified folder: {folder}")

def setup_kaggle_credentials():
    """
    Detects and configures Kaggle API credentials.
    Checks ~/.kaggle/kaggle.json, ~/.kaggle/access_token, and the project root directory.
    Configures environment variables as a backup strategy.
    
    Returns:
        bool: True if credentials are ready, False otherwise.
    """
    home_dir = os.path.expanduser("~")
    kaggle_dir = os.path.join(home_dir, ".kaggle")
    kaggle_json_home = os.path.join(kaggle_dir, "kaggle.json")
    kaggle_token_home = os.path.join(kaggle_dir, "access_token")
    
    project_root = os.getcwd()
    kaggle_json_project = os.path.join(project_root, "kaggle.json")
    kaggle_token_project = os.path.join(project_root, "access_token")
    
    # 1. Check home directory for either format
    if os.path.exists(kaggle_json_home):
        print(f"Found Kaggle API credentials (json) at home location: {kaggle_json_home}")
        return True
    if os.path.exists(kaggle_token_home):
        print(f"Found Kaggle API access token at home location: {kaggle_token_home}")
        return True
        
    # 2. Check project root directory for json file
    if os.path.exists(kaggle_json_project):
        print("Found kaggle.json in project root directory. Setting up standard home directory...")
        try:
            os.makedirs(kaggle_dir, exist_ok=True)
            shutil.copy(kaggle_json_project, kaggle_json_home)
            if os.name != 'nt':  # Set user-only read/write on Unix/Linux
                os.chmod(kaggle_json_home, 0o600)
            print(f"Copied credentials to: {kaggle_json_home}")
            return True
        except Exception as e:
            print(f"Warning: Could not copy kaggle.json to {kaggle_dir} due to: {e}")
            print("Configuring KAGGLE_CONFIG_DIR environment variable to project root instead...")
            os.environ['KAGGLE_CONFIG_DIR'] = project_root
            return True

    # 3. Check project root directory for access token
    if os.path.exists(kaggle_token_project):
        print("Found access_token in project root directory. Setting up standard home directory...")
        try:
            os.makedirs(kaggle_dir, exist_ok=True)
            shutil.copy(kaggle_token_project, kaggle_token_home)
            if os.name != 'nt':
                os.chmod(kaggle_token_home, 0o600)
            print(f"Copied access token to: {kaggle_token_home}")
            return True
        except Exception as e:
            print(f"Warning: Could not copy access token to {kaggle_dir} due to: {e}")
            return True
            
    # 4. Not found anywhere
    print("\n" + "="*80)
    print("CREDENTIALS WARNING: Kaggle API credentials (access_token or kaggle.json) not found!")
    print("To download the dataset automatically:")
    print("1. Go to https://www.kaggle.com (Log in -> Account Settings -> Create New API Token).")
    print("2. Copy the displayed Token string.")
    print("3. Place it in a file named 'access_token' in this project folder.")
    print("4. Run the train.py script again.")
    print("="*80 + "\n")
    return False

def download_dataset():
    """
    Authenticates with Kaggle and downloads/unzips the plant disease dataset.
    """
    if not setup_kaggle_credentials():
        raise FileNotFoundError("kaggle.json API token is missing. Please set it up and retry.")
        
    print("Authenticating with Kaggle API...")
    try:
        # Set environment variable before importing kaggle
        import kaggle
        kaggle.api.authenticate()
    except Exception as e:
        print("\n" + "!"*80)
        print("Kaggle Authentication Error!")
        print("Please verify that your kaggle.json file has valid credentials and has not expired.")
        print(f"Error details: {e}")
        print("!"*80 + "\n")
        raise e
        
    dataset_dir = "dataset"
    print(f"Downloading PlantVillage dataset (emmarex/plantdisease) to '{dataset_dir}'...")
    try:
        # Check if the folder contains actual crop directories already
        has_subfolders = False
        if os.path.exists(dataset_dir):
            subfolders = [d for d in os.listdir(dataset_dir) if os.path.isdir(os.path.join(dataset_dir, d))]
            if len(subfolders) > 0:
                has_subfolders = True
                
        if has_subfolders:
            print("Dataset folder is already populated with folders. Skipping download.")
            return
            
        kaggle.api.dataset_download_files(
            'emmarex/plantdisease',
            path=dataset_dir,
            unzip=True
        )
        print("Dataset downloaded and extracted successfully!")
    except Exception as e:
        print(f"An error occurred while downloading/extracting the dataset: {e}")
        raise e

def find_dataset_images_root(base_dir="dataset"):
    """
    Recursively scans the base directory to locate the actual folder containing 
    the crop leaf folders (like 'Potato___Early_blight').
    This ensures we support any custom extraction structures.
    
    Returns:
        str: Absolute or relative path to the directory containing class subfolders.
    """
    for root, dirs, files in os.walk(base_dir):
        # Scan folder names to find typical plant names in the folder structure
        indicators = ['tomato', 'potato', 'pepper', 'healthy', 'blight', 'spot']
        matching_dirs = [d for d in dirs if any(ind in d.lower() for ind in indicators)]
        if len(matching_dirs) >= 3:
            print(f"Found active image dataset root at: {root}")
            return root
    return base_dir

def plot_training_history(history, save_path="model/training_history.png"):
    """
    Saves a figure containing the training/validation loss and accuracy charts.
    """
    acc = history.history.get('accuracy', [])
    val_acc = history.history.get('val_accuracy', [])
    loss = history.history.get('loss', [])
    val_loss = history.history.get('val_loss', [])
    epochs = range(1, len(acc) + 1)
    
    plt.figure(figsize=(14, 5))
    
    # 1. Accuracy Graph
    plt.subplot(1, 2, 1)
    plt.plot(epochs, acc, 'bo-', linewidth=2, label='Training Accuracy')
    if val_acc:
        plt.plot(epochs, val_acc, 'ro-', linewidth=2, label='Validation Accuracy')
    plt.title('Model Classification Accuracy')
    plt.xlabel('Epochs')
    plt.ylabel('Accuracy')
    plt.legend(loc='lower right')
    plt.grid(True, linestyle='--', alpha=0.6)
    
    # 2. Loss Graph
    plt.subplot(1, 2, 2)
    plt.plot(epochs, loss, 'bo-', linewidth=2, label='Training Loss')
    if val_loss:
        plt.plot(epochs, val_loss, 'ro-', linewidth=2, label='Validation Loss')
    plt.title('Model Categorical Crossentropy Loss')
    plt.xlabel('Epochs')
    plt.ylabel('Loss')
    plt.legend(loc='upper right')
    plt.grid(True, linestyle='--', alpha=0.6)
    
    plt.tight_layout()
    os.makedirs(os.path.dirname(save_path), exist_ok=True)
    plt.savefig(save_path, dpi=150)
    plt.close()
    print(f"Training statistics plots saved to: {save_path}")

def plot_confusion_matrix_heatmap(y_true, y_pred, class_names, save_path="model/confusion_matrix.png"):
    """
    Generates and saves a neat, readable confusion matrix heatmap.
    Uses Seaborn if available, with a strong native Matplotlib fallback.
    """
    cm = confusion_matrix(y_true, y_pred)
    
    plt.figure(figsize=(14, 12))
    
    try:
        import seaborn as sns
        sns.heatmap(cm, annot=True, fmt='d', cmap='Blues',
                    xticklabels=class_names, yticklabels=class_names,
                    cbar_kws={'label': 'Count'})
    except ImportError:
        # Matplotlib native heatmap fallback in case Seaborn is missing
        plt.imshow(cm, interpolation='nearest', cmap=plt.cm.Blues)
        plt.title('Confusion Matrix')
        plt.colorbar(label='Count')
        tick_marks = np.arange(len(class_names))
        plt.xticks(tick_marks, class_names, rotation=90)
        plt.yticks(tick_marks, class_names)
        
        # Annotate numbers in the cells
        thresh = cm.max() / 2.
        for i in range(cm.shape[0]):
            for j in range(cm.shape[1]):
                plt.text(j, i, format(cm[i, j], 'd'),
                         horizontalalignment="center",
                         color="white" if cm[i, j] > thresh else "black")
                         
    plt.title('Confusion Matrix Heatmap')
    plt.ylabel('True Crop Class')
    plt.xlabel('Predicted Crop Class')
    plt.tight_layout()
    
    os.makedirs(os.path.dirname(save_path), exist_ok=True)
    plt.savefig(save_path, dpi=150)
    plt.close()
    print(f"Confusion matrix heatmap saved to: {save_path}")
