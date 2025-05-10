# visualizer/urls.py

from django.urls import path
from . import views

urlpatterns = [
    path('', views.index, name='index'),                       # トップページ（検索＆描画）
    path('signup/', views.signup, name='signup'),              # サインアップ
    path('my-networks/', views.my_networks, name='my_networks'),# 保存済みネットワーク一覧
    

]
