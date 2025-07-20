# REST API Pattern

## When to Use
Use this pattern when creating REST APIs with:
- Standard CRUD operations
- JSON request/response format
- Authentication required
- Error handling
- Input validation

## Pattern

```python
from fastapi import APIRouter, HTTPException, Depends, status
from pydantic import BaseModel, validator
from typing import List, Optional
from datetime import datetime

# Router setup
router = APIRouter(prefix="/api/v1/users", tags=["users"])

# Pydantic models for validation
class UserCreate(BaseModel):
    email: str
    name: str
    password: str
    
    @validator('email')
    def validate_email(cls, v):
        if '@' not in v:
            raise ValueError('Invalid email format')
        return v.lower()

class UserResponse(BaseModel):
    id: int
    email: str
    name: str
    created_at: datetime
    
    class Config:
        from_attributes = True

# Dependency for authentication
async def get_current_user(token: str = Depends(oauth2_scheme)):
    # Validation logic here
    if not token:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Not authenticated"
        )
    return decode_token(token)

# CRUD endpoints
@router.post("/", response_model=UserResponse, status_code=status.HTTP_201_CREATED)
async def create_user(
    user_data: UserCreate,
    db: Session = Depends(get_db)
):
    """Create a new user.
    
    Args:
        user_data: User creation data
        db: Database session
        
    Returns:
        Created user object
        
    Raises:
        HTTPException: If email already exists
    """
    # Check if user exists
    existing = db.query(User).filter(User.email == user_data.email).first()
    if existing:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Email already registered"
        )
    
    # Create user
    user = User(**user_data.dict())
    db.add(user)
    db.commit()
    db.refresh(user)
    
    return user

@router.get("/{user_id}", response_model=UserResponse)
async def get_user(
    user_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get user by ID."""
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )
    return user

@router.get("/", response_model=List[UserResponse])
async def list_users(
    skip: int = 0,
    limit: int = 100,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """List users with pagination."""
    users = db.query(User).offset(skip).limit(limit).all()
    return users
```

## Anti-pattern

```python
# DON'T: Mix business logic with API endpoints
@app.post("/users")
def create_user(data: dict):
    # DON'T: Use dict instead of Pydantic models
    # DON'T: Put all logic in endpoint
    if not data.get("email"):
        return {"error": "Email required"}, 400  # DON'T: Inconsistent error handling
    
    # DON'T: Direct SQL in endpoints
    cursor.execute("INSERT INTO users VALUES (?)", data["email"])
    
    # DON'T: No validation, no error handling
    return {"message": "ok"}
```

## Key Points

1. **Use Pydantic Models**: For automatic validation and documentation
2. **Consistent Error Handling**: Always use HTTPException with proper status codes
3. **Dependency Injection**: Use FastAPI's Depends for auth, db sessions
4. **Type Hints**: Always include type hints for better IDE support
5. **Status Codes**: Use appropriate HTTP status codes
6. **Pagination**: Always paginate list endpoints
7. **Documentation**: Docstrings are automatically included in OpenAPI

## Error Response Format

```json
{
    "detail": "Descriptive error message",
    "status_code": 404,
    "type": "not_found"
}
```

## Testing Pattern

```python
def test_create_user(client: TestClient):
    response = client.post(
        "/api/v1/users/",
        json={"email": "test@example.com", "name": "Test", "password": "secure"}
    )
    assert response.status_code == 201
    assert response.json()["email"] == "test@example.com"
```

## References
- [FastAPI Documentation](https://fastapi.tiangolo.com/)
- [REST API Best Practices](https://restfulapi.net/)
- Related: `examples/testing/integration.md`