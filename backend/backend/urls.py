"""
URL configuration for backend project.

The `urlpatterns` list routes URLs to views. For more information please see:
    https://docs.djangoproject.com/en/5.2/topics/http/urls/
Examples:
Function views
    1. Add an import:  from my_app import views
    2. Add a URL to urlpatterns:  path('', views.home, name='home')
Class-based views
    1. Add an import:  from other_app.views import Home
    2. Add a URL to urlpatterns:  path('', Home.as_view(), name='home')
Including another URLconf
    1. Import the include() function: from django.urls import include, path
    2. Add a URL to urlpatterns:  path('blog/', include('blog.urls'))
"""

from django.contrib import admin
from django.urls import path, include
from rest_framework.routers import DefaultRouter
from rest_framework_simplejwt.views import (
    TokenObtainPairView,
    TokenRefreshView,
)
from api.views import (
    LoginView, RegisterView, get_user_cves, refresh_user_cves, 
    toggle_cve_resolved, get_aggregated_cves, get_cve_statistics_only,
    get_cves_by_threat_feed, cve_explanation, waf_rule
)

urlpatterns = [
    path("admin/", admin.site.urls),
    
    # JWT Token endpoints
    path('api/token/', TokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('api/token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    
    # Authentication endpoints
    path('api/auth/login/', LoginView.as_view(), name='login'),
    path('api/auth/register/', RegisterView.as_view(), name='register'),
    
    # CVE endpoints
    path('api/cves/aggregated/', get_aggregated_cves, name='get_aggregated_cves'),
    path('api/cves/statistics/', get_cve_statistics_only, name='get_cve_statistics'),
    path('api/cves/threat-feed/', get_cves_by_threat_feed, name='get_cves_by_threat_feed'),
    path('api/cve-explanation/', cve_explanation, name='cve_explanation'),
    path('api/waf-rule/', waf_rule, name='waf_rule'),
    
    # User-specific CVE endpoints
    path('api/user/cves/', get_user_cves, name='get_user_cves'),
    path('api/user/cves/refresh/', refresh_user_cves, name='refresh_user_cves'),
    path('api/user/cves/toggle-resolved/', toggle_cve_resolved, name='toggle_cve_resolved'),
    
]