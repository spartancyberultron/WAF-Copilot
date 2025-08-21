from rest_framework import serializers
from rest_framework.serializers import ModelSerializer
from django.contrib.auth.models import User
from .models import CVE

class UserSerializer(ModelSerializer):
    class Meta:
        model = User
        fields = ["id", "username", "password"]
        extra_kwargs = {
            'password': {'write_only': True}
        }

    def create(self, validated_data):
        user = User.objects.create_user(**validated_data)
        return user

class CVESerializer(ModelSerializer):
    id = serializers.CharField(source='cve_id', read_only=True)  # Map cve_id to id for frontend
    published_date = serializers.DateField(format='%Y-%m-%d')
    last_modified_date = serializers.DateField(format='%Y-%m-%d')
    cvss_v3_score = serializers.FloatField(allow_null=True)
    cvss_v2_score = serializers.FloatField(allow_null=True)
    
    class Meta:
        model = CVE
        fields = [
            'id', 'description', 'dependency_name', 
            'cvss_v3_score', 'cvss_v3_vector', 'cvss_v2_score', 
            'cvss_v2_vector', 'published_date', 'last_modified_date', 
            'references', 'threat_feed', 'resolved'
        ]
