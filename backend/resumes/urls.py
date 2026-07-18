from django.urls import path
from .views import RegisterUserView, GenerateResumeView

urlpatterns = [
    path('auth/register/', RegisterUserView.as_view(), name='auth_register'),
    path('generate/', GenerateResumeView.as_view(), name='generate_resume'),
]
