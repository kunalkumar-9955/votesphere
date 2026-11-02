"""Seed database with sample data for development."""
import sys
sys.path.insert(0, ".")

from datetime import datetime, timedelta
from app.database import SessionLocal, engine, Base
import app.models  # noqa
from app.models.user import User, UserRole
from app.models.organization import Organization, OrganizationMember, OrgType, OrgStatus
from app.models.election import Election, Candidate, ElectionType, ElectionStatus
from app.core.security import hash_password

Base.metadata.create_all(bind=engine)
db = SessionLocal()

print("Seeding VoteSphere database...")

# Super Admin
admin = User(
    name="Super Admin",
    email="admin@votesphere.com",
    password_hash=hash_password("Admin@123"),
    role=UserRole.SUPER_ADMIN,
    is_verified=True,
    is_active=True,
)
db.add(admin)

# Org Admin
org_admin = User(
    name="Dr. Rajesh Kumar",
    email="rajesh@college.edu",
    password_hash=hash_password("Admin@123"),
    role=UserRole.ORG_ADMIN,
    is_verified=True,
    is_active=True,
)
db.add(org_admin)

# Voters
voters = []
for i in range(1, 6):
    v = User(
        name=f"Student {i}",
        email=f"student{i}@college.edu",
        password_hash=hash_password("Voter@123"),
        role=UserRole.VOTER,
        is_verified=True,
        is_active=True,
    )
    db.add(v)
    voters.append(v)

db.commit()

# Organization
org = Organization(
    name="National Institute of Technology",
    type=OrgType.COLLEGE,
    description="Premier engineering institution",
    invite_code="NIT2024AB",
    owner_id=org_admin.id,
    status=OrgStatus.APPROVED,
)
db.add(org)
db.commit()

# Members
for v in voters:
    db.add(OrganizationMember(organization_id=org.id, user_id=v.id, role="member"))
db.add(OrganizationMember(organization_id=org.id, user_id=org_admin.id, role="admin"))
db.commit()

# Election
now = datetime.utcnow()
election = Election(
    title="Student Council President Election 2024",
    description="Annual election for Student Council President",
    type=ElectionType.COLLEGE,
    organization_id=org.id,
    created_by=org_admin.id,
    start_time=now - timedelta(hours=2),
    end_time=now + timedelta(hours=22),
    status=ElectionStatus.ACTIVE,
    total_eligible_voters=5,
    is_anonymous=False,
)
db.add(election)
db.commit()

# Candidates
candidates_data = [
    {"name": "Arjun Sharma", "party": "Progressive Students Front", "position": "President", "bio": "3rd year CSE student with strong leadership skills."},
    {"name": "Priya Patel", "party": "United Students Alliance", "position": "President", "bio": "2nd year ECE student, passionate about campus development."},
    {"name": "Rahul Singh", "party": "Independent", "position": "President", "bio": "Final year student focused on academic excellence."},
]
for cd in candidates_data:
    db.add(Candidate(election_id=election.id, **cd))
db.commit()

# Polling election
poll = Election(
    title="Best Canteen Food Poll",
    description="Vote for your favorite canteen item",
    type=ElectionType.POLLING,
    organization_id=org.id,
    created_by=org_admin.id,
    start_time=now,
    end_time=now + timedelta(days=3),
    status=ElectionStatus.ACTIVE,
    allow_multiple_choice=False,
    total_eligible_voters=5,
)
db.add(poll)
db.commit()

for item in ["Masala Dosa", "Veg Biryani", "Paneer Wrap", "Cold Coffee"]:
    db.add(Candidate(election_id=poll.id, name=item, position="Option"))
db.commit()

print("✅ Seed complete!")
print("\nLogin credentials:")
print("  Super Admin: admin@votesphere.com / Admin@123")
print("  Org Admin:   rajesh@college.edu / Admin@123")
print("  Voter:       student1@college.edu / Voter@123")

db.close()
