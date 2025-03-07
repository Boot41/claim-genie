import pytesseract
from PIL import Image
from rest_framework.views import APIView

from rest_framework import viewsets, status, generics, permissions
from rest_framework.response import Response
from rest_framework.decorators import api_view, permission_classes
from rest_framework_simplejwt.views import TokenObtainPairView
from django.contrib.auth.models import User
from django.shortcuts import get_object_or_404
from .models import Item, UserProfile, Policy, MedicalHistory, Claim, Document
from .serializers import (ItemSerializer, UserSerializer, RegisterSerializer,
                         PolicySerializer, MedicalHistorySerializer, ClaimSerializer, DocumentSerializer)

# Create a viewset for the Item model
class ItemViewSet(viewsets.ModelViewSet):
    queryset = Item.objects.all()
    serializer_class = ItemSerializer

# Create a viewset for the Policy model
class PolicyViewSet(viewsets.ModelViewSet):
    serializer_class = PolicySerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        return Policy.objects.filter(user=self.request.user)
    
    def perform_create(self, serializer):
        serializer.save(user=self.request.user)

# OCR Extraction
@api_view(['POST'])
@permission_classes([permissions.AllowAny])
def ocr_api_view(request):
    uploaded_file = request.FILES.get('image')
    if not uploaded_file:
        return Response({'error': 'No file uploaded'}, status=400)
    
    try:
        image = Image.open(uploaded_file)
        extracted_text = pytesseract.image_to_string(image)
        return Response({'text': extracted_text}, status=200)
    except Exception as e:
        return Response({'error': str(e)}, status=500)

# Create a viewset for the MedicalHistory model
class MedicalHistoryViewSet(viewsets.ModelViewSet):
    serializer_class = MedicalHistorySerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        return MedicalHistory.objects.filter(user=self.request.user)
    
    def perform_create(self, serializer):
        serializer.save(user=self.request.user)

# Create a viewset for the Claim model
class ClaimViewSet(viewsets.ModelViewSet):
    serializer_class = ClaimSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        return Claim.objects.filter(user=self.request.user)
    
    def perform_create(self, serializer):
        serializer.save(user=self.request.user)

# Create a simple API view for testing
@api_view(['GET'])
@permission_classes([permissions.AllowAny])
def api_overview(request):
    api_urls = {
        'Register': '/auth/register/',
        'Login': '/auth/login/',
        'Refresh Token': '/auth/token/refresh/',
        'User Profile': '/auth/profile/',
        'Items': '/items/',
        'Policies': '/policies/',
        'Medical History': '/medical-history/',
        'Claims': '/claims/',
        'Claim Detail': '/claims/<id>/',
    }
    return Response(api_urls)

# Register view
class RegisterView(generics.CreateAPIView):
    queryset = User.objects.all()
    permission_classes = [permissions.AllowAny]
    serializer_class = RegisterSerializer

# User profile view
class UserProfileView(generics.RetrieveUpdateAPIView):
    serializer_class = UserSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_object(self):
        return self.request.user

# Specific claim detail view
@api_view(['GET'])
@permission_classes([permissions.IsAuthenticated])
def claim_detail(request, pk):
    claim = get_object_or_404(Claim, id=pk, user=request.user)
    serializer = ClaimSerializer(claim)
    return Response(serializer.data)
