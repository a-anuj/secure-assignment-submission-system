"""
FastAPI main application.
Secure Student Assignment Submission System with encryption and digital signatures.
"""
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from config import settings
from routes import auth_router, student_router, faculty_router, admin_router

# Create FastAPI app
app = FastAPI(
    title="Secure Student Assignment Submission System",
    description="Production-ready system with authentication, encryption, and digital signatures",
    version="1.0.0",
    docs_url="/api/docs",
    redoc_url="/api/redoc"
)

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins_list,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Register routers
app.include_router(auth_router, prefix="/api")
app.include_router(student_router, prefix="/api")
app.include_router(faculty_router, prefix="/api")
app.include_router(admin_router, prefix="/api")


@app.get("/")
def root():
    """Root endpoint."""
    return {
        "message": "Secure Student Assignment Submission System API",
        "version": "1.0.0",
        "docs": "/api/docs"
    }


@app.get("/api/health")
def health_check():
    """Health check endpoint."""
    return {"status": "healthy"}


if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=settings.DEBUG)
