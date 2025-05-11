import os
import networkx as nx
import matplotlib
matplotlib.use('Agg')  
import matplotlib.pyplot as plt
from matplotlib.font_manager import FontProperties
from adjustText import adjust_text
from io import BytesIO
import base64
import requests
import pandas as pd
from django.utils.safestring import mark_safe
from django.shortcuts import render, redirect
from django.contrib.auth.forms import UserCreationForm
from django.contrib.auth import login
from django.contrib.auth.decorators import login_required
from django.views.decorators.csrf import csrf_exempt
from .models import ArtistNetwork


class DeezerInfo:
    def __init__(self):
        self.G = nx.Graph()
        self.popularity_list = []

    def get_artist_id(self, name):
        url = f"https://api.deezer.com/search/artist?q={name}"
        res = requests.get(url).json()
        try:
            return res["data"][0]["id"]
        except (KeyError, IndexError):
            return None

    def get_related_artist_info(self, artist_id):
        url = f"https://api.deezer.com/artist/{artist_id}/related"
        res = requests.get(url).json()
        df = pd.DataFrame()

        for artist in res.get("data", [])[:5]:
            tmp = pd.Series({
                "id": artist["id"],
                "nb_fan": artist.get("nb_fan", 0)
            }, name=artist["name"])
            df = pd.concat([df, pd.DataFrame(tmp).T])

        return df

    def add_nodes(self, df, root=False, root_name=None):
        if root and root_name is not None:
            if root_name not in self.G.nodes:
                self.G.add_node(root_name)
                # 中心ノードに適当な人気度（例: 最大値扱い）を追加
                self.popularity_list.append(1000000)

        for name in df.index.tolist():
            if name not in self.G.nodes:
                self.G.add_node(name)
                self.popularity_list.append(df.loc[name, 'nb_fan'])

    def add_edges(self, root, df):
        for name in df.index.tolist():
            self.G.add_edge(root, name)

    def _node_color(self, fan_count):
        if fan_count >= 1000000:
            return 'orangered'
        elif fan_count >= 500000:
            return 'gold'
        elif fan_count >= 100000:
            return 'lime'
        else:
            return 'royalblue'

    def draw_related_map(self, name, level=2):
        artist_id = self.get_artist_id(name)
        if not artist_id:
            return None

        df = self.get_related_artist_info(artist_id)[:5]
        self.add_nodes(df, root=True, root_name=name)
        self.add_edges(name, df)

        if level >= 2:
            for name2 in df.index.tolist():
                tmp_df = self.get_related_artist_info(df.loc[name2, 'id'])[:5]
                self.add_nodes(tmp_df)
                self.add_edges(name2, tmp_df)

        # --- グラフ描画 ---
        plt.figure(figsize=[30, 30])
        pos = nx.spring_layout(self.G, seed=42, k=0.5)

        nx.draw_networkx_nodes(
            self.G, pos,
            node_size=[nx.degree_centrality(self.G)[i]*20000 for i in self.G.nodes],
            node_color=list(map(self._node_color, self.popularity_list)),
            alpha=0.7
        )
        nx.draw_networkx_edges(self.G, pos, alpha=0.3)
        nx.draw_networkx_labels(self.G, pos, font_size=10)

        buffer = BytesIO()
        plt.savefig(buffer, format='png')
        buffer.seek(0)
        image_png = buffer.getvalue()
        buffer.close()
        plt.close()

        base64_image = base64.b64encode(image_png).decode('utf-8')
        
        # 表示用（<img>埋め込み）
        html_display = f'<img src="data:image/png;base64,{base64_image}" alt="Artist Network">'
        
        # ダウンロード用（Base64のみ）
        return html_display, base64_image



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
                context['plot'] = mark_safe(html)         # ←ここで安全に明示
                context['download_img'] = base64_img
            else:
                context['error'] = "アーティストが見つかりませんでした。"

    # 保存時
        elif action == "save" and request.user.is_authenticated:
            base64_img = request.POST.get("base64_img")
            html = f'<img src="data:image/png;base64,{base64_img}" alt="Artist Network">'
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
