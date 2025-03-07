import json
from django.urls import reverse
from rest_framework import status
from rest_framework.test import APITestCase
from django.contrib.auth.models import User
from .models import Item, Policy, MedicalHistory, Claim, Document

class APIRoutesTestCase(APITestCase):
    def setUp(self):
        # Create a test user
        self.user = User.objects.create_user(
            username='testuser', password='testpass', email='test@example.com'
        )

        # Register endpoint URL
        self.register_url = reverse('register')
        # Login (JWT obtain) endpoint URL
        self.login_url = reverse('token_obtain_pair')
        # Profile endpoint URL
        self.profile_url = reverse('user_profile')
        # API overview endpoint (public access)
        self.overview_url = reverse('api-overview')
        
        # Fetch JWT token for authenticated routes
        login_response = self.client.post(
            self.login_url,
            {'username': 'testuser', 'password': 'testpass'},
            format='json'
        )
        self.assertEqual(login_response.status_code, status.HTTP_200_OK)
        self.access_token = login_response.data['access']
        self.refresh_token = login_response.data['refresh']
        self.client.credentials(HTTP_AUTHORIZATION='Bearer ' + self.access_token)

    # 1. API Overview (public)
    def test_api_overview_get(self):
        response = self.client.get(self.overview_url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn('Register', response.data)

    # 2. Items Viewset Tests
    def test_items_list(self):
        url = reverse('item-list')
        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)

    def test_item_create(self):
        url = reverse('item-list')
        data = {"name": "Test Item", "description": "Test Description"}
        response = self.client.post(url, data, format="json")
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)

    def test_item_retrieve(self):
        item = Item.objects.create(name="Retrieve Item", description="Desc")
        url = reverse('item-detail', kwargs={'pk': item.pk})
        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['name'], item.name)

    def test_item_update(self):
        item = Item.objects.create(name="Old Name", description="Old Desc")
        url = reverse('item-detail', kwargs={'pk': item.pk})
        data = {"name": "New Name", "description": "New Desc"}
        response = self.client.put(url, data, format="json")
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        item.refresh_from_db()
        self.assertEqual(item.name, "New Name")

    def test_item_delete(self):
        item = Item.objects.create(name="To Delete", description="Delete Desc")
        url = reverse('item-detail', kwargs={'pk': item.pk})
        response = self.client.delete(url)
        self.assertEqual(response.status_code, status.HTTP_204_NO_CONTENT)
        self.assertFalse(Item.objects.filter(pk=item.pk).exists())

    # 3. Policies Viewset Tests
    def test_policy_list_empty(self):
        url = reverse('policy-list')
        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data), 0)

    def test_policy_create(self):
        url = reverse('policy-list')
        data = {
            "policy_number": "POL123",
            "coverage_details": {"detail": "Coverage A"},
            "exclusions": {"exclusion": "None"},
            "start_date": "2025-01-01T00:00:00Z",
            "end_date": "2026-01-01T00:00:00Z"
        }
        response = self.client.post(url, data, format="json")
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(response.data['policy_number'], "POL123")

    def test_policy_retrieve(self):
        policy = Policy.objects.create(
            policy_number="POL456",
            coverage_details={"detail": "Coverage B"},
            exclusions={"exclusion": "None"},
            start_date="2025-01-01T00:00:00Z",
            end_date="2026-01-01T00:00:00Z",
            user=self.user
        )
        url = reverse('policy-detail', kwargs={'pk': policy.pk})
        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['policy_number'], "POL456")

    def test_policy_update(self):
        policy = Policy.objects.create(
            policy_number="POL789",
            coverage_details={"detail": "Coverage C"},
            exclusions={"exclusion": "None"},
            start_date="2025-01-01T00:00:00Z",
            end_date="2026-01-01T00:00:00Z",
            user=self.user
        )
        url = reverse('policy-detail', kwargs={'pk': policy.pk})
        data = {
            "policy_number": "POL789_UPDATED",
            "coverage_details": {"detail": "Updated Coverage"},
            "exclusions": {"exclusion": "None"},
            "start_date": "2025-01-01T00:00:00Z",
            "end_date": "2027-01-01T00:00:00Z"
        }
        response = self.client.put(url, data, format="json")
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        policy.refresh_from_db()
        self.assertEqual(policy.policy_number, "POL789_UPDATED")

    def test_policy_delete(self):
        policy = Policy.objects.create(
            policy_number="POLDEL",
            coverage_details={"detail": "Coverage D"},
            exclusions={"exclusion": "None"},
            start_date="2025-01-01T00:00:00Z",
            end_date="2026-01-01T00:00:00Z",
            user=self.user
        )
        url = reverse('policy-detail', kwargs={'pk': policy.pk})
        response = self.client.delete(url)
        self.assertEqual(response.status_code, status.HTTP_204_NO_CONTENT)
        self.assertFalse(Policy.objects.filter(pk=policy.pk).exists())

    # 4. MedicalHistory Viewset Tests
    def test_medical_history_list_empty(self):
        url = reverse('medicalhistory-list')
        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data), 0)

    def test_medical_history_create(self):
        url = reverse('medicalhistory-list')
        data = {
            "condition": "Diabetes",
            "diagnosis_date": "2025-01-01T00:00:00Z",
            "treatment": "Medication"
        }
        response = self.client.post(url, data, format="json")
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(response.data['condition'], "Diabetes")

    def test_medical_history_retrieve(self):
        mh = MedicalHistory.objects.create(
            condition="Hypertension",
            diagnosis_date="2025-01-01T00:00:00Z",
            treatment="Lifestyle change",
            user=self.user
        )
        url = reverse('medicalhistory-detail', kwargs={'pk': mh.pk})
        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['condition'], "Hypertension")

    def test_medical_history_update(self):
        mh = MedicalHistory.objects.create(
            condition="Old Condition",
            diagnosis_date="2025-01-01T00:00:00Z",
            treatment="Old Treatment",
            user=self.user
        )
        url = reverse('medicalhistory-detail', kwargs={'pk': mh.pk})
        data = {
            "condition": "New Condition",
            "diagnosis_date": "2025-01-01T00:00:00Z",
            "treatment": "New Treatment"
        }
        response = self.client.put(url, data, format="json")
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        mh.refresh_from_db()
        self.assertEqual(mh.condition, "New Condition")

    def test_medical_history_delete(self):
        mh = MedicalHistory.objects.create(
            condition="Condition To Delete",
            diagnosis_date="2025-01-01T00:00:00Z",
            treatment="Treatment",
            user=self.user
        )
        url = reverse('medicalhistory-detail', kwargs={'pk': mh.pk})
        response = self.client.delete(url)
        self.assertEqual(response.status_code, status.HTTP_204_NO_CONTENT)
        self.assertFalse(MedicalHistory.objects.filter(pk=mh.pk).exists())

    # 5. Claims Viewset Tests
    def test_claim_list_empty(self):
        url = reverse('claim-list')
        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data), 0)

    def test_claim_create_without_document(self):
        # Create a policy for the claim
        policy = Policy.objects.create(
            policy_number="POL_CLAIM1",
            coverage_details={"detail": "Test Coverage"},
            exclusions={"exclusion": "None"},
            start_date="2025-01-01T00:00:00Z",
            end_date="2026-01-01T00:00:00Z",
            user=self.user
        )
        url = reverse('claim-list')
        data = {
            "treatment": "Chemotherapy",
            "treatment_date": "2025-02-01T00:00:00Z",
            "cause": "Cancer",
            "status": "pending",
            "policy": policy.pk,
            "treatment_money": "300.00"
        }
        response = self.client.post(url, data, format="json")
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(response.data['status'], "pending")

    def test_claim_create_with_document(self):
        policy = Policy.objects.create(
            policy_number="POL_CLAIM2",
            coverage_details={"detail": "Coverage Doc"},
            exclusions={"exclusion": "None"},
            start_date="2025-01-01T00:00:00Z",
            end_date="2026-01-01T00:00:00Z",
            user=self.user
        )
        url = reverse('claim-list')
        data = {
            "treatment": "Surgery",
            "treatment_date": "2025-02-02T00:00:00Z",
            "cause": "Accident",
            "status": "pending",
            "policy": policy.pk,
            "treatment_money": "500.00",
            "document_url": "https://example.com/doc.jpg",
            "document_type": "Test Doc"
        }
        response = self.client.post(url, data, format="json")
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertTrue('documents' in response.data)
        self.assertEqual(len(response.data['documents']), 1)

    def test_claim_retrieve(self):
        policy = Policy.objects.create(
            policy_number="POL_CLAIM3",
            coverage_details={"detail": "Coverage Retrieve"},
            exclusions={"exclusion": "None"},
            start_date="2025-01-01T00:00:00Z",
            end_date="2026-01-01T00:00:00Z",
            user=self.user
        )
        claim = Claim.objects.create(
            treatment="Treatment",
            treatment_date="2025-02-01T00:00:00Z",
            cause="Illness",
            status="pending",
            policy=policy,
            user=self.user,
            treatment_money="400.00"
        )
        url = reverse('claim-detail', kwargs={'pk': claim.pk})
        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['id'], claim.pk)

    def test_claim_update(self):
        policy = Policy.objects.create(
            policy_number="POL_CLAIM4",
            coverage_details={"detail": "Coverage Update"},
            exclusions={"exclusion": "None"},
            start_date="2025-01-01T00:00:00Z",
            end_date="2026-01-01T00:00:00Z",
            user=self.user
        )
        claim = Claim.objects.create(
            treatment="Old Treatment",
            treatment_date="2025-02-01T00:00:00Z",
            cause="Old Illness",
            status="pending",
            policy=policy,
            user=self.user,
            treatment_money="400.00"
        )
        url = reverse('claim-detail', kwargs={'pk': claim.pk})
        data = {
            "treatment": "Updated Treatment",
            "treatment_date": "2025-02-01T00:00:00Z",
            "cause": "Updated Illness",
            "status": "pending",
            "policy": policy.pk,
            "treatment_money": "450.00"
        }
        response = self.client.put(url, data, format="json")
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        claim.refresh_from_db()
        self.assertEqual(claim.treatment, "Updated Treatment")

    def test_claim_delete(self):
        policy = Policy.objects.create(
            policy_number="POL_CLAIM5",
            coverage_details={"detail": "Coverage Delete"},
            exclusions={"exclusion": "None"},
            start_date="2025-01-01T00:00:00Z",
            end_date="2026-01-01T00:00:00Z",
            user=self.user
        )
        claim = Claim.objects.create(
            treatment="Delete Treatment",
            treatment_date="2025-02-01T00:00:00Z",
            cause="Illness",
            status="pending",
            policy=policy,
            user=self.user,
            treatment_money="350.00"
        )
        url = reverse('claim-detail', kwargs={'pk': claim.pk})
        response = self.client.delete(url)
        self.assertEqual(response.status_code, status.HTTP_204_NO_CONTENT)
        self.assertFalse(Claim.objects.filter(pk=claim.pk).exists())

    # 6. Authentication & Profile Tests
    def test_user_registration(self):
        self.client.logout()
        data = {
            "username": "newuser",
            "password": "StrongPass123!",
            "password2": "StrongPass123!",
            "email": "new@example.com",
            "first_name": "New",
            "last_name": "User"
        }
        response = self.client.post(self.register_url, data, format="json")
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(response.data['username'], "newuser")

    def test_jwt_token_obtain(self):
        self.client.logout()
        data = {"username": "testuser", "password": "testpass"}
        response = self.client.post(self.login_url, data, format="json")
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn("access", response.data)
        self.assertIn("refresh", response.data)

    def test_jwt_token_refresh(self):
        url = reverse('token_refresh')
        data = {"refresh": self.refresh_token}
        response = self.client.post(url, data, format="json")
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn("access", response.data)

    def test_user_profile_get(self):
        response = self.client.get(self.profile_url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['id'], self.user.pk)

    def test_user_profile_update(self):
        data = {
            "username": "updateduser",
            "email": "updated@example.com",
            "first_name": "Updated",
            "last_name": "User"
        }
        response = self.client.put(self.profile_url, data, format="json")
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.user.refresh_from_db()
        self.assertEqual(self.user.username, "updateduser")

    # 7. Claim Detail Custom Endpoint Test
    def test_claim_detail_endpoint(self):
        policy = Policy.objects.create(
            policy_number="POL_DETAIL",
            coverage_details={"detail": "Coverage Detail"},
            exclusions={"exclusion": "None"},
            start_date="2025-01-01T00:00:00Z",
            end_date="2026-01-01T00:00:00Z",
            user=self.user
        )
        claim = Claim.objects.create(
            treatment="Detail Treatment",
            treatment_date="2025-02-01T00:00:00Z",
            cause="Detail Illness",
            status="pending",
            policy=policy,
            user=self.user,
            treatment_money="550.00"
        )
        url = reverse('claim_detail', kwargs={'pk': claim.pk})
        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['id'], claim.pk)