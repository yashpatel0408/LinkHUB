import hashlib

from user_agents import parse as parse_ua


def detect_device_type(user_agent_string: str) -> str:
    ua = parse_ua(user_agent_string or "")
    if ua.is_mobile:
        return "Mobile"
    if ua.is_tablet:
        return "Tablet"
    return "Desktop"


def hash_ip(ip_address: str) -> str:
    """Raw IP kabhi store nahi karte — sirf ek one-way hash, privacy ke liye."""
    return hashlib.sha256((ip_address or "unknown").encode()).hexdigest()