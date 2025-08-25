from django.db import models
from django.contrib.auth.models import User

# Create your models here.

class CVE(models.Model):
    """Model to store CVE data for users"""
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='cves')
    cve_id = models.CharField(max_length=20)
    description = models.TextField()
    dependency_name = models.CharField(max_length=255)
    cvss_v3_score = models.DecimalField(max_digits=4, decimal_places=1, null=True, blank=True)
    cvss_v3_vector = models.CharField(max_length=100, null=True, blank=True)
    cvss_v2_score = models.DecimalField(max_digits=4, decimal_places=1, null=True, blank=True)
    cvss_v2_vector = models.CharField(max_length=100, null=True, blank=True)
    published_date = models.DateField()
    last_modified_date = models.DateField()
    references = models.JSONField(default=list)  # Store as JSON array
    threat_feed = models.CharField(max_length=100)
    STATUS_CHOICES = [
        ('not_started', 'Not Started'),
        ('started', 'Started'),
        ('in_progress', 'In Progress'),
        ('closed', 'Closed'),
    ]
    status = models.CharField(
        max_length=20, 
        choices=STATUS_CHOICES, 
        default='not_started',
        help_text="Current status of this CVE"
    )
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'cve_data'
        unique_together = ['user', 'cve_id']
        indexes = [
            models.Index(fields=['user', 'cve_id']),
            models.Index(fields=['dependency_name']),
            models.Index(fields=['cvss_v3_score']),
            models.Index(fields=['published_date']),
            models.Index(fields=['status']),
        ]

    def __str__(self):
        return f"{self.cve_id} - {self.dependency_name}"

    @property
    def severity_label(self):
        """Get severity label based on CVSS v3 score"""
        if not self.cvss_v3_score:
            return "Unknown"
        score = float(self.cvss_v3_score)
        if score >= 9.0:
            return "Critical"
        elif score >= 7.0:
            return "High"
        elif score >= 4.0:
            return "Medium"
        else:
            return "Low"
