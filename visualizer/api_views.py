from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from .deezer_logic import DeezerInfo

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
