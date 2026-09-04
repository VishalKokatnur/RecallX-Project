"""
FR-01 / FR-02: User registration & login.
Using Django's built-in User model is enough for MVP.
Extend with a Profile model here if you need extra fields later.
"""
from django.contrib.auth.models import User

# Example extension point:
# from django.db import models
#
# class Profile(models.Model):
#     user = models.OneToOneField(User, on_delete=models.CASCADE)
#     created_at = models.DateTimeField(auto_now_add=True)
