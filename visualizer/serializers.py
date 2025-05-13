from rest_framework import serializers
from .models import ArtistNetwork
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer

class ArtistNetworkSerializer(serializers.ModelSerializer):
    class Meta:
        model = ArtistNetwork
        fields = ['artist_name', 'html_content', 'created_at']

class MyTokenObtainPairSerializer(TokenObtainPairSerializer):
    @classmethod
    def get_token(cls, user):
        token = super().get_token(user)

        token['username'] = user.username

        return token
