from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.config import settings
from app.database import engine, Base
from app.routes import auth, predictions, chatbot, admin, analytics

# Create SQL database tables if they do not exist
try:
    print("Initializing SQL database tables...")
    Base.metadata.create_all(bind=engine)
    print("Database tables initialized successfully.")
except Exception as e:
    print(f"Error creating database tables: {str(e)}")

app = FastAPI(
    title=settings.APP_NAME,
    description="Full-stack AI/ML diagnostic engine explaining and predicting student mental stress levels.",
    version="1.0.0",
    debug=settings.DEBUG
)

# Configure CORS Middleware
# Allows seamless communication with React dev server (default port 5173) and other endpoints
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], # In production, restrict to Vercel/Render frontend URLs
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Wire up routers
app.include_router(auth.router)
app.include_router(predictions.router)
app.include_router(chatbot.router)
app.include_router(admin.router)
app.include_router(analytics.router)

@app.get("/")
def read_root():
    return {
        "status": "online",
        "service": settings.APP_NAME,
        "api_docs": "/docs"
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("app.main:app", host="0.0.0.0", port=8000, reload=True)
