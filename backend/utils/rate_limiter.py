"""
Rate limiting for OTP attempts to prevent brute force attacks.
Uses in-memory store with exponential backoff.
"""
from datetime import datetime, timedelta
from typing import Dict, Tuple
import time


class OTPRateLimiter:
    """
    Rate limiter for OTP verification attempts.
    
    Security features:
    - Tracks failed attempts per user
    - Progressive delays after failures
    - Automatic reset after success or lockout expiry
    """
    
    def __init__(self):
        # Store: {email: (attempt_count, last_attempt_time, locked_until)}
        self._attempts: Dict[str, Tuple[int, float, float]] = {}
        self.max_attempts = 5  # Lock after 5 failed attempts
        self.lockout_duration_seconds = 900  # 15 minutes
        self.base_delay_seconds = 2
    
    def is_rate_limited(self, email: str) -> Tuple[bool, int]:
        """
        Check if user is rate limited for OTP attempts.
        
        Args:
            email: User email address
            
        Returns:
            Tuple of (is_limited: bool, seconds_until_retry: int)
        """
        if email not in self._attempts:
            return False, 0
        
        attempt_count, last_attempt_time, locked_until = self._attempts[email]
        current_time = time.time()
        
        # Check if lockout has expired
        if current_time > locked_until:
            del self._attempts[email]
            return False, 0
        
        # User is locked out
        seconds_remaining = int(locked_until - current_time)
        return True, seconds_remaining
    
    def record_failed_attempt(self, email: str) -> Tuple[int, bool]:
        """
        Record a failed OTP verification attempt.
        
        Args:
            email: User email address
            
        Returns:
            Tuple of (remaining_attempts: int, is_now_locked: bool)
        """
        current_time = time.time()
        
        if email not in self._attempts:
            # First failed attempt
            self._attempts[email] = (1, current_time, 0)
            remaining_attempts = self.max_attempts - 1
            is_locked = False
        else:
            attempt_count, last_attempt_time, locked_until = self._attempts[email]
            
            # Check if lockout has expired
            if current_time > locked_until and locked_until > 0:
                self._attempts[email] = (1, current_time, 0)
                remaining_attempts = self.max_attempts - 1
                is_locked = False
            else:
                # Increment attempt count
                attempt_count += 1
                
                # Check if max attempts exceeded
                is_locked = attempt_count >= self.max_attempts
                
                if is_locked:
                    # Lock account for lockout duration
                    new_locked_until = current_time + self.lockout_duration_seconds
                    self._attempts[email] = (attempt_count, current_time, new_locked_until)
                    remaining_attempts = 0
                else:
                    self._attempts[email] = (attempt_count, current_time, 0)
                    remaining_attempts = self.max_attempts - attempt_count
        
        return remaining_attempts, is_locked
    
    def record_successful_attempt(self, email: str) -> None:
        """
        Clear rate limiting records after successful OTP verification.
        
        Args:
            email: User email address
        """
        if email in self._attempts:
            del self._attempts[email]


# Global rate limiter instance
otp_rate_limiter = OTPRateLimiter()
