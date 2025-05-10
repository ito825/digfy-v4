from django.db import models
from django.contrib.auth.models import User

class ArtistNetwork(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    artist_name = models.CharField(max_length=255)
    html_content = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.artist_name} by {self.user.username}"

