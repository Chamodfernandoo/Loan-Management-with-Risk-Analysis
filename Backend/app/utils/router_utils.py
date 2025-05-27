from fastapi import APIRouter

def create_dual_route(router: APIRouter, path: str, **kwargs):
    """Create two identical routes - one with trailing slash and one without
    
    This is a utility function to handle both URL formats consistently
    without relying on redirects that cause CORS issues.
    """
    # Store the original route_class and route_function
    original_route_class = router.route_class
    original_route_function = router.api_route
    
    # Define a function that registers both routes
    def register_dual_routes(*args, **kw):
        # Register route without trailing slash
        if path and path.endswith('/'):
            original_route_function(path[:-1], *args, **kw)
        # Register route with trailing slash
        elif path and not path.endswith('/'):
            original_route_function(f"{path}/", *args, **kw)
        
        # Always register the original path too
        return original_route_function(path, *args, **kw)
    
    # Replace the router's api_route method temporarily
    router.api_route = register_dual_routes
    
    # Call the decorated function to register both routes
    result = kwargs.pop("endpoint")(**kwargs)
    
    # Restore the original api_route method
    router.api_route = original_route_function
    
    return result