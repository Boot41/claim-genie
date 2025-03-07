from rest_framework import serializers
from django.contrib.auth.models import User
from django.contrib.auth.password_validation import validate_password
from .models import Item, UserProfile, Policy, MedicalHistory, Claim, Document

class ItemSerializer(serializers.ModelSerializer):
    class Meta:
        model = Item
        fields = '__all__'

class UserProfileSerializer(serializers.ModelSerializer):
    class Meta:
        model = UserProfile
        fields = ['bio', 'profile_picture', 'created_at']

class UserSerializer(serializers.ModelSerializer):
    profile = UserProfileSerializer(read_only=True)
    
    class Meta:
        model = User
        fields = ['id', 'username', 'email', 'first_name', 'last_name', 'profile']
        read_only_fields = ['id']

class RegisterSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, required=True, validators=[validate_password])
    password2 = serializers.CharField(write_only=True, required=True)

    class Meta:
        model = User
        fields = ['username', 'password', 'password2', 'email', 'first_name', 'last_name']

    def validate(self, attrs):
        if attrs['password'] != attrs['password2']:
            raise serializers.ValidationError({"password": "Password fields didn't match."})
        return attrs

    def create(self, validated_data):
        validated_data.pop('password2')
        user = User.objects.create_user(**validated_data)
        UserProfile.objects.create(user=user)
        return user

class DocumentSerializer(serializers.ModelSerializer):
    class Meta:
        model = Document
        fields = ['id', 'document_type', 'file_path', 'created_at']

class ClaimSerializer(serializers.ModelSerializer):
    documents = DocumentSerializer(many=True, read_only=True)
    policy_number = serializers.CharField(source='policy.policy_number', read_only=True)
    policy_provider = serializers.SerializerMethodField()
    policy_holder_name = serializers.SerializerMethodField()
    incident_date = serializers.DateTimeField(source='treatment_date', required=False)
    incident_description = serializers.CharField(source='cause', required=False)
    claim_details = serializers.SerializerMethodField()
    timeline = serializers.SerializerMethodField()

    # Accept writable fields for document data (if using as before)
    document_url = serializers.CharField(write_only=True, required=False)
    document_type = serializers.CharField(write_only=True, required=False)

    # Add treatment_money as a writable field
    treatment_money = serializers.DecimalField(max_digits=10, decimal_places=2, required=False)

    class Meta:
        model = Claim
        fields = [
            'id', 'treatment', 'treatment_date', 'cause', 'status', 'created_at', 'updated_at',
            'documents', 'policy_number', 'policy_provider', 'policy_holder_name', 
            'incident_date', 'incident_description', 'claim_details', 'timeline', 'policy',
            'document_url', 'document_type', 'treatment_money'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at', 'documents', 'policy_number', 
                            'policy_provider', 'policy_holder_name', 'claim_details', 'timeline']

    def create(self, validated_data):
        # Pop out document information
        document_url = validated_data.pop('document_url', None)
        document_type = validated_data.pop('document_type', 'Default Type')
        
        # Create the Claim instance – treatment_money will be saved automatically if present
        claim = Claim.objects.create(**validated_data)
        
        # If document_url is provided, create a Document instance related to the claim
        if document_url:
            Document.objects.create(
                document_type=document_type,
                file_path=document_url,
                claim=claim
            )
        return claim

    def get_policy_provider(self, obj):
        return "Health Insurance Provider"
    
    def get_policy_holder_name(self, obj):
        return f"{obj.user.first_name} {obj.user.last_name}"
    
    def get_claim_details(self, obj):
        return f"Health Insurance Claim: {obj.cause if obj.cause else 'Medical treatment'}"
    
    def get_timeline(self, obj):
        import datetime
        from django.utils import timezone
        
        submission_date = obj.created_at
        timeline = [{
            'date': submission_date.strftime('%Y-%m-%d'),
            'action': 'Claim submitted',
            'actor': 'You',
            'completed': True
        }]

        review_date = submission_date + datetime.timedelta(days=1)
        timeline.append({
            'date': review_date.strftime('%Y-%m-%d'),
            'action': 'Claim received and under review',
            'actor': 'Insurance Company',
            'completed': True
        })

        decision_date = submission_date + datetime.timedelta(days=3)
        if obj.updated_at and obj.updated_at > submission_date and (obj.status == 'approved' or obj.status == 'rejected'):
            decision_date = obj.updated_at
            decision_completed = True
        else:
            now = timezone.now()
            decision_completed = decision_date <= now

        if obj.status == 'approved':
            timeline.append({
                'date': decision_date.strftime('%Y-%m-%d'),
                'action': 'Claim approved',
                'actor': 'Insurance Company',
                'completed': decision_completed
            })
            payment_date = decision_date + datetime.timedelta(days=2)
            timeline.append({
                'date': payment_date.strftime('%Y-%m-%d'),
                'action': 'Payment processed',
                'actor': 'Insurance Company',
                'completed': payment_date <= timezone.now()
            })
        elif obj.status == 'rejected':
            timeline.append({
                'date': decision_date.strftime('%Y-%m-%d'),
                'action': 'Claim rejected',
                'actor': 'Insurance Company',
                'completed': decision_completed
            })
        else:  # pending
            timeline.append({
                'date': decision_date.strftime('%Y-%m-%d'),
                'action': 'Claim decision pending',
                'actor': 'Insurance Company',
                'completed': False
            })
        return timeline

class PolicySerializer(serializers.ModelSerializer):
    claims = ClaimSerializer(many=True, read_only=True)
    
    class Meta:
        model = Policy
        fields = ['id', 'policy_number', 'coverage_details', 'exclusions', 'document_url', 'start_date', 'end_date', 'claims']

class MedicalHistorySerializer(serializers.ModelSerializer):
    class Meta:
        model = MedicalHistory
        fields = ['id', 'condition', 'diagnosis_date', 'treatment', 'created_at']
        read_only_fields = ['id', 'created_at']
