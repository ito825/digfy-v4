import requests
import networkx as nx
import matplotlib.pyplot as plt
import pandas as pd
from adjustText import adjust_text
from matplotlib.font_manager import FontProperties

class DeezerInfo:
    def __init__(self):
        self.name = None
        self.id = None
        self.G = nx.Graph()
        self.popularity_list = []

    def get_artist_id(self, name):
        res = requests.get(f"https://api.deezer.com/search/artist?q={name}").json()
        if res["data"]:
            artist = res["data"][0]
            self.name = artist["name"]
            self.id = artist["id"]
            return self.id
        return None

    def get_related_artist_info(self, artist_id):
        url = f"https://api.deezer.com/artist/{artist_id}/related"
        res = requests.get(url).json()
        df = pd.DataFrame()

        for artist in res.get("data", []):
            tmp = pd.Series({
                "id": artist["id"],
                "nb_fan": artist["nb_fan"]
            }, name=artist["name"])
            df = pd.concat([df, pd.DataFrame(tmp).T])

        return df

    def add_nodes(self, df):
        if self.name not in self.G.nodes:
            self.G.add_node(self.name)
            self.popularity_list.append(100000)

        for name in df.index.tolist():
            if name not in self.G.nodes:
                self.G.add_node(name)
                self.popularity_list.append(int(df.loc[name, "nb_fan"]))

    def add_edges(self, source_name, df):
        for name in df.index.tolist():
            if (source_name, name) not in self.G.edges:
                self.G.add_edge(source_name, name)

    def _node_color(self, popularity):
        color_list = ['orangered', 'lightcoral', 'gold', 'lime', 'lightsteelblue', 'royalblue']
        if popularity >= 1000000:
            return color_list[0]
        elif popularity >= 500000:
            return color_list[1]
        elif popularity >= 100000:
            return color_list[2]
        elif popularity >= 50000:
            return color_list[3]
        elif popularity >= 10000:
            return color_list[4]
        else:
            return color_list[5]

    def draw_related_map(self, name, level=2):
        self.popularity_list = []
        artist_id = self.get_artist_id(name)
        df = self.get_related_artist_info(artist_id)[:10]

        self.add_nodes(df)
        self.add_edges(name, df)

        if level >= 2:
            for name2 in df.index.tolist():
                tmp_df = self.get_related_artist_info(df.loc[name2, 'id'])[:10]
                self.add_nodes(tmp_df)
                self.add_edges(name2, tmp_df)

        plt.figure(figsize=[30, 30])
        pos = nx.spring_layout(self.G, seed=1, k=0.5)

        nx.draw_networkx_nodes(self.G, pos, alpha=0.7, node_shape='o', linewidths=1,
                            node_size=[nx.degree_centrality(self.G)[i]*20000 for i in self.G.nodes],
                            node_color=list(map(self._node_color, self.popularity_list)))
        nx.draw_networkx_edges(self.G, pos, alpha=0.3)
        nx.draw_networkx_labels(self.G, pos, font_size=10)  #ノードの上に文字を配置

        plt.axis('off')  # 枠や目盛りを消す
        plt.tight_layout()
        plt.show()


# --- 実行部 ---
if __name__ == "__main__":
    artist_name = input("アーティスト名を入力してください: ")
    deezerinfo = DeezerInfo()
    deezerinfo.draw_related_map(artist_name)
