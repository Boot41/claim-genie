from django.urls import path
from .views import upload_pdf, query_pdf

urlpatterns = [
    path('upload/', upload_pdf, name='upload_pdf'),
    path('query/', query_pdf, name='query_pdf'),
]