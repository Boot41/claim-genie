from django.urls import path
from .views import upload_policy_pdf, extract_policy_details

urlpatterns = [
    path("upload_policy_pdf/", upload_policy_pdf, name="upload_policy_pdf"),
    path("extract_policy_details/", extract_policy_details, name="extract_policy_details"),
]