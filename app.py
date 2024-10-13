from flask import Flask, render_template, request, jsonify
from sklearn.datasets import fetch_20newsgroups
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.decomposition import TruncatedSVD
from sklearn.metrics.pairwise import cosine_similarity
import numpy as np
import nltk
from nltk.corpus import stopwords

nltk.download('stopwords')
stop_words = stopwords.words('english')

app = Flask(__name__)

newsgroups = fetch_20newsgroups(subset='all')
data = newsgroups.data

vectorizer = TfidfVectorizer(stop_words=stop_words)
vector_fit = vectorizer.fit_transform(data)
svd_model = TruncatedSVD(n_components=100)
svd_matrix = svd_model.fit_transform(vector_fit)


def search_engine(query):
    """
    Function to search for top 5 similar documents given a query
    Input: query (str)
    Output: documents (list), similarities (list), indices (list)
    """
    query_fit = vectorizer.transform([query])
    query_lsa = svd_model.transform(query_fit)

    similarities = cosine_similarity(query_lsa, svd_matrix).flatten()

    top_indices = np.argsort(similarities)[::-1][:5]

    documents = [data[i] for i in top_indices]
    top_similarities = similarities[top_indices]

    return documents, top_similarities.tolist(), top_indices.tolist()


@app.route('/')
def index():
    return render_template('index.html')

@app.route('/search', methods=['POST'])
def search():
    query = request.form['query']
    documents, similarities, indices = search_engine(query)
    return jsonify({'documents': documents, 'similarities': similarities, 'indices': indices}) 

if __name__ == '__main__':
    app.run(debug=True)
