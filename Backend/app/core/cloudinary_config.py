import cloudinary
import cloudinary.uploader
from ..core.config import settings

def initialize_cloudinary():
    """Initialize Cloudinary with credentials from environment variables"""
    cloudinary.config(
        cloud_name=settings.CLOUDINARY_CLOUD_NAME,
        api_key=settings.CLOUDINARY_API_KEY,
        api_secret=settings.CLOUDINARY_API_SECRET,
        secure=True
    )