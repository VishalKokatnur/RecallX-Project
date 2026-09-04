from rest_framework import serializers


class SearchRequestSerializer(serializers.Serializer):
    query = serializers.CharField()
    file_type = serializers.CharField(required=False, allow_null=True)
    date_filter = serializers.CharField(required=False, allow_null=True)


class SearchResultSerializer(serializers.Serializer):
    file_id = serializers.IntegerField()
    file_name = serializers.CharField()
    file_type = serializers.CharField()
    similarity_score = serializers.FloatField()
    matched_text = serializers.CharField()
    upload_date = serializers.DateTimeField()
