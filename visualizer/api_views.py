from django.contrib.auth.models import User
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import IsAuthenticated
from .deezer_logic import DeezerInfo
from .models import ArtistNetwork
from .serializers import ArtistNetworkSerializer

class RelatedArtistsAPIView(APIView):
    def post(self, request):
        artist_name = request.data.get('artist')
        level = int(request.data.get('level', 2))

        if not artist_name:
            return Response({'error': 'Artist name is required.'}, status=status.HTTP_400_BAD_REQUEST)

        deezer = DeezerInfo()
        html, img = deezer.draw_related_map(artist_name, level=level)
        if not html:
            return Response({'error': 'Artist not found.'}, status=status.HTTP_404_NOT_FOUND)

        return Response({'html': html, 'img': img})

class SignupAPIView(APIView):
    def post(self, request):
        username = request.data.get("username")
        password = request.data.get("password")

        if not username or not password:
            return Response({"error": "Missing credentials"}, status=status.HTTP_400_BAD_REQUEST)

        if User.objects.filter(username=username).exists():
            return Response({"error": "Username already exists"}, status=status.HTTP_400_BAD_REQUEST)

        user = User.objects.create_user(username=username, password=password)
        return Response({"message": "User created"}, status=status.HTTP_201_CREATED)

class MyNetworksAPIView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        items = ArtistNetwork.objects.filter(user=request.user).order_by('-created_at')
        serializer = ArtistNetworkSerializer(items, many=True)
        return Response(serializer.data)