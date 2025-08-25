from django.contrib import admin
from .models import CVE

# Register your models here.
@admin.register(CVE)
class CVEAdmin(admin.ModelAdmin):
    list_display = ['cve_id', 'dependency_name', 'user', 'cvss_v3_score', 'threat_feed', 'status', 'published_date']
    list_filter = ['threat_feed', 'cvss_v3_score', 'status', 'published_date', 'user']
    search_fields = ['cve_id', 'dependency_name', 'description']
    readonly_fields = ['created_at', 'updated_at']
    date_hierarchy = 'published_date'
    list_editable = ['status']
    
    fieldsets = (
        ('Basic Information', {
            'fields': ('user', 'cve_id', 'dependency_name', 'description')
        }),
        ('CVSS Scores', {
            'fields': ('cvss_v3_score', 'cvss_v3_vector', 'cvss_v2_score', 'cvss_v2_vector')
        }),
        ('Dates', {
            'fields': ('published_date', 'last_modified_date')
        }),
        ('Additional Info', {
            'fields': ('references', 'threat_feed', 'status')
        }),
        ('System', {
            'fields': ('created_at', 'updated_at'),
            'classes': ('collapse',)
        }),
    )
