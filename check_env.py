# import modules
import os
import django
# settingsモジュールを指定（プロジェクトのsettings.pyがある場所）
os.environ.setdefault("DJANGO_SETTINGS_MODULE", "digfy_project.settings")

# Djangoを初期化
django.setup()

from turtle import pd
import spotipy
from spotipy.oauth2 import SpotifyClientCredentials
import os
import spotipy
import networkx as nx
import plotly.graph_objects as go
import plotly.io as pio
from spotipy.oauth2 import SpotifyOAuth
from spotipy.oauth2 import SpotifyClientCredentials
from django.shortcuts import render, redirect
from django.contrib.auth.forms import UserCreationForm
from django.contrib.auth import login
from django.contrib.auth.decorators import login_required
import matplotlib.pyplot as plt
import pandas as pd

from django.http import HttpResponse


client_id = '1dbbec1604ae4a028a02317f40922214' # App作成時のClient ID
client_secret = '98be4aa02d8e46c5af49c8a652ff15b4' # App作成時のClient Secret
client_credentials_manager = spotipy.oauth2.SpotifyClientCredentials(client_id, client_secret)
spotify = spotipy.Spotify(client_credentials_manager=client_credentials_manager)

class SpotifyInfo:
    
    def __init__(self):
        self.name = None
        self.popularity = None
        self.uri = None
        self.G = nx.Graph()
        self.vias = 1
        self.popularity_list = []
        
    def get_artist_uri(self, name):
        '''
        アーティスト名からuriを返す
        '''
        artist = spotify.search(q='artist:' + name, type='artist')['artists']['items'][0]
        self.name = artist['name']
        self.popularity = artist['popularity']
        self.uri = artist['uri']
        
        return self.uri
    
    def get_related_artist_info(self, uri):
        '''
        関係アーティストの情報をDataFrameで返す
        
        '''
        df = pd.DataFrame()
        for artist in spotify.artist_related_artists(uri)['artists']:

            tmp = pd.Series([], name=artist['name'])
            for key in ['popularity', 'uri']:
                tmp[key] = artist[key]

            df = pd.concat([df, pd.DataFrame(tmp).T])
            
        return df
            
    def add_nodes(self, df):
        
        if self.name not in self.G.nodes:
            self.G.add_node(self.name)
            self.popularity_list.append(self.popularity * self.vias)
        
        for name in df.index.tolist():
            if name not in self.G.nodes:
                self.G.add_node(name)
                self.popularity_list.append(df.loc[name, 'popularity'] * self.vias)
            
    def add_edges(self, target_name, df):
        for name in df.index.tolist():
            if (target_name, name) not in self.G.edges:
                self.G.add_edge(target_name, name)

    def _node_color(self, popularity):
        color_list = ['orangered', 'lightcoral', 'gold', 'lime', 'lightsteelblue', 'royalblue']
        
        if popularity >= 70:
            return color_list[0]
        elif popularity >= 60:
            return color_list[1]
        elif popularity >=50:
            return color_list[2]
        elif popularity >= 40:
            return color_list[3]
        elif popularity >= 30:
            return color_list[4]
        else:
            return color_list[5]
            
    def draw_related_map(self, name, level=2):
        uri = self.get_artist_uri(name)
        df = self.get_related_artist_info(uri)
        
        # add info to draw relation graph
        self.add_nodes(df)
        self.add_edges(self.name, df)
        
        
        for name in df.index.tolist():
            tmp_df = self.get_related_artist_info(df.loc[name, 'uri'])
            
            # add info to draw relation graph
            self.add_nodes(tmp_df)
            self.add_edges(name, tmp_df)

        plt.figure(figsize=[30, 30])
        pos = nx.spring_layout(self.G, seed=1, k=0.2)
        nx.draw_networkx_labels(self.G, pos, font_color='k', font_family='IPAexGothic')
        nx.draw_networkx_nodes(self.G, pos, alpha=0.7, node_shape='o', linewidths=1, 
                               node_size=[nx.degree_centrality(self.G)[i]*20000 for i in self.G.nodes],
                               node_color=list(map(self._node_color, self.popularity_list)))
        nx.draw_networkx_edges(self.G, pos, alpha=0.3)


spotifiinfo = SpotifyInfo()  # インスタンス化
spotifiinfo.draw_related_map('Weezer')  # SPITZのネットワーク取得
plt.show()  # ネットワーク図を描画