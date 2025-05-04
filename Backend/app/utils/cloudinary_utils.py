import cloudinary
import cloudinary.uploader
from typing import List, Optional, Dict, Any
import uuid

def upload_image(file_data: bytes, folder: str = "advertisements") -> Dict[str, Any]:
    """
    Upload an image to Cloudinary
    
    Args:
        file_data: The image binary data
        folder: The folder in Cloudinary to store the image
        
    Returns:
        Dict containing image URL and other info
    """
    public_id = f"{folder}/{uuid.uuid4()}"
    
    result = cloudinary.uploader.upload(
        file_data,
        public_id=public_id,
        folder=folder,
        resource_type="auto"
    )
    
    return {
        "url": result["secure_url"],
        "public_id": result["public_id"],
        "width": result["width"],
        "height": result["height"],
        "format": result["format"]
    }

def delete_image(public_id: str) -> Dict[str, Any]:
    """
    Delete an image from Cloudinary
    
    Args:
        public_id: The public ID of the image to delete
        
    Returns:
        Dict containing the result of the deletion
    """
    result = cloudinary.uploader.destroy(public_id)
    return result