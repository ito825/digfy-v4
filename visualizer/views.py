from django.shortcuts import render, redirect
from django.contrib.auth.forms import UserCreationForm
from django.contrib.auth import login
from django.contrib.auth.decorators import login_required
from django.utils.safestring import mark_safe
from .models import ArtistNetwork
from .deezer_logic import DeezerInfo  

# --- トップページ ---
def index(request):
    context = {}
    if request.method == "POST":
        action = request.POST.get("action")
        artist_name = request.POST.get("artist")
        context['current_artist'] = artist_name

        if action == "search":
            deezer = DeezerInfo()
            html, base64_img = deezer.draw_related_map(artist_name)
            if html:
                context['plot'] = mark_safe(html)
                context['download_img'] = base64_img
            else:
                context['error'] = "アーティストが見つかりませんでした。"

        elif action == "save" and request.user.is_authenticated:
            html = request.POST.get("html_content")
            ArtistNetwork.objects.create(user=request.user, artist_name=artist_name, html_content=html)
            context['message'] = "保存しました。"

    return render(request, 'visualizer/index.html', context)

# --- サインアップ ---
def signup(request):
    if request.method == 'POST':
        form = UserCreationForm(request.POST)
        if form.is_valid():
            user = form.save()
            login(request, user)
            return redirect('index')
    else:
        form = UserCreationForm()
    return render(request, 'registration/signup.html', {'form': form})

# --- 保存済みネットワーク一覧 ---
@login_required
def my_networks(request):
    items = ArtistNetwork.objects.filter(user=request.user).order_by('-created_at')
    return render(request, 'visualizer/my_networks.html', {'networks': items})

import requests
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from django.utils.decorators import method_decorator

@csrf_exempt
def deezer_proxy(request):
    artist_name = request.GET.get("q")
    if not artist_name:
        return JsonResponse({"error": "Missing 'q' parameter"}, status=400)

    try:
        deezer_url = f"https://api.deezer.com/search/artist?q={artist_name}"
        res = requests.get(deezer_url)
        return JsonResponse(res.json(), safe=False)
    except Exception as e:
        return JsonResponse({"error": str(e)}, status=500)

@csrf_exempt
def deezer_artist_top(request):
    artist_id = request.GET.get("id")
    if not artist_id:
        return JsonResponse({"error": "Missing 'id' parameter"}, status=400)

    try:
        deezer_url = f"https://api.deezer.com/artist/{artist_id}/top?limit=1"
        res = requests.get(deezer_url)
        return JsonResponse(res.json(), safe=False)
    except Exception as e:
        return JsonResponse({"error": str(e)}, status=500)
