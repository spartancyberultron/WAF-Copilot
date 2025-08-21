import os
import sys
import django

# Setup Django environment
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'backend.settings')
sys.path.append(os.path.dirname(os.path.abspath(__file__)))
django.setup()

from api.models import CVE
from api.serializers import CVESerializer
from django.contrib.auth.models import User
from datetime import date

# Create a test user
user, created = User.objects.get_or_create(
    username='testuser',
    defaults={'email': 'test@example.com'}
)
if created:
    user.set_password('testpass123')
    user.save()

# Create a test CVE
cve, created = CVE.objects.get_or_create(
    user=user,
    cve_id='CVE-2023-1234',
    defaults={
        'description': 'Test vulnerability',
        'dependency_name': 'test-dependency',
        'cvss_v3_score': 9.8,
        'cvss_v3_vector': 'CVSS:3.1/AV:N/AC:L/PR:N/UI:N/S:U/C:H/I:H/A:H',
        'cvss_v2_score': 10.0,
        'cvss_v2_vector': 'AV:N/AC:L/Au:N/C:C/I:C/A:C',
        'published_date': date(2023, 1, 15),
        'last_modified_date': date(2023, 1, 20),
        'references': ['https://example.com/cve-2023-1234'],
        'threat_feed': 'NVD',
        'resolved': False,
    }
)

# Test the serializer
serializer = CVESerializer(cve)
data = serializer.data

print("Serialized CVE data:")
print(f"ID: {data['id']} (type: {type(data['id'])})")
print(f"Description: {data['description']}")
print(f"CVSS v3 Score: {data['cvss_v3_score']} (type: {type(data['cvss_v3_score'])})")
print(f"Published Date: {data['published_date']} (type: {type(data['published_date'])})")
print(f"Resolved: {data['resolved']} (type: {type(data['resolved'])})")

# Test with multiple CVEs
cves = CVE.objects.filter(user=user)
serializer = CVESerializer(cves, many=True)
data = serializer.data

print(f"\nTotal CVEs: {len(data)}")
for cve_data in data:
    print(f"- {cve_data['id']}: {cve_data['description'][:50]}...")
