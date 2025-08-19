from django.shortcuts import render
from rest_framework.views import APIView
from rest_framework.viewsets import ModelViewSet
from api.serializers import UserSerializer, CVESerializer
from rest_framework.response import Response
import rest_framework.status as status
from rest_framework.permissions import IsAuthenticated, AllowAny
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from django.views.decorators.http import require_http_methods
from django.contrib.auth.models import User
from django.contrib.auth import authenticate
from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework_simplejwt.authentication import JWTAuthentication
from rest_framework.decorators import api_view, permission_classes, authentication_classes
from .models import CVE
import json
import sys
import os
from datetime import datetime

# Add the current directory to Python path to import our modules
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from .aggregate import fetch_all_cves, get_cve_statistics, save_aggregated_cves
from .functions import generate_cve_description_and_mermaid, generate_waf_rule

# Authentication Views
class LoginView(APIView):
    permission_classes = [AllowAny]
    
    def post(self, request):
        try:
            data = request.data
            username = data.get('username')
            password = data.get('password')
            
            if not username or not password:
                return Response({
                    'error': 'Username and password are required'
                }, status=status.HTTP_400_BAD_REQUEST)
            
            user = authenticate(username=username, password=password)
            
            if user is None:
                return Response({
                    'error': 'Invalid credentials'
                }, status=status.HTTP_401_UNAUTHORIZED)
            
            refresh = RefreshToken.for_user(user)
            
            return Response({
                'access_token': str(refresh.access_token),
                'refresh_token': str(refresh),
                'user': {
                    'id': user.id,
                    'username': user.username,
                    'email': user.email
                }
            }, status=status.HTTP_200_OK)
            
        except Exception as e:
            return Response({
                'error': str(e)
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

class RegisterView(APIView):
    permission_classes = [AllowAny]
    serializer_class = UserSerializer
    
    def post(self, request):
        data = request.data
        serializer = self.serializer_class(data=data)
        if serializer.is_valid():
            user = serializer.save()
            
            # Check if this is the first user registration (optional: you can modify this logic)
            # For now, we'll store CVE data for all new users
            try:
                # Fetch CVE data and store it for the new user
                self._store_cve_data_for_user(user)
                
                # Generate tokens for the new user
                refresh = RefreshToken.for_user(user)
                
                return Response({
                    "message": "User created and CVE data initialized",
                    "user_id": user.id,
                    "access_token": str(refresh.access_token),
                    "refresh_token": str(refresh),
                    "user": {
                        'id': user.id,
                        'username': user.username,
                        'email': user.email
                    }
                }, status=status.HTTP_201_CREATED)
            except Exception as e:
                # If CVE data storage fails, still create the user but log the error
                print(f"Error storing CVE data for user {user.id}: {str(e)}")
                
                # Generate tokens for the new user
                refresh = RefreshToken.for_user(user)
                
                return Response({
                    "message": "User created but CVE data initialization failed",
                    "user_id": user.id,
                    "warning": "CVE data will be loaded on first access",
                    "access_token": str(refresh.access_token),
                    "refresh_token": str(refresh),
                    "user": {
                        'id': user.id,
                        'username': user.username,
                        'email': user.email
                    }
                }, status=status.HTTP_201_CREATED)
        else:
            return Response({
                "message": f"User Not Created {serializer.errors}"
            }, status=status.HTTP_400_BAD_REQUEST)
    
    def _store_cve_data_for_user(self, user):
        """Store CVE data for a newly registered user"""
        try:
            # Fetch CVE data from all sources
            cves = fetch_all_cves(limit_per_category=500)
            
            # Store each CVE in the database
            for cve_data in cves:
                # Convert date strings to date objects - handle both date-only and datetime formats
                try:
                    published_date = datetime.strptime(cve_data['published_date'], '%Y-%m-%d').date()
                except ValueError:
                    # Try parsing with time component
                    published_date = datetime.strptime(cve_data['published_date'].split('T')[0], '%Y-%m-%d').date()
                
                try:
                    last_modified_date = datetime.strptime(cve_data['last_modified_date'], '%Y-%m-%d').date()
                except ValueError:
                    # Try parsing with time component
                    last_modified_date = datetime.strptime(cve_data['last_modified_date'].split('T')[0], '%Y-%m-%d').date()
                
                # Create or update CVE record for the user
                cve, created = CVE.objects.get_or_create(
                    user=user,
                    cve_id=cve_data['id'],
                    defaults={
                        'description': cve_data['description'],
                        'dependency_name': cve_data['dependency_name'],
                        'cvss_v3_score': cve_data.get('cvss_v3_score'),
                        'cvss_v3_vector': cve_data.get('cvss_v3_vector'),
                        'cvss_v2_score': cve_data.get('cvss_v2_score'),
                        'cvss_v2_vector': cve_data.get('cvss_v2_vector'),
                        'published_date': published_date,
                        'last_modified_date': last_modified_date,
                        'references': cve_data.get('references', []),
                        'threat_feed': cve_data['threat_feed'],
                        'resolved': False  # Default to unresolved
                    }
                )
                
                # If CVE already exists, update it with latest data
                if not created:
                    cve.description = cve_data['description']
                    cve.dependency_name = cve_data['dependency_name']
                    cve.cvss_v3_score = cve_data.get('cvss_v3_score')
                    cve.cvss_v3_vector = cve_data.get('cvss_v3_vector')
                    cve.cvss_v2_score = cve_data.get('cvss_v2_score')
                    cve.cvss_v2_vector = cve_data.get('cvss_v2_vector')
                    cve.published_date = published_date
                    cve.last_modified_date = last_modified_date
                    cve.references = cve_data.get('references', [])
                    cve.threat_feed = cve_data['threat_feed']
                    cve.save()
            
            print(f"Stored {len(cves)} CVEs for user {user.id}")
            
        except Exception as e:
            print(f"Error in _store_cve_data_for_user: {str(e)}")
            raise

class CVEViewSet(ModelViewSet):
    """ViewSet for managing CVE data"""
    serializer_class = CVESerializer
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        """Return CVEs for the authenticated user"""
        return CVE.objects.filter(user=self.request.user)
    
    def perform_create(self, serializer):
        """Associate the CVE with the current user"""
        serializer.save(user=self.request.user)

@api_view(['GET'])
@authentication_classes([JWTAuthentication])
@permission_classes([IsAuthenticated])
def get_user_cves(request):
    """Get CVE data for the authenticated user"""
    print(f"get_user_cves called by user: {request.user}, authenticated: {request.user.is_authenticated}")
    
    try:
        cves = CVE.objects.filter(user=request.user)
        serializer = CVESerializer(cves, many=True)
        
        return Response({
            "success": True,
            "cves": serializer.data,
            "total": len(serializer.data)
        })
    except Exception as e:
        return Response({
            "success": False,
            "error": str(e)
        }, status=500)

@api_view(['POST'])
@authentication_classes([JWTAuthentication])
@permission_classes([IsAuthenticated])
def refresh_user_cves(request):
    """Refresh CVE data for the authenticated user"""
    
    try:
        # Delete existing CVEs for the user
        CVE.objects.filter(user=request.user).delete()
        
        # Fetch fresh CVE data
        cves = fetch_all_cves(limit_per_category=500)
        
        # Store new CVE data
        for cve_data in cves:
            # Convert date strings to date objects - handle both date-only and datetime formats
            try:
                published_date = datetime.strptime(cve_data['published_date'], '%Y-%m-%d').date()
            except ValueError:
                # Try parsing with time component
                published_date = datetime.strptime(cve_data['published_date'].split('T')[0], '%Y-%m-%d').date()
            
            try:
                last_modified_date = datetime.strptime(cve_data['last_modified_date'], '%Y-%m-%d').date()
            except ValueError:
                # Try parsing with time component
                last_modified_date = datetime.strptime(cve_data['last_modified_date'].split('T')[0], '%Y-%m-%d').date()
            
            # Create or update CVE record for the user
            cve, created = CVE.objects.get_or_create(
                user=request.user,
                cve_id=cve_data['id'],
                defaults={
                    'description': cve_data['description'],
                    'dependency_name': cve_data['dependency_name'],
                    'cvss_v3_score': cve_data.get('cvss_v3_score'),
                    'cvss_v3_vector': cve_data.get('cvss_v3_vector'),
                    'cvss_v2_score': cve_data.get('cvss_v2_score'),
                    'cvss_v2_vector': cve_data.get('cvss_v2_vector'),
                    'published_date': published_date,
                    'last_modified_date': last_modified_date,
                    'references': cve_data.get('references', []),
                    'threat_feed': cve_data['threat_feed'],
                    'resolved': False  # Default to unresolved
                }
            )
            
            # If CVE already exists, update it with latest data
            if not created:
                cve.description = cve_data['description']
                cve.dependency_name = cve_data['dependency_name']
                cve.cvss_v3_score = cve_data.get('cvss_v3_score')
                cve.cvss_v3_vector = cve_data.get('cvss_v3_vector')
                cve.cvss_v2_score = cve_data.get('cvss_v2_score')
                cve.cvss_v2_vector = cve_data.get('cvss_v2_vector')
                cve.published_date = published_date
                cve.last_modified_date = last_modified_date
                cve.references = cve_data.get('references', [])
                cve.threat_feed = cve_data['threat_feed']
                cve.save()
        
        return Response({
            "success": True,
            "message": f"Refreshed {len(cves)} CVEs for user {request.user.id}"
        })
    except Exception as e:
        return Response({
            "success": False,
            "error": str(e)
        }, status=500)

@api_view(['POST'])
@authentication_classes([JWTAuthentication])
@permission_classes([IsAuthenticated])
def toggle_cve_resolved(request):
    """Toggle the resolved status of a CVE for the authenticated user"""
    
    try:
        cve_id = request.data.get('cve_id')
        
        if not cve_id:
            return Response({
                "success": False,
                "error": "cve_id is required"
            }, status=400)
        
        # Get the CVE for the current user
        try:
            cve = CVE.objects.get(user=request.user, cve_id=cve_id)
        except CVE.DoesNotExist:
            return Response({
                "success": False,
                "error": "CVE not found for this user"
            }, status=404)
        
        # Toggle the resolved status
        cve.resolved = not cve.resolved
        cve.save()
        
        return Response({
            "success": True,
            "cve_id": cve_id,
            "resolved": cve.resolved,
            "message": f"CVE {cve_id} marked as {'resolved' if cve.resolved else 'unresolved'}"
        })
    except Exception as e:
        return Response({
            "success": False,
            "error": str(e)
        }, status=500)

@api_view(['GET'])
@permission_classes([AllowAny])
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
        limit = int(request.GET.get('limit', 500))
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
        
        return Response(response_data)
        
    except Exception as e:
        return Response({
            "success": False,
            "error": str(e)
        }, status=500)

@api_view(['GET'])
@permission_classes([AllowAny])
def get_cve_statistics_only(request):
    """
    API endpoint to get only CVE statistics without the full CVE data.
    """
    try:
        # Get query parameters
        limit = int(request.GET.get('limit', 500))
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
        
        return Response(response_data)
        
    except Exception as e:
        return Response({
            "success": False,
            "error": str(e)
        }, status=500)

@api_view(['GET'])
@permission_classes([AllowAny])
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
        limit = int(request.GET.get('limit', 500))
        api_key = request.GET.get('api_key', None)
        
        if not threat_feed:
            return Response({
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
        
        return Response(response_data)
        
    except Exception as e:
        return Response({
            "success": False,
            "error": str(e)
        }, status=500)

@api_view(['POST'])
@authentication_classes([JWTAuthentication])
@permission_classes([IsAuthenticated])
def cve_explanation(request):
    """
    API endpoint to generate CVE explanation and Mermaid diagram.
    """
    print(f"cve_explanation called by user: {request.user}, authenticated: {request.user.is_authenticated}")
    print(f"Authorization header: {request.headers.get('Authorization', 'Not found')}")
    print(f"All headers: {dict(request.headers)}")
    
    try:
        cve_id = request.data.get('cve_id')
        description = request.data.get('description')
        severity = request.data.get('severity')
        
        if not all([cve_id, description, severity]):
            return Response({
                "success": False,
                "error": "cve_id, description, and severity are required"
            }, status=400)
        
        # Generate explanation and mermaid diagram using the function from functions.py
        result = generate_cve_description_and_mermaid(cve_id, description, severity)
        
        return Response({
            "success": True,
            "explanation": result.get("explanation"),
            "mermaid": result.get("mermaid")
        })
    except Exception as e:
        print(e)
        return Response({
            "success": False,
            "error": str(e)
        }, status=500)

@api_view(['POST'])
@authentication_classes([JWTAuthentication])
@permission_classes([IsAuthenticated])
def waf_rule(request):
    """
    API endpoint to generate WAF rule.
    """
    try:
        cve_id = request.data.get('cve_id')
        description = request.data.get('description')
        severity = request.data.get('severity')
        mode = request.data.get('mode')
        waf = request.data.get('waf')
        
        if not all([cve_id, description, severity, mode, waf]):
            return Response({
                "success": False,
                "error": "cve_id, description, severity, mode, and waf are required"
            }, status=400)
        
        # Generate WAF rule using the function from functions.py
        result = generate_waf_rule(cve_id, description, severity, mode, waf)
        
        return Response({
            "success": True,
            "waf_rule": result.get("waf_rule")
        })
    except Exception as e:
        return Response({
            "success": False,
            "error": str(e)
        }, status=500)
