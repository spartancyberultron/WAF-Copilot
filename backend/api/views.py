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

from .aggregate import fetch_all_cves
from .functions import generate_cve_description_and_mermaid, generate_waf_rule, generate_testing_code

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
            # Format validation errors for better frontend handling
            formatted_errors = {}
            for field, errors in serializer.errors.items():
                if isinstance(errors, list):
                    formatted_errors[field] = [str(error) for error in errors]
                else:
                    formatted_errors[field] = [str(errors)]
            
            return Response({
                "message": "User registration failed",
                "errors": formatted_errors
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
                        'status': 'not_started'  # Default to not started
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
                    'status': 'not_started'  # Default to not started
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
def update_cve_status(request):
    """Update the status of a CVE for the authenticated user"""
    
    try:
        cve_id = request.data.get('cve_id')
        new_status = request.data.get('status')
        
        if not cve_id:
            return Response({
                "success": False,
                "error": "cve_id is required"
            }, status=400)
            
        if not new_status:
            return Response({
                "success": False,
                "error": "status is required"
            }, status=400)
        
        # Validate status choices
        valid_statuses = ['not_started', 'started', 'in_progress', 'closed']
        if new_status not in valid_statuses:
            return Response({
                "success": False,
                "error": f"Invalid status. Must be one of: {', '.join(valid_statuses)}"
            }, status=400)
        
        # Get the CVE for the current user
        try:
            cve = CVE.objects.get(user=request.user, cve_id=cve_id)
        except CVE.DoesNotExist:
            return Response({
                "success": False,
                "error": "CVE not found for this user"
            }, status=400)
        
        # Update the status
        cve.status = new_status
        cve.save()
        
        return Response({
            "success": True,
            "cve_id": cve_id,
            "status": cve.status,
            "message": f"CVE {cve_id} status updated to {cve.get_status_display()}"
        })
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

@api_view(['GET'])
@authentication_classes([JWTAuthentication])
@permission_classes([IsAuthenticated])
def get_user_profile(request):
    """Get profile details for the authenticated user"""
    try:
        user = request.user
        
        # Get additional user statistics if needed
        cve_count = CVE.objects.filter(user=user).count()
        closed_cve_count = CVE.objects.filter(user=user, status='closed').count()
        in_progress_cve_count = CVE.objects.filter(user=user, status='in_progress').count()
        started_cve_count = CVE.objects.filter(user=user, status='started').count()
        not_started_cve_count = CVE.objects.filter(user=user, status='not_started').count()
        
        profile_data = {
            "success": True,
            "user": {
                "id": user.id,
                "username": user.username,
                "email": user.email,
                "first_name": user.first_name or "",
                "last_name": user.last_name or "",
                "date_joined": user.date_joined.isoformat() if user.date_joined else None,
                "last_login": user.last_login.isoformat() if user.last_login else None,
                "is_staff": user.is_staff,
                "is_superuser": user.is_superuser,
            },
            "statistics": {
                "total_cves": cve_count,
                "closed_cves": closed_cve_count,
                "in_progress_cves": in_progress_cve_count,
                "started_cves": started_cve_count,
                "not_started_cves": not_started_cve_count,
            }
        }
        
        return Response(profile_data)
        
    except Exception as e:
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

@api_view(['POST'])
@authentication_classes([JWTAuthentication])
@permission_classes([IsAuthenticated])
def generate_cve_testing_code(request):
    """
    API endpoint to generate Python testing code for a CVE.
    """
    try:
        cve_id = request.data.get('cve_id')
        description = request.data.get('description')
        severity = request.data.get('severity')
        
        if not all([cve_id, description, severity]):
            return Response({
                "success": False,
                "error": "cve_id, description, and severity are required"
            }, status=400)
        
        # Generate testing code using the function from functions.py
        result = generate_testing_code(cve_id, description, severity)
        
        return Response({
            "success": True,
            "python_code": result.get("python_code")
        })
    except Exception as e:
        return Response({
            "success": False,
            "error": str(e)
        }, status=500)
