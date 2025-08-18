from django.shortcuts import render
from rest_framework.views import APIView
from api.serializers import UserSerializer
from rest_framework.response import Response
import rest_framework.status as status
from rest_framework.permissions import IsAuthenticated , AllowAny
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from django.views.decorators.http import require_http_methods
import json
import sys
import os

# Add the current directory to Python path to import our modules
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from .aggregate import fetch_all_cves, get_cve_statistics, save_aggregated_cves
from .functions import generate_cve_description_and_mermaid, generate_waf_rule

# Create your views here.
class CreateUser(APIView):
    permission_classes=[AllowAny]
    serializer_class = UserSerializer
    def post(self,request):
        data = request.data
        serializer = self.serializer_class(data=data)
        if serializer.is_valid():
            serializer.save()
            return Response({"message":"User created"},status=status.HTTP_201_CREATED)
        else :
            return Response({"message":f"User Not Created {serializer.error_messages()}"},status=status.HTTP_400_BAD_REQUEST)

@csrf_exempt
@require_http_methods(["GET"])
def get_aggregated_cves(request):
    """
    API endpoint to fetch aggregated CVEs from all sources.
    
    Query parameters:
    - limit: Number of CVEs per category (default: 50)
    - api_key: Optional NVD API key for higher rate limits
    - save: Whether to save to file (default: false)
    """
    try:
        # Get query parameters
        limit = int(request.GET.get('limit', 50))
        api_key = request.GET.get('api_key', None)
        save_to_file = request.GET.get('save', 'false').lower() == 'true'
        
        # Fetch CVEs
        cves = fetch_all_cves(limit_per_category=limit, api_key=api_key)
        
        # Get statistics
        stats = get_cve_statistics(cves)
        
        # Save to file if requested
        if save_to_file:
            save_aggregated_cves(cves, "aggregated_cves.json")
        
        # Prepare response
        response_data = {
            "success": True,
            "total_cves": len(cves),
            "statistics": stats,
            "cves": cves
        }

        print(cves[:10])
        
        return JsonResponse(response_data, safe=False)
        
    except Exception as e:
        return JsonResponse({
            "success": False,
            "error": str(e)
        }, status=500)

@csrf_exempt
@require_http_methods(["GET"])
def get_cve_statistics_only(request):
    """
    API endpoint to get only CVE statistics without the full CVE data.
    """
    try:
        # Get query parameters
        limit = int(request.GET.get('limit', 50))
        api_key = request.GET.get('api_key', None)
        
        # Fetch CVEs
        cves = fetch_all_cves(limit_per_category=limit, api_key=api_key)
        
        # Get statistics
        stats = get_cve_statistics(cves)
        
        # Prepare response
        response_data = {
            "success": True,
            "total_cves": len(cves),
            "statistics": stats
        }
        
        return JsonResponse(response_data, safe=False)
        
    except Exception as e:
        return JsonResponse({
            "success": False,
            "error": str(e)
        }, status=500)

@csrf_exempt
@require_http_methods(["GET"])
def get_cves_by_threat_feed(request):
    """
    API endpoint to get CVEs filtered by threat feed.
    
    Query parameters:
    - threat_feed: Specific threat feed to filter by
    - limit: Number of CVEs per category (default: 50)
    - api_key: Optional NVD API key
    """
    try:
        threat_feed = request.GET.get('threat_feed', None)
        limit = int(request.GET.get('limit', 50))
        api_key = request.GET.get('api_key', None)
        
        if not threat_feed:
            return JsonResponse({
                "success": False,
                "error": "threat_feed parameter is required"
            }, status=400)
        
        # Fetch all CVEs
        cves = fetch_all_cves(limit_per_category=limit, api_key=api_key)
        
        # Filter by threat feed
        filtered_cves = [cve for cve in cves if cve.get('threat_feed') == threat_feed]
        
        # Get statistics for filtered CVEs
        stats = get_cve_statistics(filtered_cves)
        
        response_data = {
            "success": True,
            "threat_feed": threat_feed,
            "total_cves": len(filtered_cves),
            "statistics": stats,
            "cves": filtered_cves
        }
        
        return JsonResponse(response_data, safe=False)
        
    except Exception as e:
        return JsonResponse({
            "success": False,
            "error": str(e)
        }, status=500)

@csrf_exempt
@require_http_methods(["POST"])
def cve_explanation(request):
    """
    API endpoint to generate CVE explanation and Mermaid diagram.
    """
    try:
        data = json.loads(request.body)
        cve_id = data.get('cve_id')
        description = data.get('description')
        severity = data.get('severity')
        
        if not all([cve_id, description, severity]):
            return JsonResponse({
                "success": False,
                "error": "cve_id, description, and severity are required"
            }, status=400)
        
        # Generate explanation and mermaid diagram using the function from functions.py
        result = generate_cve_description_and_mermaid(cve_id, description, severity)
        
        return JsonResponse({
            "success": True,
            "explanation": result.get("explanation"),
            "mermaid": result.get("mermaid")
        })
    except Exception as e:
        print(e)
        return JsonResponse({
            "success": False,
            "error": str(e)
        }, status=500)

@csrf_exempt
@require_http_methods(["POST"])
def waf_rule(request):
    """
    API endpoint to generate WAF rule.
    """
    try:
        data = json.loads(request.body)
        cve_id = data.get('cve_id')
        description = data.get('description')
        severity = data.get('severity')
        mode = data.get('mode')
        waf = data.get('waf')
        
        if not all([cve_id, description, severity, mode, waf]):
            return JsonResponse({
                "success": False,
                "error": "cve_id, description, severity, mode, and waf are required"
            }, status=400)
        
        # Generate WAF rule using the function from functions.py
        result = generate_waf_rule(cve_id, description, severity, mode, waf)
        
        return JsonResponse({
            "success": True,
            "waf_rule": result.get("waf_rule")
        })
    except Exception as e:
        return JsonResponse({
            "success": False,
            "error": str(e)
        }, status=500)
