import random
from datetime import datetime, timedelta
import uuid
from django.core.management.base import BaseCommand
from django.contrib.auth.models import User
from api.models import Policy

class Command(BaseCommand):
    help = 'Seeds random health policies for existing users'

    def handle(self, *args, **options):
        users = User.objects.all()
        
        if not users:
            self.stdout.write(self.style.ERROR('No users found. Create users first before running this command.'))
            return
        
        # Delete all existing policies
        Policy.objects.all().delete()
        
        policy_types = [
            'Health Insurance',
            'Dental Insurance',
            'Vision Insurance',
            'Critical Illness',
            'Accident Insurance',
            'Hospital Indemnity',
            'Disability Insurance',
            'Long-term Care'
        ]
        
        coverage_options = {
            'Health Insurance': {
                'Primary Care': '$25 copay',
                'Specialist': '$40 copay',
                'Emergency Room': '$250 copay',
                'Hospital Stay': '$500 deductible, then 20% coinsurance',
                'Prescription Drugs': 'Tier 1: $10, Tier 2: $25, Tier 3: $50',
                'Annual Deductible': '$1,000 individual / $2,000 family',
                'Out-of-Pocket Maximum': '$5,000 individual / $10,000 family'
            },
            'Dental Insurance': {
                'Preventive Care': '100% covered',
                'Basic Procedures': '80% covered after deductible',
                'Major Procedures': '50% covered after deductible',
                'Orthodontia': '50% covered up to $1,500 lifetime maximum',
                'Annual Deductible': '$50 individual / $150 family',
                'Annual Maximum': '$1,500 per person'
            },
            'Vision Insurance': {
                'Eye Exam': '$10 copay once per year',
                'Frames': '$150 allowance every 24 months',
                'Lenses': '$25 copay for standard lenses',
                'Contact Lenses': '$150 allowance per year in lieu of glasses',
                'Laser Vision Correction': '15% discount'
            },
            'Critical Illness': {
                'Heart Attack': '$10,000 lump sum',
                'Stroke': '$10,000 lump sum',
                'Cancer': '$10,000 lump sum',
                'Kidney Failure': '$10,000 lump sum',
                'Organ Transplant': '$10,000 lump sum'
            },
            'Accident Insurance': {
                'Emergency Room Visit': '$150 benefit',
                'Hospital Admission': '$1,000 benefit',
                'Hospital Confinement': '$200 per day benefit',
                'Fractures': 'Up to $5,000 depending on type',
                'Dislocations': 'Up to $4,000 depending on type',
                'Accidental Death': '$50,000 benefit'
            },
            'Hospital Indemnity': {
                'Hospital Admission': '$1,000 per admission',
                'Hospital Confinement': '$200 per day',
                'ICU Admission': '$1,500 per admission',
                'ICU Confinement': '$300 per day'
            },
            'Disability Insurance': {
                'Short-term Disability': '60% of weekly income up to $1,000 per week',
                'Elimination Period': '7 days',
                'Benefit Duration': 'Up to 26 weeks'
            },
            'Long-term Care': {
                'Nursing Home Care': '$150 daily benefit',
                'Assisted Living Facility': '$150 daily benefit',
                'Home Health Care': '$75 daily benefit',
                'Elimination Period': '90 days',
                'Benefit Duration': '3 years'
            }
        }
        
        exclusions_options = {
            'Health Insurance': [
                'Pre-existing conditions (for first 12 months)',
                'Cosmetic surgery',
                'Experimental treatments',
                'Non-emergency services outside network',
                'Self-inflicted injuries'
            ],
            'Dental Insurance': [
                'Cosmetic procedures',
                'Treatment started before coverage began',
                'Replacement of lost or stolen appliances',
                'Procedures primarily for aesthetics'
            ],
            'Vision Insurance': [
                'LASIK enhancements/touch-ups',
                'Non-prescription sunglasses',
                'Medical treatment of eye disease (covered under health insurance)',
                'Additional pairs beyond allowance'
            ],
            'Critical Illness': [
                'Conditions diagnosed during waiting period',
                'Non-invasive cancers',
                'Self-inflicted injuries',
                'Pre-existing conditions (for first 12 months)'
            ],
            'Accident Insurance': [
                'Illness or disease',
                'Self-inflicted injuries',
                'Injuries from high-risk activities',
                'Injuries while intoxicated'
            ],
            'Hospital Indemnity': [
                'Mental/nervous disorders',
                'Substance abuse treatment',
                'Pre-existing conditions (for first 12 months)',
                'Pregnancy (if conception occurred before coverage)'
            ],
            'Disability Insurance': [
                'Pre-existing conditions (for first 12 months)',
                'Self-inflicted injuries',
                'Injuries from commission of a felony',
                'Disabilities during unemployment'
            ],
            'Long-term Care': [
                'Mental/nervous disorders without demonstrable organic disease',
                'Alcohol or drug addiction',
                'Self-inflicted injuries',
                'Care provided by family members'
            ]
        }
        
        self.stdout.write(self.style.SUCCESS('Creating random health policies...'))
        
        total_policies = 0
        
        for user in users:
            # Create 1-3 policies per user
            num_policies = random.randint(1, 3)
            
            for _ in range(num_policies):
                # Choose random policy type
                policy_type = random.choice(policy_types)
                
                # Generate policy number
                policy_number = f"POL-{uuid.uuid4().hex[:8].upper()}"
                
                # Set random dates
                start_date = datetime.now() - timedelta(days=random.randint(30, 365))
                end_date = start_date + timedelta(days=365)
                
                # Create coverage details and exclusions
                coverage_details = {}
                if policy_type in coverage_options:
                    coverage_items = coverage_options[policy_type]
                    # Select a random subset of coverage items
                    num_items = random.randint(max(1, len(coverage_items) - 2), len(coverage_items))
                    selected_items = random.sample(list(coverage_items.items()), num_items)
                    coverage_details = dict(selected_items)
                
                exclusions = []
                if policy_type in exclusions_options:
                    all_exclusions = exclusions_options[policy_type]
                    # Select a random subset of exclusions
                    num_exclusions = random.randint(1, len(all_exclusions))
                    exclusions = random.sample(all_exclusions, num_exclusions)
                
                # Create the policy
                policy = Policy.objects.create(
                    policy_number=policy_number,
                    coverage_details={policy_type: coverage_details},
                    exclusions={policy_type: exclusions},
                    start_date=start_date,
                    end_date=end_date,
                    user=user
                )
                
                total_policies += 1
                
                self.stdout.write(f"Created {policy_type} policy {policy_number} for {user.username}")
        
        self.stdout.write(self.style.SUCCESS(f'Successfully created {total_policies} health policies for {len(users)} users!'))
