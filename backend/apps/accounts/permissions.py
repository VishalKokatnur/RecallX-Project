from rest_framework import permissions


class IsOwner(permissions.BasePermission):
    """
    Security requirement (PRD section 24):
    'User A must never access User B's files.'
    """
    def has_object_permission(self, request, view, obj):
        return obj.user_id == request.user.id
