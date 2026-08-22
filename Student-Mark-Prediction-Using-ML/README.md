# 🎓 Student Mark Prediction using Machine Learning

[![Python Version](https://img.shields.io/badge/Python-3.8%2B-blue.svg?style=flat-square&logo=python)](https://www.python.org/)
[![ML Library](https://img.shields.io/badge/Machine%20Learning-Scikit--Learn-orange.svg?style=flat-square&logo=scikit-learn)](https://scikit-learn.org/)
[![Data Processing](https://img.shields.io/badge/Data%20Analysis-Pandas%20%26%20NumPy-darkblue.svg?style=flat-square&logo=pandas)](https://pandas.pydata.org/)
[![Visualization](https://img.shields.io/badge/Visualization-Seaborn%20%26%20Matplotlib-green.svg?style=flat-square)](https://seaborn.pydata.org/)

An elegant, end-to-end Machine Learning project that predicts a student's marks (percentage) based on their daily study hours. Built using a **Simple Linear Regression** model, this project showcases the entire pipeline: from data ingestion and cleaning (handling missing values with mean imputation) to exploratory data analysis (EDA), model training, evaluation, and production serialization using `joblib`.

---

## 🎯 Aim & Objectives

The primary aim of this system is to discover, analyze, and model the linear relationship between the number of hours a student spends studying and their subsequent exam marks. 

By leveraging various scientific computing and visualization libraries in Python, the project achieves:
- **Accurate Predictions**: Generating student performance forecasts with high statistical confidence.
- **Strategic Insights**: Aiding educators and parents in understanding optimal study durations.
- **Reusable ML Pipeline**: Providing a serialized `.pkl` model ready to be integrated into any web application or API service.

---

## 🛠️ Technology Stack & Libraries

This project is built inside a Jupyter Notebook environment using the following key technologies:

*   **Core Logic & Analytics:** `Python 3.x`
*   **Data Manipulation:** `Pandas` (DataFrames, missing values, descriptive stats) & `NumPy` (numerical operations, matrix combinations)
*   **Data Visualization:** `Matplotlib` (scatter plots, line fits) & `Seaborn` (heatmaps, pairplots, bar plots)
*   **Machine Learning:** `Scikit-Learn` (Linear Regression model, Train-Test split division)
*   **Model Serialization:** `Joblib` (efficient saving and loading of model weights)

---

## 📊 Dataset Overview (`student_info.csv`)

The model is trained on a dataset containing real-world representations of student hours and their corresponding scores.

### 📋 Feature Description
*   `study_hours` (Independent Feature / $X$): The number of hours a student spends studying per day.
*   `student_marks` (Dependent Target / $y$): The percentage/score obtained by the student.

### 🔍 Dataset Statistics
*   **Total Samples:** 200 rows.
*   **Missing Values:** The feature `study_hours` contains **5 missing values** (195 non-null rows). The target `student_marks` has **0 missing values** (200 non-null rows).
*   **Summary Statistics:**
    | Metric | Study Hours ($X$) | Student Marks ($y$) |
    | :--- | :--- | :--- |
    | **Count** | 195 | 200 |
    | **Mean** | 6.996 hours | 77.934% |
    | **Standard Deviation** | 1.253 hours | 4.926% |
    | **Min** | 5.010 hours | 68.570% |
    | **25%** | 5.775 hours | 73.385% |
    | **50% (Median)** | 7.120 hours | 77.710% |
    | **75%** | 8.085 hours | 82.320% |
    | **Max** | 8.990 hours | 86.990% |

---

## ⚙️ Data Preprocessing & Cleaning

Real-world data is rarely perfect. This pipeline employs robust preprocessing methods:

1.  **Handling Missing Data:** Since `study_hours` had 5 missing entries, we applied **Mean Imputation** to preserve the dataset's size and distribution without introducing bias:
    ```python
    df2 = df.fillna(df.mean())
    ```
2.  **Feature and Target Splitting:** Substitutes the independent variables into $X$ and targets into $y$:
    ```python
    X = df2.drop("student_marks", axis="columns")
    y = df2.drop("study_hours", axis="columns")
    ```

---

## 📈 Exploratory Data Analysis (EDA)

Before modeling, the data was thoroughly visualized to confirm mathematical assumptions:

*   **Correlation Heatmap:** Demonstrates an exceptionally strong positive correlation of **~0.98** between study hours and academic marks.
*   **Scatter Plot:** Shows a clear, linear trend with minimal variance, confirming that a Linear Regression model is the most optimal and generalized solution.
*   **Pair Plot & Regression Plot:** Highlights the regression line alongside the probability density distributions of both features.

---

## 🤖 Model Formulation & Training

A **Simple Linear Regression** algorithm is used to fit a straight line that minimizes the sum of squared residuals between predicted and actual values.

### 📐 Train-Test Division
The data is split randomly into **80% training** and **20% testing** sets to prevent overfitting and guarantee proper evaluation:
```python
from sklearn.model_selection import train_test_split
X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=51)
```

### 🖋️ Mathematical Equation
The linear regression line is represented as:

$$\hat{y} = m \cdot X + c$$

Where:
*   $\hat{y}$ = Predicted Student Marks Percentage
*   $X$ = Study Hours
*   $m$ = Coefficient / Slope (**`3.93571802`**)
*   $c$ = Intercept (**`50.44735504`**)

### 💡 Prediction Example
If a student studies for **$5$ hours a day**, the prediction is computed as:

$$\hat{y} = (3.93571802 \times 5) + 50.44735504 \approx 70.126\%$$

---

## 🏆 Model Evaluation & Performance

The model's generalization capabilities were validated on unseen test data:

*   **R² (Coefficient of Determination) Score:** **`0.9514` (95.14%)**
    This indicates that **95.14%** of the variance in student marks can be predicted solely by their daily study hours.
*   **Visual Regression Line:** The trained regression line perfectly encapsulates the trend of both the training and testing scatter plots.

---

## 💾 Model Serialization & Reuse

To make this model production-ready, it was serialized into a compact binary file using `joblib`.

### 📂 Model Artifacts
*   `Student_mark_prediction_model.pkl`: The serialized model file holding the trained slope ($m$) and intercept ($c$).

### 🚀 Loading & Making Predictions
To make predictions in a production script or web API (e.g., Flask or FastAPI):

```python
import joblib

# 1. Load the pre-trained model
model = joblib.load("Student_mark_prediction_model.pkl")

# 2. Define the new input data (e.g., studying 4 hours/day)
study_hours = [[4]]

# 3. Predict the student's score
predicted_score = model.predict(study_hours)[0][0]

print(f"Studying {study_hours[0][0]} hours/day is predicted to yield a score of: {predicted_score:.2f}%")
# Output: Studying 4 hours/day is predicted to yield a score of: 66.19%
```

---

## 💻 Installation & Usage Guide

Follow these steps to run the notebook and experiment with the model locally:

### 1️⃣ Clone the Repository
```bash
git clone https://github.com/your-username/Student-Mark-Prediction-Using-Machine-Learning.git
cd Student-Mark-Prediction-Using-Machine-Learning
```

### 2️⃣ Install Required Packages
Install all dependencies using `pip`:
```bash
pip install numpy pandas matplotlib seaborn scikit-learn joblib jupyter
```

### 3️⃣ Run the Notebook
Launch Jupyter Notebook to view and run the source code:
```bash
jupyter notebook
```
Open `Student_Marks_Prediction.ipynb` and execute the cells sequentially to visualize plots, view dataset attributes, train the model, and generate your own model binary!

---

## 👥 Authors & Contributors
*   **Lokiboligorla** - *Initial Work & Model Engineering*
