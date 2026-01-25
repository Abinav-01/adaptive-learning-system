from flask import Flask, render_template, jsonify

app = Flask(__name__)

@app.route("/")
def index():
    return render_template("index.html")


@app.route("/health")
def health():
    # Simple health endpoint useful for quick container/host checks
    return jsonify({"status": "ok"}), 200

if __name__ == "__main__":
    # Bind to 0.0.0.0 so the server is reachable from outside the container
    app.run(host="0.0.0.0", port=5000, debug=True)
