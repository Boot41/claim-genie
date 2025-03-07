from django.urls import path, include
from rest_framework.routers import DefaultRouter
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView
from . import views

router = DefaultRouter()
router.register(r'items', views.ItemViewSet)
router.register(r'policies', views.PolicyViewSet, basename='policy')
router.register(r'medical-history', views.MedicalHistoryViewSet, basename='medicalhistory')
router.register(r'claims', views.ClaimViewSet, basename='claim')

urlpatterns = [
    path('', views.api_overview, name='api-overview'),
    path('', include(router.urls)),
    
    # Authentication URLs
    path('auth/register/', views.RegisterView.as_view(), name='register'),
    path('auth/login/', TokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('auth/token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    path('auth/profile/', views.UserProfileView.as_view(), name='user_profile'),
    path('ocr/', views.ocr_api_view, name='ocr-endpoint'),
    
    # Claims URLs
    path('claims/<int:pk>/detail/', views.claim_detail, name='claim_detail'),
]
