# visualizer/urls.py

from django.urls import path
from . import views
from django.contrib.auth import views as auth_views
from .api_views import RelatedArtistsAPIView
from rest_framework_simplejwt.views import (
    TokenObtainPairView,
    TokenRefreshView,
)
from .api_views import SignupAPIView
from .api_views import MyNetworksAPIView
from .views_jwt import MyTokenObtainPairView
from .api_views import SaveNetworkAPIView
from .api_views import RelatedGraphJSONAPIView

urlpatterns = [
    path('', views.index, name='index'),                       # トップページ（検索＆描画）
    path("api/signup/", SignupAPIView.as_view(), name="api_signup"), # サインアップページ
    path('api/my-networks/', MyNetworksAPIView.as_view(), name='my_networks_api'),# 保存済みネットワーク一覧
    path('logout/', auth_views.LogoutView.as_view(), name='logout'),#ログアウト
    path('api/related-artists/', RelatedArtistsAPIView.as_view(), name='related_artists_api'),# APIルーティング
    path('api/token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    path('api/token/', MyTokenObtainPairView.as_view(), name='token_obtain_pair'),
    path("api/save-network/", SaveNetworkAPIView.as_view(), name="save_network"),
    path("api/graph-json/", RelatedGraphJSONAPIView.as_view(), name="graph_json"),
    path('api/deezer/', views.deezer_proxy),
    path('api/deezer/top/', views.deezer_artist_top),
]
