import requests
import json
import base64
from typing import Dict, Optional
from app.basemodels import CarrierCode

def generate_bearer_token(carrier_code: CarrierCode, client_id: str, client_secret: str, account_num: str = None) -> Dict[str, any]:
    """
    Generate bearer token for specified carrier.
    
    Args:
        carrier_code: The carrier code (FEDEX, UPS, USPS)
        client_id: Client ID for the carrier API
        client_secret: Client secret for the carrier API
        account_num: Account number (required for some carriers)
    
    Returns:
        Dict containing token information and metadata
    """
    
    if carrier_code == CarrierCode.FEDEX:
        return generate_fedex_token(client_id, client_secret)
    elif carrier_code == CarrierCode.UPS:
        return generate_ups_token(client_id, client_secret)
    elif carrier_code == CarrierCode.USPS:
        return generate_usps_token(client_id, client_secret)
    else:
        raise ValueError(f"Unsupported carrier: {carrier_code}")

def generate_fedex_token(client_id: str, client_secret: str) -> Dict[str, any]:
    """
    Generate FedEx OAuth2 bearer token.
    
    FedEx uses OAuth2 with client credentials grant type.
    """
    url = "https://apis-sandbox.fedex.com/oauth/token"  # Sandbox URL
    
    headers = {
        "Content-Type": "application/x-www-form-urlencoded"
    }
    
    data = {
        "grant_type": "client_credentials",
        "client_id": client_id,
        "client_secret": client_secret
    }
    
    try:
        response = requests.post(url, headers=headers, data=data, timeout=30)
        response.raise_for_status()
        
        token_data = response.json()
        
        return {
            "carrier": "FEDEX",
            "success": True,
            "access_token": token_data.get("access_token"),
            "token_type": token_data.get("token_type", "Bearer"),
            "expires_in": token_data.get("expires_in"),
            "scope": token_data.get("scope"),
            "raw_response": token_data
        }
        
    except requests.exceptions.RequestException as e:
        return {
            "carrier": "FEDEX",
            "success": False,
            "error": str(e),
            "error_type": "request_error"
        }
    except json.JSONDecodeError as e:
        return {
            "carrier": "FEDEX", 
            "success": False,
            "error": f"Invalid JSON response: {str(e)}",
            "error_type": "json_error"
        }

def generate_ups_token(client_id: str, client_secret: str) -> Dict[str, any]:
    """
    Generate UPS OAuth2 bearer token.
    
    UPS uses OAuth2 with Basic Authentication header.
    """
    url = "https://wwwcie.ups.com/security/v1/oauth/authorize"  # Testing URL
    
    # Create Basic Auth header
    credentials = f"{client_id}:{client_secret}"
    encoded_credentials = base64.b64encode(credentials.encode()).decode()
    
    headers = {
        "Content-Type": "application/x-www-form-urlencoded",
        "Authorization": f"Basic {encoded_credentials}"
    }
    
    data = {
        "grant_type": "client_credentials"
    }
    
    try:
        response = requests.post(url, headers=headers, data=data, timeout=30)
        response.raise_for_status()
        
        token_data = response.json()
        
        return {
            "carrier": "UPS",
            "success": True,
            "access_token": token_data.get("access_token"),
            "token_type": token_data.get("token_type", "Bearer"),
            "expires_in": token_data.get("expires_in"),
            "scope": token_data.get("scope"),
            "raw_response": token_data
        }
        
    except requests.exceptions.RequestException as e:
        return {
            "carrier": "UPS",
            "success": False,
            "error": str(e),
            "error_type": "request_error"
        }
    except json.JSONDecodeError as e:
        return {
            "carrier": "UPS",
            "success": False,
            "error": f"Invalid JSON response: {str(e)}",
            "error_type": "json_error"
        }

def generate_usps_token(client_id: str, client_secret: str) -> Dict[str, any]:
    """
    Generate USPS OAuth2 bearer token.
    
    USPS uses OAuth2 with client credentials grant type.
    """
    url = "https://apis-tem.usps.com/oauth2/v3/token"  # Testing URL
    
    headers = {
        "Content-Type": "application/json"
    }
    
    data = {
        "grant_type": "client_credentials",
        "client_id": client_id,
        "client_secret": client_secret
    }
    
    try:
        response = requests.post(url, headers=headers, json=data, timeout=30)
        response.raise_for_status()
        
        token_data = response.json()
        
        return {
            "carrier": "USPS",
            "success": True,
            "access_token": token_data.get("access_token"),
            "token_type": token_data.get("token_type", "Bearer"), 
            "expires_in": token_data.get("expires_in"),
            "scope": token_data.get("scope"),
            "raw_response": token_data
        }
        
    except requests.exceptions.RequestException as e:
        return {
            "carrier": "USPS",
            "success": False,
            "error": str(e),
            "error_type": "request_error"
        }
    except json.JSONDecodeError as e:
        return {
            "carrier": "USPS",
            "success": False,
            "error": f"Invalid JSON response: {str(e)}",
            "error_type": "json_error"
        }

def generate_tokens_for_carriers(carriers_data) -> Dict[str, any]:
    """
    Generate bearer tokens for multiple carriers.
    
    Args:
        carriers_data: carriersSubmission object with carrier configurations
    
    Returns:
        Dict with token results for each carrier
    """
    results = {
        "tokens": [],
        "successful": 0,
        "failed": 0,
        "summary": {}
    }
    
    for carrier in carriers_data.carriers:
        token_result = generate_bearer_token(
            carrier.code,
            carrier.client_id, 
            carrier.client_secret,
            carrier.account_num
        )
        
        results["tokens"].append(token_result)
        
        if token_result["success"]:
            results["successful"] += 1
        else:
            results["failed"] += 1
            
        results["summary"][carrier.code.value] = {
            "success": token_result["success"],
            "has_token": bool(token_result.get("access_token"))
        }
    
    return results