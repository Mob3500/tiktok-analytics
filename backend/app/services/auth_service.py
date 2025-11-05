from sqlalchemy.orm import Session
from ..models import User
from ..schemas import UserCreate
from ..utils.security import get_password_hash, verify_password
from typing import Optional


class AuthService:
    """Service for authentication operations"""
    
    @staticmethod
    def create_user(db: Session, user_data: UserCreate) -> User:
        """
        Create a new user.
        
        Args:
            db: Database session
            user_data: User registration data
            
        Returns:
            User: Created user object
        """
        hashed_password = get_password_hash(user_data.password)
        db_user = User(
            email=user_data.email,
            password_hash=hashed_password
        )
        db.add(db_user)
        db.commit()
        db.refresh(db_user)
        return db_user
    
    @staticmethod
    def authenticate_user(db: Session, email: str, password: str) -> Optional[User]:
        """
        Authenticate a user by email and password.
        
        Args:
            db: Database session
            email: User email
            password: Plain text password
            
        Returns:
            User: Authenticated user if credentials valid, None otherwise
        """
        user = db.query(User).filter(User.email == email).first()
        if not user:
            return None
        if not verify_password(password, user.password_hash):
            return None
        return user
    
    @staticmethod
    def get_user_by_email(db: Session, email: str) -> Optional[User]:
        """
        Get a user by email.
        
        Args:
            db: Database session
            email: User email
            
        Returns:
            User: User object if found, None otherwise
        """
        return db.query(User).filter(User.email == email).first()
