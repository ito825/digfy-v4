# visualizer/urls.py

from django.urls import path
from . import views
from django.contrib.auth import views as auth_views

urlpatterns = [
    path('', views.index, name='index'),                       # トップページ（検索＆描画）
    path('signup/', views.signup, name='signup'),              # サインアップ
    path('my-networks/', views.my_networks, name='my_networks'),# 保存済みネットワーク一覧
    path('logout/', auth_views.LogoutView.as_view(), name='logout'),#ログアウト

]
