from django.db import models
from django.contrib.auth.models import User

# Create your models here.
class Item(models.Model):
    name = models.CharField(max_length=100)
    description = models.TextField(blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)
    
    def __str__(self):
        return self.name

class UserProfile(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='profile')
    bio = models.TextField(blank=True, null=True)
    profile_picture = models.URLField(blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)
    
    def __str__(self):
        return f"{self.user.username}'s profile"

class Policy(models.Model):
    policy_number = models.CharField(max_length=100, unique=True)
    coverage_details = models.JSONField()
    exclusions = models.JSONField()
    start_date = models.DateTimeField()
    end_date = models.DateTimeField()
    document_url = models.URLField(blank=True, null=True)
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='policies')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    def __str__(self):
        return f"Policy {self.policy_number} for {self.user.username}"

class MedicalHistory(models.Model):
    condition = models.CharField(max_length=200)
    diagnosis_date = models.DateTimeField()
    treatment = models.TextField(blank=True, null=True)
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='medical_history')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    def __str__(self):
        return f"{self.condition} for {self.user.username}"

class Claim(models.Model):
    STATUS_CHOICES = [
        ('pending', 'Pending'),
        ('approved', 'Approved'),
        ('rejected', 'Rejected'),
    ]
    
    treatment = models.CharField(max_length=200)
    treatment_date = models.DateTimeField()
    cause = models.TextField(blank=True, null=True)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='pending')
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='claims')
    policy = models.ForeignKey(Policy, on_delete=models.CASCADE, related_name='claims')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    treatment_money = models.DecimalField(max_digits=10, decimal_places=2, null=True, blank=True)
    
    def __str__(self):
        return f"Claim {self.id} for {self.user.username}"

class Document(models.Model):
    document_type = models.CharField(max_length=100)
    file_path = models.CharField(max_length=255)
    claim = models.ForeignKey(Claim, on_delete=models.CASCADE, related_name='documents')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    def __str__(self):
        return f"{self.document_type} for Claim {self.claim.id}"
