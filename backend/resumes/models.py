from django.db import models
from django.contrib.auth.models import User

class Resume(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name="resumes")
    full_name = models.CharField(max_length=100)
    target_role = models.CharField(max_length=100)
    skills = models.TextField()
    experience_summary = models.TextField()
    ai_generated_summary = models.TextField(blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.full_name} - {self.target_role}"
